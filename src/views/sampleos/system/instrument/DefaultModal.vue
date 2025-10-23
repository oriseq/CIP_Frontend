<template>
  <BasicModal
    @register="registerModal"
    :title="getTitle"
    v-bind="$attrs"
    :minHeight="5"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { addTableRowApi, modifyTableRowApi } from './instrumentApi';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';
  import { ModalType, getDialogFormSchemas } from './data';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useRedo } from '@/hooks/web/usePage';

  // 回调
  const emit = defineEmits(['success', 'register']);

  const { createMessage } = useMessage();
  const { success, error } = createMessage;

  // 重新加载页面
  // const redo = useRedo();

  defineOptions({ name: 'DefaultModal' });

  // 对话框标题
  // 对话框种类
  const moadltype = ref();
  const getTitle = computed(() => {
    return moadltype.value === ModalType.ADD_INFO ? ModalType.ADD_INFO : ModalType.EDIT_INFO;
  });

  // 当前点击的行id
  const currentId = ref();

  // 对话框传参
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    console.log('useModalInner:data:', data);

    moadltype.value = data.moadlType;
    currentId.value = data?.record?.id;

    if (moadltype.value == ModalType.EDIT_INFO) {
      setFieldsValue({ ...data.record, exportFields: data.record.exportFields || undefined });
    } else if (moadltype.value == ModalType.ADD_INFO) {
      // 清空表单
      resetFields();
    }

    setModalProps({ confirmLoading: false });
  });

  // 创建表单
  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 100,
    schemas: getDialogFormSchemas(moadltype.value),
    showActionButtonGroup: false,
  });

  // 提交表单
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      // console.log('values:', values);
      let data = {};
      let formData = { ...values };
      // console.log('formData', formData);

      if (moadltype.value == ModalType.ADD_INFO) {
        // console.log('formData', formData);
        // 发请求新增
        data = await addTableRowApi(formData);
      } else if (moadltype.value == ModalType.EDIT_INFO) {
        formData = { id: currentId.value, ...formData };
        console.log('formData', formData);
        // 发请求修改
        data = await modifyTableRowApi(formData);
      }

      // 请求结果
      // console.log('data', data);
      if (data.success) {
        success(data.message);
        emit('success', { ...formData });
      } else {
        // const megdetail = data.result.join(',');
        error(data.message);
        return;
      }

      // redo();
      closeModal();
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style scoped></style>
