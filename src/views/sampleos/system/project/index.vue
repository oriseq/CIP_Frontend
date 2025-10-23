<template>
  <PageWrapper dense contentBackground contentFullHeight>
    <BasicTable @register="registerTable">
      <!-- 表格顶部左侧区域插槽 -->
      <template #tableTitle>
        <div>
          <!-- <a-button class="mr-ri-8" type="primary" @click="ApplicateProgram">申请项目</a-button> -->
          <!--          v-if="userStore.userInfo?.isSuper"-->
          <a-button class="mr-ri-8" type="primary" @click="AddProgram">新增项目</a-button>
          <a-button class="mr-ri-8" type="primary" @click="exportExcel">导出</a-button>
        </div>
      </template>

      <!-- 表格顶部右侧区域插槽 -->
      <template #toolbar>
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
      </template>

      <!-- 个性化单元格 -->
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.key === 'deliveryUnits' && text">
          <div
            style="margin: 3px 0"
            v-for="(item, index) in filterDeLivUnitText(text).slice(0, 5)"
            :key="item.projectId"
          >
            {{ item.name }}
            <br />
          </div>

          <div
            v-if="filterDeLivUnitText(text).length > 5"
            style="margin: 3px 0"
            @mouseenter="showFullText = true"
            @mouseleave="showFullText = false"
          >
            <Tag color="gray">
              <div class="custom-tooltip-wrapper">
                <a-typography-text
                  :style="{ width: '30px', color: 'White' }"
                  :ellipsis="{
                    tooltip: '...',
                  }"
                  :content="`all all`"
                >
                  <template #ellipsisTooltip>
                    <div class="custom-tooltip-content">
                      <span v-for="(item, idx) in filterDeLivUnitText(text)" :key="item.id"
                        >{{ idx + 1 }}. {{ item.name }} <br
                      /></span>
                    </div>
                  </template>
                </a-typography-text>
              </div>
            </Tag>
          </div>
          <!-- </div> -->
        </template>
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
    <OperationModal @register="operationModal" @success="handleSuccess" :maskClosable="false" />
  </PageWrapper>
</template>
<script lang="ts" setup>
  // import { Description } from '@/components/Description';
  import { Divider, notification, Button, TypographyParagraph, Switch, Tag } from 'ant-design-vue';
  // import { defHttp, defHttpForRes, defHttpOrigin } from '@/utils/http/axios';
  // import axios from 'axios';
  // import { downloadByData } from '@/utils/file/download';
  import { FormSchema } from '/@/components/Form/index';
  import { BasicTable, useTable, BasicColumn } from '@/components/Table';
  import { PageWrapper } from '@/components/Page';
  import { ref, h, unref, reactive, computed } from 'vue';
  import { useModal } from '@/components/Modal';
  import { useRouter, useRoute } from 'vue-router';
  import { projectTableSchema, projectConsumableTypeMap } from './data';
  import { getProjectListApi, MoadlType, deleteProjectApi } from './pjsMngApi';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useUserStore } from '@/store/modules/user';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import { jsonToSheetXlsx, ImpExcel, ExcelData } from '@/components/Excel';

  import OperationModal from './OperationModal.vue';
  import AddProjectModal from './AddProjectModal.vue';

  const userStore = useUserStore();
  const { createMessage } = useMessage();
  const { info, success, error } = createMessage;

  const route = useRoute();
  // console.log('query: ', route.query);
  const sampleId = route.query.id;

  const [addModal, { openModal: openModalAdd }] = useModal();
  const [operationModal, { openModal: openModalOpearate }] = useModal();

  /** 过滤空外送单位对象 */
  const filterDeLivUnitText = (text) => {
    return text.filter((item) => item !== null);
  };

  /** 一、搜索表单 */
  const SearchFormSchemas: FormSchema[] = [
    {
      field: `projectIds`,
      label: `项目名`,
      component: 'ApiSelect',
      colProps: {
        span: 10,
      },
      componentProps: {
        // api: getBelongPackageProjectListApi, // post，当前表格包含的项目，成功
        // api: getBelongPackageProjectListApiHTTP, // post, 将defHttpForRes替换defHttp为失败
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
          // 调查被调用两次API的原因
          // console.log('getBelongPackageProjectListApi-1: is Callled');
          // console.log('getBelongPackageProjectListApi-1-info', info);
          return info;
        },
      },
    },
    // {
    //   field: `belongingPackage`,
    //   // component: `Cascader`,
    //   component: `ApiCascader`,
    //   label: '所属套餐',
    //   // labelWidth: 70,
    //   colProps: {
    //     span: 7,
    //   },
    //   componentProps: {
    //     // 手动从Promise对象中提取
    //     options: PackageList,
    //     onChange: (e) => {
    //       // console.log("e: ", e);
    //     },
    //   },
    // },
    // {
    //   field: `userGroupId`,
    //   component: `ApiSelect`,
    //   label: '用户组',
    //   ifShow: userStore.userInfo?.isSuper,
    //   colProps: {
    //     span: 5,
    //   },
    //   componentProps: {
    //     // api: (info) => {
    //     //   // console.log('info', info);
    //     //   const a = getUserGroupInfoApi(info);
    //     //   return a;
    //     // },
    //     api: getUserGroupInfoApi,
    //     showSearch: true,
    //     resultField: 'result',
    //     labelField: 'groupName',
    //     valueField: 'id',
    //   },
    // },
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
    api: getProjectListApi,
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
    // beforeFetch(info) {
    //   // 调查被调用两次API的原因
    //   // console.log('getBelongPackageProjectListApi-2: is Callled');
    //   // console.log('getBelongPackageProjectListApi-2-info', info); // {page: 1, pageSize: 10}
    //   // console.log('info?.belongingPackage', info?.belongingPackage); // undefined
    //   // 所选套餐 处理级联组件
    //   if (info?.belongingPackage && info.belongingPackage.length > 0) {
    //     // console.log('info.belongingPackage.length', info.belongingPackage.length);
    //     // 取最后一个id，原因是接口只需要传套餐id
    //     info.belongingPackage = info?.belongingPackage[info.belongingPackage.length - 1];
    //     // console.log('info.belongingPackage', info.belongingPackage);
    //   }
    //   return info;
    // },
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
      // isSuper: userStore.userInfo?.isSuper,
    });
  }

  /** 导出 */
  function exportExcel() {
    // 默认Object.keys(data[0])作为header
    const data = JSON.parse(JSON.stringify(getDataSource()));
    // 处理值映射
    data.forEach((item) => {
      // delete item.fileId;
      // console.log('item.consumableType', item.consumableType);
      // item.consumableType = projectConsumableTypeMap(item.consumableType);
      delete item.reportDay;
      delete item.reportHour;
      delete item.isReportHourMinutesEnd;
      delete item.disableWeek;
      delete item.projectCategoryId;
      delete item.remainingHour;
    });
    const header = {
      id: 'ID',
      projectName: '项目名称',
      detectMethod: '检测方法',
      consumableType: '采样耗材类型',
      reportDate: '报告周期',
      projectCategoryName: '项目分类',
      price: '价格',
      sampleRequirements: '样本要求',
      remarks: '备注',
    };
    // console.log('table_data: ', data);
    jsonToSheetXlsx({
      data,
      header,
      // filename: '样本_' + sampleData.value.name + '_项目数据.xlsx',
      filename: '项目管理数据导出.xlsx',
    });
  }

  /** 删除 */
  async function handleDeletes() {
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
