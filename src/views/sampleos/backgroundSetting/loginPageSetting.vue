<template>
  <PageTemplate v-model:title="title" v-model:schemas="loginPageSettingSchemas" />
</template>

<script setup lang="ts">
  import PageTemplate from './PageTemplate.vue';
  import { loginPageSettingSchemas } from './data';
  import { ref } from 'vue';

  const title = ref('登录页');
</script>
