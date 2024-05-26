import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/Playlist.module.css";

import { useRouter } from "next/router";
import Head from "next/head";

import getAccessToken from "@/functions/server/getAccessToken";
import shuffleArray from "@/functions/client/shuffleArray";
import Header from "@/components/header";
import Track from "@/components/track";
import Modal from "@/components/modal";
import PlaylistDetails from "@/components/playlistDetails";
import PlaylistSummary from "@/components/playlistSummary";
import { localStorageKeys } from "@/constants/localStorageKeys";
import { sortKeys } from "@/constants/trackSortKeys";
import loadTracks from "@/functions/server/loadTracks";
import play from "@/functions/client/play";

var prevScrollTop = 0;

export default function Playlist({ playlist, tracks, error }) {
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState();
  const [reversed, setReversed] = useState();

  const filteredTracks = useMemo(
    () =>
      tracks === undefined
        ? []
        : tracks.filter(
            (value) =>
              value.track.name.toLowerCase().includes(filter.toLowerCase()) ||
              value.track.album.name
                .toLowerCase()
                .includes(filter.toLowerCase()) ||
              value.track.artists.some((value) =>
                value.name.toLowerCase().includes(filter.toLowerCase())
              )
          ),
    [tracks, filter]
  );

  const sortedTracks = useMemo(
    () =>
      sortKey === undefined
        ? []
        : [...filteredTracks].sort((a, b) =>
            reversed ? sortKeys[sortKey](b, a) : sortKeys[sortKey](a, b)
          ),
    [filteredTracks, sortKey, reversed]
  );

  const [vertical, setVertical] = useState();
  const [headerHidden, setHeaderHidden] = useState();
  const [showSummary, setShowSummary] = useState();
  const [theme, setTheme] = useState();
  const [skip, setSkip] = useState(true);
  const [limit, setLimit] = useState({ type: "No Limit", value: 0 });

  const [message, setMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (
      localStorageKeys.some((value) => localStorage[value] === undefined) ||
      error === "missing_refresh_token"
    ) {
      const theme = localStorage.theme;
      localStorage.clear();
      localStorage.theme = theme;
      router.replace("/");
    } else {
      setVertical(innerHeight > innerWidth);

      onresize = () => {
        setVertical(innerHeight > innerWidth);
      };

      if (sortKeys[localStorage.sortTracksKey]) {
        setSortKey(localStorage.sortTracksKey);
      } else {
        setSortKey("Data");
      }
      setReversed(JSON.parse(localStorage.reversedTracks));
    }
  }, [router]);

  useEffect(() => {
    if (theme) localStorage.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (sortKey !== undefined) localStorage.sortTracksKey = sortKey;
  }, [sortKey]);

  useEffect(() => {
    if (reversed !== undefined)
      localStorage.reversedTracks = JSON.stringify(reversed);
  }, [reversed]);

  async function playDefault(e) {
    const result = await play(e, skip, tracks, limit);

    switch (result.error) {
      case "missing_token": {
        logout(router);
      }
      case "device_not_found": {
        setMessage("Não encontrou dispositivo spotify ativo");
        e.target.blur();
      }
    }
  }

  async function playFrom(e, firstTrack) {
    const result = await play(e, skip, tracks, limit, firstTrack);

    switch (result.error) {
      case "missing_refresh_token": {
        logout(router);
      }
      case "device_not_found": {
        setMessage("Não encontrou dispositivo spotify ativo");
        e.target.blur();
      }
    }
  }

  function goHome() {
    router.push("/home");
  }

  function reverse() {
    setReversed((prev) => !prev);
  }

  function switchSkip() {
    setSkip((prev) => !prev);
  }

  function open() {
    router.push("/user/" + playlist.owner.id);
  }

  function clearFilter() {
    setFilter("");
  }

  function share(e) {
    navigator.clipboard.writeText(location);
    e.target.blur();
    setMessage("Adicionado a área de transferência");
  }

  function clearMessage() {
    setMessage("");
  }

  return (
    <>
      <Head>
        {playlist ? (
          <title>{playlist.name} - Spotify Helper</title>
        ) : (
          <title>Carregando... - Spotify Helper</title>
        )}
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
            <PlaylistSummary
              {...{
                playlist,
                sortKey,
                reverse,
                open,
                reversed,
                setSortKey,
                filter,
                setFilter,
                playDefault,
                clearFilter,
                share,
                limit,
                setLimit,
                skip,
                switchSkip,
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
          <PlaylistDetails
            {...{
              playlist,
              sortKey,
              reverse,
              open,
              reversed,
              setSortKey,
              filter,
              setFilter,
              playDefault,
              vertical,
              showSummary,
              clearFilter,
              share,
              limit,
              setLimit,
              skip,
              switchSkip,
            }}
          />
          {sortedTracks.map((track, index) => (
            <Track
              tabIndex={9 + Object.keys(sortKeys).length + index}
              key={index}
              track={track}
              index={index + 1}
              play={(e) => playFrom(e, track)}
              vertical={vertical}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({
  params: { playlist_id },
  req: {
    cookies: { access_token, refresh_token },
  },
  res: { setHeader },
}) {
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

  if (playlist_id === undefined) {
    return {
      props: {
        error: "playlist_not_found",
      },
    };
  }

  const playlistsResponse = await fetch(
    "https://api.spotify.com/v1/playlists/" + playlist_id,
    {
      headers: {
        Authorization: "Bearer " + access_token,
      },
    }
  );

  const playlistsBody = await playlistsResponse.json();

  if (playlistsBody.error) {
    return {
      props: {
        error: "playlist_not_found",
      },
    };
  }

  const playlist = {
    name: playlistsBody.name,
    description: playlistsBody.description,
    id: playlistsBody.id,
    tracks: { total: playlistsBody.tracks.total },
    owner: {
      display_name: playlistsBody.owner.display_name,
      id: playlistsBody.owner.id,
    },
    images: [
      { url: playlistsBody.images[0] ? playlistsBody.images[0].url : null },
    ],
  };

  const result = await loadTracks(playlistsBody.tracks, access_token);

  const tracks = result.map(
    ({ added_at, track: { album, artists, name, uri, duration_ms } }) => ({
      added_at,
      track: {
        album: {
          images: [{ url: album.images[0] ? album.images[0].url : null }],
          name: album.name,
        },
        artists: artists.map(({ name }) => ({
          name,
        })),
        name,
        uri,
        duration_ms,
      },
    })
  );

  return {
    props: {
      playlist,
      tracks,
    },
  };
}
