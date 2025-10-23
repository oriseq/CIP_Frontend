<template>
  <div :class="prefixCls">
    <Tabs tab-position="left">
      <template v-for="item in settingList" :key="item.key">
        <TabPane :tab="item.name">
          <!-- 使用 ScrollContainer 包裹右侧内容 -->
          <ScrollContainer style="width: 100%; max-width: 100%">
            <component :is="tabs[item.component]" />
          </ScrollContainer>
        </TabPane>
      </template>
    </Tabs>
  </div>
</template>

<script lang="ts" setup>
  import { Tabs } from 'ant-design-vue';
  import { ScrollContainer } from '@/components/Container';
  import { settingList } from './data';
  import BaseSetting from './BaseSetting.vue';
  import ChangePassword from './ModifyPassword.vue';

  const TabPane = Tabs.TabPane;
  const tabs = {
    BaseSetting,
    ChangePassword,
  };

  const prefixCls = 'account-setting';
  // const tabBarStyle = {
  //   width: '220px',
  // };
</script>
<style lang="less">
  // 定义左侧宽度
  @tab-bar-width: 150px;

  .account-setting {
    margin: 12px;
    background-color: @component-background;

    .base-title {
      padding-left: 0;
    }

    .ant-tabs-tab-active {
      background-color: @item-active-bg;
    }

    .ant-tabs-tab {
      display: flex;
      // align-items: center;
      // justify-content: center;
      width: @tab-bar-width;
      margin: 5px 0 !important;
      padding: 10px !important;
    }

    // 固定左侧标签栏宽度和位置
    .ant-tabs-nav-list {
      position: sticky;
      z-index: 1;
      top: 0;
      width: @tab-bar-width;
      margin: 5px 0 !important;
    }

    .vben-collapse-container__header {
      position: sticky;
      z-index: 2;
      top: 0;
      background-color: @component-background;
    }

    // 右侧内容区域高度适配并支持滚动
    .ant-tabs-content-holder {
      height: calc(100vh - 120px);
      overflow: hidden;
    }

    .ant-tabs-content {
      height: 100%;
      overflow: hidden auto;
    }

    // 确保 ScrollContainer 不会产生额外宽度
    .scroll-container {
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
    }

    // 防止内容溢出
    .ant-tabs-tabpane {
      overflow-x: hidden;
    }
  }
</style>
