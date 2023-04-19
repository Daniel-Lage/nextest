import Image from "next/image";

export default function ButtonSvg({ name, size }) {
  return (
    <Image src={"/" + name + ".svg"} alt={name} width={size} height={size} />
  );
}
