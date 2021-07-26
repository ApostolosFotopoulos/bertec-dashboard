<template>
  <v-container>
    <v-row class="mt-0 mb-3">
      <v-col>
        <h3>Users</h3>
        <hr class="hr" />
        <div class="mt-3">
          <v-alert
            outlined
            :type="deleteAlertError ? 'error' : 'success'"
            text
            v-if="deleteAlert"
          >
            {{ deleteAlertMessage }}
          </v-alert>
        </div>
      </v-col>
    </v-row>
    <v-dialog
      v-model="userDeleteDialog"
      transition="dialog-top-transition"
      max-width="600"
    >
      <v-card light class="pt-10 pa-3">
        <v-card-text>
          <div class="text-h6">Are you sure you want to delete the user?</div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="deleteUser">Yes</v-btn>
          <v-btn text @click="closeUserDeleteDialog">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="deleteTrialDialog"
      transition="dialog-top-transition"
      max-width="600"
    >
      <v-card light class="pt-10 pa-3">
        <v-card-text>
          <div class="text-h6">Are you sure you want to delete the trial?</div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="deleteTrial">Yes</v-btn>
          <v-btn text @click="closeDeleteTrialDialog">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="deleteSessionDialog"
      transition="dialog-top-transition"
      max-width="600"
    >
      <v-card light class="pt-10 pa-3">
        <v-card-text>
          <div class="text-h6">Are you sure you want to delete the session?</div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="deleteSession">Yes</v-btn>
          <v-btn text @click="closeDeleteSessionDialog">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-data-table
      :items-per-page="5"
      :headers="userHeaders"
      :items="users"
      :expanded.sync="userExpandedRows"
      show-expand
      v-if="users"
      class="elevation-1"
    >
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon medium class="mr-2" @click="() => openUserDetailsDialog(item)"
          >mdi-magnify</v-icon
        >
        <v-icon medium @click="openUserDeleteDialog(item)"
          >mdi-delete-outline</v-icon
        >
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td class="pa-5" :colspan="headers.length">
          <v-data-table
            :items-per-page="5"
            :headers="sessionHeaders"
            :items="item.sessions"
            :expanded.sync="sessionExpandedRows"
            show-expand
            class="elevation-1 sessionTable"
          >
            <template v-slot:[`item.actions`]="{ item }">
              <v-icon medium class="mr-2" @click="() => openDeleteSessionDialog(item)">mdi-delete-outline</v-icon>
            </template>
            <template v-slot:expanded-item="{ headers, item }">
              <td class="pa-5" :colspan="headers.length">
                <v-data-table
                  :items-per-page="5"
                  :headers="trialHeaders"
                  :items="item.trials"
                  class="elevation-1"
                >
                  <template v-slot:[`item.actions`]="{ item }">
                    <v-icon medium class="mr-2" @click="() => openEditTrialDialog(item)">mdi-pencil-outline</v-icon>
                    <v-icon medium class="mr-2" @click="() => downloadTrial(item)">mdi-download-outline</v-icon>
                    <v-icon medium class="mr-2" @click="() => editAverageMetrics(item)">mdi-file-document</v-icon>
                    <v-progress-circular v-if="loadingTrialIdx && loadingTrialIdx == item.id" indeterminate color="blue"></v-progress-circular>
                    <v-icon medium class="mr-2" v-else @click="() => exportTrialReport(item)">mdi-file-pdf-outline</v-icon>
                    <v-icon medium class="mr-2" @click="() => openDeleteTrialDialog(item)">mdi-delete-outline</v-icon>
                  </template>
                </v-data-table>
              </td>
            </template>
          </v-data-table>
        </td>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require("electron");
const { DELETE_USER_RESPONSE,DELETE_SESSION_RESPONSE, DELETE_TRIAL_RESPONSE } = require("../../../../main/util/types");

export default {
  props: {
    users: Array,
    openUserDetailsDialog: Function,
    openUserDeleteDialog: Function,
    closeUserDeleteDialog: Function,
    deleteUser: Function,
    userDeleteDialog: Boolean,
    deleteTrial: Function,
    deleteTrialDialog: Boolean,
    openDeleteTrialDialog: Function,
    closeDeleteTrialDialog: Function,
    deleteSessionDialog:Boolean,
    openDeleteSessionDialog: Function,
    closeDeleteSessionDialog: Function,
    deleteSession:Function,
    openEditTrialDialog: Function,
    downloadTrial: Function,
    exportTrialReport: Function,
    editAverageMetrics:Function,
    loadingTrialIdx: Number,
  },
  mounted(){
    ipcRenderer.on(DELETE_USER_RESPONSE, (_, responseData) => {
      this.deleteAlert = true;
      this.deleteAlertError = responseData.error ? true : false;
      this.deleteAlertMessage = responseData.error
        ? "An error occured while deleting a user"
        : "Successfully deleted a user";
      setTimeout(() => {
        this.deleteAlert = false;
      }, 3000);
    });

    ipcRenderer.on(DELETE_SESSION_RESPONSE, (_, responseData) => {
      this.deleteAlert = true;
      this.deleteAlertError = responseData.error ? true : false;
      this.deleteAlertMessage = responseData.error
        ? "An error occured while deleting a session"
        : "Successfully deleted a session";
      setTimeout(() => {
        this.deleteAlert = false;
      }, 3000);
    });

    ipcRenderer.on(DELETE_TRIAL_RESPONSE, (_, responseData) => {
      this.deleteAlert = true;
      this.deleteAlertError = responseData.error ? true : false;
      this.deleteAlertMessage = responseData.error
        ? "An error occured while deleting a trial"
        : "Successfully deleted a trial";
      setTimeout(() => {
        this.deleteAlert = false;
      }, 3000);
    });
    
  },
  data(){
    return{
      deleteAlert:false,
      deleteAlertError:false,
      deleteAlertMessage:"",
      userExpandedRows:[],
      sessionExpandedRows:[],
      userHeaders: [
        {
          text: "Hospital ID",
          sortable: false,
          value: "hospital_id",
        },
        {
          text: "Firstname",
          value: "first_name",
        },
        {
          text: "Lastname",
          value: "last_name",
        },
        {
          text: "Year of Birth",
          value: "year",
        },
        {
          text: "Sex",
          value: "sex",
        },
        {
          text: "Height (cm)",
          value: "height",
        },
        {
          text: "Weight (N)",
          value: "weight",
          sortable: false,
        },
        {
          text: "Actions",
          value: "actions",
          sortable: false,
        },
        {
          text: "",
          value: "data-table-expand",
        },
      ],
      sessionHeaders: [
        {
          text: "ID",
          value: "id",
        },
        {
          text: "Session",
          value: "name",
          sortable: false,
        },
        {
          text: "Number of Trials",
          value: "trial_count",
          sortable: false,
        },
        {
          text: "Created At",
          value: "created_at",
          sortable: false,
        },
        {
          text: "Actions",
          value: "actions",
          sortable: false,
        },
        {
          text: "",
          value: "data-table-expand",
        },
      ],
      trialHeaders: [
        {
          text: "ID",
          value: "id",
        },
        {
          text: "Trial",
          value: "name",
          sortable: false,
        },
        {
          text: "Created At",
          value: "created_at",
          sortable: false,
        },
        {
          text: "Actions",
          value: "actions",
          sortable: false,
        },
      ],
    }
  }
}
</script>

<style scoped>
.sessionTable{
  background-color:#6ab187 !important;
}
</style>