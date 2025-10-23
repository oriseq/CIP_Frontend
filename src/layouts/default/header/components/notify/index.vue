<template>
  <div :class="prefixCls">
    <Popover
      title=""
      trigger="click"
      :overlayClassName="`${prefixCls}__overlay`"
      @click="popoverClick"
    >
      <Badge :count="count" dot :numberStyle="numberStyle">
        <BellOutlined />
      </Badge>
      <template #content>
        <div style="min-width: 20vw"></div>
        <Tabs @change="tabChange" :activeKey="activeKey">
          <template v-for="item in listData" :key="item.key">
            <Tabs.TabPane>
              <template #tab>
                {{ item.name }}
                <span v-if="item.list.length !== 0">({{ item.list.length }})</span>
              </template>
              <div
                v-if="item.key === '1'"
                style="
                  margin: -12px 2px 2px 4px;
                  display: flex;
                  flex-direction: row;
                  justify-content: flex-end;
                "
              >
                <a-button size="small" @click="checkThisPage">查收本页</a-button>
                <div class="mr-1"></div>
                <a-button size="small" @click="checkAllPage">查收全部</a-button>
              </div>
              <!-- 绑定title-click事件的通知列表中标题是“可点击”的-->
              <div class="notice-list-container">
                <NoticeList
                  :list="item.list"
                  v-if="item.key === '1'"
                  @title-click="onNoticeClick"
                  @update:get-data="handleGetDataChange"
                />
                <NoticeList :list="item.list" v-else />
              </div>
            </Tabs.TabPane>
          </template>
        </Tabs>
      </template>
    </Popover>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref, reactive, onMounted } from 'vue';
  import { Popover, Tabs, Badge } from 'ant-design-vue';
  import { BellOutlined } from '@ant-design/icons-vue';
  import { tabListData, ListItem, checkMsgApi } from './data';
  import NoticeList from './NoticeList.vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useUserStore } from '@/store/modules/user';
  import { defHttpForRes } from '@/utils/http/axios';
  import { MessageType } from '@/hooks/message/useMessageNotify';
  import _default from 'ant-design-vue/es/vc-slick/inner-slider';

  const userStore = useUserStore();
  // console.log('userStore?.userInfo: ', userStore?.userInfo);

  const { prefixCls } = useDesign('header-notify');
  const { createMessage } = useMessage();
  const listData = ref(tabListData);
  const listMsg = reactive([]);
  const numberStyle = {};
  const activeKey = ref('1');
  const count = ref(0);

  /**
   * 消息获取
   */
  function getMessage() {
    // console.log('userStore.userInfo:　', userStore.userInfo);
    defHttpForRes
      .get({
        url: '/message/msg/' + userStore?.userInfo?.userId,
      })
      .then((res) => {
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
            }
            // else if (item.key == '2') {
            //   item.list.splice(0, item.list.length, ...groupedData['2']);
            // }
            else if (item.key == '3' && groupedData['3']?.length) {
              item.list.splice(0, item.list.length, ...groupedData['3']);
            }
          });
        }
      });
  }
  getMessage();

  /**
   * 未读数量
   */
  function unReadCount() {
    defHttpForRes
      .get({
        url: '/message/countNewMsg/' + userStore?.userInfo?.userId,
      })
      .then((res) => {
        // console.log('res：', res);
        if (res.success) {
          // console.log('res.result：', res.result);
          count.value = res.result;
        }
      });

    // console.log('unread count:', count);
  }
  unReadCount();
  setInterval(() => {
    if (userStore.userInfo) {
      unReadCount();
    }
  }, 10 * 1000);

  /**
   * 点击tab
   * @param actKey
   */
  function tabChange(actKey) {
    activeKey.value = actKey;
    if (actKey == '1') {
      readMsg(MessageType.NOTIFICATION);
    } else if (actKey == '3') {
      readMsg(MessageType.TODO);
    }
    // console.log('tabChange:', actKey);
  }

  /**
   * 点击消息图标,进行已读
   */
  function popoverClick() {
    // 默认把所有消息类型为 通知的设置为已读
    if (activeKey.value == '1') {
      readMsg(MessageType.NOTIFICATION);
    } else if (activeKey.value == '3') {
      readMsg(MessageType.TODO);
    }
    // console.log('popoverClick点击了');
  }

  /**
   * 消息已读
   * @param messageType
   */
  function readMsg(messageType: MessageType) {
    // 判断是否有未读
    if (count.value <= 0) {
      return;
    } else if (count.value > 0) {
      getMessage();
    }
    // 修改本地状态 和 未读的数量
    listMsg.forEach((item) => {
      if (item.type == messageType && item.status == 0) {
        item.status = 1;
        count.value--;
      }
    });
    // console.log('messageType： ', messageType);
    // console.log('listMsg： ', listMsg);
    // 发送修改状态
    defHttpForRes
      .put({
        url: '/message/msgRead',
        params: {
          userId: userStore?.userInfo?.userId,
          type: messageType,
        },
      })
      .then((res) => {
        if (!res.success) {
          createMessage.error('失败');
        }
      });
  }

  // const count = computed(() => {
  //   // console.log('listMsg:　', listMsg);
  //   // let count = 0;
  //   // for (let i = 0; i < tabListData.length; i++) {
  //   //   count += tabListData[i].list.length;
  //   // }
  //   // const count = countUnRead(null);
  //   // console.log("count: ", count);
  //
  //   /*请求得到未读数量*/
  //   let count = 0;
  //
  //
  //   return count;
  // });

  /**
   * 前端中未读的数量有多少
   */
  function localCountUnRead(messageType: MessageType) {
    let count = 0;
    listMsg.forEach((item) => {
      // console.log('item: ', item);
      if (messageType && item?.status == 0) {
        if (messageType == item.type) {
          count++;
        }
      } else if (item?.status == 0) {
        count++;
      }
    });
    return count;
  }

  function onNoticeClick(record: ListItem) {
    // createMessage.success('你点击了通知，ID=' + record.id);
    // 前端数据处理 删除对应的list中包含的数据
    setTimeout(() => {
      listData.value.forEach((item) => {
        // item.list = [];
        if (item.key == '1' && item.list) {
          // 删除 id 为 '000000002' 的数据
          item.list = item.list.filter((item) => item.id !== record.id);
        }
      });
    }, 500);
    // 后端更新状态
    if (record.status != 2) {
      // 设置消息为删除
      checkMsgApi({
        ids: [record.id],
      }).then((res) => {
        if (!res.success) {
          createMessage.error('失败');
        }
      });
      record.status = 2;
      record.titleDelete = !record.titleDelete;
    }
  }

  /**
   * 当前页面数据
   */
  const pageContent = ref();
  const handleGetDataChange = (newData) => {
    // console.log('getData changed:', newData);
    pageContent.value = newData;
    console.log('pageContent:', pageContent);
  };
  async function checkThisPage() {
    if (pageContent.value) {
      let ids = [];
      // 前端数据删除
      pageContent.value.forEach((record) => {
        console.log('pageContent record：', record);
        record.titleDelete = !record.titleDelete;
        // 手机状态不是已读，的record的id
        if (record.status != 2) {
          ids.push(record.id);
        }
        setTimeout(() => {
          listData.value.forEach((item) => {
            // item.list = [];
            if (item.key == '1' && item.list) {
              // 删除 id 为 '000000002' 的数据
              item.list = item.list.filter((item) => item.id !== record.id);
            }
          });
        }, 500);
      });

      // 后端更新状态
      if (ids) {
        console.log('ids：', ids);
        const rsp = await checkMsgApi({ ids: ids });
        if (!rsp.success) {
          createMessage.error('失败');
        }
      }
    }
  }

  function checkAllPage() {
    listData.value.forEach(async (item) => {
      // item.list = [];
      if (item.key == '1' && item.list) {
        // 删除所有元素
        setTimeout(() => {
          item.list = [];
        }, 500);
        // 显示删除线
        if (pageContent.value) {
          pageContent.value.forEach((record) => {
            // console.log('pageContent record：', record);
            record.titleDelete = !record.titleDelete;
          });
        }
        // 后端更新状态
        const rsp = await checkMsgApi({ checkAll: true });
        if (!rsp.success) {
          createMessage.error('失败');
        }
      } else {
        return;
      }
    });
  }
</script>
<style lang="less">
  //::v-deep .ant-popover-inner {
  //  min-width: 20vw;
  //}
  @prefix-cls: ~'@{namespace}-header-notify';

  .notice-list-container {
    max-height: 80vh; // 限制 NoticeList 的最大高度
    overflow-y: auto; // 添加滚动条
    flex: 1; // 让 NoticeList 占据剩余空间
  }

  .@{prefix-cls} {
    padding-bottom: 1px;

    &__overlay {
      max-width: 360px;
      display: flex; // 让 Popover 内容区域使用 flex 布局
      flex-direction: column; // 垂直排列内容
    }

    //::v-deep(.ant-popover-inner) {
    //  min-width: 50vw;
    //}

    ::v-deep .ant-tabs-content {
      width: 300px;
      flex: 1; // 让 Tabs 内容区域占据剩余空间
      display: flex;
      flex-direction: column;
    }

    .ant-badge {
      display: flex;
      align-items: center;
      font-size: 18px;

      .ant-badge-multiple-words {
        padding: 0 4px;
      }

      svg {
        width: 0.9em;
      }
    }
  }
</style>
