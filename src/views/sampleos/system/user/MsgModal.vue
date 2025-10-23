<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    @ok="handleSubmit"
    :width="850"
    :showCancelBtn="false"
  >
    <!-- <template v-for="(index, value in )"></template> -->
    <a-form ref="formRef" :model="dynamicValidateForm">
      <a-space
        v-for="(user, index) in dynamicValidateForm.users"
        :key="user.groupIdentify"
        style="display: flex; margin-bottom: 8px"
        align="baseline"
      >
        <a-form-item label="名称" :name="['users', index, 'groupIdentify']" :help="user.helpMsg">
          <a-input v-model:value="user.name" :disabled="true" />
        </a-form-item>

        <a-form-item label="用户" :name="['users', index, 'OptionInfo']" tooltip="勾选的用户，能够触发条件时接收通知。">
          <a-cascader
            v-model:value="user.selectIds"
            multiple
            style="width: 500px"
            max-tag-count="responsive"
            :options="user.OptionInfo"
            :show-checked-strategy="Cascader.SHOW_CHILD"
            @change="dealChange"
          />
        </a-form-item>
      </a-space>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, reactive, computed, unref, watch, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  // import { BasicForm, useForm } from '@/components/Form';
  // import { defHttpForRes, defHttp } from '@/utils/http/axios';
  import { useMessage } from '@/hooks/web/useMessage';
  // import { accountFormSchema } from './account.data';
  // import type { TreeProps } from 'ant-design-vue';
  // import { BasicTree, TreeItem } from '@/components/Tree';
  // import permission from '@/router/routes/modules/demo/permission';
  // import { useUserStore } from '@/store/modules/user';
  import {
    // groupSelectApi,
    msgGroupListApi,
    userGroupCascaderApi,
    UpdateMsgGroupApi,
  } from '@/views/sampleos/system/user/userApi';
  // import {
  //   ActionItem,
  //   BasicColumn,
  //   BasicTable,
  //   EditRecordRow,
  //   TableAction,
  //   useTable,
  // } from '@/components/Table';
  // import { optionsListApi } from '@/api/demo/select';
  // import { treeOptionsListApi } from '@/api/demo/tree';
  // import { cloneDeep } from 'lodash-es';
  import type { FormInstance } from 'ant-design-vue';
  // import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons-vue';
  import { Cascader } from 'ant-design-vue';

  defineOptions({ name: 'MsgModal' });
  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  // const userStore = useUserStore();
  const { success, error } = createMessage;
  // console.log('userStore.userInfo:', userStore.userInfo);

  const [registerModal, { setModalProps, closeModal, changeLoading }] = useModalInner(
    async (data) => {
      changeLoading(true);
      // console.log('useModalInner:data:', data);

      changeLoading(false);
    },
  );

  const getTitle = computed(() => '设置接收通知组');

  /** 表单用户组数据类型 */
  interface UserGroup {
    receiveGroup?: string;
    id: number;
    groupIdentify: string;
    name: string;
    helpMsg: string;
    OptionInfo: UserCascader[];
    [key: string]: any;
  }
  /** 用户级联接口类型 */
  interface UserCascader {
    id: number;
    label: string;
    value?: number;
    children: UserCascader[];
  }
  /** 提交表单数据接口 */
  interface FormData {
    id: number;
    userIds: number[];
  }
  const formRef = ref<FormInstance>();

  const dynamicValidateForm = reactive<{ users: UserGroup[] }>({
    users: [],
  });

  /** 从用户级联处过滤已勾选的userIds */
  async function getuserGroupCascader(userIds: number[]) {
    let options: number[][] = [];
    const user_group_response = await userGroupCascaderApi(null);
    // 批处理
    for (let parent of user_group_response) {
      parent.children.forEach((element) => {
        if (userIds.includes(element.id)) {
          options.push([parent.id, element.id]);
        }
      });
    }
    // console.log('getuserGroupCascader-options: ', options);
    return options;
  }

  /** 所有用户的级联 */
  async function AllUserCascader() {
    let options: UserCascader[] = [];
    const user_group_response = await userGroupCascaderApi(null);
    // console.log('user_group_response', user_group_response);
    for (let parent of user_group_response) {
      let parent_node = { id: parent.id, label: parent.name, value: parent.id, children: [] };

      if (parent.children) {
        parent_node.children = parent.children.map((element) => ({
          id: element.id,
          label: element.name,
          value: element.id,
          children: [] as UserCascader[],
        }));
      }
      options.push(parent_node);
    }
    // console.log('AllUserCascader-options: ', options);
    return options;
  }

  /** 获取通知组 */
  async function getMsgGroupList() {
    const msg_group_response = await msgGroupListApi(null); // 获取接收通知组信息
    // 1. 通过通知组信息中的userIds列表，从用户组级联中获取父对象和子对象
    msg_group_response.forEach(async (item) => {
      // console.log(item); // {id: 1, userIds: Array(2), groupIdentify: 'inspection_form_submission'}
      // 获取勾选的值
      const selectIds = await getuserGroupCascader(item.userIds);
      // 注：统一一次请求将导致不同用户级联的勾选同步
      const res = await AllUserCascader();

      dynamicValidateForm.users.push({
        id: item.id,
        groupIdentify: item.groupIdentify,
        name: item.name,
        helpMsg: item.helpMsg,
        OptionInfo: res,
        selectIds: selectIds,
      });
    });
  }
  getMsgGroupList();

  /** 提交信息 */
  async function handleSubmit() {
    try {
      setModalProps({ confirmLoading: true });
      // 1. 根据dynamicValidateForm获取标识行id、勾选的用户id号
      // console.log('dynamicValidateForm.users', dynamicValidateForm.users);
      const formData: FormData[] = [];
      dynamicValidateForm.users.forEach((item) => {
        formData.push({
          id: item.id,
          userIds: item.selectIds.map((ls) => ls[ls.length - 1]),
        });
      });
      // console.log('formData: ', formData);

      // 2. 设置接收通知组请求
      const response = await UpdateMsgGroupApi(formData);
      // console.log('response', response);
      if (response.success) {
        success(response.message);
      } else {
        error(response.message);
        return;
      }
      closeModal();
      emit('success', {});
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  // 勾选级联会产生变化
  function dealChange(value) {
    // TODO 构建提交需要的userIds（结构和里面的内容都是用户id）
    // console.log('changeValue:', value);
    // 构建保存的数据，取用户id
    if (value) {
      let map = value.map((val) => val[val.length - 1]);
      // console.log('map: ', map);
    }
  }
</script>
