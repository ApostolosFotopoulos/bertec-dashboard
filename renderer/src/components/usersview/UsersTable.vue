<template>
  <v-container>
    <v-row class="mt-0 mb-3">
      <v-col>
        <h3>Users</h3>
        <hr class="hr" />
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
        <v-icon medium class="mr-2" @click="openUserDetailsDialog(item)"
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
            <template v-slot:expanded-item="{ headers, item }">
              <td class="pa-5" :colspan="headers.length">
                <v-data-table
                  :items-per-page="5"
                  :headers="trialHeaders"
                  :items="item.trials"
                  class="elevation-1"
                >
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
export default {
  props: {
    users: Array,
    openUserDetailsDialog: Function,
    openUserDeleteDialog: Function,
    closeUserDeleteDialog: Function,
    deleteUser: Function,
    userDeleteDialog: Boolean,
  },
  data(){
    return{
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