const glob = require('glob');
const {
  CREATE_DATABASE, CREATE_DATABASE_RESPONSE, DELETE_DATABASE, DELETE_DATABASE_RESPONSE,
  FETCH_DATABASES_TO_DELETE, FETCH_DATABASES_TO_DELETE_RESPONSE, FETCH_DATABASES_TO_CONTINUE,
  FETCH_DATABASES_TO_CONTINUE_RESPONSE, FETCH_DATABASES_TO_TAGS, FETCH_DATABASES_TO_TAGS_RESPONSE,
  FETCH_DATABASES_TO_USERS, FETCH_DATABASES_TO_USERS_RESPONSE, FETCH_USERS_TO_CONTINUE, FETCH_USERS_TO_CONTINUE_RESPONSE,
  FETCH_USERS_TO_VIEW, FETCH_USERS_TO_VIEW_RESPONSE, FETCH_USERS_TO_EDIT, FETCH_USERS_TO_EDIT_RESPONSE, CREATE_USER, CREATE_USER_RESPONSE,
  UPDATE_USER, UPDATE_USER_RESPONSE, CREATE_TAG, CREATE_TAG_RESPONSE, DELETE_TAG, DELETE_TAG_RESPONSE, FETCH_TAGS_TO_TAGS, FETCH_TAGS_TO_TAGS_RESPONSE,
  FETCH_TAGS_TO_USERS, FETCH_TAGS_TO_USERS_RESPONSE, FETCH_TAGS_FOR_SPECIFIC_USER, FETCH_TAGS_FOR_SPECIFIC_USER_RESPONSE
} = require('../util/types')
const path = require('path')
const fs = require('fs')
const { ipcMain } = require("electron");
const sqlite3 = require("sqlite3").verbose();
const moment = require("moment");

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

  static fetchDatabasesToTagsListener(win) {
    ipcMain.on(FETCH_DATABASES_TO_TAGS, async (e, d) => {
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
        if (win && win.window && !win.window.isDestroyed()) {
          e.reply(FETCH_DATABASES_TO_TAGS_RESPONSE, { databases: files })
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  static fetchDatabasesToUsersListener(win) {
    ipcMain.on(FETCH_DATABASES_TO_USERS, async (e, d) => {
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
        if (win && win.window && !win.window.isDestroyed()) {
          e.reply(FETCH_DATABASES_TO_USERS_RESPONSE, { databases: files })
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  static fetchUsersToContinueListener(win) {
    ipcMain.on(FETCH_USERS_TO_CONTINUE, async (e, d) => {
      try {
        let { database } = d;
        if (database && win && !win.isDestroyed()) {
          const db = new sqlite3.Database(
            path.resolve(__dirname, `../../assets/databases/${database}`)
          );
          let users = await new Promise((resolve, reject) => {
            db.all("select * from users", (error, rows) => {
              if (error) {
                reject([]);
                return
              }
              resolve(rows)
            });
          })
          e.reply(FETCH_USERS_TO_CONTINUE_RESPONSE, { users })
          db.close();
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }
  
  static fetchUsersToViewListener(win) {
    ipcMain.on(FETCH_USERS_TO_VIEW, async (e, d) => {
      try {
        let { database } = d;
        if (database && win && win.window && !win.window.isDestroyed()) {
          const db = new sqlite3.Database(
            path.resolve(__dirname, `../../assets/databases/${database}`)
          );
          let users = await new Promise((resolve, reject) => {
            db.all("select * from users", (error, rows) => {
              if (error) {
                reject([]);
                return
              }
              resolve(rows)
            });
          })
          e.reply(FETCH_USERS_TO_VIEW_RESPONSE, { users })
          db.close();
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  static fetchUsersToEditListener(win) {
    ipcMain.on(FETCH_USERS_TO_EDIT, async (e, d) => {
      try {
        let { database } = d;
        if (database && win && win.window && !win.window.isDestroyed()) {
          const db = new sqlite3.Database(
            path.resolve(__dirname, `../../assets/databases/${database}`)
          );
          let users = await new Promise((resolve, reject) => {
            db.all("select * from users", (error, rows) => {
              if (error) {
                reject([]);
                return
              }
              resolve(rows)
            });
          })
          e.reply(FETCH_USERS_TO_EDIT_RESPONSE, { users })
          db.close();
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  static createUserListener(win) {
    ipcMain.on(CREATE_USER, async (e, d) => {
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
          hospitalID,
          affectedSide,
          tags
        } = d;

        if (database) {
          var db = new sqlite3.Database(
            path.resolve(__dirname, `../../assets/databases/${database}`)
          );
          let isDone = await new Promise((resolve, reject) => {
            db.serialize(function () {
              db.run(
                `insert into users(first_name, last_name, year, other_info, sex, height, leg_length, hospital_id, affected_side, weight, surgery_date, injury_date, created_at,updated_at)` +
                `values('${firstName}', '${lastName}', ${year}, '${otherInfo}', '${sex}', ${height}, ${legLength},'${hospitalID}','${affectedSide}', ${weight},` +
                `'${moment(new Date(surgeryDate)).format(
                  "DD-MM-YYYY"
                )}','${moment(new Date(injuryDate)).format(
                  "DD-MM-YYYY"
                )}','${moment(new Date()).format("DD-MM-YYYY")}', '${moment(
                  new Date()
                ).format("DD-MM-YYYY")}')`,
                [],
                async function (error) {
                  if (error) {
                    reject(false);
                    return;
                  }
                  await Promise.all(tags.map((t) => {
                    db.run(
                      `insert into tags(name, user_id) values('${t}',${this.lastID})`
                    );
                  }, function (error) {
                    if (error) {
                      reject(false);
                      return;
                    }
                  }));
                  resolve(true);
                }
              );
            });
          });

          if (isDone && win && win.window && !win.window.isDestroyed()) {
            e.reply(CREATE_USER_RESPONSE, { error: false })
          } else {
            e.reply(CREATE_USER_RESPONSE, { error: true })
          }
          db.close();
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }
  static updateUserListener(win) {
    ipcMain.on(UPDATE_USER, async (e, d) => {
      try {
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
          hospitalID,
          affectedSide,
          tags
        } = d;

        if (database) {
          var db = new sqlite3.Database(
            path.resolve(__dirname, `../../assets/databases/${database}`)
          );
          let isUpdatedUser = await new Promise((resolve, reject) => {
            db.run(
              `update users set first_name='${firstName}', last_name='${lastName}', year=${year}, sex='${sex}',hospital_id='${hospitalID}',affected_side='${affectedSide}', height=${height},` +
              ` leg_length=${legLength} , weight=${weight}, other_info='${otherInfo}' , surgery_date='${moment(
                new Date(surgeryDate)
              ).format("DD-MM-YYYY")}', injury_date='${moment(
                new Date(injuryDate)
              ).format("DD-MM-YYYY")}', updated_at='${moment(new Date()).format(
                "DD-MM-YYYY"
              )}' where id = ${id}`
              , function (error) {
                if (error) {
                  reject(false);
                  return;
                }
                resolve(true);
            });
          })
          let isDeletedOldTags = await new Promise((resolve, reject) => {
            db.run(`delete from tags where user_id=${id}`, function (error) {
              if (error) {
                reject(true);
                return;
              }
              resolve(true);
            });
          })
          let isInsertedNewTags = await Promise.all(
            tags.map((t) => {
              db.run(
                `insert into tags(name, user_id) values('${t}',${id})`
              );
            })
          )
          db.close();
          if (isUpdatedUser && isDeletedOldTags && isInsertedNewTags && win && win.window && !win.window.isDestroyed()) {
            e.reply(UPDATE_USER_RESPONSE, { error: false })
          } else {
            e.reply(UPDATE_USER_RESPONSE, { error: true })
          }
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  static createTagListener(win) {
    ipcMain.on(CREATE_TAG, async (e, d) => {
      try {
        let { database, tag } = d;
        if (database && tag) {
          var db = new sqlite3.Database(
            path.resolve(__dirname, `../../assets/databases/${database}`)
          );
    
          let isDone = await new Promise((resolve, reject) => {
            db.run(`insert into tags(name, user_id) values('${tag}',-1)`, function (error) {
              if (error) {
                reject(false);
                return
              }
              resolve(true)
            });
          })
          if (isDone && win && win.window && !win.window.isDestroyed()) {
            e.reply(CREATE_TAG_RESPONSE, { error: false });
          } else {
            e.reply(CREATE_TAG_RESPONSE, { error: true });
          }
          db.close();
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }
  
  static deleteTagListener(win) {
    ipcMain.on(DELETE_TAG, async (e, d) => {
      try {
        let { database, tagId } = d;
        if (database && tagId) {
          var db = new sqlite3.Database(
            path.resolve(__dirname, `../../assets/databases/${database}`)
          );

          let isDone = await new Promise((resolve, reject) => {
            db.run(`delete from tags where id=${tagId}`, function (error) {
              if (error) {
                reject(false);
                return
              }
              resolve(true)
            });
          })
          if (isDone && win && win.window && !win.window.isDestroyed()) {
            e.reply(DELETE_TAG_RESPONSE, { error: false });
          } else {
            e.reply(DELETE_TAG_RESPONSE, { error: true });
          }
          db.close();
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  static fetchTagsListener(win) {
    ipcMain.on(FETCH_TAGS_TO_TAGS, async (e, d) => {
      try {
        let { database } = d;
        if (database) {
          var db = new sqlite3.Database(
            path.resolve(__dirname, `../../assets/databases/${database}`)
          );

          let tags = await new Promise((resolve, reject) => {
            db.all(`select * from tags where user_id=-1`, function (error,rows) {
              if (error) {
                reject([]);
                return
              }
              resolve(rows)
            });
          })
          db.close();
          if (win && win.window && !win.window.isDestroyed()) {
            e.reply(FETCH_TAGS_TO_TAGS_RESPONSE, { tags });
          }
        }
      } catch (e) {
        throw new Error(e);
      }
    })
  }
  
  static fetchTagsToUsersListener(win) {
    ipcMain.on(FETCH_TAGS_TO_USERS, async (e, d) => {
      try {
        let { database } = d;
        if (database) {
          var db = new sqlite3.Database(
            path.resolve(__dirname, `../../assets/databases/${database}`)
          );

          let tags = await new Promise((resolve, reject) => {
            db.all(`select * from tags where user_id=-1`, function (error, rows) {
              if (error) {
                reject([]);
                return
              }
              resolve(rows)
            });
          })
          db.close();
          if (win && win.window && !win.window.isDestroyed()) {
            e.reply(FETCH_TAGS_TO_USERS_RESPONSE, { tags });
          }
        }
      } catch (e) {
        throw new Error(e);
      }
    })
  }

  static fetchTagsForSpecificUserListener(win) {
    ipcMain.on(FETCH_TAGS_FOR_SPECIFIC_USER, async (e, d) => {
      try {
        let { database, userId } = d;
        if (database && userId) {
          var db = new sqlite3.Database(
            path.resolve(__dirname, `../../assets/databases/${database}`)
          );
          let tags = await new Promise((resolve, reject) => {
            db.all(`select * from tags where user_id=${userId}`, function (error, rows) {
              if (error) {
                reject([]);
                return
              }
              resolve(rows)
            });
          });
          db.close();
          if (win && win.window && !win.window.isDestroyed()) {
            e.reply(FETCH_TAGS_FOR_SPECIFIC_USER_RESPONSE, { tags });
          }
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }
}
module.exports = Events;