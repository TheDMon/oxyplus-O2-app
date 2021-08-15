import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

import { Request } from '../../models/request';

@Injectable({
  providedIn: 'root'
})
export class IndexDbService {
  private db: IDBPDatabase<OxyplusDB>;

  constructor() {
    this.connectToDb();
   }

  async connectToDb() {
    this.db = await openDB<OxyplusDB>('oxyplus-db', 1, {
      upgrade: (db) => {
        db.createObjectStore('request-store');
      },
    });
  }

  add(request: Request) {
    return this.db.put('request-store', request, 'request');
  }

  delete(key: string) {
    return this.db.delete('request-store', key);
  }

}

interface OxyplusDB extends DBSchema {
  'request-store': {
    key: string;
    value: Request;
  };
}
