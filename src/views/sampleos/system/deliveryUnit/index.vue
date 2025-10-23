<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <div>
          <a-button class="mr-2" type="primary" @click="addDeliveryUnit">新增外送</a-button>
          <a-button class="mr-2" type="primary" @click="exportExcel()">导出</a-button>
        </div>
      </template>

      <template #toolbar>
        <a-popconfirm title="确认删除吗？" ok-text="是" cancel-text="否" @confirm="handleDeletes">
          <template #icon><question-circle-outlined style="color: red" /></template>
          <a-button type="primary" danger>删除</a-button>
        </a-popconfirm>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction
            stopButtonPropagation
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                tooltip: '编辑',
                onClick: handleEdit.bind(null, record, column),
              },
              {
                icon: 'ant-design:delete-outlined',
                color: 'error',
                tooltip: '删除',
                popConfirm: {
                  title: '是否确认删除',
                  placement: 'left',
                  confirm: handleDelete.bind(null, record),
                },
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <DeliveryUnitModal @register="registerModal" @success="handleSuccess" :maskClosable="false" />
  </PageWrapper>
</template>

<script setup lang="ts">
  import { BasicTable, useTable } from '@/components/Table';
  import { ref, h, unref } from 'vue';
  import { useModal } from '@/components/Modal';
  import { TableDataApi, DeliveryUnitApi, delInfoApi, ModalType } from './deliveryUnitMngApi';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import DeliveryUnitModal from './DeliveryUnitModal.vue';
  import { notification, Button, TypographyParagraph, Switch, Tooltip } from 'ant-design-vue';
  import { defHttpForRes, defHttp } from '@/utils/http/axios';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useUserStore } from '@/store/modules/user';
  import { jsonToSheetXlsx, ImpExcel, ExcelData } from '@/components/Excel';

  const userStore = useUserStore();
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const [registerModal, { openModal }] = useModal();

  const [
    registerTable,
    { updateTableDataRecord, reload, getRowSelection, getDataSource, clearSelectedRowKeys },
  ] = useTable({
    api: (info) => {
      return TableDataApi(info);
    },
    columns: [
      {
        title: '编号',
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
        title: '外送单位',
        dataIndex: 'name',
        width: 150,
        resizable: true,
        ellipsis: true,
        sorter: (a, b) => {
          if (a.name === null && b.name === null) {
            return 0;
          } else if (a.name === null) {
            return 1;
          } else if (b.name === null) {
            return -1;
          } else {
            return a.name.localeCompare(b.name);
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
        title: '备注',
        dataIndex: 'remarks',
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
      },
      {
        title: '创建时间',
        width: 200,
        resizable: true,
        ellipsis: true,
        dataIndex: 'submissionTime',
        sorter: (a, b) => {
          if (a.submissionTime === null && b.submissionTime === null) {
            return 0;
          } else if (a.submissionTime === null) {
            return 1;
          } else if (b.submissionTime === null) {
            return -1;
          } else {
            return a.submissionTime.localeCompare(b.submissionTime);
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
        title: '更新时间',
        dataIndex: 'updateTime',
        // sorter: true,
        width: 150,
        resizable: true,
        ellipsis: true,
        sorter: (a, b) => {
          if (a.updateTime === null && b.updateTime === null) {
            return 0;
          } else if (a.updateTime === null) {
            return 1;
          } else if (b.updateTime === null) {
            return -1;
          } else {
            return a.updateTime.localeCompare(b.updateTime);
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
    ],
    useSearchForm: true,
    formConfig: {
      labelWidth: 100,
      baseColProps: { span: 6 },
      showAdvancedButton: true,
      autoAdvancedLine: 1,
      schemas: [
        {
          field: 'name',
          label: '外送单位',
          component: 'Input',
          // component: 'ApiSelect',
          // componentProps: {
          //   // 通过API获取result列表
          //   api: async (params) => {
          //     let response = await DeliveryUnitApi({ params });
          //     console.log('formConfig-DeliveryUnitApi-response', response);
          //     if (response.success) {
          //       return response.result.map((item) => {
          //         return { label: item, value: item };
          //       });
          //     } else {
          //       error('外送单位接口请求失败');
          //     }
          //   },
          //   labelField: 'label',
          //   valueField: 'value',
          //   showSearch: true,
          //   mode: 'tags',
          //   onChange: (e, ...v) => {
          //     console.log('name: e,v', e, v);
          //     if (Array.isArray(e)) {
          //       name.value = e[e.length - 1];
          //     }
          //   },
          // },
          colProps: {
            span: 5,
          },
        },
        {
          field: 'remarks',
          component: 'Input',
          label: '备注',
          // labelWidth: 50,
          colProps: {
            // span: 5,
          },
          componentProps: {},
        },
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
      width: 80,
      dataIndex: 'action',
    },
    clickToRowSelect: false, // 禁用点击行选中功能
  });

  /* 新增外送单位 */
  function addDeliveryUnit() {
    openModal(true, {
      moadlType: ModalType.ADD_DELIVERY,
      isSuper: userStore.userInfo?.isSuper,
    });
  }

  /* 操作列-编辑 */
  function handleEdit(record: Recordable, column) {
    // console.log('record:', record);
    // console.log('column:', column);
    openModal(true, {
      record,
      moadlType: ModalType.EDIT_INFO,
      isSuper: userStore.userInfo?.isSuper,
    });
  }

  /** 删除 */
  async function handleDeletes() {
    if (unref(getRowSelection().selectedRowKeys)?.length === 0) {
      error('请勾选至少一个数据');
      return;
    }
    const ids = getRowSelection().selectedRowKeys;
    // console.log(ids);

    if (ids?.length > 0) {
      const data = await delInfoApi({ deliveryUnitIds: ids });
      // console.log('data', data);
      if (data.success) {
        success(data.message);
        reload();
      } else {
        error(data.message);
      }
      clearSelectedRowKeys();
    }
  }

  /** 操作列——删除 */
  async function handleDelete(record) {
    // console.log('record', record);
    const ids = [record.id];
    // console.log('ids', ids);

    const data = await delInfoApi({ deliveryUnitIds: [record.id] });
    // console.log('data', data);
    if (data.success) {
      success(data.message);
      reload();
    } else {
      error(data.message);
      return;
    }
  }

  /** 导出表 */
  function exportExcel() {
    // 默认Object.keys(data[0])作为header
    const data = JSON.parse(JSON.stringify(getDataSource()));
    // 处理值映射
    // data.forEach((item) => {
    // });
    const header = {
      id: '编号   ',
      name: '外送单位 ',
      remarks: '备注 ',
      submissionTime: '创建时间',
      updateTime: '更新时间',
    };
    // console.log('table_data: ', data);
    jsonToSheetXlsx({
      data,
      header,
      filename: '外送单位管理表.xlsx',
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
</script>

<style scoped></style>
