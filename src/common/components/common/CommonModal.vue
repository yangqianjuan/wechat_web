<template>
  <div class="common-modal">
    <Modal
      class="common-vant-modal"
      v-model="modalStatus"
      :mask-closable="false"
      :footer-hide="!commonInfo.hideFooter"
      :title="commonInfo.title?commonInfo.title:''"
      @on-ok="ok"
      @on-cancel="cancel"
    >
      <slot></slot>
    </Modal>
  </div>
</template>
<script>
export default {
  /**
   * 这是一个通用的弹框 vant提供
   *
   * */
  name: "CommonModal",
  props: {
    status: {
      type: Boolean,
      default: false
    },
    commonInfo: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      modalStatus: false
    };
  },
  watch: {
    status: {
      handler: function (nVal, oVal) {
        this.modalStatus = nVal;
      },
      immediate: false,
      deep: true
    }
  },
  methods: {
    ok() {},
    cancel() {
      this.$emit("update:status", false);
    }
  }
};
</script>
<style lang="scss">
.common-vant-modal {
  padding: 0 !important;
  .ivu-modal-content {
    .ivu-modal-body {
      padding: 0;
      overflow: auto;
      #anhuiLoginPanel {
        margin-left: -8px;
      }
    }
    overflow: hidden;
  }
}
</style>
