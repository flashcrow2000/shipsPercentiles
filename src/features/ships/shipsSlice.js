import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getShips, getShipInfo } from "../../api/api";
import { useSelector } from "react-redux";

export const shipsSlice = createSlice({
  name: "ships",
  initialState: {
    list: [],
    info: [],
  },
  reducers: {
    shipsLoadingSuccess: (state, action) => {
      state.list = [...action.payload.ships];
    },
    shipInfoSuccess: (state, action) => {
      state.loading = false;
      state.failed = false;
      state.info = state.info.concat(action.payload);
    },
  },
});

export const { shipsLoadingSuccess, shipInfoSuccess } = shipsSlice.actions;

export const loadShips = () => async (dispatch) => {
  const ships = await getShips();
  dispatch(shipsLoadingSuccess({ ships }));
};

export const loadShipsInformation = (ships) => async (dispatch) => {
  ships.forEach(async (ship) => {
    const shipInfo = await getShipInfo(ship);
    dispatch(shipInfoSuccess(shipInfo));
  });
};

export const selectShipsList = (state) =>
  state?.ships.list.map((ship) => ship.imo) ?? [];
export const selectShipInformation = (state) => state.ships.info;

export default shipsSlice.reducer;
