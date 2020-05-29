export const percentile = (nth, list) => {
  const index = Math.ceil((nth / 100) * list.length) + 1;
  return list[index];
};
