<template>
  <v-row>
    <v-col>
      <div class="pa-3 mt-3">
        <v-row>
          <v-col>
            <h3>Select a user from a database to continue</h3>
            <div class="mt-3 text-right">
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
                clearable
              ></v-select>
            </div>
          </v-col>
          <v-col>
            <div class="mt-10 text-right">
              <v-select
                :items="
                  users &&
                  users.map((u) => ({
                    text: u.first_name + ' ' + u.last_name,
                    value: u,
                  }))
                "
                label="Users"
                @input="userChanged"
                outlined
                clearable
              ></v-select>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="session"
              label="Session"
              outlined
              clearable
            />
          </v-col>
          <v-col>
            <div class="mt-2">
              <v-btn @click="skipDatabase()" class="realTimeButton">
                Real Time
              </v-btn>
              <v-btn
                @click="continueToMain(selectedDatabase, selectedUser, session)"
                class="newSessionButton"
                :disabled="
                  !selectedDatabase ||
                  selectedDatabase === '' ||
                  !selectedUser ||
                  selectedUser === '' ||
                  session.trim() === ''
                "
              >
                New Session
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-col>
  </v-row>
</template>

<script>
const { ipcRenderer } = window.require("electron");
const { FETCH_DATABASES_TO_CONTINUE ,FETCH_DATABASES_TO_CONTINUE_RESPONSE,FETCH_USERS_TO_CONTINUE, FETCH_USERS_TO_CONTINUE_RESPONSE } = require('../../../../main/util/types')
export default {
  props: {
    skipDatabase: Function,
    continueToMain: Function,
  },
  mounted() {
    setInterval(() => {
      ipcRenderer.send(FETCH_DATABASES_TO_CONTINUE);
    }, 100);
    setInterval(() => {
      if (this.selectedDatabase && this.selectedDatabase != "") {
        ipcRenderer.send(FETCH_USERS_TO_CONTINUE, {
          database: this.selectedDatabase,
        });
      }
    }, 100);
    var _this = this;
    ipcRenderer.on(
      FETCH_DATABASES_TO_CONTINUE_RESPONSE,
      (_, responseData) => {
        _this.databases = responseData.databases;
      }
    );
    ipcRenderer.on(
      FETCH_USERS_TO_CONTINUE_RESPONSE,
      (_, responseData) => {
        _this.users = responseData.users || [];
      }
    );
  },
  data() {
    return {
      databases: [],
      selectedDatabase: "",
      session: "",
      users: [],
      selectedUser: "",
    };
  },
  methods: {
    databaseChanged(d) {
      if(d){
        this.users = []
        this.selectedDatabase = d;
        ipcRenderer.send(FETCH_USERS_TO_CONTINUE, { database: d });
      } else {
        this.users = []
        this.selectedDatabase = "";
      }
    },
    userChanged(u) {
      this.selectedUser = u;
    },
  },
};
</script>

<style scoped>
.realTimeButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #f4a261 !important;
}
.newSessionButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
</style>

<style>
.v-text-field.v-text-field--enclosed .v-text-field__details {
  display: none;
}
</style>