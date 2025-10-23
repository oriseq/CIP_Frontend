import { DescItem } from '@/components/Description';
import { sampleStatusMapping } from './fieldMapping';
import { Badge, Tag } from 'ant-design-vue';

/** 送检任务汇总详情栏 */
export const ProjectSchema: DescItem[] = [
  {
    field: 'AllSampleStatus',
    label: '样本状态数量',
    render: (val, data) => {
      const countMap = new Map<number, number>();

      // console.log("data: ", data);
      Object.entries(data).forEach(([key, value]) => {
        countMap.set(parseInt(key, 10), value);
      });

      // 将 Map 转换为所需的格式, 并按照降序排序
      const result = Array.from(countMap, ([key, value]) => ({
        status: key,
        count: value,
        color: getSampleStatusColor(key),
      })).sort((a, b) => b.count - a.count);

      // console.log('ProjectSchema-result', result);
      // console.log('ProjectSchema-data', data);

      return (
        <div>
          {result.map((item, index) => (
            <div key={index} style="display:inline-block">
              <Badge
                style={{ verticalAlign: 'text-bottom' }}
                count={item.count}
                showZero={true}
                numberStyle={{ backgroundColor: getSampleStatusColor(item.status) }}
                overflowCount={9990000}
              />
              &nbsp;
              <span>{sampleStatusMapping(item.status)}&nbsp;&nbsp;&nbsp;</span>
            </div>
          ))}
        </div>
      );
    },
  },
];

export function getSampleStatusColor(status) {
  /* 
      样本状态颜色设置
        - 无项目:0
        - 无确认项目:1
        - 等待检测:2
        - 正在检测:3    
        - 部分完成:4
        - 全部完成:5
      */
  switch (status) {
    case 0:
      return 'black';
    case 1:
      return '#f499a8';
    case 2:
      return '#f9ca24';
    case 3:
      return '#2c7b8a';
    case 4:
      return 'blue';
    case 5:
      return '#3c8521';
  }
}

export const projectStatusOptions = [
  {
    label: '取消',
    value: 0,
  },
  {
    label: '待定',
    value: 1,
  },
  {
    label: '确认检测',
    value: 2,
  },
  {
    label: '正在检测',
    value: 3,
  },
  {
    label: '已完成',
    value: 4,
  },
];

// 制作级联样本状态demo数据
export const demoOptions = {
  result: [
    {
      instrumentId: 18,
      instrumentName: '瑞美系统',
      children: [
        {
          projectName: '促卵泡成熟激素（FSH）',
          countByStatus: {
            '1': 1,
            '2': 4,
          },
          sampleProjectIds: [1057, 1039, 1048, 1049, 1058],
          instrumentId: 18,
        },
      ],
    },
    {
      instrumentId: -1,
      instrumentName: '未分配仪器',
      children: [
        {
          projectName:
            '传染五项（（乙肝两对半定性、丙型肝炎病毒抗体定性、HIV、梅毒螺旋抗体、梅毒甲苯胺红不加热血清试验TRUST）',
          countByStatus: {
            '1': 1,
          },
          sampleProjectIds: [1028],
        },
        {
          projectName: '乙型肝炎病毒核心抗体IgM（HBcAb-IgM）',
          countByStatus: {
            '2': 1,
          },
          sampleProjectIds: [1006],
        },
        {
          projectName: '雌二醇（E2）',
          countByStatus: {
            '1': 1,
            '2': 7,
          },
          sampleProjectIds: [1023, 1040, 1042, 1043, 1050, 1054, 1059, 1060],
        },
        {
          projectName: '孕酮（P）',
          countByStatus: {
            '1': 2,
            '2': 1,
          },
          sampleProjectIds: [1012, 1024, 983],
        },
        {
          projectName: '丙型肝炎病毒抗体定性（HCV-Ab）',
          countByStatus: {
            '2': 1,
          },
          sampleProjectIds: [999],
        },
        {
          projectName: '催乳素（PRL）',
          countByStatus: {
            '1': 1,
          },
          sampleProjectIds: [1013],
        },
        {
          projectName: '睾酮（T）',
          countByStatus: {
            '2': 4,
          },
          sampleProjectIds: [992, 1041, 1044, 1053],
        },
        {
          projectName: '丙肝2项（HCV-IgG、HCV-cAg）',
          countByStatus: {
            '1': 1,
          },
          sampleProjectIds: [997],
        },
        {
          projectName: '性激素5项（FSH、LH、E2、P、PRL）',
          countByStatus: {
            '1': 2,
            '2': 1,
            '4': 1,
          },
          sampleProjectIds: [1009, 1034, 1046, 986],
        },
        {
          projectName: '性激素4项（FSH、LH、E2、P）',
          countByStatus: {
            '1': 1,
            '2': 2,
          },
          sampleProjectIds: [1031, 1003, 1047],
        },
        {
          projectName: '性激素3项（E2、P、PRL）',
          countByStatus: {
            '1': 2,
            '2': 1,
            '4': 1,
          },
          sampleProjectIds: [1018, 1032, 1004, 982],
        },
        {
          projectName: '孕2项（HCG、P）',
          countByStatus: {
            '1': 1,
          },
          sampleProjectIds: [1022],
        },
        {
          projectName: '孕3项（HCG、P、E2）',
          countByStatus: {
            '1': 3,
            '4': 1,
          },
          sampleProjectIds: [1011, 1017, 1021, 984],
        },
        {
          projectName: '梅毒2项（TRUST、TP-Ab）',
          countByStatus: {
            '1': 1,
          },
          sampleProjectIds: [1036],
        },
        {
          projectName: 'β绒毛膜促性腺激素（βHCG）',
          countByStatus: {
            '1': 2,
          },
          sampleProjectIds: [1010, 1035],
        },
        {
          projectName: '抗缪勒氏管激素（AMH）',
          countByStatus: {
            '1': 1,
            '4': 1,
          },
          sampleProjectIds: [1033, 985],
        },
        {
          projectName: '梅毒TRUST半定量',
          countByStatus: {
            '4': 1,
          },
          sampleProjectIds: [1037],
        },
        {
          projectName: '结核杆菌IgG抗体(TB-IgG)',
          countByStatus: {
            '2': 1,
          },
          sampleProjectIds: [1000],
        },
        {
          projectName: '甲功5项（TSH、T3、T4、FT3、FT4）',
          countByStatus: {
            '1': 1,
          },
          sampleProjectIds: [994],
        },
        {
          projectName: '甲功7项（T3、T4、TSH、FT3、FT4、TG-Ab、TPOAb）',
          countByStatus: {
            '2': 2,
          },
          sampleProjectIds: [1007, 1020],
        },
        {
          projectName: '游离三碘甲状原氨酸（FT3）',
          countByStatus: {
            '2': 2,
          },
          sampleProjectIds: [1008, 1019],
        },
        {
          projectName: '抗甲状腺球蛋白抗体(TG-Ab)',
          countByStatus: {
            '4': 1,
          },
          sampleProjectIds: [987],
        },
        {
          projectName: '抗精子抗体定性（IgG）',
          countByStatus: {
            '1': 1,
          },
          sampleProjectIds: [996],
        },
        {
          projectName: '三碘甲状腺原氨酸',
          countByStatus: {
            '2': 1,
          },
          sampleProjectIds: [988],
        },
        {
          projectName: '肝功7项(AST、ALT、AST/ALT、TP、ALB、GLB、GGT、A/G、LDH、ALP)',
          countByStatus: {
            '1': 1,
          },
          sampleProjectIds: [1025],
        },
        {
          projectName:
            '肝功11项（AST ALT TP ALB GLB  TBIL DBIL IBIL  AST/ALT 白/球蛋白比值 GGT LDH TBA 胆碱酯酶 ）',
          countByStatus: {
            '1': 1,
          },
          sampleProjectIds: [1026],
        },
        {
          projectName: '抗β2糖蛋白1抗体定量（IgM）',
          countByStatus: {
            '1': 1,
          },
          sampleProjectIds: [1002],
        },
        {
          projectName: '沙眼衣原体抗原检测',
          countByStatus: {
            '1': 1,
          },
          sampleProjectIds: [1015],
        },
        {
          projectName: '抗β2-糖蛋白1抗体（β2GP1）',
          countByStatus: {
            '1': 1,
          },
          sampleProjectIds: [1001],
        },
        {
          projectName: '梅毒螺旋体病毒抗体检测',
          countByStatus: {
            '1': 1,
          },
          sampleProjectIds: [998],
        },
        {
          projectName: '胰岛素抗体',
          countByStatus: {
            '1': 1,
          },
          sampleProjectIds: [1016],
        },
        {
          projectName: '雄烯二酮',
          countByStatus: {
            '2': 2,
          },
          sampleProjectIds: [993, 1055],
        },
        {
          projectName: '淋球菌核酸检测',
          countByStatus: {
            '1': 1,
          },
          sampleProjectIds: [1029],
        },
        {
          projectName: '戊型肝炎病毒RNA荧光定性',
          countByStatus: {
            '2': 1,
          },
          sampleProjectIds: [995],
        },
        {
          projectName: 'HPV分型（37种）',
          countByStatus: {
            '1': 2,
          },
          sampleProjectIds: [1014, 1030],
        },
        {
          projectName: '支原体培养+药敏',
          countByStatus: {
            '2': 1,
          },
          sampleProjectIds: [1005],
        },
        {
          projectName: '甲型肝炎病毒抗体IgG',
          countByStatus: {
            '1': 1,
          },
          sampleProjectIds: [1027],
        },
      ],
    },
  ],
};
