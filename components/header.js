import Image from "next/image";
import ColorPicker from "./colorPicker";
import Button from "./button";
import SVG from "./svg";

export default function Header({
  start,
  home,
  exit,
  theme,
  setTheme,
  headerHidden,
}) {
  return (
    <div className={"header" + (headerHidden ? " hidden" : "")}>
      {start || (
        <div className="left">
          <Button className={"button largeCircle"} action={exit}>
            <SVG name={home ? "logout" : "home"} size={20} />
          </Button>
        </div>
      )}

      <div className="center">
        <Image
          src="/favicon.ico"
          alt="favicon"
          width={40}
          height={40}
          className="logo"
        />
        <div className="title">
          <div>Spotify</div>
          <div>Helper</div>
        </div>
      </div>

      <ColorPicker {...{ theme, setTheme, headerHidden }} />
    </div>
  );
}
