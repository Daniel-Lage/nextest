import ButtonSvg from "./buttonSvg";

export default function Modal({ theme, message, clearError }) {
  return (
    <div className={"modal " + (theme || "loading")}>
      <div className="message">
        {message}
        <div
          tabIndex="0"
          className="headerButton"
          onClick={clearError}
          onKeyUp={(e) => {
            if (e.code === "Enter") {
              clearError();
            }
          }}
        >
          <ButtonSvg name="close" size={25} />
        </div>
      </div>
    </div>
  );
}
