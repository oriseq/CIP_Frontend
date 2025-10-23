<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <!-- <BasicTable @register="registerTable" class="w-3/4 xl:w-5/5"> -->
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <div>
          <ImpExcel
            style="display: inline-block"
            @success="loadDataSuccess"
            dateFormat="YYYY-MM-DD"
          >
            <a-button class="mr-ri-8" type="primary"> 导入 </a-button>
          </ImpExcel>
          <!-- <a-button class="mr-ri-8" type="primary" @click="handleCreate">导入</a-button> -->
          <!-- <a-button class="mr-ri-8" type="primary" @click="exportExcel">下载导入模板</a-button> -->
          <a-button class="mr-ri-8" type="primary" @click="exportExcel">导出</a-button>
        </div>
      </template>
      <!-- <template #headerTop>yyyyyyjj</template> -->

      <template #toolbar>
        <a-popconfirm title="确认取消吗？" ok-text="是" cancel-text="否" @confirm="handleNOHosting">
          <template #icon><question-circle-outlined style="color: red" /></template>
          <a-button type="primary">取消代管</a-button>
        </a-popconfirm>
        <!-- <a-button type="primary" @click="handleCreate">下载报告</a-button> -->
        <!--        <a-popconfirm title="确认删除吗？" ok-text="是" cancel-text="否" @confirm="handleDeletes">-->
        <!--          <template #icon><question-circle-outlined style="color: red" /></template>-->
        <!--          <a-button type="primary" danger>删除</a-button>-->
        <!--        </a-popconfirm>-->
      </template>
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.key === 'id'">
          <ABadgeRibbon
            :text="getSampleHostingStatusCh(record.sampleHostingStatus)?.text"
            :color="getSampleHostingStatusCh(record.sampleHostingStatus)?.color"
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
                    // tooltip: `${text.map((item) => item.projectName).join('，')}`,
                    // tooltip: true,
                    tooltip: '...',
                    // symbol: 'tjunkij',
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
              <!-- {{ text.length - 5 }} more... -->
            </Tag>
          </div>
        </template>
        <template v-if="column.key === 'logisticsInformation'">
          <a-typography-text
            :style="{ width: '150px', color: 'while' }"
            :ellipsis="{ tooltip: `${text}` }"
            :content="`${text ? text : ''}`"
          />
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
                icon: 'ant-design:download-outlined',
                tooltip: '下载报告',
                onClick: handleDownReport.bind(null, record, column),
              },
              // {
              //   icon: 'ant-design:delete-outlined',
              //   color: 'error',
              //   tooltip: '删除记录',
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
    <inspectionMissionModal
      @register="registerModal"
      @success="handleSuccess"
      :maskClosable="false"
    />
    <UpdateModal @register="registerModalUpdate" @success="handleSuccess" :maskClosable="false" />
  </PageWrapper>
</template>

<script setup lang="ts">
  import { BasicTable, useTable, BasicColumn } from '@/components/Table';
  import { ref, h, unref } from 'vue';
  import { useModal } from '@/components/Modal';
  import {
    listApi,
    deleteApi,
    MoadlType,
    noHostingApi,
    getProjectListApi,
    improtSampleApi,
    getUserGroupInfoApi,
    getFile,
  } from './escrowSampleApi';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import inspectionMissionModal from './escrowSampleModal.vue';
  import UpdateModal from './UpdateModal.vue';
  import {
    notification,
    Button,
    TypographyParagraph,
    Switch,
    Tag,
    Avatar,
    TypographyText,
    Tooltip,
  } from 'ant-design-vue';
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
  } from './fieldMapping';
  import { tr } from 'element-plus/es/locale/index.mjs';
  import { color } from 'echarts';
  import { downloadByData } from '@/utils/file/download';

  const userStore = useUserStore();
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const showFullText = ref(false);

  const [registerModal, { openModal }] = useModal();

  const [registerModalUpdate, { openModal: openModalUpdate }] = useModal();

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
    api: listApi,
    fetchSetting: {
      listField: 'records',
    },
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
    columns: [
      {
        title: '编号',
        dataIndex: 'id',
        // fixed: 'left',
        width: 100,
        // ifShow: false,
        resizable: true,
        ellipsis: true,
        sorter: (a, b) => {
          return a.id - b.id;
        },
      },
      {
        title: '样本编号',
        dataIndex: 'sampleId',
        width: 120,
        resizable: true,
        ellipsis: true,
        helpMessage: '样本的唯一编号',
        sorter: (a, b) => {
          if (a.sampleId === null && b.sampleId === null) {
            return 0;
          } else if (a.sampleId === null) {
            return 1;
          } else if (b.sampleId === null) {
            return -1;
          } else {
            return a.sampleId.localeCompare(b.sampleId);
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
        title: '姓名',
        dataIndex: 'name',
        width: 100,
        // filters: [
        //   { text: 'Male', value: 'male' },
        //   { text: 'Female', value: 'female' },
        // ],
        resizable: true,
        ellipsis: true,
        sorter: (a, b) => {
          return a.name.localeCompare(b.name);
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
        title: '性别',
        dataIndex: 'sex',
        width: 60,
        // format: (text, record, index) => {
        //   if (text == 1) {
        //     return '男';
        //   } else if (text == 2) {
        //     return '女';
        //   } else if (text == 3) {
        //     return '未知';
        //   } else {
        //     return text;
        //   }
        // },
        resizable: true,
        ellipsis: true,
        customRender: ({ text }) => {
          return h(Tooltip, { title: genderTextProcess(text) }, () =>
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
              genderTextProcess(text),
            ),
          );
        },
      },
      {
        title: '年龄',
        dataIndex: 'age',
        // sorter: true,
        width: 60,
        resizable: true,
        ellipsis: true,
        sorter: (a, b) => {
          return a.age - b.age;
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
        title: '出生日期',
        dataIndex: 'birthday',
        ifShow: () => false,
        // sorter: true,
        width: 120,
        resizable: true,
        ellipsis: true,
        helpMessage: '检测人出生日期，可能由年龄计算，作为参考',
        sorter: (a, b) => {
          return a.birthday.localeCompare(b.birthday);
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
        title: '送检单位',
        dataIndex: 'sampleUserGroupName',
        width: 110,
        resizable: true,
        ellipsis: true,
        helpMessage: '指定样本归属的单位名称',
        ifShow: userStore.userInfo?.isInternalGroup,
        sorter: (a, b) => {
          if (a.sampleUserGroupName === null && b.sampleUserGroupName === null) {
            return 0;
          } else if (a.sampleUserGroupName === null) {
            return 1;
          } else if (b.sampleUserGroupName === null) {
            return -1;
          } else {
            return a.sampleUserGroupName.localeCompare(b.sampleUserGroupName);
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
        title: '项目',
        dataIndex: 'projects',
        // width: 2000,
        width: 250,
        resizable: true,
        ellipsis: true,
      },
      {
        title: '项目数量',
        dataIndex: 'projectsNum',
        width: 90,
        resizable: true,
        ellipsis: true,
        sorter: (a, b) => {
          return a.projects?.length - b.projects?.length;
        },
        format: (text, record, index) => {
          // console.log('record:', record);
          // console.log('text:', text);
          // console.log('index:', index);
          return record?.projects?.length;
        },
        customRender: ({ text, record, index }) => {
          return h(Tooltip, { title: record?.projects?.length }, () =>
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
              record?.projects?.length,
            ),
          );
        },
      },
      {
        title: '样本状态',
        dataIndex: 'status',
        width: 90,
        resizable: true,
        ellipsis: true,
        helpMessage:
          '样本状态，通过汇总所有检验项目的项目状态，得到的样本综合状态。有以下类型：【无项目】、【无确认项目】、【等待检测】、【正在检测】、【部分完成】、【全部完成】。用户可参考样本综合状态进行行为决策。',
        // format: (text, record, index) => {
        //   /*
        //   样本状态
        //    无项目:0
        //   无确认项目:1
        //   等待检测:2
        //   正在检测:3
        //   部分完成:4
        //   全部完成:5
        //   */
        //   switch (text) {
        //     case 0:
        //       return '无项目';
        //     case 1:
        //       return '无确认项目';
        //     case 2:
        //       return '等待检测';
        //     case 3:
        //       return '正在检测';
        //     case 4:
        //       return '部分完成';
        //     case 5:
        //       return '全部完成';
        //     default:
        //       return text;
        //     // code block
        //   }
        // },
        customRender: ({ text }) => {
          return h(Tooltip, { title: sampleStatusProcess(text) }, () =>
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
              sampleStatusProcess(text),
            ),
          );
        },
      },
      {
        title: '物流信息',
        dataIndex: 'logisticsTrackingNumber',
        width: 150,
        resizable: true,
        ellipsis: true,
        helpMessage: '物流信息: 显示格式{物流单号:手机号后四位}',
        // format: (text, record, index) => {
        //   let result = record?.logisticsTrackingNumber;
        //   if (record?.phoneNumLastFour) {
        //     result += ':' + record?.phoneNumLastFour;
        //   }
        //   return result;
        // },
        customRender: ({ text, record, index }) => {
          return h(Tooltip, { title: logisticsInfoProcess(record) }, () =>
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
              logisticsInfoProcess(record),
            ),
          );
        },
      },
      {
        title: '代管用户',
        dataIndex: 'managedUsers',
        width: 100,
        resizable: true,
        ellipsis: true,
        helpMessage: '表示该样本的授权代管权用户',
        // format: (text, record, index) => {
        //   // console.log("managedUsers text:", text);
        //   let join = text.join(',');
        //   return join;
        // },
        customRender: ({ text }) => {
          return h(Tooltip, { title: text.join(',') }, () =>
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
              text.join(','),
            ),
          );
        },
      },
      {
        title: '附件',
        dataIndex: 'annexPath',
        width: 150,
        resizable: true,
        ellipsis: true,
        ifShow: false,
      },
      {
        title: '提交时间',
        dataIndex: 'submissionTime',
        // sorter: true,
        width: 150,
        resizable: true,
        ellipsis: true,
        sorter: (a, b) => {
          return a.submissionTime.localeCompare(b.submissionTime);
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

      // {
      //   // 用户组可用状态
      //   title: '状态',
      //   dataIndex: 'availStatus',
      // },
      // {
      //   title: '状态',
      //   dataIndex: 'availStatus',
      //   width: 120,
      //   ifShow: userStore.userInfo?.isSuper,
      //   customRender: ({ record }) => {
      //     // console.log('record: ', record);
      //     // if (!Reflect.has(record, 'disabled')) {
      //     //   record.disabled = false;
      //     // }
      //     // return null;
      //     return h(Switch, {
      //       checked: record.availStatus,
      //       checkedChildren: '启用',
      //       unCheckedChildren: '停用',
      //       loading: record.pendingStatus,
      //       // disabled: record.is_super,
      //       async onChange(checkeds) {
      //         record.pendingStatus = true;
      //         if (checkeds) {
      //           record.availStatus = checkeds;
      //           const data = await defHttpForRes.post({
      //             url: '/system/userGroup/userGroup',
      //             params: record,
      //           });
      //           // console.log('data', data);
      //           if (data.success) {
      //             success(`已成功修改状态`);
      //             // record.availStatus = checkeds;
      //           } else {
      //             // const megdetail = data.result.join(',');
      //             error(data.message);
      //           }
      //         } else {
      //           record.availStatus = checkeds;
      //           // console.log('checkeds:', checkeds);
      //           const data = await defHttpForRes.post({
      //             url: '/system/userGroup/userGroup',
      //             params: record,
      //           });
      //           // console.log('data', data);
      //           if (data.success) {
      //             success(`已成功修改状态`);
      //             // record.availStatus = checkeds;
      //           } else {
      //             // const megdetail = data.result.join(',');
      //             error(data.message);
      //           }
      //         }
      //         record.pendingStatus = false;
      //       },
      //     });
      //   },
      // },
    ],
    useSearchForm: true,
    formConfig: {
      // labelWidth: 100,
      // baseColProps: { span: 8 },
      // labelCol: { span: 8 },
      autoAdvancedLine: 1,
      alwaysShowLines: 1,
      actionColOptions: {
        span: 5,
        style: { textAlign: 'right' },
      },
      schemas: [
        {
          field: `name`,
          label: `姓名`,
          component: 'Input',
          // labelWidth: '40px',
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
          colProps: { span: 4 },
          componentProps: {
            api: getUserGroupInfoApi,
            resultField: 'result',
            labelField: 'groupName',
            valueField: 'id',
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
                label: '正在检测',
                value: '2',
                key: '3',
              },
              {
                label: '部分完成',
                value: '3',
                key: '4',
              },
              {
                label: '全部完成',
                value: '4',
                key: '5',
              },
            ],
          },
        },
        {
          field: `logisticsInformation`,
          label: `物流信息`,
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
          label: '提交时间',
          component: 'RangePicker',
          labelWidth: '70px',
          componentProps: {
            format: 'YYYY-MM-DD HH:mm:ss',
            placeholder: ['开始日期、时间', '结束日期、时间'],
            showTime: { format: 'HH:mm:ss' },
          },
          colProps: {
            // span: 7,
          },
        },
        {
          field: 'updateTime',
          label: '更新时间',
          component: 'RangePicker',
          labelWidth: '70px',
          componentProps: {
            format: 'YYYY-MM-DD HH:mm:ss',
            placeholder: ['开始日期、时间', '结束日期、时间'],
            showTime: { format: 'HH:mm:ss' },
          },
          colProps: {
            // xl: 12,
            // xxl: 8,
            // span: 7,
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
      width: 150,
      dataIndex: 'action',
    },
    clickToRowSelect: false, // 禁用点击行选中功能
  });

  /* 新增 */
  function handleCreate() {
    // openModal(true, {
    //   moadlType: MoadlType.LOGISTICS,
    // });
  }

  // 下载报告
  function handleDownReport(record: Recordable, column) {
    console.log('record:', record);
    if (record.reportId) {
      getFile(record.reportId)
        .then((response) => {
          /* 后端获取命名 */
          console.log('response: ', response);
          const contentDisposition = response.headers['content-disposition'];
          console.log('contentDisposition: ', contentDisposition);
          let fileName = '';
          if (contentDisposition) {
            fileName = contentDisposition.split('filename="')[1];
            if (fileName) {
              fileName = fileName.slice(0, -1); // 去除结尾的双引号
            }
          }
          console.log('fileName', fileName);
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
  }

  function handleSuccess({ isUpdate, values }) {
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

  function handleDeatil(record: Recordable, column) {
    console.log('record:', record);
    go({
      name: 'ProjectManagement',
      query: {
        id: record.id,
        name: record.name,
      },
    });
    // console.log('column:', column);
  }

  function handleEdit(record: Recordable, column) {
    console.log('record:', record);
    console.log('column:', column);
    openModalUpdate(true, {
      record,
      isUpdate: true,
    });
  }

  /* 删除用户 */
  // async function handleDeletes() {
  //   if (unref(getRowSelection().selectedRowKeys)?.length === 0) {
  //     error('请勾选至少一个数据');
  //     return;
  //   }
  //   // console.log('getForm:', getForm());
  //   // console.log('getRowSelection:', getRowSelection());
  //   const ids = getRowSelection().selectedRowKeys;
  //   if (ids?.length > 0) {
  //     const data = await deleteApi({ ids });
  //     console.log('data', data);
  //     if (data.success) {
  //       success(data.message);
  //       reload();
  //     } else {
  //       error(data.message);
  //     }
  //     clearSelectedRowKeys();
  //   }
  // }
  // async function handleDelete(record) {
  //   // console.log('getForm:', getForm());
  //   console.log('record:', record);
  //   const ids = [record.id];
  //   if (ids?.length > 0) {
  //     const data = await deleteApi({ ids });
  //     console.log('data', data);
  //     if (data.success) {
  //       success(data.message);
  //       reload();
  //     } else {
  //       error(data.message);
  //       return;
  //     }
  //   }
  // }

  /* 
  提交新样本
*/
  const go = useGo();
  function subNewSample() {
    go('/sample/inspectionForm');
  }

  /**
   * 导出
   */
  function exportExcel() {
    // 默认Object.keys(data[0])作为header
    const data = JSON.parse(JSON.stringify(getDataSource()));
    // 处理值映射
    data.forEach((item) => {
      item.status = sampleStatusMapping(item.status);
      item.sex = sampleSexMapping(item.sex);
      // 项目列表
      if (item.projects) {
        item.projects = item.projects.map((item) => item.projectName).join('，');
      }
    });
    const header = {
      id: 'ID',
      name: '姓名',
      sex: '性别',
      age: '年龄',
      birthday: '出生日期',
      projects: '项目列表',
      status: '状态',
      logisticsInformation: '物流信息',
      annexPath: '附件路径',
      submissionTime: '提交时间',
      updateTime: '更新时间',
    };
    console.log('table_data: ', data);
    jsonToSheetXlsx({
      data,
      header,
      filename: '导出样本数据.xlsx',
    });
  }

  const tableListRef = ref<
    {
      title: string;
      columns?: any[];
      dataSource?: any[];
    }[]
  >([]);

  /**
   * 导入
   */
  async function loadDataSuccess(excelDataList: ExcelData[]) {
    tableListRef.value = [];
    console.log(excelDataList);
    let done = false;
    for (const excelData of excelDataList) {
      const {
        header,
        results,
        meta: { sheetName },
      } = excelData;
      const columns: BasicColumn[] = [];
      for (const title of header) {
        columns.push({ title, dataIndex: sampleFieldMapping(title) });
      }
      // results
      console.log('results:', results);
      const transformData = results.map((item, index) => {
        const newItem = {};
        // console.log('index:', index + 2);
        columns.forEach((column) => {
          // console.log('column: ', column);
          let key = Object.keys(item).find((key) => key === column.title);
          if (column.dataIndex == 'sex' && key != null) {
            let value = item[key];
            // console.log('value: ', value);
            // console.log('key: ', key);

            const iv = reSampleSexMapping(value);
            if (iv == 0) {
              error(
                '第' + (index + 2) + '行，《' + key + '》列出问题，只能填入是"男"、"女"、"未知"',
              );
              done = true;
              return;
            } else if (value != null && value != '') {
              item[key] = iv;
            }
          }
          newItem[column.dataIndex] = item[key];
        });
        return newItem;
      });
      // console.log('transformData:', transformData);
      tableListRef.value.push({ title: sheetName, dataSource: transformData, columns });
    }

    // 发请求到后端
    if (!done) {
      console.log('发送请求');
      const data = await improtSampleApi(tableListRef.value[0]);
      console.log('data', data);
      if (data.success) {
        success(data.message);
      } else {
        error(data.message);
        return;
      }
    }
    console.log('tableListRef: ', tableListRef);
  }

  /**
   * 取消代管
   */
  async function handleNOHosting() {
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
  }

  /**
   * 获取代管代码的样式数据
   * @param sampleHostingStatus
   */
  function getSampleHostingStatusCh(sampleHostingStatus) {
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
        text: '普通',
        color: 'blue',
      };
    }
  }

  /** 性别浮窗文本处理 */
  function genderTextProcess(text) {
    if (text == 1) {
      return '男';
    } else if (text == 2) {
      return '女';
    } else if (text == 3) {
      return '未知';
    } else {
      return text;
    }
  }
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
  /** 物流信息文本处理 */
  function logisticsInfoProcess(record) {
    let result = record?.logisticsTrackingNumber;
    if (record?.phoneNumLastFour) {
      result += ':' + record?.phoneNumLastFour;
    }
    return result;
  }
</script>

<style scoped>
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
    padding: 8px 12px;
    transform: translateX(-50%);
    border-radius: 4px;
    background-color: #333;
    color: #fff;
    font-size: 14px;
    white-space: nowrap;
  }
</style>
