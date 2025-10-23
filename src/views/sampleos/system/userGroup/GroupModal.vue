<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :minHeight="5"
    :title="getTitle"
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

  defineOptions({ name: 'AccountModal' });

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const isUpdate = ref(true);
  const rowId = ref('');

  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
    labelWidth: 100,
    // baseColProps: { span: 24 },
    schemas: [
      {
        label: '用户组名',
        field: 'groupName',
        component: 'Input',
        colProps: { span: 15 },
        required: true,
        rules: [
          // {
          //   pattern: /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
          //   message: '手机号格式不正确',
          //   trigger: 'blur',
          // },
        ],
      },
      {
        label: '组别类型',
        field: 'isInternalGroup',
        component: 'RadioButtonGroup',
        componentProps: {
          size: 'default',
          buttonStyle: 'solid',
          options: [
            { label: '内部', value: true },
            { label: '送检', value: false },
          ],
          optionType: 'button',
        },
        colProps: { span: 15 },
        required: true,
        rules: [],
      },
    ],
    showActionButtonGroup: false,
    actionColOptions: {
      span: 23,
    },
  });

  // console.log('getExpandedKeys: ', getExpandedKeys());

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    // console.log('useModalInner:data:', data);

    resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    // 修改信息的部分
    if (unref(isUpdate)) {
      rowId.value = data.record.id;
      // 得到权限
      setFieldsValue({
        ...data.record,
      });
    }

    // const treeData = await getDeptList();
    updateSchema([
      {
        field: 'password',
        show: !unref(isUpdate),
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
  });

  const getTitle = computed(() => (!unref(isUpdate) ? '新增用户组' : '编辑用户组'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      // console.log('values:', values);
      // console.log('rowId:', rowId);
      // 发请求新增
      const data = await defHttpForRes.post({
        url: '/system/userGroup/userGroup',
        params: {
          id: unref(isUpdate) ? rowId.value : null,
          ...values,
        },
      });
      // console.log('data', data);
      if (data.success) {
        success(data.message);
      } else {
        // const megdetail = data.result.join(',');
        error(data.message);
        return;
      }

      closeModal();
      emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
