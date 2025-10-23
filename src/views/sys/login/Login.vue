<template>
  <div :class="prefixCls" class="relative w-full h-full px-4">
    <div class="flex items-center absolute right-4 top-4">
      <AppDarkModeToggle class="enter-x mr-2" v-if="!sessionTimeout" />
      <AppLocalePicker
        class="text-white enter-x xl:text-gray-600"
        :show-text="false"
        v-if="!sessionTimeout && showLocale"
      />
    </div>

    <span class="-enter-x xl:hidden">
      <AppLogo :alwaysShowTitle="true" />
    </span>

    <div class="container relative h-full py-2 mx-auto sm:px-10">
      <div class="flex h-full">
        <div class="hidden min-h-full pl-4 mr-4 xl:flex xl:flex-col xl:w-6/12">
          <div class="my-auto">
            <img :alt="title" src="@/assets/svg/login-box-bg.svg" class="w-1/2 -mt-16 -enter-x" />
            <div class="mt-10 font-medium text-white -enter-x">
              <span class="inline-block mt-4 text-3xl"> {{ mainTitle }}</span>
            </div>
            <div class="mt-5 font-normal text-white dark:text-gray-500 -enter-x">
              {{ subTitle }}
            </div>
          </div>
        </div>
        <div class="flex w-full h-full py-5 xl:h-auto xl:py-0 xl:my-0 xl:w-6/12">
          <div
            :class="`${prefixCls}-form`"
            class="relative w-full px-5 py-8 mx-auto my-auto rounded-md shadow-md xl:ml-16 xl:bg-transparent sm:px-8 xl:p-4 xl:shadow-none sm:w-3/4 lg:w-2/4 xl:w-auto enter-x"
          >
            <LoginForm
              v-model:allowSlider="allowSlider"
              v-model:allowRegister="allowRegister"
              v-model:allowSmsLogin="allowSmsLogin"
            />
            <ForgetPasswordForm />
            <RegisterForm />
            <MobileForm />
          </div>
        </div>
        <div
          class="absolute bottom-3 left-10% transform -translate-x-1/2 px-4"
          style="color: white"
        >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { storeToRefs } from 'pinia';

  import { AppDarkModeToggle, AppLocalePicker, AppLogo } from '@/components/Application';
  import { useGlobSetting } from '@/hooks/setting';
  import { useLocaleStore } from '@/store/modules/locale';
  import ForgetPasswordForm from './ForgetPasswordForm.vue';
  import LoginForm from './LoginForm.vue';
  import MobileForm from './MobileForm.vue';
  import RegisterForm from './RegisterForm.vue';

  import { useConfigStore } from '@/store/modules/sysConfig';

  const configStore = useConfigStore();
  const { mainTitle, subTitle, allowSlider, allowRegister, allowSmsLogin } =
    storeToRefs(configStore);

  onMounted(async () => {
    await configStore.fetchConfig();
  });

  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });

  const globSetting = useGlobSetting();
  const localeStore = useLocaleStore();
  const showLocale = localeStore.getShowPicker;
  const title = computed(() => globSetting?.title ?? '');
  const { prefixCls } = useDesign('login');
</script>

<style lang="less">
  @prefix-cls: ~'@{namespace}-login';
  @logo-prefix-cls: ~'@{namespace}-app-logo';
  @countdown-prefix-cls: ~'@{namespace}-countdown-input';
  @dark-bg: #293146;

  html[data-theme='dark'] {
    .@{prefix-cls} {
      background-color: @dark-bg;

      &::before {
        background-image: url('@/assets/svg/login-bg-dark.svg');
      }

      .ant-input,
      .ant-input-password {
        background-color: #232a3b;
      }

      .ant-btn:not(.ant-btn-link, .ant-btn-primary) {
        border: 1px solid #4a5569;
      }

      &-form {
        background: transparent !important;
      }

      .app-iconify {
        color: #fff;
      }

      .ant-divider-inner-text {
        color: @text-color-secondary;
      }
    }
  }

  .@{prefix-cls} {
    min-height: 100%;
    overflow: hidden;

    /* stylelint-disable-next-line media-query-no-invalid */
    @media (max-width: @screen-xl) {
      background-color: #293146;

      .@{prefix-cls}-form {
        background-color: #fff;
      }
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      margin-left: -48%;
      background-image: url('@/assets/svg/login-bg.svg');
      background-repeat: no-repeat;
      background-position: 100%;
      background-size: auto 100%;
      /* stylelint-disable-next-line media-query-no-invalid */
      @media (max-width: @screen-xl) {
        display: none;
      }
    }

    .@{logo-prefix-cls} {
      position: absolute;
      top: 12px;
      height: 30px;

      &__title {
        color: #fff;
        font-size: 16px;
      }

      img {
        width: 32px;
      }
    }

    .container {
      .@{logo-prefix-cls} {
        display: flex;
        width: 60%;
        height: 80px;

        &__title {
          color: #fff;
          font-size: 24px;
        }

        img {
          width: 48px;
        }
      }
    }

    &-sign-in-way {
      .anticon {
        color: #888;
        font-size: 22px;
        cursor: pointer;

        &:hover {
          color: @primary-color;
        }
      }
    }

    input:not([type='checkbox']) {
      min-width: 360px;
      /* stylelint-disable-next-line media-query-no-invalid */
      @media (max-width: @screen-xl) {
        min-width: 320px;
      }
      /* stylelint-disable-next-line media-query-no-invalid */
      @media (max-width: @screen-lg) {
        min-width: 260px;
      }
      /* stylelint-disable-next-line media-query-no-invalid */
      @media (max-width: @screen-md) {
        min-width: 240px;
      }
      /* stylelint-disable-next-line media-query-no-invalid */
      @media (max-width: @screen-sm) {
        min-width: 160px;
      }
    }

    .@{countdown-prefix-cls} input {
      min-width: unset;
    }
  }

  .login-body {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: linear-gradient(to bottom right, #5999e6 60%, #9fbff0 100%);
    background-size: cover;

    .login-panel {
      width: 22%;
      min-width: 500px;
      height: 30%;
      min-height: 450px;
      margin-top: 20px;

      /* position: absolute; */

      /* top: 0; */

      /* bottom: 0; */

      /* left: 35%; */

      /* right: 0; */

      /* margin: auto; */
      margin-left: 22%;
      padding: 25px;
      border-radius: 5%;
      background: rgb(255 255 255);
      box-shadow: 2px 2px 10px #ddd;
    }
  }

  #title-left-pic {
    width: 13rem;
    margin-top: 25px;
    margin-left: 18px;
  }

  #footer {
    margin-top: 60px;
    //float: left;
    color: white;
    text-align: center;
  }

  #title-left {
    align-content: center;
    width: 50%;
    height: 60%;
    margin-top: 100px;
    padding-left: 200px;
    float: left;
  }

  .right-panl {
    width: 50%;
    height: 600px;
    margin-top: 100px;
    float: left;
  }

  .main {
    height: 700px;
  }

  .demo-tabs > .el-tabs__content {
    padding: 32px;
    color: #6b778c;
    font-size: 32px;
    font-weight: 600;
  }

  .login-title {
    //margin-bottom: 22px;
    color: white;
    font-size: 50px;
    text-align: center;
  }

  //.el-form-item {
  //  height: 100px;
  //}

  #sign-reset {
    text-align: end;
  }

  .el-tabs {
    margin: 20px;
  }

  :deep .tabs .el-tabs__item {
    font-size: 20px;
  }

  //::v-deep #tab-password {
  //  font-size: 260px;
  //}
  .login-content {
    margin-top: 30px;
  }

  .login-content-sms {
    margin-top: 32px;
  }

  #sms-login-button {
    margin-bottom: 80px;
  }

  :deep .vercode-form .el-input {
    width: 290px;
    float: left;
  }

  :deep .vercode-form .el-button {
    min-width: 110px;
    height: 42px;
    margin-left: 6px;
    float: left;
    background-color: #2d75f4;
    color: white;
  }

  .el-row {
    margin-bottom: 20px;
  }

  .el-row:last-child {
    margin-bottom: 0;
  }

  .el-col {
    border-radius: 4px;
  }

  .grid-content {
    min-height: 36px;
    border-radius: 4px;
  }

  .net-record {
    font-size: 16px;

    a {
      color: #fff;
      text-decoration: none;
    }
  }
</style>
