import Button from "./button";
import SVG from "./svg";

export default function Filter({ filter, setFilter, clearFilter, tabIndex }) {
  return (
    <div className="filter">
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
        <Button className="smallCircle clearButton" action={clearFilter}>
          <SVG name="close" size={20} />
        </Button>
      )}
    </div>
  );
}
