import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";
import Head from "next/head";

import styles from "@/styles/Home.module.css";

import getAccessToken from "@/functions/getAccessToken";

import PlaylistIcon from "@/components/playlistIcon";
import ButtonSvg from "@/components/buttonSvg";
import Filter from "@/components/filter";
import Header from "@/components/header";
import Sorter from "@/components/sorter";
import Modal from "@/components/modal";

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

export default function HomePage() {
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

  const [message, setMessage] = useState("");

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
                    images: [images[0] ? { url: images[0].url } : undefined],
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
    if (theme) localStorage.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (sortKey !== undefined) localStorage.sortPlaylistsKey = sortKey;
  }, [sortKey]);

  useEffect(() => {
    if (reversed !== undefined)
      localStorage.reversedPlaylists = JSON.stringify(reversed);
  }, [reversed]);

  function clearError() {
    setMessage("");
  }

  function logout() {
    const theme = localStorage.theme;
    localStorage.clear();
    localStorage.theme = theme;
    router.replace("/");
  }

  function reverse() {
    setReversed((prev) => !prev);
  }

  function clearFilter() {
    setFilter("");
  }

  function share(e) {
    navigator.clipboard.writeText(location.origin + "/user/" + userId);
    e.target.blur();
    setMessage("Adicionado a área de transferência");
  }

  return (
    <>
      <Head>
        <title>Página Inicial - Spotify Helper</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {message && <Modal {...{ theme, message, clearError }} />}
      <div
        className={[
          "container ",
          theme || "loading",
          message && "modalOpen",
        ].join(" ")}
      >
        <Header home exit={logout} {...{ theme, setTheme }} />
        <div className="subheader">
          <Sorter
            tabIndex={7}
            {...{
              sortKey,
              reverse,
              reversed,
              sortKeys,
              setSortKey,
            }}
          />
          <Filter
            tabIndex={9 + Object.keys(sortKeys).length}
            {...{
              filter,
              setFilter,
              clearFilter,
            }}
          />
          <div
            tabIndex={`${11 + Object.keys(sortKeys).length}`}
            className="subheaderButton"
            onClick={share}
            onKeyUp={(e) => {
              if (e.code === "Enter") {
                share(e);
              }
            }}
          >
            <ButtonSvg name="share" size={15} />
          </div>
        </div>
        <div className="body">
          <div className={styles.playlists}>
            {sortedPlaylists.map((playlist, index) => (
              <PlaylistIcon
                tabIndex={12 + Object.keys(sortKeys).length + index * 2}
                playlist={playlist}
                key={playlist.id}
                setMessage={setMessage}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
