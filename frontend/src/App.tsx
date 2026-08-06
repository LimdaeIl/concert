import { RouterProvider } from 'react-router-dom';

import { AuthInitializer } from '@/features/auth/components/AuthInitializer';

import { router } from './app/router';

function App() {
  return (
      <AuthInitializer>
        <RouterProvider router={router} />
      </AuthInitializer>
  );
}

export default App;
