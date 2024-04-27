import styles from "@/styles/Playlist.module.css";
import Sorter from "./sorter";
import Filter from "./filter";
import { sortKeys } from "@/constants/trackSortKeys";
import Limiter from "./limiter";
import Button from "./button";
import SVG from "./svg";

export default function playlistSummary({
  playlist,
  sortKey,
  reverse,
  reversed,
  setSortKey,
  filter,
  setFilter,
  playDefault,
  clearFilter,
  share,
  limit,
  setLimit,
  skip,
  switchSkip,
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

        <Limiter
          {...{
            limit,
            setLimit,
          }}
        />
        <div className="switch" style={{ color: "black" }} onClick={switchSkip}>
          {skip ? "Play" : "Add to Queue"}
        </div>
        <Filter
          tabIndex={5 + Object.keys(sortKeys).length}
          {...{
            filter,
            setFilter,
            clearFilter,
          }}
        />

        <div className="row">
          <Button className="button largeCircle" action={playDefault}>
            <SVG name="play" size={20} />
          </Button>

          <Button className="button largeCircle" action={share}>
            <SVG name="share" size={20} />
          </Button>
        </div>
      </div>
    )
  );
}
