import getAccessToken from "@/functions/getAccessToken";
import shuffleArray from "@/functions/shuffleArray";
import styles from "@/styles/Home.module.css";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Playlist({
  playlist: {
    name,
    description,
    id,
    tracks: { href },
    owner: { display_name },
    images,
  },
}) {
  const router = useRouter();

  function loadTracks({ tracks: { next, items } }, temp) {
    temp = [...temp, ...items];

    if (next) {
      fetch(next, {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
        },
      })
        .then((response) => response.json())
        .then((body) => {
          if (body.error) {
            console.error(body.error_description);
          } else {
            loadTracks({ tracks: body }, temp);
          }
        });
    } else {
      fetch("https://api.spotify.com/v1/me/player", {
        headers: {
          Authorization: "Bearer " + localStorage.accessToken,
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

          const shuffledTracks = shuffleArray(temp).map(
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
                      Authorization: "Bearer " + localStorage.accessToken,
                    },
                  }
                );
              });
            });
          });
        });
    }
  }

  function play() {
    getAccessToken((accessToken) => {
      fetch("https://api.spotify.com/v1/playlists/" + id, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      })
        .then((response) => response.json())
        .then((body) => {
          if (body.error) {
            console.error(body.error_description);
          } else {
            loadTracks(body, []);
          }
        });
    });
  }

  return (
    <div className={styles.playlist}>
      <div
        style={{
          backgroundImage: `url(${images[0].url})`,
          backgroundSize: "200px 200px",
        }}
        alt={name + " image"}
        className={styles.image}
      >
        <div className={styles.button} onClick={play}>
          <Image src="/play.svg" alt="play" width={40} height={40} />
        </div>
      </div>

      <div
        className={styles.details}
        onClick={() => router.replace("/playlist/" + id)}
      >
        <div className={styles.text}>
          <div className={styles.name}>{name}</div>
          {description || "de " + display_name}
        </div>
      </div>
    </div>
  );
}
