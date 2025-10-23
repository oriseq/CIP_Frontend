<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :minHeight="50"
    width="800px"
    :title="getTitle"
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
      <template #customSlot2="{ model, field }">
        <!--        <BasicUpload
          :maxSize="2"
          :maxNumber="10"
          @change="handleChange"
          helpText="单个文件不超过2MB，最多只能上传10个文件，请注意同名文件新文件会覆盖旧文件"
          :api="uploadApi"
          :value="uploadFiles"
          :previewColumns="[
            // {
            //   title: 'url5',
            //   dataIndex: 'url5',
            // },
            // {
            //   title: 'type5',
            //   dataIndex: 'type5',
            // },
            {
              title: '文件名',
              dataIndex: 'name',
            },
            {
              title: '操作',
              dataIndex: '',
              customRender: ({ record }) => {
                return createVNode(
                  Button,
                  {
                    onclick: () => {
                      console.log(record);
                      createMessage.success(`请到控制台查看该行输出结果`);
                    },
                  },
                  () => '点我输出该行信息',
                );
              },
            },
          ]"
          :beforePreviewData="beforePreviewData"
        />-->
      </template>
    </BasicForm>
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
  import { getProjectTreeApi, updateSampleInformationApi } from './escrowSampleApi';
  import { Alert, Button } from 'ant-design-vue';
  import { BasicUpload } from '@/components/Upload';
  import { getTagColor } from '../inspectionMission/fieldMapping';

  defineOptions({ name: 'AccountModal' });

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const isUpdate = ref(true);
  const rowId = ref('');

  // 树
  const expandedKeys = ref<string[]>();
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

  // 文件
  const uploadFiles = ref([]);
  const fileInfos = ref([]);

  function handleChange(list) {
    createMessage.info(`已上传文件${JSON.stringify(list)}`);
  }
  function beforePreviewData(arg) {
    console.log('beforePreviewData:arg：', arg);
    console.log('uploadFiles', uploadFiles.value);
    console.log('fileInfos', fileInfos.value);
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
        console.log('item:', item);
        return {
          // url5: item,
          // type5: item.split('.').pop() || '',
          name: item?.originalFileName || '',
        };
      });
    return data;
  }

  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
    labelWidth: 105,
    baseColProps: { span: 24 },
    schemas: [
      {
        field: `name`,
        label: `姓名`,
        component: 'Input',
        // colProps: {
        //   span: 5,
        // },
      },
      {
        field: 'sex',
        component: 'Select',
        label: '性别',
        // colProps: {
        //   span: 5,
        // },
        componentProps: {
          options: [
            {
              label: '男',
              value: 1,
              key: '1',
            },
            {
              label: '女',
              value: 2,
              key: '2',
            },
            {
              label: '未知',
              value: 3,
              key: '3',
            },
          ],
        },
      },
      {
        field: `age`,
        label: `年龄`,
        component: 'InputNumber',
        // colProps: {
        //   span: 5,
        // },
      },
      {
        field: 'birthday',
        component: 'DatePicker',
        label: '出生日期',
        // colProps: {
        //   span: 5,
        // },
      },
      {
        field: 'logisticsTrackingNumber',
        component: 'Input',
        label: '物流单号',
      },
      {
        field: 'phoneNumLastFour',
        component: 'InputNumber',
        label: '手机号后四位',
        helpMessage: '物流手机号后四位',
      },
      {
        field: 'projects',
        label: '项目',
        slot: 'customSlot',
      },
      // {
      //   field: 'fieldsc',
      //   label: '附件-1',
      //   slot: 'customSlot2',
      // },
      // {
      //   field: 'files',
      //   component: 'Upload',
      //   label: '附件',
      //   componentProps: {
      //     previewColumns: [
      //       // {
      //       //   title: 'url5',
      //       //   dataIndex: 'url5',
      //       // },
      //       // {
      //       //   title: 'type5',
      //       //   dataIndex: 'type5',
      //       // },
      //       {
      //         title: '文件名',
      //         dataIndex: 'name',
      //       },
      //       {
      //         title: '操作',
      //         dataIndex: '',
      //         customRender: ({ record }) => {
      //           return createVNode(
      //             Button,
      //             {
      //               onclick: () => {
      //                 console.log(record);
      //                 createMessage.success(`请到控制台查看该行输出结果`);
      //               },
      //             },
      //             () => '点我输出该行信息',
      //           );
      //         },
      //       },
      //     ],
      //     beforePreviewData: (arg) => {
      //       console.log('beforePreviewData:arg：', arg);
      //       console.log('uploadFiles', uploadFiles.value);
      //       console.log('fileInfos', fileInfos.value);
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
      //           console.log('item:', item);
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
      //   },
      // },
    ],
    showActionButtonGroup: false,
    actionColOptions: {
      span: 23,
    },
  });

  // console.log('getExpandedKeys: ', getExpandedKeys());

  const [registerModal, { setModalProps, closeModal, changeLoading }] = useModalInner(
    async (data) => {
      changeLoading(true);
      console.log('useModalInner:data:', data);
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

      // 设置文件信息
      // fileInfos.value.splice(0, fileInfos.value.length, ...data?.record?.fileInfos);
      // console.log('useModalInner:fileInfos: ', fileInfos);
      // expandedKeys清除
      expandedKeys.value = [];

      resetFields();
      setModalProps({ confirmLoading: false });
      isUpdate.value = !!data?.isUpdate;

      // console.log('projectTree: ', projectTree);
      if (data.record?.projects) {
        // 1 勾选已经确认的项目
        const selectedIds = data.record?.projects.map((item) => item.projectId);
        // expandedKeys.value.push('c-11');
        // console.log('parentIds: ', parentIds);
        expandedKeys.value.splice(0, expandedKeys.value.length, ...selectedIds);
        checkedKeys.value.splice(0, checkedKeys.value.length, ...selectedIds);
        // console.log('selectedIds: ', selectedIds);
        // 2 更新状态
        data.record?.projects.forEach((element) => {
          // console.log('element: ', element);
          const foundObject = findObjectById(treeData, element.projectId);
          // console.log('foundObject: ', foundObject);
          if (foundObject) {
            foundObject.status = element.projectStatus;
            // 加上不可勾选
            foundObject.disableCheckbox = true;
          }
        });
      }

      // 修改信息的部分
      if (unref(isUpdate)) {
        rowId.value = data.record.id;
        // 得到权限
        setFieldsValue({
          ...data.record,
          birthday: dayjs(`${data.record.birthday}`, 'YYYY-MM-DD'),
        });
      }

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
      changeLoading(false);
    },
  );

  const getTitle = computed(() => (!unref(isUpdate) ? '新增账号' : '编辑信息'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      console.log('values:', values);
      console.log('rowId:', rowId);

      // 项目数据
      const foundObjects = getSelectedObject();
      console.log('foundObjects', foundObjects);
      const formData = { ...values, projects: foundObjects, id: rowId.value };
      console.log('formData:', formData);

      // 发请求
      const data = await updateSampleInformationApi(formData);
      console.log('data', data);
      if (data.success) {
        success(data.message);
      } else {
        // const megdetail = data.result.join(',');
        error(data.message);
        return;
      }

      closeModal();
      emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
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
      // 并且保留新的项目
      .filter((item) => !item.disableCheckbox)
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
    if (itemToUpdate) {
      if (itemToUpdate.status == 1) {
        itemToUpdate.status = 2;
      } else if (itemToUpdate.status == 2) {
        itemToUpdate.status = 1;
      }
    }
    // console.log(selectedProjects);
  };

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
    console.log('onExpand keys:', keys);
    expandedKeys.value = keys;
    autoExpandParent.value = false;
  };

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
    console.log('选中的Node，看看属性:', node);
    const target = nativeEvent.target;
    if (target.className.includes('ant-tag')) {
      console.log('点击tag');
      changeStatus(node.id);
      return;
    } else {
      // console.log('点击树文本');
    }

    handleSelectSub(node);

    // 最外层处理1级节点的取消问题
    // console.log('FirstNodeList.value', FirstNodeList.value);
    if (node.checked && FirstNodeList.value.includes(node?.id)) {
      console.log('选中了1级文本，查看1级节点：', node);
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
