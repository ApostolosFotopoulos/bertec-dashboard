<template>
  <div>
    <v-row class="mt-8" align="center">
      <v-col>
        <h3>Select a user from a database to continue</h3>
        <hr class="hr" />
      </v-col>
    </v-row>
    <v-card class="pa-3 mt-8" color="#25282F">
      <v-row class="mt-3" align="center">
        <v-col>
          <v-select
            :items="
              databases.map((d) => ({
                text: d.substr(0, d.lastIndexOf('.')),
                value: d,
              }))
            "
            label="Database"
            @input="databaseChanged"
            outlined
          ></v-select>
        </v-col>
        <v-col align="center">
          <v-select
            :items="users.map((u) => ({ text: u.firstName + ' ' + u.lastName, value: u} ))"
            label="Users"
            @input="userChanged"
            outlined
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <SaveFile :databaseName="selectedDatabase" :user="selectedUser.firstName + ' '+selectedUser.lastName"/>
        </v-col>
        <v-col cols="2">
          <v-btn @click="skipDatabase()" class="skipButton"> Real Time </v-btn>
        </v-col>
        <v-col cols="2">
          <v-btn
            @click="continueToMain(selectedDatabase, selectedUser)"
            class="continueButton"
          >
            New Trial
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>


<script>
const { ipcRenderer } = window.require("electron");
import SaveFile from "./SaveFile.vue";
export default {
  props: {
    skipDatabase: Function,
    continueToMain: Function,
  },
  components:{
    SaveFile
  },
  mounted() {
    setInterval(() => {
      ipcRenderer.send("FETCH_ALL_DATABASES");
    }, 100);
    setInterval(() => {
      if(this.selectedDatabase !=""){
        ipcRenderer.send("FETCH_ALL_USERS", { database: this.selectedDatabase });
      }
    }, 100);
    var _this = this;
    ipcRenderer.on("FETCH_ALL_DATABASES_RESPONSE", (_, responseData) => {
      _this.databases = responseData.databases;
    });
    ipcRenderer.on("FETCH_ALL_USERS_RESPONSE", (_, responseData) => {
      _this.users = responseData.users;
    });
  },
  data() {
    return {
      databases: [],
      users: [],
      selectedDatabase: "",
      selectedUser: "",
    };
  },
  methods: {
    databaseChanged(d) {
      this.selectedDatabase = d;
      this.users = [];
      ipcRenderer.send("FETCH_ALL_USERS", { database: d });
    },
    userChanged(u) {
      this.selectedUser = u;
    },
  },
};
</script>

<style scoped>
.continueButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.skipButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #ffa505 !important;
}
</style>

