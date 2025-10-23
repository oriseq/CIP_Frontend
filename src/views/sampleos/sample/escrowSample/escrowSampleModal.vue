<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    :minHeight="5"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
  <!-- <a-button type="primary" preIcon="mdi:page-next-outline" @click="console.log(getExpandedKeys())">
    测试
  </a-button> -->
</template>
<script lang="ts" setup>
  import { ref, computed, unref, watch } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';
  import { defHttpForRes, defHttp } from '@/utils/http/axios';
  import { useMessage } from '@/hooks/web/useMessage';
  // import { accountFormSchema } from './account.data';
  import type { TreeProps } from 'ant-design-vue';
  import { BasicTree, TreeItem } from '@/components/Tree';
  import permission from '@/router/routes/modules/demo/permission';
  // import { getDeptList } from '@/api/demo/system';
  import {
    MoadlType,
    addSampleLogisticsApi,
    otherGroupUsers,
    sampleTransferApi,
    sampleHostingApi,
    groupUsersCascader,
  } from './escrowSampleApi';
  import { defineDocExtension } from 'codemirror';

  defineOptions({ name: 'AccountModal' });

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const moadlType = ref();
  const seledIds = ref([]);
  const isSuper = ref();
  const userCascader = ref();

  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
    labelWidth: 100,
    // baseColProps: { span: 24 },
    schemas: [
      // {
      //   field: 'sampleTransfer',
      //   label: '过户用户',
      //   required: true,
      //   component: 'ApiSelect',
      //   componentProps: {
      //     // more details see /src/components/Form/src/components/ApiSelect.vue
      //     api: otherGroupUsers,
      //     // params: {
      //     //   id: 1,
      //     // },
      //     resultField: 'list',
      //     // use name as label
      //     labelField: 'name',
      //     // use id as value
      //     valueField: 'id',
      //     // not request untill to select
      //     immediate: true,
      //     onChange: (e, v) => {
      //       console.log('ApiSelect====>:', e, v);
      //     },
      //     // atfer request callback
      //     onOptionsChange: (options) => {
      //       console.log('get options', options.length, options);
      //     },
      //   },
      //   colProps: {
      //     span: 15,
      //   },
      // },
      {
        field: 'sampleTransfer',
        label: '过户用户',
        required: true,
        component: 'Cascader',
        componentProps: {
          fieldNames: { label: 'name', value: 'id' },
          options: userCascader,
          onChange: (e, ...v) => {
            console.log('ApiCascader====>:', e, v);
          },
        },
        colProps: {
          span: 15,
        },
      },
      {
        field: 'sampleHosting',
        label: '代管用户',
        required: true,
        component: 'Cascader',
        componentProps: {
          fieldNames: { label: 'name', value: 'id' },
          options: userCascader,
          onChange: (e, ...v) => {
            console.log('ApiCascader====>:', e, v);
          },
        },
        colProps: {
          span: 15,
        },
      },
      // {
      //   field: 'sampleHosting',
      //   component: 'ApiSelect',
      //   label: '代管用户',
      //   required: true,
      //   componentProps: {
      //     //   // more details see /src/components/Form/src/components/ApiSelect.vue
      //     api: otherGroupUsers,
      //     //   // params: {
      //     //   //   id: 1,
      //     //   // },

      //     //   resultField: 'list',
      //     //   // use name as label
      //     labelField: 'name',
      //     //   // use id as value
      //     valueField: 'id',
      //     //   // not request untill to select
      //     //   immediate: true,
      //     onChange: (e, v) => {
      //       console.log('ApiSelect====>:', e, v);
      //     },
      //     //   // atfer request callback
      //     onOptionsChange: (options) => {
      //       console.log('get options', options.length, options);
      //     },
      //   },
      //   colProps: {
      //     span: 15,
      //   },
      //   // defaultValue: '0',
      // },
    ],
    showActionButtonGroup: false,
    actionColOptions: {
      span: 23,
    },
  });

  // console.log('getExpandedKeys: ', getExpandedKeys());

  const [registerModal, { setModalProps, closeModal, changeLoading }] = useModalInner(async (data) => {
    console.log('useModalInner:data:', data);
    changeLoading(true);
    // 设置样本过户 样本代管 组件数据,超级管理的话获取不同信息
    if (data?.isSuper) {
      userCascader.value = await groupUsersCascader(null);
    } else {
      userCascader.value = await otherGroupUsers(null);
    }
    console.log('userCascader:', userCascader);

    resetFields();
    setModalProps({ confirmLoading: false });
    // 参数设置
    moadlType.value = data?.moadlType;
    // console.log('moadlType:', moadlType);
    seledIds.value = data?.ids;
    isSuper.value = data?.isSuper;
    console.log('seledIds:', seledIds);

    // const treeData = await getDeptList();
    updateSchema([
      {
        field: 'sampleTransfer',
        ifShow: unref(moadlType) == MoadlType.SAMPLE_TRANSFER,
      },
      {
        field: 'sampleHosting',
        ifShow: unref(moadlType) == MoadlType.SAMPLE_HOSTING,
      },
      // {
      //   field: 'permissions',
      //   show: unref(isUpdate),
      // },
      // {
      //   field: 'dept',
      //   componentProps: { treeData },
      // },
    ]);
    changeLoading(false);
  });

  const getTitle = computed(() => {
    // console.log('!unref(moadlType), ', !unref(moadlType));
    switch (unref(moadlType)) {
      case MoadlType.SAMPLE_TRANSFER:
        return '样本过户';
      case MoadlType.SAMPLE_HOSTING:
        return '样本代管';
      default:
        return '';
    }
  });

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      console.log('values:', values);
      console.log('seledIds:', seledIds);
      if (moadlType.value == MoadlType.SAMPLE_TRANSFER) {
        let sampleTransferId = values.sampleTransfer[0];
        // 超级管理的额外处理
        if (isSuper.value) {
          // 是一个数组，Cascader类型，取最后一个
          sampleTransferId = values.sampleTransfer[values.sampleTransfer.length - 1];
        }
        const data = await sampleTransferApi({
          ids: seledIds.value,
          sampleTransferId: sampleTransferId,
        });
        console.log('data', data);
        if (data.success) {
          success(data.message);
        } else {
          const megdetail = data?.result.join(',');
          error(data.message + '：' + megdetail);
          return;
        }
        emit('success', {});
      } else if (moadlType.value == MoadlType.SAMPLE_HOSTING) {
        let sampleHostingId = values.sampleHosting[0];
        // 超级管理的额外处理
        if (isSuper.value) {
          // 是一个数组，Cascader类型，取最后一个
          sampleHostingId = values.sampleHosting[values.sampleHosting.length - 1];
        }
        const data = await sampleHostingApi({
          ids: seledIds.value,
          sampleHostingId: sampleHostingId,
        });
        console.log('data', data);
        if (data.success) {
          success(data.message);
        } else {
          const megdetail = data?.result.join(',');
          error(data.message + '：' + megdetail);
          return;
        }
        emit('success', {});
      }
      // 发请求新增
      // const data = await defHttpForRes.post({
      //   url: '/system/userGroup/userGroup',
      //   params: {
      //     id: unref(isUpdate) ? rowId.value : null,
      //     ...values,
      //   },
      // });
      // console.log('data', data);
      // if (data.success) {
      //   success(data.message);
      // } else {
      //   // const megdetail = data.result.join(',');
      //   error(data.message);
      //   return;
      // }

      closeModal();
      // emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
