import { useCallback, useRef } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { LoadingContext } from './loading-context';

// NProgress.configure({ showSpinner: false }); // remove the small spinner at the side uncomment this if you want // NEW

export function LoadingProvider({ children }) {
  const activeRequests = useRef(0);

  const startLoading = useCallback(() => {
    activeRequests.current += 1;
    if (activeRequests.current === 1) {
      NProgress.start();
    }
  }, []);

  const stopLoading = useCallback(() => {
    activeRequests.current = Math.max(0, activeRequests.current - 1);
    if (activeRequests.current === 0) {
      NProgress.done();
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

// import { 
//     // useState, 
//     useCallback, 
//     useRef 
// } from 'react';
// import NProgress from 'nprogress';
// import 'nprogress/nprogress.css';
// import { LoadingContext } from './loading-context';

// export function LoadingProvider({ children }) {
//   const activeRequests = useRef(0);
// //   const [, forceRender] = useState(0); // not actually needed for consumers, kept minimal

//   const startLoading = useCallback(() => {
//     activeRequests.current += 1;
//     if (activeRequests.current === 1) {
//       NProgress.start();
//     }
//   }, []);

//   const stopLoading = useCallback(() => {
//     activeRequests.current = Math.max(0, activeRequests.current - 1);
//     if (activeRequests.current === 0) {
//       NProgress.done();
//     }
//   }, []);

//   return (
//     <LoadingContext.Provider value={{ startLoading, stopLoading }}>
//       {children}
//     </LoadingContext.Provider>
//   );
// }