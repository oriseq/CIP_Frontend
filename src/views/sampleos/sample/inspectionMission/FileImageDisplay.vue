<template>
  <TableImg :size="30" :simpleShow="true" :imgList="processedUrls" />
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { getFile } from './inspectionMissionApi';

  const props = defineProps<{
    urls: string[];
  }>();

  const processedUrls = ref<string[]>([]);

  onMounted(async () => {
    loadImages();
  });

  // 监控 urls 变化
  watch(
    () => props.urls,
    (newUrls, oldUrls) => {
      console.log('props.urls changed:', newUrls);
      if (newUrls && newUrls.length) {
        loadImages();
      }
    },
  );

  const loadImages = async () => {
    try {
      if (props.urls.length === 0) {
        return;
      }
      const promises = props.urls.map(async (url) => {
        try {
          const response = await getFile(url);
          if (!response || !response.data) {
            console.error('无效的图片响应:', url);
            return null;
          }

          const contentType = response.headers['content-type'];
          if (!contentType?.startsWith('image/')) {
            console.error('非图片类型文件:', url);
            return null;
          }

          const blob = new Blob([response.data], { type: contentType });
          return window.URL.createObjectURL(blob);
        } catch (err) {
          console.error('处理单个图片失败:', url, err);
          return null;
        }
      });

      const results = await Promise.all(promises);
      processedUrls.value = results.filter((url) => url !== null);
    } catch (error) {
      console.error('图片处理失败:', error);
      // error('图片加载失败');
      processedUrls.value = [];
    }
  };
</script>
