import Button from "./button";
import SVG from "./svg";

export default function Modal({ theme, message, clearMessage }) {
  return (
    <div className={"modal " + (theme || "loading")}>
      <div className="message">
        {message}
        <Button className="button largeCircle" action={clearMessage}>
          <SVG name="close" size={20} />
        </Button>
      </div>
    </div>
  );
}
