/**
 * @license
 * Copyright 2016 The Lovefield Project Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {IExecutionContext, TransactionResults} from '../spec/execution_context';
import {SqlConnection} from './sql_connection';

export class SqlExecutionContext implements IExecutionContext {
  private connection: SqlConnection;
  private sql: string[];

  constructor(connection: SqlConnection) {
    this.connection = connection;
    this.sql = [];
  }

  public prepare(sql: string) {
    this.sql.push(sql);
  }

  public commit(): Promise<TransactionResults> {
    // TODO(arthurhsu): implement
    return Promise.resolve();
  }

  public rollback(): Promise<void> {
    // TODO(arthurhsu): implement
    return Promise.resolve();
  }

  public inspect(): string[] {
    return this.sql;
  }
}
