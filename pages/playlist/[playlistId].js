import Head from "next/head";
import styles from "@/styles/Playlist.module.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Track from "@/components/track";
import Image from "next/image";
import getAccessToken from "@/functions/getAccessToken";
import shuffleArray from "@/functions/shuffleArray";

async function loadTracks({ tracks: { next, items } }, temp) {
  temp = [...temp, ...items];

  if (next) {
    const response = await fetch(next, {
      headers: {
        Authorization: "Bearer " + localStorage.accessToken,
      },
    });
    const body = await response.json();
    return await loadTracks({ tracks: body }, temp);
  } else {
    return temp;
  }
}

export default function Playlist() {
  const [playlist, setPlaylist] = useState();
  const [tracks, setTracks] = useState();
  const [vertical, setVertical] = useState();
  const [open, setOpen] = useState(false);
  const menu = useRef();

  const router = useRouter();

  useEffect(() => {
    if (!localStorage.accessToken) router.replace("/");
    else {
      setVertical(innerHeight > innerWidth);

      onresize = (e) => {
        setVertical(innerHeight > innerWidth);
      };

      const { playlistId } = router.query;

      if (playlistId !== undefined) {
        getAccessToken((accessToken) => {
          fetch("https://api.spotify.com/v1/playlists/" + playlistId, {
            headers: {
              Authorization: "Bearer " + accessToken,
            },
          })
            .then((response) => response.json())
            .then((body) => {
              setPlaylist({
                image: body?.images[0].url,
                name: body.name,
                owner: body.owner.display_name,
              });
              loadTracks(body, []).then(setTracks);
            });
        });
      }
    }
  }, [router]);

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
            return alert("OPEN SPOTIFY");
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
            return alert("OPEN SPOTIFY");
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
        {playlist ? (
          <title>{playlist.name} - Spotify Helper 2.0</title>
        ) : (
          <title>Playlist - Spotify Helper 2.0</title>
        )}
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container">
        <div className="header">
          <div className="left">
            <div
              className="button"
              onClick={() => {
                router.replace("/home");
              }}
            >
              {vertical ? (
                <Image src="/back.svg" alt="back" width={25} height={25} />
              ) : (
                <Image src="/back.svg" alt="back" width={40} height={40} />
              )}
            </div>
          </div>

          <div className="center">
            <div className="title">Spotify Helper</div>
          </div>

          <div className="right">
            <div className="button" onClick={() => setOpen((prev) => !prev)}>
              {vertical ? (
                <Image
                  src="/ellipsis.svg"
                  alt="ellipsis"
                  width={25}
                  height={25}
                />
              ) : (
                <Image
                  src="/ellipsis.svg"
                  alt="ellipsis"
                  width={40}
                  height={40}
                />
              )}
            </div>
          </div>
          <div className="menu" ref={menu}></div>
        </div>
        <div className={styles.body}>
          <div
            className={
              vertical
                ? `${styles.playlist} ${styles.vertical}`
                : styles.playlist
            }
          >
            {playlist && (
              <>
                <img
                  src={playlist.image}
                  alt={playlist.name + " image"}
                  className={styles.image}
                />
                <div>
                  <div className={styles.name}>{playlist.name}</div>
                  <div className={styles.owner}>
                    {playlist.owner}
                    <div className="button" onClick={play}>
                      <Image
                        src="/play.svg"
                        alt="play"
                        width={40}
                        height={40}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          {tracks?.map((track, index) => (
            <Track
              key={index}
              track={track}
              index={index + 1}
              vertical={vertical}
              onClick={() => playFrom(track.track.uri)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
