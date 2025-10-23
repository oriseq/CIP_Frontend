<template>
  <CollapseContainer title="基本信息" :canExpand="false">
    <BasicForm @register="register" style="margin-top: 20px" />
    <!-- <Col :span="10">
        <div class="change-avatar">
          <div class="mb-2">头像</div>
          <CropperAvatar
            :uploadApi="uploadApi as any"
            :value="avatar"
            btnText="更换头像"
            :btnProps="{ preIcon: 'ant-design:cloud-upload-outlined' }"
            @change="updateAvatar"
            width="150"
          />
        </div>
      </Col> -->
    <a-button type="primary" @click="handleSubmit"> 更新基本信息 </a-button>
  </CollapseContainer>
</template>
<script lang="ts" setup>
  import { CollapseContainer } from '@/components/Container';
  // import { CropperAvatar } from '@/components/Cropper';
  import { BasicForm, useForm } from '@/components/Form';
  import { Col, Row } from 'ant-design-vue';
  import { onMounted } from 'vue';

  import { useMessage } from '@/hooks/web/useMessage';

  // import { uploadApi } from '@/api/sys/upload';
  // import headerImg from '@/assets/images/header.jpg';
  import { useUserStore } from '@/store/modules/user';
  import { baseSetschemas, modifyBaseInfoApi } from './data';
  import { useRedo } from '@/hooks/web/usePage';

  const { createMessage } = useMessage();
  const userStore = useUserStore();

  const redo = useRedo();

  const [register, { setFieldsValue, validate }] = useForm({
    baseColProps: {
      span: 18,
    },
    labelWidth: 120,
    schemas: baseSetschemas,
    showActionButtonGroup: false,
  });

  onMounted(async () => {
    // const data = await accountInfoApi();
    setFieldsValue({
      username: userStore.userInfo?.username,
      realname: userStore.userInfo?.realName,
      phone: userStore.userInfo?.phone,
      email: userStore.userInfo?.email,
    });
  });

  // const avatar = computed(() => {
  //   const { avatar } = userStore.getUserInfo;
  //   console.log(avatar);
  //   return avatar || headerImg;
  // });

  // function updateAvatar({ src, data }) {
  //   const userinfo = userStore.getUserInfo;
  //   userinfo.avatar = src;
  //   userStore.setUserInfo(userinfo);
  //   console.log('data', data);
  // }

  // 校验提交的表单
  const validateForm = (formData) => {
    // 进行表单验证逻辑，确保必填字段都已填写
    if (formData.phoneNumber && formData.mail) {
      return true;
    } else {
      return false;
    }
  };

  async function handleSubmit() {
    let userInfo = userStore.userInfo;
    const data = await validate();
    const { phone, email, username, realname } = data;

    // 填写申请表单
    let formData = {
      phoneNumber: phone, // 手机号
      mail: email, // 邮箱
      username: username, // 用户名
      realName: realname, // 真实用户名
    };

    // 改动校验
    if (
      formData.username == userInfo?.username &&
      formData.mail == userInfo?.email &&
      formData.phoneNumber == userInfo?.phone &&
      formData.realName == userInfo?.realName
    ) {
      createMessage.info('基本信息无改动');
      // 填写校验
    } else if (validateForm(formData)) {
      // 发送请求
      const rsp = await modifyBaseInfoApi(formData);
      if (rsp.success) {
        createMessage.success('更新成功！');
        console.log('formData', formData);
        // 手机号修改，退出登录
        if (formData.phoneNumber != userStore.userInfo?.phone) {
          userStore.logout2();
        } else {
          // 重新赋值
          userInfo.username = formData.username;
          userInfo.realName = formData.realName;
          userInfo.phone = formData.phoneNumber;
          userInfo.email = formData.mail;
          // 刷新页面
          redo();
        }
      } else {
        createMessage.error(rsp.message);
      }
    }
  }
</script>

<!-- <style lang="less" scoped>
  .change-avatar {
    img {
      display: block;
      margin-bottom: 15px;
      border-radius: 50%;
    }
  }
</style> -->
