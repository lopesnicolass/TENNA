import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GamificationProvider } from './context/GamificationContext.jsx';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/kalam/400.css';
import '@fontsource/kalam/700.css';
import '@fontsource/caveat/400.css';
import '@fontsource/caveat/500.css';
import '@fontsource/caveat/600.css';
import '@fontsource/caveat/700.css';
import './styles/global.css';
import './styles/design-system.css';
import './styles/layout-system.css';
import './styles/App.css';
import App from './App.jsx';
import './styles/dark-mode.css';
import './styles/student-standard.css';
import './styles/dark-polish.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GamificationProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GamificationProvider>
  </StrictMode>,
);