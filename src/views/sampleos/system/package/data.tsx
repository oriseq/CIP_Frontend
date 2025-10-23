import { reactive } from 'vue';
import { getAllPackageApi } from './pkgMngApi';

/** 获取所有套餐数据 */
export async function AllPackageData() {
  try {
    const allPackageInfo = await getAllPackageApi(null);
    if (allPackageInfo.success) {
      // console.log('allPackageInfo', allPackageInfo.result);
      return allPackageInfo.result;
    } else {
      console.log('getAllPackageApi 请求失败');
      return;
    }
  } catch (error) {
    console.log('getAllPackageApi 请求错误');
    return;
  }
}

export const treeData = reactive([
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
