<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :minHeight="5"
    :title="getTitle"
    @change="handleChange"
    :closeFunc="TopRightcloseFuncion"
  >
    <template #footer>
      <a-button type="default" @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleSubmit">点击提交</a-button>
    </template>
    <BasicForm @register="registerForm">
      <template #UploadSlot="{ model, field }">
        <a-upload
          name="file"
          :file-list="filesList"
          :before-upload="beforeUpload"
          @change="handleUploadChange"
          @remove="handleRemove"
          :multiple="false"
          :customRequest="customRequest"
        >
          <a-button type="primary">
            <upload-outlined />
            选择报告
          </a-button>
        </a-upload>
        <a-progress :percent="percent" v-if="percent > 0 && percent < 100" />
      </template>
      <template #customSelectProject="{ model, field }">
        <Select
          v-model:value="internalValue"
          mode="multiple"
          :maxTagCount="1"
          placeholder="请选择项目"
          allowClear
          @change="handleSelectChange"
        >
          <SelectOption
            :style="{ backgroundColor: item.color }"
            v-for="(item, index) in projectList"
            :key="index"
            :value="item.value"
          >
            {{ item.label }}
          </SelectOption>
        </Select>
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import {
    ref,
    computed,
    unref,
    watch,
    reactive,
    h,
    onMounted,
    onUnmounted,
    type VNode,
  } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';
  // import { defHttpForRes, defHttp } from '@/utils/http/axios';
  import { useMessage } from '@/hooks/web/useMessage';
  import { Select, SelectOption, message } from 'ant-design-vue';
  import { UploadOutlined } from '@ant-design/icons-vue';
  // import { accountFormSchema } from './account.data';
  // import type { TreeProps } from 'ant-design-vue';
  // import { BasicTree, TreeItem } from '@/components/Tree';
  // import permission from '@/router/routes/modules/demo/permission';
  // import { getDeptList } from '@/api/demo/system';
  // import dayjs from 'dayjs';
  import { uploadApi } from '@/api/sys/upload';
  import { uploadReportApi, getSelectProjectApi } from './inspectionMissionApi';
  import { sampleStatusMapping } from './fieldMapping';
  // import { Alert, Button } from 'ant-design-vue';
  // import { BasicUpload } from '@/components/Upload';
  // import { getTagColor } from '../inspectionMission/fieldMapping';
  // import type { UploadChangeParam, UploadProps } from 'ant-design-vue';
  import { deleteFile } from './reportingManager/ReportManager';

  defineOptions({ name: 'UploadModal' });
  const internalValue = ref();
  // const submitProjectVal = ref();
  interface OptionMap {
    label: string;
    value: number;
    color: string;
  }
  let percent = ref(0);
  // 选择的文件
  let filesList = ref([]);

  // 是否按下shift
  const isShiftPressed = ref(false);
  // const lastSelectedIndex = ref<number | null>(null);

  const props = defineProps({
    attachments: {
      type: Object,
      default: () => {},
    },
  });

  const Datattachments = ref();

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const isUpdate = ref(true);
  const sampleId = ref();
  const projectId = ref();
  // const polarity = ref();
  const Id = ref();

  // 获取的项目列表
  const projectList = ref<OptionMap[]>([]);

  // 文件
  const uploadFiles = ref([]);
  const fileInfos = ref([]);

  const handleChange = (info) => {
    console.log('UploadModal-handleChange', info);
    // createMessage.info(`已上传文件${JSON.stringify(list)}`);
  };

  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    schemas: [
      {
        field: 'files',
        label: '报告',
        slot: 'UploadSlot',
      },
      // {
      //   field: 'files',
      //   component: 'Upload',
      //   label: '报告',
      //   componentProps: {
      //     maxSize: 50,
      //     emptyHidePreview: true,
      //     maxNumber: 1,
      //     multiple: false,
      //     previewColumns: [
      //       {
      //         title: '文件名',
      //         dataIndex: 'name',
      //       },
      //     ],
      //     beforePreviewData: (arg) => {
      //       // console.log('beforePreviewData:arg：', arg);
      //       // console.log('uploadFiles', uploadFiles.value);
      //       // console.log('fileInfos', fileInfos.value);
      //       if (arg?.length == 0) {
      //         // arg.push({
      //         //   id: 46,
      //         //   originalFileName: '导入模板.xlsx',
      //         // });
      //         arg.splice(0, arg.length, ...fileInfos.value);
      //       }
      //       let data = arg
      //         .filter((item) => !!item)
      //         .map((item) => {
      //           console.log('beforePreviewData-item:', item);
      //           return {
      //             // url5: item,
      //             // type5: item.split('.').pop() || '',
      //             name: item?.originalFileName || '',
      //           };
      //         });
      //       return data;
      //     },
      //     value: uploadFiles.value,
      //     api: uploadApi,
      //     resultField: 'data.result',
      //     helpText: '单个文件不超过50MB，一次上传一个文件',
      //   },
      // },
      {
        field: 'projects',
        label: '完成项目',
        slot: 'customSelectProject',
        colProps: {
          span: 20,
        },
      },
    ],
    showActionButtonGroup: false,
    actionColOptions: {
      span: 23,
    },
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    // console.log('useModalInner:data:', data);

    sampleId.value = data?.sampleId;
    projectId.value = data?.record.projectId;
    Id.value = data?.record.id;

    // 打开弹窗前清空数据
    filesList.value = [];
    internalValue.value = undefined;

    // 获取下拉接口数据
    let response = await getSelectProjectApi({ sampleIds: [Id.value], scene: 'uploadReports' });
    if (response.success) {
      projectList.value = response.result.map((item) => {
        return {
          label: `(${sampleStatusMapping(item.projectStatus)}) ` + item.projectName,
          value: item.sampleProjectId,
          color: poolColor(item.projectStatus),
        };
      });
    } else {
      projectList.value = [];
    }

    resetFields();
    internalValue.value = undefined;
    setModalProps({ confirmLoading: false });
  });

  const getTitle = computed(() => '上传报告');

  async function handleSubmit() {
    try {
      // const values = await validate();
      setModalProps({ confirmLoading: true });
      // console.log('uploadModal-handleSubmit-values:', values);

      // console.log('handleSubmit: filesList.value', filesList.value);

      // 将以数组的形式传入formData
      const uploadReportIdList = computed(() => {
        if (filesList.value) {
          return Array.isArray(filesList.value)
            ? filesList.value.map((p) => p.id)
            : filesList.value.split(',');
        } else {
          return [];
        }
      });

      const params = {
        sampleId: Id.value,
        reportIds: uploadReportIdList.value,
        sampleProjectIds: internalValue.value,
      };

      interface ProjectListItem {
        label: string;
        value: number;
      }
      const ExportProjectNames = (IntArray: number[], projectList: ProjectListItem[]) => {
        const TargetIds = new Set(IntArray);
        return projectList
          .filter((item_x) => TargetIds.has(item_x.value))
          .map((item_y) => item_y.label.split(' ')[item_y.label.split(' ').length - 1]);
      };

      // 发请求(等接口)
      const data = await uploadReportApi(params);
      // console.log('uploadReportApi-params: ', params);
      // console.log('uploadReportApi: data', data);

      if (data.success) {
        // 刷新报告管理列表-try2
        Datattachments.value = [
          ...props.attachments,
          ...filesList.value.map((item) => ({
            id: item.id,
            name: item.originalFileName,
            // 把字节根据大小选择转换为KB或MB，保留2位小数
            size:
              item.fileSize > 1024 * 1024
                ? `${(item.fileSize / 1024 / 1024).toFixed(2)}MB`
                : `${(item.fileSize / 1024).toFixed(2)}KB`,
            uploadTime: item.creationTime,
            projectNames: ExportProjectNames(params.sampleProjectIds, projectList.value),
          })),
        ];
        // console.log('handleSubmit: Datattachments', Datattachments.value);
        success(data.message);
      } else {
        error(data.message + '，可能未提交报告文件或未选择完成项目');
        return;
      }

      // 达成都填写的条件下，才能关闭弹窗
      // if (!params.reportIds || !params.sampleProjectIds) {
      //   warning(`不能关闭弹窗，因为：${params}`);
      // } else {
      //   closeModal();
      //   return;
      // }
      // if (params.reportIds && params.sampleProjectIds) {
      //   warning(`请点击提交后关闭`);
      //   return;
      // } else {
      //   closeModal();
      // }
      closeModal();
      emit('success', {
        isUpdate: unref(isUpdate),
        values: { ...params },
        attachments: Datattachments.value, // 将更新后的附件列表传回调用UploadModal.vue的组件中
      });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  function poolColor(status: number) {
    switch (status) {
      case 1:
        return '#F9B7C3';
      case 2:
        return '#FBDC60';
      case 3:
        return '#75A9B3';
      case 4:
        return '#85c66c';
      default:
        return 'gray';
    }
  }
  // 监听 Shift 键状态
  const handleKeyEvent = (e: KeyboardEvent) => {
    isShiftPressed.value = e.shiftKey;
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyEvent);
    window.addEventListener('keyup', handleKeyEvent);
  });
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyEvent);
    window.removeEventListener('keyup', handleKeyEvent);
  });

  // 数组A按照对象数组B排序
  function sortArrayAbyArrayB(A: any[], B: any[]): any[] {
    const sortedA = A.slice().sort((a, b) => {
      const indexA = B.findIndex((item) => item.value === a);
      const indexB = B.findIndex((item) => item.value === b);
      return indexA - indexB;
    });
    return sortedA;
  }

  /** 项目选择框发生改变后，传值给submitProjectVal */
  const handleSelectChange = (value) => {
    // 没按shift
    // console.log('NotPress: 此时value', value);

    if (isShiftPressed.value) {
      // console.log('按住shift点击项目，此时value', value);

      let firstClickIndex = projectList.value.findIndex((item) => item.value === value[0]);
      // console.log('handleSelectChange-firstClickIndex', firstClickIndex);

      let currentClickIndex = projectList.value.findIndex(
        (item) => item.value === value[value.length - 1],
      );
      // console.log('handleSelectChange-currentClickIndex', currentClickIndex);

      // 跨内容勾选适配
      let beforeCurrentValue = value[value.length - 2];
      let beforeCurrentValueIndex = projectList.value.findIndex(
        (item) => item.value === beforeCurrentValue,
      );

      // 索引大小比较，更大的排后面
      let temp_index = beforeCurrentValueIndex;
      if (beforeCurrentValueIndex > currentClickIndex) {
        temp_index = currentClickIndex;
        currentClickIndex = beforeCurrentValueIndex;
      }

      // 去重后赋值到选择框
      internalValue.value = Array.from(
        new Set([
          ...internalValue.value,
          ...projectList.value.slice(temp_index, currentClickIndex + 1).map((item) => item.value),
        ]),
      );

      // value按照projectList排序
      internalValue.value = sortArrayAbyArrayB(internalValue.value, projectList.value);
      // console.log('勾选中间并且排序-internalValue.value', internalValue.value);
    }
  };

  // 文件上传前的校验
  const beforeUpload = (file) => {
    const isLt10M = file.size / 1024 / 1024 < 50;
    if (!isLt10M) {
      message.error('文件大小不能超过50MB');
    }
    return isLt10M;
  };

  // 文件上传状态变化
  const handleUploadChange = (info) => {
    // console.log('info: ', info);
    if (info.file.status === 'done') {
      // console.log("info.file.status === 'done'");
      message.success(`${info.file.name} 上传成功`);
      // 模拟上传成功后添加到附件列表
      Datattachments.value.push({
        id: Datattachments.value.length + 1,
        name: info.file.name,
        size: `${(info.file.size / 1024 / 1024).toFixed(2)}MB`,
        uploadTime: new Date().toLocaleString(),
      });
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`);
    }
  };
  const handleRemove = (file) => {
    filesList.value = filesList.value.filter((item) => item.uid !== file.uid);
    deleteFile({ fileId: file.id }).then((rsp) => {
      if (rsp.success) {
        console.log('未上传做实际删除，成功');
      } else {
        console.log('未上传做实际删除，失败');
      }
    });

    // console.log('handleRemove: ', file);
  };
  // 自定义上传方法
  const customRequest = async (options) => {
    // console.log('options: ', options);
    const { file, onProgress, onSuccess, onError } = options;
    try {
      // 文件上传
      const response = await uploadApi(
        {
          file: file,
          // data: {
          // sampleId: props.sampleId,
          // },
        },
        (progressEvent) => {
          // console.log('progressEvent.progress: ', progressEvent.progress);
          percent.value = Math.floor((progressEvent.progress ?? 0) * 100);
          // onProgress({ percent: progressEvent.progress * 100 });
        },
      );
      // console.log('file', file);
      // console.log('response: ', response);
      const result = response?.data.result;
      if (response.data.success) {
        onSuccess(response, file);

        // 用于上传列表显示文件名
        result.name = result.originalFileName;
        // console.log('customRequest: result:', result);

        // 重新提交文件，将会删除已提交的报告，做到只提交一份
        if (filesList.value && filesList.value.length > 0) {
          deleteFile({ fileId: filesList.value[0].id }).then((rsp) => {
            if (rsp.success) {
              console.log('覆盖上传做实际删除，成功');
            } else {
              console.log('覆盖上传做实际删除，失败');
            }
          });
        }

        // 新提交将会替换旧提交
        filesList.value = [result];
        success(`当前提交文件为: ${result.originalFileName}，成功`);
        // } else {
        //   onError(new Error('上传失败'));
        //   message.error(adf.message);
      } else {
        onError(new Error('上传失败'));
      }
    } catch (error) {
      onError(error);
    }
  };

  // 取消按钮点击事件
  const handleCancel = async () => {
    // 文件未上传，不进入阻塞
    if (!filesList.value || !(filesList.value.length > 0)) {
      closeModal();
      return;
    }
    // 已尝试filesList.value && internalValue.value，但未能完全检测，建议if条件不要变动
    let isClosed = false;
    let fileExists = false;
    let projectExists = false;

    // if (
    //   filesList.value &&
    //   filesList.value.length > 0 &&
    //   internalValue.value !== undefined &&
    //   internalValue.value.length > 0
    // ) {
    await new Promise<boolean>((resolve) => {
      let textOut = ``;
      if (filesList.value && filesList.value.length > 0) {
        fileExists = true;

        textOut += `已选择报告：\n✓ ${filesList.value[0]?.originalFileName}\n`;
      }

      if (internalValue.value !== undefined && internalValue.value.length > 0) {
        projectExists = true;

        let projectNameItem = projectList.value
          .filter((item) => internalValue.value.includes(item.value))
          .map((item) => (item ? item.label.split(' ')[item.label.split(' ').length - 1] : ''))
          .join('\n✓ ');
        textOut += `已填写项目：\n✓ ${projectNameItem}\n`;
      }

      if (fileExists && projectExists) {
        textOut += `信息已全部填写，是否确认提交？`;
      } else {
        textOut += `填写信息未提交，是否确认关闭？`;
      }
      // 假设弹出异步确认对话框，用户点击确定后返回 true
      setTimeout(() => {
        const isUserAgree = window.confirm(textOut);
        if (fileExists && projectExists && isUserAgree) {
          // 调用点击提交
          handleSubmit();
          return;
        } else {
          isClosed = isUserAgree;
        }

        resolve(isUserAgree);
        // console.log('isUserAgree: ', isUserAgree);
      }, 10);
    });
    if (isClosed) {
      // 关闭前清空
      if (filesList.value) {
        filesList.value.forEach((item) => {
          deleteFile({ fileId: item.id }).then((rsp) => {
            if (rsp.success) {
              console.log(`取消按钮关闭前清空：删除成功: ${item.id}`);
            } else {
              console.log(`取消按钮关闭前清空：删除失败: ${item.id}`);
            }
          });
        });
      }
      filesList.value = [];
      internalValue.value = undefined;
      closeModal();
    }
    // } else {

    // }
  };

  // 右上角关闭按钮点击事件
  async function TopRightcloseFuncion() {
    try {
      // 文件未上传，不进入阻塞
      if (!filesList.value || !(filesList.value.length > 0)) {
        return true;
      }

      let fileExists = false;
      let projectExists = false;
      let isClosed = true;

      // 1. 模拟异步操作（如调用API、弹窗确认等）
      await new Promise<boolean>((resolve) => {
        let textOut = ``;
        if (filesList.value && filesList.value.length > 0) {
          fileExists = true;

          textOut += `已选择报告：\n✓ ${filesList.value[0]?.originalFileName}\n`;
        }

        if (internalValue.value !== undefined && internalValue.value.length > 0) {
          projectExists = true;

          let projectNameItem = projectList.value
            .filter((item) => internalValue.value.includes(item.value))
            .map((item) => (item ? item.label.split(' ')[item.label.split(' ').length - 1] : ''))
            .join('\n✓ ');
          textOut += `已填写项目：\n✓ ${projectNameItem}\n`;
        }

        if (fileExists && projectExists) {
          textOut += `信息已全部填写，是否确认提交？`;
        } else {
          textOut += `填写信息未提交，是否确认关闭？`;
        }
        // 假设弹出异步确认对话框，用户点击确定后返回 true
        setTimeout(() => {
          const isUserAgree = window.confirm(textOut);
          if (fileExists && projectExists && isUserAgree) {
            // 调用点击提交
            handleSubmit();
            return;
          } else {
            isClosed = isUserAgree;
          }
          resolve(isUserAgree);
        }, 10);
      });
      // console.log('isClosed', isClosed);
      if (isClosed && filesList.value) {
        let deleteId = filesList.value[0].id;
        deleteFile({ fileId: deleteId }).then((rsp) => {
          if (rsp.success) {
            console.log(`右上角关闭前清空：删除成功: ${deleteId}`);
          } else {
            console.log(`右上角关闭前清空：删除失败: ${deleteId}`);
          }
        });
      }

      return isClosed;

      // 2. 根据异步操作结果决定是否关闭
    } catch (error) {
      // console.error('关闭过程中出错', error);
      return false; // 出错时阻止关闭
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
  // watch(
  //   () => polarity.value,
  //   (value) => {
  //     setFieldsValue({ polarity: value });
  //   },
  // );
</script>
