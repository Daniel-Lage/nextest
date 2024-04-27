import SVG from "./svg";

export default function Switch({ onClick, state, symbols }) {
  return (
    <div className="switch" style={{ color: "black" }} onClick={onClick}>
      <div
        className="button largeCircle"
        style={{ marginLeft: state ? -5 : 35 }}
      >
        <div className="flipperSymbol" style={{ opacity: state ? 1 : 0 }}>
          <SVG name={symbols[0]} size={25} />
        </div>
        <div className="flipperSymbol" style={{ opacity: state ? 0 : 1 }}>
          <SVG name={symbols[1]} size={25} />
        </div>
      </div>
    </div>
  );
}
