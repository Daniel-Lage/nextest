export default function Select({ onChange, value, options }) {
  return (
    <select onChange={onChange} className="select" value={value}>
      {options.map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </select>
  );
}
