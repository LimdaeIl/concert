import { createRoot } from 'react-dom/client';

import App from './App';
import { AuthInitializer } from './features/auth/components/AuthInitializer';
import './index.css';

createRoot(
    document.getElementById(
        'root',
    )!,
).render(
      <AuthInitializer>
        <App />
      </AuthInitializer>
);
