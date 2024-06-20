import { useRouter } from "next/router";
import styles from "@/styles/User.module.css";
import Button from "./button";
import play from "@/functions/client/play";
import SVG from "./svg";
import logout from "@/functions/client/logout";

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
          action={async (e) => {
            const result = await play(e, true, id);

            switch (result.error) {
              case "missing_refresh_token": {
                logout(router);
                break;
              }
              case "missing_access_token": {
                location.reload();
                break;
              }
              case "device_not_found": {
                setMessage("Não encontrou dispositivo spotify ativo");
                e.target.blur();
                break;
              }
            }
          }}
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
