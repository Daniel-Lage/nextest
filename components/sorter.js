import Select from "./select";
import Button from "./button";
import SVG from "./svg";

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
      <Button className="button smallCircle" action={reverse}>
        <SVG name={reversed ? "down" : "up"} size={19} />
      </Button>
    </div>
  );
}
