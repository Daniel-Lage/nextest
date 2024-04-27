import styles from "@/styles/Track.module.css";

export default function Track({
  track: {
    added_at,
    track: { album, artists, name },
  },
  index,
  tabIndex,
  vertical,
  play,
}) {
  const date = new Date(added_at);

  return (
    <div
      tabIndex={`${tabIndex}`}
      className={styles.track}
      onClick={play}
      onKeyUp={(e) => {
        if (e.code === "Enter") {
          play(e);
        }
      }}
    >
      {album.images && (
        <img src={album.images[0].url} alt={name} className={styles.image} />
      )}
      <div className={styles.details}>
        <div className={styles.name}>{name}</div>
        {vertical || (
          <>
            <div className={styles.album}>{album.name}</div>
            <div className={styles.artists}>
              {artists.map((artist) => artist.name).join(", ")}
            </div>
          </>
        )}
      </div>
      {vertical || (
        <div className={styles.date}>
          {date.getDay() +
            1 +
            "/" +
            (date.getMonth() + 1) +
            "/" +
            date.getUTCFullYear()}
        </div>
      )}
      <div className={styles.index}>{index}</div>
    </div>
  );
}
