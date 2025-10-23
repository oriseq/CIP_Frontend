<template>
  <PageWrapper dense contentBackground contentFullHeight contentClass="flex">
    <!-- <PageWrapper contentBackground > -->
    <!-- title="基本信息" -->

    <!-- 项目的状态数量统计: <a-badge count="2" :number-style="{ backgroundColor: '#7a7e87' }" />取消
    <a-badge count="3" :number-style="{ backgroundColor: '#f499a8' }" />待定
    <a-badge count="5" :number-style="{ backgroundColor: '#f9ca24' }" />确认检测
    <a-badge count="89" :number-style="{ backgroundColor: '#2c7b8a' }" />正在检测
    <a-badge count="2" :number-style="{ backgroundColor: '#3c8521' }" />已完成 -->
    <!-- <Divider /> -->

    <BasicTable @register="registerTable">
      <template #collapse-panel>
        <a-collapse
          v-model:activeKey="activeKey"
          :bordered="false"
          :ghost="true"
          style="padding: 0"
        >
          <a-collapse-panel key="1" header="样本基本信息" style="margin: 0; padding: 0">
            <div style="margin: 0% 10% 0% 1%">
              <Description
                size="default"
                :bordered="true"
                :data="sampleData"
                :schema="sampleSchema"
              />
            </div>
          </a-collapse-panel>
        </a-collapse>
      </template>
      <template #tableTitle>
        <div>
          <a-button class="mr-ri-8" type="primary" @click="handleCreate">新增项目</a-button>
          <!-- <a-button class="mr-ri-8" type="primary" @click="exportExcel">下载导入模板</a-button> -->
          <a-button class="mr-ri-8" type="primary" @click="exportExcel">导出</a-button>
          <!-- <template v-if="!isEscrowSample">
            <a-button class="mr-ri-8" type="primary" @click="sampleTransfer">样本过户</a-button>
            <a-button class="mr-ri-8" type="primary" @click="sampleHosting">样本代管</a-button>
            <a-popconfirm
              title="确认取消吗？"
              ok-text="是"
              cancel-text="否"
              @confirm="handleNOHosting"
            >
              <template #icon><question-circle-outlined style="color: red" /></template>
              <a-button class="mr-ri-8" type="primary">取消代管</a-button>
            </a-popconfirm>
          </template> -->
          <!-- <a-button class="mr-ri-8" type="primary" @click="handleCreate">下载报告</a-button> -->
        </div>
      </template>
      <!-- <template #headerTop>yyyyyyjj</template> -->

      <template #toolbar>
        <a-button
          v-if="userStore.userInfo?.isInternalGroup"
          class="mr-ri-8"
          type="primary"
          @click="handleRecheck"
          >复核</a-button
        >
        <a-popconfirm title="确认删除吗？" ok-text="是" cancel-text="否" @confirm="handleDeletes">
          <template #icon><question-circle-outlined style="color: red" /></template>
          <a-button type="primary" danger>删除</a-button>
        </a-popconfirm>
      </template>
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.key === 'projectName'">
          <!-- <div style="margin: 3px 0" v-for="(item, index) in text" :key="item.projectId">
            <Tag :color="getTagColor(item.projectStatus)">
              {{ item.projectName }}
            </Tag>
            <br />
          </div> -->
          <div style="margin: 3px 0">
            <Tag :color="getTagColor(record.projectStatus)">
              {{ record.projectName }}
            </Tag>
            <br />
          </div>
        </template>
        <template v-if="column.key === 'resultImg' && record.resultImg">
          <!-- <TableImg :size="60" :simpleShow="true" :imgList="ImgList(text)" /> -->
          <FileImageDisplay :urls="ImgList(text)" />
        </template>
        <template v-if="column.key === 'reviewResults'">
          <div style="margin: 3px 0">
            <Tag :color="getReviewResultTag(record.reviewResults)">
              {{ record.reviewResults ? record.reviewResults : '未审核' }}
            </Tag>
          </div>
        </template>
        <template v-if="column.key === 'action'">
          <TableAction
            stopButtonPropagation
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                tooltip: '编辑项目',
                onClick: handleEdit.bind(null, record, column),
              },
              {
                icon: 'ant-design:upload-outlined',
                tooltip: '上传报告',
                onClick: debounce(handleUploadReport.bind(null, record, column), 600, {
                  leading: true,
                  trailing: false,
                }),
              },
              {
                icon: 'ant-design:download-outlined',
                tooltip: '下载报告',
                onClick: debounce(handleDownReport.bind(null, record, column), 600, {
                  leading: true,
                  trailing: false,
                }),
              },
              {
                icon: 'ant-design:delete-outlined',
                color: 'error',
                tooltip: '删除记录',
                popConfirm: {
                  title: '是否确认删除',
                  placement: 'left',
                  confirm: handleDelete.bind(null, record),
                },
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
    <DefaultModal @register="registerModal" @success="handleSuccess" :maskClosable="false" />
    <UploadModal @register="registerModalUpdate" @success="handleSuccess" :maskClosable="false" />
    <CheckLogisticsModal
      @register="registerLogisticsModal"
      @success="handleSuccess"
      :maskClosable="false"
    />
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { Description } from '@/components/Description';
  import { BasicTable, useTable, BasicColumn, TableImg } from '@/components/Table';
  import { PageWrapper } from '@/components/Page';
  import { Divider, notification, Button, TypographyParagraph, Switch, Tag } from 'ant-design-vue';
  import { ref, h, unref, watch } from 'vue';
  import { useModal } from '@/components/Modal';
  import { useRouter, useRoute } from 'vue-router';
  import FileImageDisplay from '../inspectionMission/FileImageDisplay.vue';
  import {
    sampleSchema,
    refundTableSchema,
    refundTableData,
    projectTableSchema,
    getReviewResultTag,
    openModalLogistics,
    registerLogisticsModal,
  } from './data';
  import DefaultModal from './DefaultModal.vue';
  import CheckLogisticsModal from '../inspectionMission/CheckLogisticsModal.vue';
  import {
    sampleStatusMapping,
    sampleSexMapping,
    getTagColor,
    sampleProjectStatusMapping,
    sampleProjectReportResultMapping,
  } from '../inspectionMission/fieldMapping';
  import {
    sampleInfoApi,
    projectsInfoApi,
    deleteApi,
    MoadlType,
    noHostingApi,
    getProjectListApi,
    getFile,
    isEscrowSampleApi,
  } from './pjsMngApi';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useUserStore } from '@/store/modules/user';
  import { defHttp, defHttpForRes, defHttpOrigin } from '@/utils/http/axios';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';

  import { jsonToSheetXlsx, ImpExcel, ExcelData } from '@/components/Excel';
  import UploadModal from './UploadModal.vue';
  import axios from 'axios';
  import { downloadByData } from '@/utils/file/download';
  import { useGlobSetting } from '@/hooks/setting';
  import { isArray } from '@/utils/is';
  import { debounce } from 'lodash-es';

  const { apiUrl } = useGlobSetting();

  const userStore = useUserStore();
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const route = useRoute();
  // console.log('query: ', route.query);
  const sampleId = route.query.id;

  const [registerModal, { openModal }] = useModal();
  const [registerModalUpdate, { openModal: openModalUpload }] = useModal();
  const activeKey = ref(['']);

  /**
   * 一、基本信息
   */
  const sampleData = ref();
  // 样本的基本信息
  sampleInfoApi(sampleId).then((data) => {
    // console.log('sampleInfoApi data: ', data);
    sampleData.value = data;
    // sampleData;
  });

  /**
   * 是否代管用户-对于这个样本
   */
  const isEscrowSample = ref();
  // 样本的基本信息
  isEscrowSampleApi(sampleId).then((data) => {
    // console.log('sampleInfoApi data: ', data);
    isEscrowSample.value = data;
  });

  /**
   * 二、表格
   */

  const [
    registerTable,
    {
      getForm,
      updateTableDataRecord,
      clearSelectedRowKeys,
      reload,
      getRowSelection,
      getDataSource,
    },
  ] = useTable({
    // title: '开启搜索区域',
    api: projectsInfoApi,
    beforeFetch: (param) => {
      // param.put('id', sampleId);
      // console.log('param: ', param);
      param.id = sampleId;
      // sampleId
    },
    striped: false,
    columns: projectTableSchema,
    useSearchForm: true,
    // handleSearchInfoFn(info) {
    //   console.log('handleSearchInfoFn', info);
    //   return null;
    // },
    // beforeFetch(info) {
    //   console.log('beforeFetch', info);
    //   let copyObj = { ...info };
    //   console.log('copyObj', copyObj);
    //   // let time = [...info.submissionTime];
    //   // info.submissionTime = null;
    //   if (copyObj.submissionTime) {
    //     info.submissionTimeCopy = copyObj.submissionTime[0] + '_' + copyObj.submissionTime[1];
    //     info.submissionTime = null;
    //   }
    //   if (copyObj.updateTime) {
    //     info.updateTimeCopy = copyObj.updateTime[0] + '_' + copyObj.updateTime[1];
    //     info.updateTime = null;
    //   }

    //   // return info;
    //   // console.log('beforeFetch', info);
    // },
    // fetchSetting:,
    formConfig: {
      // labelWidth: 70,
      // baseColProps: { span: 8 },
      autoAdvancedLine: 1,
      alwaysShowLines: 1,
      actionColOptions: {
        span: 6,
        style: { textAlign: 'right' },
      },
      schemas: [
        {
          field: `projects`,
          label: `项目`,
          component: 'ApiSelect',
          colProps: {
            span: 8,
          },
          componentProps: {
            api: getProjectListApi,
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
          },
        },
        {
          field: 'status',
          component: 'Select',
          label: '项目状态',
          labelWidth: 100,
          colProps: {
            span: 4,
          },
          componentProps: {
            options: [
              {
                label: sampleProjectStatusMapping(0),
                value: 0,
                key: '1',
              },
              {
                label: sampleProjectStatusMapping(1),
                value: 1,
                key: '2',
              },
              {
                label: sampleProjectStatusMapping(2),
                value: 2,
                key: '3',
              },
              {
                label: sampleProjectStatusMapping(3),
                value: 3,
                key: '4',
              },
              {
                label: sampleProjectStatusMapping(4),
                value: 4,
                key: '5',
              },
            ],
          },
        },
        {
          field: 'remarks',
          component: 'Input',
          label: '备注',
          labelWidth: 70,
          colProps: { span: 6 },
          componentProps: {},
        },
      ],
      // submitFunc: handleSubmit,
    },
    showTableSetting: true,
    tableSetting: { fullScreen: false },
    showIndexColumn: false,
    rowKey: 'projectId',
    rowSelection: {
      type: 'checkbox',
    },
    showSelectionBar: true, // 显示多选状态栏
    actionColumn: {
      title: '操作',
      width: 150,
      dataIndex: 'action',
    },
    clickToRowSelect: false, // 禁用点击行选中功能
  });

  /* 
    操作
   */

  /**
   * 过户
   */
  function sampleTransfer() {
    openModal(true, {
      moadlType: MoadlType.SAMPLE_TRANSFER,
      ids: [sampleId],
      isSuper: userStore.userInfo?.isSuper,
    });
  }

  /**
   * 代管
   */
  function sampleHosting() {
    openModal(true, {
      moadlType: MoadlType.SAMPLE_HOSTING,
      ids: [sampleId],
      isSuper: userStore.userInfo?.isSuper,
    });
  }

  /**
   * 取消代管
   */
  async function handleNOHosting() {
    // console.log('getForm:', getForm());
    // console.log('getRowSelection:', getRowSelection());
    const ids = [sampleId];
    if (ids?.length > 0) {
      const data = await noHostingApi({ ids: ids });
      // console.log('data', data);
      if (data.success) {
        success(data.message);
        reload();
      } else {
        error(data.message);
        return;
      }
      clearSelectedRowKeys();
    }
  }

  /* 新增 */
  function handleCreate() {
    openModal(true, {
      moadlType: MoadlType.ADD_PROJECT,
      projects: getDataSource(),
      sampleId: sampleId,
    });
  }

  /* 编辑 */
  function handleEdit(record: Recordable, column) {
    // console.log('record:', record);
    // console.log('column:', column);
    openModal(true, {
      moadlType: MoadlType.EDIT_PROJECT,
      record,
      sampleId: sampleId,
      isSuper: userStore.userInfo?.isSuper,
      userGroupName: userStore.userInfo?.userGroupName,
    });
  }
  // 上传报告
  function handleUploadReport(record: Recordable, column) {
    // console.log('record:', record);
    // 【优化】判断项目状态，提示无法操作
    // [3,4]   正在检测:3  已完成:4
    if (![2, 3, 4].includes(record.projectStatus)) {
      error('项目状态非确认检测、正在检测或已完成，无法操作');
      return;
    }
    // console.log('column:', column);
    openModalUpload(true, {
      record,
      sampleId: sampleId,
      isSuper: userStore.userInfo?.isSuper,
    });
  }
  // 下载报告
  const handleDownReport = (record: Recordable, column) => {
    // console.log('record:', record);
    if (record.fileId) {
      getFile(record.fileId)
        .then((response) => {
          /* 后端获取命名 */
          // console.log('response: ', response);
          const contentDisposition = response.headers['content-disposition'];
          // console.log('contentDisposition: ', contentDisposition);
          let fileName = '';
          if (contentDisposition) {
            fileName = contentDisposition.split('filename="')[1];
            if (fileName) {
              fileName = fileName.slice(0, -1); // 去除结尾的双引号
            }
          }

          // 命名规则：{姓名}_{项目名连接}.pdf
          // const fileName = sampleData.value.name + '_' + record.projectName + '.pdf';
          downloadByData(response.data, decodeURIComponent(fileName || 'download.file'));

          // const url = window.URL.createObjectURL(new Blob([response.data]));
          // const link = document.createElement('a');
          // link.href = url;
          // link.setAttribute('download', decodeURIComponent(fileName || 'download.file'));
          // document.body.appendChild(link);
          // link.click();
          // link.remove();
        })
        .catch((error) => {
          console.error('Error downloading report:', error);
        });
    } else {
      info('报告未上传');
    }

    // console.log('column:', column);
    // openModalUpload(true, {
    //   record,
    //   sampleId: sampleId,
    //   isSuper: userStore.userInfo?.isSuper,
    // });
    //
    // set
  };

  function handleSuccess() {
    // isUpdate编辑用户
    // if (isUpdate) {
    //   // 不刷新表格直接更新内部数据。
    //   // 注意：updateTableDataRecord要求表格的rowKey属性为string并且存在于每一行的record的keys中
    //   const result = updateTableDataRecord(values.id, values);
    //   console.log(result);
    // } else {
    clearSelectedRowKeys();
    reload();
    // }
  }

  /* 删除用户 */
  async function handleDeletes() {
    if (unref(getRowSelection().selectedRowKeys)?.length === 0) {
      error('请勾选至少一个数据');
      return;
    }
    // console.log('getForm:', getForm());
    // console.log('getRowSelection().selectedRowKeys:', getRowSelection().selectedRowKeys);
    const ids = getRowSelection().selectedRowKeys;
    if (ids?.length > 0) {
      const data = await deleteApi({ sampleId: sampleId, ids });
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
  async function handleDelete(record) {
    // console.log('getForm:', getForm());
    // console.log('record:', record);
    const ids = [record.projectId];
    if (ids?.length > 0) {
      const data = await deleteApi({ sampleId: sampleId, ids });
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

  /**
   * 导出
   */
  function exportExcel() {
    // 默认Object.keys(data[0])作为header
    const data = JSON.parse(JSON.stringify(getDataSource()));
    // 处理值映射
    data.forEach((item) => {
      delete item.fileId;
      delete item.sampleProjectId;
      item.projectStatus = sampleProjectStatusMapping(item.projectStatus);
      // item.polarity = sampleProjectReportResultMapping(item.polarity);
      item.reviewResults = item.reviewResults ? item.reviewResults : '未审核';
      if (!userStore.userInfo?.isInternalGroup) {
        delete item.deliveryUnit;
        delete item.deliveryPerson;
        delete item.resultImg;
      }
    });
    const header = {
      projectId: 'ID   ',
      projectName: '项目名称  ',
      projectStatus: '项目状态    ',
      polarity: '报告结果 ',
      resultImg: '审核图 ',
      deliveryUnit: '外送单位 ',
      deliveryPerson: '外送人 ',
      reviewResults: '复核结果',
      remarks: '备注 ',
      deadline: '截至时间',
    };
    if (!userStore.userInfo?.isInternalGroup) {
      delete header.deliveryUnit;
      delete header.deliveryPerson;
      delete header.resultImg;
    }
    // console.log('table_data: ', data);
    jsonToSheetXlsx({
      data,
      header,
      filename: sampleData.value.name + '_样本项目管理表.xlsx',
    });
  }

  const tableListRef = ref<
    {
      title: string;
      columns?: any[];
      dataSource?: any[];
    }[]
  >([]);

  /** 复核 */
  function handleRecheck() {
    const ids = getRowSelection().selectedRowKeys;
    if (unref(ids)?.length === 0) {
      error('请勾选至少一个数据');
      return;
    }
    openModal(true, {
      moadlType: MoadlType.REVIEW_RESULTS,
      sampleId: sampleId,
      ids: ids,
      isSuper: userStore.userInfo?.isSuper,
    });
  }

  /** 审核图显示 */
  function ImgList(text: any) {
    // let listPath: string[] = ref([]);
    let listPath: string[] = [];
    if (isArray(text)) {
      text.forEach((value) => {
        // listPath.push(apiUrl + '/file/' + value);
        listPath.push(value);
      });
    } else {
      let picList = text.split(',');
      // picList.map((pic) => listPath.push(apiUrl + '/file/' + pic));
      picList.map((pic) => listPath.push(pic));
      // 测试可行
      // listPath.push(apiUrl + '/file/' + '527bcd7861f3b504350223adc42797f5');
    }
    // console.log('ImgList-Func: ', listPath);
    return listPath;
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
