import { createContext } from 'react';

export const LoadingContext = createContext({
  startLoading: () => {},
  stopLoading: () => {},
});