import ButtonSvg from "./buttonSvg";

export default function Modal({ theme, message, clearMessage }) {
  return (
    <div className={"modal " + (theme || "loading")}>
      <div className="message">
        {message}
        <div
          tabIndex="0"
          className="headerButton"
          onClick={clearMessage}
          onKeyUp={(e) => {
            if (e.code === "Enter") {
              clearMessage();
            }
          }}
        >
          <ButtonSvg name="close" size={20} />
        </div>
      </div>
    </div>
  );
}
