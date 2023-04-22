import { useRouter } from "next/router";
import Image from "next/image";

import getAccessToken from "@/functions/getAccessToken";
import shuffleArray from "@/functions/shuffleArray";
import styles from "@/styles/User.module.css";
import loadTracks from "@/functions/loadTracks";

export default function PlaylistIcon({
  playlist: {
    name,
    description,
    id,
    owner: { display_name },
    images,
  },
  tabIndex,
  setMessage,
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
            e.target.blur();
            return setMessage("Não encontrou dispositivo spotify ativo");
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
          backgroundImage: `url(${images[0]?.url})`,
        }}
        alt={name + " image"}
        className={styles.playlistImage}
      >
        <div
          tabIndex={`${tabIndex + 1}`}
          className={styles.playlistButton}
          onClick={play}
          onKeyUp={(e) => {
            if (e.code === "Enter") {
              play(e);
            }
          }}
        >
          <Image src="/play.svg" alt="play" width={20} height={20} />
        </div>
      </div>

      <div className={styles.playlistDetails}>
        <div className={styles.playlistText}>
          <div className={styles.playlistName}>{name}</div>
          {description || "de " + display_name}
        </div>
      </div>
    </div>
  );
}
