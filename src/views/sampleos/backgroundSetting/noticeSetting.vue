<template>
  <div class="notice-setting-container">
    <!-- 固定的全选行 -->
    <div class="fixed-header">
      <a-checkbox
        v-model:checked="state.checkAll"
        :indeterminate="state.indeterminate"
        @change="onCheckAllChange"
      >
        全选
      </a-checkbox>
      <a-divider />
    </div>

    <!-- 可滚动的内容区域 -->
    <div class="scrollable-content">
      <a-checkbox-group v-model:value="state.checkedList">
        <a-row :gutter="[10, 10]">
          <a-col v-for="item in plainOptions" :span="22" :key="item.id">
            <a-checkbox :value="item.id">{{ item.msgType }}</a-checkbox>
          </a-col>
        </a-row>
      </a-checkbox-group>
      <a-divider />
      <a-button type="primary" @click="handleSubmit(state.checkedList)">提交</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, watch, onMounted, ref } from 'vue';
  import { getNoticeOptionsApi, NoticeItem, bachUpdateApi } from './data.ts';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { createMessage } = useMessage();
  const { success, error } = createMessage;

  // 勾选值
  const dataArray = defineModel<any[]>('dataArray', { default: () => [] });

  // 选项数据（后面从接口拿）
  const plainOptions = ref<NoticeItem[]>([]);
  onMounted(() => {
    getNoticeOptionsApi({}).then((res) => {
      console.log('🚀 ~ res.data:', res.data);
      plainOptions.value = [...res.data.result];
    });
  });

  // const plainOptions = [
  //   {
  //     id: 1,
  //     msgType: '样本提交',
  //   },
  //   {
  //     id: 2,
  //     msgType: '新合作项目申请',
  //   },
  //   {
  //     id: 3,
  //     msgType: '样本过户',
  //   },
  //   {
  //     id: 4,
  //     msgType: '样本代管',
  //   },
  //   {
  //     id: 5,
  //     msgType: '取消样本代管',
  //   },
  // ];

  // 获取配置项的勾选值
  const checkedOptions = JSON.parse(
    dataArray.value
      .filter((item) => item.configKey === 'notify.basic.use')
      .map((item) => item.configValue)[0],
  );
  console.log('🚀 ~ checkedOptions:', checkedOptions);
  const state = reactive({
    indeterminate: true,
    checkAll: false,
    checkedList: checkedOptions,
  });

  const onCheckAllChange = (e: any) => {
    console.log('🚀 ~ onCheckAllChange ~ e:', e);
    Object.assign(state, {
      checkedList: e.target.checked ? plainOptions.value.map((item) => item.id) : [],
      indeterminate: false,
    });
  };
  watch(
    () => state.checkedList,
    (val) => {
      state.indeterminate = !!val.length && val.length < plainOptions.value.length;
      state.checkAll = val.length === plainOptions.value.length;
    },
  );

  // 提交通知勾选的选项
  const handleSubmit = (val: any) => {
    console.log('🚀 ~ val:', val);
    const formData = { 'notify.basic.use': JSON.stringify(val) };
    console.log('🚀 ~ handleSubmit ~ formData:', formData);
    bachUpdateApi(formData).then((res) => {
      console.log('🚀 ~ res:', res);
      if (res.success) {
        success(res.message);
      } else {
        error(res.message);
      }
    });
  };
</script>
<style lang="less" scoped>
  .notice-setting-container {
    display: flex;
    flex-direction: column;
    height: 680px; // 设置一个固定高度用于测试
  }

  .fixed-header {
    position: sticky; // 或者使用 sticky 定位
    z-index: 10;
    top: 0;
    flex-shrink: 0;
    margin-top: 20px;
    background: #fff; // 添加背景色以便观察效果
  }

  .scrollable-content {
    flex: 1;
    padding-right: 10px;
    overflow: hidden auto; // 隐藏水平滚动 // 只允许垂直滚动
  }

  .submit-button-container {
    padding: 20px 0; // 给提交按钮一些间距
  }
</style>
