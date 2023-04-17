import { useRouter } from "next/router";
import Image from "next/image";

import getAccessToken from "@/functions/getAccessToken";
import shuffleArray from "@/functions/shuffleArray";
import styles from "@/styles/Home.module.css";

async function loadTracks(tracks, temp) {
  temp = [...temp, ...tracks.items];

  if (tracks.next) {
    const url = new URL(tracks.next);
    const baseURL = url.origin + url.pathname;
    const requests = [];

    for (let offset = 50; offset < tracks.total; offset += 50) {
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

export default function Playlist({
  playlist: {
    name,
    description,
    id,
    owner: { display_name },
    images,
  },
  tabIndex,
  setError,
}) {
  const router = useRouter();

  function play(e) {
    e.stopPropagation();
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

          fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
            headers: {
              Authorization: "Bearer " + accessToken,
            },
          })
            .then((response) => response.json())
            .then((body) => {
              if (body.error) {
                console.error(body.error_description);
              } else {
                loadTracks(body, []).then((tracks) => {
                  const shuffledTracks = shuffleArray(tracks).map(
                    (value) => value.track.uri
                  );

                  fetch(
                    "https://api.spotify.com/v1/me/player/queue?" +
                      new URLSearchParams({
                        uri: shuffledTracks.pop(),
                        device_id: deviceId,
                      }).toString(),
                    {
                      method: "POST",
                      headers: {
                        Authorization: "Bearer " + localStorage.accessToken,
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
                          Authorization: "Bearer " + localStorage.accessToken,
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
                              Authorization:
                                "Bearer " + localStorage.accessToken,
                            },
                          }
                        );
                      });
                    });
                  });
                });
              }
            });
        });
    });
  }

  function open() {
    router.push("/playlist/" + id);
  }

  return (
    <div
      tabIndex={`${tabIndex}`}
      className={styles.playlist}
      onClick={open}
      onKeyUp={(e) => {
        if (e.code === "Enter") {
          open();
        }
      }}
    >
      <div
        style={{
          backgroundImage: `url(${images[0].url})`,
          backgroundSize: "150px 150px",
        }}
        alt={name + " image"}
        className={styles.image}
      >
        <div
          tabIndex={`${tabIndex + 1}`}
          className={styles.button}
          onClick={play}
          onKeyUp={(e) => {
            if (e.code === "Enter") {
              play();
            }
          }}
        >
          <Image src="/play.svg" alt="play" width={25} height={25} />
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.text}>
          <div className={styles.name}>{name}</div>
          {description || "de " + display_name}
        </div>
      </div>
    </div>
  );
}
