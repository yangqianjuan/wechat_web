<template>
  <div class="empty-wrapper">
    <img class="empty-icon" :src="emptyIcon" alt />
    <p>{{desc}}</p>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: "vEmpty",
  props: {
    desc: {
      type: String
    }
  },
  data() {
    return {
      emptyIcon: require("@/assets/imgs/icon/ic_empty.png")
    };
  }
};
</script>
<style lang="scss" scoped>
.empty-wrapper {
  position: absolute;
  top: -70px;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  p {
    font-size: 36px;
    margin-top: 22px;
    font-weight: 600;
  }
  .empty-icon {
    width: 330px;
    height: 330px;
  }
}
</style>