import { useEffect } from "react";

import { useRouter } from "next/router";
import Head from "next/head";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const { code } = router.query;

    async function fetchData() {
      const tokenResponse = await fetch(
        "https://accounts.spotify.com/api/token",
        {
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
        }
      );

      const tokenBody = await tokenResponse.json();

      if (tokenBody.error) {
        console.error(tokenBody.error.message);
      } else {
        localStorage.accessToken = tokenBody.access_token;
        localStorage.refreshToken = tokenBody.refresh_token;
        localStorage.saved = "{}";
        localStorage.liked = "{}";
        localStorage.loaded = "{}";
        localStorage.following = "{}";
        localStorage.sortPlaylistsKey = "Criador";
        localStorage.reversedPlaylists = false;
        localStorage.sortTracksKey = "Data";
        localStorage.reversedTracks = false;
        localStorage.sortFollowingKey = "Nome";
        localStorage.reversedFollowing = false;
        localStorage.user = null;
        localStorage.expiresAt = (
          tokenBody.expires_in * 1000 +
          new Date().getTime()
        ).toString();
      }
      router.replace("/home");
    }

    if (code) fetchData();
  }, [router]);

  return (
    <>
      <Head>
        <title>Loading... - Spotify Helper</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container">
        <div className="body"></div>
      </div>
    </>
  );
}
