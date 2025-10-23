<template>
  <PageWrapper fixedHeight dense contentFullHeight contentClass="flex">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-row :gutter="[8, 8]">
          <a-col>
            <div style="position: relative">
              <a-button type="primary" @click="toggleExportOptions">导出</a-button>
              <div
                v-if="showExportOptions"
                class="export-options"
                style="position: absolute; z-index: 1000; top: 36px; left: 0"
                @mouseleave="hideExportOptions"
              >
                <div @click="handleExport('All')" class="export_options_sub">全部</div>
                <div @click="handleExport('UnitOut')" class="export_options_sub"
                  >按送检单位导出</div
                >
                <div @click="handleExport('ProjOut')" class="export_options_sub">按项目导出</div>
              </div>
            </div>
          </a-col>
        </a-row>
      </template>
    </BasicTable>
  </PageWrapper>
</template>

<script setup lang="ts">
  import { ref, h, reactive } from 'vue';
  import { BasicTable, useTable, BasicColumn } from '@/components/Table';
  import { getProjectListApi } from '@/views/sampleos/sample/inspectionMission/inspectionMissionApi';
  import { TableDataApi, getNotInternalGroupApi } from './billStatisticsApi';
  import { jsonToSheetXlsx } from '@/components/Excel';
  import { Tooltip } from 'ant-design-vue';
  import dayjs from 'dayjs';

  // 表格查询条件
  let fullFormConfig = ref();

  interface GroupNameItem {
    groupName: string;
    id: number;
  }

  // 单位列表
  const unit_list = ref<GroupNameItem[]>([]);

  // // 获取表格数据
  // const dataSource = [
  //   {
  //     projectName: 'Y染色体微缺失',
  //     timeGroup: '所有',
  //     totalNum: 2,
  //     price: 315,
  //     totalPrice: 245.7,
  //     groupDataMap: {
  //       // 组id
  //       '19': {
  //         //送检量
  //         num: 1,
  //         // 总费用
  //         totalPrice: 141.75,
  //         // 结算单价
  //         settlementPrice: 141.75,
  //       },
  //       // 组id
  //       '26': {
  //         num: 1,
  //         totalPrice: 103.95,
  //         settlementPrice: 103.95,
  //       },
  //     },
  //   },
  // ];
  // console.log('dataSource-flatten: ', groupDataMapFlatten(dataSource));

  /** 获取单位列表，动态触发表格列 */
  getNotInternalGroupApi({ scene: 'fillIn' })
    .then((data) => {
      unit_list.value = data.result;
    })
    .then(() => {
      /** 动态触发表格列 */
      setColumns(getMultipleHeaderColumns());
    });

  /** 表格列配置 */
  function getMultipleHeaderColumns(): BasicColumn[] {
    return [
      {
        title: '项目',
        dataIndex: 'projectName',
        width: 200,
        fixed: 'left',
        sorter: (a, b) => {
          return a.projectName.localeCompare(b.projectName);
        },
        customRender: ({ text }) => {
          return h(Tooltip, { title: text }, () =>
            h(
              'span',
              {
                style: {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-block',
                  maxWidth: '100%',
                },
              },
              text,
            ),
          );
        },
      },
      {
        title: '时间',
        // dataIndex: 'time',
        dataIndex: 'timeGroup',
        width: 100,
        fixed: 'left',
        sorter: (a, b) => {
          return a.timeGroup.localeCompare(b.timeGroup);
        },
        customRender: ({ text, record, index }) => {
          return h(Tooltip, { title: text }, () => h('span', text));
          // return text ? <span>{text}个</span> : <span>-</span>;
        },
      },
      {
        title: '标准收费',
        dataIndex: 'price',
        width: 100,
        sorter: (a, b) => {
          return a.price - b.price;
        },
        customRender: ({ text, record, index }) => {
          return text ? h(Tooltip, { title: text }, () => h('span', '￥' + text)) : '-';
        },
      },
      {
        title: '所有单位',
        dataIndex: 'total',
        width: 200,
        children: [
          {
            title: '送检量',
            dataIndex: 'totalNum',
            width: 100,
            sorter: (a, b) => {
              return a.totalNum - b.totalNum;
            },
            customRender: ({ text, record, index }) => {
              return text ? h(Tooltip, { title: text }, () => h('span', text + '个')) : '-';
              // return text ? <span>{text}个</span> : <span>-</span>;
            },
          },
          {
            title: '总金额',
            dataIndex: 'totalPrice',
            width: 100,
            sorter: (a, b) => {
              return a.totalPrice - b.totalPrice;
            },
            customRender: ({ text, record, index }) => {
              return text ? h(Tooltip, { title: text }, () => h('span', '￥' + text)) : '-';
              // return text ? <span>￥{text}</span> : <span>-</span>;
            },
          },
        ],
      },
      {
        title: '送检单位',
        dataIndex: 'groupDataMap',
        children: unit_list.value.map((item) => {
          return {
            title: item.groupName,
            dataIndex: `${item.id}`,
            width: 200,
            children: [
              {
                title: '送检量',
                dataIndex: 'num_' + item.id,
                width: 100,
                sorter: (a, b, sortOrder) => {
                  const valueA = a['num_' + item.id];
                  const valueB = b['num_' + item.id];
                  const isNilA = valueA === null || valueA === undefined;
                  const isNilB = valueB === null || valueB === undefined;

                  if (isNilA && isNilB) {
                    return 0; // 两个都是空值，认为相等
                  }
                  if (sortOrder === 'ascend') {
                    if (isNilA) {
                      return 1; // A 是空值，放到 B 后面
                    }
                    if (isNilB) {
                      return -1; // B 是空值，放到 A 后面
                    }
                  } else if (sortOrder === 'descend') {
                    if (isNilA) {
                      return -1;
                    }
                    if (isNilB) {
                      return 1;
                    }
                  }

                  // 正常的数值比较
                  return valueA - valueB;
                },
                sortDirections: ['ascend', 'descend'], // 允许升序和降序
                customRender: ({ text, record, index }) => {
                  return text ? h(Tooltip, { title: text }, () => h('span', text + '个')) : '-';
                },
              },
              {
                title: '结算单价',
                dataIndex: 'settlementPrice_' + item.id,
                width: 100,
                sorter: (a, b, sortOrder) => {
                  const valueA = a['settlementPrice_' + item.id];
                  const valueB = b['settlementPrice_' + item.id];
                  const isNilA = valueA === null || valueA === undefined;
                  const isNilB = valueB === null || valueB === undefined;

                  if (isNilA && isNilB) {
                    return 0; // 两个都是空值，认为相等
                  }
                  if (sortOrder == 'ascend') {
                    if (isNilA) {
                      return 1; // A 是空值，放到 B 后面
                    }
                    if (isNilB) {
                      return -1; // B 是空值，放到 A 后面
                    }
                  } else if (sortOrder == 'descend') {
                    if (isNilA) {
                      return -1;
                    }
                    if (isNilB) {
                      return 1;
                    }
                  }
                },
                customRender: ({ text, record, index }) => {
                  return text ? h(Tooltip, { title: text }, () => h('span', '￥' + text)) : '-';
                },
              },
              {
                title: '总金额',
                dataIndex: 'price_' + item.id,
                width: 100,
                sorter: (a, b, sortOrder) => {
                  const valueA = a['price_' + item.id];
                  const valueB = b['price_' + item.id];
                  const isNilA = valueA === null || valueA === undefined;
                  const isNilB = valueB === null || valueB === undefined;

                  if (isNilA && isNilB) {
                    return 0; // 两个都是空值，认为相等
                  }
                  if (sortOrder == 'ascend') {
                    if (isNilA) {
                      return 1; // A 是空值，放到 B 后面
                    }
                    if (isNilB) {
                      return -1; // B 是空值，放到 A 后面
                    }
                  } else if (sortOrder == 'descend') {
                    if (isNilA) {
                      return -1;
                    }
                    if (isNilB) {
                      return 1;
                    }
                  }

                  // 正常的数值比较
                  return valueA - valueB;
                },
                customRender: ({ text, record, index }) => {
                  return text ? h(Tooltip, { title: text }, () => h('span', '￥' + text)) : '-';
                },
              },
            ],
          };
        }),
      },
    ];
  }

  // groupDataMap 扁平化
  function groupDataMapFlatten(data) {
    data.forEach((item) => {
      if (item.groupDataMap) {
        Object.entries(item.groupDataMap).forEach(([groupKey, groupItem]) => {
          const groupId = groupKey;
          const numKey = `num_${groupId}`;
          const priceKey = `price_${groupId}`;
          const settlementPriceKey = `settlementPrice_${groupId}`;

          item[numKey] = groupItem.num;
          item[priceKey] = groupItem.totalPrice;
          item[settlementPriceKey] = groupItem.settlementPrice;
        });
      }
    });
    return data;
  }

  const [registerTable, { setColumns, getColumns }] = useTable({
    title: '账单汇总统计',
    api: async (params) => {
      // 接收表格查询的条件
      fullFormConfig.value = params;
      const rsp = await TableDataApi(params);
      return rsp.result;
    },
    afterFetch: (data) => {
      // console.log('afterFetch: data:', data);
      return groupDataMapFlatten(data);
    },
    // dataSource: dataSource,
    columns: [],
    bordered: true,
    striped: false,
    showIndexColumn: false,
    useSearchForm: true,
    pagination: { pageSize: 25 },
    formConfig: {
      autoAdvancedLine: 1,
      alwaysShowLines: 1,
      actionColOptions: {
        span: 4,
        style: { textAlign: 'right' },
      },
      schemas: [
        {
          field: `projectIds`,
          label: `项目`,
          component: 'ApiSelect',
          labelWidth: '50px',
          colProps: {
            span: 8,
          },
          componentProps: {
            api: getProjectListApi,
            labelField: 'projectName',
            valueField: 'id',
            mode: 'multiple',
            showSearch: true,
            maxTagCount: 2,
            placeholder: '默认所有',
            filterOption: (input, option) => {
              if (option?.label.includes(input)) {
                return true;
              }
              // console.log('input:', input);
              // console.log('option:', option);
              return false;
            },
          },
        },
        {
          field: 'timeGroup',
          component: 'Select',
          label: '时间分类',
          labelWidth: '80px',
          colProps: {
            span: 4,
          },
          defaultValue: '所有',
          componentProps: {
            options: [
              {
                label: '所有',
                value: '',
                key: '1',
              },
              {
                label: '按年份',
                value: 'y',
                key: '2',
              },
              {
                label: '按月份',
                value: 'm',
                key: '3',
              },
              {
                label: '按天数',
                value: 'd',
                key: '4',
              },
            ],
          },
        },
        {
          field: 'creationTime',
          label: '时间范围',
          component: 'RangePicker',
          labelWidth: '100px',
          componentProps: {
            format: 'YYYY-MM-DD',
            placeholder: ['开始日期', '结束日期'],
            // showTime: { format: 'HH:mm:ss' },
          },
          colProps: {
            // span: 8,
          },
        },
      ],
    },
    beforeFetch(info) {
      // console.log('beforeFetch', info);
      const processDateRange = (dateRange: string[]) => {
        if (!dateRange || dateRange.length !== 2) return null;

        return [
          dayjs(dateRange[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
          dayjs(dateRange[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        ];
      };

      // 处理时间范围
      if (info.creationTime) {
        info.creationTime = processDateRange(info.creationTime);
      }
      return info;
    },
  });

  // 获取当前时间
  function getCurrentTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  // 导出
  const showExportOptions = ref(false);
  const toggleExportOptions = () => {
    showExportOptions.value = !showExportOptions.value;
  };
  const hideExportOptions = () => {
    showExportOptions.value = false;
  };
  function handleExport(option) {
    try {
      exportTableDataToExcel(option);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }

  /** 根据导出条件参数，指定文件名需要带的名称 */
  function outFilename(condtion) {
    /**
     * All:     导出全部
     * UnitOut: 按送检单位导出
     * ProjOut: 按项目导出
     */
    switch (condtion) {
      case 'All':
        return `账单汇总统计表_导出全部_${getCurrentTime()}.xlsx`;
      case 'UnitOut':
        return `账单汇总统计表_按送检单位导出_${getCurrentTime()}.xlsx`;
      case 'ProjOut':
        return `账单汇总统计表_按项目导出_${getCurrentTime()}.xlsx`;
    }
  }

  /** 根据选项获取表格内的数据 */
  type AnyObject = Record<string, unknown>;

  /** 过滤掉不需要导出的单位列 */
  const filterUnitObjects = (arr: AnyObject[]): AnyObject[] => {
    return arr.map((obj) => {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        if (!/^(num|price_|settlementPrice)/i.test(key)) {
          acc[key] = value;
        }
        return acc;
      }, {} as AnyObject);
    });
  };
  function outdataProcess(option, data) {
    if (option === 'UnitOut') {
      data.forEach((element) => {
        delete element.totalNum;
        delete element.totalPrice;
      });
    } else if (option === 'ProjOut') {
      data = filterUnitObjects(data);
      // console.log('after-filterUnitObjects', data);
    }
    return data;
  }

  async function exportTableDataToExcel(option) {
    // 1. 获取导出列名
    let TableHeader = getTableHeader(option);

    const formData = {
      ...fullFormConfig.value, // 搜索栏填写的参数
    };

    // 2. 添加表格数据
    const { result } = await TableDataApi(formData);
    // console.log('origin-result', groupDataMapFlatten(result));

    // final. 导出数据
    jsonToSheetXlsx({
      data: outdataProcess(option, groupDataMapFlatten(result)),
      header: TableHeader,
      filename: outFilename(option),
    });
  }

  /** 获取单位表头 */
  function getTableHeader(option) {
    let unit_col = ref<any>([]);
    unit_col.value = getColumns().filter((node_lv1) => node_lv1.title == '送检单位')[0].children;
    // console.log('unit_col', unit_col);

    // 获取单位送检量、总金额
    const dict_unit = {};
    for (let i = 0; i < unit_col.value.length; i++) {
      dict_unit['num_' + unit_col.value[i].dataIndex] = unit_col.value[i].title + '送检量';
      dict_unit['settlementPrice_' + unit_col.value[i].dataIndex] =
        unit_col.value[i].title + '结算单价';
      dict_unit['price_' + unit_col.value[i].dataIndex] = unit_col.value[i].title + '总金额';
    }

    if (option == 'All') {
      return {
        projectName: '项目',
        timeGroup: '时间',
        price: '标准收费',
        totalNum: '送检量',
        totalPrice: '总金额',
        ...dict_unit,
      };
    } else if (option == 'UnitOut') {
      return {
        projectName: '项目',
        timeGroup: '时间',
        price: '标准收费',
        ...dict_unit,
      };
    } else if (option == 'ProjOut') {
      return {
        projectName: '项目',
        timeGroup: '时间',
        price: '标准收费',
        totalNum: '送检量',
        totalPrice: '总金额',
      };
    }
  }
</script>

<style scoped>
  .export-options {
    z-index: 1000;
    min-width: 130px;
    padding: 5px 0;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
  }

  .export_options_sub {
    padding: 5px 10px;
    color: black;
    font-size: 11px;
    cursor: pointer;
    user-select: none;
  }

  .export_options_sub:hover {
    background-color: #fcfcc4;
  }
</style>
