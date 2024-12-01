<template>
  <div class="model-mask">
    <div class="model-content">
      <div class="title-content">
        <p class="title" v-if="title">{{title}}</p>
      </div>

      <div class="body">
        <slot></slot>
      </div>

      <div class="btn-content">
        <van-button class="btn btn-cancel" @click="cancel" v-if="isShowCancel" size="small">取消</van-button>
        <van-button
          class="btn btn-ok"
          :class="isShowCancel ? '' : 'isOnlyConfirm'"
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
@import '../../assets/css/common.scss';
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
  .model-content {
    width: 90%;
    border-radius: 0.5rem;
    background: $white;
    margin: 0 1.25rem;
    .title-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 0.9375rem 1.25rem 1.25rem;
      .title {
        font-size: 28px;
        font-weight: 500;
        color: $default-font-color;
      }
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
    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px 0;
      .btn {
        font-size: 28px;
        padding: 8px 48px;
        font-weight: 500;
        border-radius: 5px;
      }
      /deep/.btn-cancel {
        border: 1px solid $btn-border-color;
        margin-right: 70px;
        .van-button__text {
          color: $default-font-color;
          background: $white;
          font-weight: 400;
        }
      }
      .btn-ok {
        background: $btn-bg-color;
        border: 0;
        .van-button__text {
          color: $white;
          font-weight: 400;
        }
      }
      .isOnlyConfirm {
        font-size: 24px;
        padding: 0 28px;
        background: $btn-bg-color;
        border-radius: 6px;
        width: 80%;
      }
    }
  }
}
</style>
