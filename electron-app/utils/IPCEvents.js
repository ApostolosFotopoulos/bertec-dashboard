const path = require("path");
const { ipcMain } = require("electron");
const { v4: generateRandomHash } = require("uuid");
const sqlite3 = require("sqlite3").verbose();
const { promises: fs } = require("fs");
const moment = require("moment");

class IPCEvents {
  constructor() {
    this.selectedDatabase = "";
  }

  /**
   * The user provides a database name and we create a database with
   *  a predefined name after we check for duplicates.
   */
  createDatabaseEvent() {
    ipcMain.on("CREATE_DATABASE", async (_, d) => {
      try {
        let { database } = d;

        // Check if there are similar databases with the provided name
        let databases = await fs.readdir(
          path.resolve(__dirname, "../../assets/databases")
        );
        let similarDbNamesLen = databases.filter(
          (d) => d.substr(0, d.lastIndexOf("_")) == database
        ).length;

        if (similarDbNamesLen > 0) {
          database = `${database}_${similarDbNamesLen}`;
        } else {
          database = `${database}_0`;
        }
        database = `${database}.db`;

        // Create a new database
        const db = new sqlite3.Database(
          path.resolve(__dirname, `../../assets/databases/${database}`)
        );
        db.serialize(function() {
          db.run(
            "create table users(id integer primary key autoincrement, first_name text, last_name text, " +
              " year integer, other_info text, sex text, height float, leg_length float, weight float, " +
              "hospital_code text, injury_date date, surgery_date date, affected_side text ,created_at date, updated_at date)"
          );
          db.run(
            "create table tags(id integer primary key autoincrement, name text, user_id integer)"
          );
        });
        db.close();
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * The user provide a database name to be deleted. Then we use the
   * unlink method to delete the selected database
   */
  deleteDatabaseEvent() {
    ipcMain.on("DELETE_DATABASE", async (_, d) => {
      try {
        let { database } = d;
        const deleteFile = path.resolve(
          __dirname,
          `../../assets/databases/${database}`
        );
        await fs.unlink(deleteFile);
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * Fetch all the databases to the delete section
   * in order to delete a selected one.
   */
  fetchDatabasesToDeleteEvent() {
    ipcMain.on("FETCH_DATABASES_TO_DELETE", async (e) => {
      try {
        let databases = await fs.readdir(
          path.resolve(__dirname, "../../assets/databases")
        );
        e.reply("FETCH_DATABASES_TO_DELETE_RESPONSE", { databases });
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * Fetch all the databases to continue to the trial menu
   */
  fetchDatabasesToContinueToTrialEvent() {
    ipcMain.on("FETCH_DATABASES_TO_CONTINUE", async (e) => {
      try {
        let databases = await fs.readdir(
          path.resolve(__dirname, "../../assets/databases")
        );
        e.reply("FETCH_DATABASES_TO_CONTINUE_RESPONSE", { databases });
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * Fetch all the users from a database that the user
   * selects.
   */
  fetchUsersToContinueToTrialEvent() {
    ipcMain.on("FETCH_ALL_USERS_TO_CONTINUE", async (e, d) => {
      try {
        const { database } = d;
        this.selectedDatabase = database;
        if (this.selectedDatabase != "") {
          const db = new sqlite3.Database(
            path.resolve(__dirname, `../../assets/databases/${database}`)
          );
          db.all("select * from users", (err, rows) => {
            e.reply("FETCH_ALL_USERS_TO_CONTINUE_RESPONSE", { users: rows });
          });
        } else {
          e.reply("FETCH_ALL_USERS_TO_CONTINUE_RESPONSE", { users: [] });
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * Users Events
   */
  fetchAllDatabasesEvent() {
    ipcMain.on("FETCH_ALL_DATABASES", async (e) => {
      try {
        let databases = await fs.readdir(
          path.resolve(__dirname, "../../assets/databases")
        );
        e.reply("FETCH_ALL_DATABASES_RESPONSE", { databases });
        e.reply("FETCH_SELECTED_DATABASE_RESPONSE", {
          database: this.selectedDatabase,
        });
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  fetchAllUsersEvent() {
    ipcMain.on("FETCH_ALL_USERS", (e, d) => {
      const { database } = d;
      this.selectedDatabase = database;
      if (this.selectedDatabase && this.selectedDatabase != "") {
        const db = new sqlite3.Database(
          path.resolve(__dirname, `../../assets/databases/${database}`)
        );
        db.all("select * from users", (err, rows) => {
          e.reply("FETCH_ALL_USERS_RESPONSE", { users: rows });
        });
      } else {
        e.reply("FETCH_ALL_USERS_RESPONSE", { users: [] });
      }
    });
  }

  createUserEvent() {
    ipcMain.on("CREATE_USER", (_, d) => {
      const {
        database,
        firstName,
        lastName,
        year,
        sex,
        height,
        legLength,
        weight,
        otherInfo,
        hospitalCode,
        surgeryDate,
        injuryDate,
        affectedSide,
      } = d;
      const db = new sqlite3.Database(
        path.resolve(__dirname, `../../assets/databases/${database}`)
      );
      db.run(
        `insert into users(first_name, last_name, year, other_info, sex, height, leg_length, weight,hospital_code, surgery_date, injury_date, affected_side, created_at,updated_at)` +
          `values('${firstName}', '${lastName}', ${year}, '${otherInfo}', '${sex}', ${height}, ${legLength}, ${weight},` +
          `'${hospitalCode}','${moment(new Date(surgeryDate)).format(
            "DD - MM - YYYY"
          )}','${moment(new Date(injuryDate)).format(
            "DD - MM - YYYY"
          )}','${affectedSide}','${moment(new Date()).format(
            "DD - MM - YYYY"
          )}', '${moment(new Date()).format("DD - MM - YYYY")}')`
      );
    });
  }

  queryUsersEvent() {
    ipcMain.on("QUERY_USERS", (e, d) => {
      console.log(this.selectedDatabase);
      if (this.selectedDatabase != "") {
        console.log(this.selectedDatabase);
        const { firstName, lastName, year, weight, sex, height, legLength } = d;
        const db = new sqlite3.Database(
          path.resolve(
            __dirname,
            `../../assets/databases/${this.selectedDatabase}`
          )
        );

        let sqlQuery = "select * from users";

        if (firstName != "") {
          sqlQuery += sqlQuery.includes("where")
            ? ` and firstName like '%${firstName}%'`
            : ` where firstName like '%${firstName}%'`;
        }

        if (lastName != "") {
          sqlQuery += sqlQuery.includes("where")
            ? ` and lastName like '%${lastName}%'`
            : ` where lastName like '%${lastName}%'`;
        }

        if (sex != "All" && sex != "") {
          sqlQuery += sqlQuery.includes("where")
            ? ` and sex='${sex}'`
            : ` where sex='${sex}'`;
        }

        sqlQuery += sqlQuery.includes("where")
          ? ` and weight between ${weight[0]} and ${weight[1]}`
          : ` where weight between ${weight[0]} and ${weight[1]}`;
        sqlQuery += sqlQuery.includes("where")
          ? ` and year between ${year[0]} and ${year[1]}`
          : ` where year between ${year[0]} and ${year[1]}`;
        sqlQuery += sqlQuery.includes("where")
          ? ` and height between ${height[0]} and ${height[1]}`
          : ` where height between ${height[0]} and ${height[1]}`;
        sqlQuery += sqlQuery.includes("where")
          ? ` and leg_length between ${legLength[0]} and ${legLength[1]}`
          : ` where leg_length between ${legLength[0]} and ${legLength[1]}`;

        console.log(sqlQuery);
        db.all(sqlQuery, (err, rows) => {
          console.log(rows);
          e.reply("FETCH_ALL_USERS_RESPONSE", { users: rows });
        });
      } else {
        e.reply("FETCH_ALL_USERS_RESPONSE", { users: [] });
      }
    });
  }
}

module.exports = IPCEvents;
