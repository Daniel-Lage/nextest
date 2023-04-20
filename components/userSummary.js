import styles from "@/styles/User.module.css";
import Sorter from "./sorter";
import Filter from "./filter";
import ButtonSvg from "./buttonSvg";

export default function UserSummary({
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
    user && (
      <div className={styles.subheader}>
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
            className="subheaderButton"
            onClick={share}
            onKeyUp={(e) => {
              if (e.code === "Enter") {
                share(e);
              }
            }}
          >
            <ButtonSvg name="share" size={15} />
          </div>
        </div>
      </div>
    )
  );
}
