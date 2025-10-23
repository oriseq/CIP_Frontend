<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm">
      <!--      <template #formFooter="{ model, field }"> </template>-->
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, watch, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';
  import { defHttpForRes, defHttp } from '@/utils/http/axios';
  import { useMessage } from '@/hooks/web/useMessage';
  // import { accountFormSchema } from './account.data';
  import type { TreeProps } from 'ant-design-vue';
  import { BasicTree, TreeItem } from '@/components/Tree';
  import permission from '@/router/routes/modules/demo/permission';
  import { useUserStore } from '@/store/modules/user';
  import { groupSelectApi } from '@/views/sampleos/system/user/userApi';

  defineOptions({ name: 'AccountModal' });

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const { info, success, warning, error } = createMessage;

  // console.log('userStore.userInfo:', userStore.userInfo);

  const isUpdate = ref(true);
  const rowId = ref('');

  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    schemas: [
      {
        field: 'username',
        label: '用户名',
        component: 'Input',
        // helpMessage: ['本字段演示异步验证', '不能输入带有admin的用户名'],
        rules: [
          {
            required: false,
            message: '请输入用户名',
          },
          {
            pattern: /^(?!.*@)(?!\d+$)[\w\u4e00-\u9fa5]+$/,
            message: '用户名格式不正确,可以包含字母、数字、下划线和中文字符，但不含@且不是纯数字',
            trigger: 'blur',
          },
          {
            trigger: 'blur',
            // validator(_, value) {
            // return new Promise((resolve, reject) => {
            //   if (!value) return resolve();
            //   isAccountExist(value)
            //     .then(resolve)
            //     .catch((err) => {
            //       reject(err.message || '验证失败');
            //     });
            // });
            // },
          },
        ],
      },
      {
        label: '真实姓名',
        field: 'realName',
        component: 'Input',
        required: true,
      },
      {
        label: '手机号',
        field: 'phoneNumber',
        component: 'Input',
        required: true,
        rules: [
          {
            pattern: /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
            message: '手机号格式不正确',
            trigger: 'blur',
          },
        ],
      },
      {
        field: 'mail',
        label: '邮箱',
        component: 'Input',
        required: false,
        rules: [{ type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }],
      },
      {
        label: '所属用户组',
        field: 'userGroupId',
        component: 'ApiSelect',
        ifShow: userStore.userInfo?.isSuper,
        required: true,
        componentProps: {
          api: groupSelectApi,
          labelField: 'groupName',
          valueField: 'id',
        },
      },
      {
        label: '是否超级管理员',
        field: 'isSuper',
        component: 'Switch',
        defaultValue: false,
        ifShow: userStore.userInfo?.isSuper,
      },
      {
        label: '是否组管理员',
        field: 'isGroupSuper',
        component: 'Switch',
        ifShow: userStore.userInfo?.isSuper || userStore.userInfo?.isGroupSuper,
      },
      {
        label: '密码',
        field: 'password',
        component: 'InputPassword',
        required: true,
        rules: [{ min: 8, message: '密码长度不能少于8位', trigger: 'blur' }],
      },
    ],
    showActionButtonGroup: false,
    actionColOptions: {
      span: 23,
    },
  });

  // console.log('getExpandedKeys: ', getExpandedKeys());

  const recordDataIsSuper = ref(true);
  const [registerModal, { setModalProps, closeModal, changeLoading }] = useModalInner(
    async (data) => {
      changeLoading(true);
      // console.log('useModalInner:data:', data);

      resetFields();
      setModalProps({ confirmLoading: false, height: 700 });
      isUpdate.value = !!data?.isUpdate;

      // 修改信息的部分
      if (unref(isUpdate)) {
        rowId.value = data.record.id;
        recordDataIsSuper.value = data.record.isSuper;
        // 得到权限
        setFieldsValue({
          ...data.record,
          isSuper: data.record.isSuper == 1 ? true : false,
          isGroupSuper: data.record.isGroupSuper == 1 ? true : false,
        });
      }

      // const treeData = await getDeptList();
      updateSchema([
        {
          field: 'password',
          show: !unref(isUpdate),
        },
      ]);
      changeLoading(false);
    },
  );

  const getTitle = computed(() => (!unref(isUpdate) ? '新增账号' : '编辑账号'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      // console.log('values:', values);
      // console.log('rowId:', rowId);
      // console.log("ancestors: ", ancestors);
      let params = {
        id: unref(isUpdate) ? rowId.value : null,
        ...values,
        isSuper: values.isSuper ? 1 : 0,
        isGroupSuper: values.isGroupSuper ? 1 : 0,
      };
      // console.log('req.params:', params);
      // 发请求新增
      const data = await defHttpForRes.post({
        url: '/system/user/user',
        params: params,
      });
      // console.log('data', data);
      if (data.success) {
        success(data.message);
      } else {
        const megdetail = data.result.join(',');
        error(megdetail);
        return;
      }
      closeModal();
      emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
