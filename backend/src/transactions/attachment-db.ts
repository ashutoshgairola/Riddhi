import { Collection, Db, ObjectId } from 'mongodb';

import { Attachment } from './types/interface';

export class AttachmentModel {
  private collection: Collection<Attachment>;

  constructor(db: Db) {
    this.collection = db.collection<Attachment>('attachments');
  }

  async initialize(): Promise<void> {
    // Create indexes for faster queries
    await this.collection.createIndex({ fileName: 1 });
    await this.collection.createIndex({ uploadedAt: 1 });
  }

  async create(attachment: Omit<Attachment, '_id'>): Promise<Attachment> {
    const result = await this.collection.insertOne(attachment);
    return { ...attachment, _id: result.insertedId };
  }

  async findById(id: string): Promise<Attachment | null> {
    return this.collection.findOne({
      _id: new ObjectId(id),
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({
      _id: new ObjectId(id),
    });

    return result.deletedCount === 1;
  }
}
