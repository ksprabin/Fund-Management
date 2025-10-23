import Dexie, { Table } from 'dexie';
import { User, Transaction } from './types';

export class AppDB extends Dexie {
  users!: Table<User>;
  transactions!: Table<Transaction>;

  constructor() {
    super('transactionAppDB');
    // FIX: Cast `this` to `Dexie` to resolve a TypeScript error where the `version`
    // method was not being correctly inferred on the extended `AppDB` class.
    (this as Dexie).version(1).stores({
      users: 'id, &username, role', // Primary key 'id', unique index 'username', index 'role'
      transactions: 'id, userId, date' // Primary key 'id', index 'userId'
    });
  }
}

export const db = new AppDB();
