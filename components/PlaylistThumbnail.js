import { useRouter } from "next/router";
import Image from "next/image";

import getAccessToken from "@/functions/getAccessToken";
import shuffleArray from "@/functions/shuffleArray";
import styles from "@/styles/User.module.css";
import loadTracks from "@/functions/loadTracks";
import Button from "./button";
import play from "@/functions/play";
import SVG from "./svg";

export default function PlaylistThumbnail({
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
        <Button
          className={styles.playlistButton}
          action={(e) => play(e, setMessage, true, id)}
        >
          <SVG name="play" size={20} />
        </Button>
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
