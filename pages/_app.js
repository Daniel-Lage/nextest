import { Montserrat } from "next/font/google";

import "@/styles/globals.css";

const font = Montserrat({ subsets: ["latin"] });

export default function App({ Component, pageProps }) {
  return (
    <div className={font.className}>
      <Component {...pageProps} />
    </div>
  );
}
