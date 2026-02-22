import { Db, Filter, ObjectId } from 'mongodb';

import { Account } from '../accounts/types/interface';
import { Budget } from '../budgets/types/interface';
import { createChildLogger } from '../config/logger';
import { Goal } from '../goals/types/interface';
import { Investment } from '../investments/types/interface';
import { Transaction, TransactionCategory } from '../transactions/types/interface';
import { SearchResponse, SearchResult } from './types/interface';

const MAX_PER_TYPE = 5;
const MAX_TOTAL = 20;

export class SearchService {
  private db: Db;
  private logger = createChildLogger({ service: 'SearchService' });

  constructor(db: Db) {
    this.db = db;
  }

  async search(userId: string, query: string): Promise<SearchResponse> {
    const q = query.trim();
    if (!q) return { query, total: 0, results: [] };

    this.logger.info({ userId, query: q }, 'Global search');

    const regex = new RegExp(q, 'i');

    const [transactions, budgets, goals, accounts, investments] = await Promise.all([
      this.searchTransactions(userId, regex),
      this.searchBudgets(userId, regex),
      this.searchGoals(userId, regex),
      this.searchAccounts(userId, regex),
      this.searchInvestments(userId, regex),
    ]);

    const results: SearchResult[] = [
      ...transactions,
      ...budgets,
      ...goals,
      ...accounts,
      ...investments,
    ].slice(0, MAX_TOTAL);

    return { query: q, total: results.length, results };
  }

  private async searchTransactions(userId: string, regex: RegExp): Promise<SearchResult[]> {
    const filter: Filter<Transaction> = {
      userId,
      $or: [{ description: regex }, { notes: regex }, { tags: regex }],
    };

    const docs = await this.db
      .collection<Transaction>('transactions')
      .find(filter)
      .sort({ date: -1 })
      .limit(MAX_PER_TYPE)
      .toArray();

    // Gather categoryIds to resolve names
    const categoryIds = [...new Set(docs.map((d) => d.categoryId).filter(Boolean))];
    const categoryMap = new Map<string, string>();
    if (categoryIds.length) {
      const cats = await this.db
        .collection<TransactionCategory>('categories')
        .find({ _id: { $in: categoryIds.map((id) => new ObjectId(id)) } })
        .toArray();
      cats.forEach((c) => categoryMap.set(c._id?.toString() ?? '', c.name));
    }

    return docs.map((doc) => ({
      id: doc._id?.toString() ?? '',
      type: 'transaction' as const,
      title: doc.description,
      subtitle: `${doc.type} · ${categoryMap.get(doc.categoryId) ?? 'Uncategorised'} · ${new Date(doc.date).toLocaleDateString()}`,
      amount: doc.amount,
      url: `/transactions?highlight=${doc._id?.toString() ?? ''}`,
    }));
  }

  private async searchBudgets(userId: string, regex: RegExp): Promise<SearchResult[]> {
    const docs = await this.db
      .collection<Budget>('budgets')
      .find({ userId, name: regex })
      .sort({ startDate: -1 })
      .limit(MAX_PER_TYPE)
      .toArray();

    return docs.map((doc) => ({
      id: doc._id?.toString() ?? '',
      type: 'budget' as const,
      title: doc.name,
      subtitle: `Budget · ${new Date(doc.startDate).toLocaleDateString()} – ${new Date(doc.endDate).toLocaleDateString()}`,
      amount: doc.totalAllocated,
      url: `/budgets?highlight=${doc._id?.toString() ?? ''}`,
    }));
  }

  private async searchGoals(userId: string, regex: RegExp): Promise<SearchResult[]> {
    const docs = await this.db
      .collection<Goal>('goals')
      .find({ userId, $or: [{ name: regex }, { notes: regex }] })
      .sort({ createdAt: -1 })
      .limit(MAX_PER_TYPE)
      .toArray();

    return docs.map((doc) => ({
      id: doc._id?.toString() ?? '',
      type: 'goal' as const,
      title: doc.name,
      subtitle: `Goal · ${doc.type.replace('_', ' ')} · ${doc.status}`,
      amount: doc.targetAmount,
      url: `/goals?highlight=${doc._id?.toString() ?? ''}`,
    }));
  }

  private async searchAccounts(userId: string, regex: RegExp): Promise<SearchResult[]> {
    const docs = await this.db
      .collection<Account>('accounts')
      .find({ userId, $or: [{ name: regex }, { institutionName: regex }] })
      .limit(MAX_PER_TYPE)
      .toArray();

    return docs.map((doc) => ({
      id: doc._id?.toString() ?? '',
      type: 'account' as const,
      title: doc.name,
      subtitle: `Account · ${doc.type}${doc.institutionName ? ` · ${doc.institutionName}` : ''}`,
      amount: doc.balance,
      url: `/settings?tab=connections&highlight=${doc._id?.toString() ?? ''}`,
    }));
  }

  private async searchInvestments(userId: string, regex: RegExp): Promise<SearchResult[]> {
    const docs = await this.db
      .collection<Investment>('investments')
      .find({ userId, $or: [{ name: regex }, { symbol: regex }, { notes: regex }] })
      .sort({ purchaseDate: -1 })
      .limit(MAX_PER_TYPE)
      .toArray();

    return docs.map((doc) => ({
      id: doc._id?.toString() ?? '',
      type: 'investment' as const,
      title: doc.name,
      subtitle: `Investment · ${doc.type}${doc.ticker ? ` · ${doc.ticker}` : ''}`,
      amount: doc.shares * doc.currentPrice,
      url: `/investments?highlight=${doc._id?.toString() ?? ''}`,
    }));
  }
}
