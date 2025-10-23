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
  import { ref, computed, unref, watch, reactive } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';
  // import { defHttpForRes, defHttp } from '@/utils/http/axios';
  import { useMessage } from '@/hooks/web/useMessage';
  // import { accountFormSchema } from './account.data';
  // import type { TreeProps } from 'ant-design-vue';
  // import { BasicTree, TreeItem } from '@/components/Tree';
  // import permission from '@/router/routes/modules/demo/permission';
  // import { getDeptList } from '@/api/demo/system';
  import { MoadlType, modifyPriceApi, getDefaultDeliveryApi } from './pjsMngApi';
  // import { defineDocExtension } from 'codemirror';
  import { useGo, useRedo } from '@/hooks/web/usePage';
  import { useTabs } from '@/hooks/web/useTabs';
  // import { getTagColor, sampleProjectStatusMapping } from '../inspectionMission/fieldMapping';
  // import { Option } from 'vxe-table';
  import { useUserStore } from '@/store/modules/user';

  const go = useGo();
  const redo = useRedo();
  const { closeCurrent } = useTabs();
  const userStore = useUserStore();

  defineOptions({ name: 'AccountModal' });

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const moadlType = ref();
  const seledIds = ref([]);
  const isSuper = ref();
  // const userCascader = ref();
  // const sampleId = ref();
  const projectId = ref();
  const originProjectId = ref();
  // const originProjectStatus = ref();

  // 项目树
  // const expandedKeys = ref<string[]>([]);
  // const selectedKeys = ref<string[]>([]);
  // console.log();
  // const checkedKeys = ref<string[]>([]);
  // const fieldNames: TreeProps['fieldNames'] = {
  //   title: 'name',
  //   key: 'id',
  // };

  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    schemas: [
      // {
      //   field: 'price',
      //   component: 'InputNumber',
      //   label: '价格',
      //   colProps: {
      //     span: 15,
      //   },
      //   componentProps: {
      //     // placeholder: '',
      //   },
      //   required: true,
      //   dynamicDisabled: !userStore.userInfo?.isSuper, // 非超级管理员动态禁用
      //   // ifShow: userStore.userInfo?.isSuper, // 只有超级管理员可见
      // },
      {
        field: 'defaultDeliveryUnitId',
        label: '默认外送',
        component: 'ApiSelect',
        colProps: { span: 15 },
        required: false, // 允许不填
      },
      {
        field: 'priceCoefficient',
        component: 'Input',
        label: '折扣系数',
        colProps: { span: 15 },
        componentProps: {},
        required: true,
        ifShow: userStore.userInfo?.isSuper, // 仅超级管理员可见
        dynamicDisabled: !userStore.userInfo?.isSuper, // 非超级管理员动态禁用
      },
    ],
    showActionButtonGroup: false,
    actionColOptions: {
      span: 23,
    },
  });

  // console.log('getExpandedKeys: ', getExpandedKeys());
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    // 参数设置
    moadlType.value = data?.moadlType;

    if (moadlType.value == MoadlType.MODIFY_PROJECT) {
      // console.log('moadlType:', moadlType);
      seledIds.value = data?.ids;
      // console.log('seledIds:', seledIds);
      isSuper.value = data?.isSuper;
      originProjectId.value = data?.projectId; // 项目id，来源于 record.originProjectId
      // console.log('useModalInner-originProjectId:', originProjectId.value);
    }

    // 显示方框
    updateSchema([
      {
        field: 'modifyProject',
        ifShow: data?.moadlType == MoadlType.MODIFY_PROJECT,
      },
      {
        field: 'defaultDeliveryUnitId',
        componentProps: {
          api: async (params) => {
            // console.log('defaultDeliveryUnitId-params', params);
            const resp = await getDefaultDeliveryApi(params);
            return resp;
          },
          resultField: 'result',
          labelField: 'name',
          valueField: 'id',
          params: {
            projectId: originProjectId.value,
          },
        },
      },
    ]);
    // console.log('useModalInner:data:', data);
    /** 获取选择的项目id */
    projectId.value = data.record.id;

    resetFields();
    setModalProps({ confirmLoading: false });
    // 设置表单字段值，使表格已填写的值默认填充到表单中
    setFieldsValue({
      price: data.record?.price,
      priceCoefficient: data.record?.priceCoefficient,
      defaultDeliveryUnitId: data.record?.defaultDeliveryUnitId,
    });
  });

  /** 操作列弹窗标题 */
  const getTitle = computed(() => {
    // console.log('!unref(moadlType), ', !unref(moadlType));
    switch (unref(moadlType)) {
      case MoadlType.MODIFY_PROJECT:
        return '修改项目';
      default:
        return '';
    }
  });

  /** 修改项目弹窗提交 */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      // console.log('values:', values);
      // console.log('seledIds:', seledIds);
      if (moadlType.value == MoadlType.MODIFY_PROJECT) {
        // 发送修改请求
        const formData = {
          projectId: projectId.value,
          // price: values.price, // 不需要修改价格，暂不提供price参数
          priceCoefficient: values.priceCoefficient,
          defaultDeliveryUnitId:
            values.defaultDeliveryUnitId === undefined ? null : values.defaultDeliveryUnitId,
        };
        // console.log('handleSubmit-formData', formData);
        const data = await modifyPriceApi(formData);
        // console.log('data', data);
        if (data.success) {
          success(data.message);
          // redo(); // 重新刷新页面，使得修改的体验不是很好，故去除
        } else {
          error(data.message);
          return;
        }
      }

      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  // /**
  //  * 得到选择的项目对象
  //  */
  // function getSelectedObject() {
  //   let foundObjects = getObjectsByIds(treeData, checkedKeys.value);
  //   // 只保留项目数据
  //   foundObjects = foundObjects
  //     .filter((item) => item.status)
  //     .map((item) => ({
  //       ...item,
  //       // projectName: item.name,
  //     }));
  //   return foundObjects;
  // }
  // function getObjectsByIds(data, ids) {
  //   return ids.reduce((result, id) => {
  //     const foundObject = findObjectById(data, id);
  //     if (foundObject) {
  //       result.push(foundObject);
  //     }
  //     return result;
  //   }, []);
  // }
  // function findObjectById(data, id) {
  //   for (const item of data) {
  //     if (item.id === id) {
  //       return item;
  //     }
  //     if (item.children) {
  //       const foundObject = findObjectById(item.children, id);
  //       if (foundObject) {
  //         return foundObject;
  //       }
  //     }
  //   }
  //   return null;
  // }
</script>
