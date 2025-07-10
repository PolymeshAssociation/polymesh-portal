// import first to make Polymesh specific type globally available
import type {} from '@polymeshassociation/polymesh-types/polkadot/types-lookup';
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import './styles/css/index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
