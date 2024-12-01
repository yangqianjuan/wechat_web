<template>
  <div class="sc-input-wrapper">
    <img :src="titleIcon" class="ic-title" alt="">
    <div class="desc-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    titleIcon: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
  .sc-input-wrapper {
    margin-top: .25rem;
    display: flex;
    align-items: center;
    .ic-title {
      height: 1.25rem;
      widows: 1.25rem;
      margin-right: .5625rem;
    }
    .desc-wrapper {
      padding: 1.25rem 0 1.25rem .9375rem;
      border-bottom: 1px solid rgba(153 , 153, 153, .5);
      flex: 1 1 18.75rem;
    }
  }
</style>