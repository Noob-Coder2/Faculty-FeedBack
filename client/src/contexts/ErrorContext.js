// ErrorContext.js
import { createContext } from 'react';

const ErrorContext = createContext({
  error: null,
  setError: () => {},
});

export default ErrorContext;
