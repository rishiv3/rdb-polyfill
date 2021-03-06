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
import {SqlConnection} from '../../lib/proc/sql_connection';
import {Schema} from '../../lib/schema/schema';
import {MockNativeDB} from '../../testing/mock_native_db';

const assert = chai.assert;

describe('Tx', () => {
  let db: MockNativeDB;
  let conn: SqlConnection;

  beforeEach(() => {
    db = new MockNativeDB();
    conn = new SqlConnection(db, new Schema('db', 1));
    return conn.createTable('foo')
        .column('id', 'integer')
        .column('name', 'string')
        .commit()
        .then(() => {
          db.clear();
        });
  });

  afterEach(() => {
    db.clear();
  });

  it('exec_SimpleDML', () => {
    let expected = 'begin transaction;' +
                   'insert into foo(id,name) values(1,"2");' +
                   'update foo set name="3";' +
                   'commit';
    let foo = conn.schema().table('foo');
    let q1 = conn.insert().into(foo).values({id: 1, name: '2'});
    let q2 = conn.update(foo).set(foo['name'], '3');
    return conn
        .createTransaction('readwrite')
        .exec([q1, q2])
        .then(() => {
          assert.equal(expected, db.sqls.join(';'));
        });
  });

  it('exec_SimpleDDL', () => {
    let bar = conn.createTable('bar')
                  .column('id', 'integer')
                  .column('name', 'string');
    let fuz = conn.createTable('fuz')
                  .column('id', 'integer')
                  .column('name', 'string');
    return conn.createTransaction('readwrite')
               .exec([bar, fuz])
               .then(() => {
                 assert.equal('bar', conn.schema().table('bar').getName());
                 assert.equal('fuz', conn.schema().table('fuz').getName());
               });
  });

  it('attach_SimpleDML', () => {
    let expected = 'begin transaction;' +
                   'insert into foo(id,name) values(1,"2");' +
                   'update foo set name="3";' +
                   'commit';
    let foo = conn.schema().table('foo');
    let tx = conn.createTransaction('readwrite');
    let q1 = conn.insert().into(foo).values({id: 1, name: '2'});
    let q2 = conn.update(foo).set(foo['name'], '3');
    return tx
        .begin()
        .then(() => tx.attach(q1))
        .then(() => tx.attach(q2))
        .then(() => tx.commit())
        .then(() => {
          assert.equal(expected, db.sqls.join(';'));
        });
  });

  it('attach_SimpleDDL', () => {
    let bar = conn.createTable('bar')
                  .column('id', 'integer')
                  .column('name', 'string');
    let fuz = conn.createTable('fuz')
                  .column('id', 'integer')
                  .column('name', 'string');
    let tx = conn.createTransaction('readwrite');
    return tx
        .begin()
        .then(() => tx.attach(bar))
        .then(() => tx.attach(fuz))
        .then(() => tx.commit())
        .then(() => {
          assert.equal('bar', conn.schema().table('bar').getName());
          assert.equal('fuz', conn.schema().table('fuz').getName());
        });
  });
});
