<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <BasicTable @register="registerTable">
      <template #form-custom> custom-slot </template>

      <!-- 表格顶部左侧区域插槽 -->
      <template #tableTitle>
        <a-row :gutter="[8, 8]">
          <a-col>
            <a-button type="primary" @click="handleCreate">新增账号</a-button>
          </a-col>
          <a-col>
            <a-button v-if="userStore.userInfo?.isSuper" type="primary" @click="handleMsg"
              >设置接收通知组</a-button
            >
          </a-col>
          <a-col>
            <a-button @click="createInvitationCode">生成邀请码</a-button>
          </a-col>
          <a-col>
            <a-popconfirm
              title="确认删除吗？"
              ok-text="是"
              cancel-text="否"
              @confirm="handleDelete"
            >
              <template #icon><question-circle-outlined style="color: red" /></template>
              <a-button type="primary" danger>删除用户</a-button>
            </a-popconfirm>
          </a-col>
        </a-row>
        <div>
          <!-- <a-button class="mr-2" type="primary" @click="handleCreate">新增账号</a-button> -->
          <!-- <a-button
            class="mr-2"
            v-if="userStore.userInfo?.isSuper"
            type="primary"
            @click="handleMsg"
            >设置接收通知组</a-button
          > -->
        </div>
      </template>
      <!-- <template #toolbar>
        <a-button @click="createInvitationCode">生成邀请码</a-button>
        <a-popconfirm title="确认删除吗？" ok-text="是" cancel-text="否" @confirm="handleDelete">
          <template #icon><question-circle-outlined style="color: red" /></template>
          <a-button type="primary" danger>删除用户</a-button>
        </a-popconfirm>
      </template> -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction
            stopButtonPropagation
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                tooltip: '编辑用户资料',
                onClick: handleEdit.bind(null, record, column),
              },
              {
                icon: 'clarity:lock-line',
                tooltip: '编辑用户权限',
                onClick: handlePermission.bind(null, record, column),
                ifShow: (_action) => {
                  // console.log('action:', _action);
                  // console.log('record:', record);
                  return !record.isSuper;
                },
                auth: ['system:user:permission', 'Super'],
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <AccountModal @register="registerModal" @success="handleSuccess" :maskClosable="false" />
    <PermissionModal
      @register="registerPermissionModal"
      @success="handleSuccess"
      :maskClosable="false"
    />
    <MsgModal @register="msgRegisterModal" @success="handleSuccess" :maskClosable="false" />
  </PageWrapper>
</template>

<script setup lang="ts">
  import { BasicTable, useTable } from '@/components/Table';
  import { ref, h, unref } from 'vue';
  import { useModal } from '@/components/Modal';
  import { userListApi } from './userApi';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import AccountModal from './AccountModal.vue';
  import PermissionModal from './PermissionModal.vue';
  import MsgModal from './MsgModal.vue';
  import { notification, Button, TypographyParagraph, Switch, Tooltip } from 'ant-design-vue';
  import { defHttpForRes, defHttp } from '@/utils/http/axios';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useUserStore } from '@/store/modules/user';

  const userStore = useUserStore();
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const [registerModal, { openModal }] = useModal();

  const [registerPermissionModal, { openModal: openPermissionModal }] = useModal();

  const [msgRegisterModal, { openModal: openMsgModal }] = useModal();

  // console.log('userStore.userInfo?.isSuper: ', userStore.userInfo?.isSuper);

  const [registerTable, { getForm, updateTableDataRecord, reload, getRowSelection }] = useTable({
    // title: '开启搜索区域',
    api: (info) => {
      // console.log('info: ', info);
      const a = userListApi(info);
      return a;
    },
    columns: [
      {
        title: 'ID',
        dataIndex: 'id',
        // fixed: 'left',
        width: 50,
        resizable: true,
        ellipsis: true,
        sorter: (a, b) => {
          return a.id - b.id;
        },
        customRender: ({ text }) => {
          return h(Tooltip, { title: text }, () =>
            h(
              'span',
              {
                style: {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-block',
                  maxWidth: '100%',
                },
              },
              text,
            ),
          );
        },
      },
      {
        title: '用户名',
        dataIndex: 'username',
        width: 150,
        resizable: true,
        ellipsis: true,
        sorter: (a, b) => {
          return a.username.localeCompare(b.username);
        },
        // filters: [
        //   { text: 'Male', value: 'male' },
        //   { text: 'Female', value: 'female' },
        // ],
        customRender: ({ text }) => {
          return h(Tooltip, { title: text }, () =>
            h(
              'span',
              {
                style: {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-block',
                  maxWidth: '100%',
                },
              },
              text,
            ),
          );
        },
      },
      {
        title: '真实姓名',
        dataIndex: 'realName',
        width: 100,
        resizable: true,
        ellipsis: true,
        sorter: (a, b) => {
          if (a.realName === null && b.realName === null) {
            return 0;
          } else if (a.realName === null) {
            return 1;
          } else if (b.realName === null) {
            return -1;
          }
        },
        customRender: ({ text }) => {
          return h(Tooltip, { title: text }, () =>
            h(
              'span',
              {
                style: {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-block',
                  maxWidth: '100%',
                },
              },
              text,
            ),
          );
        },
      },
      {
        title: '手机号',
        width: 100,
        dataIndex: 'phoneNumber',
        resizable: true,
        ellipsis: true,
        customRender: ({ text }) => {
          return h(Tooltip, { title: text }, () =>
            h(
              'span',
              {
                style: {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-block',
                  maxWidth: '100%',
                },
              },
              text,
            ),
          );
        },
      },
      {
        title: '邮箱',
        width: 180,
        dataIndex: 'mail',
        resizable: true,
        ellipsis: true,
        customRender: ({ text }) => {
          return h(Tooltip, { title: text }, () =>
            h(
              'span',
              {
                style: {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-block',
                  maxWidth: '100%',
                },
              },
              text,
            ),
          );
        },
      },
      {
        title: '所属用户组',
        dataIndex: 'userGroupName',
        width: 150,
        resizable: true,
        ellipsis: true,
        sorter: (a, b) => {
          return a.userGroupName.localeCompare(b.userGroupName);
        },
        // auth: '组1',
        ifShow: userStore.userInfo?.isSuper,
        customRender: ({ text }) => {
          return h(Tooltip, { title: text }, () =>
            h(
              'span',
              {
                style: {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-block',
                  maxWidth: '100%',
                },
              },
              text,
            ),
          );
        },
      },
      {
        title: '超级管理员',
        width: 100,
        resizable: true,
        ellipsis: true,
        // sorter: true,
        dataIndex: 'isSuper',
        ifShow: userStore.userInfo?.isSuper,
        customRender: ({ text }) => {
          return h(Tooltip, { title: bool2string(text) }, () =>
            h(
              'span',
              {
                style: {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-block',
                  maxWidth: '100%',
                },
              },
              bool2string(text),
            ),
          );
        },
      },
      {
        title: '组管理员',
        width: 100,
        resizable: true,
        ellipsis: true,
        // sorter: true,
        dataIndex: 'isGroupSuper',
        ifShow: userStore.userInfo?.isSuper || userStore.userInfo?.isGroupSuper,
        customRender: ({ text }) => {
          return h(Tooltip, { title: bool2string(text) }, () =>
            h(
              'span',
              {
                style: {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-block',
                  maxWidth: '100%',
                },
              },
              bool2string(text),
            ),
          );
        },
      },
      {
        title: '邀请码',
        dataIndex: 'invitationCode',
        resizable: true,
        ellipsis: true,
        width: 200,
        ifShow: userStore.userInfo?.isSuper,
        customRender: ({ text }) => {
          return h(Tooltip, { title: text }, () =>
            h(
              'span',
              {
                style: {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-block',
                  maxWidth: '100%',
                },
              },
              text,
            ),
          );
        },
      },
      {
        title: '状态',
        dataIndex: 'avail',
        width: 120,
        resizable: true,
        ellipsis: true,
        ifShow: userStore.userInfo?.isSuper,
        customRender: ({ record }) => {
          // console.log('record: ', record);
          // if (!Reflect.has(record, 'disabled')) {
          //   record.disabled = false;
          // }
          // return null;
          return h(Switch, {
            checked: record.avail,
            checkedChildren: '启用',
            unCheckedChildren: '停用',
            loading: record.pendingStatus,
            // disabled: record.is_super,
            async onChange(checkeds) {
              record.pendingStatus = true;
              // console.log('record: ', record);
              // console.log('checkeds: ', checkeds);
              const data = await defHttpForRes.post({
                url: '/system/user/user',
                params: {
                  ...record,
                  avail: checkeds,
                },
              });
              // console.log('data', data);
              if (data.success) {
                success(`已成功修改状态`);
                record.avail = checkeds;
              } else {
                // const megdetail = data.result.join(',');
                error(data.message);
              }
              record.pendingStatus = false;
            },
          });
        },
      },
      {
        title: '创建时间',
        width: 150,
        dataIndex: 'creationTime',
        resizable: true,
        ellipsis: true,
        customRender: ({ text }) => {
          return h(Tooltip, { title: text }, () =>
            h(
              'span',
              {
                style: {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-block',
                  maxWidth: '100%',
                },
              },
              text,
            ),
          );
        },
        // format: (text, record, index) => {
        //   // console.log('text:', text);
        //   // 行记录
        //   // console.log('record:', record);
        //   // console.log('index:', index);

        //   return text == 1 ? '是' : '否';
        // },
      },
      {
        title: '最后一次登录时间',
        width: 150,
        dataIndex: 'lastLoginTime',
        resizable: true,
        ellipsis: true,
        customRender: ({ text }) => {
          return h(Tooltip, { title: text }, () =>
            h(
              'span',
              {
                style: {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-block',
                  maxWidth: '100%',
                },
              },
              text,
            ),
          );
        },
      },
      // {
      //   title: '操作',
      //   width: 150,
      //   dataIndex: 'lastLoginTime2',
      //   fixed: 'right',
      // },
    ],
    useSearchForm: true,
    formConfig: {
      labelWidth: 100,
      schemas: [
        {
          field: `username`,
          label: `用户名`,
          component: 'Input',
          colProps: { span: 5 },
          // colProps: {
          //   xl: 12,
          //   xxl: 8,
          // },
        },
        {
          field: `realName`,
          label: '真实姓名',
          component: 'Input',
          colProps: { span: 4 },
        },
        {
          field: `phoneNumber`,
          label: `手机号`,
          component: 'Input',
          colProps: { span: 5 },
          // colProps: {
          //   xl: 12,
          //   xxl: 8,
          // },
        },
        {
          field: `mail`,
          label: `邮箱`,
          component: 'Input',
          colProps: { span: 6 },
          // colProps: {
          //   xl: 12,
          //   xxl: 8,
          // },
        },
        // {
        //   field: `field11`,
        //   label: `Slot示例`,
        //   slot: 'custom',
        //   colProps: {
        //     xl: 12,
        //     xxl: 8,
        //   },
        // },
      ],
    },
    showTableSetting: true,
    tableSetting: { fullScreen: false },
    showIndexColumn: false,
    rowKey: 'id',
    rowSelection: {
      type: 'checkbox',
    },
    showSelectionBar: true, // 显示多选状态栏
    actionColumn: {
      title: '操作',
      width: 100,
      dataIndex: 'action',
    },
    clickToRowSelect: false, // 禁用点击行选中功能
  });

  /* 新增 */
  function handleCreate() {
    openModal(true, {
      isUpdate: false,
    });
  }

  function handleSuccess({ isUpdate, values }) {
    // isUpdate编辑用户
    if (isUpdate) {
      // 不刷新表格直接更新内部数据。
      // 注意：updateTableDataRecord要求表格的rowKey属性为string并且存在于每一行的record的keys中
      const result = updateTableDataRecord(values.id, values);
      // console.log(result);
    } else {
      reload();
    }
  }

  function handleEdit(record: Recordable, column) {
    // console.log('record:', record);
    // console.log('column:', column);
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 处理权限
   * @param record
   * @param column
   */
  function handlePermission(record: Recordable, column) {
    // console.log('点击了编辑', record);
    // console.log('点击了编辑', column);
    openPermissionModal(true, record);
  }

  /**
   * 处理消息
   * @param record
   * @param column
   */
  function handleMsg(record: Recordable, column) {
    openMsgModal(true, record);
  }

  const invitationCode = ref('');
  const invitationCodeExpireTime = ref('');
  const key = `open${Date.now()}`;
  let isClose = true;
  /**
   * 邀请码处理
   */
  const createInvitationCode = async () => {
    if (isClose) {
      // 请求
      const data = await defHttpForRes.get({ url: '/system/user/invitationCode' });
      // console.log('data', data);
      if (data.success) {
        invitationCode.value = data.result.code;
        invitationCodeExpireTime.value = data.result.expireTime;
      }
    }
    // console.log('invitationCode', invitationCode);
    // console.log('invitationCodeExpireTime', invitationCodeExpireTime);

    notification.open({
      message: `邀请码（过期时间为${invitationCodeExpireTime.value}）`,
      description: h(
        TypographyParagraph,
        {
          copyable: true,
        },
        { default: () => invitationCode.value },
      ),
      btn: () =>
        h(
          Button,
          {
            type: 'primary',
            size: 'small',
            onClick: () => notification.close(key),
          },
          { default: () => '确认' },
        ),
      key,
      duration: 6,
      onClose: close,
    });
    isClose = false;
  };
  const close = () => {
    isClose = true;
    // console.log(
    //   'Notification was closed. Either the close button was clicked or duration time elapsed.',
    // );
  };

  /* 删除用户 */
  async function handleDelete() {
    if (unref(getRowSelection().selectedRowKeys)?.length === 0) {
      error('请勾选至少一个数据');
      return;
    }
    // console.log('getForm:', getForm());
    // console.log('getRowSelection:', getRowSelection());
    const ids = getRowSelection().selectedRowKeys;
    if (ids?.length > 0) {
      const data = await defHttpForRes.delete({ url: '/system/user/user', params: ids });
      // console.log('data', data);
      if (data.success) {
        success(data.message);
        reload();
      } else {
        const megdetail = data.result.join(',');
        error(megdetail);
        return;
      }
    }
  }
  // const formData = ref([]);

  // onBeforeMount(() => {
  //   const page = userListApi();
  //   console.log('page', page);
  // });
  const bool2string = (val) => {
    return val == 1 ? '是' : '否';
  };
</script>

<style scoped></style>
