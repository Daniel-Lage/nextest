import loadTracks from "../server/loadTracks";
import parseCookies from "./parseCookies";
import shuffleArray from "./shuffleArray";

export default async function play(
  e,
  skip,
  playlist,
  limit = { type: "No Limit", value: 0 },
  firstTrack = null
) {
  e.stopPropagation();

  var { access_token, refresh_token } = parseCookies(document.cookie);

  if (refresh_token === undefined) {
    return {
      error: "missing_refresh_token",
    };
  }

  if (access_token === undefined) {
    return {
      error: "missing_access_token",
    };
  }

  const playerResponse = await fetch("https://api.spotify.com/v1/me/player", {
    headers: {
      Authorization: "Bearer " + access_token,
    },
  });

  if (playerResponse.status !== 200) {
    return {
      error: "device_not_found",
    };
  }

  var shuffledTracks;

  switch (typeof playlist) {
    case "object": {
      shuffledTracks = shuffleArray([...playlist]);
      break;
    }
    case "string": {
      const tracksResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${playlist}/tracks`,
        {
          headers: {
            Authorization: "Bearer " + access_token,
          },
        }
      );
      const tracksBody = await tracksResponse.json();

      shuffledTracks = shuffleArray([...(await loadTracks(tracksBody, []))]);
      break;
    }
  }

  const playerBody = await playerResponse.json();

  const deviceId = playerBody.device.id;

  var progress = 0;

  if (firstTrack) {
    shuffledTracks.splice(
      shuffledTracks.findIndex(
        (track) => track.track.uri === firstTrack.track.uri
      ),
      1
    );

    shuffledTracks.unshift(firstTrack);
  }

  if (skip || firstTrack) {
    // if first track is specified it needs to be added to queue before to account for varying delays on requests
    // if current track is to be skipped then there needs to be a track on queue
    firstTrack = shuffledTracks.shift();

    switch (limit.type) {
      case "Duration": {
        progress += firstTrack.track.duration_ms;
        break;
      }
      case "Tracks": {
        progress += 1;
        break;
      }
    }

    if (progress > limit.value) return {};

    await fetch(
      "https://api.spotify.com/v1/me/player/queue?" +
        new URLSearchParams({
          uri: firstTrack.track.uri,
          device_id: deviceId,
        }).toString(),
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }
    );
  }

  if (skip) {
    await fetch(
      "https://api.spotify.com/v1/me/player/next?" +
        new URLSearchParams({
          device_id: deviceId,
        }).toString(),
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + access_token,
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

    if (progress > limit.value) return {};

    fetch(
      "https://api.spotify.com/v1/me/player/queue?" +
        new URLSearchParams({
          uri: track.track.uri,
          device_id: deviceId,
        }).toString(),
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }
    );
  }
  return {};
}
