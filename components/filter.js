import ButtonSvg from "./buttonSvg";

export default function Filter({ filter, setFilter, clearFilter, tabIndex }) {
  return (
    <div
      className="filter"
      onClick={(e) => {
        e.target.firstChild.focus();
      }}
    >
      <input
        tabIndex={`${tabIndex}`}
        className="textInput"
        type="text"
        value={filter}
        onClick={(e) => {
          e.stopPropagation();
        }}
        onChange={(e) => setFilter(e.target.value)}
        placeholder={"Search"}
        onKeyUp={(e) => e.key === "Escape" && setFilter("")}
      />
      {filter && (
        <div
          tabIndex={`${tabIndex + 1}`}
          className="filterButton"
          onClick={(e) => {
            e.stopPropagation();
            clearFilter();
          }}
          onKeyUp={(e) => {
            if (e.code === "Enter") {
              clearFilter();
            }
          }}
        >
          <ButtonSvg name="close" size={20} />
        </div>
      )}
    </div>
  );
}
