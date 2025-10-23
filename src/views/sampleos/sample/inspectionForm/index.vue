<template>
  <div class="inspection">
    <template v-if="submit_intermediate && SwitchSummaryPage">
      <a-result
        status="success"
        title="提交成功!"
        :sub-title="dayjs().format('YYYY-MM-DD HH:mm:ss')"
      >
        <template #extra>
          <a-button key="console" type="primary" @click="go('/sample/inspectionMission')"
            >前往送检任务管理页面</a-button
          >
          <a-button key="buy" @click="redo()">继续提交</a-button>
        </template>
        <template v-if="field_value">
          <div class="desc">
            <div class="info-container" :style="{ '--grid-columns': gridColumns }">
              <p style="font-size: 18px">
                <strong>本次提交的样本信息，汇总如下</strong>
              </p>
              <a-divider />
              <div class="info-grid-container">
                <p v-if="'name' in field_value">
                  <strong>⚫ 姓名：</strong>
                  {{ field_value.name }}
                </p>
                <p v-if="'age' in field_value">
                  <strong>⚫ 年龄：</strong>
                  {{ field_value.age }}
                </p>
                <p v-if="'sex' in field_value">
                  <strong>⚫ 性别：</strong>
                  {{ genderFormat(field_value.sex) }}
                </p>
                <p v-if="'birthday' in field_value">
                  <strong>⚫ 出生日期：</strong>
                  {{ formatTimestampToDate(field_value.birthday) }}
                </p>
                <p>
                  <strong>⚫ 快递物流单号：</strong>
                  <span v-if="'logisticsTrackingNumber' in field_value">
                    {{ field_value.logisticsTrackingNumber }}
                  </span>
                  <span v-else>×</span>
                </p>
                <p>
                  <strong>⚫ 快递手机号后四位：</strong>
                  <span v-if="'phoneNumLastFour' in field_value">
                    {{ field_value.phoneNumLastFour }}
                  </span>
                  <span v-else>×</span>
                </p>
                <p>
                  <strong>⚫ 备注：</strong>
                  <span v-if="'remarks' in field_value">
                    {{ field_value.remarks }}
                  </span>
                  <span v-else>×</span>
                </p>
                <p>
                  <strong>⚫ 样本编号：</strong>
                  <span v-if="'sampleId' in field_value">
                    {{ field_value.sampleId }}
                  </span>
                  <span v-else>x</span>
                </p>
                <p v-if="userStore.userInfo?.isInternalGroup">
                  <strong>⚫ 送检单位：</strong>
                  <span v-if="'sampleUserGroupId' in field_value">
                    {{ groupName }}
                  </span>
                  <span v-else>x</span>
                </p>
              </div>
            </div>
            <p v-if="'selectedProjects' in field_value" style="padding-left: 15px">
              <strong>⚫ 检测项目（共计{{ selectedProjects.length }}个）：</strong>
              <a-list
                bordered
                :data-source="selectedProjects.map((item) => item.name)"
                style="margin-top: 30px"
              >
                <template #renderItem="{ item }">
                  <a-list-item>{{ item }}</a-list-item>
                </template>
              </a-list>
            </p>
          </div>
        </template>
      </a-result>
    </template>
    <template v-else>
      <!-- <div class="box1"> 常规临检项目 - 送检单填写 </div> -->
      <a-row>
        <a-col>
          <div
            style="
              width: 10px;
              height: 40px;
              float: left;
              background: linear-gradient(to bottom, #6096e6, #fff);
            "
          ></div>
          <div style="margin: 0 10px; float: left; font-size: 20px; line-height: 187%">
            送检信息
          </div>
        </a-col>
      </a-row>
      <a-row>
        <a-col>
          <BasicForm @register="register" />
        </a-col>
      </a-row>
      <a-row>
        <a-col>
          <div
            style="
              width: 10px;
              height: 40px;
              float: left;
              background: linear-gradient(to bottom, #6096e6, #fff);
            "
          ></div>
          <div style="margin: 0 10px; float: left; font-size: 20px; line-height: 187%">
            送检项目
          </div>
        </a-col>
      </a-row>
      <div class="box4">
        <div style="height: 100%">
          <div class="box-left">
            <div class="card">
              <a-card style="position: relative; height: 100%">
                <template #title>
                  <span>可选择套餐</span>
                </template>
                <div class="card-content">
                  <a-list item-layout="horizontal" :data-source="combos">
                    <template #renderItem="{ item }">
                      <a-list-item>
                        <a-list-item-meta description="">
                          <template #title>
                            <a>{{ item.packageName }}</a>
                          </template>
                          <!-- <template #avatar>
                      <a-avatar src="https://joeschmoe.io/api/v1/random" />
                    </template> -->
                        </a-list-item-meta>
                        <template #actions>
                          <!-- <a key="list-loadmore-edit">编辑套餐</a> -->
                          <a key="list-loadmore-more" @click="addProjects(item.id)">选择</a>
                          <a key="list-loadmore-more" @click="joinProjects(item.id)">加入</a>
                        </template>
                      </a-list-item>
                    </template>
                  </a-list>
                </div>
              </a-card>
            </div>
            <div
              style="display: flex; align-items: center; height: 10%; padding: 5px; font-size: 15px"
              ><div
                >共计<span style="font-size: x-large">{{ combos.length }}</span
                >个可选择的套餐</div
              >
            </div>
          </div>
          <div class="box-center">
            <div class="card">
              <a-card style="position: relative; height: 100%">
                <template #title>
                  <span>新增项目</span>
                </template>
                <template #extra>
                  <div>
                    <a-button
                      type="primary"
                      style="margin-right: 20px"
                      size="default"
                      @click="fromTree2show()"
                      >确定</a-button
                    >
                  </div>
                </template>
                <div>
                  <div class="card-content">
                    <a-input-search
                      v-model:value="searchValue"
                      style="margin-bottom: 8px"
                      placeholder="搜索"
                    />
                    <a-tree
                      :autoExpandParent="autoExpandParent"
                      v-model:expanded-keys="expandedKeys"
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
                        <!-- <a-tag
                          v-if="status && checkedKeys.includes(id)"
                          style="cursor: default"
                          @mousedown.prevent
                          :color="getTagColor(status)"
                          @click="changeTreeStatus(id)"
                          >{{ getStatusText(status) }}</a-tag
                        > -->
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
              </a-card>
            </div>
            <div
              style="display: flex; align-items: center; height: 10%; padding: 5px; font-size: 15px"
              ><div
                >共计<span style="font-size: x-large">{{ countProject }}</span
                >个可选择项目</div
              >
            </div>
          </div>
          <div class="box-right">
            <div class="card">
              <a-card style="height: 100%">
                <template #title>
                  <a-flex :gutter="{ xs: 8, sm: 8, md: 8, lg: 8 }">
                    <a-popconfirm
                      title="确定清除所有项目吗?"
                      ok-text="是"
                      cancel-text="否"
                      @confirm="handleDeleteAll(true)"
                    >
                      <a-button
                        type="error"
                        preIcon="mdi:page-next-outline"
                        style="margin-right: 20px"
                        size="default"
                      >
                        一键清除
                      </a-button>
                    </a-popconfirm>

                    <a-typography-text
                      v-if="selectedProjects.length > 0"
                      :ellipsis="{ tooltip: consumableTypeStr }"
                      :content="`涉及耗材种类（${consumableTypeCount}）：${consumableTypeStr}`"
                    />
                  </a-flex>
                </template>
                <!-- <template v-if="selectedProjects.length > 0" #extra>
                </template> -->
                <div class="card-content">
                  <a-list item-layout="horizontal" :data-source="selectedProjects">
                    <template #renderItem="{ item }">
                      <a-list-item>
                        <a-list-item-meta description="">
                          <template #title>
                            <a-tag
                              title="切换项目状态"
                              style="float: left; cursor: default"
                              @mousedown.prevent
                              :color="getStatusColor(item.status)"
                              @click="changeStatus(item.id)"
                              >{{ getStatusText(item.status) }}</a-tag
                            >
                            <template v-if="userStore.userInfo?.isInternalGroup">
                              <a-tag
                                title="切换项目默认外送单位"
                                style="float: left; cursor: default"
                                @mousedown.prevent
                                @click="changeDefaultDeliveryUnit(item.id)"
                                >{{ item.deliveryUnit }}</a-tag
                              >
                            </template>
                            <span style="float: left">{{ item.name }}</span>
                            <span
                              style="display: grid; align-items: center; padding-left: 5px"
                              :title="item.consumableType"
                              v-if="item.consumableType"
                            >
                              <template v-if="item.consumableType.includes('管')">
                                <svg
                                  t="1729849163019"
                                  class="icon"
                                  viewBox="0 0 1024 1024"
                                  version="1.1"
                                  xmlns="http://www.w3.org/2000/svg"
                                  p-id="14491"
                                  width="24"
                                  height="24"
                                >
                                  <path
                                    d="M0 0h1024v1024H0z"
                                    fill="#D8D8D8"
                                    fill-opacity="0"
                                    p-id="14492"
                                  />
                                  <path
                                    d="M704 256v640a128 128 0 0 1-128 128H448a128 128 0 0 1-128-128V256h384z m-64 64H384v576a64 64 0 0 0 64 64h128a64 64 0 0 0 64-64V320z"
                                    fill="#BABABA"
                                    p-id="14493"
                                  />
                                  <path
                                    d="M544 576H704v64H544a32 32 0 0 1 0-64zM544 704H704v64H544a32 32 0 1 1 0-64z"
                                    fill="#BABABA"
                                    p-id="14494"
                                  />
                                  <path
                                    d="M256 0m64 0l384 0q64 0 64 64l0 256q0 64-64 64l-384 0q-64 0-64-64l0-256q0-64 64-64Z"
                                    :fill="consumableColor(item.consumableType)"
                                    p-id="14495"
                                  />
                                </svg>
                              </template>
                              <template v-else-if="item.consumableType.includes('拭子')">
                                <svg
                                  t="1729849061747"
                                  class="icon"
                                  viewBox="0 0 1024 1024"
                                  version="1.1"
                                  xmlns="http://www.w3.org/2000/svg"
                                  p-id="11873"
                                  width="24"
                                  height="24"
                                >
                                  <path
                                    d="M493.8 133.3h-180c-16.5 0-30 13.5-30 30v607.4c0 66.2 53.8 120 120 120s120-53.8 120-120V163.3c0-16.6-13.5-30-30-30z m-10 103.8h-33.5v-63.8h33.5v63.8z m-93.2 480c6.9-14 13.3-18.3 14.8-18.3s8 4.3 14.8 18.3c6.7 13.6 10.2 28.8 10.2 36.7 0 13.8-11.2 25-25 25s-25-11.2-25-25c0-7.9 3.5-23 10.2-36.7z m-20.8-421.3c-0.6 0-1-0.4-1-1v-37.7h70v37.7c0 0.6-0.4 1-1 1h-68z m20.7-58.7v-63.8h29.9v63.8h-29.9z m-30-63.8v63.8h-36.7v-63.8h36.7z m43.3 677.4c-44.1 0-80-35.9-80-80V257.1h15v37.7c0 17.1 13.9 31 31 31h20.6v346.8c-8.6 4.5-18.1 13.6-26.7 31.3-8 16.4-13.3 36-13.3 49.9 0 30.3 24.7 55 55 55s55-24.7 55-55c0-13.9-5.2-33.5-13.3-49.9-8.7-17.7-18.2-26.9-26.7-31.3V325.8h17.4c17.1 0 31-13.9 31-31v-37.7h15v513.6c0 44.1-35.9 80-80 80zM715.2 136.9H575.8c-13.8 0-25 11.2-25 25v78.2c0 13.8 11.2 25 25 25h5.7v25.6c0 19.3 15.7 35 35 35h14v346.8c-8.6 4.5-18.1 13.6-26.7 31.3-8 16.4-13.3 36-13.3 49.9 0 30.3 24.7 55 55 55s55-24.7 55-55c0-13.9-5.2-33.5-13.3-49.9-8.7-17.7-18.2-26.9-26.7-31.3V325.8h14c19.3 0 35-15.7 35-35v-25.6h5.7c13.8 0 25-11.2 25-25V162c0-13.9-11.2-25.1-25-25.1z m-69.7 641.9c-13.8 0-25-11.2-25-25 0-7.9 3.5-23.1 10.2-36.7 6.9-14 13.3-18.3 14.8-18.3s8 4.3 14.8 18.3c6.7 13.6 10.2 28.8 10.2 36.7 0 13.8-11.2 25-25 25z m34-488c0 2.8-2.2 5-5 5h-58c-2.8 0-5-2.2-5-5v-23.3h68v23.3z m-49.3-55.6V167h29.9v68.2h-29.9z m-49.4-68.3h19.4v68.2h-19.4v-68.2z m129.4 68.3h-20.1V167h20.1v68.2z"
                                    p-id="11874"
                                  />
                                </svg>
                              </template>
                              <template v-else-if="item.consumableType.includes('取精杯')">
                                <svg
                                  t="1734500133314"
                                  class="icon"
                                  viewBox="0 0 1024 1024"
                                  version="1.1"
                                  xmlns="http://www.w3.org/2000/svg"
                                  p-id="15106"
                                  xmlns:xlink="http://www.w3.org/1999/xlink"
                                  width="24"
                                  height="24"
                                >
                                  <path
                                    d="M852.48 61.44h-742.4C77.824 61.44 51.2 88.064 51.2 120.32c0 6.656 1.536 13.312 5.12 18.944l68.096 120.32L199.68 901.632c1.536 31.232 27.136 55.808 58.88 55.808h424.96c31.744 0 57.344-25.088 58.88-56.32l29.184-286.72h80.896c66.56 0 120.32-53.76 120.32-120.32v-312.32c0-66.56-53.76-120.32-120.32-120.32z m-185.344 819.2H274.432l-20.992-179.2h163.84c20.992 0 38.4-17.408 38.4-38.4s-17.408-38.4-38.4-38.4H254.976c-3.584 0-6.656 0.512-10.24 1.536L235.52 547.84h94.72c20.992 0 38.4-17.408 38.4-38.4S351.232 471.04 330.24 471.04H226.304l-9.216-76.8h195.072c20.992 0 38.4-17.408 38.4-38.4S433.152 317.44 412.16 317.44H208.384L199.68 243.2c-0.512-5.12-2.048-9.728-4.608-14.336L143.872 138.24h599.552l-76.288 742.4zM896 494.08c0 24.064-19.456 43.52-43.52 43.52h-72.704l40.96-399.36h31.744c24.064 0 43.52 19.456 43.52 43.52v312.32z"
                                    p-id="15107"
                                  />
                                </svg>
                              </template>
                              <template v-else-if="item.consumableType.includes('无菌容器')">
                                <svg
                                  t="1734500457752"
                                  class="icon"
                                  viewBox="0 0 1024 1024"
                                  version="1.1"
                                  xmlns="http://www.w3.org/2000/svg"
                                  p-id="28973"
                                  xmlns:xlink="http://www.w3.org/1999/xlink"
                                  width="24"
                                  height="24"
                                >
                                  <path
                                    d="M778.8 71h-533c-9.1 0-16.5 7.4-16.5 16.5v106c0 9.1 7.4 16.5 16.5 16.5h63.5v670.5c0 42.8 34.7 77.5 77.5 77.5h263c42.8 0 77.5-34.7 77.5-77.5V210h51.5c9.1 0 16.5-7.4 16.5-16.5v-106c0-9.1-7.4-16.5-16.5-16.5zM675.2 880.5c0 14-11.4 25.5-25.5 25.5h-263c-14 0-25.5-11.4-25.5-25.5V220h313.9v660.5z m70-720.6H279.3V121h465.9v38.9z"
                                    fill="#515151"
                                    p-id="28974"
                                    data-spm-anchor-id="a313x.search_index.0.i34.3e043a81hq8b33"
                                    class=""
                                  />
                                  <path
                                    d="M456.7 567.9c30.1 0 54.5-24.4 54.5-54.5s-24.4-54.5-54.5-54.5-54.5 24.4-54.5 54.5 24.4 54.5 54.5 54.5z m0-77c12.4 0 22.5 10.1 22.5 22.5s-10.1 22.5-22.5 22.5-22.5-10.1-22.5-22.5 10.1-22.5 22.5-22.5zM592.7 629.9c-30.1 0-54.5 24.4-54.5 54.5s24.4 54.5 54.5 54.5 54.5-24.4 54.5-54.5-24.4-54.5-54.5-54.5z m0 77c-12.4 0-22.5-10.1-22.5-22.5s10.1-22.5 22.5-22.5 22.5 10.1 22.5 22.5-10.1 22.5-22.5 22.5zM585.7 441.9c30.1 0 54.5-24.4 54.5-54.5s-24.4-54.5-54.5-54.5-54.5 24.4-54.5 54.5c0 30.2 24.4 54.5 54.5 54.5z m0-76.9c12.4 0 22.5 10.1 22.5 22.5S598.1 410 585.7 410s-22.5-10.1-22.5-22.5 10.1-22.5 22.5-22.5z"
                                    fill="#515151"
                                    p-id="28975"
                                  />
                                </svg>
                              </template>
                            </span>
                          </template>
                          <!-- <template #avatar>
                      <a-avatar src="https://joeschmoe.io/api/v1/random" />
                    </template> -->
                        </a-list-item-meta>
                        <template #actions>
                          <a-popconfirm
                            title="确定移除该项目吗?"
                            ok-text="是"
                            cancel-text="否"
                            @confirm="delProject(item.id)"
                          >
                            <a key="list-loadmore-edit" title="移除项目"
                              ><Icon icon="ant-design:delete-outlined" color="red" size="20"
                            /></a>
                          </a-popconfirm>
                          <!-- <a key="list-loadmore-more">more</a> -->
                        </template>
                      </a-list-item>
                    </template>
                  </a-list></div
                >
              </a-card>
            </div>
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 10%;
                padding: 5px;
                font-size: 15px;
              "
            >
              <div
                >已选择项目:&nbsp;<span style="font-size: x-large">{{
                  determinedProject.status1
                }}</span
                >个<a-tag style="margin: 0; cursor: default" @mousedown.prevent color="#f499a8"
                  >待定</a-tag
                >&nbsp;<span style="font-size: x-large">{{ determinedProject.status2 }}</span
                >个<a-tag style="margin: 0; cursor: default" @mousedown.prevent color="#f9ca24"
                  >确定</a-tag
                >
              </div>
              <div style="margin-right: 2%; margin-left: 10px">
                <a-button
                  type="primary"
                  preIcon="mdi:page-next-outline"
                  @click="submitSample()"
                  :loading="loadingStatus"
                  size="default"
                >
                  提交
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- <Modal1
      @register="registerModal"
      :minHeight="100"
      :sledPjt="selectedProjectForTree"
      :classProjects="classProjects"
      :insertProject="handleInsertProject"
      :countProject="countProject"
    /> -->
  </div>
</template>

<script setup lang="ts">
  import { BasicForm, FormSchema, useForm } from '@/components/Form';
  import { CollapseContainer, ScrollContainer } from '@/components/Container';
  import { PageWrapper } from '@/components/Page';
  import { cardList } from '@/views/demo/page/list/basic/data';
  import Icon from '@/components/Icon/Icon.vue';
  import dayjs from 'dayjs';
  import { computed, reactive, ref, onMounted, onBeforeMount, watch, createVNode } from 'vue';
  import { tr } from 'element-plus/es/locale/index.mjs';
  import { useMessage } from '@/hooks/web/useMessage';
  import { defHttpForRes, defHttp } from '@/utils/http/axios';
  import { useRedo } from '/@/hooks/web/usePage';
  import { useModal } from '@/components/Modal';
  // import Modal1 from './Modal1.vue';
  import { uploadApi } from '@/api/sys/upload';
  import { Button, Image } from 'ant-design-vue';
  import type { Rule } from 'ant-design-vue/es/form';
  // import ThumbUrl from './ThumbUrl.vue';
  import { useGo } from '@/hooks/web/usePage';
  import { useUserStore } from '@/store/modules/user';
  import { getUserGroupInfoApi, RunCheckTreeBox } from './inspectionFormApi';
  import type { TreeProps } from 'ant-design-vue';

  const go = useGo();
  let submit_intermediate: boolean = false;
  const field_value = ref(null);
  const gridColumns = 'repeat(4, minmax(200px, 1fr))'; // 定义grid-template-columns的值，每行最多4列

  const userStore = useUserStore();

  // 非内部组会展示填写汇总信息页面
  const SwitchSummaryPage = computed(() => {
    return !userStore.userInfo?.isInternalGroup;
  });

  // 项目对象接口
  interface itemObject {
    id: number;
    name: string;
    status: number;
    consumableType: string;
  }

  const fieldNames: TreeProps['fieldNames'] = {
    title: 'name',
    key: 'id',
  };
  // 默认树展开
  const defaultexpandNode: string[] = [];
  const expandedKeys = ref<string[]>(defaultexpandNode);
  const selectedKeys = ref<string[]>([]);
  // console.log();
  const checkedKeys = ref<string[]>([]);

  let FirstNodeList = ref<string[]>([]);
  let SecondNodeList = ref<string[]>([]);

  // 项目树
  const treeData: TreeProps['treeData'] = reactive([]);

  // 用户组名称
  let groupName = ref();
  // 用户组名称对应的Id
  let groupNameId = ref();

  // 获取用户组名称
  async function getGroupName(usrGroupId: number) {
    const info = await getUserGroupInfoApi(null);
    const groupInfo = info.result.find((item) => item.id === usrGroupId);
    if (groupInfo) {
      groupName.value = groupInfo.groupName;
    } else {
      groupName.value = '未知';
    }
  }

  // 监听用户组Id是否发生变化，以此启动异步，从而火球用户组名称
  watch(
    () => groupNameId.value,
    async (newV) => {
      if (userStore.userInfo?.isInternalGroup) {
        await getGroupName(newV);
      }
    },
  );

  const getSchamas = (): FormSchema[] => {
    return [
      {
        field: 'sampleUserGroupId',
        component: 'ApiSelect',
        ifShow: userStore.userInfo?.isInternalGroup,
        componentProps: () => {
          return {
            placeholder: '必填',
            api: async () => {
              const rsp = await getUserGroupInfoApi({ scene: 'fillIn' });
              return rsp.result;
            },
            showSearch: true,
            filterOption: (inputValue, option) => {
              return option.label.includes(inputValue);
            },
            resultField: 'result',
            labelField: 'groupName',
            valueField: 'id',
            params: { scene: 'inspectionUnit' },
            onChange: (e: any) => {
              // 根据选择的送检单位用户组，变换Id
              groupNameId.value = e;
              selectedProjects.forEach((item) => {
                // console.log('e, item', e, item);
                item.deliveryUnit = getDeliveryUnit(item);
              });
            },
          };
        },
        labelWidth: 110,
        label: '送检单位',
        colProps: {
          span: 5,
        },
        required: true,
        helpMessage: '若样本编号和当天提交编号为空，送检单位还被用于上述两个字段的生成',
      },
      {
        field: 'name',
        component: 'Input',
        label: '姓名',
        helpMessage: '必填：检测人姓名',
        labelWidth: 90,
        colProps: {
          // span: 4,
        },
        required: true,
        componentProps: {
          placeholder: '必填',
          // onChange: (e: any) => {
          //   console.log(e);
          // },
        },
      },
      {
        field: 'age',
        component: 'InputNumber',
        label: '年龄',
        helpMessage: '必填：检测人年龄',
        labelWidth: 90,
        colProps: {
          // span: 4,
        },
        required: true,
        componentProps: ({ schema, tableAction, formActionType, formModel }) => {
          return {
            min: 0,
            placeholder: '必填',
            onChange: (e: any) => {
              let age = formModel.age;
              if (age) {
                const today = new Date();
                const currentYear = today.getFullYear();
                const birthYear = currentYear - age;
                formModel.birthday = dayjs(`${birthYear}-01-01`, 'YYYY-MM-DD');
                //  = new Date(birthYear, 0, 1);
                // isBirthInput是否使用出生日期生成  1:是 0:否
                formModel.isBirthInput = 0;
              } else {
                formModel.birthday = null;
                // form.isBirthInput = true;
              }
            },
          };
        },
      },
      {
        field: 'sex',
        component: 'RadioGroup',
        label: '性别',
        helpMessage: '必填：检测人性别',
        labelWidth: 90,
        colProps: {
          // span: 4,
        },
        required: true,
        componentProps: {
          options: [
            {
              label: '男',
              value: 1,
            },
            {
              label: '女',
              value: 2,
            },
            {
              label: '未知',
              value: 3,
            },
          ],
        },
      },
      {
        field: 'birthday',
        component: 'DatePicker',
        label: '出生日期',
        helpMessage: '（选填）检测人出生日期，系统会根据年龄自动计算',
        labelWidth: 110,
        colProps: {
          // span: 5,
        },
        // required: true,
        componentProps: ({ formModel }) => {
          return {
            placeholder: '自动计算',
            onChange: (e: any) => {
              // console.log(e);
              // console.log('formModel', formModel);
              let birthDate = formModel.birthday;
              // console.log('birthDate', birthDate);
              if (birthDate) {
                const today = new Date();
                const birthYear = birthDate.year();
                // console.log('birthYear', birthYear);
                const currentYear = today.getFullYear();
                formModel.age = currentYear - birthYear;
                // isBirthInput是否使用出生日期生成 1:是 0:否
                formModel.isBirthInput = 1;
              } else {
                formModel.age = null;
                // form.isBirthInput = false;
              }
            },
          };
        },
      },

      {
        field: 'sampleId',
        component: 'Input',
        componentProps: {
          placeholder: '留空则自动填充',
        },
        labelWidth: 100,
        label: '样本编号',
        colProps: {
          // span: 5,
        },
        helpMessage: '内部记录的检测人唯一编号，若为空，则自动生成',
        ifShow: userStore.userInfo?.isInternalGroup,
      },
      {
        field: 'submitNumberToday',
        component: 'Input',
        componentProps: {
          placeholder: '留空则自动填充',
        },
        labelWidth: 130,
        label: '当天提交编号',
        colProps: {
          // span: 5,
        },
        helpMessage: '用于检测过程的当天唯一检测人编号，若为空，则自动生成',
        ifShow: userStore.userInfo?.isInternalGroup,
      },
      {
        field: 'fieldsc',
        component: 'Upload',
        label: '附件',
        ifShow: true,
        helpMessage: '（选填）用于记录该样本对应的图片，文档或视频资料。',
        labelWidth: 90,
        colProps: {
          // span: 1,
        },
        rules: [{ required: false, message: '请选择上传文件' }],
        componentProps: {
          value: [],
          api: uploadApi,
          multiple: true,
          maxNumber: 10,
          maxSize: 5,
          resultField: 'data.result',
          onChange: (fileList) => {
            // 这里可以处理文件上传状态的变化
            console.log('上传的文件列表：', fileList);
          },
          onDelete: (record) => {
            // 在上传列表中删除文件的事件
            console.log('删除的文件列表：', record);
          },
          previewColumns: [
            {
              title: '文件名',
              dataIndex: 'name',
            },
          ],
          beforePreviewData: (arg) => {
            // console.log('arg：', arg);
            // 确保arg是数组且包含有效数据
            if (Array.isArray(arg)) {
              return arg
                .filter((item) => !!item)
                .map((item) => {
                  // 直接使用接口返回的url对象
                  return {
                    name: item?.originalFileName || '',
                    id: item?.id || '',
                    fileSize: item?.fileSize || 0,
                    creationTime: item?.creationTime || '',
                  };
                });
            }
            return [];
          },
          helpText: '单个文件不超过5MB，最多只能上传10个文件',
        },
      },
      {
        field: 'remarks',
        component: 'InputTextArea',
        componentProps: { autoSize: true, allowClear: true, placeholder: '选填' },
        helpMessage: '（选填）用于记录该样本的特殊之处，以便后续快速检索筛选样本。',
        labelWidth: 90,
        label: '备注',
        colProps: {},
      },
      {
        field: 'logisticsTrackingNumber',
        component: 'Input',
        label: '物流单号',
        labelWidth: 110,
        helpMessage: '（选填）快递物流单号，若填写，则可在后续页面中查询物流进度信息',
        colProps: {
          // span: 6,
        },
        required: false,
        componentProps: {
          placeholder: '选填',
          autoSize: true,
          // onChange: (e: any) => {
          //   console.log(e);
          // },
        },
      },
      {
        field: 'phoneNumLastFour',
        component: 'InputNumber',
        label: '物流手机号后四位',
        helpMessage:
          '（选填）快递物流单号绑定的手机号后四位，若填写，则可在后续页面中进一步查询物流进度信息。（部分快递公司需要提供手机号后四位）',
        colProps: {
          // span: 5,
        },
        labelWidth: 160,
        required: false,
        dynamicRules: ({ values }) => {
          if (values.phoneNumLastFour) {
            return [
              {
                validator: (_, value: number) => {
                  // 若存在，则校验是否为四位数
                  if (!Number.isInteger(value)) {
                    return Promise.reject('手机号后四位必须为数字');
                  } else {
                    if (value.toString().length != 4) {
                      return Promise.reject('必须为四位');
                    } else {
                      return Promise.resolve();
                    }
                  }
                },
              },
            ];
          } else {
            return [];
          }
        },
        componentProps: {
          placeholder: '选填',
          autoSize: true,
          // onChange: (e: any) => {
          //   console.log(e);
          // },
        },
      },
    ];
  };

  // 将时间戳转为日期格式
  function formatTimestampToDate(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  // 性别文本转化
  function genderFormat(gender) {
    if (gender === 1) {
      return '男';
    } else if (gender === 2) {
      return '女';
    } else {
      return '未知';
    }
  }

  function handleChange(fileList) {
    // 这里可以处理文件上传状态的变化
    console.log('上传的文件列表：', fileList);
  }

  const imageSrc = ref('');
  async function useImageLoader(record) {
    console.log('record:', record);
    let url = 'http://127.0.0.1:8080/api/file/' + record;
    console.log('url:', url);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      imageSrc.value = URL.createObjectURL(blob);
      // imageSrc.set(record, URL.createObjectURL(blob));
      // imageSrc.value = { ...imageSrc.value, dd: URL.createObjectURL(blob) };
    } catch (error) {
      // imageSrc.value = '/default-image.jpg';
      createMessage.error('获取图片资源失败');
      console.error(error);
    }
  }

  const [register, { getFieldsValue, validateFields, resetFields, setFieldsValue }] = useForm({
    // labelWidth: 70,
    schemas: getSchamas(),
    actionColOptions: {
      // span: 24,
    },
    // compact: true,
    showActionButtonGroup: false,
    baseRowStyle: {
      width: '',
    },
  });

  // 套餐--格式数据
  let combos = reactive([]);

  let classProjects = ref([]);
  let countProject = ref(0);

  onBeforeMount(() => {
    // 接口获取套餐
    const res = defHttpForRes.get({ url: '/sample/combos' });
    res.then((data) => {
      // console.log('package-data', data);
      if (data.success) {
        combos.splice(0, combos.length, ...data.result);
        // console.log('combos', combos);
      }
    });

    // 获取项目
    const resProjects = defHttpForRes.get({ url: '/sample/projects' });
    resProjects.then((data) => {
      // console.log('project-data', data);
      if (data.success) {
        // combos.splice(0, combos.length, ...data.result);
        classProjects.value = data.result;
        // 加个排序索引
        restoreOriginalOrder(classProjects.value);
        // 统计可选项目
        countProject.value = countObjectsWithStatus(classProjects.value);
        // console.log('projects', data.result);
      }
    });
    // 为节点添加原始索引
    function restoreOriginalOrder(treeData) {
      let index = 0;
      function traverse(node) {
        node.originalOrder = index++;
        if (node.children) {
          node.children.forEach(traverse);
        }
      }
      treeData.forEach(traverse);
    }
  });
  const countObjectsWithStatus = (data) => {
    return data.reduce((count, item) => {
      if ('status' in item) {
        return count + 1;
      }
      if (item.children) {
        return count + countObjectsWithStatus(item.children);
      }
      return count;
    }, 0);
  };

  /* 
        项目那一块
  */

  /* 
  格式
  [
        {
          name: '套餐1的项目1',
          status: 1,
          id: 1,
        },
        {
          name: '套餐1的项目2',
          status: 2,
          id: 2,
        },
      ]
  */
  const selectedProjects = reactive([]);

  // 从套餐加入项目（不替换右侧卡片项目）
  const joinProjects = (id) => {
    let projects = combos
      .filter((item) => item.id === id)
      .map((item) => {
        return item.projects;
      });

    // 套餐获取项目ids
    let combos_select_ids = projects[0].map((item) => item.id);
    const combos_select_projects = getObjectsByIds(treeData, combos_select_ids);

    if (Array.isArray(projects[0]) && projects[0].length > 0) {
      combos_select_projects.forEach((item) => {
        const isDuplicate = selectedProjects.some((project) => project.id === item.id);
        if (!isDuplicate) {
          selectedProjects.push({
            ...item,
            deliveryUnit: getDeliveryUnit(item), // 通过新增套餐，添加deliveryUnit
          });
        }
      });
    }
    selectedProjects.forEach((item) => {
      checkedKeys.value.push(item.id);
      let foundObject = findObjectById(treeData, item.id);
      foundObject.disableCheckbox = true;
    });
  };

  // 通过套餐添加项目
  const addProjects = (id) => {
    // 添加套餐项目前，先清空已有项目
    let ListProjectIds: number[] = [];
    selectedProjects.map((item: itemObject) => ListProjectIds.push(item?.id));
    ListProjectIds.forEach((id) => {
      delProject(id);
    });
    // 加入后不删除套餐项目的逻辑
    joinProjects(id);
  };

  // 删除项目
  const delProject = (idToDelete) => {
    // console.log('id', idToDelete);
    // 使用Array.prototype.filter方法创建新的列表，排除具有特定id的对象
    const updatedProjects = selectedProjects.filter((project) => project.id !== idToDelete);
    // 更新selectedProjects为新的列表
    selectedProjects.splice(0, selectedProjects.length, ...updatedProjects);
    // 打印更新后的selectedProjects
    // console.log('delProject-selectedProjects:', selectedProjects);

    // 去除项目树中，指定项目id的勾选状态
    const foundObject = findObjectById(treeData, idToDelete);
    if (foundObject) {
      foundObject.disableCheckbox = false;
    }
    checkedKeys.value = checkedKeys.value.filter((id) => id != idToDelete);
    // console.log('checkedKeys.value:', checkedKeys.value);

    // 如果项目树只含有1个项目，删除时将checkedKey清空
    if (checkedKeys.value.every((id) => typeof id === 'string')) {
      checkedKeys.value = [];
      selectedKeys.value = [];
    }
    // classProjects.value.splice(0, classProjects.value.length, ...selectedProjects);
  };

  // 初始状态为待定
  // const status = ref(1);
  const getStatusColor = computed(() => {
    return (status) => {
      switch (status) {
        case 0:
          return '#ff0000'; // 取消状态的背景色为红色
        case 1:
          return '#f499a8'; // 待定状态的背景色为粉色
        case 2:
          return '#f9ca24'; // 确认检测状态的背景色为绿色
        default:
          return '#f499a8';
      }
    };
  });
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
  const changeTreeStatus = (idToUpdate) => {
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

  /**
   * 修改状态（最右侧展示的项目状态修改）
   * @param idToUpdate 项目id
   */
  const changeStatus = (idToUpdate) => {
    const itemToUpdate = selectedProjects.find((item) => item.id === idToUpdate); // 查找匹配的对象
    // console.log('idToUpdate | itemToUpdate', idToUpdate, itemToUpdate);

    if (itemToUpdate) {
      if (itemToUpdate.status == 1) {
        itemToUpdate.status = 2;
      } else if (itemToUpdate.status == 2) {
        itemToUpdate.status = 1;
      }
    }
    // console.log(selectedProjects);
  };

  // 获取当前项目在该送检单位下的默认外送单位
  const getDeliveryUnit = (item) => {
    if (groupNameId.value) {
      if (item?.deliveryUnitSetting?.defaultOption) {
        return item.deliveryUnitSetting.defaultOption[groupNameId.value] === undefined
          ? '自检'
          : item.deliveryUnitSetting.defaultOption[groupNameId.value];
      } else {
        return '自检';
      }
    } else {
      return '自检';
    }
  };

  // 切换默认外送单位
  const changeDefaultDeliveryUnit = (project_id) => {
    // console.log('changeDefaultDeliveryUnit-project_id', project_id);
    // console.log('changeDefaultDeliveryUnit-groupName', groupName.value);
    if (groupName.value) {
      // 查找匹配的对象
      const itemToUpdate = selectedProjects.find((item) => item.id === project_id);
      // console.log('changeDefaultDeliveryUnit-itemToUpdate', itemToUpdate);

      // 获取项目设置中的外送单位选项
      const deliveryUnitSetting_options =
        itemToUpdate?.deliveryUnitSetting?.options !== undefined
          ? itemToUpdate.deliveryUnitSetting.options
          : [];
      const options_length = deliveryUnitSetting_options.length;

      // 获取当前项目在该送检单位下的默认外送单位的索引
      const delivery_unit_index = deliveryUnitSetting_options.indexOf(itemToUpdate.deliveryUnit);

      // 获取切换的下一个外送单位的索引
      const next_index = delivery_unit_index < options_length - 1 ? delivery_unit_index + 1 : 0;

      // 切换该项目的的默认外送单位
      itemToUpdate.deliveryUnit =
        deliveryUnitSetting_options[next_index] !== undefined
          ? deliveryUnitSetting_options[next_index]
          : '自检';
    }
  };

  /**
   * 统计项目信息
   */
  // 计算待定项目
  const determinedProject = computed(() => {
    // 待定项目计算
    const result = selectedProjects.reduce(
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
    return result;
  });

  /*
     耗材信息
  */
  const consumableColor = (type) => {
    const dict_consumable_color = {
      黄: '#f4d03f',
      蓝: '#3498db',
      灰: '#99a3a4',
      紫: '#8e44ad',
      绿: '#229954',
    };
    return dict_consumable_color[type[0]];
  };

  const consumableTypeStr = computed(() => {
    return [
      ...new Set(
        selectedProjects
          // 统计consumableType不为null的
          .filter((item) => item.consumableType != null && item.consumableType != undefined)
          .map((item) => item.consumableType),
      ),
    ].join(', ');
  });

  const consumableTypeCount = computed(() => {
    return [
      ...new Set(
        selectedProjects
          // 统计consumableType不为null的
          .filter((item) => item.consumableType != null && item.consumableType != undefined)
          .map((item) => item.consumableType),
      ),
    ].length;
  });

  const { createMessage } = useMessage();
  const redo = useRedo();
  const loadingStatus = ref(false);
  // 提交样本
  const submitSample = () => {
    loadingStatus.value = true;
    field_value.value = { ...getFieldsValue(), selectedProjects };
    console.log('field_value.value,', field_value.value);
    // 校验
    const res = validateFields();
    res
      .then(async (model) => {
        // console.log('model', model);
        // 发送请求提交送检信息
        const res = await defHttpForRes.put({
          url: '/sample/inspectionForm',
          params: field_value.value,
        });
        // console.log('field_value.value,', field_value.value);
        if (res.success) {
          createMessage.success(res.message);
          // 刷新页面
          // redo();
          // 转向提交成功的中间页面
          submit_intermediate = true;
          // 提交后清空所有已填写的信息
          // resetFields();
          // searchValue.value = '';
          // selectedProjects.map((item) => item.id).forEach((id) => delProject(id));
          // 内部组填写完成后刷新页面，以清空页面信息
          if (!SwitchSummaryPage.value) {
            // 清空表单
            resetFields();
            // 设置表单
            setFieldsValue({
              // age: field_value.value.age,
              sampleUserGroupId: field_value.value.sampleUserGroupId,
              sex: field_value.value.sex,
            });
            // 清空项目
            handleDeleteAll(false);
          }
        } else {
          createMessage.error(res.message);
        }
        loadingStatus.value = false;
      })
      .catch((error) => {
        loadingStatus.value = false;
        createMessage.error('请检查送检信息输入');
      });
  };

  /* 
    新增项目 功能
  */
  const [registerModal, { openModal: openModalAddProjects }] = useModal();

  // 勾选的项目id
  const selectedProjectForTree = computed(() => {
    // console.log('selectedProjects', selectedProjects);
    if (selectedProjects) {
      return selectedProjects.map((item) => {
        return {
          id: item.id,
          status: item.status,
        };
      });
    }
    return [];
  });

  // 获取新增项目树里的项目
  const handleInsertProject = (project) => {
    // console.log('从树中获取的项目：', project);
    // console.log('selectedProjects', selectedProjects);
    selectedProjects.splice(0, selectedProjects.length, ...project);
  };

  /** 一键清除 */
  function handleDeleteAll(msgSwitch: boolean): void {
    // 没有项目则不删除
    if (selectedProjects.length == 0 && msgSwitch) {
      createMessage.warning('没有可以清除的项目');
      return;
    } else {
      // console.log('准备删除的selectedProjects', selectedProjects);
      // 批量删除
      let ListProjectIds: number[] = [];
      selectedProjects.map((item: itemObject) => ListProjectIds.push(item?.id));
      ListProjectIds.forEach((id) => {
        delProject(id);
      });
      // 提供开关控制是否出现反馈提示
      if (msgSwitch) {
        createMessage.success('一键清除成功');
      }

      // 树的重置
      treeData.splice(0, treeData.length, ...classProjects.value);
    }
  }

  watch(
    () => selectedProjectForTree,
    (newValue, oldValue) => {
      // console.log('sledPjt changed:', newValue, oldValue);
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
    () => classProjects.value,
    (newValue, oldValue) => {
      // 更新树
      treeData.splice(0, treeData.length, ...newValue);

      // 获取展开树的父节点，用于 expandedKeys 默认展开
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
    },
  );

  const searchValue = ref<string>('');
  const autoExpandParent = ref<boolean>(true);

  // 搜索树相关
  // 搜索逻辑
  watch(searchValue, (value) => {
    if (value) {
      // 找到匹配的节点及其祖先节点
      const { matchedNodes, ancestors } = findMatchedNodesAndAncestors(treeData, value);
      // 重新排序树结构
      const sortedTreeData = sortTreeData(treeData, matchedNodes, ancestors);

      // 更新树数据
      treeData.splice(0, treeData.length, ...sortedTreeData);

      // 展开匹配的节点
      const matchIds = matchedNodes.map((item) => item.id);
      expandedKeys.value = matchIds;
      autoExpandParent.value = true;
    } else {
      // 恢复原始树排序
      restoreOriginalOrder(treeData);
      let alwaysExpand = [...checkedKeys.value, ...defaultexpandNode];
      expandedKeys.value = checkedKeys.value.length > 0 ? alwaysExpand : defaultexpandNode;
    }
  });

  // 恢复时按原始索引排序
  function restoreOriginalOrder(treeData) {
    function sortNodes(nodes) {
      return nodes
        .sort((a, b) => a.originalOrder - b.originalOrder)
        .map((node) => {
          if (node.children) {
            node.children = sortNodes(node.children);
          }
          return node;
        });
    }
    return sortNodes(treeData);
  }

  // 查找匹配的节点及其祖先节点
  function findMatchedNodesAndAncestors(data, keyword) {
    const matchedNodes = [];
    const ancestors = new Set();

    function search(node, parentChain = []) {
      if (node.name.includes(keyword)) {
        matchedNodes.push(node);
        parentChain.forEach((parent) => ancestors.add(parent));
      }
      if (node.children) {
        node.children.forEach((child) => search(child, [...parentChain, node]));
      }
    }

    data.forEach((node) => search(node));

    return { matchedNodes, ancestors: Array.from(ancestors) };
  }

  // 重新排序树结构
  function sortTreeData(data, matchedNodes, ancestors) {
    const sortedData = [...data];

    // 将匹配节点及其祖先节点排到最前面
    sortedData.sort((a, b) => {
      const aIsMatched = matchedNodes.includes(a) || ancestors.includes(a);
      const bIsMatched = matchedNodes.includes(b) || ancestors.includes(b);

      if (aIsMatched && !bIsMatched) return -1;
      if (!aIsMatched && bIsMatched) return 1;
      return 0;
    });

    // 递归排序子节点
    sortedData.forEach((node) => {
      if (node.children) {
        // 将匹配的子节点排到最前面
        node.children.sort((a, b) => {
          const aIsMatched = matchedNodes.includes(a);
          const bIsMatched = matchedNodes.includes(b);

          if (aIsMatched && !bIsMatched) return -1;
          if (!aIsMatched && bIsMatched) return 1;
          return 0;
        });

        // 递归处理子节点
        node.children = sortTreeData(node.children, matchedNodes, ancestors);
      }
    });

    return sortedData;
  }

  const onExpand = (keys: string[]) => {
    // console.log("onExpand keys:", keys);
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
    append_arr = append_arr.length > 0 ? append_arr : [];

    // 如果节点没有子节点，直接检查该节点的 id 是否在 checkedKeys.value
    if (!node.children || node.children.length === 0) {
      const r1 = checkedKeys.value.includes(node.id);
      append_arr.push(r1);
      return r1;
    }
    // 递归检查所有子节点及其子孙节点
    // console.log('此时node.children = ', node.children);
    for (const child of node.children) {
      if (!getIsAllCheck(child, append_arr)) {
        return false;
      }
    }

    // 检查当前节点的 id 是否在 CheckedKeys.value 中
    return append_arr.every(function (i) {
      return i;
    });
  }

  function handleSelectSub(node) {
    // 父节点
    if (node.children) {
      // 子节点是否全部勾选
      const isAllChecked = getIsAllCheck(node, []);

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
                // console.log(node_chlildren);
              } else {
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

  const handleSelect = (selectedKeys, { selected, selectedNodes, node }) => {
    // console.log('选中的Node，看看属性:', node);
    handleSelectSub(node);

    // 最外层处理1级节点的取消问题
    if (node.checked && FirstNodeList.value.includes(node?.id)) {
      // console.log('选中了1级文本，查看1级节点：', node);
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

  /** 项目从树穿梭到右边 */
  function fromTree2show() {
    let foundObjects = getObjectsByIds(treeData, checkedKeys.value);

    // 只保留项目数据
    foundObjects = foundObjects
      .filter((item) => item.status)
      .map((item) => ({
        ...item,
        name: item.name,
      }));

    foundObjects.forEach((item) => {
      // 重复的项目不需要再次添加
      const isDuplicate = selectedProjects.some((project) => project.id === item.id);
      if (!isDuplicate) {
        selectedProjects.push({
          id: item.id,
          name: item.name,
          status: item.status,
          consumableType: item.consumableType,
          deliveryUnit: getDeliveryUnit(item), // 通过新增项目，添加deliveryUnit
          deliveryUnitSetting:
            item?.deliveryUnitSetting === undefined ? {} : item.deliveryUnitSetting,
        });
        /** 表格已有项目将禁止勾选 */
        const foundObject = findObjectById(treeData, item.id);

        if (foundObject) {
          foundObject.disableCheckbox = true;
        }
      }
    });
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

  /** 监听树的变化，用于检测子孙节点是否为灰色勾选 */
  watch(treeData, (newTree) => {
    RunCheckTreeBox(newTree, checkedKeys);
  });
</script>

<style scoped>
  /* 小屏幕设备（如手机） */
  @media (max-width: 768px) {
    .box-left,
    .box-center,
    .box-right {
      width: 100%; /* 小屏幕下元素宽度占满屏幕 */
      margin-bottom: 20px; /* 增加元素之间的间距 */
      float: none; /* 取消浮动 */
    }

    .info-grid-container {
      grid-template-columns: repeat(2, minmax(150px, 1fr)); /* 小屏幕下每行显示两列 */
    }
  }

  /* 中等屏幕设备（如平板） */
  @media (min-width: 769px) and (max-width: 1024px) {
    .info-grid-container {
      grid-template-columns: repeat(3, minmax(150px, 1fr)); /* 中等屏幕下每行显示三列 */
    }
  }

  .inspection {
    height: 100%;
    padding: 10px 20px;
  }

  .box4 {
    width: auto;
    height: auto;
  }

  .box-left {
    /* width: 25.33%; */
    width: max(
      calc(100% - max(calc(41.33% - 70px), 380px) - max(calc(33.33% - 20px), 380px)),
      380px
    );
    height: 100%;
    padding: 0, 5px;
    float: left;
  }

  .box-center {
    /* width: 41.33%; */
    width: max(calc(41.33% - 70px), 380px);
    height: 100%;
    padding: 0, 5px;
    float: left;
  }

  .box-right {
    width: max(calc(33.33% - 20px), 380px);
    height: 100%;
    padding: 0, 5px;
    float: left;
  }

  .sticky-title {
    position: sticky;
    z-index: 1; /* 确保标题在内容上方 */
    top: 0;
    padding: 10px 0; /* 根据需要调整内边距 */
    background: white; /* 背景颜色设置为白色或其他颜色，以覆盖滚动内容 */
  }

  .info-container {
    padding: 10px;
  }

  .info-grid-container {
    display: grid;
    grid-template-columns: var(--grid-columns);
    gap: 10px;
  }

  .info-grid-container p {
    box-sizing: border-box;
    padding: 5px;
  }

  .card {
    min-width: 300px;
    height: auto;
  }

  .card-content {
    height: 70vh;
    max-height: 80vh;
    overflow: auto auto;
  }

  .a-row {
    display: flex;
    flex-wrap: wrap; /* 允许元素换行 */
    gap: 0; /* 元素之间的间距 */
  }

  .a-col {
    flex: 1; /* 元素自动填充剩余空间 */
    min-width: 200px; /* 设置最小宽度，防止内容过于紧凑 */
  }
</style>
