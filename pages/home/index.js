import { useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";

import getAccessToken from "@/functions/getAccessToken";
import styles from "@/styles/Home.module.css";
import Playlist from "@/components/playlist";
import Filter from "@/components/filter";
import Sorter from "@/components/sorter";

const themes = ["blue", "pink", "lime"];

const sortKeys = {
  Author: (a, b) => {
    const A = a.owner.display_name.toLowerCase();
    const B = b.owner.display_name.toLowerCase();

    if (A > B) return 1;
    if (A < B) return -1;

    return sortKeys.Name(a, b);
  },
  Name: (a, b) => {
    const A = a.name.toLowerCase();
    const B = b.name.toLowerCase();

    if (A > B) return 1;
    if (A < B) return -1;

    return 0;
  },
  Size: (a, b) => {
    const A = a.tracks.total;
    const B = b.tracks.total;

    return B - A;
  },
};

async function loadPlaylists({ next, items }, temp) {
  temp = [...temp, ...items];

  if (next) {
    const response = await fetch(next, {
      headers: {
        Authorization: "Bearer " + localStorage.accessToken,
      },
    });
    const body = await response.json();
    return await loadPlaylists(body, temp);
  } else {
    return temp;
  }
}

export default function Home() {
  const [playlists, setPlaylists] = useState([]);

  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState();
  const [reversed, setReversed] = useState();

  const filteredPlaylists = useMemo(
    () =>
      playlists.filter(
        (playlist) =>
          playlist.name.toLowerCase().includes(filter.toLowerCase()) ||
          playlist.owner.display_name
            .toLowerCase()
            .includes(filter.toLowerCase())
      ),
    [playlists, filter]
  );

  const sortedPlaylists = useMemo(
    () =>
      [...filteredPlaylists].sort((a, b) =>
        reversed ? sortKeys[sortKey](b, a) : sortKeys[sortKey](a, b)
      ),
    [filteredPlaylists, sortKey, reversed]
  );

  const [vertical, setVertical] = useState();
  const [theme, setTheme] = useState();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const menu = useRef();
  const router = useRouter();

  useEffect(() => {
    if (
      [
        "accessToken",
        "refreshToken",
        "saved",
        "liked",
        "loaded",
        "sortPlaylistsKey",
        "reversedPlaylists",
        "sortTracksKey",
        "reversedTracks",
      ].some((value) => localStorage[value] === undefined)
    ) {
      const theme = localStorage.theme;
      localStorage.clear();
      localStorage.theme = theme;
      router.replace("/");
    } else {
      if (themes.some((t) => t === localStorage.theme)) {
        setTheme(localStorage.theme);
      } else {
        setTheme("blue");
      }

      setVertical(innerHeight > innerWidth);

      onresize = () => {
        setVertical(innerHeight > innerWidth);
      };

      setPlaylists([
        ...Object.values(JSON.parse(localStorage.saved)),
        ...Object.values(JSON.parse(localStorage.liked)),
      ]);

      setSortKey(localStorage.sortPlaylistsKey);
      setReversed(JSON.parse(localStorage.reversedPlaylists));

      getAccessToken((accessToken) => {
        fetch("https://api.spotify.com/v1/me/playlists", {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        })
          .then((response) => response.json())
          .then((body) => {
            if (body.error) {
              console.error(body.error_description);
            } else {
              loadPlaylists(body, []).then((playlists) => {
                setPlaylists([
                  ...playlists,
                  ...Object.values(JSON.parse(localStorage.liked)),
                ]);

                const saved = {};
                playlists.forEach((playlist) => {
                  saved[playlist.id] = playlist;
                });
                localStorage.saved = JSON.stringify(saved);
              });
            }
          });
      });
    }
  }, [router]);

  useEffect(() => {
    menu.current.style.height = open ? "60px" : "0px";
  }, [open]);

  useEffect(() => {
    if (theme) localStorage.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (sortKey !== undefined) localStorage.sortPlaylistsKey = sortKey;
  }, [sortKey]);

  useEffect(() => {
    if (reversed !== undefined)
      localStorage.reversedPlaylists = JSON.stringify(reversed);
  }, [reversed]);

  return (
    <>
      <Head>
        <title>Página Inicial - Spotify Helper 2.0</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {error && (
        <div className={"modal " + (theme || "loading")}>
          <div className="message">
            {error}
            <div
              className="button"
              onClick={() => {
                setError("");
              }}
            >
              <Image src="/close.svg" alt="close" width={25} height={25} />
            </div>
          </div>
        </div>
      )}
      <div
        className={["container ", theme || "loading", error && "error"].join(
          " "
        )}
      >
        <div className="header">
          <div className="left">
            <div
              className="button"
              onClick={() => {
                const theme = localStorage.theme;
                localStorage.clear();
                localStorage.theme = theme;
                router.replace("/");
              }}
            >
              <Image src="/logout.svg" alt="logout" width={25} height={25} />
            </div>
          </div>
          <div className="center">
            <Image
              src="/favicon.ico"
              alt="favicon"
              width={50}
              height={50}
              className="logo"
            />
            <div className="title">
              <div>Spotify</div>
              <div>Helper</div>
            </div>
          </div>
          <div className="right">
            <div className="button" onClick={() => setOpen((prev) => !prev)}>
              <Image
                src="/ellipsis.svg"
                alt="ellipsis"
                width={25}
                height={25}
              />
            </div>
          </div>
          <div className="menu" ref={menu}>
            {themes
              .filter((t) => t !== theme)
              .map((theme) => (
                <div
                  className={"circle " + theme}
                  key={theme}
                  onClick={() => {
                    setTheme(theme);
                  }}
                ></div>
              ))}
          </div>
        </div>
        <div className={"subheader" + (vertical ? " vertical" : "")}>
          <Sorter
            sortKeys={sortKeys}
            sortKey={sortKey}
            setSortKey={setSortKey}
            reversed={reversed}
            setReversed={setReversed}
          />
          <Filter filter={filter} setFilter={setFilter} />
        </div>
        <div className={styles.body}>
          {sortedPlaylists.map((playlist) => (
            <Playlist
              playlist={playlist}
              key={playlist.id}
              setError={setError}
              vertical={vertical}
            />
          ))}
        </div>
      </div>
    </>
  );
}
