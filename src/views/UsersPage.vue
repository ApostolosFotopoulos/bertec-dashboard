<template>
  <v-container>
    <v-row class="mt-0">
      <v-col>
	<h3>View all the customers for a specific database</h3>
	<hr class="hr" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" offset="3" align="center">
	<v-select
	  class="mt-3"
	  :items="databases"
	  label="Database"
	  :items-per-page="5"
	  @input="databaseChanged"
	  outlined
	></v-select>
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col>
	<h3>User Filters</h3>
	<hr class="hr" />
      </v-col>
    </v-row>
    <v-row class="mt-10" align="center">
      <v-col cols="3">
	<v-text-field
	  v-model="search.firstName"
	  label="Firstname"
	  outlined
	/>
      </v-col>
      <v-col cols="3">
	<v-text-field
	  v-model="search.lastName"
	  label="Lastname"
	  outlined
	/>
      </v-col>
      <v-col cols="3">
	<v-range-slider
	  v-model="search.year"
	  :max="new Date().getFullYear()"
	  :min="1900"
	  label="Year"
	  hide-details
	  thumb-label="always"
        />
      </v-col>
      <v-col cols="3">
	<v-range-slider
	  v-model="search.weight"
	  :max="300"
	  :min="30"
	  label="Weight (kg)"
	  hide-details
	  thumb-label="always"
        />
      </v-col>
      <v-col cols="3">
	<v-select
          v-model="search.sex"
          :items="sexOptions"
          label="Sex"
          outlined
        ></v-select>
      </v-col>
      <v-col cols="3">
	<v-range-slider
	  v-model="search.height"
	  :max="250"
	  :min="100"
	  label="Height (cm)"
	  hide-details
	  thumb-label="always"
        />
      </v-col>
      <v-col cols="3">
	<v-range-slider
	  v-model="search.legLength"
	  :max="200"
	  :min="30"
	  label="Leg Length (cm)"
	  hide-details
	  thumb-label="always"
        />
      </v-col>
      <v-col cols="3" style="display:inline-block;">
	<v-btn @click="applyFilters()" class="applyButton">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
	<v-btn @click="resetFilters()" class="resetButton">
          <v-icon>mdi-restart</v-icon>
        </v-btn>
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
import moment from 'moment'
export default{
  mounted() {
    setInterval(() => {
      ipcRenderer.send("FETCH_ALL_DATABASES");
    }, 10);
    var _this = this;
    ipcRenderer.on("FETCH_ALL_DATABASES_RESPONSE", (_, responseData) => {
      _this.databases = responseData.databases;
    });
    ipcRenderer.on("FETCH_ALL_USERS_RESPONSE", (_, responseData) => {
      console.log(responseData.users)
      _this.users = responseData.users
    });
  },
  data() {
    return {
      databases: [],
      users: [],
      selectedDatabase: "",
      headers: [
	{
	  text: "Firstname",
	  value: "firstName"
	},
	{
	  text: "Lastname",
	  value: "lastName"
	},
	{
	  text: "Year",
	  value: "year"
	},
	{
	  text: "Other Info",
	  value: "other_info"
	},
	{
	  text: "Sex",
	  value: "sex"
	},
	{
	  text: "Height",
	  value: "height"
	},
	{
	  text: "Leg Length",
	  value: "leg_length"
	},
	{
	  text: "Weight",
	  value: "weight"
	},
	{
	  text: "Created At",
	  value: "created_at"
	},
	{
	  text: "Updated At",
	  value: "updated_at"
	}
      ],
      sexOptions: ["Male", "Female","All"],
      search: {
	firstName: "",
	lastName: "",
	year: [1900, new Date().getFullYear()],
	weight: [30, 300],
	sex: "All",
	height: [100, 250],
	legLength: [30,200]
      }
    };
  },
  methods: {
    databaseChanged(d) {
      this.selectedDatabase = d;
      this.users = []
      ipcRenderer.send("FETCH_ALL_USERS", { database: d });
    },
    applyFilters(){
      console.log({...this.search, database: this.selectedDatabase })
      ipcRenderer.send("QUERY_USERS",{ ...this.search });
    },
    resetFilters(){
      this.search = {
	firstName: "",
	lastName: "",
	year: [1900, new Date().getFullYear()],
	weight: [30, 300],
	sex: "All",
	height: [100, 250],
	legLength: [30,200]
      },
      ipcRenderer.send("QUERY_USERS",{ ...this.search });
   }
  }
}
</script>

<style>
.v-data-footer__select,.v-data-footer__pagination{
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
.resetButton{
  height: 38px !important;
  min-height: 38px !important;
  background: #ffa505 !important;
}
</style>
