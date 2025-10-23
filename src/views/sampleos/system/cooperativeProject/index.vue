<template>
  <PageWrapper dense contentBackground contentFullHeight>
    <BasicTable @register="registerTable">
      <!-- 表格顶部左侧区域插槽 -->
      <template #tableTitle>
        <a-row :gutter="[8, 8]">
          <a-col>
            <a-button type="primary" @click="ApplicateProgram">申请项目</a-button>
          </a-col>
          <a-col>
            <a-button type="primary" @click="AddProgram">新增合作项目</a-button>
          </a-col>
          <a-col>
            <a-button type="primary" @click="exportExcel">导出</a-button>
          </a-col>
          <a-col>
            <a-popconfirm
              v-if="userStore.userInfo?.isInternalGroup"
              title="确认删除吗？"
              ok-text="是"
              cancel-text="否"
              @confirm="handleDeletes"
            >
              <template #icon><question-circle-outlined style="color: red" /></template>
              <a-button type="primary" danger>删除</a-button>
            </a-popconfirm>
          </a-col>
        </a-row>
      </template>

      <!-- 表格顶部右侧区域插槽 -->
      <template #toolbar> </template>

      <!-- 个性化单元格 -->
      <template #bodyCell="{ column, record, text }">
        <!-- 操作列 -->
        <template v-if="column.key === 'action'">
          <TableAction
            stopButtonPropagation
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                tooltip: '修改项目',
                onClick: handleEdit.bind(null, record, column),
                // auth: ['Super'],
              },
              {
                icon: 'ant-design:delete-outlined',
                color: 'error',
                tooltip: '删除项目',
                popConfirm: {
                  title: '是否确认删除',
                  placement: 'left',
                  confirm: handleDelete.bind(null, record),
                },
                // auth: ['Super'],
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <AddProjectModal @register="addModal" @success="handleSuccess" :maskClosable="false" />
    <ApplicateProjectModal @register="applyModal" @success="handleSuccess" :maskClosable="false" />
    <OperationModal @register="operationModal" @success="handleSuccess" :maskClosable="false" />
  </PageWrapper>
</template>
<script lang="ts" setup>
  // import { Description } from '@/components/Description';
  // import { Divider, notification, Button, TypographyParagraph, Switch, Tag } from 'ant-design-vue';
  // import { defHttp, defHttpForRes, defHttpOrigin } from '@/utils/http/axios';
  // import axios from 'axios';
  // import { downloadByData } from '@/utils/file/download';
  import { FormSchema } from '/@/components/Form/index';
  import { BasicTable, useTable, BasicColumn } from '@/components/Table';
  import { PageWrapper } from '@/components/Page';
  import { ref, h, unref, reactive } from 'vue';
  import { useModal } from '@/components/Modal';
  import { useRouter, useRoute } from 'vue-router';
  import {
    // sampleSchema,
    // refundTableSchema,
    // refundTableData,
    // projectPackageMap,
    // AddProjectSchemas,
    projectTableSchema,
    projectConsumableTypeMap,
    // getBelongPackageCascader,
    PackageType,
  } from './data';
  import {
    getProjectListApi,
    // deleteApi,
    MoadlType,
    getBelongPackageCascaderApi,
    getSystemProjectListApi,
    deleteProjectApi,
    getUserGroupInfoApi,
  } from './pjsMngApi';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useUserStore } from '@/store/modules/user';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import { jsonToSheetXlsx, ImpExcel, ExcelData } from '@/components/Excel';
  import OperationModal from './OperationModal.vue';
  import ApplicateProjectModal from './ApplicateProjectModal.vue';
  import AddProjectModal from './AddProjectModal.vue';

  const userStore = useUserStore();
  const { createMessage } = useMessage();
  const { info, success, error } = createMessage;

  const route = useRoute();
  // console.log('query: ', route.query);
  const sampleId = route.query.id;

  const [applyModal, { openModal: openModalApply }] = useModal();
  const [addModal, { openModal: openModalAdd }] = useModal();
  const [operationModal, { openModal: openModalOpearate }] = useModal();

  /** 搜索栏-所属套餐级联 */
  let PackageList: PackageType[] = [];

  async function getBelongPackageCascader() {
    try {
      const response = await getBelongPackageCascaderApi(null);
      return response;
    } catch (error) {
      console.log('请求失败');
      return;
    }
  }
  const PackageCascaderPromise = getBelongPackageCascader();

  // 处理套餐级联 children 并 push 到 PackageList
  function processPackageCascaderChildren(
    children: Array<{
      label: string;
      value: number;
      children?: Array<{ label: string; value: number }>;
    }>,
  ): PackageType[] {
    if (!children || !Array.isArray(children)) {
      return [];
    }
    return children.map((item) => ({
      value: item.value,
      label: item.label,
      children: item.children ? processPackageCascaderChildren(item.children) : [],
    }));
  }
  // 提取 Promise 数据
  PackageCascaderPromise.then((data) => {
    // 处理顶层数据
    // console.log('data', data);
    data.forEach((item: PackageType) => {
      // console.log(item);
      PackageList.push({
        value: item.value,
        label: item.label,
        children: processPackageCascaderChildren(
          item.children as Array<{
            label: string;
            value: number;
            children?: Array<{ label: string; value: number }>;
          }>,
        ),
      });
    });
    // console.log('PackageList', PackageList);
  }).catch((error) => {
    console.error('Error:', error);
  });

  /** 一、搜索表单 */
  const SearchFormSchemas: FormSchema[] = [
    {
      field: `projectIds`,
      label: `项目名`,
      component: 'ApiSelect',
      colProps: {
        span: 5,
      },
      componentProps: {
        api: getProjectListApi, // get，获取所有项目，成功
        labelField: 'projectName',
        valueField: 'id',
        mode: 'multiple',
        showSearch: true,
        filterOption: (input, option) => {
          if (option?.label.includes(input)) {
            return true;
          }
          // console.log('input:', input);
          // console.log('option:', option);
          return false;
        },
        beforeFetch(info) {
          return info;
        },
      },
    },
    {
      field: `belongingPackage`,
      component: `ApiCascader`,
      label: '所属套餐',
      // labelWidth: 70,
      colProps: {
        span: 7,
      },
      componentProps: {
        // 手动从Promise对象中提取
        options: PackageList,
        onChange: (e) => {
          // console.log("e: ", e);
        },
      },
    },
    {
      field: `userGroupId`,
      component: `ApiSelect`,
      label: '用户组',
      ifShow: userStore.userInfo?.isInternalGroup,
      colProps: {
        span: 5,
      },
      componentProps: {
        // api: (info) => {
        //   // console.log('info', info);
        //   const a = getUserGroupInfoApi(info);
        //   return a;
        // },
        api: async () => {
          const rsp = await getUserGroupInfoApi({ scene: 'fillIn' });
          return rsp.result;
        },
        showSearch: true,
        resultField: 'result',
        labelField: 'groupName',
        valueField: 'id',
        filterOption: (inputValue, option) => {
          return option.label.includes(inputValue);
        },
      },
    },
  ];

  /** 二、数据表格 */
  const [
    registerTable,
    {
      // getForm,
      // updateTableDataRecord,
      getRowSelection,
      clearSelectedRowKeys,
      reload,
      getDataSource,
    },
  ] = useTable({
    // title: '开启搜索区域',
    api: getSystemProjectListApi,
    // 项目表格列名
    columns: projectTableSchema,
    // 搜索表单功能
    useSearchForm: true,
    // 搜索表单功能配置
    formConfig: {
      labelWidth: 100,
      baseColProps: { span: 8 },
      schemas: SearchFormSchemas,
    },
    beforeFetch(info) {
      // 所选套餐 处理级联组件
      if (info?.belongingPackage && info.belongingPackage.length > 0) {
        // console.log('info.belongingPackage.length', info.belongingPackage.length);
        // 取最后一个id，原因是接口只需要传套餐id
        info.belongingPackage = info?.belongingPackage[info.belongingPackage.length - 1];
        // console.log('info.belongingPackage', info.belongingPackage);
      }
      return info;
    },
    showTableSetting: true,
    tableSetting: { fullScreen: false },
    showIndexColumn: false,
    rowKey: 'id',
    rowSelection: { type: 'checkbox' },
    showSelectionBar: true, // 显示多选状态栏
    actionColumn: {
      title: '操作',
      width: 80,
      dataIndex: 'action',
      // ifShow: userStore.userInfo?.isSuper,
    },
    clickToRowSelect: false, // 禁用点击行选中功能
  });

  /** 刷新表格 */
  function handleSuccess() {
    // isUpdate编辑用户
    // if (isUpdate) {
    //   // 不刷新表格直接更新内部数据。
    //   // 注意：updateTableDataRecord要求表格的rowKey属性为string并且存在于每一行的record的keys中
    //   const result = updateTableDataRecord(values.id, values);
    //   console.log(result);
    // } else {
    clearSelectedRowKeys(); // 清空选中行
    reload(); // 刷新表格
    // }
  }

  /** 修改项目 */
  function handleEdit(record: Recordable, column) {
    // console.log('record:', record);
    // console.log('column:', column);
    openModalOpearate(true, {
      moadlType: MoadlType.MODIFY_PROJECT,
      record,
      id: sampleId,
      projectId: record.originProjectId,
      // isSuper: userStore.userInfo?.isSuper,
    });
  }

  type Header = {
    id: string;
    projectName: string;
    detectMethod: string;
    consumableType: string;
    userGroupName?: string;
    defaultDeliveryUnitName: string;
    price: string;
    priceCoefficient?: string;
    discountedPrice?: string;
  };

  /** 通过指定表格列数组获取表格数据 */
  function filterByKeys(data: any[], keys: string[]) {
    return data.map((item) =>
      keys.reduce(
        (acc, key) => {
          if (item.hasOwnProperty(key)) {
            acc[key] = item[key];
          }
          return acc;
        },
        {} as Record<string, any>,
      ),
    );
  }

  /** 导出 */
  function exportExcel() {
    // 默认Object.keys(data[0])作为header
    const data = JSON.parse(JSON.stringify(getDataSource()));
    // 处理值映射
    data.forEach((item) => {
      // delete item.fileId;
      // item.consumableType = projectConsumableTypeMap(item.consumableType);
      delete item.originProjectId;
      !userStore.userInfo?.isInternalGroup ? delete item.userGroupName : undefined;
    });
    const header: Header = {
      id: 'ID',
      projectName: '项目名称',
      detectMethod: '检测方法',
      consumableType: '采样耗材类型',
      userGroupName: '所属用户组',
      defaultDeliveryUnitName: '默认外送',
      price: '价格',
      priceCoefficient: '折扣系数',
      discountedPrice: '折后价格',
    };
    // console.log('table_data: ', data);

    if (!userStore.userInfo?.isInternalGroup) {
      delete (header as { userGroupName?: string }).userGroupName;
      delete (header as { priceCoefficient?: number }).priceCoefficient;
      delete (header as { discountedPrice?: number }).discountedPrice;
    }

    jsonToSheetXlsx({
      data: filterByKeys(data, Object.keys(header)),
      header,
      // filename: '样本_' + sampleData.value.name + '_项目数据.xlsx',
      filename: '合作项目管理数据.xlsx',
    });
  }

  /** 删除 */
  async function handleDeletes() {
    // if (!userStore.userInfo?.isSuper) {
    //   error('只有超级管理员可以删除');
    //   return;
    // }
    if (unref(getRowSelection().selectedRowKeys)?.length === 0) {
      error('请勾选至少一个数据');
      return;
    }
    // console.log('getForm:', getForm());
    // console.log('getRowSelection().selectedRowKeys:', getRowSelection().selectedRowKeys);
    const ids = getRowSelection().selectedRowKeys;
    // console.log(ids);
    if (ids?.length > 0) {
      const data = await deleteProjectApi({ projectIds: ids });
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
    // console.log('getForm:', getForm());
    // console.log('record:', record);
    // if (!userStore.userInfo?.isSuper) {
    //   error('只有超级管理员可以删除');
    //   return;
    // }
    // console.log('record', record);
    const ids = [record.id];
    // console.log('ids', ids);
    if (ids?.length > 0) {
      const data = await deleteProjectApi({ projectIds: ids });
      // console.log('data', data);
      if (data.success) {
        success(data.message);
        reload();
      } else {
        error(data.message);
        return;
      }
    }
  }

  /** 申请项目 */
  function ApplicateProgram() {
    openModalApply(true, {
      moadlType: MoadlType.APPLY_PROJECT,
      projects: getDataSource(),
      id: sampleId,
    });
  }

  /** 新增项目 */
  function AddProgram() {
    openModalAdd(true, {
      moadlType: MoadlType.ADD_PROJECT,
      projects: getDataSource(),
      id: sampleId,
    });
  }
</script>
<style lang="less" scoped>
  .desc-wrap {
    padding: 16px;
    background-color: @component-background;
  }

  .mr-ri-8 {
    margin-right: 8px;
  }
</style>
