// src/App.tsx
import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { BudgetProvider } from './contexts/BudgetContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { GoalsProvider } from './contexts/GoalsContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ToastProvider } from './contexts/ToastContext';
import { TransactionProvider } from './contexts/TransactionContext';
import routes from './routes';

function App() {
  return (
    <ToastProvider>
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
