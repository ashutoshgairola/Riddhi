import dayjs from 'dayjs';
import { Collection, Db, ObjectId } from 'mongodb';

import { InvestmentTransaction, InvestmentTxType } from './types/interface';

export class InvestmentTransactionModel {
  public collection: Collection<InvestmentTransaction>;

  constructor(db: Db) {
    this.collection = db.collection<InvestmentTransaction>('investmentTransactions');
  }

  async initialize(): Promise<void> {
    await this.collection.createIndex({ investmentId: 1, date: -1 });
    await this.collection.createIndex({ userId: 1 });
    await this.collection.createIndex({ userId: 1, type: 1 });
  }

  async create(
    tx: Omit<InvestmentTransaction, '_id' | 'createdAt'>,
  ): Promise<InvestmentTransaction> {
    const newTx: InvestmentTransaction = {
      ...tx,
      createdAt: dayjs().toDate(),
    };

    const result = await this.collection.insertOne(newTx);
    return { ...newTx, _id: result.insertedId };
  }

  async findById(id: string, userId: string): Promise<InvestmentTransaction | null> {
    return this.collection.findOne({
      _id: new ObjectId(id),
      userId,
    });
  }

  async findByInvestmentId(
    investmentId: string,
    userId: string,
  ): Promise<InvestmentTransaction[]> {
    return this.collection
      .find({ investmentId, userId })
      .sort({ date: -1 })
      .toArray();
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    return result.deletedCount === 1;
  }

  async deleteByInvestmentId(investmentId: string, userId: string): Promise<number> {
    const result = await this.collection.deleteMany({
      investmentId,
      userId,
    });

    return result.deletedCount;
  }

  async sumByType(
    investmentId: string,
    userId: string,
    type: InvestmentTxType,
  ): Promise<number> {
    const result = await this.collection
      .aggregate<{ total: number }>([
        { $match: { investmentId, userId, type } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])
      .toArray();

    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * Sum of (sell amount - cost basis for those shares) across all sell transactions.
   * For simplicity, uses each sell tx's amount minus (shares × parent purchasePrice at time of tx).
   * A more accurate approach would track lots — this uses the parent's weighted avg cost.
   */
  async computeRealisedGainLoss(
    investmentId: string,
    userId: string,
    avgCostBasis: number,
  ): Promise<number> {
    const sells = await this.collection
      .find({ investmentId, userId, type: 'sell' })
      .toArray();

    return sells.reduce((total, tx) => {
      const proceeds = tx.amount;
      const cost = (tx.shares || 0) * avgCostBasis;
      return total + (proceeds - cost);
    }, 0);
  }
}
