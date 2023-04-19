import Image from "next/image";
import ButtonSvg from "./buttonSvg";
import ColorPicker from "./colorPicker";

export default function Header({ home, exit, theme, setTheme }) {
  return (
    <div className="header">
      <div className="left">
        <div
          tabIndex="1"
          className="headerButton"
          onClick={exit}
          onKeyUp={(e) => {
            if (e.code === "Enter") {
              exit();
            }
          }}
        >
          <ButtonSvg name={home ? "logout" : "home"} size={20} />
        </div>
      </div>

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

      <div className="right">
        <ColorPicker {...{ theme, setTheme }} />
      </div>
    </div>
  );
}
