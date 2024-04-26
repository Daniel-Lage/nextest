import { useEffect, useState } from "react";
import Button from "./button";
import SVG from "./svg";

const themes = ["blue", "pink", "lime", "mono"];

export default function ColorPicker({ theme, setTheme, headerHidden }) {
  const [open, setOpen] = useState();

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
      className="right"
      tabIndex="0"
      onBlur={(e) => setOpen(e.currentTarget.contains(e.relatedTarget))}
    >
      <Button className="button largeCircle" action={OpenClose}>
        <SVG name="ellipsis" size={20} />
      </Button>
      <div
        className={
          "colorPicker" + (headerHidden ? " hidden" : open ? " open" : "")
        }
      >
        {themes
          .filter((t) => t !== theme)
          .map((theme, index) => (
            <Button
              key={index}
              className={`button largeCircle ${theme}`}
              action={() => setTheme(theme)}
            />
          ))}
      </div>
    </div>
  );
}
