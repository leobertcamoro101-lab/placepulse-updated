// wired with LoadingContext for combined loading state
import { useState, useCallback, useRef, useEffect, useContext } from "react";
import { LoadingContext } from "../context/loading-context";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const { startLoading, stopLoading } = useContext(LoadingContext);

  const activeHttpRequest = useRef([]);

  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);
      startLoading(); // NEW
      const httpAbortCtrl = new AbortController();
      activeHttpRequest.current.push(httpAbortCtrl);

      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal,
        });

        const responseData = await response.json();

        activeHttpRequest.current = activeHttpRequest.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortCtrl
        );

        if (!response.ok) {
          throw new Error(responseData.message);
        }
        setIsLoading(false);
        stopLoading(); // NEW
        return responseData;
      } catch (err) {
        stopLoading(); // NEW — must fire on every exit path, including abort/error
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message);
        setIsLoading(false);
        throw err;
      }
    }, [startLoading, stopLoading]);

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    return () => {
      activeHttpRequest.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};

// import { useState, useCallback, useRef, useEffect } from "react";

// export const useHttpClient = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState();

//   const activeHttpRequest = useRef([]);

//   const sendRequest = useCallback(
//     async (url, method = "GET", body = null, headers = {}) => {
//       setIsLoading(true);
//       const httpAbortCtrl = new AbortController();
//       activeHttpRequest.current.push(httpAbortCtrl);

//       try {
//         const response = await fetch(url, {
//           method,
//           body,
//           headers,
//           signal: httpAbortCtrl.signal, //link AbortController()
//         });

//         const responseData = await response.json();

//         activeHttpRequest.current = activeHttpRequest.current.filter(
//           (reqCtrl) => reqCtrl !== httpAbortCtrl,
//         );

//         if (!response.ok) {
//           throw new Error(responseData.message);
//         }
//         setIsLoading(false);
//         return responseData;
//       } catch (err) {
//         if (err.name === 'AbortError') {
//           return; // request was intentionally cancelled — not a real error
//         }
//         setError(err.message);
//         setIsLoading(false);
//         throw err;
//       }
      
//     }, []);

//   const clearError = () => {
//     setError(null);
//   };

//   useEffect(() => {
//     return () => {
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//       activeHttpRequest.current.forEach((abortCtrl) => abortCtrl.abort());
//     };
//   }, []);

//   return { isLoading, error, sendRequest, clearError };
// };
