import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";
import Head from "next/head";

import styles from "@/styles/User.module.css";

import getAccessToken from "@/functions/getAccessToken";

import PlaylistIcon from "@/components/playlistIcon";
import ButtonSvg from "@/components/buttonSvg";
import Filter from "@/components/filter";
import Header from "@/components/header";
import Sorter from "@/components/sorter";
import Modal from "@/components/modal";
import User from "@/components/user";

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

export default function UserPage() {
  const [user, setUser] = useState();
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
      if (sortKeys[localStorage.sortPlaylistsKey]) {
        setSortKey(localStorage.sortPlaylistsKey);
      } else {
        setSortKey("Nome");
      }

      setReversed(JSON.parse(localStorage.reversedPlaylists));

      const { userId } = router.query;

      if (userId !== undefined) {
        getAccessToken((accessToken) => {
          fetch("https://api.spotify.com/v1/users/" + userId, {
            headers: {
              Authorization: "Bearer " + accessToken,
            },
          })
            .then((response) => response.json())
            .then((body) => {
              const user = {
                display_name: body.display_name,
                images: [{ url: body.images[0].url }],
                followers: { total: body.followers.total },
              };
              setUser(user);
            });

          fetch(
            "https://api.spotify.com/v1/users/" +
              userId +
              "/playlists?limit=50",
            {
              headers: {
                Authorization: "Bearer " + accessToken,
              },
            }
          )
            .then((response) => response.json())
            .then((body) => {
              if (body.error) {
                setError("User Not Found");
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
                  setPlaylists(playlists);
                });
              }
            });
        });
      }
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

  function goHome() {
    router.push("/home");
  }

  function reverse() {
    setReversed((prev) => !prev);
  }

  return (
    <>
      <Head>
        {user ? (
          <title>{user.display_name} - Spotify Helper</title>
        ) : (
          <title>Carregando... - Spotify Helper</title>
        )}
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
        <Header exit={goHome} {...{ theme, setTheme }} />
        <div className="body">
          <User
            {...{
              user,
              sortKey,
              sortKeys,
              reverse,
              reversed,
              setSortKey,
              filter,
              setFilter,
            }}
          />
          <div className={styles.playlists}>
            {sortedPlaylists.map((playlist, index) => (
              <PlaylistIcon
                tabIndex={10 + Object.keys(sortKeys).length + index * 2}
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
