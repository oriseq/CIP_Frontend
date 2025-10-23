import { BasicColumn } from '@/components/Table';
import { h } from 'vue';
import { Tooltip } from 'ant-design-vue';

export function getTableColumns(): BasicColumn[] {
  return [
    {
      title: '样本编号',
      dataIndex: 'sampleId',
      width: 80,
      fixed: 'left',
      resizable: true,
      sorter: (a, b) => {
        return a.sampleId.localeCompare(b.sampleId);
      },
      customRender: ({ text }) => {
        return h(Tooltip, { title: text }, () =>
          text
            ? h(
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
              )
            : '-',
        );
      },
    },
    {
      title: '交收时间',
      dataIndex: 'creationTime',
      width: 80,
      // fixed: 'left',
      sorter: (a, b) => {
        return a.creationTime.localeCompare(b.creationTime);
      },
      customRender: ({ text }) => {
        return h(Tooltip, { title: text }, () =>
          text
            ? h(
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
              )
            : '-',
        );
      },
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 80,
      // fixed: 'left',
      sorter: (a, b) => {
        return a.name.localeCompare(b.name);
      },
      customRender: ({ text }) => {
        return h(Tooltip, { title: text }, () =>
          text
            ? h(
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
              )
            : '-',
        );
      },
    },
    {
      title: '检测项目',
      dataIndex: 'projectName',
      width: 200,
      // fixed: 'left',
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
      title: '标准收费',
      dataIndex: 'price',
      width: 80,
      // fixed: 'left',
      sorter: (a, b) => {
        return a.price - b.price;
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
      title: '结算单价',
      dataIndex: 'discountedPrice',
      width: 80,
      // fixed: 'left',
      resizable: true,
      sorter: (a, b) => {
        return a.discountedPrice - b.discountedPrice;
      },
      customRender: ({ text }) => {
        return h(Tooltip, { title: text }, () =>
          text
            ? h(
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
                '￥' + text,
              )
            : '-',
        );
      },
    },
  ];
}
