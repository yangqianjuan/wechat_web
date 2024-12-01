<template>
  <div class="item-wrapper">
    <div class="itemName">{{itemName}}</div>
    <div class="itemVal">{{itemVal}}</div>
  </div>
</template>
<script>
export default {
  props: {
    itemName: {
      type: String
    },
    itemVal: {
      type: String
    }
  }
};
</script>
<style lang="scss" scoped>
.item-wrapper {
  width: 100%;
  display: flex;
  border-bottom: 1px solid #eadfdf;
}
.itemName {
  font-size: 28px;
  font-weight: 500;
  flex: 1 1 100px;
}
.itemVal {
  font-size: 28px;
  font-weight: 500;
  flex: 6 1 100px;
}
</style>
