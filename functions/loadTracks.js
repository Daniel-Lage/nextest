const batchSize = 100;
export default async function loadTracks(tracks) {
  var temp = [...tracks.items];

  if (tracks.next) {
    const url = new URL(tracks.next);
    const baseURL = url.origin + url.pathname;
    const requests = [];

    for (let offset = batchSize; offset < tracks.total; offset += batchSize) {
      requests.push(
        fetch(baseURL + "?limit=" + batchSize + "&offset=" + offset, {
          headers: {
            Authorization: "Bearer " + localStorage.accessToken,
          },
        })
      );
    }

    const responses = await Promise.all(requests);

    const bodies = await Promise.all(
      responses.map((response) => response.json())
    );

    bodies.forEach((body) => {
      temp = [...temp, ...body.items];
    });
  }
  return temp.filter((value) => value.track);
}
