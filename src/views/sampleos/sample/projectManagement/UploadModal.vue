<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :minHeight="5"
    :title="getTitle"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
  <!-- <a-button type="primary" preIcon="mdi:page-next-outline" @click="console.log(getExpandedKeys())">
    测试
  </a-button> -->
</template>
<script lang="ts" setup>
  import { ref, computed, unref, watch, reactive, createVNode } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';
  import { defHttpForRes, defHttp } from '@/utils/http/axios';
  import { useMessage } from '@/hooks/web/useMessage';
  // import { accountFormSchema } from './account.data';
  import type { TreeProps } from 'ant-design-vue';
  import { BasicTree, TreeItem } from '@/components/Tree';
  import permission from '@/router/routes/modules/demo/permission';
  // import { getDeptList } from '@/api/demo/system';
  import dayjs from 'dayjs';
  import { uploadApi } from '@/api/sys/upload';
  import { getProjectTreeApi, updateSampleInformationApi } from './inspectionMissionApi';
  import { Alert, Button } from 'ant-design-vue';
  import { BasicUpload } from '@/components/Upload';
  import { getTagColor } from '../inspectionMission/fieldMapping';
  import { uploadReportDataApi, getReportResultSelectApi } from './pjsMngApi';
  import { ReportResultType } from './data';

  defineOptions({ name: 'AccountModal' });

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const isUpdate = ref(true);
  const sampleId = ref();
  const projectId = ref();
  const polarity = ref();
  let ReportResultSelectList: ReportResultType[] = [];

  // 文件
  const uploadFiles = ref([]);
  const fileInfos = ref([]);

  function handleChange(list) {
    createMessage.info(`已上传文件${JSON.stringify(list)}`);
  }
  function beforePreviewData(arg) {
    // console.log('beforePreviewData:arg：', arg);
    // console.log('uploadFiles', uploadFiles.value);
    // console.log('fileInfos', fileInfos.value);
    if (arg?.length == 0) {
      // arg.push({
      //   id: 46,
      //   originalFileName: '导入模板.xlsx',
      // });
      arg.splice(0, arg.length, ...fileInfos.value);
    }
    let data = arg
      .filter((item) => !!item)
      .map((item) => {
        // console.log('item:', item);
        return {
          // url5: item,
          // type5: item.split('.').pop() || '',
          name: item?.originalFileName || '',
        };
      });
    return data;
  }

  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    schemas: [
      {
        field: 'polarity',
        label: '报告结果',
        component: 'ApiSelect',
        componentProps: {
          showSearch: false, // 单选为false
          virtual: false,
          mode: 'tags',
          api: async () => {
            const rsp = await getReportResultSelectApi(null);
            if (rsp.success) {
              return rsp.result.map((item) => {
                return { label: item, value: item };
              });
            } else {
              return { label: '无结果', value: '无结果' };
            }
          },
          // status: 'error', // 边框变红
          showArrow: true,
          autoClearSearchValue: true,
          // maxTagCount: 1,
          // options: ReportResultSelectList,
          onChange: (e, ...v) => {
            // console.log("e：", e);
            if (Array.isArray(e)) {
              polarity.value = e[e.length - 1];
            }
          },
        },
        colProps: {
          span: 15,
        },
      },
      // {
      //   field: 'fieldsc',
      //   label: '附件-1',
      //   slot: 'customSlot2',
      // },
      {
        field: 'files',
        component: 'Upload',
        label: '报告',
        componentProps: {
          maxSize: 50,
          maxNumber: 1,
          multiple: false,
          emptyHidePreview: true,
          previewColumns: [
            {
              title: '文件名',
              dataIndex: 'name',
            },
            // {
            //   title: '操作',
            //   dataIndex: '',
            //   customRender: ({ record }) => {
            //     return createVNode(
            //       Button,
            //       {
            //         onclick: () => {
            //           console.log(record);
            //           createMessage.success(`请到控制台查看该行输出结果`);
            //         },
            //       },
            //       () => '点我输出该行信息',
            //     );
            //   },
            // },
          ],
          beforePreviewData: (arg) => {
            // console.log('beforePreviewData:arg：', arg);
            // console.log('uploadFiles', uploadFiles.value);
            // console.log('fileInfos', fileInfos.value);
            if (arg?.length == 0) {
              // arg.push({
              //   id: 46,
              //   originalFileName: '导入模板.xlsx',
              // });
              arg.splice(0, arg.length, ...fileInfos.value);
            }
            let data = arg
              .filter((item) => !!item)
              .map((item) => {
                // console.log('item:', item);
                return {
                  // url5: item,
                  // type5: item.split('.').pop() || '',
                  name: item?.originalFileName || '',
                };
              });
            // console.log('beforePreviewData-data', data);
            return data;
          },
          value: uploadFiles.value,
          api: uploadApi,
          resultField: 'data.result',
          helpText: '单个文件不超过50MB，一次上传一个文件',
        },
      },
    ],
    showActionButtonGroup: false,
    actionColOptions: {
      span: 23,
    },
  });

  // console.log('getExpandedKeys: ', getExpandedKeys());

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    // console.log('useModalInner:data:', data);

    sampleId.value = data?.sampleId;
    projectId.value = data?.record.projectId;

    resetFields();
    setModalProps({ confirmLoading: false });
    setFieldsValue({ polarity: data.record.polarity === null ? undefined : data.record.polarity }); // 报告结果外显

    // const treeData = await getDeptList();
    // updateSchema([
    //   {
    //     field: 'password',
    //     show: !unref(isUpdate),
    //   },
    //   // {
    //   //   field: 'permissions',
    //   //   show: unref(isUpdate),
    //   // },
    //   // {
    //   //   field: 'dept',
    //   //   componentProps: { treeData },
    //   // },
    // ]);
  });

  const getTitle = computed(() => '上传报告');

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      // console.log('values:', values);

      const fileId = values.files ? values.files[0].id : null;

      const params = {
        sampleId: sampleId.value,
        projectId: projectId.value,
        fileId,
        polarity: values.polarity,
      };
      // console.log('params: ', params);
      // 发请求
      const data = await uploadReportDataApi(params);
      // console.log('data', data);
      if (data.success) {
        success(data.message);
      } else {
        // const megdetail = data.result.join(',');
        error(data.message + '，可能未提交报告文件');
        return;
      }

      closeModal();
      emit('success', { isUpdate: unref(isUpdate), values: { ...values } });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  /** 获取报告结果 */
  // async function getReportResultSelect() {
  //   try {
  //     const response = await getReportResultSelectApi(null);
  //     // console.log('response', response);
  //     if (response.success) {
  //       const result = response.result;
  //       console.log('result', result);
  //       result.forEach((data) => {
  //         ReportResultSelectList.push({ label: data, value: data });
  //       });
  //     } else {
  //       ReportResultSelectList.push({ label: '无结果', value: '无结果' });
  //     }
  //   } catch (error) {
  //     console.log('请求失败');
  //   }
  // }
  // getReportResultSelect();

  watch(
    () => polarity.value,
    (value) => {
      setFieldsValue({ polarity: value });
    },
  );
</script>
