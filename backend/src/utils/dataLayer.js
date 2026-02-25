import logger from './logger.js';

/**
 * Data Layer - Deprecated
 * All database operations now go directly through Supabase client in services
 * This file is kept for backwards compatibility only
 */

export class DataLayer {
  static async getDB() {
    logger.warn('DataLayer.getDB() is deprecated. Use Supabase client directly.');
    return null;
  }

  static async create(collection, data) {
    logger.warn('DataLayer.create() is deprecated. Use service layer instead.');
    throw new Error('Use service layer for database operations');
  }

  static async createMany(collection, dataArray) {
    logger.warn('DataLayer.createMany() is deprecated. Use service layer instead.');
    throw new Error('Use service layer for database operations');
  }

  static async findOne(collection, query) {
    const db = await this.getDB();
    if (db.collection) {
      return db.collection(collection).findOne(query);
    }
    return db.collection(collection).findOne(query);
  }

  static async find(collection, query = {}) {
    const db = await this.getDB();
    if (db.collection) {
      return db.collection(collection).find(query);
    }
    return db.collection(collection).find(query);
  }

  static async updateOne(collection, query, update) {
    const db = await this.getDB();
    if (db.collection) {
      return db.collection(collection).updateOne(query, update);
    }
    return db.collection(collection).updateOne(query, update);
  }

  static async deleteOne(collection, query) {
    const db = await this.getDB();
    if (db.collection) {
      return db.collection(collection).deleteOne(query);
    }
    return db.collection(collection).deleteOne(query);
  }

  static async count(collection, query = {}) {
    const db = await this.getDB();
    if (db.collection) {
      return db.collection(collection).countDocuments(query);
    }
    return db.collection(collection).countDocuments(query);
  }
}

export default DataLayer;
