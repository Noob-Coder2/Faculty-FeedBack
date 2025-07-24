// client/src/store/profileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserProfile, updateUser } from '../services/api';

export const fetchProfile = createAsyncThunk('profile/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const data = await getUserProfile();
    return data.user;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const saveProfile = createAsyncThunk('profile/saveProfile', async (form, { rejectWithValue }) => {
  try {
    await updateUser(form);
    // Refetch updated profile
    const data = await getUserProfile();
    return data.user;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    user: null,
    loading: false,
    error: '',
    success: '',
  },
  reducers: {
    clearProfileState: (state) => {
      state.error = '';
      state.success = '';
    },
    resetProfile: (state) => {
      state.user = null;
      state.loading = false;
      state.error = '';
      state.success = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = '';
        state.success = '';
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveProfile.pending, (state) => {
        state.loading = true;
        state.error = '';
        state.success = '';
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.success = 'Profile updated!';
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileState, resetProfile } = profileSlice.actions;
export default profileSlice.reducer;