import { useRef, useState } from "react";
import ButtonSvg from "./buttonSvg";

export default function Sorter({
  tabIndex,
  sortKey,
  reverse,
  reversed,
  sortKeys,
  setSortKey,
}) {
  const [open, setOpen] = useState(false);
  const sorter = useRef();

  function OpenClose() {
    setOpen((prev) => !prev);
  }

  return (
    <div className="row">
      <div
        tabIndex="0"
        className="sorter"
        onBlur={(e) => setOpen(e.currentTarget.contains(e.relatedTarget))}
      >
        <div
          tabIndex={`${tabIndex}`}
          ref={sorter}
          className={"sorterOpener" + (open ? " open" : "")}
          onClick={OpenClose}
          onKeyUp={(e) => {
            if (e.code === "Enter") {
              OpenClose();
            }
          }}
        >
          {sortKey}
        </div>
        <div className={"sorterMenu" + (open ? " open" : "")}>
          {Object.keys(sortKeys)
            .filter((value) => value !== sortKey)
            .map((value, index) => (
              <div
                tabIndex={open ? `${tabIndex + index + 1}` : null}
                key={value}
                className="sorterMenuItem"
                onClick={() => {
                  sorter.current.focus();
                  setSortKey(value);
                }}
                onKeyUp={(e) => {
                  if (e.code === "Enter") {
                    setSortKey(value);
                  }
                }}
              >
                {value}
              </div>
            ))}
        </div>
        <div
          tabIndex={`${tabIndex + Object.keys(sortKeys).length}`}
          onClick={reverse}
          onKeyUp={(e) => {
            if (e.code === "Enter") {
              reverse();
            }
          }}
          onFocus={() => setOpen(false)}
        >
          <ButtonSvg name={reversed ? "down" : "up"} size={19} />
        </div>
      </div>
    </div>
  );
}
