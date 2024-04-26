import styles from "@/styles/User.module.css";
import Sorter from "./sorter";
import Filter from "./filter";
import { sortKeys } from "@/constants/playlistSortKeys";
import Button from "./button";
import SVG from "./svg";

export default function UserSummary({
  self,
  user,
  sortKey,
  reverse,
  reversed,
  setSortKey,
  filter,
  setFilter,
  share,
  following,
  switchFollowing,
}) {
  function clearFilter() {
    setFilter("");
  }

  return (
    user && (
      <div className="subheader">
        <>
          <div className={styles.title}>{user.display_name}</div>
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
    )
  );
}
