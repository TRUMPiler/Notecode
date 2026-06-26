import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
}

// Initialize state from localStorage if available
const storedUser = localStorage.getItem('user');
const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isLoggedIn: !!storedUser,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;