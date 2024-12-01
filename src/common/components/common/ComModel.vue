<template>
  <div class="model-wrapper" @click.stop="coloseModel">
    <div class="model" @click.stop="prevent">
      <p class="title">{{title}}</p>
      <slot></slot>
      <button @click="coloseModel" class="close-btn">{{btnDesc}}</button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String
    },
    btnDesc: {
      type: String
    }
  },
  data() {
    return {};
  },
  methods: {
    coloseModel() {
      this.$emit('ok');
    },
    prevent() {}
  }
};
</script>
<style lang="scss" scoped>
.model-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 1.25rem;
  position: fixed;
  width: 100%;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  .model {
    width: 100%;
    padding: 1.0625rem 0 1.3125rem 0;
    background: #ffffff;
    border-radius: 0.875rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .title {
    font-size: 30px;
    font-weight: 600;
    color: rgba(51, 51, 51, 1);
    text-align: center;
  }
  .close-btn {
    background: rgba(27, 111, 251, 1);
    width: 60%;
    border-radius: 5px;
    padding: 10px 0;
    font-size: 28px;
    font-weight: 500;
    color: rgba(255, 255, 255, 1);
    border: 0;
  }
}
</style>
