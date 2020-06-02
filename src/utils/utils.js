export const percentile = (nth, list) => {
  const index = Math.ceil((nth / 100) * list.length) + 1;
  console.log(index, list[index])
  return parseFloat(''+list[index]).toFixed(3);
};
