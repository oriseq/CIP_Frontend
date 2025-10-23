<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    :minHeight="5"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm">
      <!-- <template #customSlot="{ model, field }">
        <div>
          <a-input-search
            v-model:value="searchValue"
            style="margin-bottom: 8px"
            placeholder="搜索"
          />
          <a-tree
            :autoExpandParent="autoExpandParent"
            v-model:expandedKeys="expandedKeys"
            v-model:selectedKeys="selectedKeys"
            v-model:checkedKeys="checkedKeys"
            checkable
            :tree-data="treeData"
            :field-names="fieldNames"
            @expand="onExpand"
          >
            <template #title="{ name, id, status, disableCheckbox }">
              <span v-if="name.indexOf(searchValue) > -1">
                {{ name.substring(0, name.indexOf(searchValue)) }}
                <span style="color: #f50">{{ searchValue }}</span>
                {{ name.substring(name.indexOf(searchValue) + searchValue.length) }}
              </span>
              <span v-else>{{ name }}</span>
            </template>
          </a-tree></div
        >
      </template> -->
    </BasicForm>
  </BasicModal>
  <!-- <a-button type="primary" preIcon="mdi:page-next-outline" @click="console.log(getExpandedKeys())">
    测试
  </a-button> -->
</template>
<script lang="ts" setup>
  import { ref, computed, unref, watch, reactive } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';
  import { defHttpForRes, defHttp } from '@/utils/http/axios';
  import { useMessage } from '@/hooks/web/useMessage';
  // import { accountFormSchema } from './account.data';
  // import type { TreeProps } from 'ant-design-vue';
  // import { BasicTree, TreeItem } from '@/components/Tree';
  // import permission from '@/router/routes/modules/demo/permission';
  // import { getDeptList } from '@/api/demo/system';
  import {
    MoadlType,
    addProjectApi,
    detectMethodApi,
    consumableTypeApi,
    DeliveryUnitApi,
    InstrumentTypeApi,
  } from './pjsMngApi';
  import { ProjectCategoryList, WeekOption } from './data';
  // import { defineDocExtension } from 'codemirror';
  import { useGo, useRedo } from '@/hooks/web/usePage';
  import { useTabs } from '@/hooks/web/useTabs';
  // import { getTagColor, sampleProjectStatusMapping } from '../inspectionMission/fieldMapping';
  // import { Option } from 'vxe-table';

  const go = useGo();
  const redo = useRedo();
  const { closeCurrent } = useTabs();

  defineOptions({ name: 'AccountModal' });

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const moadlType = ref();
  const seledIds = ref([]);
  const isSuper = ref();
  const sampleId = ref();

  const detectMethod = ref();
  const consumableType = ref();

  // const userCascader = ref();
  // const projectId = ref();

  // const originProjectStatus = ref();

  // 项目树
  // const expandedKeys = ref<string[]>([]);
  // const selectedKeys = ref<string[]>([]);
  // // console.log();
  // const checkedKeys = ref<string[]>([]);
  // const fieldNames: TreeProps['fieldNames'] = {
  //   title: 'name',
  //   key: 'id',
  // };
  // const treeData = reactive([
  //   ({
  //     id: 'c-1',
  //     name: '内分泌系统检查',
  //     children: [
  //       {
  //         id: 'c-11',
  //         name: '性激素',
  //         children: [
  //           {
  //             id: 1,
  //             name: '促卵泡成熟激素（FSH）',
  //             status: 2,
  //             consumableType: '黄头管B',
  //           },
  //           {
  //             id: 2,
  //             name: '促黄体生成素（LH）',
  //             status: 2,
  //             consumableType: '黄头管B',
  //           },
  //           {
  //             id: 3,
  //             name: '雌二醇（E2）',
  //             status: 2,
  //             consumableType: '黄头管B',
  //           },
  //           {
  //             id: 4,
  //             name: '孕酮（P）',
  //             status: 2,
  //             consumableType: '黄头管B',
  //           },
  //           {
  //             id: 5,
  //             name: '催乳素（PRL）',
  //             status: 2,
  //             consumableType: '黄头管B',
  //           },
  //           {
  //             id: 6,
  //             name: '睾酮（T）',
  //             status: 2,
  //             consumableType: '黄头管B',
  //           },
  //           {
  //             id: 7,
  //             name: '性激素6项（FSH、LH、E2、P、PRL、T）',
  //             status: 2,
  //             consumableType: '黄头管B',
  //           },
  //           {
  //             id: 8,
  //             name: '性激素5项（FSH、LH、E2、P、PRL）',
  //             status: 2,
  //             consumableType: '黄头管B',
  //           },
  //         ],
  //       },
  //       {
  //         id: 'c-12',
  //         name: '甲功',
  //       },
  //       {
  //         id: 'c-13',
  //         name: '骨代谢',
  //       },
  //       {
  //         id: 'c-14',
  //         name: '糖尿病',
  //       },
  //     ],
  //   },
  //   {
  //     id: 'c-2',
  //     name: '生化检查',
  //     children: [
  //       {
  //         id: 'c-15',
  //         name: '常规生化',
  //         children: [
  //           {
  //             id: 36,
  //             name: '肝功7项(ALT、TBIL、DBIL、TP、ALB、ALP、TBA)',
  //             status: 2,
  //             consumableType: '黄头管',
  //           },
  //         ],
  //       },
  //     ],
  //   }),
  // ]);

  // console.log('export-ProjectCategoryList', ProjectCategoryList);

  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
    labelWidth: 150,
    baseColProps: { span: 24 },
    schemas: [
      {
        field: 'projectName',
        label: '项目名称',
        component: 'Input',
        colProps: { span: 20 },
        componentProps: {},
        required: true,
      },
      // {
      //   field: 'userGroupName',
      //   label: '用户组',
      //   component: 'Select',
      //   colProps: { span: 20 },
      //   componentProps: {},
      //   required: true,
      // },
      // {
      //   field: 'priceCoefficient',
      //   label: '折扣系数',
      //   component: 'InputNumber',
      //   colProps: { span: 20 },
      //   required: true,
      // },
      {
        field: 'deliveryUnitIds',
        label: '外送单位',
        colProps: { span: 20 },
        component: 'ApiSelect',
        componentProps: {
          // 通过API获取result列表
          api: async (params) => {
            let response = await DeliveryUnitApi(params);
            if (response.success) {
              return response.result.map((item) => {
                return { label: item.name, value: item.id };
              });
            } else {
              error('外送单位接口请求失败');
            }
          },
          labelField: 'label',
          valueField: 'value',
          showSearch: true,
          mode: 'multiple',
          onChange: (e, ...v) => {
            console.log('name: e,v', e, v);
            // if (Array.isArray(e)) {
            //   name.value = e[e.length - 1];
            // }
          },
          maxTagCount: 1,
        },
        // required: true,
      },
      {
        field: 'detectMethod',
        label: '检测方法',
        component: 'ApiSelect',
        colProps: { span: 20 },
        componentProps: {
          api: async (params) => {
            let response = await detectMethodApi(params);
            if (response.success) {
              return response.result.map((item) => {
                return { label: item, value: item };
              });
            } else {
              error('获取检测方法列表失败');
            }
          },
          showSearch: true,
          mode: 'tags',
          onChange: (e, ...v) => {
            console.log('name: e,v', e, v);
            if (Array.isArray(e)) {
              detectMethod.value = e[e.length - 1];
            }
          },
          labelField: 'label',
          valueField: 'value',
        },
        required: true,
      },
      {
        field: 'consumableType',
        label: '采样耗材类型',
        component: 'ApiSelect',
        colProps: { span: 20 },
        componentProps: {
          api: async (params) => {
            let response = await consumableTypeApi(params);
            if (response.success) {
              return response.result.map((item) => {
                return { label: item, value: item };
              });
            } else {
              error('获取耗材类型失败');
            }
          },
          showSearch: true,
          mode: 'tags',
          onChange: (e, ...v) => {
            console.log('name: e,v', e, v);
            if (Array.isArray(e)) {
              consumableType.value = e[e.length - 1];
            }
          },
          labelField: 'label',
          valueField: 'value',
        },
        required: true,
      },
      {
        field: 'instrumentId',
        label: '仪器',
        component: 'ApiSelect',
        colProps: { span: 20 },
        componentProps: {
          api: InstrumentTypeApi,
          resultField: 'result',
          labelField: 'name',
          valueField: 'id',
        },
        // required: true,
      },
      {
        field: 'reportDate',
        label: '报告周期',
        component: 'Input',
        colProps: { span: 20 },
        required: true,
      },
      {
        field: 'projectCategoryId',
        label: '项目分类',
        component: 'Cascader',
        colProps: { span: 20 },
        componentProps: {
          options: ProjectCategoryList,
        },
        required: true,
      },
      {
        field: 'price',
        label: '价格',
        component: 'InputNumber',
        colProps: { span: 20 },
        required: true,
      },
      {
        field: 'reportDay',
        component: 'InputNumber',
        label: '报告天数',
        colProps: { span: 20 },
        componentProps: { min: 0 },
        // required: true,
      },
      {
        field: 'reportHour',
        component: 'InputNumber',
        label: '报告小时',
        colProps: { span: 20 },
        componentProps: { min: 0, max: 23 },
        // required: true,
      },
      {
        field: 'isReportHourMinutesEnd',
        component: 'Switch',
        label: '时分是否置末',
        defaultValue: true,
        colProps: { span: 20 },
        componentProps: {
          checkedChildren: '是',
          checkedValue: true,
          unCheckedChildren: '否',
          unCheckedValue: false,
        },
        // required: true,
      },
      {
        field: 'disableWeek',
        component: 'Select',
        label: '排除星期',
        colProps: { span: 20 },
        componentProps: {
          options: WeekOption,
          mode: 'multiple',
          // labelField: 'label',
          // valueField: 'value',
        },
        // required: true,
      },
      {
        field: 'remainingHour',
        component: 'InputNumber',
        label: '警报剩余小时',
        colProps: { span: 20 },
        componentProps: { min: 0 },
        // required: true,
      },
      {
        field: 'sampleRequirements',
        component: 'Input',
        label: '样本要求',
        colProps: { span: 20 },
        componentProps: {},
        // required: true,
      },
      {
        field: 'remarks',
        component: 'InputTextArea',
        label: '备注',
        colProps: { span: 20 },
        componentProps: {},
        // required: true,
      },
    ],
    showActionButtonGroup: false,
    actionColOptions: {
      span: 23,
    },
  });

  // console.log('getExpandedKeys: ', getExpandedKeys());

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    // 参数设置
    moadlType.value = data?.moadlType;
    // console.log('moadlType:', moadlType);
    // seledIds.value = data?.ids;
    isSuper.value = data?.isSuper;
    // console.log('seledIds:', seledIds);
    // 显示方框
    updateSchema([
      {
        field: 'addProject',
        ifShow: data?.moadlType == MoadlType.ADD_PROJECT,
      },
    ]);
    // console.log('useModalInner:data:', data);

    /** 新增项目 */
    if (moadlType.value == MoadlType.ADD_PROJECT) {
    }

    resetFields();
    setModalProps({ confirmLoading: false });
  });

  const getTitle = computed(() => {
    // console.log('!unref(moadlType), ', !unref(moadlType));
    switch (unref(moadlType)) {
      case MoadlType.ADD_PROJECT:
        return '新增项目';
      default:
        return '';
    }
  });

  /** 表单提交 */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      // console.log('values:', values);
      // console.log('seledIds:', seledIds);
      if (moadlType.value == MoadlType.ADD_PROJECT) {
        // 1.获取新增项目填写内容
        const formData = {
          projectName: values.projectName,
          deliveryUnitIds: values.deliveryUnitIds,
          reportDate: String(values.reportDate),
          detectMethod: values.detectMethod,
          consumableType: values.consumableType,
          price: values.price,
          projectCategoryId: String(values.projectCategoryId[values.projectCategoryId.length - 1]),
          reportDay: values.reportDay, // 报告天数
          reportHour: values.reportHour, // 报告小时
          isReportHourMinutesEnd: values.isReportHourMinutesEnd, // 时分是否置末
          disableWeek: values.disableWeek, // 排除星期
          remainingHour: values.remainingHour, // 警报剩余小时
          sampleRequirements: values.sampleRequirements, // 样本要求
          remarks: values.remarks, // 备注
          instrumentId: values.instrumentId,
        };
        // console.log('handleSubmit-formData', formData);
        // 2.发请求
        const data = await addProjectApi(formData);
        // console.log('data', data);
        if (data.success) {
          success(data.message);
          redo();
        } else {
          // const megdetail = data.result.join(',');
          error(data.message);
          return;
        }
      }

      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  watch(
    () => consumableType.value,
    (value) => setFieldsValue({ consumableType: value }),
  );
  watch(
    () => detectMethod.value,
    (value) => setFieldsValue({ detectMethod: value }),
  );
</script>
