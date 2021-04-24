const path = require('path')
const { ipcMain } = require('electron')
const { v4 : generateRandomHash } = require('uuid') 
const sqlite3 = require('sqlite3').verbose();
const { promises: fs } = require('fs')

class IPCEvents{
  constructor(){
    this.selectedDatabase = ""
  }

  createDatabaseEvent(){
    ipcMain.on("CREATE_DATABASE",(_,d) =>	{
      let { database } = d

      // Generate a random name + the predefined to be unique
      database = `${database}_${generateRandomHash()}.db`

      // Create the database and initialize the schema of the datatables
      const db = new sqlite3.Database(path.resolve(__dirname,`../../assets/databases/${database}`));
      db.serialize(function() {
        db.run(
          "create table users(id integer primary key autoincrement, firstName text, lastName text,"+
          "year integer, other_info text, sex text, height integer, leg_length integer,weight float,"+
          "created_at date, updated_at date)"
        );
      })
      db.close();
    })
  }

  fetchAllDatabasesEvent(){
    ipcMain.on("FETCH_ALL_DATABASES",async (e) => {
      try{
        let databases = await fs.readdir(path.resolve(__dirname,"../../assets/databases"))
        e.reply("FETCH_ALL_DATABASES_RESPONSE",{ databases })
      } catch(e){
        throw new Error(e)
      }
    })
  }
  
  fetchAllUsersEvent(){
    ipcMain.on("FETCH_ALL_USERS",(e, d) => {
      const { database } = d
      this.selectedDatabase = database
      
      const db = new sqlite3.Database(path.resolve(__dirname,`../../assets/databases/${database}`))
      db.all("select * from users",(err,rows) => {
        e.reply("FETCH_ALL_USERS_RESPONSE",{ users: rows })
      })
    })
  }

}

module.exports = IPCEvents
