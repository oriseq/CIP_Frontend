<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    :minHeight="50"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm">
      <template #CustomSelect="{ model, field }">
        <Select
          v-if="modifyType === 'onlyProject'"
          v-model:value="internalValue"
          mode="multiple"
          placeholder="请选择项目"
          :maxTagCount="1"
          allowClear
        >
          <SelectOption
            :style="{ backgroundColor: item.color }"
            v-for="(item, index) in projectsListOptions"
            :key="index"
            :value="item.value"
          >
            {{ item.label }}
          </SelectOption>
        </Select>

        <Cascader
          v-if="modifyType === 'instrument'"
          v-model:value="internalValue"
          :options="projectsListOptions"
          expand-trigger="hover"
          multiple
          placeholder="请选择项目"
          showSearch
          :show-checked-strategy="Cascader.SHOW_CHILD"
          matchInputWidth
          :maxTagCount="1"
        />
      </template>
      <template #projectStatusSelect="{ model1, field1 }">
        <Select v-model:value="StatusValue" placeholder="请选择项目状态" allowClear>
          <SelectOption
            :style="{ backgroundColor: poolColor(item.value), margin: '1px' }"
            v-for="(item, index) in projectStatusOptions"
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
  import { ref, computed, unref, watch, h } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';
  import { useMessage } from '@/hooks/web/useMessage';
  import { Select, SelectOption, Cascader, Tooltip } from 'ant-design-vue';
  // import { defHttpForRes, defHttp } from '@/utils/http/axios';
  // import { accountFormSchema } from './account.data';
  // import { BasicTree, TreeItem } from '@/components/Tree';
  // import permission from '@/router/routes/modules/demo/permission';
  // import { getDeptList } from '@/api/demo/system';
  import {
    MoadlType,
    addSampleLogisticsApi,
    otherGroupUsers,
    sampleTransferApi,
    sampleHostingApi,
    groupUsersCascader,
    modifySampleStatusApi,
    getProjectListApi,
    getSelectProjectApi,
  } from './inspectionMissionApi';
  import { sampleProjectStatusMapping } from './fieldMapping';
  import { projectStatusOptions, demoOptions } from './data';

  defineOptions({ name: 'AccountModal' });

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  interface OptionMap {
    label: string;
    value: string;
    color?: string;
    children?: OptionMap[];
  }

  // 修改样本状态，由index.vue传过来
  const modifyType = ref<string>('onlyProject');

  const internalValue = ref();
  const submitProjectVal = ref();
  const StatusValue = ref();
  const submitProjectStatusVal = ref();

  const moadlType = ref();
  const seledIds = ref([]);
  const isSuper = ref();
  const userCascader = ref();
  const projectsListOptions = ref<OptionMap[]>([]);

  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
    labelWidth: 100,
    // baseColProps: { span: 24 },
    schemas: [
      // {
      //   field: 'sampleTransfer',
      //   label: '过户用户',
      //   required: true,
      //   component: 'Cascader',
      //   componentProps: {
      //     fieldNames: { label: 'name', value: 'id' },
      //     options: userCascader,
      //     onChange: (e, ...v) => {
      //       console.log('ApiCascader====>:', e, v);
      //     },
      //   },
      //   colProps: {
      //     span: 15,
      //   },
      // },
      // {
      //   field: 'sampleHosting',
      //   label: '代管用户',
      //   required: true,
      //   component: 'Cascader',
      //   componentProps: {
      //     fieldNames: { label: 'name', value: 'id' },
      //     options: userCascader,
      //     onChange: (e, ...v) => {
      //       console.log('ApiCascader====>:', e, v);
      //     },
      //   },
      //   colProps: {
      //     span: 15,
      //   },
      // },
      {
        field: 'projectsList',
        label: '项目列表',
        slot: 'CustomSelect',
        colProps: {
          span: 24,
        },
      },
      {
        field: 'sampleStatus',
        label: '状态',
        slot: 'projectStatusSelect',
        // component: 'Select',
        colProps: {
          span: 15,
        },
      },
    ],
    showActionButtonGroup: false,
    actionColOptions: {
      span: 23,
    },
  });

  /** 将字体超出一定长度的部分替换为... */
  function fontLengthFormat(stringVar: string, thresold: number) {
    return stringVar.length > thresold ? stringVar.slice(0, thresold) + '...' : stringVar;
  }

  // console.log('getExpandedKeys: ', getExpandedKeys());

  const [registerModal, { setModalProps, closeModal, changeLoading }] = useModalInner(
    async (data) => {
      // console.log('useModalInner:data:', data);
      changeLoading(true);
      // 设置样本过户 样本代管 组件数据,超级管理的话获取不同信息
      if (data?.isSuper) {
        userCascader.value = await groupUsersCascader(null);
      } else {
        userCascader.value = await otherGroupUsers(null);
      }
      // console.log('userCascader:', userCascader);

      // 1. 清理表单
      resetFields();
      internalValue.value = undefined;
      StatusValue.value = undefined;
      setModalProps({ confirmLoading: false });

      // 2. 参数设置
      moadlType.value = data?.moadlType;
      // console.log('moadlType:', moadlType);
      seledIds.value = data?.ids;
      isSuper.value = data?.isSuper;
      modifyType.value = data?.modifyType; // 修改样本状态的点击选项
      // console.log('seledIds:', seledIds);

      if (moadlType.value == MoadlType.MODIFY_STATUS) {
        // 1. 打开弹窗就重置项目列表
        projectsListOptions.value = [];
        let submitForm = {};

        // 2. 获取接口数据
        if (modifyType.value === 'onlyProject') {
          submitForm = { sampleIds: seledIds.value, scene: 'updateProjectStatus' };
        } else if (modifyType.value === 'instrument') {
          submitForm = { sampleIds: seledIds.value, scene: 'updateProjectStatusByInstrument' };
        }
        let response = await getSelectProjectApi(submitForm);

        // 当点击的是“按项目修改”
        let temp_arrary = [];
        if (response.success && modifyType.value === 'onlyProject') {
          // 1. 构造选项字典
          response.result.forEach((item) => {
            let mix_label = item.projectName;
            if (!temp_arrary[mix_label]) {
              temp_arrary[mix_label] = [];
            }
            if (!temp_arrary[mix_label].includes(item)) {
              temp_arrary[mix_label].push(item);
            }
          });

          // console.log('temp_arrary', temp_arrary);

          for (const obj in temp_arrary) {
            // console.log('obj', obj);

            // 1. 对1个项目，转化项目状态映射数量，{ 1: 1 }
            let dict_count = {};
            temp_arrary[obj].forEach((item) => {
              if (!dict_count[item.projectStatus]) {
                dict_count[item.projectStatus] = 1;
              } else {
                dict_count[item.projectStatus] += 1;
              }
            });

            // 遍历temp_arrary[obj]中的每个对象，遇到projectStatus相同的，只取其中1个作为label
            projectsListOptions.value.push({
              label:
                '（' +
                temp_arrary[obj]
                  .filter((item, index) => {
                    return (
                      index ===
                      temp_arrary[obj].findIndex((obj) => obj.projectStatus === item.projectStatus)
                    );
                  })
                  .map(
                    (item) =>
                      `${sampleProjectStatusMapping(item.projectStatus)}×${dict_count[item.projectStatus]}`,
                  )
                  .join('，') +
                '）' +
                obj,
              value: temp_arrary[obj].map((item) => item.sampleProjectId).join(','),
              color:
                temp_arrary[obj].filter((item, index) => {
                  return (
                    index ===
                    temp_arrary[obj].findIndex((obj) => obj.projectStatus === item.projectStatus)
                  );
                }).length > 1
                  ? 'white'
                  : poolColor(temp_arrary[obj][0].projectStatus),
            });
          }
          // console.log('projectsListOptions.value', projectsListOptions.value);
        } else if (response.success && modifyType.value == 'instrument') {
          // 当点击的是“按仪器修改”
          response.result.forEach((item) => {
            item['label'] = item.instrumentName;
            item['value'] = item.instrumentId;
            if (item.children.length > 0) {
              item.children.forEach((item_child) => {
                item_child.label =
                  '（' +
                  Object.entries(item_child.countByStatus)
                    .map((obj) => `${sampleProjectStatusMapping(Number(obj[0]))}×${obj[1]}`)
                    .join('，') +
                  '）' +
                  fontLengthFormat(item_child.projectName, 30);
                // item_child.projectName;
                item_child.value = item_child.sampleProjectIds.join(',');
              });
            }
            projectsListOptions.value.push(item);
          });
        } else {
          projectsListOptions.value = [];
        }
      }

      updateSchema([
        // {
        //   field: 'sampleTransfer',
        //   ifShow: unref(moadlType) == MoadlType.SAMPLE_TRANSFER,
        // },
        // {
        //   field: 'sampleHosting',
        //   ifShow: unref(moadlType) == MoadlType.SAMPLE_HOSTING,
        // },
        {
          field: 'projectsList',
          ifShow: unref(moadlType) == MoadlType.MODIFY_STATUS,
        },
        {
          field: 'sampleStatus',
          ifShow: unref(moadlType) == MoadlType.MODIFY_STATUS,
          // required: true,
          // componentProps: {
          //   options: projectStatusOptions,
          // },
        },
      ]);
      changeLoading(false);
    },
  );

  const getTitle = computed(() => {
    switch (unref(moadlType)) {
      case MoadlType.SAMPLE_TRANSFER:
        return '样本过户';
      case MoadlType.SAMPLE_HOSTING:
        return '样本代管';
      case MoadlType.MODIFY_STATUS:
        return '修改样本项目状态';
      default:
        return '';
    }
  });

  // 根据文本内含有的字符，返回颜色
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
        return '#989393';
    }
  }

  async function handleSubmit() {
    try {
      setModalProps({ confirmLoading: true });
      // const values = await validate();
      // console.log('values:', values);
      // console.log('seledIds:', seledIds);
      if (moadlType.value == MoadlType.SAMPLE_TRANSFER) {
        let sampleTransferId = values.sampleTransfer[0];
        // 超级管理的额外处理
        if (isSuper.value) {
          // 是一个数组，Cascader类型，取最后一个
          sampleTransferId = values.sampleTransfer[values.sampleTransfer.length - 1];
        }
        const data = await sampleTransferApi({
          ids: seledIds.value,
          sampleTransferId: sampleTransferId,
        });
        // console.log('data', data);
        if (data.success) {
          success(data.message);
        } else {
          const megdetail = data?.result.join(',');
          error(data.message + '：' + megdetail);
          return;
        }
        emit('success', {});
      } else if (moadlType.value == MoadlType.SAMPLE_HOSTING) {
        let sampleHostingId = values.sampleHosting[0];
        // 超级管理的额外处理
        if (isSuper.value) {
          // 是一个数组，Cascader类型，取最后一个
          sampleHostingId = values.sampleHosting[values.sampleHosting.length - 1];
        }
        const data = await sampleHostingApi({
          ids: seledIds.value,
          sampleHostingId: sampleHostingId,
        });
        // console.log('data', data);
        if (data.success) {
          success(data.message);
        } else {
          error(data.message);
          return;
        }
        emit('success', {});
      } else if (moadlType.value == MoadlType.MODIFY_STATUS) {
        // console.log('values.projectsList', values.projectsList);
        // console.log('submitProjectVal.value', submitProjectVal.value);

        // 1. 将输入的对象，取value字符串按照逗号分开，并转化为整型数组
        // let inputProjList: number[] = [];
        // values.projectsList.forEach((item) => {
        //   console.log('handleSubmit-item', item);
        //   let temp_split = item[0].split(',');
        //   temp_split.forEach((j: string) => {
        //     inputProjList.push(Number(j));
        //   });
        // });

        // 监听数据（插槽数据）
        let inputProjList: number[] = [];
        if (submitProjectVal.value === undefined) {
          error('请选择项目');
          return;
        }
        if (modifyType.value === 'onlyProject') {
          submitProjectVal.value.forEach((item) => {
            // console.log('handleSubmit-item', item);
            let temp_split = item.split(',');
            temp_split.forEach((j: string) => {
              inputProjList.push(Number(j));
            });
          });
        } else if (modifyType.value === 'instrument') {
          submitProjectVal.value.forEach((item) => {
            // console.log('handleSubmit-item', item);
            let temp_split = item[item.length - 1].split(',');
            temp_split.forEach((j: string) => {
              inputProjList.push(Number(j));
            });
          });
        }

        // 提交表单时，校验必填内容
        if (submitProjectStatusVal.value === undefined) {
          error('请选择样本项目状态');
          return;
        }

        // 2. 发送请求
        let formData = { status: submitProjectStatusVal.value, sampleProjectIds: inputProjList };

        // console.log('批量修改样本项目状态formData: ', formData);
        const response = await modifySampleStatusApi(formData);
        if (response.success) {
          success(response.message);
        } else {
          const megdetail = response?.result.join(',');
          error(response.message + '：' + megdetail);
          return;
        }
        emit('success', { isUpdate: true });
      }
      closeModal();
      // emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  watch(
    () => internalValue.value,
    (val) => {
      // console.log('internalValue.value-valval', val);
      submitProjectVal.value = val;
      // console.log('submitProjectVal.value', submitProjectVal.value);
    },
  );
  watch(
    () => StatusValue.value,
    (val) => {
      // console.log('StatusValue.value-valval', val);
      submitProjectStatusVal.value = val;
      // console.log('submitProjectStatusVal.value', submitProjectStatusVal.value);
    },
  );
</script>
<style scoped>
  :global(.ant-cascader-menu) {
    height: 400px !important;
  }
</style>
