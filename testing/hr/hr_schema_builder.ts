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

import {DatabaseConnection} from '../../lib/spec/database_connection';
import {IExecutionContext} from '../../lib/spec/execution_context';
import {Samples} from './samples';

export class HR {
  static createNewSchema(conn: DatabaseConnection): Promise<void> {
    let tx = conn.createTransaction('readwrite');
    let queries: IExecutionContext[] = [];

    const INTEGER = 'integer';
    const STRING = 'string';
    const NUMBER = 'number';
    const DATE = 'date';

    queries.push(
        conn.createTable('Job')
            .column('id', STRING)
            .column('title', STRING)
            .column('minSalary', NUMBER)
            .column('maxSalary', NUMBER)
            .primaryKey('id')
            .index('idx_maxSalary', {name: 'maxSalary', order: 'desc'})
    );
    queries.push(
        conn.createTable('Region')
            .column('id', STRING)
            .column('name', STRING)
            .primaryKey('id')
    );
    queries.push(
        conn.createTable('Country')
            .column('id', INTEGER)
            .column('name', STRING)
            .column('regionId', STRING)
            .primaryKey('id', /* autoIncrement */ true)
            .foreignKey('fk_RegionId', 'regionId', 'Region.id')
    );
    queries.push(
        conn.createTable('Location')
            .column('id', STRING)
            .column('streetAddress', STRING)
            .column('postalCode', STRING)
            .column('city', STRING)
            .column('stateProvince', STRING)
            .column('countryId', INTEGER)
            .primaryKey('id')
            .foreignKey('fk_CountryId', 'countryId', 'Country.id')
    );
    queries.push(
        conn.createTable('Department')
            .column('id', STRING)
            .column('name', STRING)
            .column('managerId', STRING)
            .column('locationId', STRING)
            .primaryKey('id')
            .foreignKey('fk_LocationId', 'locationId', 'Location.id')
    );
    queries.push(
        conn.createTable('Employee')
            .column('id', STRING)
            .column('firstName', STRING, true)
            .column('lastName', STRING, true)
            .column('email', STRING, true)
            .column('phoneNumber', STRING, true)
            .column('hireDate', DATE)
            .column('jobId', STRING)
            .column('salary', NUMBER)
            .column('commissionPercent', NUMBER)
            .column('managerId', STRING)
            .column('departmentId', STRING)
            .column('photo', 'blob')
            .primaryKey('id')
            .foreignKey('fk_JobId', 'jobId', 'Job.id')
            .foreignKey('fk_DepartmentId', 'departmentId', 'Department.id')
            .index('ids_salary', {name: 'salary', order: 'desc'})
    );
    queries.push(
        conn.createTable('JobHistory')
            .column('employeeId', STRING)
            .column('startDate', DATE)
            .column('endDate', DATE)
            .column('jobId', STRING)
            .column('departmentId', STRING)
            .foreignKey('fk_EmployeeId', 'employeeId', 'Employee.id')
            .foreignKey('fk_DepartmentId', 'departmentId', 'Department.id')
    );
    queries.push(
        conn.createTable('Holiday')
            .column('name', STRING)
            .column('begin', DATE)
            .column('end', DATE)
            .primaryKey('name')
            .index('idx_begin', 'begin')
    );
    return tx.exec(queries);
  }

  static SAMPLE_REGIONS = [
    {id: 'regionId', name: 'dummyRegionName'},
    {id: 'regionId2', name: 'dummyRegionName2'},
    {id: 'regionId3', name: 'dummyRegionName3'}
  ];

  static SAMPLE_COUNTRIES = [
    {id: 1, name: 'dummyCountryName', region: 'regionId'},
    {id: 2, name: 'dummyCountryName2', region: 'regionId'}
  ];

  static SAMPLE_LOCATIONS = [{
    id: 'locationId',
    streetAddress: 'dummyStreetAddress',
    postalCode: 'dummyPostalCode',
    city: 'dummyCity',
    stateProvince: 'dummyStateProvince',
    countryId: 1
  }];

  static SAMPLE_DEPARTMENTS = Samples.DEPARTMENT_NAMES.map((value, index) => {
    return {
      id: 'departmentId' + index.toString(),
      name: value,
      managerId: 'managerId',
      locationId: 'locationId'
    };
  });

  private static SALARY_POOL = [100000, 200000, 300000, 400000, 500000, 600000];
  private static genSalaries(): number[] {
    let s1 = Math.floor(Math.random() * HR.SALARY_POOL.length);
    let s2 = Math.floor(Math.random() * HR.SALARY_POOL.length);
    return [HR.SALARY_POOL[s1], HR.SALARY_POOL[s2]].sort((a, b) => a - b);
  }

  static SAMPLE_JOBS = Samples.JOB_TITLES.map((value, index) => {
    let salaries = HR.genSalaries();
    return {
      id: 'jobId' + index.toString(),
      title: value,
      minSalary: salaries[0],
      maxSalary: salaries[1]
    };
  });

  private static genHireDate(): Date {
    // Tue Jan 01 1980 10:00:00 GMT-0800 (PST)
    let min = new Date(315597600000);
    // Fri Sep 12 2014 13:52:20 GMT-0700 (PDT)
    let max = new Date(1410555147354);

    let diff = Math.random() * (max.getTime() - min.getTime());
    return new Date(min.getTime() + diff);
  }

  static getSampleEmployees(count: number): Object[] {
    let emp = new Array(count);
    for (let i = 0; i < count; ++i) {
      let fnIdx = Math.floor(Math.random() * Samples.FIRST_NAMES.length);
      let fn = Samples.FIRST_NAMES[fnIdx];
      let lnIdx = Math.floor(Math.random() * Samples.LAST_NAMES.length);
      let ln = Samples.LAST_NAMES[lnIdx];
      emp[i] = {
        id: 'employeeId' + i.toString(),
        firstName: fn,
        lastName: ln,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@theweb.com`,
        phoneNumber: String(1000000000 + Math.floor(Math.random() * 999999999)),
        hireDate: HR.genHireDate(),
        jobId: `jobId${i % Samples.JOB_TITLES.length}`,
      };
    }
    return emp;
  }
}
