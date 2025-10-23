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
  import { addInfoApi, modifyInfoApi, ModalType } from './deliveryUnitMngApi.ts';
  import { useRedo } from '@/hooks/web/usePage.js';

  defineOptions({ name: 'DeliveryUnitModal' });

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;
  const redo = useRedo();

  // 外送单位
  const name = ref();
  // 单位ID
  const unitID = ref();
  // 弹窗类型
  const moadltype = ref('');

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    // console.log('useModalInner:data:', data);

    moadltype.value = data.moadlType;

    if (moadltype.value == ModalType.EDIT_INFO) {
      name.value = data.record.name;
      unitID.value = data.record.id;
      setFieldsValue({ name: name.value || undefined, remarks: data.record.remarks });
    } else if (moadltype.value == ModalType.ADD_DELIVERY) {
      // 清空表单
      resetFields();
    }

    setModalProps({ confirmLoading: false });
  });

  const getTitle = computed(() => (moadltype.value == '新增外送' ? '新增外送' : '编辑信息'));

  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
    labelWidth: 100,
    // baseColProps: { span: 24 },
    schemas: [
      {
        field: 'name',
        label: '外送单位',
        component: 'Input',
        colProps: {
          span: 15,
        },
        required: true,
      },
      {
        field: 'remarks',
        label: '备注',
        component: 'InputTextArea',
        componentProps: {
          allowClear: true,
          autoSize: true,
        },
        colProps: {
          span: 15,
        },
      },
    ],
    showActionButtonGroup: false,
    actionColOptions: {
      span: 23,
    },
  });

  /** 提交表单 */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      // console.log('values:', values);
      let formData = {};
      let data = {};

      if (moadltype.value == '新增外送') {
        formData = { name: values.name, remarks: values.remarks };
        // console.log('formData', formData);
        // 发请求新增
        data = await addInfoApi(formData);
      } else if (moadltype.value == '编辑信息') {
        formData = { id: unitID.value, name: values.name, remarks: values.remarks };
        // console.log('formData', formData);
        // 发请求修改
        data = await modifyInfoApi(formData);
      }

      // 请求结果
      // console.log('data', data);
      if (data.success) {
        success(data.message);
      } else {
        // const megdetail = data.result.join(',');
        error(data.message);
        return;
      }

      redo();
      closeModal();
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
