import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router';
import './style.css';
import App from './App.jsx';
import LimitaErori from './componente/LimitaErori.jsx';

const elementRadacina = document.getElementById('aplicatie');

createRoot(elementRadacina).render(
    <StrictMode>
        <BrowserRouter>
            <LimitaErori>
                <App />
            </LimitaErori>
        </BrowserRouter>
    </StrictMode>
);