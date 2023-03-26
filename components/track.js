import styles from "@/styles/Playlist.module.css";

export default function Track({
  track: {
    added_at,
    track: { album, artists, name },
  },
  index,
  vertical,
}) {
  const date = new Date(added_at);

  return (
    <div className={styles.track} onClick={() => {}}>
      <img
        src={album.images[0].url}
        alt={name + " image"}
        className={styles.image}
      />
      <div className={styles.details}>
        <div className={styles.name}>{name}</div>
        {vertical || (
          <>
            <div className={styles.album}>{album.name}</div>
            <div className={styles.artists}>
              {artists.map((artist) => artist.name).join(" ")}
            </div>
          </>
        )}
      </div>
      {vertical || (
        <div className={styles.date}>
          {date.getDay() + "/" + date.getMonth() + "/" + date.getUTCFullYear()}
        </div>
      )}
      <div className={styles.index}>{index}</div>
    </div>
  );
}
