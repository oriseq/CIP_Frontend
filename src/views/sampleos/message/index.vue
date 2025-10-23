<template>
  <PageWrapper :class="prefixCls" dense contentBackground>
    <!--    <template #headerContent>-->
    <!--    </template>-->
    <div :class="`${prefixCls}-bottom`">
      <!--        <PageWrapper contentBackground fixedHeight contentClass="flex">-->
      <Tabs @change="tabChange" :activeKey="activeKey" :destroyInactiveTabPane="true">
        <template v-for="item in listData" :key="item.key">
          <Tabs.TabPane>
            <template #tab>
              {{ item.name }}
              <!--            <span v-if="item.list.length !== 0">({{ item.list.length }})</span>-->
            </template>
            <BasicForm v-show="activeKey == 1" @register="register1" @submit="handleSubmit" />
            <BasicForm v-show="activeKey == 3" @register="register2" @submit="handleSubmit" />
            <!--          {{ item.name }}-->
            <NoticeList :list="item.list" />
          </Tabs.TabPane>
        </template>
      </Tabs>
      <!--        </PageWrapper>-->
    </div>
  </PageWrapper>
</template>

<script setup lang="ts">
  import { tabListData, schemas, schemas2, getAllMessage } from './data';
  import { Tabs } from 'ant-design-vue';
  import { PageWrapper } from '@/components/Page';
  import NoticeList from './NoticeList.vue';
  import { BasicForm, useForm } from '@/components/Form';
  import { defHttpForRes } from '@/utils/http/axios';
  import { useUserStore } from '@/store/modules/user';
  import { onMounted, reactive, ref } from 'vue';

  const prefixCls = 'message-manage';
  const userStore = useUserStore();
  // 通知+待办数据
  const listMsg = reactive([]);
  // 整体数据结构
  const listData = ref(tabListData);
  const activeKey = ref('1');

  const [register2, { resetFields: resetFields2 }] = useForm({
    labelWidth: 75,
    schemas: schemas2,
    actionColOptions: {
      span: 24,
    },
    showActionButtonGroup: true,
    resetButtonOptions: {
      onClick: async () => {
        await initMessage(null); // 重置按钮初始化
      },
    },
    // showActionButtonGroup: false,
  });
  const [register1, { resetFields: resetFields1, getFieldsValue }] = useForm({
    labelWidth: 75,
    schemas,
    actionColOptions: {
      span: 24,
    },
    showActionButtonGroup: true,
    resetButtonOptions: {
      onClick: async () => {
        await initMessage(null); // 重置按钮初始化
      },
    },
    // showActionButtonGroup: false,
  });

  /**
   * 消息获取
   */
  // function getMessage(params) {
  //   // console.log('userStore.userInfo:　', userStore.userInfo);
  //   defHttpForRes
  //     .post({
  //       url: '/message/msgAll',
  //       params,
  //     })
  //     .then((res) => {
  //       // console.log('res：', res);
  //       if (res.success) {
  //         const data = res.result;
  //         // listMsg.value.splice(0, listMsg.value.length, ...data);
  //         Object.assign(listMsg, data);
  //         // listMsg = [...data];
  //         const groupedData = data.reduce((acc, item) => {
  //           if (!acc[item.type]) {
  //             acc[item.type] = [];
  //           }
  //           acc[item.type].push(item);
  //           return acc;
  //         }, {});
  //         // 设置真实数据
  //         listData.value.forEach((item) => {
  //           item.list = [];
  //           if (item.key == '1' && groupedData['1']?.length) {
  //             item.list.splice(0, item.list.length, ...groupedData['1']);
  //           } else if (item.key == '3' && groupedData['3']?.length) {
  //             item.list.splice(0, item.list.length, ...groupedData['3']);
  //           }
  //         });
  //       }
  //     });
  // }
  // getMessage();

  /**
   * 初始信息
   * @param params
   */
  async function initMessage(params) {
    // eslint-disable-next-line no-irregular-whitespace
    // console.log('userStore.userInfo:　', userStore.userInfo);
    const res = await getAllMessage(params);
    // console.log('res：', res);
    if (res.success) {
      const data = res.result;
      // listMsg.value.splice(0, listMsg.value.length, ...data);
      Object.assign(listMsg, data);
      // listMsg = [...data];
      const groupedData = data.reduce((acc, item) => {
        if (!acc[item.type]) {
          acc[item.type] = [];
        }
        acc[item.type].push(item);
        return acc;
      }, {});
      // 设置真实数据
      listData.value.forEach((item) => {
        item.list = [];
        if (item.key == '1' && groupedData['1']?.length) {
          item.list.splice(0, item.list.length, ...groupedData['1']);
        } else if (item.key == '3' && groupedData['3']?.length) {
          item.list.splice(0, item.list.length, ...groupedData['3']);
        }
      });
    }
  }

  onMounted(() => {
    initMessage();
  });

  /**
   * 点击tab
   * @param actKey
   */
  function tabChange(actKey) {
    activeKey.value = actKey;
    if (actKey == '1') {
      initMessage({
        type: 1,
      });
      // resetFields2();
      // readMsg(MessageType.NOTIFICATION);
      // updateSchema([{ field: 'secondaryType', label: '待办类型'}]);
      // console.log("schemas: ", schemas);
    } else if (actKey == '3') {
      initMessage({
        type: 3,
      });
      // resetFields1();
      // console.log("schemas: ", schemas);
      // readMsg(MessageType.TODO);
      // updateSchema([
      //   { field: 'secondaryType', label: '通知类型' },
      //   { field: 'status', label: '查收类型' },
      // ]);
    }
    // console.log('tabChange:', actKey);
  }

  function handleSubmit(values) {
    // console.log('click search,values:' + JSON.stringify(values));
    initMessage({
      ...values,
      type: activeKey.value,
    });
  }
</script>

<style lang="less" scoped>
  .message-manage {
    &-bottom {
      //margin: 0 16px 16px;
      padding: 0 15px 10px;
      border-radius: 3px;
      background-color: @component-background;
    }
  }
</style>
