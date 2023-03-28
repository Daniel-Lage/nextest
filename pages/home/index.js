import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";

import getAccessToken from "@/functions/getAccessToken";
import styles from "@/styles/Home.module.css";
import Playlist from "@/components/playlist";

const themes = ["blue", "pink", "lime", "mono"];

async function loadPlaylists({ next, items }, temp) {
  temp = [...temp, ...items];

  if (next) {
    const response = await fetch(next, {
      headers: {
        Authorization: "Bearer " + localStorage.accessToken,
      },
    });
    const body = await response.json();
    return await loadPlaylists(body, temp);
  } else {
    return temp;
  }
}

export default function Home() {
  const [playlists, setPlaylists] = useState();

  const [vertical, setVertical] = useState();
  const [theme, setTheme] = useState();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const menu = useRef();
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.accessToken) router.replace("/");
    else {
      if (themes.some((t) => t === localStorage.theme)) {
        setTheme(localStorage.theme);
      } else {
        setTheme("blue");
      }

      setVertical(innerHeight > innerWidth);

      onresize = (e) => {
        setVertical(innerHeight > innerWidth);
      };

      setPlaylists(
        localStorage.playlists && JSON.parse(localStorage.playlists)
      );

      getAccessToken((accessToken) => {
        fetch("https://api.spotify.com/v1/me/playlists", {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        })
          .then((response) => response.json())
          .then((body) => {
            if (body.error) {
              console.error(body.error_description);
            } else {
              loadPlaylists(body, []).then((playlists) => {
                setPlaylists(playlists);
                localStorage.playlists = JSON.stringify(playlists);
              });
            }
          });
      });
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
        <title>Página Inicial - Spotify Helper 2.0</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {message && (
        <div className="modal">
          <div className="message">
            {message}
            <div
              className="button"
              onClick={() => {
                setMessage("");
              }}
            >
              <Image src="/close.svg" alt="close" width={25} height={25} />
            </div>
          </div>
        </div>
      )}
      <div
        className={"container " + (theme || "loading")}
        style={
          message
            ? {
                filter: "blur(8px)",
                pointerEvents: "none",
              }
            : {}
        }
      >
        <div className="header">
          <div className="left">
            <div
              className="button"
              onClick={() => {
                const theme = localStorage.theme;
                localStorage.clear();
                localStorage.theme = theme;
                router.replace("/");
              }}
            >
              {vertical ? (
                <Image src="/logout.svg" alt="logout" width={25} height={25} />
              ) : (
                <Image src="/logout.svg" alt="logout" width={40} height={40} />
              )}
            </div>
          </div>
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
        <div className={styles.body}>
          {playlists?.map((playlist) => (
            <Playlist
              playlist={playlist}
              key={playlist.id}
              setMessage={setMessage}
              vertical={vertical}
            />
          ))}
        </div>
      </div>
    </>
  );
}
