import styles from "@/styles/Playlist.module.css";
import Sorter from "./sorter";
import Filter from "./filter";
import ButtonSvg from "./buttonSvg";

export default function playlistSummary({
  playlist,
  sortKey,
  sortKeys,
  reverse,
  reversed,
  setSortKey,
  filter,
  setFilter,
  play,
  status,
  switchLiked,
  clearFilter,
  share,
  showSummary,
}) {
  return (
    playlist && (
      <div className={styles.subheader}>
        <div className={styles.title}>{playlist.name}</div>
        <Sorter
          tabIndex={4}
          {...{
            sortKey,
            reverse,
            reversed,
            sortKeys,
            setSortKey,
          }}
        />
        <Filter
          tabIndex={5 + Object.keys(sortKeys).length}
          {...{
            filter,
            setFilter,
            clearFilter,
          }}
        />
        <div className="row">
          <div
            tabIndex={`${6 + Object.keys(sortKeys).length}`}
            className="headerButton"
            onClick={play}
            onKeyUp={(e) => {
              if (e.code === "Enter") {
                play(e);
              }
            }}
          >
            <ButtonSvg name="play" size={20} />
          </div>
          <div
            tabIndex={`${7 + Object.keys(sortKeys).length}`}
            className="headerButton"
            onClick={share}
            onKeyUp={(e) => {
              if (e.code === "Enter") {
                share(e);
              }
            }}
          >
            <ButtonSvg name="share" size={20} />
          </div>
          {status === "saved" || (
            <div
              tabIndex={`${8 + Object.keys(sortKeys).length}`}
              className="headerButton"
              onClick={switchLiked}
              onKeyUp={(e) => {
                if (e.code === "Enter") {
                  switchLiked();
                }
              }}
            >
              <ButtonSvg
                name={status === "liked" ? "heart-filled" : "heart-outline"}
                size={20}
              />
            </div>
          )}
        </div>
      </div>
    )
  );
}
