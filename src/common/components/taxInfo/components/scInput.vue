<template>
  <div class="sc-input-wrapper">
    <div class="title">{{title}}</div>
    <div class="desc-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
  .sc-input-wrapper {
    margin-top: .9375rem;
    border-bottom: 1px solid rgba(153 , 153, 153, .5);
    .title {
      font: 500 1rem PingFangSC-Medium, PingFang SC;
      color: #333333;
    }
    .desc-wrapper {
      margin: 1.6875rem 0 1.25rem;
    }
  }
</style>