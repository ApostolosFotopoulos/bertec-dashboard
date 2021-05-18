<template>
  <div>
    <v-container class="mt-0 pa-0">
      <v-row align="center">
        <v-col cols="3" offset="8" align="center">
          {{!isEditMode?"Press to edit":"Press to create"}} <v-icon>mdi-arrow-right</v-icon>
        </v-col>
        <v-col cols="1">
          <v-switch v-model="isEditMode" inset></v-switch>
        </v-col>
      </v-row>
    </v-container>
    <UserCreation v-if="!isEditMode"/>
    <UserEdit v-else />
  </div>
</template>

<script>
import UserCreation from '../components/usermanage/Creation.vue'
import UserEdit from '../components/usermanage/Edit.vue'
export default {
  components:{
    UserCreation,
    UserEdit
  },
  data() {
    return {
      isEditMode: false,
    };
  },
};
</script>

