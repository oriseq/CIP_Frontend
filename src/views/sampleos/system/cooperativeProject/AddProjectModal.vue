<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    :minHeight="50"
    width="800px"
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
            defaultExpandAll
            :tree-data="treeData"
            :field-names="fieldNames"
            @expand="onExpand"
            @select="handleSelect"
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
  import {
    MoadlType,
    // otherGroupUsers,
    // sampleTransferApi,
    // sampleHostingApi,
    // groupUsersCascader,
    // updateProjectsApi,
    // updateProjectStatusApi,
    // getSystemProjectListApi,
    getProjectTreeApi,
    getUserGroupInfoApi,
    addProjectApi,
    getProjectIdsbyGroup,
    getDefaultDeliveryApi,
  } from './pjsMngApi';
  import { defineDocExtension } from 'codemirror';
  import { useGo, useRedo } from '@/hooks/web/usePage';
  import { useTabs } from '@/hooks/web/useTabs';
  // import { getTagColor, sampleProjectStatusMapping } from '../inspectionMission/fieldMapping';
  // import { Option } from 'vxe-table';
  import { useUserStore } from '@/store/modules/user';
  import { RunCheckTreeBox } from '../../sample/inspectionForm/inspectionFormApi';

  const go = useGo();
  const redo = useRedo();
  const { closeCurrent } = useTabs();

  defineOptions({ name: 'AccountModal' });

  const userStore = useUserStore();

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const moadlType = ref();
  const seledIds = ref([]);
  const isSuper = ref();
  // const userCascader = ref();
  const sampleId = ref();
  // const projectId = ref();
  // const originProjectStatus = ref();

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
  const defaultexpandNode: string[] = [];

  const treeDataList = [
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
  ];
  const inittreeData = reactive(treeDataList);
  const treeData = reactive(treeDataList);

  // 获取接口树
  async function getProjectTree() {
    const projectTree = await getProjectTreeApi(null);
    // console.log('projectTree', projectTree);
    return projectTree;
  }

  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
    labelWidth: 150,
    baseColProps: { span: 20 },
    schemas: [
      {
        field: 'userGroupName',
        label: '合作送检单位',
        component: 'ApiSelect',
        // colProps: { span: 20 },
        // defaultValue: { userGroupid: userGroupid.value },
        componentProps: {
          api: async () => {
            const rsp = await getUserGroupInfoApi({ scene: 'fillIn' });
            return rsp.result;
          },
          resultField: 'result',
          labelField: 'groupName',
          valueField: 'id',
          onChange: async (userGroupid) => {
            try {
              // console.log('onChange-userGroupid: ', userGroupid);
              // 1. 项目树获取
              const projectTree = await getProjectTree();
              treeData.splice(0, treeData.length, ...projectTree);
              // 2. 获取指定用户组的所有项目id号
              const response = await getProjectIdsbyGroup({ userGroupId: userGroupid });
              // 3. 勾选的项目信息
              let ids = ref(response.result);
              // console.log('ids', ids);
              // console.log('onChange-treeData', treeData);
              expandedKeys.value.splice(0, expandedKeys.value.length, ...ids.value);
              // console.log('expandedKeys=', expandedKeys);
              checkedKeys.value.splice(0, checkedKeys.value.length, ...ids.value);
              // console.log('checkedKeys=', checkedKeys);
              // 4. 禁用勾选
              ids.value.forEach((element) => {
                // console.log('element: ', element);
                const foundObject = findObjectById(treeData, element);
                // console.log('foundObject: ', foundObject);
                if (foundObject) {
                  foundObject.disableCheckbox = true;
                }
              });
              // 5. 获取1、2级节点
              // 获取展开树的父节点，用于 expandedKeys 默认展开
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
              SecondNodeList.value = defaultexpandNode.filter(
                (id) => !FirstNodeList.value.includes(id),
              );
            } catch (error) {
              console.log(error);
            } finally {
              //
            }
          },
        },
        required: true,
      },
      {
        field: 'defaultDeliveryUnitId',
        label: '默认外送',
        component: 'ApiSelect',
        colProps: { span: 15 },
        required: false, // 允许不填
        componentProps: {
          api: async (params) => {
            // console.log('params', params);
            const response = await getDefaultDeliveryApi(params);
            return response;
          },
          resultField: 'result',
          labelField: 'name',
          valueField: 'id',
        },
      },
      {
        field: 'priceCoefficient',
        label: '折扣系数',
        component: 'InputNumber',
        // colProps: { span: 20 },
        required: true,
        ifShow: userStore?.userInfo?.isSuper,
        defaultValue: 1,
      },
      {
        field: 'projectName',
        label: '项目名称',
        slot: 'customSlot',
        // component: 'Input',
        // colProps: { span: 20 },
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
      // 1. 项目树获取
      // const projectTree = await getProjectTreeApi(null);
      const projectTree = await getProjectTree();
      inittreeData.splice(0, inittreeData.length, ...projectTree);
      // 初始化勾选和展开的节点
      expandedKeys.value.splice(0, expandedKeys.value.length, ...[]);
      checkedKeys.value.splice(0, checkedKeys.value.length, ...[]);
    }
    resetFields();
    setModalProps({ confirmLoading: false });
  });

  const getTitle = computed(() => {
    // console.log('!unref(moadlType), ', !unref(moadlType));
    switch (unref(moadlType)) {
      case MoadlType.ADD_PROJECT:
        return '新增合作项目';
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
      if (moadlType.value == MoadlType.ADD_PROJECT) {
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

        let selectProjectIdsList: number[] = [];
        resultFoundObjects.forEach((item) => selectProjectIdsList.push(item.id));

        // 1.获取新增项目填写内容
        const formData = {
          projectIds: selectProjectIdsList,
          userGroupId: values.userGroupName,
          priceCoefficient: values.priceCoefficient,
          defaultDeliveryUnitId: values.defaultDeliveryUnitId,
        };
        // console.log('formData:', formData);
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
      redo();
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
    autoExpandParent.value = true;
  };

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

  const handleSelect = (selectedKeys, { selected, selectedNodes, node }) => {
    // console.log('选中的Node，看看属性:', node);
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
