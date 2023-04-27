import styles from "@/styles/User.module.css";
import Sorter from "./sorter";
import Filter from "./filter";
import ButtonSvg from "./buttonSvg";

export default function UserDetails({
  self,
  user,
  sortKey,
  sortKeys,
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
              {user.followers.total} seguidores
              {self && following.length > 0 && (
                <span className={styles.following} onClick={goFollowing}>
                  {` - ${following.length} seguindo`}
                </span>
              )}
              {total > 0 && ` - ${total} playlists`}
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
            <div
              tabIndex={`${9 + Object.keys(sortKeys).length}`}
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
            {self || (
              <div
                tabIndex={`${8 + Object.keys(sortKeys).length}`}
                className="headerButton"
                onClick={switchFollowing}
                onKeyUp={(e) => {
                  if (e.code === "Enter") {
                    switchFollowing();
                  }
                }}
              >
                <ButtonSvg
                  name={following ? "heart-filled" : "heart-outline"}
                  size={20}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
}
