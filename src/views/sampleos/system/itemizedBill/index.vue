<template>
  <PageWrapper fixedHeight dense contentFullHeight>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-row :gutter="[8, 8]">
          <a-col>
            <div style="position: relative">
              <a-button type="primary" @click="handleExport">导出</a-button>
            </div>
          </a-col>
        </a-row>
      </template>
      <template #bodyCell="{ column, record, text }"> </template>
    </BasicTable>
  </PageWrapper>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { BasicTable, useTable } from '@/components/Table';
  import { getProjectListApi } from '@/views/sampleos/sample/inspectionMission/inspectionMissionApi';
  import { TableDataApi, getNotInternalGroupApi } from './itemizeBillApi';
  import { jsonToSheetXlsx } from '@/components/Excel';
  import { getTableColumns } from './data';
  import PageWrapper from '@/components/Page/src/PageWrapper.vue';
  import dayjs from 'dayjs';

  interface groupApiItem {
    id: number;
    groupName: string;
  }

  // 表格查询条件
  let fullFormConfig = ref();
  let groupList = ref<groupApiItem[]>([]);

  const [registerTable, { getColumns }] = useTable({
    title: '账单明细统计',
    api: async (params) => {
      // 接收表格查询的条件
      fullFormConfig.value = params;
      const rsp = await TableDataApi(params);
      // console.log('TableDataApi-rsp:', rsp);
      return rsp.result;
    },
    columns: getTableColumns(),
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
          field: 'useGroupId',
          label: '送检单位',
          component: 'ApiSelect',
          labelWidth: '80px',
          colProps: {
            span: 4,
          },
          componentProps: {
            api: async () => {
              return await getNotInternalGroupApi({ scene: 'fillIn' });
            },
            afterFetch: (info) => {
              groupList.value = info.result;
              // console.log('info.result:', info.result);
            },
            labelField: 'groupName',
            valueField: 'id',
            resultField: 'result',
          },
        },
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
  function handleExport() {
    try {
      exportTableDataToExcel();
    } catch (error) {
      console.error('Export failed:', error);
    }
  }

  /** 只从键值对取目标数组指定的键 */
  function filterByKeys(data: any[], keys: string[]) {
    return data.map((item) =>
      keys.reduce(
        (acc, key) => {
          if (item.hasOwnProperty(key)) {
            acc[key] = item[key];
          }
          return acc;
        },
        {} as Record<string, any>,
      ),
    );
  }

  /** 导出文件名设置 */
  function outFileName(formData): string {
    // 1. 从搜索条件中获取字段
    const { useGroupId, creationTime } = formData;
    // console.log('formData:', formData);

    // 导出文件名称
    let setfileName = ['对账单'];

    // 获取送检单位名称
    let targetItem = groupList.value.filter((item) => item.id === useGroupId)[0];
    if (targetItem) {
      setfileName.push(targetItem?.groupName);
    }
    if (creationTime) {
      let createTionList = [];
      createTionList.push(creationTime[0].split(' ')[0].split('-').join(''));
      createTionList.push(creationTime[1].split(' ')[0].split('-').join(''));
      setfileName.push(createTionList.join('_'));
    }

    // 导出时间
    setfileName.push(`${getCurrentTime()}.xlsx`);

    // 最终拼接文件名
    return setfileName.join('-');
  }

  // 备注拼接
  function remarkMaker(project_remarks, sample_remarks) {
    if (project_remarks && sample_remarks) {
      return `【样本】${sample_remarks}，【项目】${project_remarks} `;
    } else if (project_remarks) {
      return `【项目】${project_remarks}`;
    } else if (sample_remarks) {
      return `【样本】${sample_remarks}`;
    } else {
      return '-';
    }
  }

  /** 导出表格数据为Excel文件 */
  async function exportTableDataToExcel() {
    // 1. 获取导出列名
    let TableHeader = getColumns().reduce<Record<string, string>>((acc, item) => {
      if (item.dataIndex && typeof item.dataIndex === 'string') {
        acc[item.dataIndex as string] = String(item.title ?? '');
      }
      return acc;
    }, {});

    // 导出时需要带上备注
    TableHeader['remarks'] = '备注';

    const formData = {
      ...fullFormConfig.value, // 搜索栏填写的参数
    };
    // 2. 添加表格数据
    const { result } = await TableDataApi(formData);
    console.log('origin-result', result);
    // 3. 为每一行加备注
    result.forEach((item) => {
      item.remarks = remarkMaker(item.projectRemarks, item.sampleRemarks);
    });

    // 计算结算单价的总和
    let SumDiscountedPrice = result.reduce((acc, item) => {
      return acc + item.discountedPrice;
    }, 0);
    // 计算标准收费的总和
    let SumPrice = result.reduce((acc, item) => {
      return acc + item.price;
    }, 0);
    // 最后一行汇总
    let finalResult = [
      {
        creationTime: '-',
        discountedPrice: SumDiscountedPrice,
        name: '-',
        price: SumPrice,
        projectName: '-',
        sampleId: '-',
        remarks: '-',
      },
    ];
    result.push(...finalResult);

    // final. 导出数据
    jsonToSheetXlsx({
      data: filterByKeys(result, Object.keys(TableHeader)),
      header: TableHeader,
      filename: outFileName(formData),
    });
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
