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

import {LogicalPredicate} from '../pred/logical_predicate';
import {BindableValueHolder} from '../schema/bindable_value_holder';
import {ColumnSchema} from '../schema/column_schema';
import {Schema} from '../schema/schema';
import {TableSchema} from '../schema/table_schema';
import {IColumn} from '../spec/column';
import {ValueType} from '../spec/enums';
import {ILogicalPredicate} from '../spec/predicate';
import {IQuery} from '../spec/query';
import {ITable} from '../spec/table';
import {IUpdateQuery} from '../spec/update_query';
import {QueryBase} from './query_base';
import {SqlConnection} from './sql_connection';

export class UpdateQueryBuilder extends QueryBase implements IUpdateQuery {
  private table: TableSchema;
  private columns: ColumnSchema[];
  private schema: Schema;
  private values: ValueType[];
  private searchCondition: LogicalPredicate;

  constructor(connection: SqlConnection, schema: Schema, table: ITable) {
    super(connection);
    this.table = table as TableSchema;
    this.schema = schema;
    this.columns = [];
    this.values = [];
    this.searchCondition = null;
  }

  public set(column: IColumn, value: ValueType): IUpdateQuery {
    if (column.table != this.table.getName()) {
      throw new Error('SyntaxError');
    }

    this.columns.push(column as ColumnSchema);
    this.values.push(value);
    return this;
  }

  public where(searchCondition: ILogicalPredicate): IUpdateQuery {
    this.searchCondition = searchCondition as LogicalPredicate;
    return this;
  }

  public createBinderMap(): void {
    if (this.searchCondition) {
      this.searchCondition.createBinderMap(this.boundValues);
    }

    this.values.forEach(value => {
      if (value instanceof BindableValueHolder) {
        this.boundValues.set(value.index, value);
      }
    });
  }

  public clone(): IQuery {
    let that = new UpdateQueryBuilder(this.connection, this.schema, this.table);
    that.columns = this.columns;
    that.values = this.values;
    that.searchCondition =
        this.searchCondition ? this.searchCondition.clone() : null;
    that.cloneBoundValues(this);
    return that;
  }

  public toSql(): string {
    if (this.columns.length == 0) {
      throw new Error('SyntaxError');
    }

    let setters = [];
    for (let i = 0; i < this.columns.length; ++i) {
      let val = super.toValueString(this.values[i], this.columns[i].type);
      setters.push(`${this.columns[i].name}=${val}`);
    }
    let sql = `update ${this.table.getName()} set ${setters.join(', ')}`;
    if (this.searchCondition != null) {
      sql += ` where ${this.searchCondition.toSql()}`;
    }
    return sql;
  }
}
