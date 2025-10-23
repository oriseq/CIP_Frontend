<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="项目排序"
    :minHeight="0"
    width="800px"
    @ok="handleOk"
    @cancel="handleCancel"
    :useWrapper="true"
  >
    <draggable
      v-if="projectsList.length > 0"
      :list="projectsList"
      :disabled="!enabled"
      item-key="name"
      item-value="id"
      class="list-group"
      ghost-class="ghost"
      :move="checkMove"
      @start="dragging = true"
      @end="dragging = false"
    >
      <template #item="{ element, index }">
        <div class="list-group-item" :class="{ 'not-draggable': !enabled }">
          {{ index + 1 }}.&nbsp;{{ element.name }}
        </div>
      </template>
    </draggable>
    <span v-else>没有任何勾选的项目需要被排序</span>
  </BasicModal>
</template>

<script setup lang="ts">
  import { ref, defineOptions } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import draggable from 'vuedraggable';

  const emit = defineEmits(['success', 'register']);

  defineOptions({ name: 'SortProjectModal' });
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false,
    },
    projectsList: {
      type: Array,
      default: () => [],
    },
  });

  // 1. 接收传入的项目列表
  const projectsList = ref(props.projectsList);

  // 使用 ref 定义响应式数据
  const enabled = ref(true);
  const dragging = ref(false);

  const checkMove = (e) => {
    // console.log('Future index: ' + e.draggedContext.futureIndex);
    // console.log('checkMove: projectsList', projectsList.value);
  };

  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    projectsList.value = data.projectsList;
    // console.log('Sort: projectsList', projectsList.value);
  });

  function handleOk() {
    emit('success', { checkedKeys: projectsList.value.map((item) => item?.id) });
    closeModal();
  }

  function handleCancel() {
    closeModal();
  }
</script>

<style scoped>
  :global(.scrollbar .scroll-container) {
    padding: 0 14px;
  }

  .buttons {
    margin-top: 35px;
  }

  .ghost {
    opacity: 0.5;
    background: #c8ebfb;
  }

  .not-draggable {
    cursor: no-drop;
  }

  .list-group-item {
    display: block;
    position: relative;
    box-sizing: border-box;
    padding: 0.5rem 1.25rem;
    border: 1px solid rgb(0 0 0 / 12.5%);
    background-color: #d7eef6;
    color: #212529;
    font-size: 14px;
    line-height: 1;
    text-align: left;
    cursor: move; /** 鼠标指针变成拖拽图标 */
  }
</style>
