import Image from "next/image";

export default function Filter({ filter, setFilter }) {
  return (
    <div className="filter">
      <input
        className="textInput"
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
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
