<template>
  <div>
    <UsersTableFilters
      :search="search"
      :changeDatabase="changeDatabase"
      :affectedSideOptions="affectedSideOptions"
      :sexOptions="sexOptions"
      :databases="databases"
      :tags="tags"
      :selectedDatabase="selectedDatabase"
      :clearSurgeryDate="clearSurgeryDate"
      :clearInjuryDate="clearInjuryDate"
      :applyFilters="applyFilters"
      :resetFilters="resetFiltersToDefault"
    />
    <UsersTable
      :users="users"
      :openUserDetailsDialog="openUserDetailsDialog"
      :openUserDeleteDialog="openUserDeleteDialog"
      :closeUserDeleteDialog="closeUserDeleteDialog"
      :userDeleteDialog="userDeleteDialog"
      :deleteTrialDialog="deleteTrialDialog"
      :deleteUser="deleteUser"
      :deleteTrial="deleteTrial"
      :openDeleteTrialDialog="openDeleteTrialDialog"
      :closeDeleteTrialDialog="closeDeleteTrialDialog"
      :deleteSessionDialog="deleteSessionDialog"
      :openDeleteSessionDialog="openDeleteSessionDialog"
      :closeDeleteSessionDialog="closeDeleteSessionDialog"
      :deleteSession="deleteSession"
      :openEditTrialDialog="openEditTrialDialog"
      :downloadTrial="downloadTrial"
      :exportTrialReport="exportTrialReport"
    />
    <UserDetails
      :userDetails="userDetails"
      :userDetailsDialog="userDetailsDialog"
      :closeUserDetailsDialog="closeUserDetailsDialog"
    />
    <EditTrialModal
      :trialToEdit="trialToEdit"
      :editTrialDialog="editTrialDialog"
      :editTrial="editTrial"
      :closeEditTrialDialog="closeEditTrialDialog"
    />
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");

const {
  FETCH_DATABASES_TO_VIEW_ALL,
  FETCH_DATABASES_TO_VIEW_ALL_RESPONSE,
  FETCH_TAGS_TO_VIEW_ALL,
  FETCH_TAGS_TO_VIEW_ALL_RESPONSE,
  FETCH_USERS_TO_VIEW_ALL,
  FETCH_USERS_TO_VIEW_ALL_RESPONSE,
  DELETE_USER,
  DELETE_TRIAL,
  DELETE_SESSION,
  UPDATE_TRIAL_DETAILS,
  DOWNLOAD_TRIAL,
  EXPORT_TRIAL_REPORT,
} = require("../../../main/util/types");
import moment from "moment";
import UsersTableFilters from "../components/usersview/UsersTableFilters.vue";
import UsersTable from "../components/usersview/UsersTable.vue";
import UserDetails from "../components/usersview/UserDetails.vue";
import EditTrialModal from '../components/usersview/EditTrialModal.vue';

export default {
  components: {
    UsersTableFilters,
    UsersTable,
    UserDetails,
    EditTrialModal
  },
  mounted() {
    setInterval(() => {
      // Fetch Database
      ipcRenderer.send(FETCH_DATABASES_TO_VIEW_ALL);

      // Fetch Tags
      if (this.selectedDatabase && this.selectedDatabase != "") {
        ipcRenderer.send(FETCH_TAGS_TO_VIEW_ALL, {
          database: this.selectedDatabase,
        });
      }

      // Fetch Users
      if (this.selectedDatabase && this.selectedDatabase != "") {
        ipcRenderer.send(FETCH_USERS_TO_VIEW_ALL, {
          database: this.selectedDatabase,
          filters: this.filters,
        });
      }
    }, 10);

    // Setup Databases
    ipcRenderer.on(FETCH_DATABASES_TO_VIEW_ALL_RESPONSE, (_, responseData) => {
      this.databases = responseData.databases;
    });

    // Setup Tags
    ipcRenderer.on(FETCH_TAGS_TO_VIEW_ALL_RESPONSE, (_, responseData) => {
      this.tags = responseData.tags;
    });

    // Setup users
    ipcRenderer.on(FETCH_USERS_TO_VIEW_ALL_RESPONSE, (_, responseData) => {
      if(this.selectedDatabase != ""){
        this.users = responseData.users;
      } else {
        this.users = [];
      }
    });
  },
  data() {
    return {
      selectedDatabase: "",
      affectedSideOptions: ["Left", "Right", "Left + Right", "Non Affected"],
      sexOptions: ["Male", "Female"],
      tags: [],
      databases: [],
      filters: {},
      users:[],
      userDetails:{},
      userDetailsDialog:false,
      userToDelete:{},
      userDeleteDialog:false,
      deleteTrialDialog:false,
      trialToDelete:{},
      deleteSessionDialog:false,
      sessionToDelete:{},
      editTrialDialog:false,
      trialToEdit:{},
      search: {
        firstName: "",
        lastName: "",
        hospitalID: "",
        affectedSide: "",
        year: [1950, new Date().getFullYear()],
        height: [100, 250],
        legLength: [30, 200],
        weight: [300, 2000],
        sex: "",
        surgeryRange: {
          start: "",
          end: "",
        },
        injuryRange: {
          start: "",
          end: "",
        },
        selectedTags: [],
      },
    };
  },
  methods: {
    applyFilters(){
      let f = {};
      if (this.search.firstName && this.search.firstName != "") {
        f.firstName = this.search.firstName;
      }
      if (this.search.lastName && this.search.lastName != "") {
        f.lastName = this.search.lastName;
      }
      if (this.search.hospitalID && this.search.hospitalID != "") {
        f.hospitalID = this.search.hospitalID;
      }
      if (this.search.affectedSide && this.search.affectedSide != "") {
        f.affectedSide = this.search.affectedSide;
      }
      if (this.search.sex && this.search.sex != "") {
        f.sex = this.search.sex;
      }
      f.year = this.search.year;
      f.legLength = this.search.legLength;
      f.weight = this.search.weight;
      f.height = this.search.height;
      if (this.search.selectedTags && this.search.selectedTags.length > 0) {
        f.tags = this.search.selectedTags;
      }
      if (
        this.search.surgeryRange &&
        this.search.surgeryRange.start &&
        this.search.surgeryRange.start != "" &&
        this.search.surgeryRange.end &&
        this.search.surgeryRange.end != ""
      ) {
        f.surgeryRange = [
          moment(this.search.surgeryRange.start).format("MM-DD-YYYY"),
          moment(this.search.surgeryRange.end).format("MM-DD-YYYY"),
        ];
      }
      if (
        this.search.injuryRange &&
        this.search.injuryRange.start &&
        this.search.injuryRange.start != "" &&
        this.search.injuryRange.end &&
        this.search.injuryRange.end != ""
      ) {
        f.injuryRange = [
          moment(this.search.injuryRange.start).format("MM-DD-YYYY"),
          moment(this.search.injuryRange.end).format("MM-DD-YYYY"),
        ];
      }
      this.filters = {...f};
    },
    changeDatabase(d) {
      if (d != null) {
        this.selectedDatabase = d;
        this.tags = [];
        this.users = [];
        this.resetFiltersToDefault();
      } else {
        this.selectedDatabase = "";
        this.tags = [];
        this.users = [];
        this.resetFiltersToDefault();
      }
    },
    resetFiltersToDefault() {
      this.search = {
        firstName: "",
        lastName: "",
        hospitalID: "",
        affectedSide: "",
        year: [1950, new Date().getFullYear()],
        height: [100, 250],
        legLength: [30, 200],
        weight: [300, 2000],
        sex: "",
        surgeryRange: {
          start: "",
          end: "",
        },
        injuryRange: {
          start: "",
          end: "",
        },
        selectedTags: [],
      };
      this.filters = {};
    },
    clearInjuryDate() {
      this.search.injuryRange = {
        start: "",
        end: "",
      }
    },
    clearSurgeryDate() {
      this.search.surgeryRange ={
        start: "",
        end: "",
      }
    },
    deleteUser(){
      ipcRenderer.send(DELETE_USER, {
        database: this.selectedDatabase,
        userId: this.userToDelete.id,
      });
      this.userDeleteDialog = false;
    },
    openUserDeleteDialog(u) {
      this.userToDelete = u;
      this.userDeleteDialog = true;
    },
    closeUserDeleteDialog(){
      this.userToDelete = {};
      this.userDeleteDialog = false;
    },
    openUserDetailsDialog(u) {
      this.userDetails = u;
      this.userDetailsDialog = true;
    },
    closeUserDetailsDialog(){
      this.userDetails = {};
      this.userDetailsDialog = false;
    },
    openDeleteTrialDialog(t){
      this.trialToDelete = t;
      this.deleteTrialDialog = true;
    },
    closeDeleteTrialDialog(){
      this.trialToDelete = {};
      this.deleteTrialDialog = false;
    },
    deleteTrial(){
      console.log(this.trialToDelete)
      ipcRenderer.send(DELETE_TRIAL, {
        database: this.selectedDatabase,
        trialId: this.trialToDelete.id,
      });
      this.deleteTrialDialog = false;
    },
    openDeleteSessionDialog(s){
      this.sessionToDelete = s;
      this.deleteSessionDialog = true;
    },
    closeDeleteSessionDialog(){
      this.sessionToDelete = {};
      this.deleteSessionDialog = false;
    },
    deleteSession(){
      console.log('Delete session')
      ipcRenderer.send(DELETE_SESSION, {
        database: this.selectedDatabase,
        sessionId: this.sessionToDelete.id,
      });
      this.deleteSessionDialog = false;
    },
    openEditTrialDialog(t){
      this.trialToEdit = t;
      this.editTrialDialog = true;
    },
    closeEditTrialDialog(){
      this.trialToEdit = {};
      this.editTrialDialog = false;
    },
    editTrial(){
      console.log('edit trial')
      console.log(this.trialToEdit);
      ipcRenderer.send(UPDATE_TRIAL_DETAILS, {
        database: this.selectedDatabase,
        trialId: this.trialToEdit.id,
        trialName: this.trialToEdit.name,
      });
    },
    downloadTrial(t){
      console.log('Download trial....')
      console.log(t)
      ipcRenderer.send(DOWNLOAD_TRIAL, {
        database: this.selectedDatabase,
        trialId: t.id,
      });
    },
    exportTrialReport(t){
      ipcRenderer.send(EXPORT_TRIAL_REPORT, {
        database: this.selectedDatabase,
        trialId: t.id,
      });
    }
  },
};
</script>