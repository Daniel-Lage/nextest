import styles from "@/styles/User.module.css";
import Sorter from "./sorter";
import Filter from "./filter";
import { sortKeys } from "@/constants/playlistSortKeys";
import Button from "./button";
import SVG from "./svg";

export default function UserDetails({
  self,
  user,
  sortKey,
  reverse,
  reversed,
  setSortKey,
  filter,
  setFilter,
  total,
  share,
  following,
  switchFollowing,
  goFollowing,
}) {
  function clearFilter() {
    setFilter("");
  }

  return (
    user && (
      <div className="subheader">
        <img
          src={user.images[0].url}
          alt={user.display_name}
          className={styles.image}
        />

        <div className={styles.details}>
          <>
            <div className={styles.title}>{user.display_name}</div>
            <div className={styles.subtitle}>
              <span>{user.followers.total} seguidores</span>
              {self && following.length > 0 && (
                <span className={styles.following} onClick={goFollowing}>
                  {`${following.length} seguindo`}
                </span>
              )}
              <span>{total > 0 && `${total} playlists`}</span>
            </div>
          </>

          <Sorter
            tabIndex={6}
            {...{
              sortKey,
              reverse,
              reversed,
              sortKeys,
              setSortKey,
            }}
          />

          <div className="row">
            <Filter
              tabIndex={7 + Object.keys(sortKeys).length}
              {...{
                filter,
                setFilter,
                clearFilter,
              }}
            />

            <Button className="button smallCircle" action={share}>
              <SVG name="share" size={15} />
            </Button>

            {self || (
              <Button className="button smallCircle" action={switchFollowing}>
                <SVG
                  name={following ? "heart-filled" : "heart-outline"}
                  size={15}
                />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  );
}
