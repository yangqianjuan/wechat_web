<template>
  <div @click="gotoDetail" class="card-wrapper">
    <p class="title">{{cardConfig.title}}</p>
    <div class="right-wrapper">
      <slot></slot>
      <img class="ic-arrow" :src="icArrow" alt="箭头" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    cardConfig: {
      type: Object
    },
    applyUnionKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      icArrow: require('@/assets/imgs/icon/ic_arrow.png')
    };
  },
  methods: {
    gotoDetail() {
      this.$router.push({ path: this.cardConfig.targetPath, query: { applyUnionKey: this.applyUnionKey } });
    }
  }
};
</script>

<style scoped lang="scss">
.card-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 25px 50px 25px 50px;
}
.title {
  font-size: 30px;
  font-weight: 600;
}
.right-wrapper {
  display: flex;
  align-items: center;
}
.ic-arrow {
  height: 28px;
  width: 25px;
}
</style>
