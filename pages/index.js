import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";

const themes = ["blue", "pink", "lime", "mono"];

export default function Home() {
  const [params, setParams] = useState();

  const [vertical, setVertical] = useState();
  const [theme, setTheme] = useState();

  const [open, setOpen] = useState(false);
  const menu = useRef();

  const router = useRouter();

  useEffect(() => {
    if (localStorage.refreshToken) {
      router.replace("/home");
    } else {
      if (themes.some((t) => t === localStorage.theme)) {
        setTheme(localStorage.theme);
      } else {
        setTheme("blue");
      }

      setVertical(innerHeight > innerWidth);

      onresize = (e) => {
        setVertical(innerHeight > innerWidth);
      };

      setParams(
        new URLSearchParams({
          response_type: "code",
          client_id: "ed123287113345c49338d1cf20bec90e",
          scope: [
            "user-read-playback-state",
            "user-modify-playback-state",
            "user-read-private",
          ].join(" "),
          redirect_uri: location.origin + "/callback",
        }).toString()
      );
    }
  }, [router]);

  useEffect(() => {
    menu.current.style.height = open ? "60px" : "0px";
  }, [open]);

  useEffect(() => {
    if (theme) localStorage.theme = theme;
  }, [theme]);

  return (
    <>
      <Head>
        <title>Spotify Helper 2.0</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={"container " + (theme || "loading")}>
        <div className="header">
          <div className="center">
            <div className="title">Spotify Helper</div>
          </div>
          <div className="right">
            <div className="button" onClick={() => setOpen((prev) => !prev)}>
              {vertical ? (
                <Image
                  src="/ellipsis.svg"
                  alt="ellipsis"
                  width={25}
                  height={25}
                />
              ) : (
                <Image
                  src="/ellipsis.svg"
                  alt="ellipsis"
                  width={40}
                  height={40}
                />
              )}
            </div>
          </div>
          <div className="menu" ref={menu}>
            {themes
              .filter((t) => t !== theme)
              .map((theme) => (
                <div
                  className={"circle " + theme}
                  key={theme}
                  onClick={() => {
                    setTheme(theme);
                  }}
                ></div>
              ))}
          </div>
        </div>
        <div className="body">
          <a
            className="button"
            href={"https://accounts.spotify.com/authorize?" + params}
          >
            <Image src="/login.svg" alt="login" width={40} height={40} />
            <div>Enter with Spotify</div>
          </a>
        </div>
      </div>
    </>
  );
}
