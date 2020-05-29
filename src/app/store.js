import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import shipsReducer from "../features/ships/shipsSlice";

export default configureStore({
  reducer: {
    ships: shipsReducer,
  },
  middleware: [
    ...getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  ],
});
