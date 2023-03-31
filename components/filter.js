import Image from "next/image";
import { useState } from "react";

export default function Filter({ filter, setFilter }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="filter">
      <input
        className="textInput"
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
        }}
        placeholder={"Search"}
        onKeyDown={(e) => e.key === "Escape" && setFilter("")}
      />
      <div
        className="filterButton"
        onClick={() => {
          setFilter("");
        }}
      >
        <Image src="/close.svg" alt="close" width={15} height={15} />
      </div>
    </div>
  );
}
