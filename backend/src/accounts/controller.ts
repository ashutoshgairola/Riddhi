import { Request, Response } from 'express';

import { getErrorMessage } from '../common/utils';
import { createChildLogger } from '../config/logger';
import { AccountService } from './service';
import { CreateAccountRequest, GetAccountsQuery, UpdateAccountRequest } from './types/interface';

export class AccountController {
  private accountService: AccountService;
  private logger = createChildLogger({ controller: 'AccountController' });

  constructor(accountService: AccountService) {
    this.accountService = accountService;
  }

  getAccounts = async (req: Request, res: Response): Promise<void> => {
    const requestLogger = this.logger.child({ method: 'getAccounts' });

    try {
      const userId = req.user?.userId ?? req.body.user?.userId;
      const query = req.query as unknown as GetAccountsQuery;

      requestLogger.info({ userId }, 'Getting accounts');

      const accounts = await this.accountService.getAccounts(userId, query);

      requestLogger.info({ userId }, 'Accounts fetched successfully');

      res.status(200).json(accounts);
    } catch (error: unknown) {
      requestLogger.error({ error, userId: req.user?.userId }, 'Error fetching accounts');
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  };

  getAccountById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId ?? req.body.user?.userId;
      const { id } = req.params;

      try {
        const account = await this.accountService.getAccountById(id, userId);
        res.status(200).json(account);
      } catch (error: unknown) {
        if (getErrorMessage(error) === 'Account not found') {
          res.status(404).json({ error: getErrorMessage(error) });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error fetching account:');
      res.status(500).json({ error: 'Failed to fetch account' });
    }
  };

  createAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId ?? req.body.user?.userId;
      const accountData: CreateAccountRequest = req.body;

      // Basic validation
      if (
        !accountData.name ||
        !accountData.type ||
        accountData.balance === undefined ||
        !accountData.currency ||
        accountData.includeInNetWorth === undefined
      ) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      try {
        const account = await this.accountService.createAccount(userId, accountData);
        res.status(201).json(account);
      } catch (error: unknown) {
        if (getErrorMessage(error).includes('Balance cannot be negative')) {
          res.status(400).json({ error: getErrorMessage(error) });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error creating account:');
      res.status(500).json({ error: 'Failed to create account' });
    }
  };

  updateAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId ?? req.body.user?.userId;
      const { id } = req.params;
      const updates: UpdateAccountRequest = req.body;

      try {
        const account = await this.accountService.updateAccount(id, userId, updates);
        res.status(200).json(account);
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        if (msg === 'Account not found') {
          res.status(404).json({ error: msg });
        } else if (msg.includes('Balance cannot be negative')) {
          res.status(400).json({ error: msg });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error updating account:');
      res.status(500).json({ error: 'Failed to update account' });
    }
  };

  deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId ?? req.body.user?.userId;
      const { id } = req.params;

      try {
        await this.accountService.deleteAccount(id, userId);
        res.status(204).send();
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        if (msg === 'Account not found') {
          res.status(404).json({ error: msg });
        } else if (msg.includes('associated transactions')) {
          res.status(409).json({ error: msg });
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      this.logger.error({ error }, 'Error deleting account:');
      res.status(500).json({ error: 'Failed to delete account' });
    }
  };
}
