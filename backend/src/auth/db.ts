import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import { Collection, Db, ObjectId } from 'mongodb';

import { User } from './types/interface';

export class UserModel {
  private collection: Collection<User>;

  constructor(db: Db) {
    this.collection = db.collection<User>('users');
  }

  async initialize(): Promise<void> {
    // Create indexes for faster queries and unique constraints
    await this.collection.createIndex({ email: 1 }, { unique: true });
  }

  async create(user: Omit<User, '_id' | 'createdAt'>): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser: User = {
      ...user,
      password: hashedPassword,
      createdAt: dayjs().toDate(),
    };

    const result = await this.collection.insertOne(newUser as any);
    return { ...newUser, id: result.insertedId.toString() };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.collection.findOne({ email });
  }

  async findById(id: string): Promise<User | null> {
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  async updateProfile(id: string, updates: Partial<User>): Promise<User | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: dayjs().toDate() } },
      { returnDocument: 'after' },
    );

    return result.value as unknown as User | null;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { password: hashedPassword } },
    );

    return result.modifiedCount === 1;
  }

  async updateLastLogin(id: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { lastLogin: dayjs().toDate() } },
    );

    return result.modifiedCount === 1;
  }

  async comparePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}
