import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { toast } from "react-toastify";

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user } = res.data;
      sessionStorage.setItem("access_token", accessToken);
      sessionStorage.setItem("refresh_token", refreshToken);
      sessionStorage.setItem("auth_user", JSON.stringify(user));
      sessionStorage.setItem("login_time", Date.now().toString());
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      return { user, accessToken, refreshToken };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const signup = createAsyncThunk(
  "auth/signup",
  async ({ fullName, email, password }, { rejectWithValue }) => {
    try {
      await api.post("/auth/register", { fullName, email, password });
      toast.success("Signup successful");
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Signup failed");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { getState }) => {
    const { auth } = getState();
    if (auth.user) {
      try {
        await api.post("/auth/logout", { userId: auth.user.id });
      } catch (err) {
        console.error("Logout API failed", err);
      }
    }
    sessionStorage.clear();
    delete api.defaults.headers.common["Authorization"];
    return null;
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();

    if (!auth.refreshToken) return rejectWithValue("No refresh token");
    try {
      const res = await api.post("/auth/refresh", {
        refreshToken: auth.refreshToken,
      });
      const { accessToken, refreshToken: newRefresh } = res.data;
      sessionStorage.setItem("access_token", accessToken);
      sessionStorage.setItem("refresh_token", newRefresh);
      sessionStorage.setItem("login_time", Date.now().toString());
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      return { accessToken, refreshToken: newRefresh };
    } catch (err) {
      return rejectWithValue("Token refresh failed");
    }
  }
);

const loadInitialState = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem("auth_user"));
    const accessToken = sessionStorage.getItem("access_token");
    const refreshToken = sessionStorage.getItem("refresh_token");
    if (accessToken && user) {
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    }
    return {
      user: user || null,
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
      isLoading: false,
      error: null,
    };
  } catch {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
    };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadInitialState(),
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        toast.success("Login successful");
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signup.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        toast.info("Logged out");
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshToken.rejected, () => {
        sessionStorage.clear();
        delete api.defaults.headers.common["Authorization"];
        window.location.href = "/login";
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;