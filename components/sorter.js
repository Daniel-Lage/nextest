import ButtonSvg from "./buttonSvg";
import Select from "./select";

export default function Sorter({
  tabIndex,
  sortKey,
  reverse,
  reversed,
  sortKeys,
  setSortKey,
}) {
  return (
    <div tabIndex="0" className="sorter">
      <Select
        onChange={(e) => {
          setSortKey(e.target.value);
        }}
        value={sortKey}
        options={Object.keys(sortKeys)}
      />
      <div
        tabIndex={`${tabIndex + Object.keys(sortKeys).length}`}
        onClick={reverse}
        onKeyUp={(e) => {
          if (e.code === "Enter") {
            reverse();
          }
        }}
        onFocus={() => setOpen(false)}
        className="sorterReverser"
      >
        <ButtonSvg name={reversed ? "down" : "up"} size={19} />
      </div>
    </div>
  );
}
