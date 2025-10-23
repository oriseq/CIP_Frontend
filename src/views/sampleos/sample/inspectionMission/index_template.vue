<template>
  <PageWrapper fixedHeight dense contentBackground contentFullHeight contentClass="flex">
    <a-drawer
      v-model:open="open"
      class="custom-class"
      root-class-name="root-class-name"
      :root-style="{ color: 'blue' }"
      style="color: red"
      title=""
      size="large"
      width="1050"
      placement="right"
      @after-open-change="afterOpenChange"
    >
      <!-- 传入sampleId到子组件 -->
      <AttachmentManager
        :sampleId="sampleId"
        :annexFileId="annexFileId"
        v-if="drawerTitle === '附件管理'"
      />
      <ReportManager :sampleId="sampleId" v-if="drawerTitle === '报告管理'" />
    </a-drawer>
    <BasicTable @register="registerTable">
      <template #form-custom> custom-slot </template>
      <template #collapse-panel>
        <a-collapse
          v-model:activeKey="activeKey"
          :bordered="false"
          :ghost="true"
          @change="handleCollapseChange"
        >
          <a-collapse-panel key="1" header="送检任务汇总">
            <div style="margin-right: 10%; margin-left: 1%">
              <Description
                size="default"
                :bordered="true"
                :data="summaryOfInspectionTasks"
                :schema="ProjectSchema"
              />
            </div>
          </a-collapse-panel>
        </a-collapse>
      </template>
      <template #tableTitle>
        <a-row :gutter="[8, 8]">
          <a-col>
            <a-button type="primary" @click="subNewSample">提交新样本</a-button>
          </a-col>
          <a-col>
            <div style="position: relative">
              <a-button type="primary" @click="toggleExportOptions">导出</a-button>
              <div
                v-if="showExportOptions"
                class="export-options"
                style="position: absolute; z-index: 1000; top: 36px; left: 0"
                @mouseleave="hideExportOptions"
              >
                <div @click="handleExport('TypeAll')" class="export_options_sub">按项目 - 所有</div>
                <div @click="handleExport('TypeOut')" class="export_options_sub"
                  >按项目 - 仅外送项目</div
                >
                <div @click="handleExport('TypeIn')" class="export_options_sub"
                  >按项目 - 仅自检项目</div
                >
                <div @click="handleExport('all')" class="export_options_sub">按样本 - 所有</div>
                <div @click="handleExport('instrument')" class="export_options_sub"
                  >按样本 - 指定仪器</div
                >
              </div>
            </div>
          </a-col>
          <a-col>
            <div style="position: relative">
              <a-button type="primary" @click="toggleModifySampleStatus">修改样本状态</a-button>
              <div
                v-if="showModifySampleStatus"
                class="export-options"
                style="position: absolute; z-index: 1000; top: 36px; left: 0"
                @mouseleave="hideModifySampleStatus"
              >
                <div @click="modifySampleStatus('onlyProject')" class="export_options_sub"
                  >按项目修改</div
                >
                <div @click="modifySampleStatus('instrument')" class="export_options_sub"
                  >按仪器修改</div
                >
              </div>
            </div>
          </a-col>
          <!-- <a-col>
            <a-button type="primary" @click="sampleTransfer">样本过户</a-button>
          </a-col>
          <a-col>
            <a-button type="primary" @click="sampleHosting">样本代管</a-button>
          </a-col> -->
          <a-col>
            <a-popconfirm
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

        <!-- <ImpExcel
            style="display: inline-block"
            @success="loadDataSuccess"
            dateFormat="YYYY-MM-DD"
          >
            <a-button class="mr-ri-8" type="primary"> 导入 </a-button>
          </ImpExcel> -->
        <!-- <a-button class="mr-ri-8" type="primary" @click="handleCreate">导入</a-button> -->
      </template>
      <!-- <template #headerTop>yyyyyyjj</template> -->

      <!-- <template #toolbar>
        <a-button type="primary" @click="modifySampleStatus">修改样本状态</a-button>
        <a-button type="primary" @click="sampleTransfer">样本过户</a-button>
        <a-button type="primary" @click="sampleHosting">样本代管</a-button>
        <a-popconfirm title="确认删除吗？" ok-text="是" cancel-text="否" @confirm="handleDeletes">
          <template #icon><question-circle-outlined style="color: red" /></template>
          <a-button type="primary" danger>删除</a-button>
        </a-popconfirm>
      </template> -->
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.key === 'id'">
          <!--          判断已删除的样式设置优先-->
          <ABadgeRibbon v-if="record.del" :text="'已删除'" :color="'#7c7c84'" placement="start">
            <a-card title=" " size="small">{{ text }}</a-card>
          </ABadgeRibbon>
          <ABadgeRibbon
            v-else
            :text="getSampleHostingStatusCh(record.sampleHostingStatus, record.status)?.text"
            :color="getSampleHostingStatusCh(record.sampleHostingStatus, record.status)?.color"
            placement="start"
          >
            <a-card title=" " size="small">{{ text }}</a-card>
          </ABadgeRibbon>
        </template>
        <template v-if="column.key === 'projects'">
          <div
            style="margin: 3px 0"
            v-for="(item, index) in text.slice(0, 5)"
            :key="item.projectId"
          >
            <Tag
              :color="getTagColor(item.projectStatus)"
              :title="sampleProjectStatusMapping(item.projectStatus)"
            >
              {{ item.projectName }}
            </Tag>
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
                  :style="{ width: '30px', color: 'White' }"
                  :ellipsis="{
                    tooltip: '...',
                  }"
                  :content="`all all`"
                >
                  <template #ellipsisTooltip>
                    <div class="custom-tooltip-content">
                      <span v-for="(item, idx) in text" :key="item.id"
                        >{{ idx + 1 }}. {{ item.projectName }} 【{{
                          sampleProjectStatusMapping(item.projectStatus)
                        }}】<br
                      /></span>
                    </div>
                  </template>
                </a-typography-text>
              </div>
            </Tag>
          </div>
        </template>
        <template v-if="column.key === 'projectStatusStatistics'">
          <div v-if="record.projectStatusStatistics">
            <div
              style="margin: 3px 0"
              v-for="(item, index) in filteredTextFn(record.projectStatusStatistics)"
              :key="item.count"
            >
              <Badge
                :style="{ verticalAlign: 'text-bottom' }"
                :count="item.count"
                :numberStyle="{ backgroundColor: getTagColor(item.status) }"
                :showZero="false"
              />
              &nbsp;
              <span>{{ sampleProjectStatusMapping(item.status) }}</span>
            </div>
          </div>
          <div v-else>
            <span>无</span>
          </div>
        </template>
        <template v-if="column.key === 'logisticsInformation'">
          <a-typography-text
            :style="{ width: '150px', color: 'while' }"
            :ellipsis="{ tooltip: `${text}` }"
            :content="`${text ? text : ''}`"
          />
        </template>
        <template v-if="column.key === 'fileInfo'">
          <template v-if="text?.imgUrls">
            <FileImageDisplay :urls="text?.imgUrls" />
          </template>
          <template v-if="text?.otherFiles">
            <div
              class="m-0.1 tag-file"
              v-for="(item, index) in text?.otherFiles"
              :key="column.dataIndex + '_' + index"
            >
              <Tag
                class="ellipsis-tag"
                :color="getColor(item.name)"
                :title="item.name"
                @click="openLink(item.url)"
              >
                {{ item.name }}
              </Tag>
            </div>
          </template>
        </template>
        <template v-if="column.key === 'action'">
          <TableAction
            stopButtonPropagation
            :actions="[
              {
                icon: 'clarity:info-standard-line',
                tooltip: '查看项目详情',
                onClick: handleDeatil.bind(null, record, column),
              },
              {
                icon: 'clarity:note-edit-line',
                tooltip: '编辑信息',
                onClick: handleEdit.bind(null, record, column),
              },
              {
                icon: 'ant-design:paper-clip-outlined',
                tooltip: '报告管理',
                onClick: showReportMngDrawer.bind(null, record, column),
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
            ]"
            :dropDownActions="[
              {
                icon: `ant-design:search-outlined`,
                tooltip: '查看物流',
                label: '查看物流',
                onClick: checklogistics.bind(null, record, column),
              },
              {
                icon: 'ant-design:file-exclamation-filled',
                tooltip: '附件管理',
                label: '附件管理',
                onClick: showFileDrawer.bind(null, record, column),
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <inspectionMissionModal
      @register="registerModal"
      @success="handleSuccess"
      :maskClosable="false"
    />
    <UpdateModal @register="registerModalUpdate" @success="handleSuccess" :maskClosable="false" />
    <CheckLogisticsModal
      @register="registerLogisticsModal"
      @success="handleSuccess"
      :maskClosable="false"
    />
    <UploadModal @register="registerUploadModal" @success="handleSuccess" :maskClosable="false" />
  </PageWrapper>
</template>

<script setup lang="ts">
  import { BasicTable, useTable, BasicColumn } from '@/components/Table';
  import { ref, h, unref, onMounted, watch, nextTick } from 'vue';
  import { Badge, Tag } from 'ant-design-vue';
  import dayjs from 'dayjs';
  import { useModal } from '@/components/Modal';
  import {
    listApi,
    deleteApi,
    MoadlType,
    noHostingApi,
    getProjectListApi,
    improtSampleApi,
    getFile,
    getUserGroupInfoApi,
    getSampleProjStatusApi,
    getSampleFormApi,
    summaryOfInspectionTasksApi,
    InstrumentTypeApi,
    DeliveryUnitApi,
    getExportColumnApi,
  } from './inspectionMissionApi';
  import { ProjectSchema } from './data';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import inspectionMissionModal from './inspectionMissionModal.vue';
  import UpdateModal from './UpdateModal.vue';
  import CheckLogisticsModal from './CheckLogisticsModal.vue';
  import UploadModal from './UploadModal.vue';
  import { defHttpForRes, defHttp } from '@/utils/http/axios';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useUserStore } from '@/store/modules/user';
  import { useGo } from '@/hooks/web/usePage';
  import { jsonToSheetXlsx, ImpExcel, ExcelData } from '@/components/Excel';
  import {
    sampleStatusMapping,
    sampleSexMapping,
    sampleFieldMapping,
    reSampleSexMapping,
    getTagColor,
    sampleProjectStatusMapping,
    getColor,
    getFileExtension,
    MissionMngColumns,
  } from './fieldMapping';
  import { tr } from 'element-plus/es/locale/index.mjs';
  import { color } from 'echarts';
  import { useGlobSetting } from '@/hooks/setting';
  import { downloadByData } from '@/utils/file/download';
  import AttachmentManager from '@/components/Extend/AttachmentManager/AttachmentManager.vue';
  import ReportManager from './reportingManager/ReportManager.vue';
  import FileImageDisplay from './FileImageDisplay.vue';
  import { Description } from '@/components/Description';
  import { getSampleStatusColor, projectStatusOptions } from './data.tsx';

  defineOptions({
    name: 'InspectionMission',
  });

  const props = defineProps({ inspectionScene: { type: String } });

  const { apiUrl } = useGlobSetting();

  const userStore = useUserStore();
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const showFullText = ref(false);

  const [registerModal, { openModal }] = useModal();

  const [registerModalUpdate, { openModal: openModalUpdate }] = useModal();

  const [registerLogisticsModal, { openModal: openModalLogistics }] = useModal();

  const [registerUploadModal, { openModal: openModalUpload }] = useModal();

  const activeKey = ref(['']);
  // 折叠面板改变触发表格重置高度
  const handleCollapseChange = () => {
    nextTick(() => {
      setTimeout(() => {
        redoHeight();
      }, 300);
    });
  };

  let fullFormConfig = ref();
  const summaryOfInspectionTasks = ref();

  // onMounted(async () => {
  //   let rsp = await summaryOfInspectionTasksApi(null);
  //   // console.log('rsp:', rsp);
  //   summaryOfInspectionTasks.value = rsp.result;
  //   // console.log('summaryOfInspectionTasks:', summaryOfInspectionTasks);
  // });

  let TableHeader = {}; // 导出表格的列名
  let instrumentNameInput = ref<string>(); // 仪器名称

  const filteredTextFn = (data) => {
    return data.filter((item) => item.count > 0).sort((a, b) => b.count - a.count);
  };

  const [
    registerTable,
    {
      getForm,
      updateTableDataRecord,
      clearSelectedRowKeys,
      reload,
      getRowSelection,
      getDataSource,
      getSelectRows,
      redoHeight,
    },
  ] = useTable({
    // title: '开启搜索区域',
    api: (params) => {
      /** 搜集搜索栏填写参数 */
      fullFormConfig.value = params;
      // console.log('fullFormConfig.value', params);

      params['inspectionScene'] = props.inspectionScene;

      /** 减少sampleInformation的调用次数，并收集项目状态 */
      let rsp = listApi(params);

      // rsp.then((data) => {
      //   projectData.value = data.records.map((item) => item.status);
      // });
      return rsp;
    },
    fetchSetting: {
      listField: 'records',
    },
    defSort: {
      field: 'submission_time',
      order: 'descend',
    },
    bordered: true,
    striped: false,
    sortFn: (sortInfo) => {
      // console.log('sortInfo: ', sortInfo);
      const sortMap = {
        id: 'id',
        sampleId: 'sample_id',
        submitNumberToday: 'submit_number_today',
        name: 'name',
        age: 'age',
        birthday: 'birthday',
        sampleUserGroupName: 'sample_user_group_name',
        projectsNum: 'project_count',
        submissionTime: 'submission_time',
        updateTime: 'update_time',
      };

      const { order, columnKey } = sortInfo;
      return {
        field: sortMap[columnKey],
        order,
      };
    },
    columns: MissionMngColumns,
    useSearchForm: true,
    // 分页的默认设置
    // pagination: {
    //   total: 1000,
    //   current:2,
    //   pageSize: 30
    // },
    // afterFetch(info) {
    //   console.log('afterFetch', info);
    //   return info;
    // },
    // handleSearchInfoFn(info) {
    //   console.log('handleSearchInfoFn', info);
    //   return null;
    // },
    beforeFetch(info) {
      // console.log('beforeFetch', info);
      const processDateRange = (dateRange: string[]) => {
        if (!dateRange || dateRange.length !== 2) return null;

        return [
          dayjs(dateRange[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
          dayjs(dateRange[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        ];
      };

      // 处理提交时间
      if (info.submissionTime) {
        info.submissionTime = processDateRange(info.submissionTime);
      }

      // 处理更新时间
      if (info.updateTime) {
        info.updateTime = processDateRange(info.updateTime);
      }
      return info;
    },
    // fetchSetting:,
    formConfig: {
      // labelWidth: 100,
      // baseColProps: { span: 8 },
      autoAdvancedLine: 1,
      alwaysShowLines: 1,
      actionColOptions: {
        span: 3,
        style: { textAlign: 'right' },
      },
      schemas: [
        {
          field: `name`,
          label: `姓名`,
          component: 'Input',
          labelWidth: '40px',
          colProps: {
            span: 3,
          },
        },
        {
          field: 'sampleId',
          component: 'Input',
          label: '样本编号',
          labelWidth: '80px',
          colProps: { span: 4 },
          componentProps: {},
        },
        {
          field: 'sex',
          component: 'Select',
          label: '性别',
          labelWidth: '50px',
          colProps: {
            span: 2,
          },
          componentProps: {
            options: [
              {
                label: '男',
                value: '1',
                key: '1',
              },
              {
                label: '女',
                value: '2',
                key: '2',
              },
              {
                label: '未知',
                value: '3',
                key: '3',
              },
            ],
          },
        },
        {
          field: `age`,
          label: `年龄`,
          component: 'InputNumber',
          labelWidth: '50px',
          componentProps: {
            min: 0,
          },
          colProps: {
            span: 2,
          },
        },
        {
          field: 'birthday',
          component: 'DatePicker',
          ifShow: () => false,
          label: '出生日期',
          labelWidth: '80px',
          colProps: {
            span: 4,
          },
        },
        {
          field: 'sampleUserGroupId',
          component: 'ApiSelect',
          label: '送检单位',
          labelWidth: '80px',
          ifShow: userStore.userInfo?.isInternalGroup,
          colProps: { span: 3 },
          componentProps: {
            api: async () => {
              const rsp = await getUserGroupInfoApi({ scene: 'fillIn' });
              return rsp.result;
            },
            resultField: 'result',
            labelField: 'groupName',
            valueField: 'id',
            showSearch: true,
            filterOption: (inputValue, option) => {
              return option.label.includes(inputValue);
            },
          },
        },
        {
          field: `instrumentIds`,
          label: `仪器`,
          component: 'ApiSelect',
          labelWidth: '50px',
          colProps: {
            span: 3,
          },
          componentProps: {
            api: InstrumentTypeApi,
            resultField: 'result',
            labelField: 'name',
            valueField: 'id',
            mode: 'multiple',
            showSearch: true,
            filterOption: (inputValue, option) => {
              return option.label.includes(inputValue);
            },
          },
        },
        {
          field: `deliveryUnits`,
          label: `外送单位`,
          component: 'ApiSelect',
          labelWidth: '60px',
          colProps: {
            span: 3,
          },
          componentProps: {
            api: DeliveryUnitApi,
            resultField: 'result',
            labelField: 'name',
            valueField: 'name',
            mode: 'multiple',
            showSearch: true,
            filterOption: (inputValue, option) => {
              return option.label.includes(inputValue);
            },
          },
        },
        {
          field: `projectStatuses`,
          label: `项目状态`,
          component: 'Select',
          labelWidth: '60px',
          colProps: {
            span: 3,
          },
          componentProps: {
            options: projectStatusOptions,
            mode: 'multiple',
            showSearch: true,
            filterOption: (inputValue, option) => {
              return option.label.includes(inputValue);
            },
          },
        },
        {
          field: `projects`,
          label: `项目`,
          component: 'ApiSelect',
          labelWidth: '40px',
          colProps: {
            span: 10,
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
          label: '样本状态',
          labelWidth: '80px',
          colProps: {
            span: 4,
          },
          componentProps: {
            options: [
              {
                label: '无项目',
                value: '0',
                key: '1',
              },
              {
                label: '无确认项目',
                value: '1',
                key: '2',
              },
              {
                label: '等待检测',
                value: '2',
                key: '3',
              },
              {
                label: '正在检测',
                value: '3',
                key: '4',
              },
              {
                label: '部分完成',
                value: '4',
                key: '5',
              },
              {
                label: '全部完成',
                value: '5',
                key: '6',
              },
            ],
          },
        },
        {
          field: `logisticsTrackingNumber`,
          label: `物流单号`,
          component: 'InputTextArea',
          labelWidth: '80px',
          colProps: {
            span: 5,
          },
          componentProps: {
            placeholder: '请输入物流信息',
            autoSize: true,
            // onChange: (e: any) => {
            //   console.log(e);
            // },
          },
        },
        {
          field: 'submissionTime',
          label: '提交日期',
          component: 'RangePicker',
          labelWidth: '70px',
          componentProps: {
            format: 'YYYY-MM-DD',
            placeholder: ['开始日期', '结束日期'],
            // showTime: { format: 'HH:mm:ss' },
          },
          colProps: {
            // span: 8,
          },
        },
        {
          field: 'updateTime',
          label: '更新日期',
          component: 'RangePicker',
          labelWidth: '70px',
          componentProps: {
            format: 'YYYY-MM-DD',
            placeholder: ['开始日期', '结束日期'],
            // showTime: { format: 'HH:mm:ss' },
          },
          colProps: {
            // xl: 12,
            // xxl: 8,
            // span: 5,
          },
        },
        {
          field: 'remarks',
          component: 'Input',
          label: '备注',
          labelWidth: '45px',
          colProps: { span: 5 },
          componentProps: {},
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
      // submitFunc: handleSubmit,
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
      width: 185,
      dataIndex: 'action',
    },
    clickToRowSelect: false, // 禁用点击行选中功能
    pagination: {
      pageSizeOptions: ['50', '100', '200', '500'],
      pageSize: 50,
      defaultPageSize: 50,
    },
  });

  // function handleEdit(record: Recordable, column) {
  //   console.log('点击了编辑', record);
  //   console.log('点击了编辑', column);
  // }

  /* 
  搜索
*/
  // async function handleSubmit() {
  //   console.log('getForm:', getForm());
  //   console.log('getForm().validate():', getForm().validate());

  //   // await fetch(data);
  // }

  /* 
    操作
   */

  /**
   * 过户
   */
  function sampleTransfer() {
    if (unref(getRowSelection().selectedRowKeys)?.length === 0) {
      error('请勾选至少一个数据');
      return;
    }
    openModal(true, {
      moadlType: MoadlType.SAMPLE_TRANSFER,
      ids: getRowSelection().selectedRowKeys,
      isSuper: userStore.userInfo?.isSuper,
    });
  }

  /**
   * 代管
   */
  function sampleHosting() {
    if (unref(getRowSelection().selectedRowKeys)?.length === 0) {
      error('请勾选至少一个数据');
      return;
    }
    openModal(true, {
      moadlType: MoadlType.SAMPLE_HOSTING,
      ids: getRowSelection().selectedRowKeys,
      isSuper: userStore.userInfo?.isSuper,
    });
  }

  /**
   * 取消代管
   */
  /* async function handleNOHosting() {
    if (unref(getRowSelection().selectedRowKeys)?.length === 0) {
      error('请勾选至少一个数据');
      return;
    }
    // console.log('getForm:', getForm());
    console.log('getRowSelection:', getRowSelection());
    const ids = getRowSelection().selectedRowKeys;
    if (ids?.length > 0) {
      const data = await noHostingApi({ ids: ids });
      console.log('data', data);
      if (data.success) {
        success(data.message);
        reload();
      } else {
        error(data.message);
        return;
      }
      clearSelectedRowKeys();
    }
  }*/

  /* 新增 */
  // function handleCreate() {
  //   // openModal(true, {
  //   //   moadlType: MoadlType.LOGISTICS,
  //   // });
  // }

  function handleSuccess(info) {
    console.log('handleSuccess: info', info);
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

  /** 查看项目详情 */
  function handleDeatil(record: Recordable, column) {
    // console.log('record:', record);
    go({
      name: 'ProjectManagement',
      query: {
        id: record.id,
        name: record.name,
      },
    });
    // console.log('column:', column);
  }

  /** 编辑信息 */
  function handleEdit(record: Recordable, column) {
    // console.log('record:', record);
    // console.log('column:', column);
    openModalUpdate(true, {
      record,
      isUpdate: true,
    });
  }

  /* 删除用户 */
  async function handleDeletes() {
    if (unref(getRowSelection().selectedRowKeys)?.length === 0) {
      error('请勾选至少一个数据');
      return;
    }
    // console.log('getForm:', getForm());
    // console.log('getRowSelection:', getRowSelection());
    const ids = getRowSelection().selectedRowKeys;
    if (ids?.length > 0) {
      const data = await deleteApi({ ids });
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
    const ids = [record.id];
    if (ids?.length > 0) {
      const data = await deleteApi({ ids });
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

  /* 提交新样本 */
  const go = useGo();
  function subNewSample() {
    go('/sample/inspectionForm');
  }

  // const tableListRef = ref<
  //   {
  //     title: string;
  //     columns?: any[];
  //     dataSource?: any[];
  //   }[]
  // >([]);

  /**
   * 导入
   */
  // async function loadDataSuccess(excelDataList: ExcelData[]) {
  //   tableListRef.value = [];
  //   console.log(excelDataList);
  //   let done = false;
  //   for (const excelData of excelDataList) {
  //     const {
  //       TableHeader,
  //       results,
  //       meta: { sheetName },
  //     } = excelData;
  //     const columns: BasicColumn[] = [];
  //     for (const title of TableHeader) {
  //       columns.push({ title, dataIndex: sampleFieldMapping(title) });
  //     }
  //     // results
  //     console.log('results:', results);
  //     const transformData = results.map((item, index) => {
  //       const newItem = {};
  //       // console.log('index:', index + 2);
  //       columns.forEach((column) => {
  //         // console.log('column: ', column);
  //         let key = Object.keys(item).find((key) => key === column.title);
  //         if (column.dataIndex == 'sex' && key != null) {
  //           let value = item[key];
  //           // console.log('value: ', value);
  //           // console.log('key: ', key);

  //           const iv = reSampleSexMapping(value);
  //           if (iv == 0) {
  //             error(
  //               '第' + (index + 2) + '行，《' + key + '》列出问题，只能填入是"男"、"女"、"未知"',
  //             );
  //             done = true;
  //             return;
  //           } else if (value != null && value != '') {
  //             item[key] = iv;
  //           }
  //         }
  //         newItem[column.dataIndex] = item[key];
  //       });
  //       return newItem;
  //     });
  //     // console.log('transformData:', transformData);
  //     tableListRef.value.push({ title: sheetName, dataSource: transformData, columns });
  //   }

  //   // 发请求到后端
  //   if (!done) {
  //     console.log('发送请求');
  //     const data = await improtSampleApi(tableListRef.value[0]);
  //     console.log('data', data);
  //     if (data.success) {
  //       success(data.message);
  //     } else {
  //       error(data.message);
  //       return;
  //     }
  //   }
  //   console.log('tableListRef: ', tableListRef);
  // }

  // interface sampleHostingStatusBadge{
  //
  //
  // }
  /**
   * 获取代管代码的样式数据
   * @param sampleHostingStatus
   */
  function getSampleHostingStatusCh(sampleHostingStatus, status) {
    if (sampleHostingStatus == '1') {
      return {
        text: '代管',
        color: 'green',
      };
    } else if (sampleHostingStatus == '2') {
      return {
        text: '已代管',
        color: 'pink',
      };
    } else if (sampleHostingStatus == '3') {
      return {
        text: sampleStatusProcess(status),
        color: getSampleStatusColor(status),
      };
    }
  }

  /** 查看物流信息弹窗 */
  function checklogistics(record: Recordable, column) {
    // console.log('handlelogistics-record', record);
    // console.log('handlelogistics-column', column);
    openModalLogistics(true, {
      moadlType: MoadlType.CHEAK_LOGISITICS,
      record,
      // isUpdate: true,
      isSuper: userStore.userInfo?.isSuper,
    });
  }

  /**
   * 文件预览或下载
   * 1. 文件预览：contentType 包含 image/、application/pdf、text/、video/、audio/
   * 2. 使用js操作
   * @param response
   */
  const handleFilePreview = (response: any) => {
    const contentType = response.headers['content-type'];
    const contentDisposition = response.headers['content-disposition'];
    let fileName = '';
    if (contentDisposition) {
      fileName = contentDisposition.split('filename="')[1];
      if (fileName) {
        fileName = fileName.slice(0, -1);
      }
    }
    const decodedFileName = decodeURIComponent(fileName || 'download.file');
    const previewTypes = ['image/', 'application/pdf', 'text/', 'video/', 'audio/'];
    const canPreview = previewTypes.some((type) => contentType.startsWith(type));

    const file = new File([response.data], decodedFileName, { type: contentType });
    const blobUrl = URL.createObjectURL(file);

    const link = document.createElement('a');
    link.href = blobUrl;

    if (canPreview) {
      link.target = '_blank';
      link.setAttribute('type', contentType);
    } else {
      link.download = decodedFileName;
    }

    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  function openLink(url) {
    /*const urlSuffx = apiUrl + '/file/';
    // 打开外链
    window.open(urlSuffx + url, '_blank');*/
    // 使用getFile(url)得到文件访问
    getFile(url).then(handleFilePreview);
  }

  /*
   * 文件处理
   * */
  const open = ref<boolean>(false);
  const sampleId = ref<number>();
  const annexFileId = ref<string | undefined>(undefined);
  const drawerTitle = ref();
  const reportId = ref<string | undefined>(undefined);

  const openDrawSwitch = ref<boolean>(false);
  const afterOpenChange = (bool: boolean) => {
    // console.log('afterOpenChange-open', bool);
    openDrawSwitch.value = bool;
    if (!bool) {
      // console.log('annexFileId changed, reloading table...');
      reload();
    }
  };
  const showFileDrawer = (record: Recordable, column) => {
    // console.log('showFileDrawer-record', record);
    // console.log('showFileDrawer-column', column);
    sampleId.value = record.id;
    annexFileId.value = record.annexFileId;
    open.value = true;
    drawerTitle.value = '附件管理';
  };

  const showReportMngDrawer = (record: Recordable, column) => {
    // console.log('showReportMngDrawer-record', record);
    // console.log('showReportMngDrawer-column', column);
    sampleId.value = record.id;
    reportId.value = record.reportId;
    open.value = true;
    drawerTitle.value = '报告管理';
  };

  /** 样本状态浮窗文本处理 */
  function sampleStatusProcess(text) {
    switch (text) {
      case 0:
        return '无项目';
      case 1:
        return '无确认项目';
      case 2:
        return '等待检测';
      case 3:
        return '正在检测';
      case 4:
        return '部分完成';
      case 5:
        return '全部完成';
      default:
        return text;
      // code block
    }
  }

  // 获取当前时间
  function getCurrentTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  // 修改样本状态
  const showModifySampleStatus = ref(false);
  const toggleModifySampleStatus = () => {
    showModifySampleStatus.value = !showModifySampleStatus.value;
  };
  const hideModifySampleStatus = () => {
    showModifySampleStatus.value = false;
  };
  function modifySampleStatus(modifyStatusOption: string) {
    // 根据提供的选项，触发弹窗中的项目列表的接口
    if (unref(getRowSelection().selectedRowKeys)?.length === 0) {
      error('请勾选至少一个数据');
      return;
    }
    openModal(true, {
      moadlType: MoadlType.MODIFY_STATUS,
      ids: getRowSelection().selectedRowKeys,
      modifyType: modifyStatusOption,
    });
  }

  // 导出
  const showExportOptions = ref(false);
  const toggleExportOptions = () => {
    showExportOptions.value = !showExportOptions.value;
  };
  const hideExportOptions = () => {
    showExportOptions.value = false;
  };
  function handleExport(option) {
    try {
      exportTableDataToExcel(option);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }
  /** 获取导出条件参数 */
  function exportConditionOptionFunc(option) {
    /**
     * all：    全部（全表）
     * TypeAll：分类 - 全部（项目拆开）
     * TypeOut：分类 - 仅外送（项目拆开）
     * TypeIn： 分类 - 仅自检（项目拆开）
     */
    if (option === 'all') {
      return 1;
    } else if (option === 'TypeAll') {
      return 2;
    } else if (option === 'TypeOut') {
      return 3;
    } else if (option === 'TypeIn') {
      return 4;
    } else if (option === 'instrument') {
      return 5;
    }
  }
  /** 根据导出条件参数，指定文件名需要带的名称 */
  function outFilename(condtionNumber, intrumentName: string | undefined) {
    /**
     * 1.全部（全表）
     * 2.分类 - 全部（项目拆开）
     * 3.分类 - 仅外送（项目拆开）
     * 4.分类 - 仅自检（项目拆开）
     */
    switch (condtionNumber) {
      case 2:
        return `送检任务管理表_分类所有项目_${getCurrentTime()}.xlsx`;
      case 3:
        return `送检任务管理表_分类仅外送_${getCurrentTime()}.xlsx`;
      case 4:
        return `送检任务管理表_分类仅自检_${getCurrentTime()}.xlsx`;
      case 1:
        return `送检任务管理表_不分类_${getCurrentTime()}.xlsx`;
      case 5:
        // 仪器看看能不能搞成命名
        return `送检任务管理表_${intrumentName}_${getCurrentTime()}.xls`;
    }
  }

  // 导出全部的列
  const allCols = MissionMngColumns.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.dataIndex]: curr.title,
    }),
    {} as Record<string, string>,
  );
  /** 根据导出分类，获取不同的列名 */
  function getTableHeader(option, targetCols) {
    if (option == 'all') {
      // 删除出生日期和代管用户列
      delete allCols.birthday;
      delete allCols.managedUsers;
      return allCols;
    } else {
      // 根据需要导出的目标列，从全部的列中选择目标的对象
      return Object.entries(allCols)
        .filter((item) => targetCols.includes(item[0]))
        .reduce((acc, cur) => {
          acc[cur[0]] = cur[1];
          return acc;
        }, {});
    }
  }

  /** 通过指定表格列数组获取表格数据 */
  function filterByKeys(data: any[], keys: string[]) {
    return data.map((item) =>
      keys.reduce(
        (acc, key) => {
          if (item.hasOwnProperty(key)) {
            acc[key] = item[key];
          } else if (key == 'empty') {
            acc['empty'] = null;
          }
          return acc;
        },
        {} as Record<string, any>,
      ),
    );
  }

  /** 替换对象中的键 */
  function replaceKeyAtPosition(arr, obj, replaceTarget: string, afterReplace: string) {
    // 1. 在数组中查找"projects"的位置
    const index = arr.indexOf(replaceTarget);

    // 如果没找到，直接返回原对象
    if (index === -1 || index >= Object.keys(obj).length) {
      return obj;
    }

    // 2. 获取对象的所有键
    const keys = Object.keys(obj);

    // 3. 创建新对象，替换指定位置的键
    const newObj = {};

    keys.forEach((key, i) => {
      if (i === index) {
        newObj[afterReplace] = obj[key]; // 替换键为"projectName"
      } else {
        newObj[key] = obj[key]; // 其他键保持不变
      }
    });
    return newObj;
  }

  /** 存在空列需要加入 */
  function addEmptyCol(exportFields, TableHeader) {
    const emptyIndex = exportFields.indexOf('empty');
    if (emptyIndex !== -1) {
      const entries = Object.entries(TableHeader);
      if (emptyIndex <= entries.length) {
        entries.splice(emptyIndex, 0, ['empty', '（空）']);
      } else {
        entries.push(['empty', '（空）']);
      }
      TableHeader = Object.fromEntries(entries);
    }
    return TableHeader;
  }

  async function exportTableDataToExcel(option) {
    // 导出表格数据前的配置
    let condtionNumber = exportConditionOptionFunc(option);
    const getIds = getSelectRows().map((item) => item.id);
    const formData = {
      exportCondition: condtionNumber,
      sampleIds: getIds,
      ...fullFormConfig.value, // 搜索栏填写的参数
    };

    // 0. 检查当前是否导出仪器，是将检查仪器是否被选，没选将会报出提示，并且不继续执行以下获取数据的步骤
    if (option === 'instrument' && !formData.instrumentIds) {
      error('导出含仪器的项目样本，需要在搜索栏选择并点击查询一种“仪器”');
      return;
    } else if (option === 'instrument' && formData.instrumentIds.length > 1) {
      error('只能导出一种仪器的项目样本，请重新选择仪器');
      return;
    }

    // 1. 获取导出列名
    if (option === 'all') {
      // 不分类的列名全部导出
      TableHeader = getTableHeader('all', null);
    } else if (option === 'instrument') {
      // 仪器的导出列以及数据通过接口获取
      let ResponseTableHeaderColIds = await getExportColumnApi(formData.instrumentIds[0]);
      let exportFields = ResponseTableHeaderColIds.result.exportFields;
      // 获取仪器名称
      instrumentNameInput.value = ResponseTableHeaderColIds.result.name;
      TableHeader = getTableHeader(option, exportFields);
      // 将projects替换为projectName
      TableHeader = replaceKeyAtPosition(exportFields, TableHeader, 'projects', 'projectName');
      // 检查空列是否在导出列中
      TableHeader = addEmptyCol(exportFields, TableHeader);
    } else {
      // 其它的分类数据列
      TableHeader = {
        ...getTableHeader(option, ['submitNumberToday', 'name', 'sex', 'age']),
        projectName: '项目', // 这个字段在任务管理列没有，属于导出数据的接口返回
      };
    }

    // 提交表单前端打印预览
    console.log('exportTableDataToExcel-formData', formData);

    // 2. 添加表格数据
    let { result } = await getSampleFormApi(formData);
    console.log('exportTableDataToExcel-result', result);

    // 3. 处理值(有意义化处理)
    result.forEach((item) => {
      // 样本状态(0有意义)
      if (item.status !== null) {
        item.status = sampleStatusMapping(item.status);
      }
      // 项目状态(0有意义)
      if (item.projectStatus !== null) {
        item.projectStatus = sampleProjectStatusMapping(item.projectStatus);
      }
      // 性别(0有意义)
      if (item.sex !== null) {
        item.sex = sampleSexMapping(item.sex);
      }
      // 项目数量
      if (item.projects) {
        item.projectsNum = item.projects?.length;
      }
      // 项目列表（与数量的处理存在先后，不可替换位置）
      if (item.projects) {
        item.projects = item.projects.map((item) => item.projectName).join('，');
      }
      // 代管样本
      // if (item.managedUsers) {
      //   item.managedUsers = item.managedUsers[0];
      // }
      // 项目状态数量
      if (item.projectStatusStatistics) {
        item.projectStatusStatistics = item.projectStatusStatistics
          .filter((child) => child.count > 0)
          .map((child) => child.count + '个' + sampleProjectStatusMapping(child.status))
          .join(' , ');
      }

      // 物流信息
      if (item.logisticsTrackingNumber) {
        item.logisticsTrackingNumber += ':' + item.phoneNumLastFour;
      }

      // isDeliveryOutside: 是否外送检单位添加deliveryUnit字段
      if (item.isDeliveryOutside && item.deliveryUnit) {
        item.isDeliveryOutside = `${item.isDeliveryOutside}（${item.deliveryUnit}）`;
      }
    });
    if (!userStore.userInfo?.isInternalGroup) {
      const exceptInternalGrop = ['submitNumberToday', 'sampleUserGroupName'];
      exceptInternalGrop.forEach((p) => delete TableHeader[p]);
    }

    // final. 导出数据
    console.log('process-result: ', result);
    if (!['all', 'instrument'].includes(option)) {
      jsonToSheetXlsx({
        data: filterByKeys(result, Object.keys(TableHeader)),
        header: TableHeader,
        filename: outFilename(condtionNumber, null),
        // wch内宽
        diyColumnConfig: {
          submitNumberToday: 14 - 0.1,
          name: 11 - 0.1,
          sex: 5 - 0.1,
          age: 5 - 0.1,
          projectName: 55 - 0.1,
        },
      });
    } else {
      jsonToSheetXlsx({
        data: filterByKeys(result, Object.keys(TableHeader)),
        header: TableHeader,
        filename: outFilename(condtionNumber, instrumentNameInput.value),
      });
    }
  }
  /** 监控搜索栏填写的信息 */
  watch(
    () => fullFormConfig.value,
    (newV) => {
      summaryOfInspectionTasksApi(newV).then((rsp) => {
        if (props.inspectionScene == 'inspection') {
          summaryOfInspectionTasks.value = Object.entries(rsp.result)
            .filter(([key]) => key !== '5')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        } else if (props.inspectionScene == 'archive') {
          summaryOfInspectionTasks.value = Object.entries(rsp.result)
            .filter(([key]) => key === '5')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        } else {
          summaryOfInspectionTasks.value = rsp.result;
        }
      });
    },
  );
</script>

<style scoped lang="scss">
  .mr-ri-8 {
    margin-right: 8px;
  }

  .custom-tooltip-wrapper {
    display: inline-block;
    position: relative;
  }

  .custom-tooltip-content {
    position: absolute;
    z-index: 1;
    left: 50%;
    max-width: 400px;
    max-height: 300px;
    padding: 8px 12px;
    overflow-y: scroll;
    transform: translateX(-50%);
    border-radius: 4px;
    background-color: #333;
    color: #fff;
    font-size: 14px;
    white-space: nowrap;
  }

  .tag-file {
    // margin: auto 5px;
    user-select: none;
  }

  .ellipsis-tag {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .export-options {
    z-index: 1000;
    min-width: 130px;
    padding: 5px 0;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
  }

  .export_options_sub {
    padding: 5px 10px;
    color: black;
    font-size: 11px;
    cursor: pointer;
    user-select: none;
  }

  .export_options_sub:hover {
    background-color: #fcfcc4;
  }
</style>
