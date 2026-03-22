// hooks/useAuth.ts
// Single source of truth: delegate entirely to AuthContext.
// Previously this was a standalone hook with its own state, which meant login/logout
// updates were invisible to contexts (CategoryContext, BudgetContext, etc.) that read
// from AuthContext — causing data to only load after a page refresh.
import { useAuth } from '../contexts/AuthContext';

export { useAuth };
export default useAuth;
