<template>
  <v-container class="mt-0 pa-0">
    <v-row>
      <v-col>
        <h3>Create a new user</h3>
        <hr class="hr" />
        <div class="mt-3">
          <v-alert outlined type="success" text v-if="userCreationAlert">
            Successfully created a user
          </v-alert>
        </div>
      </v-col>
    </v-row>
    <v-row align="center" class="mt-0">
      <v-col align="center" cols="6" offset="3"
        ><v-select
          :items="
            databases.map((d) => ({
              text: d.substr(0, d.lastIndexOf('.')),
              value: d,
            }))
          "
          label="Database"
          @input="databaseChanged"
          clearable
          outlined
        ></v-select>
      </v-col>
    </v-row>
    <v-row align="center" class="mt-0">
      <v-col align="center">
        <v-text-field
          v-model="firstName"
          label="First Name"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center">
        <v-text-field v-model="lastName" label="Last Name" outlined clearable />
      </v-col>
    </v-row>
    <v-row align="center" class="mt-0">
      <v-col align="center">
        <v-text-field
          v-model="year"
          type="number"
          label="Year of Birth"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center">
        <v-text-field
          v-model="height"
          type="number"
          label="Height (cm)"
          outlined
          clearable
        />
      </v-col>
    </v-row>
    <v-row align="center" class="mt-0">
      <v-col align="center">
        <v-text-field
          v-model="legLength"
          type="number"
          label="Leg Length (cm)"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center">
        <v-select
          v-model="sex"
          :items="sexOptions"
          label="Sex"
          outlined
          clearable
        ></v-select>
      </v-col>
    </v-row>
    <v-row align="center" class="mt-0">
      <v-col align="center">
        <v-menu
          ref="injuryDate"
          v-model="injuryDateMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="injuryDate"
              label="Injury Date"
              outlined
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            ref="injuryDatePicker"
            v-model="injuryDate"
            light
            :max="new Date().toISOString().substr(0, 10)"
            min="1950-01-01"
            @change="saveInjuryDate"
          ></v-date-picker> </v-menu
      ></v-col>
      <v-col align="center">
        <v-menu
          ref="surgeryDate"
          v-model="surgeryDateMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="surgeryDate"
              label="Surgery Date"
              outlined
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            ref="surgeryDatePicker"
            v-model="surgeryDate"
            light
            :max="new Date().toISOString().substr(0, 10)"
            min="1950-01-01"
            @change="saveSurgeryDate"
          ></v-date-picker>
        </v-menu>
      </v-col>
    </v-row>
    <v-row align="center" class="mt-0">
      <v-col align="center" cols="4">
        <v-text-field
          v-model="weight"
          type="number"
          label="Weight (N)"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center" cols="2">
        <v-btn @click="getWeight()" class="getWeightButton">+ </v-btn>
      </v-col>
      <v-col align="center">
        <v-combobox
          v-model="selectedTags"
          :items="tags.map((t) => t.name)"
          label="Combobox"
          multiple
          outlined
          chips
        ></v-combobox>
      </v-col>
    </v-row>
    <v-row align="center" class="mt-0">
      <v-col align="center">
        <v-textarea
          v-model="otherInfo"
          label="Other Info"
          outlined
          clearable
          no-resize
          rows="4"
        ></v-textarea>
      </v-col>
    </v-row>
    <div class="createButtonDiv">
      <v-btn
        @click="createUser()"
        class="createUserButton"
        :disabled="
          selectedDatabase === '' ||
          !selectedDatabase ||
          firstName === '' ||
          !firstName ||
          year === '' ||
          !year ||
          height === '' ||
          !height ||
          legLength === '' ||
          !legLength ||
          sex === '' ||
          !sex ||
          injuryDate === '' ||
          !injuryDate ||
          surgeryDate === '' ||
          !surgeryDate ||
          weight === '' ||
          !weight
        "
      >
        Create
      </v-btn>
    </div>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require("electron");
import rowsNames from "../../../../assets/store/rowsNames.json";
const {SESSION_OPTIONS} = require('../../../../main/util/types')
export default {
  mounted() {
    this.fetchDatabasesInterval = setInterval(() => {
      ipcRenderer.send("FETCH_DATABASES_TO_USER_MANAGEMENT");
    }, 100);
    this.fetchTagsInterval = setInterval(() => {
      if (this.selectedDatabase && this.selectedDatabase != "") {
        ipcRenderer.send("FETCH_TAGS_TO_USER_MANAGEMENT", {
          database: this.selectedDatabase,
        });
      }
    }, 100);
    var _this = this;
    ipcRenderer.on(
      "FETCH_DATABASES_TO_USER_MANAGEMENT_RESPONSE",
      (_, responseData) => {
        _this.databases = responseData.databases;
      }
    );
    ipcRenderer.on(
      "FETCH_TAGS_TO_USER_MANAGEMENT_RESPONSE",
      (_, responseData) => {
        _this.tags = responseData.tags;
      }
    );
    ipcRenderer.on(SESSION_OPTIONS, (_, responseData) => {
      this.fz1 = Number(responseData.rows[rowsNames["FZ1"]]) || 0.0;
      this.fz2 = Number(responseData.rows[rowsNames["FZ2"]]) || 0.0;
    });
  },

  beforeDestroy() {
    clearInterval(this.fetchDatabasesInterval);
    clearInterval(this.fetchTagsInterval);
    ipcRenderer.removeListener(
      "FETCH_DATABASES_TO_USER_MANAGEMENT_RESPONSE",
      (_, responseData) => {
        _this.databases = responseData.databases;
      }
    );
    ipcRenderer.removeListener(
      "FETCH_TAGS_TO_USER_MANAGEMENT_RESPONSE",
      (_, responseData) => {
        _this.tags = responseData.tags;
      }
    );
    ipcRenderer.removeListener(SESSION_OPTIONS, (_, responseData) => {
      this.fz1 = Number(responseData.rows[rowsNames["FZ1"]]) || 0.0;
      this.fz2 = Number(responseData.rows[rowsNames["FZ2"]]) || 0.0;
    });
  },
  data() {
    return {
      userCreationAlert: false,
      selectedDatabase: "",
      databases: [],
      firstName: "",
      lastName: "",
      year: 1950,
      height: 120,
      legLength: 100,
      sex: "Male",
      sexOptions: ["Male", "Female"],
      injuryDateMenu: false,
      surgeryDateMenu: false,
      injuryDate: "",
      surgeryDate: "",
      fz1: 0,
      fz2: 0,
      weight: 0.0,
      otherInfo: "",
      tags: [],
      selectedTags: [],
      fetchDatabasesInterval: null,
      fetchTagsInterval: null,
    };
  },
  methods: {
    saveInjuryDate(date) {
      this.$refs.injuryDate.save(date);
    },
    saveSurgeryDate(date) {
      this.$refs.surgeryDate.save(date);
    },
    getWeight() {
      let w = this.fz1 + this.fz2;
      this.weight = w.toFixed(2);
    },
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
        surgeryDate: this.surgeryDate,
        injuryDate: this.injuryDate,
        tags: this.selectedTags,
      });

      this.firstName = "";
      this.lastName = "";
      this.year = 1950;
      this.height = 120;
      this.legLength = 100;
      this.sex = "Male";
      this.injuryDate = "";
      this.surgeryDate = "";
      this.weight = 0.0;
      this.otherInfo = "";
      this.selectedTags = [];
      this.userCreationAlert = true;
      setTimeout(() => {
        this.userCreationAlert = false;
      }, 3000);
    },
    databaseChanged(d) {
      if (d) {
        this.tags = [];
        this.selectedDatabase = d;
      } else {
        this.tags = [];
        this.selectedDatabase = "";
      }
    },
  },
};
</script>

<style>
.v-text-field__details {
  display: none !important;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

textarea::-webkit-scrollbar {
  background-color: transparent !important;
  width: 0px;
}
textarea::-webkit-scrollbar-track {
  background-color: transparent;
  width: 0px;
}
</style>

<style scoped>
.createUserButton,
.getWeightButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.createButtonDiv {
  text-align: right;
}
</style>
