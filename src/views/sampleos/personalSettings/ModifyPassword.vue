<template>
  <CollapseContainer title="修改密码" :canExpand="false">
    <BasicForm @register="register" style="margin-top: 20px" />

    <a-button @click="resetFields"> 重置 </a-button>
    <a-button class="!ml-4" type="primary" @click="handleSubmit"> 确认 </a-button>
  </CollapseContainer>
</template>
<script lang="ts" setup>
  import { BasicForm, useForm } from '@/components/Form';
  import { Col, Row } from 'ant-design-vue';
  import { useMessage } from '@/hooks/web/useMessage';
  import { modifyPasswordschemas, modifyPasswordApi } from './data';
  import { useUserStore } from '@/store/modules/user';

  const { createMessage } = useMessage();
  const userStore = useUserStore();

  defineOptions({ name: 'ChangePassword' });

  const [register, { validate, resetFields }] = useForm({
    size: 'default',
    baseColProps: { span: 18 },
    labelWidth: 100,
    showActionButtonGroup: false,
    schemas: modifyPasswordschemas,
  });

  async function handleSubmit() {
    try {
      const values = await validate();

      // 发送请求
      let formData = {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      };
      // console.log('ModifyPwd-formData', formData);
      const response = await modifyPasswordApi(formData);

      // 修改成功，重置表单
      if (response.success) {
        createMessage.success(response.message);
        userStore.logout();
      } else {
        createMessage.error(response.message);
      }
      resetFields();
    } catch (error) {
      console.error(error);
    }
  }
</script>
