<template>
  <PageWrapper dense contentBackground contentFullHeight>
    <BasicTable @register="registerTable">
      <!-- 表格顶部左侧区域插槽 -->
      <template #tableTitle>
        <div>
          <a-button class="mr-ri-8" type="primary" @click="AddPackage">新增套餐</a-button>
          <!-- <a-button class="mr-ri-8" type="primary" @click="exportExcel">导出</a-button> -->
        </div>
      </template>

      <!-- 表格顶部右侧区域插槽 -->
      <template #toolbar>
        <a-popconfirm title="确认删除吗？" ok-text="是" cancel-text="否" @confirm="handleDeletes">
          <template #icon><question-circle-outlined style="color: red" /></template>
          <a-button type="primary" danger>删除</a-button>
        </a-popconfirm>
      </template>

      <!-- 个性化单元格 -->
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.key === 'projects'">
          <div style="margin: 3px 0" v-for="(item, index) in text.slice(0, 5)" :key="item.id">
            {{ item.projectName }}
            <br />
          </div>

          <div
            v-if="text.length > 5"
            style="margin: 3px 0"
            @mouseenter="showFullText = true"
            @mouseleave="showFullText = false"
          >
            <Tag color="gray">
              <div class="custom-tooltip-wrapper">
                <a-typography-text
                  :style="{ width: '30px', color: 'white' }"
                  :ellipsis="{
                    tooltip: '...',
                  }"
                  :content="`all all`"
                >
                  <template #ellipsisTooltip>
                    <div style="max-height: 300px; overflow-y: scroll">
                      <span v-for="(item, idx) in text" :key="item.id"
                        >{{ idx + 1 }}. {{ item.projectName }}<br
                      /></span>
                    </div>
                  </template>
                </a-typography-text>
              </div>
            </Tag>
          </div>
        </template>
        <!-- 操作列 -->
        <template v-if="column.key === 'action'">
          <TableAction
            stopButtonPropagation
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                tooltip: '编辑套餐信息',
                onClick: handleEdit.bind(null, record, column),
              },
              // {
              //   icon: 'ant-design:delete-outlined',
              //   color: 'error',
              //   tooltip: '删除项目',
              //   popConfirm: {
              //     title: '是否确认删除',
              //     placement: 'left',
              //     confirm: handleDelete.bind(null, record),
              //   },
              // },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <AddPackageModal @register="registerModal" @success="handleSuccess" :maskClosable="false" />
    <OperationModal @register="operationModal" @success="handleSuccess" :maskClosable="false" />
  </PageWrapper>
</template>
<script lang="ts" setup>
  // import { Description } from '@/components/Description';
  // import { Divider, notification, Button, TypographyParagraph, Switch, Tag } from 'ant-design-vue';
  // import { defHttp, defHttpForRes, defHttpOrigin } from '@/utils/http/axios';
  // import axios from 'axios';
  // import { downloadByData } from '@/utils/file/download';
  import { Badge, Tag, Tooltip } from 'ant-design-vue';
  import { FormSchema } from '/@/components/Form/index';
  import { BasicTable, useTable, BasicColumn } from '@/components/Table';
  import { PageWrapper } from '@/components/Page';
  import { ref, h, unref, reactive } from 'vue';
  import { useModal } from '@/components/Modal';
  // import { useRouter, useRoute } from 'vue-router';
  import {
    sampleProjectStatusMapping,
    getTagColor,
  } from '../../sample/inspectionMission/fieldMapping';
  import {
    getProjectListApi,
    MoadlType,
    deletePackageApi,
    getPackageListApi,
    getUserGroupInfoApi,
  } from './pkgMngApi';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useUserStore } from '@/store/modules/user';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  // import { jsonToSheetXlsx, ImpExcel, ExcelData } from '@/components/Excel';

  import AddPackageModal from './AddPackageModal.vue';
  import OperationModal from './OperationModal.vue';

  const userStore = useUserStore();
  const { createMessage } = useMessage();
  const { success, error } = createMessage;

  const showFullText = ref(false);

  // const route = useRoute();
  // console.log('query: ', route.query);
  // const sampleId = route.query.id;

  const [registerModal, { openModal }] = useModal(); // 用于新增套餐
  const [operationModal, { openModal: openModalOpearate }] = useModal(); // 用于编辑套餐信息

  /** 搜索栏-所属套餐级联 */
  // let PackageList: PackageType[] = [];

  // async function getBelongPackageCascader() {
  //   try {
  //     const response = await getBelongPackageCascaderApi(null);
  //     return response;
  //   } catch (error) {
  //     console.log('请求失败');
  //     return;
  //   }
  // }
  // const PackageCascaderPromise = getBelongPackageCascader();

  // 处理套餐级联 children 并 push 到 PackageList
  // function processPackageCascaderChildren(
  //   children: Array<{
  //     label: string;
  //     value: number;
  //     children?: Array<{ label: string; value: number }>;
  //   }>,
  // ): PackageType[] {
  //   if (!children || !Array.isArray(children)) {
  //     return [];
  //   }
  //   return children.map((item) => ({
  //     value: item.value,
  //     label: item.label,
  //     children: item.children ? processPackageCascaderChildren(item.children) : [],
  //   }));
  // }
  // // 提取 Promise 数据
  // PackageCascaderPromise.then((data) => {
  //   // 处理顶层数据
  //   // console.log('data', data);
  //   data.forEach((item: PackageType) => {
  //     // console.log(item);
  //     PackageList.push({
  //       value: item.value,
  //       label: item.label,
  //       children: processPackageCascaderChildren(
  //         item.children as Array<{
  //           label: string;
  //           value: number;
  //           children?: Array<{ label: string; value: number }>;
  //         }>,
  //       ),
  //     });
  //   });
  //   // console.log('PackageList', PackageList);
  // }).catch((error) => {
  //   console.error('Error:', error);
  // });

  /** 一、搜索表单 */
  const SearchFormSchemas: FormSchema[] = [
    {
      field: `packageName`,
      // component: `Cascader`,
      // component: `ApiCascader`,
      component: `Input`,
      label: '套餐名',
      // labelWidth: 70,
      colProps: {
        span: 6,
      },
      componentProps: {
        // 手动从Promise对象中提取
        // options: PackageList,
        // onChange: (e) => {
        //   // console.log("e: ", e);
        // },
      },
    },
    {
      field: `projectIds`,
      component: 'ApiSelect',
      label: `包含项目`,
      colProps: {
        span: 7,
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
          // 调查被调用两次API的原因
          // console.log('getBelongPackageProjectListApi-1: is Callled');
          // console.log('getBelongPackageProjectListApi-1-info', info);
          return info;
        },
      },
    },
    {
      field: `userGroupId`,
      component: `ApiSelect`,
      label: `用户组`,
      ifShow: userStore.userInfo?.isSuper,
      colProps: {
        span: 5,
      },
      componentProps: {
        api: getUserGroupInfoApi,
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

  /** 表格列名 */
  const packageTableSchema: BasicColumn[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      resizable: true,
      sorter: (a, b) => {
        // 处理null值情况，将null值排在最后
        if (a.id === null && b.id === null) return 0;
        if (a.id === null) return 1;
        if (b.id === null) return -1;
        // 正常数字排序
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
      title: '套餐名称',
      dataIndex: 'packageName',
      width: 200,
      resizable: true,
      sorter: (a, b) => {
        // 处理null值情况，将null值排在最后
        if (a.packageName === null && b.packageName === null) return 0;
        if (a.packageName === null) return 1;
        if (b.packageName === null) return -1;
        // 调用中文默认排序，以拼音排序
        return a.packageName.localeCompare(b.packageName);
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
      title: '项目',
      dataIndex: 'projects',
      // width: 2000,
      width: 220,
      resizable: true,
      ellipsis: true,
      // helpMessage: '检测人所涉及的检验项目，颜色代表不同状态',
      // ellipsis: true,
    },
    {
      title: '用户组名',
      dataIndex: 'userGroupName', //'user_group_name',
      width: 100,
      ifShow: userStore.userInfo?.isSuper,
      resizable: true,
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
      title: '价格总和',
      dataIndex: 'totalPrice',
      width: 100,
      resizable: true,
      sorter: (a, b) => {
        // 处理null值情况，将null值排在最后
        if (a.totalPrice === null && b.totalPrice === null) return 0;
        if (a.totalPrice === null) return 1;
        if (b.totalPrice === null) return -1;
        return a.totalPrice - b.totalPrice;
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
      title: '折扣价格总和',
      dataIndex: 'totalDiscountedPrice',
      width: 150,
      ifShow: userStore.userInfo?.isSuper,
      resizable: true,
      sorter: (a, b) => {
        // 处理null值情况，将null值排在最后
        if (a.totalDiscountedPrice === null && b.totalDiscountedPrice === null) return 0;
        if (a.totalDiscountedPrice === null) return 1;
        if (b.totalDiscountedPrice === null) return -1;
        return a.totalDiscountedPrice - b.totalDiscountedPrice;
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
      resizable: true,
      ellipsis: true,
      width: 200, // 该列不需要做宽度限制
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
    api: getPackageListApi,
    // 项目表格列名
    columns: packageTableSchema,
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

  /** 新增套餐 */
  function AddPackage() {
    openModal(true, {
      moadlType: MoadlType.ADD_PACKAGE,
      projects: getDataSource(),
    });
  }

  /** 编辑套餐信息 */
  function handleEdit(record: Recordable, column) {
    // console.log('record:', record);
    // console.log('column:', column);
    openModalOpearate(true, {
      moadlType: MoadlType.MODIFY_PACKAGE,
      record,
      // projects: getDataSource(),
      // isSuper: userStore.userInfo?.isSuper,
    });
  }

  /** 删除 */
  async function handleDeletes() {
    // if (!userStore.userInfo?.isSuper) {
    //   error('只有超级管理员可以删除');
    // }
    if (unref(getRowSelection().selectedRowKeys)?.length === 0) {
      error('请勾选至少一个数据');
      return;
    }
    // console.log('getForm:', getForm());
    // console.log('getRowSelection().selectedRowKeys:', getRowSelection().selectedRowKeys);
    const ids = getRowSelection().selectedRowKeys;
    // console.log('ids:', ids);

    // console.log(ids);
    if (ids?.length > 0) {
      const data = await deletePackageApi({ packageIds: ids });
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

  /** 导出 */
  // function exportExcel() {
  //   // 默认Object.keys(data[0])作为header
  //   const data = JSON.parse(JSON.stringify(getDataSource()));
  //   console.log(data);
  //   // 处理值映射
  //   data.forEach((item) => {
  //     // delete item.fileId;
  //     // item.consumableType = projectConsumableTypeMap(item.consumableType);
  //   });
  //   const header = {
  //     id: 'ID',
  //     projectName: '套餐名',
  //     userGroupName: '用户组名',
  //   };
  //   console.log('table_data: ', data);
  //   jsonToSheetXlsx({
  //     data,
  //     header,
  //     // filename: '样本_' + sampleData.value.name + '_项目数据.xlsx',
  //     filename: '套餐管理数据.xlsx',
  //   });
  // }
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
