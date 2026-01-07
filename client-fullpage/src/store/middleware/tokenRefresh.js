// src/store/middleware/tokenRefresh.js (Fixed ESLint no-undef)
import { refreshToken, logout } from "../slices/authSlice";

let refreshInterval = null;
let expiryInterval = null;

export const startTokenRefresh = (store) => {
  if (refreshInterval) clearInterval(refreshInterval);
  if (expiryInterval) clearInterval(expiryInterval);

  refreshInterval = setInterval(() => {
    store.dispatch(refreshToken());
  }, 1000 * 60 * 60 * 23); // 23 hours

  const checkExpiry = () => {
    const lastLogin = sessionStorage.getItem('login_time');
    if (!lastLogin) return;
    const expiryTime = Number(lastLogin) + 24 * 60 * 60 * 1000;
    const now = Date.now();
    if (now > expiryTime) {
      store.dispatch(logout());
    }
  };

  checkExpiry();
  expiryInterval = setInterval(checkExpiry, 60 * 1000);
};

export const stopTokenRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval);
  if (expiryInterval) clearInterval(expiryInterval);
};