export default async function getAccessToken(refresh_token) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: new URLSearchParams({
      refresh_token,
      grant_type: "refresh_token",
    }).toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${process.env.CLIENT_CODE}`,
    },
  });

  const body = await response.json();

  if (body.error) {
    console.error(body.error.message);
  } else {
    return body.access_token;
  }
}
