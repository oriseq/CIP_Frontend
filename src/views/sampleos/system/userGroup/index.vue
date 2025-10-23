<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <BasicTable @register="registerTable">
      <template #form-custom> custom-slot </template>

      <template #tableTitle>
        <a-row :gutter="[8, 8]">
          <a-col>
            <a-button type="primary" @click="handleCreate">新增用户组</a-button>
          </a-col>
          <a-col>
            <a-popconfirm
              title="确认删除吗？"
              ok-text="是"
              cancel-text="否"
              @confirm="handleDelete"
            >
              <template #icon><question-circle-outlined style="color: red" /></template>
              <a-button type="primary" danger>删除用户组</a-button>
            </a-popconfirm>
          </a-col>
        </a-row>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction
            stopButtonPropagation
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                tooltip: '编辑用户组',
                onClick: handleEdit.bind(null, record, column),
              },
              // {
              //   icon: 'clarity:note-edit-line',
              //   // tooltip: record.is_super ? '不可编辑' : '编辑用户资料',
              //   onClick: handleEdit.bind(null, record, column),
              // },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <GroupModal @register="registerModal" @success="handleSuccess" :maskClosable="false" />
  </PageWrapper>
</template>

<script setup lang="ts">
  import { BasicTable, useTable } from '@/components/Table';
  import { ref, h, unref } from 'vue';
  import { useModal } from '@/components/Modal';
  import { userGroupListApi } from './userGropuApi';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import GroupModal from '././GroupModal.vue';
  import { notification, Button, TypographyParagraph, Switch, Tooltip } from 'ant-design-vue';
  import { defHttpForRes, defHttp } from '@/utils/http/axios';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useUserStore } from '@/store/modules/user';

  const userStore = useUserStore();
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const [registerModal, { openModal }] = useModal();

  const [registerTable, { getForm, updateTableDataRecord, reload, getRowSelection }] = useTable({
    // title: '开启搜索区域',
    api: userGroupListApi,
    columns: [
      {
        title: 'ID',
        dataIndex: 'id',
        // fixed: 'left',
        width: 80,
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
        title: '用户组名',
        dataIndex: 'groupName',
        width: 150,
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
        // filters: [
        //   { text: 'Male', value: 'male' },
        //   { text: 'Female', value: 'female' },
        // ],
      },
      {
        title: '用户数量',
        dataIndex: 'amountOfUsers',
        width: 150,
        resizable: true,
        ellipsis: true,
        sorter: (a, b) => {
          return a.amountOfUsers - b.amountOfUsers;
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
      // {
      //   // 用户组可用状态
      //   title: '状态',
      //   dataIndex: 'availStatus',
      // },
      {
        title: '状态',
        dataIndex: 'availStatus',
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
            checked: record.availStatus,
            checkedChildren: '启用',
            unCheckedChildren: '停用',
            loading: record.pendingStatus,
            async onChange(checkeds) {
              record.pendingStatus = true;
              if (checkeds) {
                record.availStatus = checkeds;
                const data = await defHttpForRes.post({
                  url: '/system/userGroup/userGroup',
                  params: record,
                });
                // console.log('data', data);
                if (data.success) {
                  success(`已成功修改状态`);
                  // record.availStatus = checkeds;
                } else {
                  // const megdetail = data.result.join(',');
                  error(data.message);
                }
              } else {
                if (record.isInternalGroup && record.reamountOfUsers !== 0) {
                  warning(`该内部组下有用户，不可停用！`);
                  record.pendingStatus = false; // 不做按钮转圈圈加载
                  return;
                }
                record.availStatus = checkeds;
                // console.log('checkeds:', checkeds);
                const data = await defHttpForRes.post({
                  url: '/system/userGroup/userGroup',
                  params: record,
                });
                // console.log('data', data);
                if (data.success) {
                  success(`已成功修改状态`);
                  // record.availStatus = checkeds;
                } else {
                  // const megdetail = data.result.join(',');
                  error(data.message);
                }
              }
              record.pendingStatus = false;
            },
          });
        },
      },
      {
        title: '组别类型',
        width: 150,
        resizable: true,
        ellipsis: true,
        dataIndex: 'isInternalGroup',
        // format: (text, record) => {
        //   if (text) {
        //     return '是';
        //   } else {
        //     return '否';
        //   }
        // },
        customRender: ({ text }) => {
          return h(Tooltip, { title: text ? '内部' : '送检' }, () =>
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
              text ? '内部' : '送检',
            ),
          );
        },
      },
      {
        title: '创建时间',
        width: 200,
        resizable: true,
        ellipsis: true,
        dataIndex: 'creationTime',
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
    ],
    useSearchForm: true,
    formConfig: {
      labelWidth: 100,
      schemas: [
        {
          field: `groupName`,
          label: `用户组名`,
          component: 'Input',
          colProps: {
            xl: 12,
            xxl: 8,
          },
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
      // submitFunc: ,
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
      width: 120,
      dataIndex: 'action',
    },
    clickToRowSelect: false, // 禁用点击行选中功能
  });

  // function handleEdit(record: Recordable, column) {
  //   console.log('点击了编辑', record);
  //   console.log('点击了编辑', column);
  // }

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
      const data = await defHttpForRes.delete({ url: '/system/userGroup/userGroup', params: ids });
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
</script>

<style scoped></style>
