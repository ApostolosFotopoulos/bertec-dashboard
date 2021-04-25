<template>
  <v-container>
    <v-row class="mt-4 mb-3">
      <v-col>
        <h3>Create a new user</h3>
        <hr class="hr" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
	<v-alert
	  outlined
	  type="success"
	  text
	  v-if="userCreationAlert"
	>
	  Successfully created a user
	</v-alert> 
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col align="center">
        <v-text-field v-model="firstName" label="First Name" outlined />
      </v-col>
      <v-col align="center">
        <v-text-field v-model="lastName" label="Last Name" outlined />
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col align="center">
        <v-text-field v-model="year" label="Year" outlined />
      </v-col>
      <v-col align="center">
        <v-text-field v-model="height" label="Height" outlined />
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col align="center">
        <v-text-field v-model="legLength" label="Leg Length" outlined />
      </v-col>
      <v-col align="center">
        <v-select
          v-model="sex"
          :items="sexOptions"
          label="Sex"
          outlined
        ></v-select>
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col align="center" cols="6">
        <v-select
          v-model="selectedDatabase"
          :items="databases"
          label="Database"
          outlined
        ></v-select>
      </v-col>
      <v-col align="center" cols="4">
        <v-text-field v-model="weight" label="Weight" outlined />
      </v-col>
      <v-col align="center" cols="1"> 
	<v-btn @click="getWeight()" class="getWeightButton">+ </v-btn>
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col align="center">
        <v-textarea
          v-model="otherInfo"
          label="Other Info"
          outlined
        ></v-textarea>
      </v-col>
    </v-row>
    <div class="createButtonDiv">
      <v-btn @click="createUser()" class="createUserButton"> Create </v-btn>
    </div>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require("electron");
import rowsNames from '../../assets/store/rowsNames.json'

export default {
  mounted() {
    setInterval(() => {
      ipcRenderer.send("FETCH_ALL_DATABASES");
    }, 10);
    var _this = this;
    ipcRenderer.on("FETCH_ALL_DATABASES_RESPONSE", (_, responseData) => {
      _this.databases = responseData.databases;
    });
    ipcRenderer.on("CREATE_USER_SESSION", (_, responseData) => { 
      this.fz1 = Number(responseData.rows[rowsNames["FZ1"]])
      this.fz2 = Number(responseData.rows[rowsNames["FZ2"]])
    });
  },
  data() {
    return {
      firstName: "",
      lastName: "",
      year: "",
      sex: "Male",
      height: "",
      legLength: "",
      weight: "",
      otherInfo: "",
      sexOptions: ["Male", "Female"],
      databases: [],
      selectedDatabase: "",
      fz1: 0,
      fz2: 0,
      userCreationAlert: false,
    };
  },
  methods: {
    createUser() {
      ipcRenderer.send("CREATE_USER", {
        database: this.selectedDatabase,
        firstName: this.firstName,
        lastName: this.lastName,
        year: Number(this.year) || 0,
        sex: this.sex,
        height: Number(this.height) || 0,
        legLength: Number(this.legLength) || 0,
        weight: Number(this.weight) || 0,
        otherInfo: this.otherInfo,
      });
      this.selectedDatabase = ""
      this.firstName = ""
      this.lastName = ""
      this.year = ""
      this.sex = "Male"
      this.height = ""
      this.legLength = ""
      this.weight = ""
      this.otherInfo = ""
      this.userCreationAlert = true
      setTimeout(() => { this.userCreationAlert = false }, 3000)
    },
    getWeight(){
      this.weight = this.fz1 + this.fz2
    }
  },
};
</script>

<style>
.v-text-field__details {
  display: none !important;
}
</style>

<style scoped>
.createUserButton, .getWeightButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.createButtonDiv {
  text-align: right;
}
</style>
