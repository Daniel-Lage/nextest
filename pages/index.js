import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
import Header from "@/components/header";

const themes = ["blue", "pink", "lime", "mono"];

export default function Start() {
  const [params, setParams] = useState();

  const [theme, setTheme] = useState();

  const router = useRouter();

  useEffect(() => {
    if (
      [
        "accessToken",
        "refreshToken",
        "saved",
        "liked",
        "loaded",
        "sortPlaylistsKey",
        "reversedPlaylists",
        "sortTracksKey",
        "reversedTracks",
        "user",
      ].every((value) => localStorage[value] !== undefined)
    ) {
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
            className="button"
            href={"https://accounts.spotify.com/authorize?" + params}
          >
            <Image src="/login.svg" alt="login" width={40} height={40} />
            <div style={{ color: "black" }}>Enter with Spotify</div>
          </a>
        </div>
      </div>
    </>
  );
}
