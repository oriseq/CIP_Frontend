<template>
  <List :class="prefixCls" :pagination="getPagination">
    <template v-for="item in getData" :key="item.id">
      <List.Item class="list-item">
        <List.Item.Meta>
          <template #title>
            <div class="title">
              <Typography.Paragraph
                style="margin-bottom: 12px; font-size: 18px"
                :delete="!!item.titleDelete"
                :ellipsis="
                  titleRows && titleRows > 0 ? { rows: titleRows, tooltip: !!item.title } : false
                "
                :content="item.title"
              />
            </div>
          </template>

          <template #avatar>
            <Avatar v-if="item.avatar" class="avatar" :src="item.avatar" />
            <span v-else> {{ item.avatar }}</span>
          </template>

          <template #description>
            <div>
              <div class="description" v-if="item.description">
                <Typography.Paragraph
                  :ellipsis="
                    descRows && descRows > 0
                      ? { rows: descRows, tooltip: !!item.description }
                      : false
                  "
                  :content="item.description"
                />
              </div>
              <div style="display: flex; flex-direction: row; justify-content: space-between">
                <div>
                  <Tag class="mb-2" v-if="item.secondaryType"> {{ item.secondaryType }} </Tag>
                  <Tag class="tag" :color="item.color" v-if="item.type == MessageType.TODO">
                    {{ item.extra }}
                  </Tag>
                </div>
                <span class="datetime">
                  {{ item.datetime }}
                </span>
              </div>
            </div>
          </template>
        </List.Item.Meta>
      </List.Item>
    </template>
  </List>
</template>
<script lang="ts" setup>
  import { computed, PropType, ref, watch, unref } from 'vue';
  import { ListItem } from './data';
  import { useDesign } from '@/hooks/web/useDesign';
  import { List, Avatar, Tag, Typography } from 'ant-design-vue';
  import { isNumber } from '@/utils/is';
  import { MessageType } from '@/hooks/message/useMessageNotify';

  const props = defineProps({
    list: {
      type: Array as PropType<ListItem[]>,
      default: () => [],
    },
    pageSize: {
      type: [Boolean, Number] as PropType<Boolean | Number>,
      default: 10,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    titleRows: {
      type: Number,
      default: 1,
    },
    descRows: {
      type: Number,
      default: 2,
    },
    onTitleClick: {
      type: Function as PropType<(Recordable) => void>,
    },
  });

  const emit = defineEmits(['update:currentPage']);

  const { prefixCls } = useDesign('header-notify-list');
  const current = ref(props.currentPage || 1);
  const curPageSize = ref(props.pageSize || 10);
  const getData = computed(() => {
    const { pageSize, list } = props;
    if (pageSize === false) return [];
    let size = isNumber(curPageSize.value) ? curPageSize.value : 5;
    return list.slice(size * (unref(current) - 1), size * unref(current));
  });
  watch(
    () => props.currentPage,
    (v) => {
      current.value = v;
    },
  );
  const getPagination = computed(() => {
    const { list, pageSize } = props;

    // compatible line 104
    // if typeof pageSize is boolean, Number(true) && 5 = 5, Number(false) && 5 = 0
    const size = isNumber(pageSize) ? pageSize : Number(pageSize) && 5;

    if (size > 0 && list && list.length > size) {
      return {
        total: list.length,
        pageSize: unref(curPageSize),
        current: unref(current),
        onChange(page, pageSize) {
          current.value = page;
          console.log('page:', page);
          console.log('pageSize:', pageSize);
          curPageSize.value = pageSize;
          emit('update:currentPage', page);
        },
        // size: 'small',
      };
    } else {
      return false;
    }
  });

  function handleTitleClick(item: ListItem) {
    props.onTitleClick && props.onTitleClick(item);
  }
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-header-notify-list';

  .@{prefix-cls} {
    &::-webkit-scrollbar {
      display: none;
    }

    ::v-deep(.ant-pagination-disabled) {
      display: inline-block !important;
    }

    .list-item {
      padding: 6px;
      overflow: hidden;
      transition: all 0.3s;
      cursor: pointer;

      .title {
        margin-bottom: 8px;
        font-weight: normal;

        .extra {
          margin-top: -1.5px;
          margin-right: 0;
          float: right;
          font-weight: normal;
          margin-top: auto;

          .tag {
            margin-right: 0;
          }
        }
      }

      .avatar {
        margin-top: 4px;
      }

      .description {
        font-size: 12px;
        line-height: 18px;
      }

      .description2 {
      }

      .datetime {
        margin-top: 4px;
        font-size: 12px;
        line-height: 18px;
      }
    }
  }
</style>
