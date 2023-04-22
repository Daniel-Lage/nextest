import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";
import Head from "next/head";

import styles from "@/styles/User.module.css";

import getAccessToken from "@/functions/getAccessToken";

import PlaylistIcon from "@/components/playlistIcon";
import Header from "@/components/header";
import Modal from "@/components/modal";
import UserDetails from "@/components/userDetails";
import UserSummary from "@/components/userSummary";
import { localStorageKeys } from "@/functions/localStorageKeys";
import loadPlaylists from "@/functions/loadPlaylists";

var prevScrollTop = 0;

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

export default function Home() {
  const [user, setUser] = useState();
  const [total, setTotal] = useState();
  const [playlists, setPlaylists] = useState([]);
  const [following, setFollowing] = useState([]);

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
  const [showSummary, setShowSummary] = useState();
  const [headerHidden, setHeaderHidden] = useState();

  const [message, setMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (localStorageKeys.some((value) => localStorage[value] === undefined)) {
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

      setUser(JSON.parse(localStorage.user));
      setFollowing(Object.values(JSON.parse(localStorage.following)));

      getAccessToken((accessToken) => {
        fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        })
          .then((response) => response.json())
          .then((body) => {
            const user = {
              id: body.id,
              display_name: body.display_name,
              images: [{ url: body.images[0]?.url }],
              followers: { total: body.followers.total },
            };
            setUser(user);
            localStorage.user = JSON.stringify(user);
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
              setTotal(body.total);
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
                    images: [{ url: images[0]?.url }],
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

  function clearMessage() {
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

  function share(e) {
    navigator.clipboard.writeText(location.origin + "/user/" + user.id);
    e.target.blur();
    setMessage("Adicionado a área de transferência");
  }

  function goFollowing() {
    router.replace("/following");
  }

  return (
    <>
      <Head>
        <title>Página Inicial - Spotify Helper</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {message && <Modal {...{ theme, message, clearMessage }} />}
      <div
        className={[
          "container ",
          theme || "loading",
          message && "modalOpen",
        ].join(" ")}
      >
        <div className="before">
          <Header home exit={logout} {...{ theme, setTheme, headerHidden }} />
          {showSummary && (
            <UserSummary
              self
              {...{
                user,
                sortKey,
                sortKeys,
                reverse,
                reversed,
                setSortKey,
                filter,
                setFilter,
                share,
              }}
            />
          )}
        </div>
        <div
          className={styles.body}
          onScroll={(e) => {
            const details = e.target.firstChild;
            const detailsBottom = details.offsetHeight + details.offsetTop;
            setShowSummary(e.target.scrollTop > detailsBottom);

            const deltaScrollTop = e.target.scrollTop - prevScrollTop;
            if (Math.abs(deltaScrollTop) > 10) {
              setHeaderHidden(deltaScrollTop > 0);
              prevScrollTop = e.target.scrollTop;
            }
          }}
        >
          <UserDetails
            self
            {...{
              user,
              sortKey,
              sortKeys,
              reverse,
              reversed,
              setSortKey,
              filter,
              setFilter,
              total,
              share,
              following,
              goFollowing,
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
