export default function getAccessToken(Function) {
  if (parseInt(localStorage.expiresAt) < new Date().getTime()) {
    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: new URLSearchParams({
        refresh_token: localStorage.refreshToken,
        grant_type: "refresh_token",
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
          return console.error(body.error_description);
        }

        localStorage.accessToken = body.access_token;
        localStorage.refreshToken = body.refresh_token;
        localStorage.expiresAt = (3000000 + new Date().getTime()).toString();

        Function(localStorage.accessToken);
      })
      .catch((reason) => {
        console.error(reason);
      });
  } else {
    Function(localStorage.accessToken);
  }
}
