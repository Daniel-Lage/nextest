import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Callback({ error }) {
  const router = useRouter();

  useEffect(() => {
    if (error !== undefined) console.error(error);

    localStorage.liked = "{}";
    localStorage.loaded = "{}";
    localStorage.following = "{}";
    localStorage.sortPlaylistsKey = "Criador";
    localStorage.reversedPlaylists = false;
    localStorage.sortTracksKey = "Data";
    localStorage.reversedTracks = false;
    localStorage.sortFollowingKey = "Nome";
    localStorage.reversedFollowing = false;

    router.replace("/home");
  }, []);

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

export async function getServerSideProps({
  query: { code },
  req: {
    headers: { referer },
  },
  res: { setHeader },
}) {
  if (!code) {
    console.error("Missing authorization code");
    return { props: {} };
  }

  const domain = new URL(referer).origin;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: new URLSearchParams({
      code,
      redirect_uri: domain + "/callback",
      grant_type: "authorization_code",
    }).toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${process.env.CLIENT_CODE}`,
    },
  });

  const result = await response.json();

  if (result.error) {
    return { props: { error: result.error_description } };
  }

  const { access_token, refresh_token } = result;

  const now = new Date();
  const time = now.getTime();

  const accessTokenExpirationDate = new Date(time + 3600000); // expires in an hour
  const refreshTokenExpirationDate = new Date(time + 34560000000); // expires in 400 days

  setHeader("Set-Cookie", [
    `access_token=${access_token};expires=${accessTokenExpirationDate.toUTCString()}`,
    `refresh_token=${refresh_token};expires=${refreshTokenExpirationDate.toUTCString()}`,
  ]);

  return { props: {} };
}
