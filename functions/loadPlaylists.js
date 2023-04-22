const batchSize = 50;
export default async function loadPlaylists(playlists, temp) {
  temp = [...temp, ...playlists.items];

  if (playlists.next) {
    const url = new URL(playlists.next);
    const baseURL = url.origin + url.pathname;
    const requests = [];

    for (
      let offset = batchSize;
      offset < playlists.total;
      offset += batchSize
    ) {
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

  return temp;
}
