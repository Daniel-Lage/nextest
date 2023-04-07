import { useState } from "react";

import Image from "next/image";

export default function Sorter({
  sortKeys,
  sortKey,
  setSortKey,
  reversed,
  setReversed,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sorter">
      <div
        className={"sorterOpener" + (open ? " open" : "")}
        onClick={() => setOpen((prev) => !prev)}
      >
        {sortKey}
      </div>
      <div
        className="sorterReverser"
        onClick={() => setReversed((prev) => !prev)}
      >
        {reversed ? (
          <Image src="/down.svg" alt="down" width={15} height={15} />
        ) : (
          <Image src="/up.svg" alt="up" width={15} height={15} />
        )}
      </div>

      <div className={"sorterMenu" + (open ? " open" : "")}>
        {Object.keys(sortKeys)
          .filter((value) => value !== sortKey)
          .map((value) => (
            <div
              key={value}
              className="sorterMenuItem"
              onClick={() => setSortKey(value)}
            >
              {value}
            </div>
          ))}
      </div>
    </div>
  );
}
