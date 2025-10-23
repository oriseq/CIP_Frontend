<template>
  <a-card title="报告管理">
    <a-row :gutter="[8, 8]">
      <a-col>
        <a-button type="primary" @click="handleUploadReport">上传报告</a-button>
      </a-col>
      <a-col>
        <a-button type="primary" @click="handleDownReports">下载勾选报告</a-button>
      </a-col>
    </a-row>

    <div class="mb-5"></div>

    <!-- 报告列表 -->
    <a-table
      :data-source="attachments"
      :columns="columns"
      :row-key="(record) => record.id"
      :scroll="{ y: 500 }"
      :row-selection="rowSelection"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.key === 'projectNames'">
          <div v-for="(item, index) in text" :key="index">
            {{ item }}
          </div>
        </template>
        <template v-if="column.key === 'action'">
          <a-button type="link" @click="handleDownReport(record, column)">下载</a-button>
          <a-button type="link" @click="openLink(record.id)" v-if="checkFileType(record.name)"
            >预览</a-button
          >
          <a-popconfirm
            title="确定删除报告吗?"
            ok-text="是"
            cancel-text="否"
            @confirm="handleDelete(record)"
          >
            <a-button type="link" style="color: red">删除</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
  </a-card>
  <!-- 报告上传组件-->
  <UploadModal
    @register="registerUploadModal"
    :attachments="attachments"
    @success="handleSuccess"
    :maskClosable="false"
  />
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  // import { UploadOutlined } from '@ant-design/icons-vue';
  import { message, TableProps } from 'ant-design-vue';
  // import axios from 'axios';
  import { getAppendixFileListApi, getFile, getFiles, deleteFile } from './ReportManager';
  import { downloadByData } from '@/utils/file/download';
  // import { uploadApi } from '@/api/sys/upload';
  import { useModal } from '@/components/Modal';
  import { useUserStore } from '@/store/modules/user';
  import UploadModal from '../UploadModal.vue';
  import { useMessage } from '@/hooks/web/useMessage';
  import { defHttpOrigin } from '@/utils/http/axios';

  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const [registerUploadModal, { openModal: openModalUpload }] = useModal();

  const userStore = useUserStore();

  const props = defineProps({
    sampleId: {
      type: Number,
      required: true,
    },
  });
  // 监控sampleId和annexFileId 变化就触发程序
  watch(
    [() => props.sampleId],
    async ([newSampleId], [oldSampleId]) => {
      // console.log('props.sampleId:', newSampleId, 'oldSampleId:', oldSampleId);

      // 只有当 sampleId 有值时才进行附件列表加载，annexFileId 变化也可能触发加载
      if (newSampleId) {
        // console.log('props.sampleId 存在, 开始加载列表...');
        // 初始化列表
        // 文件类型：1：附件 2：样本报告

        let rsp = await getAppendixFileListApi({ fileType: '2', sampleId: newSampleId });
        if (rsp.success) {
          attachments.value = rsp.result.map((item) => ({
            id: item.id,
            name: item.originalFileName,
            // 把字节根据大小选择转换为KB或MB，保留2位小数
            size:
              item.fileSize > 1024 * 1024
                ? `${(item.fileSize / 1024 / 1024).toFixed(2)}MB`
                : `${(item.fileSize / 1024).toFixed(2)}KB`,
            uploadTime: item.creationTime,
            projectNames: item.projectNames,
          }));
        }
        // console.log('Watch-props.sampleId', rsp);
        // console.log('Watch-attachments.value', attachments.value);
      } else {
        console.log('props.sampleId 不存在');
        // attachments.value = []; // sampleId 无效时，清空附件列表
      }
    },
    { immediate: true },
  );

  // 报告列表数据
  const attachments = ref([]);

  // 文件上传列表
  // const fileList = ref([]);

  // 表格列配置
  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      resizable: true,
      sorter: (a, b) => {
        return a.name.localeCompare(b.name);
      },
    },
    {
      title: '项目',
      dataIndex: 'projectNames',
      key: 'projectNames',
      width: 300,
      ellipsis: true,
      resizable: true,
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      resizable: true,
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      width: 200,
      resizable: true,
      sorter: (a, b) => {
        return a.uploadTime.localeCompare(b.uploadTime);
      },
    },
    { title: '操作', key: 'action', width: 100, resizable: true },
  ];

  // 上传报告
  function handleUploadReport() {
    // console.log('handleUploadReport-Record:', record);
    // console.log('handleUploadReport-column:', column);
    // console.log('handleUploadReport-isSuper:', userStore.userInfo?.isSuper);

    openModalUpload(true, {
      record: { id: props.sampleId },
      projectNames: [],
      // column,
      // sampleId: sampleId,
      isSuper: userStore.userInfo?.isSuper,
    });
  }
  // 下载报告
  function handleDownReport(record: Recordable, column) {
    // console.log('handleDownReport-record:', record);
    if (record.id) {
      getFile(record.id)
        .then((response) => {
          /* 后端获取命名 */
          // console.log('handleDownReport-response: ', response);
          const contentDisposition = response.headers['content-disposition'];
          // console.log('contentDisposition: ', contentDisposition);
          let fileName = '';
          if (contentDisposition) {
            fileName = contentDisposition.split('filename="')[1];
            if (fileName) {
              fileName = fileName.slice(0, -1); // 去除结尾的双引号
            }
          }
          // console.log('fileName', fileName);
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

  function handleSuccess(info) {
    // console.log('上传成功后可点击确认按钮回调');
    // console.log('ReportManager-handleSuccess-info', info);
    attachments.value = info.attachments;
  }

  // 判断文件类型，选择性展示可预览的开关
  function checkFileType(filename: string): boolean {
    const allowShowSet = new Set(['pdf', 'png', 'jpg']);
    const matchSuffix = filename.match(/.([^.]+)$/);

    const endSwitch = matchSuffix ? matchSuffix[1] : '';
    // console.log('checkFileType-endSwitch', endSwitch);
    return allowShowSet.has(endSwitch);
  }

  // 预览开关
  function openLink(url) {
    /*const urlSuffx = apiUrl + '/file/';
    // 打开外链
    window.open(urlSuffx + url, '_blank');*/
    // 使用getFile(url)得到文件访问
    getFile(url).then(handleFilePreview);
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

  // 删除报告
  const handleDelete = (record) => {
    // console.log('record:', record);
    deleteFile({ fileId: record.id }).then((rsp) => {
      if (rsp.success) {
        attachments.value = attachments.value.filter((item) => item.id !== record.id);
        message.success('删除成功');
      } else {
        message.error('删除失败');
      }
    });
  };

  // 勾选行
  let SaveSelectedRows = ref<string[]>([]);
  const rowSelection: TableProps['rowSelection'] = {
    onChange: (selectedRowKeys: string[], selectedRows: []) => {
      // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      SaveSelectedRows.value = selectedRowKeys;
    },
    getCheckboxProps: (record) => ({
      name: record.name,
      id: record.id,
    }),
  };

  function getCurrentTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }
  /** 批量下载报告 */
  async function handleDownReports() {
    // 若勾选的报告只有一个，则直接返回该报告文件，若大于1个，则返回多份报告的打包
    // 判断是否勾选了报告
    if (SaveSelectedRows.value.length === 0) {
      message.warning('请选择要下载的报告');
      return;
    } else if (SaveSelectedRows.value.length === 1) {
      handleDownReport({ id: SaveSelectedRows.value[0] });
    } else {
      getFiles({ fileIds: SaveSelectedRows.value })
        .then((response) => {
          /* 后端获取命名（测试多文件下载，未返回content-disposition） */
          // console.log('handleDownReport-response: ', response);
          // const contentDisposition = response.headers['content-disposition'];
          // console.log('contentDisposition: ', contentDisposition);
          // let fileName = '';
          // if (contentDisposition) {
          //   fileName = contentDisposition.split('filename="')[1];
          //   if (fileName) {
          //     fileName = fileName.slice(0, -1); // 去除结尾的双引号
          //   }
          // }
          // console.log('fileName', fileName);
          downloadByData(response.data, decodeURIComponent(`reports_${getCurrentTime()}.zip`));
        })
        .catch((error) => {
          console.error('Error downloading report:', error);
        });
    }
  }
</script>

<style scoped>
  .ant-upload {
    margin-bottom: 20px;
  }
</style>
