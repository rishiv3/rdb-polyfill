/**
 * @license
 * Copyright 2017 The Lovefield Project Authors. All Rights Reserved.
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

import * as chai from 'chai';
import {rdb} from '../../lib/rdb';
import {DatabaseConnection} from '../../lib/spec/database_connection';
import {HR} from '../../testing/hr/hr_schema_builder';

const assert = chai.assert;

describe('EndToEnd', () => {
  before(() => {
    let db: DatabaseConnection = null;
    return rdb.open('foo', {storageType: 'temporary'}).then(conn => {
      assert.isNotNull(conn);
      db = conn;
      return HR.createNewSchema(db);
    });
  });
});
