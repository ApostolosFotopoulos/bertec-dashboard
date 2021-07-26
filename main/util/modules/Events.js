const glob = require('glob');
const {
  CREATE_DATABASE, CREATE_DATABASE_RESPONSE, DELETE_DATABASE, DELETE_DATABASE_RESPONSE,
  FETCH_DATABASES_TO_DELETE, FETCH_DATABASES_TO_DELETE_RESPONSE, FETCH_DATABASES_TO_CONTINUE,
  FETCH_DATABASES_TO_CONTINUE_RESPONSE, FETCH_DATABASES_TO_TAGS, FETCH_DATABASES_TO_TAGS_RESPONSE,
  FETCH_DATABASES_TO_USERS, FETCH_DATABASES_TO_USERS_RESPONSE, FETCH_USERS_TO_CONTINUE, FETCH_USERS_TO_CONTINUE_RESPONSE,
  FETCH_USERS_TO_VIEW, FETCH_USERS_TO_VIEW_RESPONSE, FETCH_USERS_TO_EDIT, FETCH_USERS_TO_EDIT_RESPONSE, CREATE_USER, CREATE_USER_RESPONSE,
  UPDATE_USER, UPDATE_USER_RESPONSE, CREATE_TAG, CREATE_TAG_RESPONSE, DELETE_TAG, DELETE_TAG_RESPONSE, FETCH_TAGS_TO_TAGS, FETCH_TAGS_TO_TAGS_RESPONSE,
  FETCH_TAGS_TO_USERS, FETCH_TAGS_TO_USERS_RESPONSE, FETCH_TAGS_FOR_SPECIFIC_USER, FETCH_TAGS_FOR_SPECIFIC_USER_RESPONSE,
  FETCH_DATABASES_TO_VIEW_ALL, FETCH_DATABASES_TO_VIEW_ALL_RESPONSE, FETCH_TAGS_TO_VIEW_ALL, FETCH_TAGS_TO_VIEW_ALL_RESPONSE,
  FETCH_USERS_TO_VIEW_ALL, FETCH_USERS_TO_VIEW_ALL_RESPONSE, DELETE_USER, DELETE_USER_RESPONSE, CREATE_TRIAL, CREATE_SESSION, CREATE_SESSION_RESPONSE,
  CREATE_TRIAL_RESPONSE, DELETE_TRIAL, DELETE_SESSION, DELETE_TRIAL_RESPONSE, DELETE_SESSION_RESPONSE, UPDATE_TRIAL_DETAILS, UPDATE_TRIAL_DETAILS_RESPONSE,
  DOWNLOAD_TRIAL, EXPORT_TRIAL_REPORT, EXPORT_TRIAL_REPORT_RESPONSE, UPDATE_TRIAL_ZONES_AND_THRESHOLD, DOWNLOAD_AVERAGE_METRICS_RESPONSE, DOWNLOAD_AVERAGE_METRICS,
  EDIT_AVERAGE_METRICS
} = require('../types')
const path = require('path')
const fs = require('fs')
const { ipcMain, dialog, app } = require("electron");
const sqlite3 = require("sqlite3").verbose();
const moment = require("moment");
const Processor = require('./Processor');
const Renderer = require('./Renderer');
var parse = require('csv-parse');
const Metrics = require('./Metrics');

// app.getPath("downloads")+'/.meta/databases/*.db' gia production
function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

function arrayToCSV (data) {
  csv = data.map(row => Object.values(row));
  csv.unshift(Object.keys(data[0]));
  return csv.join('\n');
}

class Events {
  static createDatabaseListener(win) {
    ipcMain.on(CREATE_DATABASE, async (e, d) => {
      try {
        let { database } = d;

        if (database) {
          let files = await new Promise((resolve, reject) => {
            glob(process.env.NODE_ENV ? path.resolve(__dirname, "../../../.meta/databases/*.db") : app.getPath("downloads") + "/.meta/databases/*.db", (error, files) => {
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
                process.env.NODE_ENV
                ? path.resolve(__dirname, `../../../.meta/databases/${database}.db`)
                : app.getPath("downloads") + `/.meta/databases/${database}.db`
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
                db.run(
                  "create table sessions(id integer primary key autoincrement, name text, user_id integer, created_at date)"
                );
                db.run(
                  "create table trials(id integer primary key autoincrement, name text, session_id integer, created_at date, user_id integer, filename text, "+
                  " fx_zone_min integer, fx_zone_max, fx_trial_threshold, fy_zone_min integer, fy_zone_max, fy_trial_threshold, fz_zone_min integer, fz_zone_max, fz_trial_threshold)"
                );
              });

              await new Promise((resolve, reject) => {
                if (!fs.existsSync(path.resolve(__dirname, `../../../.meta/metrics/${database}`))) {
                  fs.mkdirSync(path.resolve(__dirname, `../../../.meta/metrics/${database}`));
                  resolve(true);
                }
              });

               await new Promise((resolve, reject) => {
                if (!fs.existsSync(path.resolve(__dirname, `../../../.meta/trials/${database}`))) {
                  fs.mkdirSync(path.resolve(__dirname, `../../../.meta/trials/${database}`));
                  resolve(true);
                }
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
            fs.rename(
              process.env.NODE_ENV
              ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
              : app.getPath("downloads") + `/.meta/databases/${database}`,
              process.env.NODE_ENV
              ? path.resolve(__dirname, `../../../.meta/databases/${database}.deleted`)
              : app.getPath("downloads") + `/.meta/databases/${database}.deleted`
              , function (error) {
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
          glob(
            process.env.NODE_ENV
            ? path.resolve(__dirname, "../../../.meta/databases/*.db")
            : app.getPath("downloads") + "/.meta/databases/*.db" , (error, files) => {
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
          glob(
            process.env.NODE_ENV
            ? path.resolve(__dirname, "../../../.meta/databases/*.db")
            : app.getPath("downloads") + "/.meta/databases/*.db", (error, files) => {
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
          glob(
            process.env.NODE_ENV
            ? path.resolve(__dirname, "../../../.meta/databases/*.db")
            : app.getPath("downloads") + "/.meta/databases/*.db", (error, files) => {
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
          glob(
            process.env.NODE_ENV
            ? path.resolve(__dirname, "../../../.meta/databases/*.db")
            : app.getPath("downloads") + "/.meta/databases/*.db", (error, files) => {
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

  static fetchDatabasesToViewAllListener(win) {
    ipcMain.on(FETCH_DATABASES_TO_VIEW_ALL, async (e, d) => {
      try {
        let files = await new Promise((resolve, reject) => {
          glob(
            process.env.NODE_ENV
            ? path.resolve(__dirname, "../../../.meta/databases/*.db")
            : app.getPath("downloads") + "/.meta/databases/*.db", (error, files) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(files.map(filePath => path.basename(filePath)));
          });
        })
        if (win && win.window && !win.window.isDestroyed()) {
          e.reply(FETCH_DATABASES_TO_VIEW_ALL_RESPONSE, { databases: files })
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
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
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
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
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
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
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
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
          );
          let isDone = await new Promise((resolve, reject) => {
            db.serialize(function () {
              db.run(
                `insert into users(first_name, last_name, year, other_info, sex, height, leg_length, hospital_id, affected_side, weight, surgery_date, injury_date, created_at,updated_at)` +
                `values('${firstName}', '${lastName}', ${year}, '${otherInfo}', '${sex}', ${height}, ${legLength},'${hospitalID}','${affectedSide}', ${weight},` +
                `'${new Date(surgeryDate)}','${new Date(injuryDate)}','${new Date()}','${new Date()}')`,[],
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
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
          );
          let isUpdatedUser = await new Promise((resolve, reject) => {
            db.run(
              `update users set first_name='${firstName}', last_name='${lastName}', year=${year}, sex='${sex}',hospital_id='${hospitalID}',affected_side='${affectedSide}', height=${height},` +
              ` leg_length=${legLength} , weight=${weight}, other_info='${otherInfo}' , surgery_date='${new Date(surgeryDate)}', injury_date='${new Date(injuryDate)}', updated_at='${new Date()}' where id = ${id}`
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

  static deleteUserListener(win) {
    ipcMain.on(DELETE_USER, async (e, d) => {
      try {
        let { database, userId } = d
        if (database && userId) {
          var db = new sqlite3.Database(
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
          );

          let isUserDeleted = await new Promise((resolve, reject) => {
            db.run(`delete from users where id=${userId}`, function (error) {
              if (error) {
                reject(false);
                return
              }
              resolve(true)
            });
          })

          let isTagsDeleted = await new Promise((resolve, reject) => {
            db.run(`delete from tags where user_id=${userId}`, function (error) {
              if (error) {
                reject(false);
                return
              }
              resolve(true)
            });
          })
          if (isUserDeleted && isTagsDeleted && win && win.window && !win.window.isDestroyed()) {
            e.reply(DELETE_USER_RESPONSE, { error: false });
          } else {
            e.reply(DELETE_USER_RESPONSE, { error: true });
          }
          db.close();
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }
  static fetchUsersToViewAllListener(win) {
    ipcMain.on(FETCH_USERS_TO_VIEW_ALL, async (e, d) => {
      try {
        let { database, filters } = d
        if (database && filters) {
          var db = new sqlite3.Database(
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
          );
          if (Object.keys(filters).length > 0) {
            let sqlQuery = "select * from users";

            if (filters.firstName) {
              sqlQuery += sqlQuery.includes("where")
              ? ` and first_name like '%${filters.firstName}%'`
              : ` where first_name like '%${filters.firstName}%'`;
            }

            if (filters.lastName) {
              sqlQuery += sqlQuery.includes("where")
              ? ` and last_name like '%${filters.lastName}%'`
              : ` where last_name like '%${filters.lastName}%'`;
            }

            if (filters.hospitalID) {
              sqlQuery += sqlQuery.includes("where")
              ? ` and hospital_id like '%${filters.hospitalID}%'`
              : ` where hospital_id like '%${filters.hospitalID}%'`;
            }

            if (filters.sex) {
              sqlQuery += sqlQuery.includes("where")
                ? ` and sex='${filters.sex}'`
                : ` where sex='${filters.sex}'`;
            }

            if (filters.affectedSide) {
              sqlQuery += sqlQuery.includes("where")
                ? ` and affected_side='${filters.affectedSide}'`
                : ` where affected_side='${filters.affectedSide}'`;
            }

            if (filters.year && filters.year.length  == 2) {
              sqlQuery += sqlQuery.includes("where")
                ? ` and year between ${filters.year[0]} and ${filters.year[1]}`
                : ` where year between ${filters.year[0]} and ${filters.year[1]}`;
            }

            if (filters.legLength && filters.legLength.length  == 2) {
              sqlQuery += sqlQuery.includes("where")
                ? ` and leg_length between ${filters.legLength[0]} and ${filters.legLength[1]}`
                : ` where leg_length between ${filters.legLength[0]} and ${filters.legLength[1]}`;
            }

            if (filters.weight && filters.weight.length  == 2) {
              sqlQuery += sqlQuery.includes("where")
                ? ` and weight between ${filters.weight[0]} and ${filters.weight[1]}`
                : ` where weight between ${filters.weight[0]} and ${filters.weight[1]}`;
            }

            if (filters.height && filters.height.length  == 2) {
              sqlQuery += sqlQuery.includes("where")
                ? ` and height between ${filters.height[0]} and ${filters.height[1]}`
                : ` where height between ${filters.height[0]} and ${filters.height[1]}`;
            }

            if (filters.surgeryRange && filters.surgeryRange.length  == 2) {
              sqlQuery += sqlQuery.includes("where")
                ? ` and surgery_date between '${filters.surgeryRange[0]}' and '${filters.surgeryRange[1]}'`
                : ` where surgery_date between '${filters.surgeryRange[0]}' and '${filters.surgeryRange[1]}'`;
            }

            if (filters.injuryRange && filters.injuryRange.length  == 2) {
              sqlQuery += sqlQuery.includes("where")
                ? ` and injury_date between '${filters.injuryRange[0]}' and '${filters.injuryRange[1]}'`
                : ` where injury_date between '${filters.injuryRange[0]}' and '${filters.injuryRange[1]}'`;
            }

            if (filters.tags) {
              sqlQuery += sqlQuery.includes("where")
                ? ` and id in (select user_id from tags where name in (${filters.tags.map(t => `'${t}'`).join(",")}))`
                : ` where id in (select user_id from tags where name in (${filters.tags.map(t => `'${t}'`).join(",")}))`;
            }

            let users = await new Promise((resolve, reject) => {
              db.all(sqlQuery, (error, rows) => {
                if (error) {
                  reject([]);
                  return
                }
                resolve(rows)
              });
            })

            let sessions = await new Promise((resolve, reject) => {
              db.all(`select * from sessions where user_id in (${users.map(u => u.id)})`, (error, rows) => {
                if (error) {
                  console.log(error)
                  reject([]);
                  return
                }
                resolve(rows)
              });
            })

            let trials = await new Promise((resolve, reject) => {
              db.all(`select * from trials where session_id in (${sessions.map(s => s.id)})`, (error, rows) => {
                if (error) {
                  console.log(error)
                  reject([]);
                  return
                }
                resolve(rows)
              });
            })
            
            sessions = groupBy(sessions, session => session.user_id)
            users = users.map(u => {
              let sess = sessions.get(u.id) || []
              sess = sess.map(s => {
                return {
                  ...s,
                  created_at: moment(new Date(s.created_at)).format("DD-MM-YYYY HH:mm:ss"),
                  trials:  trials.filter(t=> t.session_id === s.id).map(t => ({...t, created_at: moment(new Date(t.created_at)).format("DD-MM-YYYY HH:mm:ss")})),
                  trial_count: trials.filter(t=> t.session_id === s.id).length,
                }
              })
              return { ...u, sessions: sess }
            })
            db.close();

            
            if (win && win.window && !win.window.isDestroyed()) {
              e.reply(FETCH_USERS_TO_VIEW_ALL_RESPONSE, { users })
            }

          } else {
            let users = await new Promise((resolve, reject) => {
              db.all("select * from users", (error, rows) => {
                if (error) {
                  reject([]);
                  return
                }
                resolve(rows)
              });
            })

            let sessions = await new Promise((resolve, reject) => {
              db.all(`select * from sessions where user_id in (${users.map(u => u.id)})`, (error, rows) => {
                if (error) {
                  console.log(error)
                  reject([]);
                  return
                }
                resolve(rows)
              });
            })

            let trials = await new Promise((resolve, reject) => {
              db.all(`select * from trials where session_id in (${sessions.map(s => s.id)})`, (error, rows) => {
                if (error) {
                  console.log(error)
                  reject([]);
                  return
                }
                resolve(rows)
              });
            })
            
            sessions = groupBy(sessions, session => session.user_id)
            users = users.map(u => {
              let sess = sessions.get(u.id) || []
              
              sess = sess.map(s => {
                return {
                  ...s,
                  created_at: moment(new Date(s.created_at)).format("DD-MM-YYYY HH:mm:ss"),
                  trials:  trials.filter(t=> t.session_id === s.id).map(t => ({...t, created_at: moment(new Date(t.created_at)).format("DD-MM-YYYY HH:mm:ss")})),
                  trial_count: trials.filter(t=> t.session_id === s.id).length,
                }
              })
              return { ...u, sessions: sess }
            })
            db.close();
            
            if (win && win.window && !win.window.isDestroyed()) {
              e.reply(FETCH_USERS_TO_VIEW_ALL_RESPONSE, { users })
            }
          }
        }
      } catch (e) {
        console.log(e)
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
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
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
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
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
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
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
  
  static fetchTagsToViewAllListener(win) {
    ipcMain.on(FETCH_TAGS_TO_VIEW_ALL, async (e, d) => {
      try {
        let { database } = d;
        if (database) {
          var db = new sqlite3.Database(
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
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
            e.reply(FETCH_TAGS_TO_VIEW_ALL_RESPONSE, { tags });
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
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
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
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
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

  static createSessionListener(win) {
    ipcMain.on(CREATE_SESSION, async (e, d) => {
      try {
        let { database, userId, session } = d;
        if (database, userId && session) {
          var db = new sqlite3.Database(
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
          );
          let sessionId = await new Promise((resolve, reject) => {
            db.run(`insert into sessions(name, user_id, created_at) values('${session}',${userId},'${new Date()}')`, function (error, rows) {
              if (error) {
                console.log(error)
                reject(-1);
                return
              }
              resolve(this.lastID)
            });
          });
          db.close();
          if (win && !win.isDestroyed()) {
            e.reply(CREATE_SESSION_RESPONSE, { session: sessionId });
          }
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }
  
  static deleteSessionListener(win) {
    ipcMain.on(DELETE_SESSION, async (e, d) => {
      try {
        let { database, sessionId } = d;
        if (database, sessionId) {
          var db = new sqlite3.Database(
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
          );

          // Get all the trials from the session
          let trials = await new Promise((resolve, reject) => {
            db.all(`select * from trials where session_id=${sessionId}`, function (error, rows) {
              if (error) {
                reject([]);
                return
              }
              resolve(rows)
            });
          });
        
          // Delete the session
          await new Promise((resolve, reject) => {
            db.all(`delete from sessions where id=${sessionId}`, function (error, rows) {
              if (error) {
                reject([]);
                return
              }
              resolve(rows)
            });
          })

          // Delete the session and all the trials
          for (var i = 0; i < trials.length; i++){
            await new Promise((resolve, reject) => {
              db.all(`delete from trials where id=${trials[i].id}`, function (error, rows) {
                if (error) {
                  reject([]);
                  return
                }
                resolve(rows)
              });
            })
            fs.unlink(
              process.env.NODE_ENV
              ? path.resolve(__dirname, `../../../.meta/trials/${database.replace(".db", "")}/${trials[i].filename}`)
              : app.getPath("downloads") + `/.meta/trials/${database.replace(".db", "")}/${trials[i].filename}`
            , () => { })
          }

          if (win && win.window && !win.window.isDestroyed()) {
            e.reply(DELETE_SESSION_RESPONSE, { error: false });
          }
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }
  static createTrialListener(win) {
    ipcMain.on(CREATE_TRIAL, async (e, d) => {
      try {
        let { database, userId, session } = d;
        if (database && userId && session) {
          var db = new sqlite3.Database(
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
          );
          let filename = `session_${session}_trial_${moment(new Date()).format("DD_MM_YYYY_HH_mm_ss")}.csv`
          let trial = `trial_${moment(new Date()).format("DD_MM_YYYY_HH_mm_ss")}`
          let trialId = await new Promise((resolve, reject) => {
            db.run(`insert into trials(filename,name, user_id,session_id,created_at) values('${filename}','${trial}',${userId},${session},'${new Date()}')`, function (error) {
              if (error) {
                console.log(error)
                reject(-1);
                return
              }
              resolve(this.lastID)
            });
          });
          db.close();
          
          if (win && !win.isDestroyed()) {
            e.reply(CREATE_TRIAL_RESPONSE, {
              trial:
              process.env.NODE_ENV
              ? path.resolve(__dirname, `../../../.meta/trials/${database.replace(".db", "")}/${filename}`)
              : app.getPath("downloads") + `/.meta/trials/${database.replace(".db", "")}/${filename}`
            , trialId
            })
          }
        }
      } catch (e) {
        console.log(e)
        throw new Error(e);
      }
    });
  }

  static deleteTrialListener(win) {
    ipcMain.on(DELETE_TRIAL, async (e, d) => {
      try {
        let { database, trialId } = d;
        if (database && trialId) {

          // Find the trial and the details
          var db = new sqlite3.Database(
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
          );
          let [trial] = await new Promise((resolve, reject) => {
            db.all(`select * from trials where id=${trialId}`, function (error, rows) {
              if (error) {
                reject([]);
                return
              }
              resolve(rows)
            });
          });

          // Delete the trial from the database
          let { filename } = trial
          await new Promise((resolve, reject) => {
            db.run(`delete from trials where id=${trialId}`, function (error) {
              if (error) {
                reject(true);
                return;
              }
              resolve(true);
            });
          })
          db.close();

          // Delete the file
          fs.unlink(
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/trials/${database.replace(".db", "")}/${filename}`)
            : app.getPath("downloads") + `/.meta/trials/${database.replace(".db", "")}/${filename}`
          , () => { })
          
          if (win && win.window && !win.window.isDestroyed()) {
            e.reply(DELETE_TRIAL_RESPONSE, { error: false });
          }
        }
        
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  static updateTrialDetailsListener(win) {
    ipcMain.on(UPDATE_TRIAL_DETAILS, async (e, d) => {
      try {
        let { database, trialId, trialName } = d;
        console.log(d)
        if (database && trialId && trialName) {
          var db = new sqlite3.Database(
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
          );
          await new Promise((resolve, reject) => {
            db.run(
              `update trials set name='${trialName}' where id=${trialId}`
              , function (error) {
                if (error) {
                  reject(false);
                  return;
                }
                resolve(true);
            });
          })
          db.close();
          
          if (win && win.window && !win.window.isDestroyed()) {
            e.reply(UPDATE_TRIAL_DETAILS_RESPONSE, { error: false });
          }
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  static updateTrialZonesAndThresholdListener(win) {
    ipcMain.on(UPDATE_TRIAL_ZONES_AND_THRESHOLD, async (e, d) => {
      try {
        let { database, trialId } = d;
        if (database && trialId) {
          var db = new sqlite3.Database(
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
          );

          let keys = Object.keys(d).filter(k => k != "database" && k != "trialId")
          if (keys.length > 0) {
            let updateQuery = "update trials ";
            console.log(keys)
            for (var i = 0; i < keys.length; i++){
              if (!updateQuery.includes("set")) {
                if (d[keys[i]]) {
                  updateQuery += ` set ${keys[i]}=${d[keys[i]]}`
                }
              } else {
                if (d[keys[i]]) {
                  updateQuery += ` , ${keys[i]}=${d[keys[i]]}`
                }
              }
            }
            updateQuery += ` where id=${trialId}`
            await new Promise((resolve, reject) => {
              db.run(
                updateQuery
                , function (error) {
                  if (error) {
                    reject(false);
                    return;
                  }
                  resolve(true);
              });
            })
            db.close();
          }
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  static exportTrialReportListener(win) {
    ipcMain.on(EXPORT_TRIAL_REPORT, async (e, d) => {
      let { database, trialId } = d;
      if (database && trialId){

        /**
         * Connect to the database to retrieve all the related 
         * data that is saved.
         */
        var db = new sqlite3.Database(
          process.env.NODE_ENV
          ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
          : app.getPath("downloads") + `/.meta/databases/${database}`
        );

        /**
         * Get from the database the trial of the user
         * with all the details.
         */
        let [trial] = await new Promise((resolve, reject) => {
          db.all(`select * from trials where id=${trialId}`, function (error, rows) {
            if (error) {
              reject([]);
              return
            }
            resolve(rows)
          });
        });

        /**
         * Get from the database the trial of the user
         * with all the details.
         */
        let [session] = await new Promise((resolve, reject) => {
          db.all(`select * from sessions where id=${trial.session_id}`, function (error, rows) {
            if (error) {
              reject([]);
              return
            }
            resolve(rows)
          });
        });

        /**
         * Get the user that is related with the above trial.
         */
        let [user] = await new Promise((resolve, reject) => {
          db.all(`select * from users where id=${trial.user_id}`, function (error, rows) {
            if (error) {
              reject([]);
              return
            }
            resolve(rows)
          });
        });
        db.close();

        /**
         * Read the raw data from the csv that is saved for the current 
         * trial.
         */
        let records = await new Promise((resolve, reject) => {
          fs.createReadStream(
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/trials/${database.replace(".db", "")}/${trial.filename}`)
            : app.getPath("downloads") + `/.meta/trials/${database.replace(".db", "")}/${trial.filename}`
            ).pipe(parse({ columns: true, bom: true, delimiter: [";"] }, function (error, records) {
            if (error) {
              reject(error)
              return
            }
            resolve(records);
          }));
        });
        
        /**
         * Calculate every parameter for every section of the report.
         */
        const linechartAxes = Processor.lineChartAxes(records, user.weight);
        const copAxes = Processor.copChartAxes(records, user.weight);
        const timelineAxes = Processor.timelineAxes(records, user.weight , trial.fx_threshold, trial.fx_zone_min, trial.fx_zone_max, trial.fy_threshold, trial.fy_zone_min, trial.fy_zone_max, trial.fz_threshold, trial.fz_zone_min, trial.fz_zone_max);

        /**
         * After gathering all the data then use the renderer
         * to create the pdf
         */
        await Renderer.start(user, trial, session, linechartAxes, copAxes, timelineAxes);

        /**
         * Automatically open pdf that is created 
         */
        if (process.platform === "win64" || process.platform == "win32") {
          require('electron').shell.openExternal(`${app.getPath("downloads")}/${trial.name}.pdf`);
        } else {
          require('electron').shell.openPath(`${app.getPath("downloads")}/${trial.name}.pdf`);
        }

        /**
         * Reply to the window to stop the loading for the
         * pdf preparation
         */
        if (win && win.window && !win.window.isDestroyed()) {
          e.reply(EXPORT_TRIAL_REPORT_RESPONSE, {});
        }
      }
    });
  }

  static downloadTrialListener(win) {
    ipcMain.on(DOWNLOAD_TRIAL, async (e, d) => {
      try {
        let { database, trialId } = d;
        if (database && trialId) {
          var db = new sqlite3.Database(
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
          );

          // Find the trial and the details
          let [trial] = await new Promise((resolve, reject) => {
            db.all(`select * from trials where id=${trialId}`, function (error, rows) {
              if (error) {
                reject([]);
                return
              }
              resolve(rows)
            });
          });
          db.close();

          // Open the dialog to get the filepath where the user wants to save the csv
          let file = await dialog.showSaveDialog({
            title: 'Select to save the trial data',
            buttonLabel: 'Save',
            defaultPath: app.getPath("downloads")+`/${trial.name}.csv`,
          })

          // Transfer data to the new file
          if (!file.canceled) {
            await new Promise((resolve, reject) => {
              fs.writeFile(file.filePath, "", (error) => {
                if (error) {
                  reject(false);
                  return
                }
                resolve(true);
              })
            });
            await new Promise((resolve, reject) => {
              fs.copyFile(
                process.env.NODE_ENV
                ? path.resolve(__dirname, `../../../.meta/trials/${database.replace(".db", "")}/${trial.filename}`)
                : app.getPath("downloads") + `/.meta/trials/${database.replace(".db", "")}/${trial.filename}`
                , file.filePath, (error) => {
                if (error) {
                  reject(false);
                  return
                }
                resolve(true);
              })
            });

            /**
             * Automatically open pdf that is created 
             */
            if (process.platform === "win64" || process.platform == "win32") {
              require('electron').shell.openExternal(file.filePath);
            } else {
              require('electron').shell.openPath(file.filePath);
            }
          }
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }

  static downloadAverageMetrics(win) {
    ipcMain.on(DOWNLOAD_AVERAGE_METRICS, async (e, d) => {
      try {
        let { database, trialId } = d;
        if (database && trialId) {
          var db = new sqlite3.Database(
            process.env.NODE_ENV
            ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
            : app.getPath("downloads") + `/.meta/databases/${database}`
          );

          /**
           * Find the trial that has the provided id
           */
          let [trial] = await new Promise((resolve, reject) => {
            db.all(`select * from trials where id=${trialId}`, function (error, rows) {
              if (error) {
                reject([]);
                return
              }
              resolve(rows)
            });
          });

          /**
           * Get the user that is related with the above trial.
           */
          let [user] = await new Promise((resolve, reject) => {
            db.all(`select * from users where id=${trial.user_id}`, function (error, rows) {
              if (error) {
                reject([]);
                return
              }
              resolve(rows)
            });
          });
          db.close();

            /**
             * Read the raw data from the csv that is saved for the current 
             * trial.
             */
            let records = await new Promise((resolve, reject) => {
              fs.createReadStream(
                process.env.NODE_ENV
                ? path.resolve(__dirname, `../../../.meta/trials/${database.replace(".db", "")}/${trial.filename}`)
                : app.getPath("downloads") + `/.meta/trials/${database.replace(".db", "")}/${trial.filename}`
                ).pipe(parse({ columns: true, bom: true, delimiter: [";"] }, function (error, records) {
                if (error) {
                  reject(error)
                  return
                }
                resolve(records);
              }));
            });
            
            
            /**
             *  Calculate the linechart data and the average metrics
             *  for each axis and each foot
             */
            const linechartAxes = Processor.lineChartAxes(records, user.weight);
            const averageMetricLeftFX = Metrics.calculateAverageMetricsPerFoot(linechartAxes.fx.left)
            const averageMetricRightFX = Metrics.calculateAverageMetricsPerFoot(linechartAxes.fx.right)
            const averageMetricLeftFY = Metrics.calculateAverageMetricsPerFoot(linechartAxes.fy.left)
            const averageMetricRightFY = Metrics.calculateAverageMetricsPerFoot(linechartAxes.fy.right)  
            const averageMetricLeftFZ = Metrics.calculateAverageMetricsPerFoot(linechartAxes.fz.left)
            const averageMetricRightFZ = Metrics.calculateAverageMetricsPerFoot(linechartAxes.fz.right)
            const maxLength = Math.max(...[
              averageMetricLeftFX.averageImpulses.length,
              averageMetricLeftFX.averageLRates.length,
              averageMetricLeftFX.averageImpactPeakForce.length,
              averageMetricLeftFX.averageTimeImpactPeakForce.length,
              averageMetricRightFX.averageImpulses.length,
              averageMetricRightFX.averageLRates.length,
              averageMetricRightFX.averageImpactPeakForce.length,
              averageMetricRightFX.averageTimeImpactPeakForce.length,
              averageMetricLeftFY.averageImpulses.length,
              averageMetricLeftFY.averageLRates.length,
              averageMetricLeftFY.averageImpactPeakForce.length,
              averageMetricLeftFY.averageTimeImpactPeakForce.length,
              averageMetricRightFY.averageImpulses.length,
              averageMetricRightFY.averageLRates.length,
              averageMetricRightFY.averageImpactPeakForce.length,
              averageMetricRightFY.averageTimeImpactPeakForce.length,
              averageMetricLeftFZ.averageImpulses.length,
              averageMetricLeftFZ.averageLRates.length,
              averageMetricLeftFZ.averageImpactPeakForce.length,
              averageMetricLeftFZ.averageTimeImpactPeakForce.length,
              averageMetricRightFZ.averageImpulses.length,
              averageMetricRightFZ.averageLRates.length,
              averageMetricRightFZ.averageImpactPeakForce.length,
              averageMetricRightFZ.averageTimeImpactPeakForce.length,
            ])
            let csv = 'Trial;ImpulseLeft(FX);LoadingRateLeft(FX);ImpactPeakForceLeft(FX);TimeImpactPeakForceLeft(FX);ImpulseRight(FX);LoadingRateRight(FX);ImpactPeakForceRight(FX);TimeImpactPeakForceRight(FX);' +
              'ImpulseLeft(FY);LoadingRtaeLeft(FY);ImpactPeakForceLeft(FY);TimeImpactPeakForceLeft(FY);ImpulseRight(FY);LoadingRateRight(FY);ImpactPeakForceRight(FY);TimeImpactPeakForceRight(FY);' +
              'ImpulseLeft(FZ);LoadingRateLeft(FZ);ImpactPeakForceLeft(FZ);TimeImpactPeakForceLeft(FZ);ImpulseRight(FZ);LoadingRateRight(FZ);ImpactPeakForceRight(FZ);TimeImpactPeakForceRight(FZ)\n'
            for (var i = 0; i < maxLength; i++){
              csv = csv +`${i+1};${averageMetricLeftFX.averageImpulses[i] || ''};${averageMetricLeftFX.averageLRates[i] || ''};${averageMetricLeftFX.averageImpactPeakForce[i] || ''};${averageMetricLeftFX.averageTimeImpactPeakForce[i] || ''};${averageMetricRightFX.averageTimeImpactPeakForce[i] || ''};${averageMetricRightFX.averageLRates[i] || ''};${averageMetricRightFX.averageImpactPeakForce[i] || ''};${averageMetricRightFX.averageTimeImpactPeakForce[i] || ''};` +
                `${averageMetricLeftFY.averageImpulses[i] || ''};${averageMetricLeftFY.averageLRates[i] || ''};${averageMetricLeftFY.averageImpactPeakForce[i] || ''};${averageMetricLeftFY.averageTimeImpactPeakForce[i] || ''};${averageMetricRightFY.averageTimeImpactPeakForce[i] || ''};${averageMetricRightFY.averageLRates[i] || ''};${averageMetricRightFY.averageImpactPeakForce[i] || ''};${averageMetricRightFY.averageTimeImpactPeakForce[i] || ''};` +
                `${averageMetricLeftFZ.averageImpulses[i]|| ''};${averageMetricLeftFZ.averageLRates[i]|| ''};${averageMetricLeftFZ.averageImpactPeakForce[i]|| ''};${averageMetricLeftFZ.averageTimeImpactPeakForce[i]|| ''};${averageMetricRightFZ.averageTimeImpactPeakForce[i]|| ''};${averageMetricRightFZ.averageLRates[i]|| ''};${averageMetricRightFX.averageImpactPeakForce[i]|| ''};${averageMetricRightFZ.averageTimeImpactPeakForce[i]|| ''}\n`
            }
            
            csv = csv +';;;;;;;;;;;;;;;;;;;;;;;;\n'
            csv = csv +';;;;;;;;;;;;;;;;;;;;;;;;\n'

            // Calculate the averages of the column
            csv = csv + `;=AVERAGE(B2:B${maxLength + 1});=AVERAGE(C2:C${maxLength + 1});=AVERAGE(D2:D${maxLength + 1});=AVERAGE(E2:E${maxLength + 1});=AVERAGE(F2:F${maxLength + 1});=AVERAGE(G2:G${maxLength + 1});` +
              `=AVERAGE(H2: H${maxLength + 1});=AVERAGE(I2: I${maxLength + 1});=AVERAGE(J2:J${maxLength + 1});=AVERAGE(K2:K${maxLength + 1});=AVERAGE(L2:L${maxLength + 1});=AVERAGE(M2:M${maxLength + 1});=AVERAGE(N2:N${maxLength + 1});` +
              `=AVERAGE(O2:O${maxLength + 1});=AVERAGE(P2:P${maxLength + 1});=AVERAGE(Q2:Q${maxLength + 1});=AVERAGE(R2:R${maxLength + 1});=AVERAGE(S2:S${maxLength + 1});=AVERAGE(T2:T${maxLength + 1});=AVERAGE(U2:U${maxLength + 1});=AVERAGE(V2:V${maxLength + 1});` +
              `=AVERAGE(W2:W${maxLength + 1});=AVERAGE(X2:X${maxLength + 1});=AVERAGE(Y2:Y${maxLength + 1});\n`

            await new Promise((resolve, reject) => {
              fs.writeFile(path.resolve(__dirname, `../../../.meta/metrics/${database.replace(".db", "")}/average_metrics_${trial.name}.csv`),csv, (error) => {
                if (error) {
                  reject(false);
                  return
                }
                resolve(true);
              })
            });

          /**
           * Automatically open pdf that is created 
           */
          if (process.platform === "win64" || process.platform == "win32") {
            require('electron').shell.openExternal(
               path.resolve(__dirname, `../../../.meta/metrics/${database.replace(".db", "")}/average_metrics_${trial.name}.csv`)
            );
          } else {
            require('electron').shell.openPath(
              path.resolve(__dirname, `../../../.meta/metrics/${database.replace(".db", "")}/average_metrics_${trial.name}.csv`)
            );
          }
          
          /**
           * Reply to the window to stop the loading for the
           * csv preparation
           */
           e.reply(DOWNLOAD_AVERAGE_METRICS_RESPONSE, {});
        }
      } catch (e) {
        console.log(e)
        throw new Error(e);
      }
    });
  }
  static editAverageMetrics(win) {
    ipcMain.on(EDIT_AVERAGE_METRICS, async (e, d) => {
      try {
        
        let { database, trialId } = d;
        if (database && trialId) {
          var db = new sqlite3.Database(
            process.env.NODE_ENV
              ? path.resolve(__dirname, `../../../.meta/databases/${database}`)
              : app.getPath("downloads") + `/.meta/databases/${database}`
          );

          /**
           * Find the trial that has the provided id
           */
          let [trial] = await new Promise((resolve, reject) => {
            db.all(`select * from trials where id=${trialId}`, function (error, rows) {
              if (error) {
                reject([]);
                return
              }
              resolve(rows)
            });
          });

          /**
           * Automatically open pdf that is created 
           */
  
          if (process.platform === "win64" || process.platform == "win32") {
            require('electron').shell.openExternal(
               path.resolve(__dirname, `../../../.meta/metrics/${database.replace(".db", "")}/average_metrics_${trial.name}.csv`)
            );
          } else {
            require('electron').shell.openPath(
              path.resolve(__dirname, `../../../.meta/metrics/${database.replace(".db", "")}/average_metrics_${trial.name}.csv`)
            );
          }
        }
      } catch (e) {
        console.log(e)
        throw new Error(e);
      }
    });
  }
}

module.exports = Events;