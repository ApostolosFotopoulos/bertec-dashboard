<template>
  <v-container>
    <v-row class="mt-4 mb-3">
      <v-col>
        <h3>Create a new user</h3>
        <hr class="hr" />
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
      <v-col align="center">
        <v-select
          v-model="selectedDatabase"
          :items="databases"
          label="Database"
          outlined
        ></v-select>
      </v-col>
      <v-col align="center">
        <v-text-field v-model="weight" label="Weight" outlined />
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
export default {
  mounted() {
    setInterval(() => {
      ipcRenderer.send("FETCH_ALL_DATABASES");
    }, 10);
    var _this = this;
    ipcRenderer.on("FETCH_ALL_DATABASES_RESPONSE", (_, responseData) => {
      _this.databases = responseData.databases;
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
    };
  },
  methods: {
    createUser() {
      ipcRenderer.send("CREATE_USER", {
        database: selectedDatabase,
        firstName,
        lastName,
        year: Number(year),
        sex,
        height: Number(height),
        legLength: Number(legLength),
        weight: Number(weight),
        otherInfo,
      });
    },
  },
};
</script>

<style>
.v-text-field__details {
  display: none !important;
}
</style>
<style scoped>
.createUserButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.createButtonDiv {
  text-align: right;
}
</style>
