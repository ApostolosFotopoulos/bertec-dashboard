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
  FETCH_USERS_TO_VIEW_ALL, FETCH_USERS_TO_VIEW_ALL_RESPONSE, DELETE_USER, DELETE_USER_RESPONSE, CREATE_TRIAL, FETCH_TRIALS_TO_VIEW_ALL, FETCH_TRIALS_TO_VIEW_ALL_RESPONSE,
  CREATE_SESSION, CREATE_SESSION_RESPONSE, CREATE_TRIAL_RESPONSE, UPDATE_TRIAL
} = require('../util/types')
const path = require('path')
const fs = require('fs')
const { ipcMain } = require("electron");
const sqlite3 = require("sqlite3").verbose();
const moment = require("moment");
const { writeFileSyncRecursive } = require('./helpers');

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
                db.run(
                  "create table sessions(id integer primary key autoincrement, name text, user_id integer, created_at date)"
                );
                db.run(
                  "create table trials(id integer primary key autoincrement, name text, session_id integer, created_at date, user_id integer)"
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

  static fetchDatabasesToViewAllListener(win) {
    ipcMain.on(FETCH_DATABASES_TO_VIEW_ALL, async (e, d) => {
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
            path.resolve(__dirname, `../../assets/databases/${database}`)
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
            path.resolve(__dirname, `../../assets/databases/${database}`)
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
            path.resolve(__dirname, `../../assets/databases/${database}`)
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

            if (filters.year) {
              sqlQuery += sqlQuery.includes("where")
                ? ` and year between ${filters.year[0]} and ${filters.year[1]}`
                : ` where year between ${filters.year[0]} and ${filters.year[1]}`;
            }

            if (filters.legLength) {
              sqlQuery += sqlQuery.includes("where")
                ? ` and leg_length between ${filters.legLength[0]} and ${filters.legLength[1]}`
                : ` where leg_length between ${filters.legLength[0]} and ${filters.legLength[1]}`;
            }

            if (filters.weight) {
              sqlQuery += sqlQuery.includes("where")
                ? ` and weight between ${filters.weight[0]} and ${filters.weight[1]}`
                : ` where weight between ${filters.weight[0]} and ${filters.weight[1]}`;
            }

            if (filters.height) {
              sqlQuery += sqlQuery.includes("where")
                ? ` and height between ${filters.height[0]} and ${filters.height[1]}`
                : ` where height between ${filters.height[0]} and ${filters.height[1]}`;
            }

            if (filters.surgeryRange) {
              sqlQuery += sqlQuery.includes("where")
                ? ` and surgery_date between '${filters.surgeryRange[0]}' and '${filters.surgeryRange[1]}'`
                : ` where surgery_date between '${filters.surgeryRange[0]}' and '${filters.surgeryRange[1]}'`;
            }

            if (filters.injuryRange) {
              sqlQuery += sqlQuery.includes("where")
                ? ` and injury_date between '${filters.injuryRange[0]}' and '${filters.injuryRange[1]}'`
                : ` where injury_date between '${filters.injuryRange[0]}' and '${filters.injuryRange[1]}'`;
            }

            if (filters.injuryRange) {
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

            let trialsCount = await new Promise((resolve, reject) => {
              db.all(`select count(id) as n ,id as trial_id, session_id from trials where session_id in (${sessions.map(s => s.id)}) group by session_id`, (error, rows) => {
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
              let sess = sessions.get(u.id)
              sess = sess.map(s => {
                return {
                  ...s,
                  created_at: moment(new Date(s.created_at)).format("DD-MM-YYYY"),
                  trial_count: (trialsCount.find(t=> t.session_id === s.id ))?(trialsCount.find(t=> t.session_id === s.id )).n:0
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
  
  static fetchTagsToViewAllListener(win) {
    ipcMain.on(FETCH_TAGS_TO_VIEW_ALL, async (e, d) => {
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

  static createSessionListener(win) {
    ipcMain.on(CREATE_SESSION, async (e, d) => {
      try {
        let { database, userId, session } = d;
        if (database, userId && session) {
          var db = new sqlite3.Database(
            path.resolve(__dirname, `../../assets/databases/${database}`)
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
  
  static createTrialListener(win) {
    ipcMain.on(CREATE_TRIAL, async (e, d) => {
      try {
        let { database, userId, session } = d;
        console.log(d)
        if (database && userId && session) {
          var db = new sqlite3.Database(
            path.resolve(__dirname, `../../assets/databases/${database}`)
          );
          let trial = `session_${session}_trial_${moment(new Date()).format("DD_MM_YYYY_HH_mm_ss")}.csv`
          await new Promise((resolve, reject) => {
            db.run(`insert into trials(name, user_id,session_id,created_at) values('${trial}',${userId},${session},'${new Date()}')`, function (error) {
              if (error) {
                console.log(error)
                reject(-1);
                return
              }
              resolve(this.lastID)
            });
          });
          db.close();
          

          writeFileSyncRecursive(path.resolve(__dirname, `../../assets/trials/${database.replace(".db", "")}/${trial}`), '\ufeffFx1,Fy1,Fz1,Mx1,My1,Mz1,Fx2,Fy2,Fz2,Mx2,My2,Mz2,Copx1,Copy1,Copxy1,Copx2,Copy2,Copxy2\n', 'utf8')
          if (win && !win.isDestroyed()) {
            e.reply(CREATE_TRIAL_RESPONSE, { trial: trial })
          }
        }
      } catch (e) {
        console.log(e)
        throw new Error(e);
      }
    });
  }

  static updateTrialDataListener(win) {
    ipcMain.on(UPDATE_TRIAL, async (e, d) => {
      try {
        let { database, trial, data } = d;
        //console.log(data)
        if (database && trial && data) {
          fs.appendFile(path.resolve(__dirname, `../../assets/trials/${database.replace(".db", "")}/${trial}`),data.join(",")+"\n",()=>{})
        }
      } catch (e) {
        throw new Error(e);
      }
    });
  }
}

module.exports = Events;