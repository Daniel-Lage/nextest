import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
import Header from "@/components/header";
import { localStorageKeys } from "@/constants/localStorageKeys";

const themes = ["blue", "pink", "lime", "mono"];

export default function Start() {
  const [params, setParams] = useState();

  const [theme, setTheme] = useState();

  const router = useRouter();

  useEffect(() => {
    if (localStorageKeys.every((value) => localStorage[value] !== undefined)) {
      router.replace("/home");
    } else {
      if (themes.some((t) => t === localStorage.theme)) {
        setTheme(localStorage.theme);
      } else {
        setTheme("blue");
      }

      setParams(
        new URLSearchParams({
          response_type: "code",
          client_id: "ed123287113345c49338d1cf20bec90e",
          scope: [
            "playlist-read-private",
            "playlist-read-collaborative",
            "user-read-playback-state",
            "user-modify-playback-state",
            "user-read-private",
            "user-read-email",
          ].join(" "),
          redirect_uri: location.origin + "/callback",
        }).toString()
      );
    }
  }, [router]);

  useEffect(() => {
    if (theme) localStorage.theme = theme;
  }, [theme]);

  return (
    <>
      <Head>
        <title>Spotify Helper</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={["container ", theme || "loading"].join(" ")}>
        <div className="before">
          <Header start {...{ theme, setTheme, headerHidden: false }} />
        </div>
        <div className="body">
          <a
            tabIndex="1"
            className="button loginButton"
            href={"https://accounts.spotify.com/authorize?" + params}
          >
            <Image src="/login.svg" alt="login" width={40} height={40} />
            Enter with Spotify
          </a>
        </div>
      </div>
    </>
  );
}
