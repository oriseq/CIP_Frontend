<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    :minHeight="SetminHeight"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm">
      <template #customSlot="{ model, field }">
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
            @select="handleSelect"
          >
            <template #title="{ name, id, status, disableCheckbox }">
              <!-- <span v-if="status" style="color: #1890ff">{{ name }}: {{ id }}</span> -->
              <!-- <span v-if="key === '0-0-1-0'" style="color: #1890ff">{{ name }}</span> -->
              <!-- <template v-else>{{ name }}</template> -->
              <!-- <span v-else>{{ name }}: {{ id }}</span> -->
              <a-tag
                v-if="status && !disableCheckbox"
                style="cursor: default"
                @mousedown.prevent
                :color="getTagColor(status)"
                >{{ getStatusText(status) }}</a-tag
              >
              <span v-if="name.indexOf(searchValue) > -1">
                {{ name.substring(0, name.indexOf(searchValue)) }}
                <span style="color: #f50">{{ searchValue }}</span>
                {{ name.substring(name.indexOf(searchValue) + searchValue.length) }}
              </span>
              <span v-else>{{ name }}</span>
            </template>
          </a-tree></div
        >
      </template>
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
  import type { TreeProps } from 'ant-design-vue';
  import { BasicTree, TreeItem } from '@/components/Tree';
  import permission from '@/router/routes/modules/demo/permission';
  // import { getDeptList } from '@/api/demo/system';
  import { uploadApi } from '@/api/sys/upload';
  import {
    MoadlType,
    otherGroupUsers,
    sampleTransferApi,
    sampleHostingApi,
    groupUsersCascader,
    getProjectTreeApi,
    updateProjectsApi,
    updateProjectStatusApi,
    getReportResultSelectApi,
    ReviewResultApi,
    DeliveryUnitApi,
    DeliveryPersonApi,
  } from './pjsMngApi';
  import { ReportResultType } from './data';
  import { defineDocExtension } from 'codemirror';
  import { useGo, useRedo } from '@/hooks/web/usePage';
  import { useTabs } from '@/hooks/web/useTabs';
  import {
    getTagColor,
    sampleProjectStatusMapping,
    sampleReviewResultMapping,
  } from '../inspectionMission/fieldMapping';
  import { Option } from 'vxe-table';
  import { useUserStore } from '@/store/modules/user';
  import { RunCheckTreeBox } from '../inspectionForm/inspectionFormApi';

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
  const userCascader = ref();
  const sampleId = ref();
  const projectId = ref();
  const originProjectStatus = ref();

  const polarity = ref();
  const deliveryUnit = ref();
  const deliveryPerson = ref();

  // let ReportResultSelectList: ReportResultType[] = [];
  let sampleProjectIds = ref();
  let reviewResults = ref();

  const uploadFiles = ref([]);
  const fileInfos = ref([]);

  const SetminHeight = ref(5);

  // 项目树
  const expandedKeys = ref<string[]>([]);
  const selectedKeys = ref<string[]>([]);
  // console.log();
  const checkedKeys = ref<string[]>([]);
  const fieldNames: TreeProps['fieldNames'] = {
    title: 'name',
    key: 'id',
  };

  let FirstNodeList = ref<string[]>([]);
  let SecondNodeList = ref<string[]>([]);
  const defaultexpandNode = [];

  const treeData = reactive([
    ({
      id: 'c-1',
      name: '内分泌系统检查',
      children: [
        {
          id: 'c-11',
          name: '性激素',
          children: [
            {
              id: 1,
              name: '促卵泡成熟激素（FSH）',
              status: 2,
              consumableType: '黄头管B',
            },
            {
              id: 2,
              name: '促黄体生成素（LH）',
              status: 2,
              consumableType: '黄头管B',
            },
            {
              id: 3,
              name: '雌二醇（E2）',
              status: 2,
              consumableType: '黄头管B',
            },
            {
              id: 4,
              name: '孕酮（P）',
              status: 2,
              consumableType: '黄头管B',
            },
            {
              id: 5,
              name: '催乳素（PRL）',
              status: 2,
              consumableType: '黄头管B',
            },
            {
              id: 6,
              name: '睾酮（T）',
              status: 2,
              consumableType: '黄头管B',
            },
            {
              id: 7,
              name: '性激素6项（FSH、LH、E2、P、PRL、T）',
              status: 2,
              consumableType: '黄头管B',
            },
            {
              id: 8,
              name: '性激素5项（FSH、LH、E2、P、PRL）',
              status: 2,
              consumableType: '黄头管B',
            },
          ],
        },
        {
          id: 'c-12',
          name: '甲功',
        },
        {
          id: 'c-13',
          name: '骨代谢',
        },
        {
          id: 'c-14',
          name: '糖尿病',
        },
      ],
    },
    {
      id: 'c-2',
      name: '生化检查',
      children: [
        {
          id: 'c-15',
          name: '常规生化',
          children: [
            {
              id: 36,
              name: '肝功7项(ALT、TBIL、DBIL、TP、ALB、ALP、TBA)',
              status: 2,
              consumableType: '黄头管',
            },
          ],
        },
      ],
    }),
  ]);

  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
    labelWidth: 100,
    // baseColProps: { span: 24 },
    schemas: [
      {
        field: 'sampleTransfer',
        label: '过户用户',
        required: true,
        component: 'Cascader',
        componentProps: {
          fieldNames: { label: 'name', value: 'id' },
          options: userCascader,
          onChange: (e, ...v) => {
            console.log('ApiCascader====>:', e, v);
          },
        },
        colProps: {
          span: 15,
        },
      },
      {
        field: 'sampleHosting',
        label: '代管用户',
        required: true,
        component: 'Cascader',
        componentProps: {
          fieldNames: { label: 'name', value: 'id' },
          options: userCascader,
          onChange: (e, ...v) => {
            console.log('ApiCascader====>:', e, v);
          },
        },
        colProps: {
          span: 15,
        },
      },
      {
        field: 'projects',
        label: '项目',
        slot: 'customSlot',
        // required: true,
      },
      {
        field: 'projectStatus',
        label: '项目状态',
        component: 'Select',
        componentProps: {
          options: [
            {
              label: sampleProjectStatusMapping(0),
              value: 0,
              key: '1',
            },
            {
              label: sampleProjectStatusMapping(1),
              value: 1,
              key: '2',
            },
            {
              label: sampleProjectStatusMapping(2),
              value: 2,
              key: '3',
            },
            {
              label: sampleProjectStatusMapping(3), // 正在检测
              value: 3,
              key: '4',
            },
            {
              label: sampleProjectStatusMapping(4),
              value: 4,
              key: '5',
            },
          ],
        },
        colProps: {
          span: 15,
        },
      },
      {
        field: 'reviewResults',
        label: '复核结果',
        component: 'Select',
        componentProps: {
          options: [
            {
              label: '正常',
              value: '正常',
              key: '1',
            },
            {
              label: '异常',
              value: '异常',
              key: '2',
            },
          ],
        },
        colProps: {
          span: 15,
        },
      },
      {
        field: 'polarity',
        label: '报告结果',
        helpMessage:
          '此处报告结果不可修改，请在上传报告时提交报告结果；若复核发现结果有异议，请重新上传报告并再次审核。',
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
      {
        field: 'resultImg',
        label: '审核图',
        component: 'Upload',
        colProps: {
          span: 15,
        },
        componentProps: {
          maxSize: 50,
          maxNumber: Infinity,
          multiple: true,
          emptyHidePreview: true,
          previewColumns: [
            // {
            //   title: '缩略图',
            //   dataIndex: 'image',
            // },
            {
              title: '文件名',
              dataIndex: 'name',
            },
          ],
          beforePreviewData: (arg) => {
            // console.log('beforePreviewData:arg：', arg);
            // console.log('uploadFiles', uploadFiles.value);
            // console.log('fileInfos', fileInfos.value);
            if (arg?.length == 0) {
              arg.splice(0, arg.length, ...fileInfos.value);
            }
            let data = arg
              .filter((item) => !!item)
              .map((item) => {
                // console.log('item:', item);
                return {
                  name: item?.id || '',
                };
              });
            // console.log('beforePreviewData-data', data);
            return data;
          },
          value: uploadFiles.value,
          api: uploadApi,
          resultField: 'data.result',
          helpText: '单个文件不超过50MB',
        },
      },
      {
        field: 'deliveryUnit',
        label: '外送单位',
        component: 'ApiSelect',
        componentProps: {
          immediate: false, // 添加这个配置，防止立即请求
          // 通过API获取result列表
          api: async (params) => {
            // console.log('params:', params);
            let response = await DeliveryUnitApi(params);
            // console.log('DeliveryUnitApi-response.result', response.result);
            if (response.success) {
              return response.result.map((item) => {
                return { label: item.name, value: item.name };
              });
            } else {
              error('外送单位接口请求失败');
            }
          },
          labelField: 'label',
          valueField: 'value',
          showSearch: true,
          mode: 'tags',
          onChange: (e, ...v) => {
            // console.log('deliveryUnit: e,v', e, v);
            if (Array.isArray(e)) {
              deliveryUnit.value = e[e.length - 1];
            }
          },
        },
        colProps: {
          span: 15,
        },
      },
      {
        field: 'deliveryPerson',
        label: '外送人',
        helpMessage: '查询的用户未设置真实姓名，会返回用户名',
        component: 'ApiSelect',
        componentProps: {
          api: async (params) => {
            let response = await DeliveryPersonApi(params);
            if (response.success) {
              return response.result.map((item) => {
                return { label: item, value: item };
              });
            } else {
              error('外送人接口请求失败');
            }
          },
          mode: 'tags',
          labelField: 'label',
          valueField: 'value',
          showSearch: true,
          onChange: (e, ...v) => {
            // console.log('deliveryPerson: e,v', e, v);
            if (Array.isArray(e)) {
              deliveryPerson.value = e[e.length - 1];
            }
          },
        },
        colProps: {
          span: 15,
        },
      },
      {
        field: 'remarks',
        label: '备注',
        component: 'InputTextArea',
        componentProps: {
          allowClear: true,
          autoSize: true,
        },
        colProps: {
          span: 15,
        },
      },
      // {
      //   field: 'sampleHosting',
      //   component: 'ApiSelect',
      //   label: '代管用户',
      //   required: true,
      //   componentProps: {
      //     //   // more details see /src/components/Form/src/components/ApiSelect.vue
      //     api: otherGroupUsers,
      //     //   // params: {
      //     //   //   id: 1,
      //     //   // },

      //     //   resultField: 'list',
      //     //   // use name as label
      //     labelField: 'name',
      //     //   // use id as value
      //     valueField: 'id',
      //     //   // not request untill to select
      //     //   immediate: true,
      //     onChange: (e, v) => {
      //       console.log('ApiSelect====>:', e, v);
      //     },
      //     //   // atfer request callback
      //     onOptionsChange: (options) => {
      //       console.log('get options', options.length, options);
      //     },
      //   },
      //   colProps: {
      //     span: 15,
      //   },
      //   // defaultValue: '0',
      // },
    ],
    showActionButtonGroup: false,
    actionColOptions: {
      span: 23,
    },
  });

  /** 监听送检单位，一旦发生改变就只显示最新的值 */
  watch(
    () => deliveryUnit.value,
    (newV) => {
      setFieldsValue({ deliveryUnit: newV });
    },
  );

  /** 监听送检人，一旦发生改变就只显示最新的值 */
  watch(
    () => deliveryPerson.value,
    (newV) => {
      setFieldsValue({ deliveryPerson: newV });
    },
  );

  // console.log('getExpandedKeys: ', getExpandedKeys());

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    // 参数设置
    moadlType.value = data?.moadlType;
    // console.log('moadlType:', moadlType);
    // console.log('data:', data);
    seledIds.value = data?.ids;
    isSuper.value = data?.isSuper;
    // console.log('seledIds:', seledIds);
    // 设置status的可选项
    // 设置project的下拉选项配置
    // 设置reviewResults的下拉选项配置
    let componentProps = {};
    if (moadlType.value == MoadlType.EDIT_PROJECT) {
      // 在模态框打开时立即设置 projectId
      projectId.value = data.record?.projectId;
      componentProps = {
        options: [
          {
            label: sampleProjectStatusMapping(0),
            value: 0,
          },
          {
            label: sampleProjectStatusMapping(1),
            value: 1,
            // key: projectStatus + '',
          },
          {
            label: sampleProjectStatusMapping(2),
            value: 2,
          },
          {
            label: sampleProjectStatusMapping(3),
            value: 3,
          },
          {
            label: sampleProjectStatusMapping(4),
            value: 4,
          },
        ],
      };
    }
    if (
      moadlType.value == MoadlType.SAMPLE_TRANSFER ||
      moadlType.value == MoadlType.SAMPLE_HOSTING
    ) {
      SetminHeight.value = 5;
      // 设置样本过户 样本代管 组件数据,超级管理的话获取不同信息
      if (data?.isSuper) {
        userCascader.value = await groupUsersCascader(null);
      } else {
        userCascader.value = await otherGroupUsers(null);
      }
      // console.log('userCascader:', userCascader);
    }
    // 显示方框
    updateSchema([
      {
        field: 'sampleTransfer',
        ifShow: data?.moadlType == MoadlType.SAMPLE_TRANSFER,
      },
      {
        field: 'sampleHosting',
        ifShow: data?.moadlType == MoadlType.SAMPLE_HOSTING,
      },
      {
        field: 'projects',
        ifShow: data?.moadlType == MoadlType.ADD_PROJECT,
      },
      {
        field: 'projectStatus',
        ifShow: data?.moadlType == MoadlType.EDIT_PROJECT,
        componentProps: { ...componentProps },
        dynamicDisabled: data.record?.projectStatus == 4,
      },
      {
        field: 'resultImg',
        // ifShow: data?.moadlType == MoadlType.EDIT_PROJECT && data?.userGroupName == '序源',
        ifShow:
          data?.moadlType == MoadlType.EDIT_PROJECT && userStore.userInfo?.isInternalGroup == true,
      },
      {
        field: 'polarity',
        ifShow: data?.moadlType == MoadlType.EDIT_PROJECT,
        // dynamicDisabled: data?.record?.projectStatus != 4, // 项目状态为不为已完成将禁止输入
        dynamicDisabled:
          userStore.userInfo?.isInternalGroup == false || data?.record?.projectStatus != 4, // 非内部组且项目状态为不为已完成将禁止输入
      },
      {
        field: 'deliveryUnit',
        componentProps: {
          params: {
            projectId: projectId.value,
          },
        },
        ifShow: () => {
          return (
            data?.moadlType == MoadlType.EDIT_PROJECT && userStore.userInfo?.isInternalGroup == true
          );
        },
      },
      {
        field: 'deliveryPerson',
        ifShow:
          data?.moadlType == MoadlType.EDIT_PROJECT && userStore.userInfo?.isInternalGroup == true,
      },
      {
        field: 'remarks',
        ifShow: data?.moadlType == MoadlType.EDIT_PROJECT,
      },
      {
        field: 'reviewResults',
        ifShow: data?.moadlType == MoadlType.REVIEW_RESULTS,
      },
      // {
      //   field: 'permissions',
      //   show: unref(isUpdate),
      // },
      // {
      //   field: 'dept',
      //   componentProps: { treeData },
      // },
    ]);
    // console.log('useModalInner:data:', data);

    if (moadlType.value == MoadlType.ADD_PROJECT) {
      // 设置修改项目部分
      const projectTree = await getProjectTreeApi(null);
      // treeData = data;
      treeData.splice(0, treeData.length, ...projectTree);

      treeData.forEach((item_parent) => {
        defaultexpandNode.push(item_parent.id);
        // 获取1级节点
        FirstNodeList.value.push(item_parent.id);
        if (item_parent.children.length > 0) {
          let ArrayChild = item_parent.children;
          ArrayChild.forEach((item_child) => {
            typeof item_child.id == 'string' ? defaultexpandNode.push(item_child.id) : null;
          });
        }
      });
      SecondNodeList.value = defaultexpandNode.filter((id) => !FirstNodeList.value.includes(id));
    }

    resetFields();
    setModalProps({ confirmLoading: false });

    if (moadlType.value == MoadlType.ADD_PROJECT) {
      // 设置修改项目部分
      if (data?.projects) {
        // 当项目太少，可以保证项目有空间展示
        SetminHeight.value = 300;

        sampleId.value = data.sampleId;
        const projects = data?.projects;
        // 1 勾选已经确认的项目
        const selectedIds = projects.map((item) => item.projectId);
        // expandedKeys.value.push('c-11');
        // console.log('parentIds: ', parentIds);
        expandedKeys.value.splice(0, expandedKeys.value.length, ...selectedIds);
        checkedKeys.value.splice(0, checkedKeys.value.length, ...selectedIds);
        // checkedKeys.value.push(...selectedIds);
        // console.log('selectedIds: ', selectedIds);
        // 2 更新状态
        projects.forEach((element) => {
          // console.log('element: ', element);
          const foundObject = findObjectById(treeData, element.projectId);
          // console.log('foundObject: ', foundObject);
          if (foundObject) {
            foundObject.status = element.projectStatus;
            // 加上不变
            // foundObject.disabled = true;
            foundObject.disableCheckbox = true;
          }
        });
      }
    }

    // 修改项目状态
    if (data?.moadlType == MoadlType.EDIT_PROJECT) {
      SetminHeight.value = 5;
      // console.log('data', data);
      projectId.value = data.record.projectId;
      originProjectStatus.value = data.record.projectStatus;
      sampleId.value = data.sampleId;
      let resultImgV = data.record.resultImg;
      // 状态回显
      let resultImgArr: any[] = [];
      if (resultImgV) {
        resultImgV.split(',').forEach((item) => {
          resultImgArr.push({ id: item });
        });
        // console.log('resultImgArr', resultImgArr);
      }
      setFieldsValue({
        projectStatus: originProjectStatus.value,
        polarity: data.record.polarity === null ? undefined : data.record.polarity,
        deliveryUnit: data.record.deliveryUnit === null ? undefined : data.record?.deliveryUnit,
        deliveryPerson:
          data.record.deliveryPerson === null ? undefined : data.record?.deliveryPerson,
        remarks: data.record.remarks,
        // resultImg: [{ id: data.record.resultImg }],
        resultImg: resultImgArr,
      });
    }

    // 选择复核结果
    if (data?.moadlType == MoadlType.REVIEW_RESULTS) {
      // console.log('REVIEW_RESULTS-data', data);
      // console.log('REVIEW_RESULTS-data?.ids', Object.values(data?.ids));
      // isSuper.value = data?.isSuper;
      SetminHeight.value = 5;
      sampleId.value = data?.sampleId;
      // console.log('sampleId.value', sampleId.value);
      setFieldsValue({
        reviewResults: data.record.reviewResults,
      });
    }
  });

  const getTitle = computed(() => {
    // console.log('!unref(moadlType), ', !unref(moadlType));
    switch (unref(moadlType)) {
      case MoadlType.SAMPLE_TRANSFER:
        return '样本过户';
      case MoadlType.ADD_PROJECT:
        return '新增项目';
      case MoadlType.SAMPLE_HOSTING:
        return '样本代管';
      case MoadlType.EDIT_PROJECT:
        return '编辑项目';
      case MoadlType.REVIEW_RESULTS:
        return '复核';
      default:
        return '';
    }
  });

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

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
          // TODO 过户后跳转地址
          closeCurrent();
          // go('/sample/inspectionMission', true);
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
          const megdetail = data?.result.join(',');
          error(data.message + '：' + megdetail);
          return;
        }
        emit('success', {});
      } else if (moadlType.value == MoadlType.ADD_PROJECT) {
        // 项目数据
        const foundObjects = getSelectedObject();
        // console.log('foundObjects', foundObjects);
        // 去掉不需要的字段。并且保留新的项目
        const resultFoundObjects = foundObjects
          .filter((item) => !item.disableCheckbox)
          .map(({ id, status, ...rest }) => ({
            id,
            status,
          }));
        // console.log('resultFoundObjects', resultFoundObjects);
        const formData = { projects: resultFoundObjects, id: sampleId.value };
        // console.log('formData:', formData);

        // 发请求
        const data = await updateProjectsApi(formData);
        // console.log('data', data);
        if (data.success) {
          success(data.message);
          redo();
        } else {
          // const megdetail = data.result.join(',');
          error(data.message);
          return;
        }
      } else if (moadlType.value == MoadlType.EDIT_PROJECT) {
        // 项目数据

        // console.log('projectId', projectId.value);
        // console.log('projectStatus', values.projectStatus);
        // console.log('sampleId', sampleId.value);

        // 将图片以数组的形式传入formData
        const modifyImgList = computed(() => {
          let picList = values.resultImg;
          if (picList) {
            return Array.isArray(picList) ? picList.map((p) => p.id) : picList.split(',');
          } else {
            return [];
          }
        });

        // console.log('values.resultImg', values.resultImg);
        let formData = {
          projectId: projectId.value,
          projectStatus: values.projectStatus,
          sampleId: sampleId.value,
          polarity: values.polarity,
          deliveryUnit: values.deliveryUnit,
          deliveryPerson: values.deliveryPerson,
          resultImgList: modifyImgList.value, // "b6a5f1ac6513dac890994a6695a9f0ec"
          remarks: values.remarks || null,
        };
        // console.log('formData', formData);

        // // 与原本状态相同，就是没有修改
        // if (originProjectStatus.value == values.projectStatus) {
        //   closeModal();
        //   return;
        // }
        // 发请求
        const data = await updateProjectStatusApi(formData);
        // console.log('data', data);
        if (data.success) {
          success(data.message);
          redo();
        } else {
          // const megdetail = data.result.join(',');
          error(data.message);
          return;
        }
      } else if (moadlType.value == MoadlType.REVIEW_RESULTS) {
        // 1. 获取填写的数据
        const formdata = {
          sampleId: sampleId.value,
          projectIds: seledIds.value,
          reviewResults: values.reviewResults,
        };
        // console.log('formdata', formdata);
        // 2. 发送复核请求
        const response = await ReviewResultApi(formdata);
        // 3. 响应结果
        if (response.success) {
          success(response.message);
        } else {
          error(response.message);
          return;
        }
        emit('success', {});
      }

      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  /**
   * 得到选择的项目对象
   */
  function getSelectedObject() {
    let foundObjects = getObjectsByIds(treeData, checkedKeys.value);
    // 只保留项目数据
    foundObjects = foundObjects
      .filter((item) => item.status)
      .map((item) => ({
        ...item,
        // projectName: item.name,
      }));
    return foundObjects;
  }
  function getObjectsByIds(data, ids) {
    return ids.reduce((result, id) => {
      const foundObject = findObjectById(data, id);
      if (foundObject) {
        result.push(foundObject);
      }
      return result;
    }, []);
  }
  function findObjectById(data, id) {
    for (const item of data) {
      if (item.id === id) {
        return item;
      }
      if (item.children) {
        const foundObject = findObjectById(item.children, id);
        if (foundObject) {
          return foundObject;
        }
      }
    }
    return null;
  }

  /**
   * 配置状态切换功能
   */
  // 初始状态为待定
  // const status = ref(1);
  // const getStatusColor = computed(() => {
  //   return (status) => {
  //     switch (status) {
  //       case 0:
  //         return '#ff0000'; // 取消状态的背景色为红色
  //       case 1:
  //         return '#f499a8'; // 待定状态的背景色为粉色
  //       case 2:
  //         return '#8d8e68'; // 确认检测状态的背景色为绿色
  //       default:
  //         return '#f499a8';
  //     }
  //   };
  // });
  const getStatusText = computed(() => {
    return (status) => {
      switch (status) {
        case 0:
          return '取消'; // 取消状态的文本为'取消'
        case 1:
          return '待定'; // 待定状态的文本为'待定'
        case 2:
          return '确认'; // 确认检测状态的文本为'确认检测'
        default:
          return '待定';
      }
    };
  });
  /**
   * 修改状态
   * @param idToUpdate 项目id
   */
  const changeStatus = (idToUpdate) => {
    // 查找匹配的对象
    const itemToUpdate = findObjectById(treeData, idToUpdate);
    // 出现disabled不能修改
    // if (itemToUpdate.disabled) {
    //   return;
    // }
    if (itemToUpdate) {
      if (itemToUpdate.status == 1) {
        itemToUpdate.status = 2;
      } else if (itemToUpdate.status == 2) {
        itemToUpdate.status = 1;
      }
    }
    // console.log(selectedProjects);
  };

  // // 设置project的下拉选项配置
  // function projectSelectOptions(projectStatus, isSuper) {
  //   // console.log('isSuper:', isSuper);
  //   // console.log('projectStatus:', projectStatus);
  //   let componentProps = {};
  //   if (isSuper) {
  //     if (projectStatus == 1) {
  //       /*
  //       待定
  //         - 取消
  //         - 待定
  //         - 确认检测
  //       */
  //       componentProps = {
  //         options: [
  //           {
  //             label: sampleProjectStatusMapping(0),
  //             value: 0,
  //           },
  //           {
  //             label: sampleProjectStatusMapping(projectStatus),
  //             value: projectStatus,
  //             key: projectStatus + '',
  //           },
  //           {
  //             label: sampleProjectStatusMapping(2),
  //             value: 2,
  //           },
  //         ],
  //       };
  //     } else if (projectStatus == 2) {
  //       /*
  //       确认检测
  //       - 取消
  //       - 确认检测
  //       - 正在检测
  //         - 只有正在检测的项目才可以打单
  //       */
  //       componentProps = {
  //         options: [
  //           {
  //             label: sampleProjectStatusMapping(0),
  //             value: 0,
  //           },
  //           {
  //             label: sampleProjectStatusMapping(projectStatus),
  //             value: projectStatus,
  //             key: projectStatus + '',
  //           },
  //           {
  //             label: sampleProjectStatusMapping(3),
  //             value: 3,
  //           },
  //         ],
  //       };
  //     } else {
  //       console.log('yes');

  //       componentProps = {
  //         options: [
  //           {
  //             label: sampleProjectStatusMapping(projectStatus),
  //             value: projectStatus,
  //             key: projectStatus + '',
  //           },
  //         ],
  //       };
  //     }
  //   } else {
  //     // 不是超级管理员
  //     if (projectStatus == 1) {
  //       /*
  //       待定
  //         - 取消
  //         - 待定
  //         - 确认检测
  //       */
  //       componentProps = {
  //         options: [
  //           {
  //             label: sampleProjectStatusMapping(0),
  //             value: 0,
  //           },
  //           {
  //             label: sampleProjectStatusMapping(projectStatus),
  //             value: projectStatus,
  //             key: projectStatus + '',
  //           },
  //           {
  //             label: sampleProjectStatusMapping(2),
  //             value: 2,
  //           },
  //         ],
  //       };
  //     } else if (projectStatus == 2) {
  //       /*
  //      确认检测
  //       - 取消
  //       - 待定
  //       - 确认检测
  //       */
  //       componentProps = {
  //         options: [
  //           {
  //             label: sampleProjectStatusMapping(0),
  //             value: 0,
  //           },
  //           {
  //             label: sampleProjectStatusMapping(1),
  //             value: 1,
  //           },
  //           {
  //             label: sampleProjectStatusMapping(projectStatus),
  //             value: projectStatus,
  //             key: projectStatus + '',
  //           },
  //         ],
  //       };
  //     } else {
  //       componentProps = {
  //         options: [
  //           {
  //             label: sampleProjectStatusMapping(projectStatus),
  //             value: projectStatus,
  //             key: projectStatus + '',
  //           },
  //         ],
  //       };
  //     }
  //   }
  //   return componentProps;
  // }

  const searchValue = ref<string>('');
  const autoExpandParent = ref<boolean>(true);
  // 搜索树相关
  watch(searchValue, (value) => {
    // 获取需要展开的key, 符合包含字符串的key
    /**
     * 找到节点
     * @param data
     * @param keyword
     */
    function findIdsByName(data, keyword) {
      const results = [];

      function search(node) {
        if (node.name.includes(keyword)) {
          results.push(node);
        }
        if (node.children) {
          node.children.forEach((child) => search(child));
        }
      }

      data.forEach((node) => search(node));
      // console.log("result: ", results);

      // 取id
      const matchIds = results.map((item) => item.id);

      return matchIds;
    }
    const matchIds = findIdsByName(treeData, value);
    // console.log("matchIds: ", matchIds);

    if (value) {
      expandedKeys.value = matchIds;
    } else {
      // console.log("selectedKeys.value: ", selectedKeys.value);
      expandedKeys.value = checkedKeys.value;
    }

    // console.log("expandedKeys.value:", expandedKeys.value);
    searchValue.value = value;
    autoExpandParent.value = true;
  });

  const onExpand = (keys: string[]) => {
    // console.log('onExpand keys:', keys);
    expandedKeys.value = keys;
    autoExpandParent.value = false;
  };

  // /** 获取报告结果 */
  // async function getReportResultSelect() {
  //   try {
  //     const response = await getReportResultSelectApi(null);
  //     // console.log('response', response);
  //     if (response.success) {
  //       const result = response.result;
  //       // console.log('result', result);
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
      // console.log("polarity.value:", polarity.value);
      setFieldsValue({ polarity: value });
    },
  );

  /** 监听树的变化，用于检测子孙节点是否为灰色勾选 */
  watch(treeData, (newTree) => {
    // console.log('newTree:', newTree);
    RunCheckTreeBox(newTree, checkedKeys);
  });

  // 从已勾选的数组中 删除 特定节点的勾选
  function handleFilter(node) {
    checkedKeys.value = checkedKeys.value
      .filter((k) => node.key !== k) // 删除树node的子节点
      .filter((j) => node.id !== j); // 删除树data的孙节点
    // console.log('handleFilter-checkedKeys, node', checkedKeys.value, node);
  }
  function getIsAllCheck(node, append_arr): boolean {
    // console.log('此时node = ', node);
    append_arr = append_arr.length > 0 ? append_arr : [];

    // 如果节点没有子节点，直接检查该节点的 id 是否在 checkedKeys.value
    if (!node.children || node.children.length === 0) {
      const r1 = checkedKeys.value.includes(node.id);
      // console.log('id 是否在 checkedKeys.value：', r1);
      append_arr.push(r1);
      return r1;
    }
    // 递归检查所有子节点及其子孙节点
    // console.log('此时node.children = ', node.children);
    for (const child of node.children) {
      if (!getIsAllCheck(child, append_arr)) {
        // console.log('此时检查节点是：', child);
        return false;
      }
    }
    // console.log('end - getIsAllCheck-checkedKeys.value', checkedKeys.value);

    // // 检查当前节点的 id 是否在 CheckedKeys.value 中
    return append_arr.every(function (i) {
      return i;
    });
  }

  function handleSelectSub(node) {
    // console.log('before:', checkedKeys.value);
    // console.log('handleSelectSub-node:', node);

    // 父节点
    if (node.children) {
      // 子节点是否全部勾选
      const isAllChecked = getIsAllCheck(node, []);
      // console.log('isAllChecked', isAllChecked);

      // 取消可能存在的父节点的key(通过勾选框的方式时）
      if (!(node?.disableCheckbox ?? false)) {
        handleFilter(node);
      }

      for (let node_chlildren of node.children) {
        // 父节点存在孙节点（一二三级）
        if (node_chlildren.children) {
          // 执行递归函数
          handleSelectSub(node_chlildren);
          // 父节点不存在孙节点（二三级）
        } else {
          if (!isAllChecked) {
            // console.log(`${isAllChecked}====checkedKeys.value`, checkedKeys.value);
            // 子节点此时处于勾选
            if (checkedKeys.value.includes(node_chlildren.id)) {
              continue;
            } else {
              // 若未勾选，则勾选
              checkedKeys.value = [...checkedKeys.value, node_chlildren.id];
            }
          } else {
            // 取消蓝色勾选
            if (!(node_chlildren?.disableCheckbox ?? false)) {
              // 当选中1级文本，且遍历到2级树（2级树没有checked键），则不做取消处理
              if (SecondNodeList.value.includes(node?.id) && node.checked === undefined) {
                // console.log(
                //   `${node.checked}||${node.id}====选中1级文本, 填充2级勾选`,
                //   node_chlildren,
                // );
              } else {
                // console.log(`${node.checked}||${node.id}====取消时，选中2级文本`);
                handleFilter(node_chlildren);
              }
            }
          }
        }
      }

      // 孙节点
    } else {
      // 勾选且不是灰色按钮，则取消勾选
      if (checkedKeys.value.includes(node.key) && !(node?.disableCheckbox ?? false)) {
        handleFilter(node);
      } else {
        checkedKeys.value = [...checkedKeys.value, node.key];
      }
    }
  }

  const handleSelect = (selectedKeys, { selected, selectedNodes, node, nativeEvent }) => {
    // console.log('选中的Node，看看属性:', node);
    const target = nativeEvent.target;
    if (target.className.includes('ant-tag')) {
      // console.log('点击tag');
      changeStatus(node.id);
      return;
    } else {
      // console.log('点击树文本');
    }

    handleSelectSub(node);

    // 最外层处理1级节点的取消问题
    // console.log('FirstNodeList.value', FirstNodeList.value);
    if (node.checked && FirstNodeList.value.includes(node?.id)) {
      // console.log('选中了1级文本，查看1级节点：', node);
      let node_bellow_all_int_id: number[] = [];
      node.children.forEach((item_lv2) => {
        item_lv2.children.forEach((item_lv3) => {
          if (!item_lv3?.disableCheckbox) {
            node_bellow_all_int_id.push(item_lv3.id);
          }
        });
      });
      checkedKeys.value = checkedKeys.value.filter((id) => !node_bellow_all_int_id.includes(id));
    }
  };
</script>
