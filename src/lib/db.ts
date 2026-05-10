import { openDB, IDBPDatabase } from 'idb';
import { FormData } from '../types';

const DB_NAME = 'wpep_db';
const DB_VERSION = 1;

export interface PendingSync {
  id?: number;
  data: FormData;
  timestamp: string;
}

export interface AssessmentDraft {
  id: string; // 'current_draft'
  data: FormData;
  updatedAt: string;
}

export async function initDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('drafts')) {
        db.createObjectStore('drafts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingSyncs')) {
        db.createObjectStore('pendingSyncs', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

const dbPromise = initDB();

export const dbService = {
  // Drafts
  async saveDraft(data: FormData) {
    const db = await dbPromise;
    return db.put('drafts', {
      id: 'current_draft',
      data,
      updatedAt: new Date().toISOString()
    });
  },

  async getDraft(): Promise<FormData | null> {
    const db = await dbPromise;
    const draft = await db.get('drafts', 'current_draft');
    return draft ? draft.data : null;
  },

  async clearDraft() {
    const db = await dbPromise;
    return db.delete('drafts', 'current_draft');
  },

  // Pending Syncs
  async addPendingSync(data: FormData) {
    const db = await dbPromise;
    return db.add('pendingSyncs', {
      data,
      timestamp: new Date().toISOString()
    });
  },

  async getAllPendingSyncs(): Promise<PendingSync[]> {
    const db = await dbPromise;
    return db.getAll('pendingSyncs');
  },

  async removePendingSync(id: number) {
    const db = await dbPromise;
    return db.delete('pendingSyncs', id);
  },

  async clearPendingSyncs() {
    const db = await dbPromise;
    const tx = db.transaction('pendingSyncs', 'readwrite');
    await tx.store.clear();
    return tx.done;
  }
};
