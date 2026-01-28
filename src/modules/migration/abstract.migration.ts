import type { Connection } from "mongoose";
import type { CreateIndexesOptions, Db, IndexSpecification } from "mongodb";

export abstract class AbstractMigration {
  protected readonly db: Db;
  constructor(protected readonly connection: Connection) {
    if (!connection.db) {
      throw new Error("Database under this connection is not available");
    }
    this.db = connection.db;
  }

  public abstract up(): Promise<void>;

  /**
   * @description Creates a collection if it does not already exist.
   * @param collectionName - The name of the collection to create
   */
  protected async createCollectionIfNotExists(collectionName: string): Promise<boolean> {
    try {
      const collections = await this.db.listCollections({ name: collectionName }).toArray();
      if (collections.length === 0) {
        await this.db.createCollection(collectionName);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Creates an index on a collection if it does not already exist.
   * @param collectionName - The name of the collection
   * @param indexSpec - The index specification (field(s) and direction)
   * @param indexName - The name of the index
   * @param options - Additional index options (e.g., unique, sparse, etc.)
   */
  protected async createIndexIfNotExists(
    collectionName: string,
    indexSpec: IndexSpecification,
    indexName: string,
    options?: Omit<CreateIndexesOptions, "name">,
  ): Promise<void> {
    const collection = this.db.collection(collectionName);
    const existingIndexes = await collection.indexes();

    const indexExists = existingIndexes.some((index) => index.name === indexName);

    if (!indexExists) {
      await collection.createIndex(indexSpec, { name: indexName, ...options });
    }
  }
}
