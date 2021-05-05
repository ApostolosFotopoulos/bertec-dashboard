<template>
  <v-row>
    <v-col>
      <v-card class="pa-3 mt-3" color="#25282F">
        <v-row>
          <v-col>
            <h3>Create a new Database</h3>
            <div class="mt-3 text-right">
              <v-text-field
                v-model="databaseToCreate"
                label="Database"
                outlined
                clearable
              />
              <v-alert
                outlined
                type="success"
                text
                class="text-left"
                v-if="visibleCreationDatabaseAlert"
              >
                Successfully created a database.
              </v-alert>
              <v-btn
                :disabled="databaseToCreate === '' || !databaseToCreate"
                @click="createDatabase()"
                class="createDatabaseButton"
              >
                Create
              </v-btn>
            </div>
          </v-col>
          <v-col>
            <h3>Delete a Database</h3>
            <div class="mt-3 text-right">
              <v-select
                v-model="databaseToDelete"
                :items="
                  databases.map((d) => ({
                    text: d.substr(0, d.lastIndexOf('.')),
                    value: d,
                  }))
                "
                label="Database"
                outlined
                clearable
              ></v-select>
              <v-alert
                outlined
                type="success"
                text
                class="text-left"
                v-if="visibleDeleteDatabaseAlert"
              >
                Successfully deleted a database.
              </v-alert>
              <v-btn
                :disabled="databaseToDelete === '' || !databaseToDelete"
                @click="deleteDatabase()"
                class="deleteDatabaseButton"
              >
                Delete
              </v-btn>
            </div>
          </v-col>
          <v-col>
            <h3>Users</h3>
            <div class="mt-3">
              <v-btn
                @click="openUserCreationWindow()"
                class="createUserButton"
                block
              >
                Create
              </v-btn>
            </div>
            <div class="mt-3">
              <v-btn class="editUsersButton" block> Edit </v-btn>
            </div>
            <div class="mt-3">
              <v-btn @click="openUsersWindow()" class="viewUsersButton" block>
                View All
              </v-btn>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <h3>Tags</h3>
            <div class="mt-3">
              <v-btn
                @click="openTagCreationWindow()"
                class="viewUsersButton"
                block
              >
                Manage
              </v-btn>
            </div>
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
      databaseToCreate: "",
      visibleCreationDatabaseAlert: false,
      databases: [],
      databaseToDelete: "",
      visibleDeleteDatabaseAlert: false,
    };
  },
  mounted() {
    setInterval(() => {
      ipcRenderer.send("FETCH_DATABASES_TO_DELETE");
    }, 100);
    const _this = this;
    ipcRenderer.on("FETCH_DATABASES_TO_DELETE_RESPONSE", (_, responseData) => {
      _this.databases = responseData.databases;
    });
  },
  methods: {
    createDatabase() {
      ipcRenderer.send("CREATE_DATABASE", { database: this.databaseToCreate });
      this.databaseToCreate = "";
      this.visibleCreationDatabaseAlert = true;
      setTimeout(() => {
        this.visibleCreationDatabaseAlert = false;
      }, 3000);
    },
    deleteDatabase() {
      ipcRenderer.send("DELETE_DATABASE", { database: this.databaseToDelete });
      this.databaseToDelete = "";
      this.visibleDeleteDatabaseAlert = true;
      setTimeout(() => {
        this.visibleDeleteDatabaseAlert = false;
      }, 3000);
    },
    openUsersWindow() {
      ipcRenderer.send("OPEN_USERS_WINDOW");
    },
    openUserCreationWindow() {
      ipcRenderer.send("OPEN_USER_CREATE_WINDOW");
    },
    openTagCreationWindow() {
      ipcRenderer.send("OPEN_TAG_CREATE_WINDOW");
    },
  },
};
</script>

<style scoped>
.createDatabaseButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.deleteDatabaseButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #d32d41 !important;
}
.createUserButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.editUsersButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #f4a261 !important;
}
.viewUsersButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #e9c46a !important;
}
</style>