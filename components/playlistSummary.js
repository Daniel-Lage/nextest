import styles from "@/styles/Playlist.module.css";
import Sorter from "./sorter";
import Filter from "./filter";
import ButtonSvg from "./buttonSvg";
import { sortKeys } from "@/constants/trackSortKeys";

export default function playlistSummary({
  playlist,
  sortKey,
  reverse,
  reversed,
  setSortKey,
  filter,
  setFilter,
  playDefault,
  status,
  switchLiked,
  clearFilter,
  share,
}) {
  return (
    playlist && (
      <div className="subheader">
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
            onClick={playDefault}
            onKeyUp={(e) => {
              if (e.code === "Enter") {
                playDefault(e);
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
