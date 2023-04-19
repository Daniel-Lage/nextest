import styles from "@/styles/Playlist.module.css";

import Filter from "./filter";
import Sorter from "./sorter";
import ButtonSvg from "./buttonSvg";

export default function Playlist({
  playlist,
  sortKey,
  sortKeys,
  reverse,
  open,
  reversed,
  setSortKey,
  filter,
  setFilter,
  play,
  status,
  switchLiked,
  vertical,
}) {
  function clearFilter() {
    setFilter("");
  }

  function share() {
    navigator.clipboard.writeText(location);
    e.target.blur();
    setMessage("Adicionado a área de transferência");
  }

  return (
    <div className="subheader">
      {playlist && (
        <>
          <img
            src={playlist.images[0].url}
            alt={playlist.name + " image"}
            className={styles.image}
          />
          <div
            className={styles.details + (vertical ? " " + styles.vertical : "")}
          >
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
              {status === "saved" || (
                <div
                  tabIndex={`${7 + Object.keys(sortKeys).length}`}
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
              <div
                tabIndex={`${8 + Object.keys(sortKeys).length}`}
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
            </div>
          </div>
        </>
      )}
    </div>
  );
}
