import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './style.css';
import App from './App.jsx';


const elementRadacina = document.getElementById('aplicatie');

createRoot(elementRadacina).render
(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
);