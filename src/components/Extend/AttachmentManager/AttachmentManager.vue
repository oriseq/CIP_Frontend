<template>
  <a-card title="附件管理">
    <!-- 文件上传 -->
    <a-upload
      :file-list="fileList"
      :before-upload="beforeUpload"
      @change="handleUploadChange"
      :remove="handleRemove"
      :multiple="false"
      :customRequest="customRequest"
    >
      <a-button type="primary">
        <upload-outlined />
        上传附件
      </a-button>
    </a-upload>
    <div class="mb-5"></div>

    <!-- 附件列表 -->
    <a-table :data-source="attachments" :columns="columns" :row-key="(record) => record.id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-button type="link" @click="handleDownload(record)">下载</a-button>
          <a-popconfirm
            title="确定删除该文件吗?"
            ok-text="是"
            cancel-text="否"
            @confirm="handleDelete(record)"
          >
            <a-button type="link" danger>删除</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';
  import axios from 'axios';
  import {
    getAppendixFileListApi,
    getFile,
    deleteFile,
    addAppendixFile,
  } from '@/components/Extend/AttachmentManager/AttachmentManager';
  import { downloadByData } from '@/utils/file/download';
  import { uploadApi } from '@/api/sys/upload';

  const props = defineProps({
    sampleId: {
      type: Number,
      required: true,
    },
    annexFileId: {
      type: String,
      default: undefined, // 设置默认值
    },
  });
  // 监控sampleId和annexFileId 变化就触发程序
  watch(
    [() => props.sampleId, () => props.annexFileId],
    async ([newSampleId, newAnnexFileId], [oldSampleId, oldAnnexFileId]) => {
      // console.log('props.sampleId:', newSampleId, 'oldSampleId:', oldSampleId);
      // console.log('props.annexFileId:', newAnnexFileId, 'oldAnnexFileId:', oldAnnexFileId);

      // 只有当 sampleId 有值时才进行附件列表加载，annexFileId 变化也可能触发加载
      if (newSampleId) {
        // console.log('props.sampleId 存在, 开始加载列表...');
        // 初始化列表
        // 文件类型：1：附件 2：样本报告
        let rsp = await getAppendixFileListApi({ fileType: '1', sampleId: newSampleId });
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
          }));
        }
        // console.log(rsp);
      } else {
        // console.log('props.sampleId 不存在');
        attachments.value = []; // sampleId 无效时，清空附件列表
      }
    },
    { immediate: true },
  );

  // 附件列表数据
  const attachments = ref([
    { id: 1, name: 'file1.pdf', size: '1.2MB', uploadTime: '2023-10-01 10:00' },
    { id: 2, name: 'file2.docx', size: '0.8MB', uploadTime: '2023-10-02 14:00' },
  ]);

  // 文件上传列表
  const fileList = ref([]);

  // 表格列配置
  const columns = [
    { title: '文件名', dataIndex: 'name', key: 'name' },
    { title: '文件大小', dataIndex: 'size', key: 'size' },
    { title: '上传时间', dataIndex: 'uploadTime', key: 'uploadTime' },
    { title: '操作', key: 'action' },
  ];

  // 文件上传前的校验
  const beforeUpload = (file) => {
    const isLt10M = file.size / 1024 / 1024 < 20;
    if (!isLt10M) {
      message.error('文件大小不能超过20MB');
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
      attachments.value.push({
        id: attachments.value.length + 1,
        name: info.file.name,
        size: `${(info.file.size / 1024 / 1024).toFixed(2)}MB`,
        uploadTime: new Date().toLocaleString(),
      });
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`);
    }
  };

  // 删除附件
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

  // 下载附件
  const handleDownload = (record) => {
    // console.log('record:', record);
    // 模拟下载逻辑
    if (record.id) {
      getFile(record.id)
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
          downloadByData(response.data, decodeURIComponent(fileName || 'download.file'));
        })
        .catch((error) => {
          console.error('Error downloading report:', error);
        });
    } else {
      info('不存在文件');
    }
    // message.success('下载成功');
  };

  // 移除文件
  const handleRemove = (file) => {
    fileList.value = fileList.value.filter((item) => item.uid !== file.uid);
  };

  // 自定义上传方法
  const customRequest = async (options) => {
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
          onProgress({ percent: (progressEvent.loaded / progressEvent.total) * 100 });
        },
      );
      // console.log('response: ', response);
      const result = response?.data.result;
      if (response.data.success) {
        // 样本中记录文件id
        const adf = await addAppendixFile(props.sampleId, result.id);
        // console.log('adf: ', adf);
        if (adf.success) {
          // 上传成功后更新附件列表
          attachments.value.push({
            id: result.id,
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
            uploadTime: result.creationTime.toLocaleString(),
          });
          onSuccess(response, file);
          message.success('上传成功');
        } else {
          onError(new Error('上传失败'));
          message.error(adf.message);
        }
      } else {
        onError(new Error('上传失败'));
      }
    } catch (error) {
      onError(error);
    }
  };
</script>

<style scoped>
  .ant-upload {
    margin-bottom: 20px;
  }
</style>
