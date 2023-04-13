import { useEffect } from "react";

import { useRouter } from "next/router";
import Head from "next/head";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const { code } = router.query;
    if (code) {
      fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        body: new URLSearchParams({
          code: code,
          redirect_uri: location.origin + "/callback",
          grant_type: "authorization_code",
        }).toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic ZWQxMjMyODcxMTMzNDVjNDkzMzhkMWNmMjBiZWM5MGU6NjE2Mzg1ZjJlYzNkNGQ2M2E3OWJkMWIxZGZhM2M4MGM=",
        },
      })
        .then((response) => response.json())
        .then((body) => {
          if (body.error) {
            console.error(body.error.message);
          } else {
            localStorage.accessToken = body.access_token;
            localStorage.refreshToken = body.refresh_token;
            localStorage.saved = "{}";
            localStorage.liked = "{}";
            localStorage.loaded = "{}";
            localStorage.sortPlaylistsKey = "Author";
            localStorage.reversedPlaylists = "false";
            localStorage.sortTracksKey = "Date";
            localStorage.reversedTracks = "false";
            localStorage.userId = "";
            localStorage.expiresAt = (
              body.expires_in * 1000 +
              new Date().getTime()
            ).toString();
          }
          router.replace("/home");
        });
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Loading... - Spotify Helper 2.0</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container">
        <div className="body"></div>
      </div>
    </>
  );
}
