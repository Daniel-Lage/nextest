import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";

export default function Playlist({
  playlist: {
    name,
    description,
    id,
    owner: { display_name },
    tracks: { total },
    images,
  },
}) {
  const router = useRouter();

  return (
    <div
      className={styles.playlist}
      onClick={() => router.replace("/playlist/" + id)}
    >
      <img src={images[0].url} alt={name + " image"} className={styles.image} />

      <div className={styles.name}>{name}</div>
      <div className={styles.details}>
        {description || "de " + display_name}
      </div>
    </div>
  );
}
