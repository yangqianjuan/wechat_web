<template>
  <div class="tab-wrapper">
    <div class="tab" v-for="(tabItem, index) in tabList" :key="index" @click="changeTab(index)">
      <img class="tab-icon" :src="nowTabIndex === index ? tabItem.selectIcon : tabItem.unSelectIcon" />
      <p class="icon-desc" :class="nowTabIndex === index ? 'select-desc' : ''">
        {{ tabItem.desc }}
      </p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'v-tab',
  data() {
    return {
      nowTabIndex: 0
    };
  },
  props: {
    tabList: {
      type: Array
    }
  },
  created() {
    this.$nextTick(() => {
      let tabIndex = this.tabList.findIndex(item => {
        if (this.$route.path === '/bjb_loans_home' && item.targetPath === '/') {
          return true;
        } else {
          return item.targetPath == this.$route.path;
        }
      });
      this.nowTabIndex = tabIndex;
    });
  },
  methods: {
    changeTab(tabIndex) {
      if (tabIndex !== this.nowTabIndex) {
        let path = this.tabList[tabIndex].targetPath;
        this.nowTabIndex = tabIndex;
        path ? this.$router.replace({ path: this.tabList[tabIndex].targetPath }) : this.$emit('getTabIndex', tabIndex);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.tab-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  background: #ffffff;
  padding-top: 10px;
  .tab {
    flex: 1 0 10px;
    text-align: center;
  }
  .tab-icon {
    height: 20px;
    width: 20px;
  }
  .icon-desc {
    font-size: 22px;
    font-weight: 500;
    color: rgba(153, 153, 153, 1);
  }
  .select-desc {
    color: #1b6ffb;
  }
}
</style>
