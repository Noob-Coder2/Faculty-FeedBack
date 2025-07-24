// client/src/store/feedbackSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAssignments, getSubmissionStatus, submitFeedback } from '../services/api';

export const fetchFeedbackData = createAsyncThunk('feedback/fetchFeedbackData', async (_, { rejectWithValue }) => {
  try {
    const assignments = await getAssignments();
    const status = await getSubmissionStatus();
    return { assignments, status };
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const submitFeedbackThunk = createAsyncThunk('feedback/submitFeedback', async (payload, { rejectWithValue }) => {
  try {
    await submitFeedback(payload);
    // Refetch assignments and status after submission
    const assignments = await getAssignments();
    const status = await getSubmissionStatus();
    return { assignments, status };
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState: {
    assignments: [],
    ratingParameters: [],
    status: { totalAssignments: 0, submittedCount: 0, pendingCount: 0 },
    loading: false,
    error: '',
    success: '',
  },
  reducers: {
    clearFeedbackState: (state) => {
      state.error = '';
      state.success = '';
    },
    resetFeedback: (state) => {
      state.assignments = [];
      state.ratingParameters = [];
      state.status = { totalAssignments: 0, submittedCount: 0, pendingCount: 0 };
      state.loading = false;
      state.error = '';
      state.success = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedbackData.pending, (state) => {
        state.loading = true;
        state.error = '';
        state.success = '';
      })
      .addCase(fetchFeedbackData.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload.assignments.teachingAssignments || [];
        state.ratingParameters = action.payload.assignments.ratingParameters || [];
        state.status = action.payload.status || { totalAssignments: 0, submittedCount: 0, pendingCount: 0 };
      })
      .addCase(fetchFeedbackData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitFeedbackThunk.pending, (state) => {
        state.loading = true;
        state.error = '';
        state.success = '';
      })
      .addCase(submitFeedbackThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload.assignments.teachingAssignments || [];
        state.ratingParameters = action.payload.assignments.ratingParameters || [];
        state.status = action.payload.status || { totalAssignments: 0, submittedCount: 0, pendingCount: 0 };
        state.success = 'Feedback submitted successfully!';
      })
      .addCase(submitFeedbackThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFeedbackState, resetFeedback } = feedbackSlice.actions;
export default feedbackSlice.reducer;