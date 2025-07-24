import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material';

import App from './App.jsx';
import { store } from './store/store';
import theme from './theme';
import './index.css';

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  const componentDidCatch = (error, errorInfo) => {
    setHasError(true);
    console.error('ErrorBoundary caught:', error, errorInfo);
  };

  if (hasError) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Something went wrong.</h1>
        <p>Please refresh the page or try again later.</p>
      </div>
    );
  }

  return children;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);