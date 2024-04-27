import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";
import Head from "next/head";

import styles from "@/styles/User.module.css";

import getAccessToken from "@/functions/server/getAccessToken";

import PlaylistThumbnail from "@/components/PlaylistThumbnail";
import Header from "@/components/header";
import Modal from "@/components/modal";
import UserDetails from "@/components/userDetails";
import UserSummary from "@/components/userSummary";
import { localStorageKeys } from "@/constants/localStorageKeys";
import { sortKeys } from "@/constants/playlistSortKeys";
import loadPlaylists from "@/functions/server/loadPlaylists";

var prevScrollTop = 0;

export default function User({ user, playlists, total, error }) {
  const [following, setFollowing] = useState();

  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState();
  const [reversed, setReversed] = useState();

  const filteredPlaylists = useMemo(
    () =>
      playlists === undefined
        ? []
        : playlists.filter(
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
      sortKey === undefined
        ? []
        : [...filteredPlaylists].sort((a, b) =>
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
    if (
      localStorageKeys.some((value) => localStorage[value] === undefined) ||
      error === "missing_refresh_token"
    ) {
      logout(router);
    } else {
      if (error === "own_profile") {
        router.replace("/home");
      }

      if (sortKeys[localStorage.sortPlaylistsKey]) {
        setSortKey(localStorage.sortPlaylistsKey);
      } else {
        setSortKey("Nome");
      }

      setReversed(JSON.parse(localStorage.reversedPlaylists));

      const { user_id } = router.query;

      const following = JSON.parse(localStorage.following);

      setFollowing(Boolean(following[user_id]));
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

  function goHome() {
    router.push("/home");
  }

  function reverse() {
    setReversed((prev) => !prev);
  }

  function share(e) {
    navigator.clipboard.writeText(location.origin + "/user/" + user.id);
    e.target.blur();
    setMessage("Adicionado a área de transferência");
  }

  function switchFollowing() {
    setFollowing((prev) => {
      const { user_id } = router.query;

      const following = JSON.parse(localStorage.following);

      if (prev) delete following[user_id];
      else following[user_id] = user;

      localStorage.following = JSON.stringify(following);
      return !prev;
    });
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
          <Header exit={goHome} {...{ theme, setTheme, headerHidden }} />
          {showSummary && (
            <UserSummary
              {...{
                user,
                sortKey,
                reverse,
                reversed,
                setSortKey,
                filter,
                setFilter,
                share,
                following,
                switchFollowing,
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
            {...{
              user,
              sortKey,
              reverse,
              reversed,
              setSortKey,
              filter,
              setFilter,
              total,
              share,
              following,
              switchFollowing,
            }}
          />
          <div className={styles.playlists}>
            {sortedPlaylists.map((playlist, index) => (
              <PlaylistThumbnail
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

export async function getServerSideProps({
  params: { user_id },
  req: {
    cookies: { access_token, refresh_token, me_id },
  },
  res: { setHeader },
}) {
  if (user_id === me_id) {
    return {
      props: {
        error: "own_profile",
      },
    };
  }

  if (refresh_token === undefined) {
    return {
      props: {
        error: "missing_refresh_token",
      },
    };
  }

  if (access_token === undefined) {
    access_token = await getAccessToken(refresh_token);

    const now = new Date();
    const time = now.getTime();

    const accessTokenExpirationDate = new Date(time + 3600000); // expires in an hour
    const refreshTokenExpirationDate = new Date(time + 34560000000); // expires in 400 days

    setHeader("Set-Cookie", ["access_token=deleted", "refresh_token=deleted"]);

    setHeader("Set-Cookie", [
      `access_token=${access_token};expires=${accessTokenExpirationDate.toUTCString()}`,
      `refresh_token=${refresh_token};expires=${refreshTokenExpirationDate.toUTCString()}`,
    ]);
  }

  if (user_id === undefined) {
    return {
      props: {
        error: "playlist_not_found",
      },
    };
  }

  const userResponse = await fetch(
    `https://api.spotify.com/v1/users/${user_id}`,
    {
      headers: {
        Authorization: "Bearer " + access_token,
      },
    }
  );

  const userBody = await userResponse.json();

  const user = {
    id: userBody.id,
    display_name: userBody.display_name,
    images: [{ url: userBody.images[0]?.url }],
    followers: { total: userBody.followers.total },
  };

  const playlistsResponse = await fetch(
    `https://api.spotify.com/v1/users/${user_id}/playlists?limit=50`,
    {
      headers: {
        Authorization: "Bearer " + access_token,
      },
    }
  );

  const playlistsBody = await playlistsResponse.json();

  const saved = {};

  if (playlistsBody.error) {
    return { props: { error: playlistsBody.error_description } };
  } else {
    const result = await loadPlaylists(playlistsBody, [], access_token);

    const playlists = result.map(
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

    playlists.forEach((playlist) => {
      saved[playlist.id] = playlist;
    });
  }

  return {
    props: {
      user,
      playlists: Object.values(saved),
      total: playlistsBody.total,
    },
  };
}
