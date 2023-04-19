import styles from "@/styles/User.module.css";
import Sorter from "./sorter";
import Filter from "./filter";
import ButtonSvg from "./buttonSvg";

export default function User({
  user,
  sortKey,
  sortKeys,
  reverse,
  reversed,
  setSortKey,
  filter,
  setFilter,
}) {
  function clearFilter() {
    setFilter("");
  }

  function share(e) {
    navigator.clipboard.writeText(location.origin + "/user/" + userId);
    e.target.blur();
    setMessage("Adicionado a área de transferência");
  }

  return (
    <div className="subheader">
      {user && (
        <img
          src={user.images[0].url}
          alt={user.display_name}
          className={styles.image}
        />
      )}
      <div className={styles.details}>
        {user && (
          <div className={styles.details}>
            <div className={styles.title}>{user.display_name}</div>
            <div className={styles.subtitle}>
              {user.followers.total} seguidores
            </div>
          </div>
        )}
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
      </div>
    </div>
  );
}
