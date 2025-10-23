<!-- eslint-disable vue/valid-v-for -->
<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" :minHeight="5">
    <div class="w-1/1">
      <Timeline mode="left" class="timeline-block">
        <TimelineItem v-for="item in timelineList" :label="item?.time">
          <!-- <template v-if="item.color === 'red'" #dot>
            <ClockCircleOutlined style="color: red; font-size: 20px" />
          </template> -->
          <!-- <template v-if="item?.color === 'blue'" #dot>
            <DownCircleOutlined style="color: gray; font-size: 20px" />
          </template> -->
          <TypographyParagraph :style="{ fontSize: '25px', color: 'var(--text-color)' }">
            {{ item?.context }}
          </TypographyParagraph>
        </TimelineItem>
      </Timeline>
    </div>
  </BasicModal>
</template>

<script setup lang="ts">
  import { ref, computed, unref, watch } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  // import { defHttpForRes, defHttp } from '@/utils/http/axios';
  import { useMessage } from '@/hooks/web/useMessage';
  // import { accountFormSchema } from './account.data';
  // import permission from '@/router/routes/modules/demo/permission';
  // import { getDeptList } from '@/api/demo/system';
  // import { ClockCircleOutlined, DownCircleOutlined } from '@ant-design/icons-vue';
  import { MoadlType, logisticsInfoApi } from './inspectionMissionApi';

  import { Timeline, TimelineItem } from 'ant-design-vue';
  import { TypographyParagraph } from 'ant-design-vue/lib';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const moadlType = ref(); // 弹窗类型
  const isSuper = ref(); // 超级管理员
  const logisticsTrackingNumber = ref(); // 快递单号
  const phoneNumLastFour = ref(); // 手机后四位
  const timelineList = ref([]); // 时间线数据

  /** 弹窗内部数据 */
  const [registerModal, { setModalProps, closeModal, changeLoading }] = useModalInner(async (data) => {
    // 1. 弹窗属性
    setModalProps({
      defaultFullscreen: false, // 默认全屏
      showCancelBtn: false, // 隐藏关闭按钮
      showOkBtn: false, // 隐藏确认按钮
      // centered: true, // 居中弹窗
    });
    changeLoading(true)
    console.log('data', data);

    // 2. 传入参数
    isSuper.value = data?.isSuper;
    moadlType.value = data?.moadlType;
    logisticsTrackingNumber.value = data.record?.logisticsTrackingNumber;
    phoneNumLastFour.value = data.record?.phoneNumLastFour;

    // 3. 发起请求(物流信息为空，则不发起请求)
    let response;
    if (logisticsTrackingNumber.value) {
      response = await getTimeLineInfo(logisticsTrackingNumber.value, phoneNumLastFour.value);
    } else {
      response = { success: false, message: '物流信息为空', result: [] };
    }

    // 4. 判断请求是否成功，成功附上结果，失败还原
    if (response.success) {
      timelineList.value = response.result;
      success(response.message);
    } else {
      timelineList.value = [];
      error(response.message);
    }
    changeLoading(false);
  });

  /** 弹窗标题 */
  const getTitle = computed(() => {
    switch (unref(moadlType)) {
      case MoadlType.CHEAK_LOGISITICS:
        return '查看物流';
      default:
        return '';
    }
  });

  /** 获取物流信息 */
  async function getTimeLineInfo(logisticsTrackingNumber, phoneNumLastFour) {
    let response = await logisticsInfoApi({
      logisticsTrackingNumber: logisticsTrackingNumber,
      phoneNumLastFour: phoneNumLastFour,
    });
    console.log('getTimeLineInfo-response', response);
    return response;
  }

  /** 时间线数据模拟 */
  // const timelineList = ref([
  //   {
  //     context: '我家我家我家我家我家我家我家我家我家我家我家我家我家',
  //     time: '2015-09-01 00:00',
  //   },
  //   {
  //     context: '我家我家我家我家我家我家我家我家我家我家我家我家我家',
  //     time: '2015-09-01 00:00',
  //   },
  //   {
  //     context: '我家我家我家我家我家我家我家我家我家我家我家我家我家',
  //     time: '2015-09-01 00:00',
  //     color: 'blue',
  //   },
  //   {
  //     context: '我家我家我家我家我家我家我家我家我家我家我家我家我家',
  //     time: '2015-09-01 00:00',
  //   },
  // ]);
</script>

<style scoped>
  /* 时间线模块的位置 */
  .timeline-block {
    margin-left: -70%; /* 调整时间线左边距 */
    padding: 16px 0; /* 调整上下内边距 */
  }

  /* 时间线文本内容样式 */
  .ant-timeline-item {
    color: var(--text-color);
    font-size: 25px;
  }
</style>
