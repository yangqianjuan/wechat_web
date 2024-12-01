<template>
  <div class="user-setting-content">
    <show-item class="item" itemName="姓名" :itemVal="userInfo.name"></show-item>
    <show-item class="item" itemName="手机号" :itemVal="userInfo.phoneNum"></show-item>
    <show-item class="item" itemName="地址" :itemVal="userInfo.address"></show-item>

    <div class="rebind-btn-wrapper">
      <a class="rebind-btn" @click="switchLogoutModel">退出登录</a>
    </div>
    <p-modal v-show="isShowReLogin" title="退出登录" @ok="logout" @cancel="switchLogoutModel">
      <p class="logout">是否退出登录</p>
    </p-modal>
  </div>
</template>

<script>
import showItem from '@/common/components/common/showItem';
import Modal from '@/common/components/common/Modal';
import { logout } from '@/request/interface/impower/UserInfo.js';
export default {
  name: 'UserSet',
  components: {
    'show-item': showItem,
    'p-modal': Modal
  },
  data() {
    return {
      userInfo: {},
      isShowReLogin: false
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.userInfo = this.$store.state.userInfo;
    },
    logout() {
      this.$toasting.show({ message: '登出中' });
      logout()
        .then(res => {
          // 获取instNo信息
          let path = '/';
          let instNoConfig = sessionStorage.getItem('instNoConfig');
          if (instNoConfig !== 'null' && instNoConfig) {
            instNoConfig = JSON.stringify(JSON.parse(instNoConfig));
          } else {
            instNoConfig = {
              instNo: '1000000',
              appId: process.env.NODE_ENV === 'development' ? 'wxbb2e56137b608e04' : 'wx069c496cd7f1da5d'
            };
          }
          sessionStorage.clear();
          localStorage.clear();
          this.$router.replace({ path }).then(_ => {
            sessionStorage.setItem(
              'middlePageFlowInfo',
              JSON.stringify({ instNo: instNoConfig.instNo, appId: instNoConfig.appId })
            );
          });
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '登出失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },
    switchLogoutModel() {
      this.isShowReLogin = !this.isShowReLogin;
    }
  }
};
</script>

<style lang="scss" scoped>
.user-setting-content {
  min-height: 100vh;
  background: #ffffff;
  .item {
    padding: 30px 0 30px 30px;
  }
  .rebind-btn-wrapper {
    position: fixed;

    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    a {
      font-size: 30px;
    }
  }
  .rebind-btn {
    margin-top: 2.5rem;
  }
  .logout {
    padding-left: 1.25rem;
  }
}
</style>
