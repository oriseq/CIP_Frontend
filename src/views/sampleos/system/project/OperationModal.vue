<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    :minHeight="5"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
  <!-- <a-button type="primary" preIcon="mdi:page-next-outline" @click="console.log(getExpandedKeys())">
    测试
  </a-button> -->
</template>
<script lang="ts" setup>
  import { ref, computed, unref, watch, reactive } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';
  // import { defHttpForRes, defHttp } from '@/utils/http/axios';
  import { useMessage } from '@/hooks/web/useMessage';
  // import { accountFormSchema } from './account.data';
  // import type { TreeProps } from 'ant-design-vue';
  // import { BasicTree, TreeItem } from '@/components/Tree';
  // import permission from '@/router/routes/modules/demo/permission';
  // import { getDeptList } from '@/api/demo/system';
  import {
    MoadlType,
    updateProjectApi,
    detectMethodApi,
    consumableTypeApi,
    getProjectTreeApi,
    DeliveryUnitApi,
    InstrumentTypeApi,
  } from './pjsMngApi';
  import { ProjectCategoryList, WeekOption } from './data';
  // import { defineDocExtension } from 'codemirror';
  import { useGo, useRedo } from '@/hooks/web/usePage';
  import { useTabs } from '@/hooks/web/useTabs';
  // import { getTagColor, sampleProjectStatusMapping } from '../inspectionMission/fieldMapping';
  // import { Option } from 'vxe-table';
  import { useUserStore } from '@/store/modules/user';

  const go = useGo();
  const redo = useRedo();
  const { closeCurrent } = useTabs();
  const userStore = useUserStore();

  defineOptions({ name: 'AccountModal' });

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const moadlType = ref();
  const seledIds = ref([]);
  const isSuper = ref();
  const projectId = ref();
  const deliveryUnitIds = ref([]);
  const deliveryUnits = ref([]);

  const detectMethod = ref();
  const consumableType = ref();
  // const userCascader = ref();
  // const sampleId = ref();
  // const originProjectStatus = ref();

  // 项目树
  // const expandedKeys = ref<string[]>([]);
  // const selectedKeys = ref<string[]>([]);
  // console.log();
  // const checkedKeys = ref<string[]>([]);
  // const fieldNames: TreeProps['fieldNames'] = {
  //   title: 'name',
  //   key: 'id',
  // };

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
        // componentProps: { min: 0 },
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
        component: 'InputNumber',
        label: '价格',
        colProps: { span: 20 },
        componentProps: {
          // placeholder: '',
          min: 0,
        },
        required: true,
        // dynamicDisabled: !userStore.userInfo?.isSuper, // 非超级管理员动态禁用
        // ifShow: userStore.userInfo?.isSuper, // 只有超级管理员可见
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
          // valueField: 'value',
          // labelField: 'label',
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

  /** 获取级联中父节点的id和子节点的id，返回一个嵌套数组 */
  async function getParentNamefromCascader(Ids: number[]) {
    let options: number[][] = [];
    const response = await getProjectTreeApi(null);
    // console.log('response', response);
    // 批处理
    for (let parent of response) {
      parent.children.forEach((element) => {
        if (Ids.includes(element.id)) {
          options.push([parent.id, element.id]);
        }
      });
    }
    // console.log('getuserGroupCascader-options: ', options);
    return options;
  }

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    // 参数设置
    moadlType.value = data?.moadlType;
    // console.log('moadlType:', moadlType);
    seledIds.value = data?.ids;
    isSuper.value = data?.isSuper;
    // 外送单位相关
    deliveryUnitIds.value = data?.record.deliveryUnitIds;
    deliveryUnits.value = data?.record.deliveryUnits;

    // console.log('seledIds:', seledIds);
    // 显示方框
    updateSchema([
      {
        field: 'modifyProject',
        ifShow: data?.moadlType == MoadlType.MODIFY_PROJECT,
      },
    ]);
    // console.log('useModalInner:data:', data);
    /** 获取选择的项目id */
    projectId.value = data.record.id;

    resetFields();
    setModalProps({ confirmLoading: false });

    // 根据子分类id，外显已勾选级联
    async function getcascaderSelectIds(projectCategoryId) {
      let res = await getParentNamefromCascader([projectCategoryId]);
      return res[0];
    }
    // 设置表单字段值，使表格已填写的值默认填充到表单中(两处setFieldsValue不宜合并到一起，会影响排除星期的显示)
    setFieldsValue(data.record);
    setFieldsValue({
      projectCategoryId: await getcascaderSelectIds(data.record.projectCategoryId),
      disableWeek: data.record.disableWeek === null ? undefined : data.record.disableWeek,
      deliveryUnitIds:
        deliveryUnitIds.value === null
          ? undefined
          : filterDeliveryUnitIds(deliveryUnitIds.value, deliveryUnits.value),
    });
  });

  /** 从deliveryUnits过滤出不为deliveryUnitIds的单位 */
  function filterDeliveryUnitIds(ids: number[], objsArray: Array<{ id: number }>) {
    // 先将 objsArray 的 id 转换为 Set 以提高查找效率
    const idSet = new Set(objsArray.filter((p) => p !== null).map((item) => item.id));
    const returnIds = ids.filter((id) => idSet.has(id));
    // console.log('idSet: ', idSet);
    // console.log('a', returnIds);
    return returnIds;
  }
  // 函数测试用例
  // const ids = [1, 2, 3];
  // const objsArray = [{ id: 2 }, { id: 3 }, null];
  // const resultFunc = filterDeliveryUnitIds(ids, objsArray);
  // console.log('resultFunc', resultFunc); // [2, 3]

  /** 操作列弹窗标题 */
  const getTitle = computed(() => {
    // console.log('!unref(moadlType), ', !unref(moadlType));
    switch (unref(moadlType)) {
      case MoadlType.MODIFY_PROJECT:
        return '修改项目';
      default:
        return '';
    }
  });

  /** 从ProjectCategoryList中，获取指定目标字符串的项目分类id */
  function processChildren(item, target) {
    if (item.label == target) {
      return item.value;
    }

    if (item.children && item.children.length > 0) {
      for (const child of item.children) {
        const result = processChildren(child, target);
        if (result !== null) {
          return result;
        }
      }
    }

    return null;
  }

  /** 修改项目弹窗提交 */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      // console.log('values:', values);
      // console.log('seledIds:', seledIds);

      // 根据外显值获取填写值
      let projectCategoryId = values.projectCategoryId;
      if (typeof projectCategoryId == 'string') {
        // console.log('ProjectCategoryList', ProjectCategoryList);
        let foundValue = null;
        ProjectCategoryList.forEach((item) => {
          foundValue = processChildren(item, projectCategoryId) || foundValue;
        });
        projectCategoryId = foundValue;
      } else if (typeof projectCategoryId == 'number') {
        projectCategoryId = values.projectCategoryId;
      } else {
        projectCategoryId = values.projectCategoryId[values.projectCategoryId.length - 1];
      }

      if (moadlType.value == MoadlType.MODIFY_PROJECT) {
        // 提交数据
        const formData = {
          id: projectId.value,
          projectName: values.projectName,
          deliveryUnitIds: values.deliveryUnitIds ? values.deliveryUnitIds : [], // 外送单位
          reportDate: values.reportDate,
          detectMethod: values.detectMethod,
          consumableType: values.consumableType,
          price: values.price,
          projectCategoryId: projectCategoryId,
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
        // 发送修改请求
        const data = await updateProjectApi(formData);
        // console.log('data', data);
        if (data.success) {
          success(data.message);
          // redo(); // 重新刷新页面，使得修改的体验不是很好，故去除
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
    () => detectMethod.value,
    (value) => setFieldsValue({ detectMethod: value }),
  );
  watch(
    () => consumableType.value,
    (value) => setFieldsValue({ consumableType: value }),
  );
</script>
