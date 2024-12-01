<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <router-view v-if="!$route.meta.keepAlive"></router-view>
    </transition>
    <transition name="fade" mode="out-in">
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"></router-view>
      </keep-alive>
    </transition>
    <van-number-keyboard safe-area-inset-bottom />
    <v-tab class="tabPosition" v-if="$route.meta.isTab" :tabList="tabList"></v-tab>
  </div>
</template>
<script>
import vTab from '@/common/components/common/vTab.vue';
import { HOME_TABS } from '@/utils/common/config';
import { dataRegister, getRegisterData } from '@/utils/common/global';

let wx = require('weixin-js-sdk');

export default {
  data() {
    return {
      tabList: HOME_TABS,
      a: 1
    };
  },

  created() {
    this.saveData();
  },

  mounted() {
    this.mpBackUrlHandler();
  },

  beforeDestroy() {
    if (window.__wxjs_environment === 'miniprogram') {
      this.resetCacheData();
    }
  },

  components: {
    'v-tab': vTab
  },

  methods: {
    resetCacheData() {
      sessionStorage.clear();
      localStorage.clear();
    },
    // 小程序点击返回进行监听
    mpBackUrlHandler() {
      if (window.__wxjs_environment === 'miniprogram') {
        if (history && history.pushState) {
          history.pushState(
            {
              title: document.title,
              url: location.href
            },
            document.title,
            location.href
          );
        }
        //添加退弹事件
        window.addEventListener('popstate', function(e) {
          wx.miniProgram.reLaunch({
            url: '/pages/productdetail/index?productId=' + localStorage.productId + '&fromEnv=h5'
          });
        });
      }
    },
    /**
     * 旧 数据明文展示
     */
    saveData() {
      if (localStorage.getItem('store')) {
        this.$store.state.taxInitSkipBtn = true;
        this.$store.replaceState(Object.assign({}, this.$store.state, JSON.parse(localStorage.getItem('store'))));
      }
      window.addEventListener('beforeunload', () => {
        this.$store.state.taxInitSkipBtn = true;
        localStorage.setItem('store', JSON.stringify(this.$store.state));
      });
    },

    /**
     * 生产  数据加密
     * */
    init() {
      this.$store.state.taxInitSkipBtn = true;
      this.$store.replaceState(
        Object.assign(
          {},
          this.$store.state,
          getRegisterData({
            name: { project: 'xiaomeng', env: 'beta', version: '1.0.0', product: '', key: '' }
          })
        )
      );
      window.addEventListener('beforeunload', () => {
        this.$store.state.taxInitSkipBtn = true;
        dataRegister({
          name: { project: 'xiaomeng', env: 'beta', version: '1.0.0', product: '', key: '' },
          expire: 0,
          data: this.$store.state
        });
      });
    }
  }
};
</script>
<style lang="scss">
html,
body,
#app {
  min-height: 100%;
}

.tabPosition {
  position: fixed;
  bottom: 0;
  z-index: 100;
}

.tab-wrapper.tabPosition {
  padding: 4px 0;

  .tab {
    img {
      width: 35px;
      height: 35px;
    }

    .icon-desc {
      font-size: 26px;
    }
  }
}

.fade-enter {
  opacity: 0;
}

.fade-leave {
  opacity: 1;
}

.fade-enter-active {
  transition: opacity 0.5s;
}

.fade-leave-active {
  opacity: 0;
  transition: opacity 0.5s;
}
</style>
