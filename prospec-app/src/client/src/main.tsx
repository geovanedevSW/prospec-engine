import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import { NichePreviewView } from './templates/NichePreviewView.js';
import './index.css';

// Roteador de entrada do Vite Client SPA
const urlParams = new URLSearchParams(window.location.search);
const isPreviewRoute =
  window.location.pathname.startsWith('/preview') ||
  urlParams.get('view') === 'preview';

const RootComponent = isPreviewRoute ? <NichePreviewView /> : <App />;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {RootComponent}
  </React.StrictMode>
);


