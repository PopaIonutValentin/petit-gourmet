import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

const elementRadacina = document.getElementById('aplicatie');

createRoot(elementRadacina).render
(
    <StrictMode>
        <h1>Petit Gourmet</h1>
    </StrictMode>
);