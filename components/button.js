export default function Button({ className, action, children }) {
  return (
    <div
      className={className}
      onClick={action}
      onKeyUp={(e) => {
        if (e.code === "Enter") {
          action(e);
        }
      }}
    >
      {children}
    </div>
  );
}
