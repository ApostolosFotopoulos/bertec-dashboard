const path = require("path");
const { ipcMain } = require("electron");
const { v4: generateRandomHash } = require("uuid");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
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
        fs.readdir(
          path.resolve(__dirname, "../../assets/databases"),
          (err, files) => {
            let databases = files;
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
                  " injury_date date, surgery_date date ,created_at date, updated_at date)"
              );
              db.run(
                "create table tags(id integer primary key autoincrement, name text, user_id integer)"
              );
            });
            db.close();
          }
        );
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
  fetchDatabasesToDeleteEvent(win) {
    ipcMain.on("FETCH_DATABASES_TO_DELETE", async (e) => {
      try {
        fs.readdir(
          path.resolve(__dirname, "../../assets/databases"),
          (err, files) => {
            if (win && !win.isDestroyed()) {
              e.reply("FETCH_DATABASES_TO_DELETE_RESPONSE", {
                databases: files,
              });
            }
          }
        );
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * Fetch all the databases to continue to the trial menu
   */
  fetchDatabasesToContinueToTrialEvent(win) {
    ipcMain.on("FETCH_DATABASES_TO_CONTINUE", async (e) => {
      try {
        fs.readdir(
          path.resolve(__dirname, "../../assets/databases"),
          (err, files) => {
            if (win && !win.isDestroyed()) {
              e.reply("FETCH_DATABASES_TO_CONTINUE_RESPONSE", {
                databases: files,
              });
            }
          }
        );
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * Fetch all the users from a database that the user
   * selects.
   */
  fetchUsersToContinueToTrialEvent(win) {
    ipcMain.on("FETCH_ALL_USERS_TO_CONTINUE", async (e, d) => {
      try {
        const { database } = d;
        this.selectedDatabase = database;
        if (this.selectedDatabase != "") {
          const db = new sqlite3.Database(
            path.resolve(__dirname, `../../assets/databases/${database}`)
          );
          db.all("select * from users", (err, rows) => {
            if (win && !win.isDestroyed()) {
              e.reply("FETCH_ALL_USERS_TO_CONTINUE_RESPONSE", { users: rows });
            }
          });
        } else {
          if (win && !win.isDestroyed()) {
            e.reply("FETCH_ALL_USERS_TO_CONTINUE_RESPONSE", { users: [] });
          }
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * Fetch all the databases at the tag management
   * window to handle the tags for each database
   */
  fetchDatabasesToTagManagementEvent(win) {
    ipcMain.on("FETCH_DATABASES_TO_TAG_MANAGEMENT", async (e, d) => {
      try {
        fs.readdir(
          path.resolve(__dirname, "../../assets/databases"),
          (err, files) => {
            if (win && win.window && !win.window.isDestroyed()) {
              e.reply("FETCH_DATABASES_TO_TAG_MANAGEMENT_RESPONSE", {
                databases: files,
              });
            }
          }
        );
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * Create a new tag to a specific database
   */
  createTagEvent() {
    ipcMain.on("CREATE_TAG", async (_, d) => {
      try {
        const { database, tag } = d;
        const db = new sqlite3.Database(
          path.resolve(__dirname, `../../assets/databases/${database}`)
        );
        db.run(`insert into tags(name, user_id) values('${tag}',-1)`);
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * Delete a tag from a specific database
   */
  deleteTagEvent() {
    ipcMain.on("DELETE_TAG", async (_, d) => {
      try {
        const { database, tagId } = d;
        const db = new sqlite3.Database(
          path.resolve(__dirname, `../../assets/databases/${database}`)
        );
        db.run(`delete from tags where id=${tagId}`);
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * Fetch the created tags from a specific database
   */
  fetchTagToTagManagementEvent(win) {
    ipcMain.on("FETCH_TAG_TO_TAG_MANAGEMENT", async (e, d) => {
      try {
        const { database } = d;
        if (database && database != "") {
          const db = new sqlite3.Database(
            path.resolve(__dirname, `../../assets/databases/${database}`)
          );
          if (win && win.window && !win.window.isDestroyed()) {
            db.all("select * from tags where user_id=-1", (err, rows) => {
              e.reply("FETCH_TAG_TO_TAG_MANAGEMENT_RESPONSE", { tags: rows });
            });
          }
        } else {
          if (win && win.window && !win.window.isDestroyed()) {
            e.reply("FETCH_TAG_TO_TAG_MANAGEMENT_RESPONSE", { tags: [] });
          }
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * Fetch the created tags from a specific database
   */
  fetchTagToUserManagementEvent(win) {
    ipcMain.on("FETCH_TAGS_TO_USER_MANAGEMENT", async (e, d) => {
      try {
        const { database } = d;
        if (database && database != "") {
          const db = new sqlite3.Database(
            path.resolve(__dirname, `../../assets/databases/${database}`)
          );
          db.all("select * from tags where user_id=-1", (err, rows) => {
            if (win && win.window && !win.window.isDestroyed()) {
              e.reply("FETCH_TAGS_TO_USER_MANAGEMENT_RESPONSE", { tags: rows });
            }
          });
        } else {
          if (win && win.window && !win.window.isDestroyed()) {
            e.reply("FETCH_TAGS_TO_USER_MANAGEMENT_RESPONSE", { tags: [] });
          }
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * Fetch all the databases at the user creation.
   */
  fetchDatabasesToUserManagementEvent(win) {
    ipcMain.on("FETCH_DATABASES_TO_USER_MANAGEMENT", async (e, d) => {
      try {
        fs.readdir(
          path.resolve(__dirname, "../../assets/databases"),
          (err, files) => {
            if (win && win.window && !win.window.isDestroyed()) {
              e.reply("FETCH_DATABASES_TO_USER_MANAGEMENT_RESPONSE", {
                databases: files,
              });
            }
          }
        );
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * Create a user at a specific database and then create all
   * the tags that are binded to the created user.
   */
  createUserEvent() {
    ipcMain.on("CREATE_USER", (_, d) => {
      try {
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
          surgeryDate,
          injuryDate,
          tags,
        } = d;

        const db = new sqlite3.Database(
          path.resolve(__dirname, `../../assets/databases/${database}`)
        );
        db.serialize(function() {
          db.run(
            `insert into users(first_name, last_name, year, other_info, sex, height, leg_length, weight, surgery_date, injury_date, created_at,updated_at)` +
              `values('${firstName}', '${lastName}', ${year}, '${otherInfo}', '${sex}', ${height}, ${legLength}, ${weight},` +
              `'${moment(new Date(surgeryDate)).format(
                "DD-MM-YYYY"
              )}','${moment(new Date(injuryDate)).format(
                "DD-MM-YYYY"
              )}','${moment(new Date()).format("DD-MM-YYYY")}', '${moment(
                new Date()
              ).format("DD-MM-YYYY")}')`,
            [],
            function() {
              tags.map((t) => {
                db.run(
                  `insert into tags(name, user_id) values('${t}',${this.lastID})`
                );
              });
            }
          );
        });
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  /**
   * Fetch all the users to edit a specific user.
   */
  fetchAllUsersToEditEvent(win) {
    ipcMain.on("FETCH_ALL_USERS_TO_EDIT", (e, d) => {
      const { database } = d;
      this.selectedDatabase = database;
      if (this.selectedDatabase && this.selectedDatabase != "") {
        const db = new sqlite3.Database(
          path.resolve(__dirname, `../../assets/databases/${database}`)
        );
        db.all("select * from users", (err, rows) => {
          if (win && win.window && !win.window.isDestroyed()) {
            e.reply("FETCH_ALL_USERS_TO_EDIT_RESPONSE", { users: rows });
          }
        });
      } else {
        if (win && win.window && !win.window.isDestroyed()) {
          e.reply("FETCH_ALL_USERS_TO_EDIT_RESPONSE", { users: [] });
        }
      }
    });
  }

  /**
   * Fetch all the tags that belong to a user.
   */
  fetchAllTagsForUserEvent(win) {
    ipcMain.on("FETCH_ALL_TAGS_FOR_USER_TO_USER_MANAGEMENT", (e, d) => {
      const { database, userId } = d;
      if (database && database != "") {
        const db = new sqlite3.Database(
          path.resolve(__dirname, `../../assets/databases/${database}`)
        );
        db.all(`select * from tags where user_id=${userId}`, (err, rows) => {
          if (win && win.window && !win.window.isDestroyed()) {
            e.reply("FETCH_ALL_TAGS_FOR_USER_TO_USER_MANAGEMENT_RESPONSE", {
              tags: rows,
            });
          }
        });
        db.close();
      } else {
        if (win && win.window && !win.window.isDestroyed()) {
          e.reply("FETCH_ALL_TAGS_FOR_USER_TO_USER_MANAGEMENT_RESPONSE", {
            tags: [],
          });
        }
      }
    });
  }

  /**
   * Update the user with the new details.
   */
  updateUserEvent() {
    ipcMain.on("UPDATE_USER", (_, d) => {
      const {
        id,
        database,
        firstName,
        lastName,
        year,
        sex,
        height,
        legLength,
        weight,
        otherInfo,
        surgeryDate,
        injuryDate,
        tags,
      } = d;

      if (database && database != "") {
        const db = new sqlite3.Database(
          path.resolve(__dirname, `../../assets/databases/${database}`)
        );
        db.run(
          `update users set first_name='${firstName}', last_name='${lastName}', year=${year}, sex='${sex}', height=${height},` +
            ` leg_length=${legLength} , weight=${weight}, other_info='${otherInfo}' , surgery_date='${moment(
              new Date(surgeryDate)
            ).format("DD-MM-YYYY")}', injury_date='${moment(
              new Date(injuryDate)
            ).format("DD-MM-YYYY")}', updated_at='${moment(new Date()).format(
              "DD-MM-YYYY"
            )}' where id = ${id}`
        );
        db.run(`delete from tags where user_id=${id}`);
        tags.map((t) => {
          db.run(
            `insert into tags(name, user_id) values('${t}',${id})`
          );
        });
        db.close();
      }
    });
  }

  /**
   * Fetch all the users from a specific database
   */
  fetchAllUsersToViewEvent(win) {
    ipcMain.on("FETCH_ALL_USERS_TO_VIEW", (e, d) => {
      const { database } = d;
      this.selectedDatabase = database;
      if (this.selectedDatabase && this.selectedDatabase != "") {
        const db = new sqlite3.Database(
          path.resolve(__dirname, `../../assets/databases/${database}`)
        );
        db.all("select * from users", (err, rows) => {
          if (win && win.window && !win.window.isDestroyed()) {
            e.reply("FETCH_ALL_USERS_TO_VIEW_RESPONSE", { users: rows });
          }
        });
      } else {
        if (win && win.window && !win.window.isDestroyed()) {
          e.reply("FETCH_ALL_USERS_TO_VIEW_RESPONSE", { users: [] });
        }
      }
    });
  }

  queryUsersEvent() {
    ipcMain.on("QUERY_USERS", (e, d) => {
      if (this.selectedDatabase != "") {
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
