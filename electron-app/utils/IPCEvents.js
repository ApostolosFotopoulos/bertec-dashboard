const path = require('path');
const { ipcMain } = require('electron');
const { v4: generateRandomHash } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const { promises: fs } = require('fs');
const moment = require('moment');

class IPCEvents {
	constructor() {
		this.selectedDatabase = '';
	}

	createDatabaseEvent() {
		ipcMain.on('CREATE_DATABASE', (_, d) => {
			let { database } = d;

			// Generate a random name + the predefined to be unique
			database = `${database}_${generateRandomHash()}.db`;

			// Create the database and initialize the schema of the datatables
			const db = new sqlite3.Database(path.resolve(__dirname, `../../assets/databases/${database}`));
			db.serialize(function() {
				db.run(
					'create table users(id integer primary key autoincrement, firstName text, lastName text,' +
						'year integer, other_info text, sex text, height integer, leg_length integer,weight float,' +
						'created_at date, updated_at date)'
				);
			});
			db.close();
		});
	}

	fetchAllDatabasesEvent() {
		ipcMain.on('FETCH_ALL_DATABASES', async (e) => {
			try {
				let databases = await fs.readdir(path.resolve(__dirname, '../../assets/databases'));
				e.reply('FETCH_ALL_DATABASES_RESPONSE', { databases });
				e.reply('FETCH_SELECTED_DATABASE_RESPONSE', { database: this.selectedDatabase});
			} catch (e) {
				throw new Error(e);
			}
		});
	}

	fetchAllUsersEvent() {
		ipcMain.on('FETCH_ALL_USERS', (e, d) => {
			const { database } = d;
			this.selectedDatabase = database;

			const db = new sqlite3.Database(path.resolve(__dirname, `../../assets/databases/${database}`));
			db.all('select * from users', (err, rows) => {
				e.reply('FETCH_ALL_USERS_RESPONSE', { users: rows });
			});
		});
	}

	createUserEvent() {
		ipcMain.on('CREATE_USER', (_, d) => {
			const { database, firstName, lastName, year, sex, height, legLength, weight, otherInfo } = d;
			const db = new sqlite3.Database(path.resolve(__dirname, `../../assets/databases/${database}`));
			db.run(
				`insert into users(firstName, lastName, year, other_info, sex, height, leg_length, weight, created_at,updated_at)` +
					`values('${firstName}', '${lastName}', ${year}, '${otherInfo}', '${sex}', ${height}, ${legLength}, ${weight},` +
					`${moment(new Date()).format('DD - MM - YYYY')}', '${moment(new Date()).format('DD - MM - YYYY')}')`
			);
		});
	}

	queryUsersEvent() {
		ipcMain.on('QUERY_USERS', (e, d) => {
			console.log(this.selectedDatabase);
			if (this.selectedDatabase != '') {
				console.log(this.selectedDatabase);
				const { firstName, lastName, year, weight, sex, height, legLength } = d;
				const db = new sqlite3.Database(
					path.resolve(__dirname, `../../assets/databases/${this.selectedDatabase}`)
				);

				let sqlQuery = 'select * from users';

				if (firstName != '') {
					sqlQuery += sqlQuery.includes('where')
						? ` and firstName like '%${firstName}%'`
						: ` where firstName like '%${firstName}%'`;
				}

				if (lastName != '') {
					sqlQuery += sqlQuery.includes('where')
						? ` and lastName like '%${lastName}%'`
						: ` where lastName like '%${lastName}%'`;
				}

				if (sex != 'All' && sex != '') {
					sqlQuery += sqlQuery.includes('where') ? ` and sex='${sex}'` : ` where sex='${sex}'`;
				}

				sqlQuery += sqlQuery.includes('where')
					? ` and weight between ${weight[0]} and ${weight[1]}`
					: ` where weight between ${weight[0]} and ${weight[1]}`;
				sqlQuery += sqlQuery.includes('where')
					? ` and year between ${year[0]} and ${year[1]}`
					: ` where year between ${year[0]} and ${year[1]}`;
				sqlQuery += sqlQuery.includes('where')
					? ` and height between ${height[0]} and ${height[1]}`
					: ` where height between ${height[0]} and ${height[1]}`;
				sqlQuery += sqlQuery.includes('where')
					? ` and leg_length between ${legLength[0]} and ${legLength[1]}`
					: ` where leg_length between ${legLength[0]} and ${legLength[1]}`;

				console.log(sqlQuery);
				db.all(sqlQuery, (err, rows) => {
					console.log(rows);
					e.reply('FETCH_ALL_USERS_RESPONSE', { users: rows });
				});
			} else {
				e.reply('FETCH_ALL_USERS_RESPONSE', { users: [] });
			}
		});
	}
}

module.exports = IPCEvents;
