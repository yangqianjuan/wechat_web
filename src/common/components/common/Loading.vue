<template>
  <van-popup class="loading-over" :close-on-click-overlay="false" v-model="show" style="background-color:transparent">
    <div class="loadingWrap">
      <van-loading
        v-if="show"
        :type="loading.type"
        :color="loading.color"
        :text-size="loading.textSize"
        :size="loading.size"
        :text-color="loading.textColor"
        :vertical="loading.vertical"
      >
        <span>{{ loading.text }}</span>
      </van-loading>
    </div>
  </van-popup>
</template>

<script>
export default {
  name: 'Loading',
  data() {
    return {
      show: false,
      loading: {
        color: '#c9c9c9',
        type: 'spinner',
        size: '30px',
        textSize: '14px',
        textColor: '#c9c9c9',
        vertical: true,
        text: '加载中...'
      }
    };
  }
};
</script>

<style lang='scss'>
.loadingWrap {
  .van-popup {
    top: 45%;
  }
  .van-loading {
    width: 200px;
    height: 180px;
    background-color: rgba(0, 0, 0, 0.7);
    .van-loading__spinner {
      margin-top: 30px;
    }
  }

  .van-loading__text {
    font-size: 36px !important;
  }
}
.van-overlay {
  // background-color: unset;
}
</style>

