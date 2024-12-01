<template>
  <div class="product-list">
    <div class="content">
      <div class="product-item" v-for="(item, index) in list" :key="item.productName + index">
        <div class="top-desc">专属降息通道{{ index + 1 }}</div>
        <div class="name">{{ item.productName }}</div>
        <div class="operate-btn" @click="clickHandler(item)"></div>
      </div>
    </div>
  </div>
</template>
<script>
import { openpGetProductInfos } from '@/request/interface/common/index';
export default {
  name: 'OpenProductList',
  data() {
    return {
      list: []
    };
  },

  created() {
    this.getLists();
  },
  methods: {
    getLists() {
      const params = {
        groupKey: this.$route.query.groupKey || 'j9GZQuOkQnlx9'
      };
      this.$toasting.show({ message: '加载中', forbidClick: true });
      openpGetProductInfos(params)
        .then(res => {
          if (res?.data?.success && res.data.data) {
            this.list = res.data.data;
          }
        })
        .catch(error => {
          this.$notify.error({ msg: error?.data?.msg });
        })
        .finally(_ => {
          this.$toasting.hide();
        });
    },

    clickHandler(item) {
      if (item?.productLink) {
        try {
          this.$toasting.show({ message: '跳转中', forbidClick: true });
          window.location.href = item.productLink;
        } catch (error) {
          this.$toasting.hide();
          this.$notify.error({ msg: '链接打开失败！' });
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.product-list {
  width: 100%;
  min-height: 100vh;
  background-color: #dc3030;
  background-image: url('../../assets/imgs/open/product_list_bg.png');
  background-repeat: no-repeat;
  background-size: contain;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .content {
    margin-top: 1072px;
    margin-bottom: 60px;
    .product-item {
      width: 657px;
      height: 328px;
      background-image: url('../../assets/imgs/open/product_bg.png');
      background-size: cover;
      background-repeat: no-repeat;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      .top-desc {
        position: absolute;
        top: 3px;
        left: 6px;
        font-size: 28px;
        font-family: FZZCHJW--GB1-0, FZZCHJW--GB1;
        font-weight: normal;
        color: #87080c;
      }
      .name {
        margin-top: 50px;
        font-size: 40px;
        font-family: SourceHanSansCN-Medium, SourceHanSansCN;
        font-weight: 500;
        color: #87080c;
      }
      .operate-btn {
        margin-top: 20px;
        width: 456px;
        height: 106px;
        background-image: url('../../assets/imgs/open/product_btn_bg.png');
        background-size: cover;
        background-repeat: no-repeat;
      }
    }
    .product-item + .product-item {
      margin-bottom: 40px;
    }
    .product-item:first-child {
      margin-bottom: 40px;
    }
  }
}
</style>
