<template>
  <v-container>
    <v-row class="mt-0">
      <v-col>
        <h3>View all the customers</h3>
        <hr class="hr" />
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col align="center">
        <v-select
          dense
          :items="
            databases.map((d) => ({
              text: d.substr(0, d.lastIndexOf('.')),
              value: d,
            }))
          "
          label="Database"
          @input="changeDatabase"
          outlined
          clearable
        ></v-select>
      </v-col>
      <v-col align="center">
        <v-text-field
          dense
          v-model="search.firstName"
          label="First Name"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center">
        <v-text-field
          dense
          v-model="search.lastName"
          label="Last Name"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center">
        <v-text-field
          dense
          v-model="search.hospitalID"
          label="Hospital ID"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center">
        <v-select
          dense
          v-model="search.affectedSide"
          :items="affectedSideOptions"
          label="Affected Side"
          outlined
          clearable
        ></v-select>
      </v-col>
      <v-col align="center">
        <v-select
          dense
          v-model="search.sex"
          :items="sexOptions"
          label="Sex"
          outlined
          clearable
        ></v-select>
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col align="center">
        <v-text-field
          dense
          v-model="search.year[0]"
          label="Year - Min"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center">
        <v-text-field
          dense
          v-model="search.year[1]"
          label="Year - Max"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center">
        <v-text-field
          dense
          v-model="search.height[0]"
          label="Height - Min"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center">
        <v-text-field
          dense
          v-model="search.height[1]"
          label="Height - Max"
          outlined
          clearable
        />
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col align="center">
        <v-text-field
          dense
          v-model="search.legLength[0]"
          label="Leg Length - Min"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center">
        <v-text-field
          dense
          v-model="search.legLength[1]"
          label="Leg Length - Max"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center">
        <v-text-field
          dense
          v-model="search.weight[0]"
          label="Weight - Min"
          outlined
          clearable
        />
      </v-col>
      <v-col align="center">
        <v-text-field
          dense
          v-model="search.weight[1]"
          label="Weight - Max"
          outlined
          clearable
        />
      </v-col>
    </v-row>
    <v-row>
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
              dense
              :value="`${search.surgeryRange.start!='' && search.surgeryRange.end!='' ?moment(search.surgeryRange.start).format('DD/MM/YYYY')+' - '+moment(search.surgeryRange.end).format('DD/MM/YYYY'):''}`"
              label="Surgery Date Range"
              outlined
              v-bind="attrs"
              v-on="on"
              readonly
              clearable
              @click:clear="clearSurgeryDate"
            ></v-text-field>
          </template>
          <vc-date-picker
            v-model="search.surgeryRange"
            is-range
          />
        </v-menu>
      </v-col>
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
              dense
              :value="`${search.injuryRange.start!='' && search.injuryRange.end!='' ?moment(search.injuryRange.start).format('DD/MM/YYYY')+' - '+moment(search.injuryRange.end).format('DD/MM/YYYY'):''}`"
              label="Injury Date Range"
              outlined
              v-bind="attrs"
              v-on="on"
              readonly
              clearable
              @click:clear="clearInjuryDate"
            ></v-text-field>
          </template>
          <vc-date-picker
            v-model="search.injuryRange"
            is-range
          />
        </v-menu>
      </v-col>
      <v-col align="center">
        <v-combobox
          dense
          v-model="search.selectedTags"
          :items="tags.map((t) => t.name)"
          label="Tags"
          multiple
          outlined
          chips
        ></v-combobox>
      </v-col>
      <v-col align="center">
        <v-btn
          @click="applyFilters()"
          class="applyButton"
          block
          :disabled="!selectedDatabase || selectedDatabase === ''"
        >
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </v-col>
      <v-col align="center">
        <v-btn
          @click="resetFilters()"
          class="resetButton"
          block
          :disabled="!selectedDatabase || selectedDatabase === ''"
        >
          <v-icon>mdi-restart</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import moment from 'moment';

export default {
  props: {
    search: Object,
    changeDatabase: Function,
    affectedSideOptions: Array,
    clearSurgeryDate: Function,
    clearInjuryDate: Function,
    sexOptions: Array,
    databases: Array,
    tags: Array,
    selectedDatabase: String,
    applyFilters: Function,
    resetFilters: Function,
  },
  data() {
    return {
      surgeryDateMenu: false,
      injuryDateMenu: false,
    };
  },
  methods:{
    moment,
  }
};
</script>

<style>
.v-text-field.v-text-field--enclosed .v-text-field__details {
  display: none;
}
.v-data-footer__select,
.v-data-footer__pagination {
  display: none !important;
}
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
.applyButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #6ab187 !important;
}
.resetButton {
  height: 38px !important;
  min-height: 38px !important;
  background: #f4a261 !important;
}
</style>