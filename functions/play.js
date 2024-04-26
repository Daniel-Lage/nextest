import getAccessToken from "./getAccessToken";
import loadTracks from "./loadTracks";
import shuffleArray from "./shuffleArray";

export default async function play(
  e,
  setMessage,
  skip,
  playlist,
  limit = { type: "No Limit", value: 0 },
  firstTrack = null
) {
  e.stopPropagation();

  const accessToken = await getAccessToken();

  const playerResponse = await fetch("https://api.spotify.com/v1/me/player", {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });

  if (playerResponse.status !== 200) {
    setMessage("Não encontrou dispositivo spotify ativo");
    e.target.blur();
    return;
  }

  var shuffledTracks;

  switch (typeof playlist) {
    case "object": {
      console.log("de dentro");
      shuffledTracks = shuffleArray([...playlist]);
      break;
    }
    case "string": {
      const tracksResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${playlist}/tracks`,
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      );
      const tracksBody = await tracksResponse.json();

      shuffledTracks = shuffleArray([...(await loadTracks(tracksBody, []))]);
      break;
    }
    default: {
      return;
    }
  }

  const playerBody = await playerResponse.json();

  const deviceId = playerBody.device.id;

  if (firstTrack) {
    shuffledTracks.splice(
      shuffledTracks.findIndex(
        (track) => track.track.uri === firstTrack.track.uri
      ),
      1
    );
    shuffledTracks.push(firstTrack);
  }

  var progress = 0;

  if (skip) {
    const track = shuffledTracks.pop();

    switch (limit.type) {
      case "Duration": {
        progress += track.track.duration_ms;
        break;
      }
      case "Tracks": {
        progress += 1;
        break;
      }
    }

    if (progress > limit.value) return;

    await fetch(
      "https://api.spotify.com/v1/me/player/queue?" +
        new URLSearchParams({
          uri: track.track.uri,
          device_id: deviceId,
        }).toString(),
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );

    await fetch(
      "https://api.spotify.com/v1/me/player/next?" +
        new URLSearchParams({
          device_id: deviceId,
        }).toString(),
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );
  }

  for (const track of shuffledTracks) {
    switch (limit.type) {
      case "Duration": {
        progress += track.track.duration_ms;
        break;
      }
      case "Tracks": {
        progress += 1;
        break;
      }
    }

    if (progress > limit.value) return;

    fetch(
      "https://api.spotify.com/v1/me/player/queue?" +
        new URLSearchParams({
          uri: track.track.uri,
          device_id: deviceId,
        }).toString(),
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );
  }
}
