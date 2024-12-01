<template>
  <div class="show-item-wrapper">
    <div class="left">
      <p>{{title}}</p>
      <span class="ness">*</span>
    </div>
    <div class="right">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String
    }
  }
};
</script>

<style>
.show-item-wrapper {
  display: flex;
  text-align: center;
  justify-content: space-between;
  padding: 8px 1.25rem;
  height: 3.7375rem;
  border-bottom: 1px solid #f2f4f8;
}
.left {
  display: flex;
  align-items: center;
  color: #333333;
  font-size: 26px;
  font-weight: 600;
}
.ness {
  color: #db0000;
}
.right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1 1 100px;
}
</style>
