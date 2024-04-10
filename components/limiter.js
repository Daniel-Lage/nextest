import Select from "./select";

export default function Limiter({ limit, setLimit }) {
  console.log(limit);
  return (
    <div tabIndex="0" className="sorter">
      <Select
        onChange={(e) => {
          setLimit({ type: e.target.value, value: 0 });
        }}
        value={limit.type}
        options={["None", "Duration", "Tracks"]}
      />
      <LimitValueInput {...{ limit, setLimit }} />
    </div>
  );
}

function LimitValueInput({ limit, setLimit }) {
  switch (limit.type) {
    case "Duration":
      return (
        <input
          type="number"
          min="0"
          value={limit.value}
          onChange={(e) => {
            setLimit({ type: limit.type, value: e.target.value });
          }}
        />
      );
  }
}
