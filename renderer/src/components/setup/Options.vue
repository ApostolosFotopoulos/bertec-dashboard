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
                :type="createAlertError?'error':'success'"
                text
                class="text-left"
                v-if="visibleCreationDatabaseAlert"
              >
                {{createAlertMessage}}
              </v-alert>
              <v-btn
                :disabled="databaseToCreate.trim() === '' || !databaseToCreate"
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
                :type="deleteDatabaseAlertError?'error':'success'"
                text
                class="text-left"
                v-if="visibleDeleteDatabaseAlert"
              >
                {{deleteDatabaseAlertMessage}}
              </v-alert>
              <v-btn
                :disabled="databaseToDelete === '' || !databaseToDelete"
                @click="openDeleteDialog()"
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
                @click="openUserManagementWindow()"
                class="manageUserButton"
                block
              >
                Manage
              </v-btn>
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
                @click="openTagManagementWindow()"
                class="manageTagsButton"
                block
              >
                Manage
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
      <v-dialog
        v-model="deleteDialog"
        transition="dialog-top-transition"
        max-width="600"
      >
        <v-card light class="pt-10 pa-3">
          <v-card-text>
            <div class="text-h6">Are you sure you want to delete the database?</div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              text
              @click="deleteDatabase()"
            >Yes</v-btn>
            <v-btn
              text
              @click="deleteDialog = false"
            >No</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  </v-row>
</template>

<script>
const { ipcRenderer } = window.require("electron");
const { 
  CREATE_DATABASE ,CREATE_DATABASE_RESPONSE,DELETE_DATABASE,DELETE_DATABASE_RESPONSE, FETCH_DATABASES_TO_DELETE, 
  FETCH_DATABASES_TO_DELETE_RESPONSE
} = require('../../../../main/util/types')

export default {
  data() {
    return {
      databaseToCreate: "",
      visibleCreationDatabaseAlert: false,
      createAlertMessage: "",
      createAlertError:false,
      databases: [],
      databaseToDelete: "",
      visibleDeleteDatabaseAlert: false,
      deleteDatabaseAlertMessage: "",
      deleteDatabaseAlertError:false,
      deleteDialog:false,
    };
  },
  mounted() {
    setInterval(() => {
      ipcRenderer.send(FETCH_DATABASES_TO_DELETE);
    }, 100);
    const _this = this;
    ipcRenderer.on(FETCH_DATABASES_TO_DELETE_RESPONSE, (_, responseData) => {
      _this.databases = responseData.databases;
    });
    ipcRenderer.on(CREATE_DATABASE_RESPONSE, (_, responseData) => {
        this.databaseToCreate = "";
        this.visibleCreationDatabaseAlert = true;
        this.createAlertMessage = responseData.error? "Database already exist with that name" : "Successfully created a database"
        this.createAlertError = responseData.error? true : false
        setTimeout(() => {
          this.visibleCreationDatabaseAlert = false;
        }, 3000);
    });
    ipcRenderer.on(DELETE_DATABASE_RESPONSE, (_, responseData) => {
      this.databaseToDelete = "";
      this.visibleDeleteDatabaseAlert = true;
      this.deleteDatabaseAlertMessage = responseData.error? "An error occured while deleting the database" : "Successfully deleted the database"
      this.deleteDatabaseAlertError = responseData.error? true : false
      setTimeout(() => {
        this.visibleDeleteDatabaseAlert = false;
      }, 3000);
    });
  },
  methods: {
    createDatabase() {
      ipcRenderer.send(CREATE_DATABASE, { database: this.databaseToCreate });
    },
    deleteDatabase() {
      ipcRenderer.send(DELETE_DATABASE, { database: this.databaseToDelete });
      this.deleteDialog = false
    },
    openDeleteDialog(){
      this.deleteDialog = true
    },
    openUsersWindow() {
      ipcRenderer.send("OPEN_USERS_WINDOW");
    },
    openUserManagementWindow() {
      ipcRenderer.send("OPEN_USER_MANAGE_WINDOW");
    },
    openTagManagementWindow() {
      ipcRenderer.send("OPEN_TAG_MANAGE_WINDOW");
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
.manageUserButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.viewUsersButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #f4a261 !important;
}
.manageTagsButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #f4a261 !important;
}
</style>