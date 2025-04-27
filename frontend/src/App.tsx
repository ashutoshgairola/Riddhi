// src/App.tsx
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { BudgetProvider } from "./contexts/BudgetContext";
import { TransactionProvider } from "./contexts/TransactionContext";
import { GoalsProvider } from "./contexts/GoalsContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import routes from "./routes";

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <TransactionProvider>
          <BudgetProvider>
            <GoalsProvider>
              <RouterProvider router={routes} />
            </GoalsProvider>
          </BudgetProvider>
        </TransactionProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
