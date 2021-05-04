<template>
  <v-container class="mt-15">
    <Actions :skipDatabase="skipDatabase" :continueToMain="continueToMain" />
    <Options />
  </v-container>
</template>

<script>
import Options from "./Options.vue";
import Actions from "./Actions.vue";

export default {
  props: {
    skipDatabase: Function,
    continueToMain: Function,
  },
  components: {
    Options,
    Actions,
  },
};
</script>