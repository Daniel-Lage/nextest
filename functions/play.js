import getAccessToken from "./getAccessToken";
import shuffleArray from "./shuffleArray";

export default async function play(
  e,
  setMessage,
  tracks,
  skip,
  limit = null,
  firstTrack = null
) {
  e.stopPropagation();

  const accessToken = await getAccessToken();

  const playerResponse = await fetch("https://api.spotify.com/v1/me/player", {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });

  if (playerResponse.status !== 200) return;

  const playerBody = await playerResponse.json();

  if (playerBody === undefined) {
    e.target.blur();
    return setMessage("Não encontrou dispositivo spotify ativo");
  }

  const shuffledTracks = shuffleArray([...tracks]);

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
