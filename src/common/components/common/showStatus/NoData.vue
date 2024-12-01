<template>
  <div class="no-data">
    <div class="image">
      <img :src="src" alt="加载出错" />
    </div>
    <div class="text">暂无数据</div>
  </div>
</template>
<script>
export default {
  name: 'GNoData',
  data() {
    return {
      src: require('@/assets/imgs/common/noData/no-data.png')
    };
  }
};
</script>
<style lang="scss">
.no-data {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f5f5f9;
  .image {
    margin-top: 80px;
    img {
      width: 500px;
      height: 460px;
    }
  }
  .text {
    font-size: 36px;
    font-weight: 500;
    color: #333333;
  }
}
</style>
