<template>
  <v-container>
    <v-row class="mt-0">
      <v-col>
        <h3>View all the customers for a specific database</h3>
        <hr class="hr" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="2">
        <v-select
          v-model="selectedDatabase"
          :items="
            databases.map((d) => ({
              text: d.substr(0, d.lastIndexOf('.')),
              value: d,
            }))
          "
          label="Database"
          :items-per-page="5"
          @input="databaseChanged"
          outlined
        ></v-select>
      </v-col>
      <v-col cols="1">
        <v-text-field v-model="search.firstName" label="Hospital ID" outlined />
      </v-col>
      <v-col cols="2">
        <v-text-field v-model="search.firstName" label="Firstname" outlined />
      </v-col>
      <v-col cols="2">
        <v-text-field v-model="search.lastName" label="Lastname" outlined />
      </v-col>
      <v-col cols="1">
        <v-select
          v-model="search.sex"
          :items="sexOptions"
          label="Sex"
          outlined
        ></v-select>
      </v-col>
      <v-col cols="2">
        <v-select
          v-model="affected"
          :items="affectedOptions"
          label="Affected Side"
          outlined
        ></v-select>
      </v-col>
      <v-col cols="2" align="right">
        <v-btn @click="applyFilters()" class="applyButton mt-2">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
        <v-btn @click="resetFilters()" class="resetButton mt-2">
          <v-icon>mdi-restart</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row class="mt-10" align="center">
      <v-col cols="2">
        <v-range-slider
          v-model="search.year"
          :max="new Date().getFullYear()"
          :min="1960"
          hide-details
          thumb-label="always"
        />
        <div class="text-center"> Year of Birth </div>
      </v-col>
      <v-col cols="2">
        <v-range-slider
          v-model="search.weight"
          :max="2000"
          :min="300"
          hide-details
          thumb-label="always"
        />
        <div class="text-center"> Weight (N) </div>
      </v-col>
      <v-col cols="2">
        <v-range-slider
          v-model="search.height"
          :max="250"
          :min="100"
          hide-details
          thumb-label="always"
        />
        <div class="text-center"> Height (cm) </div>
      </v-col>
      <v-col cols="2">
        <v-range-slider
          v-model="search.legLength"
          :max="200"
          :min="30"
          hide-details
          thumb-label="always"
        />
        <div class="text-center"> Leg Length (cm) </div>
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col>
        <h3>Users</h3>
        <hr class="hr" />
      </v-col>
    </v-row>
    <v-row class="mt-8">
      <v-col>
        <v-data-table
          light
          :headers="headers"
          :items="users"
          class="elevation-1"
        ></v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require("electron");
const {FETCH_USERS_TO_VIEW, FETCH_USERS_TO_VIEW_RESPONSE} = require('../../../main/util/types')
export default {
  mounted() {
    setInterval(() => {
      ipcRenderer.send("FETCH_ALL_DATABASES");
    }, 10);
    
    var _this = this;
    ipcRenderer.on("FETCH_ALL_DATABASES_RESPONSE", (_, responseData) => {
      _this.databases = responseData.databases;
    });
    ipcRenderer.on(FETCH_USERS_TO_VIEW_RESPONSE, (_, responseData) => {
      console.log(responseData.users);
      _this.users = responseData.users;
    });
    ipcRenderer.on("FETCH_SELECTED_DATABASE_RESPONSE", (_, responseData) => {
      if(_this.selectedDatabase  === ""){
        console.log(_this.selectedDatabase)
        if(responseData.database != ""){
          _this.selectedDatabase = responseData.database
          ipcRenderer.send(FETCH_USERS_TO_VIEW, { database: _this.selectedDatabase });
        }
      }
    });
  },
  data() {
    return {
      databases: [],
      users: [],
      selectedDatabase: "",
      headers: [
        {
          text: "Hospital ID",
          sortable: false,
          value: "hospital_code",
        },
        {
          text: "Firstname",
          value: "firstName",
        },
        {
          text: "Lastname",
          value: "lastName",
        },
        {
          text: "Year of Birth",
          value: "year",
        },
        {
          text: "Other Info",
          value: "other_info",
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
          text: "Leg Length (cm)",
          value: "leg_length",
        },
        {
          text: "Weight (N)",
          value: "weight",
          sortable: false,
        },
        {
          text: "Affected Side",
          value: "affected_side",
          sortable: false,
        },
        {
          text: "Injury Date",
          value: "injury_date",
        },
        {
          text: "Surgery Date",
          value: "surgery_date",
        },
      ],
      sexOptions: ["Male", "Female", "All"],
      affected:"Not Affected",
      affectedOptions: ["Left","Right","Left + Right","Not Affected"],
      search: {
        firstName: "",
        lastName: "",
        year: [1960, new Date().getFullYear()],
        weight: [300, 2000],
        sex: "All",
        height: [100, 250],
        legLength: [30, 200],
      },
    };
  },
  methods: {
    databaseChanged(d) {
      this.selectedDatabase = d;
      this.users = [];
      ipcRenderer.send(FETCH_USERS_TO_VIEW, { database: d });
    },
    applyFilters() {
      console.log({ ...this.search, database: this.selectedDatabase });
      ipcRenderer.send("QUERY_USERS", { ...this.search });
    },
    resetFilters() {
      (this.search = {
        firstName: "",
        lastName: "",
        year: [1900, new Date().getFullYear()],
        weight: [30, 300],
        sex: "All",
        height: [100, 250],
        legLength: [30, 200],
      }),
      ipcRenderer.send("QUERY_USERS", { ...this.search });
    },
  },
};
</script>

<style>
.v-data-footer__select,
.v-data-footer__pagination {
  display: none !important;
}
.v-text-field__details {
  display: none !important;
}
</style>

<style scoped>
.applyButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.resetButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #ffa505 !important;
}
</style>
