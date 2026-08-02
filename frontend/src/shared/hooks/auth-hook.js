import { useState, useCallback, useEffect } from "react";

let logoutTimer;

export const useAuth = () => {
  const [token, setToken] = useState(null);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userId, setUserId] = useState(false);
  const [name, setName] = useState(null);
  const [image, setImage] = useState(null);

  const login = useCallback((uid, token, expirationDate, name, image) => {
    setToken(token);
    setUserId(uid);
    setName(name);
    setImage(image);
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenExpirationDate);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        token: token,
        expiration: tokenExpirationDate.toISOString(),
        name: name,
        image: image,
      }),
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpirationDate(null);
    setUserId(null);
    setName(null);
    setImage(null);
    localStorage.removeItem("userData");
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      const timer = setTimeout(() => {
        login(
          storedData.userId,
          storedData.token,
          new Date(storedData.expiration),
          storedData.name,
          storedData.image
        );
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [login]);

  return { token, login, logout, userId, name, image };
};