import Select from "./select";

export default function Limiter({ limit, setLimit }) {
  console.log(limit);
  return (
    <div tabIndex="0" className="limiter">
      <Select
        onChange={(e) => {
          setLimit({ type: e.target.value, value: 0 });
        }}
        value={limit.type}
        options={["No Limit", "Duration", "Tracks"]}
      />
      <LimitValueInput {...{ limit, setLimit }} />
    </div>
  );
}

function LimitValueInput({ limit, setLimit }) {
  switch (limit.type) {
    case "Duration":
      return (
        <>
          <input
            type="number"
            min={0}
            max={59}
            value={Math.floor(limit.value / 60000)}
            onChange={(e) => {
              setLimit((prev) => ({
                ...prev,
                value: (limit.value % 60000) + e.target.value * 60000,
              }));
            }}
          />
          :
          <input
            type="number"
            min={0}
            max={59}
            value={(limit.value % 60000) / 1000}
            onChange={(e) => {
              setLimit((prev) => ({
                ...prev,
                value:
                  Math.floor(limit.value / 60000) * 60000 +
                  e.target.value * 1000,
              }));
            }}
          />
        </>
      );
    case "Tracks":
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
