import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/Playlist.module.css";

import { useRouter } from "next/router";
import Head from "next/head";

import getAccessToken from "@/functions/getAccessToken";
import shuffleArray from "@/functions/shuffleArray";
import Header from "@/components/header";
import Track from "@/components/track";
import Modal from "@/components/modal";
import PlaylistDetails from "@/components/playlistDetails";
import PlaylistSummary from "@/components/playlistSummary";
import { localStorageKeys } from "@/constants/localStorageKeys";
import { sortKeys } from "@/constants/trackSortKeys";
import loadTracks from "@/functions/loadTracks";
import play from "@/functions/play";

var prevScrollTop = 0;

export default function Playlist() {
  const [playlist, setPlaylist] = useState();
  const [tracks, setTracks] = useState([]);
  const [status, setStatus] = useState(null); // "saved", "liked", or null

  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState();
  const [reversed, setReversed] = useState();

  const filteredTracks = useMemo(
    () =>
      tracks.filter(
        (value) =>
          value.track.name.toLowerCase().includes(filter.toLowerCase()) ||
          value.track.album.name.toLowerCase().includes(filter.toLowerCase()) ||
          value.track.artists.some((value) =>
            value.name.toLowerCase().includes(filter.toLowerCase())
          )
      ),
    [tracks, filter]
  );

  const sortedTracks = useMemo(
    () =>
      [...filteredTracks].sort((a, b) =>
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
    if (localStorageKeys.some((value) => localStorage[value] === undefined)) {
      const theme = localStorage.theme;
      localStorage.clear();
      localStorage.theme = theme;
      router.replace("/");
    } else {
      setVertical(innerHeight > innerWidth);

      onresize = () => {
        setVertical(innerHeight > innerWidth);
      };

      const { playlistId } = router.query;

      const storage = {
        saved: JSON.parse(localStorage.saved),
        liked: JSON.parse(localStorage.liked),
      };
      const loaded = JSON.parse(localStorage.loaded);

      const nextStatus = storage.saved[playlistId]
        ? "saved"
        : storage.liked[playlistId]
        ? "liked"
        : null;

      if (nextStatus) {
        if (storage[nextStatus][playlistId])
          setPlaylist(storage[nextStatus][playlistId]);
        if (loaded[playlistId]) setTracks(loaded[playlistId]);
        setStatus(nextStatus);
      }

      if (sortKeys[localStorage.sortTracksKey]) {
        setSortKey(localStorage.sortTracksKey);
      } else {
        setSortKey("Data");
      }
      setReversed(JSON.parse(localStorage.reversedTracks));

      async function fetchData() {
        const accessToken = await getAccessToken();

        const playlistsResponse = await fetch(
          "https://api.spotify.com/v1/playlists/" + playlistId,
          {
            headers: {
              Authorization: "Bearer " + accessToken,
            },
          }
        );

        const playlistsBody = await playlistsResponse.json();

        if (playlistsBody.error) {
          setMessage("Playlist não encontrada");
          return;
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
          images: [{ url: playlistsBody.images[0]?.url }],
        };

        setPlaylist(playlist);

        if (nextStatus) {
          storage[nextStatus][playlistId] = playlist;
          localStorage[nextStatus] = JSON.stringify(storage[nextStatus]);
        }
        const tracks = await loadTracks(playlistsBody.tracks);

        const treatedTracks = tracks.map(
          ({
            added_at,
            track: { album, artists, name, uri, duration_ms },
          }) => ({
            added_at,
            track: {
              album: {
                images: [{ url: album.images[0]?.url }],
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

        setTracks(treatedTracks);

        if (nextStatus) {
          loaded[playlistId] = treatedTracks;
          localStorage.loaded = JSON.stringify(loaded);
        }
      }

      if (playlistId !== undefined) {
        fetchData();
      }
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

  function playDefault(e) {
    play(e, setMessage, tracks, skip, limit);
  }

  function playFrom(e, firstTrack) {
    play(e, setMessage, tracks, skip, limit, firstTrack);
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

  function switchLiked() {
    setStatus((prev) => {
      const { playlistId } = router.query;

      const liked = JSON.parse(localStorage.liked);
      const loaded = JSON.parse(localStorage.loaded);

      if (!prev) {
        liked[playlistId] = playlist;
        loaded[playlistId] = tracks;
        localStorage.liked = JSON.stringify(liked);
        localStorage.loaded = JSON.stringify(loaded);
        return "liked";
      }

      delete liked[playlistId];
      delete loaded[playlistId];
      localStorage.liked = JSON.stringify(liked);
      localStorage.loaded = JSON.stringify(loaded);
    });
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
                status,
                switchLiked,
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
              status,
              setStatus,
              switchLiked,
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
