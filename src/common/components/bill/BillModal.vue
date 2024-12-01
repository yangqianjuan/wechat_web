<template>
  <div class="bill-modal-mask">
    <div class="bill-modal-wrapper">
      <p class="title">{{title}}</p>
      <p class="close-icon" @click="cancel">×</p>
      <slot></slot>
      <Button class="modal-sub-btn" type="primary" @click.stop="ok">{{btnDesc}}</Button>
      <p class="modal-note">{{modalNote}}</p>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: String,
    btnDesc: String,
    modalNote: String
  },
  data() {
    return {};
  },
  created() {},
  methods: {
    cancel() {
      this.$emit('cancel');
    },
    ok() {
      this.$emit('ok');
    }
  }
};
</script>
<style lang="scss" scoped>
.bill-modal-mask {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  .bill-modal-wrapper {
    position: absolute;
    bottom: 0;
    width: 100%;
    background: #ffffff;
    padding: 1.25rem 1.25rem 0.9375rem 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    .title {
      font-weight: 400;
      color: rgba(51, 51, 51, 1);
    }
    .close-icon {
      position: absolute;
      right: 1.375rem;
      top: 0.3125rem;
      height: 0.75rem;
      width: 0.75rem;
    }
    .modal-note {
      font-weight: 400;
      color: rgba(127, 127, 127, 1);
      margin-top: 0.75rem;
    }
    .modal-sub-btn {
      width: 100%;
      margin-top: 30px;
      font-weight: 500;
      color: rgba(255, 255, 255, 1);
    }
  }
}
</style>
