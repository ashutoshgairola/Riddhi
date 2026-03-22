// src/App.tsx
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { BudgetProvider } from './contexts/BudgetContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { GoalsProvider } from './contexts/GoalsContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { TransactionProvider } from './contexts/TransactionContext';
import { setApiErrorNotifier } from './services/api/apiErrorBridge';
import routes from './routes';

// Registers the toast error callback into the Axios interceptor bridge.
// Must live inside ToastProvider.
function ApiErrorBridge() {
  const { error: showError } = useToast();
  useEffect(() => {
    setApiErrorNotifier(showError);
    return () => setApiErrorNotifier(null);
  }, [showError]);
  return null;
}

function App() {
  return (
    <ToastProvider>
      <ApiErrorBridge />
      <AuthProvider>
        <SettingsProvider>
          <TransactionProvider>
            <CategoryProvider>
              <BudgetProvider>
                <GoalsProvider>
                  <RouterProvider router={routes} />
                </GoalsProvider>
              </BudgetProvider>
            </CategoryProvider>
          </TransactionProvider>
        </SettingsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
