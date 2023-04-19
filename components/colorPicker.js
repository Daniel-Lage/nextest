import { useEffect, useRef, useState } from "react";
import ButtonSvg from "./buttonSvg";

const themes = ["blue", "pink", "lime", "mono"];

export default function ColorPicker({ theme, setTheme }) {
  const [open, setOpen] = useState();
  const filter = useRef();

  useEffect(() => {
    if (themes.some((t) => t === localStorage.theme)) {
      setTheme(localStorage.theme);
    } else {
      setTheme("blue");
    }
  }, []);

  function OpenClose() {
    setOpen((prev) => !prev);
  }

  return (
    <div
      tabIndex="0"
      onBlur={(e) => setOpen(e.currentTarget.contains(e.relatedTarget))}
    >
      <div
        tabIndex="2"
        className="headerButton"
        ref={filter}
        onClick={OpenClose}
        onKeyUp={(e) => {
          if (e.code === "Enter") {
            OpenClose();
          }
        }}
      >
        <ButtonSvg name="ellipsis" size={20} />
      </div>
      <div className={"colorPicker" + (open ? " open" : "")}>
        {themes
          .filter((t) => t !== theme)
          .map((theme, index) => (
            <div
              tabIndex={open ? `${3 + index}` : null}
              className={"circle " + theme}
              key={theme}
              onClick={() => {
                filter.current.focus();
                setTheme(theme);
              }}
              onKeyUp={(e) => {
                if (e.code === "Enter") {
                  setTheme(theme);
                }
              }}
            ></div>
          ))}
      </div>
    </div>
  );
}
