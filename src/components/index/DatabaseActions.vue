<template>
  <v-row class="mt-8">
    <v-col>
      <h3>Create a new Database</h3>
      <hr class="hr" />
      <v-card class="pa-3 mt-8" color="#25282F">
        <v-row>
          <v-col>
            <v-text-field v-model="database" label="Database" outlined />
            <v-alert outlined type="success" text v-if="databaseCreationAlert">
              Successfully created a database
            </v-alert>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3" offset="9">
            <v-btn @click="createDatabase()" class="createDatabaseButton">
              Create
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-select
              v-model="selectedDatabase"
              :items="
                databases.map((d) => ({
                  text: d.substr(0, d.lastIndexOf('.')),
                  value: d,
                }))
              "
              label="Database"
              outlined
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3" offset="9">
            <v-btn @click="deleteDatabase()" class="deleteButton">
              Delete
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
    <v-col>
      <h3>Users</h3>
      <hr class="hr" />
      <v-card class="pa-3 mt-8" color="#25282F">
        <v-row align="center">
          <v-col cols="3">
            <v-btn @click="createUsers()" class="createUserButton">
              Create
            </v-btn>
          </v-col>
          <v-col cols="3">
            <v-btn @click="openUsers()" class="viewButton"> View All </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
const { ipcRenderer } = window.require("electron");

export default {
  data() {
    return {
      database: "",
      databaseCreationAlert: false,
      databases:[],
      selectedDatabase:""
    };
  },
  mounted(){
    setInterval(() => {
      ipcRenderer.send("FETCH_ALL_DATABASES");
    }, 100);
    const _this = this;
    ipcRenderer.on("FETCH_ALL_DATABASES_RESPONSE", (_, responseData) => {
      _this.databases = responseData.databases;
    });
  },
  methods: {
    createDatabase() {
      ipcRenderer.send("CREATE_DATABASE", { database: this.database });
      this.database = "";
      this.databaseCreationAlert = true;
      setTimeout(() => {
        this.databaseCreationAlert = false;
      }, 3000);
    },
    openUsers() {
      ipcRenderer.send("OPEN_USERS_WINDOW");
    },
    createUsers() {
      ipcRenderer.send("OPEN_USERS_CREATE_WINDOW");
    },
    deleteDatabase(){
      ipcRenderer.send("DELETE_DATABASE", { database: this.selectedDatabase });
      this.selectedDatabase = ""
    }
  },
};
</script>

<style scoped>
.createUserButton,
.createDatabaseButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}

.viewButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #ffa505 !important;
}
.deleteButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #d32d41 !important;
}
</style>
