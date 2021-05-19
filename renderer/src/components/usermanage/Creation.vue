<template>
  <v-container class="mt-0 pa-0">
    <v-row>
      <v-col>
        <h3>Create a new user</h3>
        <hr class="hr" />
        <div class="mt-3">
          <v-alert outlined :type="userCreationAlertError?'error':'success'" text v-if="userCreationAlert">
            {{userCreationAlertMessage}}
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
          v-model="hospitalID"
          label="Hospital ID"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center">
        <v-select
          v-model="affectedSide"
          :items="affectedSideOptions"
          label="Affected Side"
          outlined
          clearable
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
              readonly
              clearable
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
              readonly
              clearable
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
          label="Tags"
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
          firstName.trim() === '' ||
          !firstName ||
          lastName.trim() === '' ||
          !lastName ||
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
          !weight ||
          hospitalID.trim() === '' ||
          !hospitalID ||
          affectedSide === '' ||
          !affectedSide
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
const { 
  SESSION_OPTIONS,FETCH_DATABASES_TO_USERS, FETCH_DATABASES_TO_USERS_RESPONSE ,FETCH_TAGS_TO_USERS ,FETCH_TAGS_TO_USERS_RESPONSE,
  CREATE_USER, CREATE_USER_RESPONSE
} = require('../../../../main/util/types')
export default {
  mounted() {
    this.fetchDatabasesInterval = setInterval(() => {
      ipcRenderer.send(FETCH_DATABASES_TO_USERS);
    }, 100);
    this.fetchTagsInterval = setInterval(() => {
      if (this.selectedDatabase && this.selectedDatabase != "") {
        ipcRenderer.send(FETCH_TAGS_TO_USERS, {
          database: this.selectedDatabase,
        });
      }
    }, 100);
    var _this = this;
    ipcRenderer.on(
      FETCH_DATABASES_TO_USERS_RESPONSE,
      (_, responseData) => {
        _this.databases = responseData.databases;
      }
    );
    ipcRenderer.on(
      FETCH_TAGS_TO_USERS_RESPONSE,
      (_, responseData) => {
        _this.tags = responseData.tags;
      }
    );
    ipcRenderer.on(
      CREATE_USER_RESPONSE,
      (_, responseData) => {
        
        _this.firstName = "";
        _this.lastName = "";
        _this.year = 1950;
        _this.height = 120;
        _this.legLength = 100;
        _this.sex = "Male";
        _this.injuryDate = "";
        _this.surgeryDate = "";
        _this.weight = 0.0;
        _this.otherInfo = "";
        _this.selectedTags = [];
        _this.userCreationAlert = true;
        _this.affectedSide = "Non Affected";
        _this.hospitalID = "";
        _this.userCreationAlertError = responseData.error?true:false
        _this.userCreationAlertMessage = responseData.error?"An error occured while creating a user":"Successfully created a user"
        setTimeout(() => {
          _this.userCreationAlert = false;
        }, 3000);
      }
    );
    ipcRenderer.on(SESSION_OPTIONS, (_, responseData) => {
      _this.fz1 = Number(responseData.rows[rowsNames["FZ1"]]) || 0.0;
      _this.fz2 = Number(responseData.rows[rowsNames["FZ2"]]) || 0.0;
    });
  },

  beforeDestroy() {
    clearInterval(this.fetchDatabasesInterval);
    clearInterval(this.fetchTagsInterval);
    ipcRenderer.removeListener(
      FETCH_DATABASES_TO_USERS_RESPONSE,
      (_, responseData) => {
        _this.databases = responseData.databases;
      }
    );
    ipcRenderer.removeListener(
      FETCH_TAGS_TO_USERS_RESPONSE,
      (_, responseData) => {
        _this.tags = responseData.tags;
      }
    );
    ipcRenderer.removeListener(
      CREATE_USER_RESPONSE,
      (_, responseData) => {
        
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
        this.affectedSide = "Non Affected";
        this.hospitalID = "";
        this.userCreationAlertError = responseData.error?true:false
        this.userCreationAlertMessage = responseData.error?"An error occured while creating a user":"Successfully created a user"
        setTimeout(() => {
          this.userCreationAlert = false;
        }, 3000);
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
      userCreationAlertError:false,
      userCreationAlertMessage:"",
      selectedDatabase: "",
      databases: [],
      firstName: "",
      lastName: "",
      hospitalID:"",
      year: 1950,
      height: 120,
      legLength: 100,
      sex: "Male",
      sexOptions: ["Male", "Female"],
      affectedSide: "Non Affected",
      affectedSideOptions: ["Left","Right","Left + Right", "Non Affected"],
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
      ipcRenderer.send(CREATE_USER, {
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
        hospitalID: this.hospitalID,
        affectedSide: this.affectedSide
      });
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
  padding-bottom:5%;
}
</style>
