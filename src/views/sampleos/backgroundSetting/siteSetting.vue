<template>
  <PageTemplate
    v-model:title="title"
    v-model:schemas="siteSettingSchemas"
    @success="handleSuccess"
  />
</template>

<script setup lang="ts">
  import PageTemplate from './PageTemplate.vue';
  import { siteSettingSchemas } from './data';
  import { ref } from 'vue';

  const title = ref('站点设置');

  const handleSuccess = async (info) => {
    if (info) {
      // window.location.reload();
    }
  };
</script>
