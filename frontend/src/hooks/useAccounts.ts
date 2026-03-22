import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import accountService from '../services/api/accountService';
import { Account, AccountCreateDTO, AccountUpdateDTO } from '../types/account.types';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchAccounts = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;
    setLoading(true);
    try {
      const data = await accountService.getAll();
      // Backend returns the array directly; guard against unexpected shapes
      setAccounts(Array.isArray(data) ? data : []);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchAccounts();
    }
  }, [fetchAccounts, isAuthenticated, authLoading]);

  const createAccount = async (data: AccountCreateDTO): Promise<Account | null> => {
    try {
      const account = await accountService.create(data);
      setAccounts((prev) => [...prev, account]);
      return account;
    } catch {
      return null;
    }
  };

  const updateAccount = async (id: string, data: AccountUpdateDTO): Promise<Account | null> => {
    try {
      const account = await accountService.update(id, data);
      setAccounts((prev) => prev.map((a) => (a.id === id ? account : a)));
      return account;
    } catch {
      return null;
    }
  };

  const deleteAccount = async (id: string): Promise<boolean> => {
    try {
      await accountService.delete(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch {
      return false;
    }
  };

  return { accounts, loading, fetchAccounts, createAccount, updateAccount, deleteAccount };
};
