import '@block65/react-design-system/css';
import 'the-new-css-reset';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';

const container = document?.getElementById('root');

if (!container) {
  throw new Error('No root container found');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
