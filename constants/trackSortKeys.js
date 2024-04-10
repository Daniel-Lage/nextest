export const sortKeys = {
  Artista: (a, b) => {
    const A = a.track.artists[0].name.toLowerCase();
    const B = b.track.artists[0].name.toLowerCase();

    if (A > B) return 1;
    if (A < B) return -1;

    return sortKeys.Album(a, b);
  },
  Album: (a, b) => {
    const A = a.track.album.name.toLowerCase();
    const B = b.track.album.name.toLowerCase();

    if (A > B) return 1;
    if (A < B) return -1;

    return b.track.disc_number - a.track.disc_number;
  },
  Nome: (a, b) => {
    const A = a.track.name.toLowerCase();
    const B = b.track.name.toLowerCase();

    if (A > B) return 1;
    if (A < B) return -1;

    return sortKeys.Data(a, b);
  },
  Data: (a, b) => {
    const A = new Date(a.added_at);
    const B = new Date(b.added_at);

    return B.getTime() - A.getTime();
  },
};
