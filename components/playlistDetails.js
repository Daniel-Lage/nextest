import styles from "@/styles/Playlist.module.css";

import Filter from "./filter";
import Sorter from "./sorter";
import { sortKeys } from "@/constants/trackSortKeys";
import Limiter from "./limiter";
import Button from "./button";
import SVG from "./svg";

export default function PlaylistDetails({
  playlist,
  sortKey,
  reverse,
  open,
  reversed,
  setSortKey,
  filter,
  setFilter,
  playDefault,
  status,
  switchLiked,
  clearFilter,
  share,
  limit,
  setLimit,
  skip,
  switchSkip,
}) {
  return (
    playlist && (
      <div className={styles.subheader}>
        <img
          src={playlist.images[0].url}
          alt={playlist.name + " image"}
          className={styles.image}
        />
        <div className={styles.details}>
          <div className={styles.title}>{playlist.name}</div>
          {playlist.description && (
            <div className={styles.subtitle}>{playlist.description}</div>
          )}
          <div className={styles.subtitle}>
            <span
              tabIndex={"3"}
              className={styles.owner}
              onClick={open}
              onKeyUp={(e) => {
                if (e.code === "Enter") {
                  open();
                }
              }}
            >
              {playlist.owner.display_name}
            </span>
            - {playlist.tracks.total} músicas
          </div>
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

          <div
            className="switch"
            style={{ color: "black" }}
            onClick={switchSkip}
          >
            {skip ? "Play" : "Add to Queue"}
          </div>

          <div className="row">
            <Filter
              tabIndex={5 + Object.keys(sortKeys).length}
              {...{
                filter,
                setFilter,
                clearFilter,
              }}
            />

            <Button className="button largeCircle" action={playDefault}>
              <SVG name="play" size={20} />
            </Button>

            <Button className="button largeCircle" action={share}>
              <SVG name="share" size={20} />
            </Button>

            {status === "saved" || (
              <Button className="button largeCircle" action={switchLiked}>
                <SVG
                  name={status === "liked" ? "heart-filled" : "heart-outline"}
                  size={20}
                />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  );
}
