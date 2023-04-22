import { useRouter } from "next/router";

import styles from "@/styles/User.module.css";

export default function UserIcon({
  user: { id, display_name, images, followers },
  tabIndex,
}) {
  const router = useRouter();

  function open() {
    router.push("/user/" + id);
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
      <img
        src={images[0]?.url}
        alt={display_name + " image"}
        className={styles.image}
      ></img>

      <div className={styles.playlistDetails}>
        <div className={styles.playlistText}>
          <div className={styles.playlistName}>{display_name}</div>
          {followers.total} seguidores
        </div>
      </div>
    </div>
  );
}
