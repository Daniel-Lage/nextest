import Image from "next/image";

export default function SVG({ name, size }) {
  return (
    <Image src={"/" + name + ".svg"} alt={name} width={size} height={size} />
  );
}
