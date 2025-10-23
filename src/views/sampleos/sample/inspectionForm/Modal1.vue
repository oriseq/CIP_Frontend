<template>
  <BasicModal
    v-bind="$attrs"
    destroyOnClose
    @register="register"
    title="新增项目"
    :helpMessage="['选择需要提交的项目']"
    @open-change="handleShow"
    @ok="ok"
  >
    <template #insertFooter>
      <div style="padding-bottom: 10px; text-align: start">
        共计{{ props.countProject }}个可选择项目，已选择<span style="font-size: x-large">{{
          determinedProject.status1
        }}</span
        >个<a-tag style="margin: 0; cursor: default" @mousedown.prevent color="#f499a8">待定</a-tag
        >项目，已选择<span style="font-size: x-large">{{ determinedProject.status2 }}</span
        >个<a-tag style="margin: 0; cursor: default" @mousedown.prevent color="#f9ca24">确定</a-tag
        >项目
      </div>
      <!-- <a-button type="primary" danger @click="setLines" :disabled="loading">点我更新内容</a-button> -->
    </template>
    <!-- <template v-if="loading">
      <div class="h-full text-center line-height-100px">加载中，稍等3秒……</div>
    </template> -->
    <template v-if="!loading">
      <!-- <ul>
        <li v-for="index in lines" :key="index">加载完成{{ index }}！</li>
      </ul> -->
      <div>
        <div
          >
          <a-input-search v-model:value="searchValue" style="margin-bottom: 8px" placeholder="搜索" />
          <a-tree
            :autoExpandParent="autoExpandParent"
            v-model:expanded-keys="expandedKeys"
            v-model:selectedKeys="selectedKeys"
            v-model:checkedKeys="checkedKeys"
            checkable
            :tree-data="treeData"
            :field-names="fieldNames"
            @expand="onExpand"
            v-if="treeData.length"
          >
            <template #title="{ name, id, status }">
              <!-- <span v-if="status" style="color: #1890ff">{{ name }}: {{ id }}</span> -->
              <!-- <span v-if="key === '0-0-1-0'" style="color: #1890ff">{{ name }}</span> -->
              <!-- <template v-else>{{ name }}</template> -->
              <!-- <span v-else>{{ name }}: {{ id }}</span> -->
              <a-tag
                v-if="status && checkedKeys.includes(id)"
                style="cursor: default"
                @mousedown.prevent
                :color="getTagColor(status)"
                @click="changeStatus(id)"
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
      </div>
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, reactive, watch, computed } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import type { TreeProps } from 'ant-design-vue';
  import { getTagColor } from '../inspectionMission/fieldMapping';

  const props = defineProps(['sledPjt', 'classProjects', 'insertProject', 'countProject']);

  const loading = ref(true);
  const [register, { closeModal, setModalProps, redoModalHeight }] = useModalInner();

  function handleShow(open: boolean) {
    if (open) {
      setModalProps({ loading: true, confirmLoading: true });
      loading.value = true;
      loading.value = false;
      setModalProps({ loading: false, confirmLoading: false });
    }
  }

  const fieldNames: TreeProps['fieldNames'] = {
    title: 'name',
    key: 'id',
  };

  const treeData: TreeProps['treeData'] = reactive([
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

  const expandedKeys = ref<string[]>();
  const selectedKeys = ref<string[]>([]);
  // console.log();
  const checkedKeys = ref<string[]>([]);

  watch(
    () => props.sledPjt,
    (newValue, oldValue) => {
      console.log('sledPjt changed:', newValue, oldValue);
      const ids = newValue.map((item) => item.id);
      // 更新树
      checkedKeys.value.splice(0, checkedKeys.value.length, ...ids);
      // 更新状态
      newValue.forEach((element) => {
        const foundObject = findObjectById(treeData, element.id);
        if (foundObject) {
          foundObject.status = element.status;
        }
      });
    },
  );

  // classProjects 更新树
  watch(
    () => props.classProjects,
    (newValue, oldValue) => {
      console.log('classProjects changed:', newValue, oldValue);
      // 更新树
      treeData.splice(0, treeData.length, ...newValue);
    },
  );

  // 计算待定项目
  const determinedProject = computed(() => {
    // 待定项目计算
    const result = getObjectsByIds(treeData, checkedKeys.value).reduce(
      (acc, item) => {
        if (item.status === 1) {
          acc.status1 += 1;
        } else if (item.status === 2) {
          acc.status2 += 1;
        }
        return acc;
      },
      { status1: 0, status2: 0 },
    );
    // console.log('determinedProject:', determinedProject);
    return result;
  });

  // 确认
  const ok = () => {
    // console.log(checkedKeys.value);
    let foundObjects = getObjectsByIds(treeData, checkedKeys.value);
    // console.log('foundObjects', foundObjects);
    // 只保留项目数据
    foundObjects = foundObjects
      .filter((item) => item.status)
      .map((item) => ({
        ...item,
        projectName: item.name,
      }));
    props.insertProject(foundObjects);
    // 关闭弹窗
    closeModal();
  };
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
  const classProjectsCount = computed(() => {
    console.log('classProjects:', classProjects);

    return classProjects.length;
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

  // watch(expandedKeys, () => {
  //   console.log('expandedKeys', expandedKeys);
  // });
  // watch(selectedKeys, () => {
  //   console.log('selectedKeys', selectedKeys);
  // });
  // watch(checkedKeys, () => {
  //   console.log('checkedKeys', checkedKeys);
  // });
  // watch(sledPjtIds, () => {
  //   console.log('sledPjtIds', sledPjtIds);
  // });

  const searchValue = ref<string>('');
  const autoExpandParent = ref<boolean>(true);
  // 搜索树相关
  watch(searchValue, value => {
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
          node.children.forEach(child => search(child));
        }
      }

      data.forEach(node => search(node));
      // console.log("result: ", results);

      // 取id
      const matchIds = results.map(item => item.id);

      return matchIds;
    }
    const matchIds = findIdsByName(treeData, value)
    // console.log("matchIds: ", matchIds);

    if (value) {
      expandedKeys.value = matchIds;
    }else {
      // console.log("selectedKeys.value: ", selectedKeys.value);
      expandedKeys.value = checkedKeys.value;
    }

    // console.log("expandedKeys.value:", expandedKeys.value);
    searchValue.value = value;
    autoExpandParent.value = true;
  });

  const onExpand = (keys: string[]) => {
    // console.log("onExpand keys:", keys);
    expandedKeys.value = keys;
    autoExpandParent.value = false;
  };

</script>
