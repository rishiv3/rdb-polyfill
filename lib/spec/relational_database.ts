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

import {DatabaseConnection} from './database_connection';
import {IDatabaseFunctionProvider} from './database_function_provider';

export type RDBStorageType = 'persistent' | 'temporary';

export interface OpenDatabaseOptions { storageType: RDBStorageType; }

export interface IRelationalDatabase {
  readonly fn: IDatabaseFunctionProvider;

  open(name: string, opt?: OpenDatabaseOptions): Promise<DatabaseConnection>;
  drop(name: string): Promise<void>;
}