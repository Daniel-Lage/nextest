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

var prevScrollTop = 0;

const sortKeys = {
  Artista: (a, b) => {
    const A = a.track.artists[0].name.toLowerCase();
    const B = b.track.artists[0].name.toLowerCase();

    if (A > B) return 1;
    if (A < B) return -1;

    return sortKeys.Album(a, b);
  },
  Album: (a, b) => {
    const A = a.track.album.name.toLowerCase();
    const B = b.track.album.name.toLowerCase();

    if (A > B) return 1;
    if (A < B) return -1;

    return b.track.disc_number - a.track.disc_number;
  },
  Nome: (a, b) => {
    const A = a.track.name.toLowerCase();
    const B = b.track.name.toLowerCase();

    if (A > B) return 1;
    if (A < B) return -1;

    return sortKeys.Data(a, b);
  },
  Data: (a, b) => {
    const A = new Date(a.added_at);
    const B = new Date(b.added_at);

    return B.getTime() - A.getTime();
  },
};

async function loadTracks(tracks, temp) {
  var temp = [...temp, ...tracks.items];

  if (tracks.next) {
    const url = new URL(tracks.next);
    const baseURL = url.origin + url.pathname;
    const requests = [];

    for (let offset = 50; offset < tracks.total; offset += 50) {
      requests.push(
        fetch(baseURL + "?limit=100&offset=" + offset, {
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
  return temp.filter((value) => value.track);
}

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
        "user",
      ].some((value) => localStorage[value] === undefined)
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

      if (playlistId !== undefined) {
        getAccessToken((accessToken) => {
          fetch("https://api.spotify.com/v1/playlists/" + playlistId, {
            headers: {
              Authorization: "Bearer " + accessToken,
            },
          })
            .then((response) => response.json())
            .then((body) => {
              if (body.error) {
                setMessage("Playlist Not Found");
                return;
              }

              const tracks = {
                next: body.tracks.next,
                items: body.tracks.items,
                total: body.tracks.total,
              };

              const playlist = {
                name: body.name,
                description: body.description,
                id: body.id,
                tracks: { total: body.tracks.total },
                owner: {
                  display_name: body.owner.display_name,
                  id: body.owner.id,
                },
                images: [{ url: body.images[0].url }],
              };

              setPlaylist(playlist);

              if (nextStatus) {
                storage[nextStatus][playlistId] = playlist;
                localStorage[nextStatus] = JSON.stringify(storage[nextStatus]);
              }

              loadTracks(tracks, []).then((tracks) => {
                tracks = tracks.map(
                  ({ added_at, track: { album, artists, name, uri } }) => ({
                    added_at,
                    track: {
                      album: {
                        images: [{ url: album.images[0].url }],
                        name: album.name,
                      },
                      artists: artists.map(({ name }) => ({
                        name,
                      })),
                      name,
                      uri,
                    },
                  })
                );
                setTracks(tracks);

                if (nextStatus) {
                  loaded[playlistId] = tracks;
                  localStorage.loaded = JSON.stringify(loaded);
                }
              });
            });
        });
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

  function play(e) {
    getAccessToken((accessToken) => {
      fetch("https://api.spotify.com/v1/me/player", {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      })
        .then((response) => {
          if (response.status === 200) return response.json();
        })
        .then((body) => {
          if (body === undefined) {
            e.target.blur();
            return setMessage("Cant find active spotify device");
          }

          const shuffledTracks = shuffleArray([...tracks]).map(
            (value) => value.track.uri
          );

          const deviceId = body.device.id;

          fetch(
            "https://api.spotify.com/v1/me/player/queue?" +
              new URLSearchParams({
                uri: shuffledTracks.pop(),
                device_id: deviceId,
              }).toString(),
            {
              method: "POST",
              headers: {
                Authorization: "Bearer " + accessToken,
              },
            }
          ).then(() => {
            fetch(
              "https://api.spotify.com/v1/me/player/next?" +
                new URLSearchParams({
                  device_id: deviceId,
                }).toString(),
              {
                method: "POST",
                headers: {
                  Authorization: "Bearer " + accessToken,
                },
              }
            ).then(() => {
              shuffledTracks.forEach((track) => {
                fetch(
                  "https://api.spotify.com/v1/me/player/queue?" +
                    new URLSearchParams({
                      uri: track,
                      device_id: deviceId,
                    }).toString(),
                  {
                    method: "POST",
                    headers: {
                      Authorization: "Bearer " + accessToken,
                    },
                  }
                );
              });
            });
          });
        });
    });
  }

  function playFrom(e, uri) {
    getAccessToken((accessToken) => {
      fetch("https://api.spotify.com/v1/me/player", {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      })
        .then((response) => {
          if (response.status === 200) return response.json();
        })
        .then((body) => {
          if (body === undefined) {
            e.target.blur();
            return setMessage("Cant find active spotify device");
          }

          const deviceId = body.device.id;

          const shuffledTracks = shuffleArray([...tracks]).map(
            (value) => value.track.uri
          );

          shuffledTracks.splice(
            shuffledTracks.findIndex((value) => value === uri),
            1
          );

          fetch(
            "https://api.spotify.com/v1/me/player/queue?" +
              new URLSearchParams({
                uri: uri,
                device_id: deviceId,
              }).toString(),
            {
              method: "POST",
              headers: {
                Authorization: "Bearer " + accessToken,
              },
            }
          ).then(() => {
            fetch(
              "https://api.spotify.com/v1/me/player/next?" +
                new URLSearchParams({
                  device_id: deviceId,
                }).toString(),
              {
                method: "POST",
                headers: {
                  Authorization: "Bearer " + accessToken,
                },
              }
            ).then(() => {
              shuffledTracks.forEach((track) => {
                fetch(
                  "https://api.spotify.com/v1/me/player/queue?" +
                    new URLSearchParams({
                      uri: track,
                      device_id: deviceId,
                    }).toString(),
                  {
                    method: "POST",
                    headers: {
                      Authorization: "Bearer " + accessToken,
                    },
                  }
                );
              });
            });
          });
        });
    });
  }

  function goHome() {
    router.push("/home");
  }

  function reverse() {
    setReversed((prev) => !prev);
  }

  function open() {
    router.push("/user/" + playlist.owner.id);
  }

  function clearFilter() {
    setFilter("");
  }

  function share() {
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
                sortKeys,
                reverse,
                open,
                reversed,
                setSortKey,
                filter,
                setFilter,
                play,
                status,
                switchLiked,
                clearFilter,
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
            if (Math.abs(deltaScrollTop) > 100) {
              setHeaderHidden(deltaScrollTop > 0);
              prevScrollTop = e.target.scrollTop;
            }
          }}
        >
          <PlaylistDetails
            {...{
              playlist,
              sortKey,
              sortKeys,
              reverse,
              open,
              reversed,
              setSortKey,
              filter,
              setFilter,
              play,
              status,
              setStatus,
              switchLiked,
              vertical,
              showSummary,
              clearFilter,
              share,
            }}
          />
          {sortedTracks.map((track, index) => (
            <Track
              tabIndex={9 + Object.keys(sortKeys).length + index}
              key={index}
              track={track}
              index={index + 1}
              play={(e) => playFrom(e, track.track.uri)}
              vertical={vertical}
            />
          ))}
        </div>
      </div>
    </>
  );
}
