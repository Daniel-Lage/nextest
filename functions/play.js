import getAccessToken from "./getAccessToken";
import shuffleArray from "./shuffleArray";

export default async function play(
  e,
  setMessage,
  tracks,
  skip,
  cap = null,
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

  // adds first track to queue
  const track = shuffledTracks.pop();

  // code that is dumb :) fix later pls

  if (cap) {
    if ((cap.type = "duration")) {
      if (track.track.duration_ms > cap.duration_ms) return;
    }
  }

  var totalDuration_ms = track.track.duration_ms;

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

  // skips currently playing song (to play the track that was added to queue)
  if (skip)
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

  for (const track of shuffledTracks) {
    totalDuration_ms += track.track.duration_ms;

    if (cap) {
      if ((cap.type = "duration")) {
        if (totalDuration_ms > cap.duration_ms) return;
      }
    }

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
  }
}
