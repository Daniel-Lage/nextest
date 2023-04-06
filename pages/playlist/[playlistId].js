import { useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";

import getAccessToken from "@/functions/getAccessToken";
import shuffleArray from "@/functions/shuffleArray";
import styles from "@/styles/Playlist.module.css";
import Track from "@/components/track";
import Filter from "@/components/filter";
import Sorter from "@/components/sorter";

const themes = ["blue", "pink", "lime"];

const sortKeys = {
  Artist: (a, b) => {
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
  Name: (a, b) => {
    const A = a.track.name.toLowerCase();
    const B = b.track.name.toLowerCase();

    if (A > B) return 1;
    if (A < B) return -1;

    return sortKeys.Date(a, b);
  },
  Date: (a, b) => {
    const A = new Date(a.added_at);
    const B = new Date(b.added_at);

    return B.getTime() - A.getTime();
  },
};

async function loadTracks({ next, items }, temp) {
  temp = [...temp, ...items];

  if (next) {
    const response = await fetch(next, {
      headers: {
        Authorization: "Bearer " + localStorage.accessToken,
      },
    });
    const body = await response.json();
    return await loadTracks(body, temp);
  } else {
    return temp.filter((value) => value.track);
  }
}

export default function Playlist() {
  const [playlist, setPlaylist] = useState();
  const [status, setStatus] = useState(null); // "saved", "liked", or null
  const [tracks, setTracks] = useState([]);

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

      setSortKey(localStorage.sortTracksKey);
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
              setPlaylist(body);
              if (nextStatus) {
                storage[nextStatus][playlistId] = body;
                localStorage[nextStatus] = JSON.stringify(storage[nextStatus]);

                loadTracks(body.tracks, []).then((tracks) => {
                  setTracks(tracks);
                  loaded[playlistId] = tracks;
                  localStorage.loaded = JSON.stringify(loaded);
                });
              } else {
                loadTracks(body.tracks, []).then((tracks) => {
                  setTracks(tracks);
                });
              }
            });
        });
      }
    }
  }, [router]);

  useEffect(() => {
    menu.current.style.height = open ? "60px" : "0px";
  }, [open]);

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

  function play() {
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
            return setError("Cant find active spotify device");
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

  function playFrom(uri) {
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
            return setError("Cant find active spotify device");
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

  return (
    <>
      <Head>
        {playlist?.name ? (
          <title>{playlist.name} - Spotify Helper 2.0</title>
        ) : (
          <title>Loading... - Spotify Helper 2.0</title>
        )}
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
                router.replace("/home");
              }}
            >
              <Image src="/back.svg" alt="back" width={25} height={25} />
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
        <div className={styles.body}>
          <div className="subheader">
            {playlist ? (
              <>
                <img
                  src={playlist.images[0].url}
                  alt={playlist.name + " image"}
                  className={styles.image}
                />
                <div className={styles.details}>
                  <div className={styles.name}>{playlist.name}</div>
                  <div className={styles.total}>{playlist.tracks.total}</div>
                  <div className={styles.owner}>
                    {playlist.owner.display_name}
                  </div>
                  <Sorter
                    sortKeys={sortKeys}
                    sortKey={sortKey}
                    setSortKey={setSortKey}
                    reversed={reversed}
                    setReversed={setReversed}
                  />
                  <Filter filter={filter} setFilter={setFilter} />
                  <div className="row">
                    <div className={styles.button} onClick={play}>
                      <Image
                        src="/play.svg"
                        alt="play"
                        width={25}
                        height={25}
                      />
                    </div>
                    {status === "saved" ? null : (
                      <div
                        className={styles.button}
                        onClick={() =>
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
                          })
                        }
                      >
                        <Image
                          src={
                            status === "liked"
                              ? "/heart-filled.svg"
                              : "/heart-outline.svg"
                          }
                          alt="heart"
                          width={25}
                          height={25}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
          {sortedTracks.map((track, index) => (
            <Track
              key={index}
              track={track}
              index={index + 1}
              onClick={() => playFrom(track.track.uri)}
              vertical={vertical}
            />
          ))}
        </div>
      </div>
    </>
  );
}
