const glob = require('glob');
const {
  CREATE_DATABASE, CREATE_DATABASE_RESPONSE, DELETE_DATABASE, DELETE_DATABASE_RESPONSE,
  FETCH_DATABASES_TO_DELETE, FETCH_DATABASES_TO_DELETE_RESPONSE, FETCH_DATABASES_TO_CONTINUE,
  FETCH_DATABASES_TO_CONTINUE_RESPONSE
} = require('../util/types')
const path = require('path')
const fs = require('fs')
const { ipcMain } = require("electron");
const sqlite3 = require("sqlite3").verbose();

class Events {
  static createDatabaseListener(win) {
    ipcMain.on(CREATE_DATABASE, async (e, d) => {
      try {
        let { database } = d;

        if (database) {
          let files = await new Promise((resolve, reject) => {
            glob(path.resolve(__dirname, "../../assets/databases/*.db"), (error, files) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(files.map(filePath => path.basename(filePath)));
            });
          })
          if (files.filter(f => f === database + ".db").length > 0) {
            if (win && !win.isDestroyed()) {
              console.log("[ERROR]: Database already exists")
              e.reply(CREATE_DATABASE_RESPONSE, { error: true })
            }
          } else {
            if (win && !win.isDestroyed()) {
              const db = new sqlite3.Database(
                path.resolve(__dirname, `../../assets/databases/${database}.db`)
              );
              db.serialize(function () {
                db.run(
                  "create table users(id integer primary key autoincrement, first_name text, last_name text, hospital_id text," +
                  " affected_side text, year integer, other_info text, sex text, height float, leg_length float, weight float, " +
                  " injury_date date, surgery_date date ,created_at date, updated_at date)"
                );
                db.run(
                  "create table tags(id integer primary key autoincrement, name text, user_id integer)"
                );
              });
              db.close();
              console.log("[SUCCESS]: Database successfully created")
              e.reply(CREATE_DATABASE_RESPONSE, { error: false })
            }
          }
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  static deleteDatabaseListener(win) {
    ipcMain.on(DELETE_DATABASE, async (e, d) => {
      try {
        let { database } = d
        if (database) {
          let isDone = await new Promise((resolve, reject) => {
            fs.rename(path.resolve(__dirname, `../../assets/databases/${database}`), path.resolve(__dirname, `../../assets/databases/${database}.deleted`), function (error) {
              if (error) {
                reject(false);
                return;
              }
              resolve(true);
            })
          })
          if (win && !win.isDestroyed()) {
            if (isDone) {
              e.reply(DELETE_DATABASE_RESPONSE, { error: false })
            } else {
              e.reply(DELETE_DATABASE_RESPONSE, { error: true })
            }
          }
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  static fetchDatabasesToDeleteListener(win) {
    ipcMain.on(FETCH_DATABASES_TO_DELETE, async (e, d) => {
      try {
        let files = await new Promise((resolve, reject) => {
          glob(path.resolve(__dirname, "../../assets/databases/*.db"), (error, files) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(files.map(filePath => path.basename(filePath)));
          });
        })
        if (win && !win.isDestroyed()) {
          e.reply(FETCH_DATABASES_TO_DELETE_RESPONSE, { databases: files })
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  static fetchDatabasesToContinueListener(win) {
    ipcMain.on(FETCH_DATABASES_TO_CONTINUE, async (e, d) => {
      try {
        let files = await new Promise((resolve, reject) => {
          glob(path.resolve(__dirname, "../../assets/databases/*.db"), (error, files) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(files.map(filePath => path.basename(filePath)));
          });
        })
        if (win && !win.isDestroyed()) {
          e.reply(FETCH_DATABASES_TO_CONTINUE_RESPONSE, { databases: files })
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }
}
module.exports = Events;