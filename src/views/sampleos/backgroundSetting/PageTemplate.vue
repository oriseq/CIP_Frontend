<template>
  <CollapseContainer :title="title" :canExpand="false">
    <div v-if="showFormSwitch">
      <BasicForm
        @register="registerForm"
        @field-value-change="handleFieldChange"
        style="margin-top: 20px"
      >
        <template #uploadSlot="{ model, field }">
          <a-upload
            :file-list="fileList"
            :before-upload="beforeUpload"
            @change="handleUploadChange"
            @remove="handleRemove"
            :multiple="false"
            :customRequest="customRequest"
            @preview="handleFilePreview"
          >
            <a-button>
              <upload-outlined />
              上传
            </a-button>
          </a-upload>
          <a-progress :percent="percent" v-if="percent > 0 && percent < 100" />
        </template>
      </BasicForm>
      <!-- <a-button style="margin: 10px 5px" @click="handleResetForm">重置</a-button> -->
      <a-divider />
      <a-button v-if="isFormChanged" style="margin: 10px 5px" type="primary" @click="handleSubmit"
        >更新</a-button
      >
    </div>
  </CollapseContainer>
</template>

<script setup lang="ts">
  import { CollapseContainer } from '@/components/Container';
  import { BasicForm, useForm, FormSchema } from '@/components/Form';
  import { computed, onMounted, unref, ref } from 'vue';
  import { useMessage } from '@/hooks/web/useMessage';
  import { bachUpdateApi, getInfoApi } from './data';
  import type { UploadProps } from 'ant-design-vue';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import { uploadApi } from '@/api/sys/upload';
  import { getFile } from '@/views/sampleos/sample/inspectionMission/inspectionMissionApi';

  const { createMessage } = useMessage();
  const { success, error } = createMessage;

  // 定义模块
  defineOptions({ name: 'PageTemplate' });
  const emits = defineEmits(['success']);

  /** 父组件传入 */
  const title = defineModel<string>('title', { default: '站点设置' });
  const schemas = defineModel<FormSchema[]>('schemas', { default: [] });
  /** 子组件创建 */
  const showFormSwitch = computed(() => ['站点设置', '登录页'].includes(unref(title)));
  // 文件上传列表
  const fileList = ref<UploadProps['fileList']>([]);

  // 保存表单初始值
  const initialFormValues = ref<Record<string, any>>({});
  const changeFormValues = ref<string[]>([]);

  // 表单是否已更改
  const isFormChanged = computed(
    () => changeFormValues.value.length > 0 || fileList.value?.length > 0,
  );

  // 表单对象
  const [registerForm, { setFieldsValue, validate }] = useForm({
    labelWidth: 120,
    schemas: schemas,
    showActionButtonGroup: false,
  });

  // 处理表单字段变化
  const handleFieldChange = (key: string, value: any) => {
    // key获取initialFormValues的值再对比，后者是一个json
    if (key in initialFormValues.value) {
      // 比较新旧值
      if (initialFormValues.value[key] !== value) {
        // 值已更改
        changeFormValues.value.push(key);
      } else {
        // 值未更改
        changeFormValues.value = changeFormValues.value.filter((item) => item !== key);
      }
    }
  };

  const loadInitialData = () => {
    getInfoApi(null).then((res) => {
      const initialValues = res.result.reduce(
        (acc, item) => {
          acc[item.configKey] = item.configValue;
          return acc;
        },
        {} as Record<string, any>,
      );
      // 保存初始值（使用深拷贝）
      initialFormValues.value = JSON.parse(JSON.stringify(initialValues));
      setFieldsValue(initialValues);
    });
  };
  onMounted(() => {
    loadInitialData();
  });

  // 上传进度
  let percent = ref(0);
  /** 上传文件change */
  const handleUploadChange = (info) => {
    if (info.file.status === 'done') {
      success(`${info.file.name} 上传成功`);
    } else if (info.file.status === 'error') {
      error(`${info.file.name} 上传失败`);
    }
  };

  // 文件上传前的校验
  const beforeUpload = (file) => {
    const isLt10M = file.size / 1024 / 1024 < 50;
    if (!isLt10M) {
      error('文件大小不能超过50MB');
    }
    return isLt10M;
  };
  /** 删除文件 */
  const handleRemove = (file) => {
    fileList.value = fileList.value.filter((item) => item.uid !== file.uid);
  };
  // 自定义上传方法
  const customRequest = async (options) => {
    // console.log('options: ', options);
    const { file, onProgress, onSuccess, onError, action } = options;
    try {
      // 文件上传
      const response = await uploadApi(
        {
          file: file,
        },
        (progressEvent) => {
          percent.value = Math.floor((progressEvent.progress ?? 0) * 100);
        },
      );
      const result = response?.data.result;
      // console.log('🚀 ~ customRequest ~ response:', response);
      if (response.data.success) {
        onSuccess(response, file);

        // 用于上传列表显示文件名
        result.name = result.originalFileName;

        const fileRsp = await getFile(result.id);
        // console.log('🚀 ~ customRequest ~ fileRsp:', fileRsp);
        result.url = fileRsp.config.url;
        result.getFileData = fileRsp.data;
        result.contentType = fileRsp.headers['content-type'];

        // 新提交将会替换旧提交
        fileList.value = [result];
        success(`当前提交图标为: ${result.originalFileName}，成功`);
      } else {
        onError(new Error('上传失败'));
      }
    } catch (error) {
      onError(error);
    }
  };

  /** 文件预览 */
  const handleFilePreview = async (file) => {
    // console.log('🚀 ~ handleFilePreview ~ file:', file);
    const blob = new Blob([file.getFileData], { type: file.contentType });
    // console.log('🚀 ~ handleFilePreview ~ blob:', blob);
    const url = window.URL.createObjectURL(blob);
    // 使用 window.open 打开预览
    window.open(url);
  };
  /** 提交表单 */
  const handleSubmit = async () => {
    const data = await validate();

    let submitForm = {};

    if (title.value === '站点设置') {
      submitForm['site.basic.title'] = data.site.basic.title;
      submitForm['site.browser.favicon'] = fileList.value[0]?.id ?? undefined;
    } else if (title.value === '登录页') {
      submitForm['login.basic.mainTitle'] = data.login.basic.mainTitle;
      submitForm['login.basic.subTitle'] = data.login.basic.subTitle;
      submitForm['login.register.allowRegister'] = data.login.register.allowRegister;
      submitForm['login.security.sliderCaptcha'] = data.login.security.sliderCaptcha;
      submitForm['login.sms.enabled'] = data.login.sms.enabled;
    } else if (title.value === '通知') {
      submitForm['notify.basic.use'] = data.notify.basic.use;
    }

    bachUpdateApi(submitForm).then((res) => {
      if (res.success) {
        success(res.message);
        // 更新成功后，重新设置初始值
        loadInitialData();
        // 清空changeFormValues 保留响应式
        changeFormValues.value.splice(0, changeFormValues.value.length);
        if (title.value === '站点设置') {
          emits('success', { siteSetting: true });
          fileList.value = [];
        }
      } else {
        error(res.message);
      }
    });
  };
</script>

<style scoped></style>
