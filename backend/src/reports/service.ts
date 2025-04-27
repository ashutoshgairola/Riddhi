import { Db } from "mongodb";
import {
  Account,
  AccountDTO,
  AccountDetailDTO,
  AccountType,
  GetAccountsQuery,
  CreateAccountRequest,
  UpdateAccountRequest,
  AccountsResponse,
} from "./types/interface";
import { AccountModel } from "./db";
import { TransactionModel } from "../transactions/db";

export class AccountService {
  private accountModel: AccountModel;
  private transactionModel: TransactionModel;

  constructor(db: Db) {
    this.accountModel = new AccountModel(db);
    this.transactionModel = new TransactionModel(db);
  }

  async initialize(): Promise<void> {
    await this.accountModel.initialize();
  }

  async getAccounts(
    userId: string,
    query: GetAccountsQuery
  ): Promise<AccountsResponse> {
    // Parse account types if provided
    let accountTypes: string[] | undefined;
    if (query.type) {
      accountTypes = query.type.split(",");
    }

    const accounts = await this.accountModel.findAll(userId, accountTypes);
    const accountDTOs = accounts.map((account) =>
      this.mapAccountToDTO(account)
    );

    return {
      data: accountDTOs,
    };
  }

  async getAccountById(id: string, userId: string): Promise<AccountDetailDTO> {
    const account = await this.accountModel.findById(id, userId);
    if (!account) {
      throw new Error("Account not found");
    }

    // Get recent transactions for this account
    const recentTransactions =
      await this.transactionModel.findRecentByAccountId(userId, id, 10);

    // Map to simplified transaction format for account detail
    const transactionSummaries = recentTransactions.map((transaction) => ({
      id: transaction._id!.toString(),
      date: transaction.date.toISOString(),
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
    }));

    return {
      ...this.mapAccountToDTO(account),
      transactions: transactionSummaries,
    };
  }

  async createAccount(
    userId: string,
    accountData: CreateAccountRequest
  ): Promise<AccountDTO> {
    // Validate inputs
    if (
      accountData.balance < 0 &&
      ["checking", "savings", "cash", "investment"].includes(accountData.type)
    ) {
      throw new Error("Balance cannot be negative for this account type");
    }

    // For credit and loan accounts, convert balance to negative if positive
    if (
      ["credit", "loan"].includes(accountData.type) &&
      accountData.balance > 0
    ) {
      accountData.balance = -accountData.balance;
    }

    // Create the account
    const accountToCreate: Omit<Account, "_id" | "createdAt" | "updatedAt"> = {
      userId,
      name: accountData.name,
      type: accountData.type,
      balance: accountData.balance,
      currency: accountData.currency,
      institutionName: accountData.institutionName,
      institutionLogo: accountData.institutionLogo,
      lastUpdated: new Date(),
      isConnected: false, // Manually created accounts are not connected
      includeInNetWorth: accountData.includeInNetWorth,
      color: accountData.color,
    };

    const createdAccount = await this.accountModel.create(accountToCreate);
    return this.mapAccountToDTO(createdAccount);
  }

  async updateAccount(
    id: string,
    userId: string,
    updates: UpdateAccountRequest
  ): Promise<AccountDTO> {
    const account = await this.accountModel.findById(id, userId);
    if (!account) {
      throw new Error("Account not found");
    }

    // Prepare updates
    const accountUpdates: Partial<Account> = {};

    // Handle name update
    if (updates.name !== undefined) {
      accountUpdates.name = updates.name;
    }

    // Handle type update
    if (updates.type !== undefined) {
      accountUpdates.type = updates.type;

      // Adjust balance sign if type is changing between asset/liability types
      if (
        ["checking", "savings", "cash", "investment"].includes(updates.type) &&
        ["credit", "loan"].includes(account.type) &&
        account.balance < 0
      ) {
        // Converting from liability to asset
        accountUpdates.balance = -account.balance;
      } else if (
        ["credit", "loan"].includes(updates.type) &&
        ["checking", "savings", "cash", "investment"].includes(account.type) &&
        account.balance > 0
      ) {
        // Converting from asset to liability
        accountUpdates.balance = -account.balance;
      }
    }

    // Handle balance update
    if (updates.balance !== undefined) {
      // Validate balance based on account type
      const accountType = updates.type || account.type;

      if (
        updates.balance < 0 &&
        ["checking", "savings", "cash", "investment"].includes(accountType)
      ) {
        throw new Error("Balance cannot be negative for this account type");
      }

      // For credit and loan accounts, convert balance to negative if positive
      if (["credit", "loan"].includes(accountType) && updates.balance > 0) {
        accountUpdates.balance = -updates.balance;
      } else {
        accountUpdates.balance = updates.balance;
      }
    }

    // Handle other updates
    if (updates.currency !== undefined) {
      accountUpdates.currency = updates.currency;
    }

    if (updates.institutionName !== undefined) {
      accountUpdates.institutionName = updates.institutionName;
    }

    if (updates.institutionLogo !== undefined) {
      accountUpdates.institutionLogo = updates.institutionLogo;
    }

    if (updates.includeInNetWorth !== undefined) {
      accountUpdates.includeInNetWorth = updates.includeInNetWorth;
    }

    if (updates.color !== undefined) {
      accountUpdates.color = updates.color;
    }

    // Apply updates
    const updatedAccount = await this.accountModel.update(
      id,
      userId,
      accountUpdates
    );

    if (!updatedAccount) {
      throw new Error("Failed to update account");
    }

    return this.mapAccountToDTO(updatedAccount);
  }

  async deleteAccount(id: string, userId: string): Promise<void> {
    const account = await this.accountModel.findById(id, userId);
    if (!account) {
      throw new Error("Account not found");
    }

    // Check if account has associated transactions
    const transactionCount = await this.transactionModel.countByAccountId(
      userId,
      id
    );
    if (transactionCount > 0) {
      throw new Error("Cannot delete account with associated transactions");
    }

    const deleted = await this.accountModel.delete(id, userId);

    if (!deleted) {
      throw new Error("Failed to delete account");
    }
  }

  async calculateNetWorth(userId: string): Promise<number> {
    const accounts = await this.accountModel.getNetWorthAccounts(userId);

    return accounts.reduce((sum, account) => sum + account.balance, 0);
  }

  private mapAccountToDTO(account: Account): AccountDTO {
    return {
      id: account._id!.toString(),
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      institutionName: account.institutionName,
      institutionLogo: account.institutionLogo,
      lastUpdated: account.lastUpdated.toISOString(),
      isConnected: account.isConnected,
      connectionId: account.connectionId,
      includeInNetWorth: account.includeInNetWorth,
      color: account.color,
    };
  }
}
