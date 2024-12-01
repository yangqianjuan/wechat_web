<template>
  <div class="model-mask">
    <div class="model-wrapper">
      <div class="title-warpper">
        <p class="title" v-if="title">{{title}}</p>
      </div>

      <div class="body">
        <slot></slot>
      </div>

      <div class="btn-wrapper">
        <van-button class="btn btn-cancel" @click="cancel" v-if="isShowCancel" size="small">取消</van-button>
        <van-button
          class="btn btn-ok"
          :class="isShowCancel ? '' : 'isOnlyConfirm'"
          type="primary"
          :loading="loading"
          @click="confirm"
          size="small"
        >确定</van-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      defautl: 'testTitle'
    },
    isShowCancel: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      icClose: require('@/assets/imgs/icon/ic_close.png')
    };
  },
  methods: {
    cancel() {
      this.$emit('cancel');
    },
    confirm() {
      this.$emit('ok');
    }
  }
};
</script>

<style lang="scss" scoped>
.model-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: -50px;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}
.model-wrapper {
  width: 90%;
  border-radius: 0.5rem;
  background: #ffffff;
  margin: 0 1.25rem;
}
.title-warpper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 0.9375rem 1.25rem 1.25rem;
}
.title {
  font-size: 28px;
  font-weight: 500;
  color: #333333;
}
.ic-close {
  height: 25px;
  width: 25px;
}
.body {
  padding: 20px 0;
  border-bottom: 1px solid #ededed;
  border-top: 1px solid #ededed;
}
.btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
}
.btn {
  font-size: 28px;
  padding: 8px 48px;
  font-weight: 500;
  border-radius: 5px;
}
.btn-cancel {
  border: 1px solid #666666;
  color: #666666;
  background: #ffffff;
  margin-right: 70px;
}
.isOnlyConfirm {
  font-size: 24px;
  padding: 0 28px;
  background: #1b6ffb;
  border-radius: 6px;
}
.btn-ok {
  background: #1b6ffb;
  color: #ffffff;
  border: 0;
}
</style>
