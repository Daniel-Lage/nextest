import { useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";

import getAccessToken from "@/functions/getAccessToken";
import styles from "@/styles/Home.module.css";
import Playlist from "@/components/playlist";

const themes = ["blue", "pink", "lime", "mono"];

const sortKeys = {
  Criador: (a, b) => {
    const A = a.owner.display_name.toLowerCase();
    const B = b.owner.display_name.toLowerCase();

    if (A > B) return 1;
    if (A < B) return -1;

    return sortKeys.Nome(a, b);
  },
  Nome: (a, b) => {
    const A = a.name.toLowerCase();
    const B = b.name.toLowerCase();

    if (A > B) return 1;
    if (A < B) return -1;

    return 0;
  },
  Tamanho: (a, b) => {
    const A = a.tracks.total;
    const B = b.tracks.total;

    return B - A;
  },
};

async function loadPlaylists(playlists, temp) {
  temp = [...temp, ...playlists.items];

  if (playlists.next) {
    const url = new URL(playlists.next);
    const baseURL = url.origin + url.pathname;
    const requests = [];

    for (let offset = 50; offset < playlists.total; offset += 50) {
      requests.push(
        fetch(baseURL + "?limit=50&offset=" + offset, {
          headers: {
            Authorization: "Bearer " + localStorage.accessToken,
          },
        })
      );
    }

    const responses = await Promise.all(requests);

    const bodies = await Promise.all(
      responses.map((response) => response.json())
    );

    bodies.forEach((body) => {
      temp = [...temp, ...body.items];
    });
  }

  return temp;
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

  const [theme, setTheme] = useState();
  const [userId, setUserId] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [sorterOpen, setSorterOpen] = useState(false);
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
        "userId",
      ].some((value) => localStorage[value] === undefined)
    ) {
      const theme = localStorage.theme;
      localStorage.clear();
      localStorage.theme = theme;
      router.replace("/");
    } else {
      onclick = (e) => {
        if (
          e.target.className !== "" &&
          e.target.className !== "menuButton" &&
          e.target.className !== "menu" &&
          !e.target.className
            .split(" ")
            .some((className) => className === "circle")
        )
          setMenuOpen(false);

        if (
          e.target.className !== "sorterOpener open" &&
          e.target.className !== "sorterMenu open" &&
          e.target.className !== "sorterMenuItem"
        )
          setSorterOpen(false);
      };

      if (themes.some((t) => t === localStorage.theme)) {
        setTheme(localStorage.theme);
      } else {
        setTheme("blue");
      }

      setPlaylists([
        ...Object.values(JSON.parse(localStorage.saved)),
        ...Object.values(JSON.parse(localStorage.liked)),
      ]);

      if (sortKeys[localStorage.sortPlaylistsKey]) {
        setSortKey(localStorage.sortPlaylistsKey);
      } else {
        setSortKey("Nome");
      }

      setReversed(JSON.parse(localStorage.reversedPlaylists));

      setUserId(localStorage.userId);

      getAccessToken((accessToken) => {
        fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        })
          .then((response) => response.json())
          .then((body) => {
            setUserId(body.id);
            localStorage.userId = body.id;
          });

        fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        })
          .then((response) => response.json())
          .then((body) => {
            if (body.error) {
              console.error(body.error.message);
            } else {
              loadPlaylists(body, []).then((playlists) => {
                playlists = playlists.map(
                  ({
                    name,
                    description,
                    id,
                    tracks: { total },
                    owner: { display_name },
                    images,
                  }) => ({
                    name,
                    description,
                    id,
                    tracks: { total },
                    owner: { display_name },
                    images: [{ url: images[0].url }],
                  })
                );
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
    menu.current.style.height = menuOpen ? "60px" : "0px";
  }, [menuOpen]);

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
            <div
              className="menuButton"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
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
        <div className="body">
          <div className="subheader">
            <div className="sorter">
              <div
                className={"sorterOpener" + (sorterOpen ? " open" : "")}
                onClick={() => setSorterOpen((prev) => !prev)}
              >
                {sortKey}
              </div>
              <div
                className="sorterReverser"
                onClick={() => setReversed((prev) => !prev)}
              >
                {reversed ? (
                  <Image src="/down.svg" alt="down" width={15} height={15} />
                ) : (
                  <Image src="/up.svg" alt="up" width={15} height={15} />
                )}
              </div>

              <div className={"sorterMenu" + (sorterOpen ? " open" : "")}>
                {Object.keys(sortKeys)
                  .filter((value) => value !== sortKey)
                  .map((value) => (
                    <div
                      key={value}
                      className="sorterMenuItem"
                      onClick={() => setSortKey(value)}
                    >
                      {value}
                    </div>
                  ))}
              </div>
            </div>
            <div className="filter">
              <input
                className="textInput"
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={"Search"}
                onKeyDown={(e) => e.key === "Escape" && setFilter("")}
              />
              {filter && (
                <div
                  className="filterButton"
                  onClick={() => {
                    setFilter("");
                  }}
                >
                  <Image src="/close.svg" alt="close" width={15} height={15} />
                </div>
              )}
            </div>
            <div
              className="button"
              onClick={() => {
                navigator.clipboard.writeText(
                  location.origin + "/user/" + userId
                );
                setError("Adicionado a área de transferência");
              }}
            >
              <Image src={"/share.svg"} alt="heart" width={25} height={25} />
            </div>
          </div>
          <div className={styles.playlists}>
            {sortedPlaylists.map((playlist) => (
              <Playlist
                playlist={playlist}
                key={playlist.id}
                setError={setError}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
