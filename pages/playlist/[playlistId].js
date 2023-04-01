import { useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";

import getAccessToken from "@/functions/getAccessToken";
import shuffleArray from "@/functions/shuffleArray";
import styles from "@/styles/Playlist.module.css";
import Track from "@/components/track";
import Filter from "@/components/filter";

const themes = ["blue", "pink", "lime"];

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
  const [status, setStatus] = useState(); // "saved", "liked", or undefined
  const [tracks, setTracks] = useState([]);

  const [filter, setFilter] = useState("");

  const filteredTracks = useMemo(
    () =>
      tracks?.filter(
        (value) =>
          value.track.name.toLowerCase().includes(filter.toLowerCase()) ||
          value.track.album.name.toLowerCase().includes(filter.toLowerCase()) ||
          value.track.artists.some((value) =>
            value.name.toLowerCase().includes(filter.toLowerCase())
          )
      ),
    [tracks, filter]
  );

  const [vertical, setVertical] = useState();
  const [theme, setTheme] = useState();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const menu = useRef();
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.accessToken) router.replace("/");
    else {
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

      const saved = JSON.parse(localStorage.saved);
      const liked = JSON.parse(localStorage.liked);
      const loaded = JSON.parse(localStorage.loaded);

      if (Object.keys(saved)?.some((id) => id === playlistId)) {
        setPlaylist(saved[playlistId]);
        setTracks(tracks[playlistId]);
        setStatus("saved");
      } else if (Object.keys(liked)?.some((id) => id === playlistId)) {
        setPlaylist(liked[playlistId]);
        setTracks(tracks[playlistId]);
        setStatus("liked");
      }

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
              if (status === "saved") {
                saved[playlistId] = body;
                localStorage.saved = JSON.stringify(saved);
                loadTracks(body.tracks, []).then((tracks) => {
                  setTracks(tracks);
                  loaded[playlistId] = tracks;
                  localStorage.loaded = JSON.stringify(loaded);
                });
              } else if (status === "liked") {
                liked[playlistId] = body;
                localStorage.liked = JSON.stringify(liked);
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

  console.log(status);

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
          <div className={["subheader", vertical && styles.vertical].join(" ")}>
            {playlist ? (
              <>
                <img
                  src={playlist.images[0].url}
                  alt={playlist.name + " image"}
                  className={styles.image}
                />
                <div className={styles.playlist}>
                  <div className={styles.name}>{playlist.name}</div>
                  <div className={styles.total}>{playlist.tracks.total}</div>
                  <div className={styles.owner}>
                    {playlist.owner.display_name}
                  </div>
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
          {filteredTracks?.map((track, index) => (
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
