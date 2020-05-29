import axios from "axios";

export const getShips = async () => {
  let res = await axios.get(
    "https://import-coding-challenge-api.portchain.com/api/v2/vessels"
  );
  return res.data;
};

export const getShipInfo = async (shipId) => {
  let res = await axios.get(
    `https://import-coding-challenge-api.portchain.com/api/v2/schedule/${shipId}`
  );
  return res.data;
};
