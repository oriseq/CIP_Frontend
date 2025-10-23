<template>
  <div style="height: 100%; background-color: #fff">
    <!--    <img src="/workbenck/Package.png" alt="Logo" >-->
    <!--       一个box框    -->
    <div class="box-item" v-for="(i, index) in menu" :key="index">
      <!--       最左边的样式和标题    -->
      <div class="inner-box-title">
        <div
          style="
            width: 10%;
            height: 100%;
            float: left;
            background: linear-gradient(to bottom, #6096e6, #fff);
          "
        ></div>
        <div
          style="
            margin: 0 10px;
            float: left;
            font-size: 40px;
            writing-mode: vertical-rl;
            text-orientation: upright;
          "
        >
          {{ i.title }}
        </div>
      </div>
      <!--       每一个小块   -->
      <div
        class="inner-box-item"
        v-for="(j, indexJ) in i.children"
        :key="indexJ"
        @click="navigatoToPage(j.path)"
      >
        <img :src="`${j.img}`" alt="" />
        <div style="font-size: 25px">{{ j.title }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { usePermissionStore } from '@/store/modules/permission';
  import { useGo } from '@/hooks/web/usePage';

  // 菜单设置
  // let rolePermissionsStore = useRolePermissionsStore();
  // let { dataToLevel } = storeToRefs(rolePermissionsStore);
  // console.log("dataToLevel@", dataToLevel);
  // let menu = dataToLevel;

  let permissionStore = usePermissionStore();
  let backMenuList = [].concat(permissionStore.backMenuList);
  // 移除名为 Workbench 的菜单
  let filterBackMenuList = backMenuList.filter((route) => route.name !== 'Workbench');
  // console.log('backMenuList@', backMenuList);
  // console.log('filterBackMenuList@', filterBackMenuList);
  let menu = filterBackMenuList;

  let go = useGo();
  const navigatoToPage = (path) => {
    // console.log('path@', path);
    go(path);
  };

  // let menu = [
  //   {
  //     id: 1,
  //     permissionName: '样本送检',
  //     permissionIdentifier: null,
  //     parentId: null,
  //     type: 'M',
  //     route: '',
  //     imageUrl: '/workbenck/套餐管理.png',
  //     children: [
  //       {
  //         id: 2,
  //         permissionName: '送检单填写',
  //         permissionIdentifier: null,
  //         parentId: 1,
  //         type: 'C',
  //         route: '/sample/inspectionForm',
  //         imageUrl: '/workbenck/InspectionForm.png',
  //       },
  //       {
  //         id: 3,
  //         permissionName: '送检任务管理',
  //         permissionIdentifier: null,
  //         parentId: 1,
  //         type: 'C',
  //         route: '/sample/inspectionMission',
  //         imageUrl: '/workbenck/InspectionMission.png',
  //       },
  //       {
  //         id: 4,
  //         permissionName: '代管样本管理',
  //         permissionIdentifier: null,
  //         parentId: 1,
  //         type: 'C',
  //         route: '/sample/escrowSample',
  //         imageUrl: '/workbenck/EscrowSample.png',
  //       },
  //     ],
  //   },
  //   {
  //     id: 5,
  //     permissionName: '系统管理',
  //     permissionIdentifier: null,
  //     parentId: null,
  //     type: 'M',
  //     route: null,
  //     imageUrl: '/workbenck/套餐管理.png',
  //     children: [
  //       {
  //         id: 6,
  //         permissionName: '套餐管理',
  //         permissionIdentifier: null,
  //         parentId: 5,
  //         type: 'C',
  //         route: '/system/package',
  //         imageUrl: '/workbenck/Package.png',
  //       },
  //       {
  //         id: 7,
  //         permissionName: '项目管理',
  //         permissionIdentifier: null,
  //         parentId: 5,
  //         type: 'C',
  //         route: '/system/user',
  //         imageUrl: '/workbenck/Project.png',
  //       },
  //       {
  //         id: 8,
  //         permissionName: '用户管理',
  //         permissionIdentifier: null,
  //         parentId: 5,
  //         type: 'C',
  //         route: '/system/project',
  //         imageUrl: '/workbenck/User.png',
  //       },
  //       {
  //         id: 9,
  //         permissionName: '账单统计',
  //         permissionIdentifier: null,
  //         parentId: 5,
  //         type: 'C',
  //         route: '/system/billStatistics',
  //         imageUrl: '/workbenck/BillStatistics.png',
  //       },
  //     ],
  //   },
  // ];
  // console.log("menu@", menu)
</script>

<style scoped>
  .box-item {
    width: 1500px;
    height: 340px;
    margin: 0 auto;
    margin-top: 30px;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgb(0 0 0 / 20%);
    //background-color: #6b756c;
  }

  .inner-box-title {
    width: 10%;
    height: 100%;
    margin-right: 3%;
    float: left;
  }

  .inner-box-item {
    width: 18.5%;
    height: 100%;
    margin-right: 3%;
    padding-top: 8px;
    float: left;
    border-radius: 10px;
    box-shadow: 0 0 10px rgb(0 0 0 / 20%);
    text-align: center;
  }
</style>
