export default function shuffleArray(array) {
  const newArray = [];
  while (array.length) {
    const index = Math.floor(Math.random() * array.length);
    newArray.push(array.splice(index, 1)[0]);
  }
  return newArray;
}
