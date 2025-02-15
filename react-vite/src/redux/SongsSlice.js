// // import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// // Thunk to fetch songs from API
// export const fetchSongs = createAsyncThunk("songs/fetchSongs", async () => {
//   const response = await fetch("/api/songs");
//   const data = await response.json();
//   return data.songs;
// });

// const songsSlice = createSlice({
//   name: "songs",
//   initialState: {
//     songs: [],
//     status: "idle", // "idle" | "loading" | "succeeded" | "failed"
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchSongs.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(fetchSongs.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.songs = action.payload;
//       })
//       .addCase(fetchSongs.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.error.message;
//       });
//   },
// });

// export default songsSlice.reducer;
