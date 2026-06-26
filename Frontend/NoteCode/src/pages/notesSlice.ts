import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNotesTitles, getNote } from '../services/notesApi';
import { logout } from '../context/authSlice';

export const fetchNotesTitles = createAsyncThunk(
  'notes/fetchTitles',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await getNotesTitles(email);
      const filteredTitles = response.data.titles.filter(
        (note: any) => note?.title && note.title.trim() !== ""
      );
      return filteredTitles;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchNoteById = createAsyncThunk(
  'notes/fetchNoteById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getNote(id);
      return response?.data?.note || response?.note;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

interface NotesState {
  titles: any[];
  currentNote: any | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  currentNoteStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: NotesState = {
  titles: [],
  currentNote: null,
  status: 'idle',
  currentNoteStatus: 'idle',
  error: null,
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearCurrentNote: (state) => {
      state.currentNote = null;
      state.currentNoteStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotesTitles.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchNotesTitles.fulfilled, (state, action) => { state.status = 'succeeded'; state.titles = action.payload; })
      .addCase(fetchNotesTitles.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload as string; })
      
      .addCase(fetchNoteById.pending, (state) => { state.currentNoteStatus = 'loading'; })
      .addCase(fetchNoteById.fulfilled, (state, action) => { state.currentNoteStatus = 'succeeded'; state.currentNote = action.payload; })
      .addCase(fetchNoteById.rejected, (state, action) => { state.currentNoteStatus = 'failed'; state.error = action.payload as string; });

    // Reset notes state on user logout
    builder.addCase(logout, () => initialState);
  },
});

export const { clearCurrentNote } = notesSlice.actions;
export default notesSlice.reducer;