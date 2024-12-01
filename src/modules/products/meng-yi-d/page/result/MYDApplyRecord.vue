<template>
  <div class="apply-record">
    <div v-if="applyList.length && isOverLoading">
      <div class="apply-record-item" v-for="(apply, applyIndex) in applyList" :key="apply.applyId">
        <div class="apply-item-top">
          <div class="top-left">
            <img :src="apply.productImage" class="logo" />
            <p class="product-name">{{apply.productName}}</p>
          </div>
          <div class="apply-status">{{approveCode[apply.applyStatus]}}</div>
        </div>
        <div class="apply-item-body">
          <div class="desc-item">
            <p class="product-desc">最高金额:</p>
            <p class="product-num">{{apply.limitMax}}万</p>
          </div>
          <div class="desc-item">
            <p class="product-desc">最长期限:</p>
            <p class="product-num">{{apply.productTerm}}</p>
          </div>
        </div>
        <img class="arrow" v-if="apply.applyStatus === 'APPLYING'" :src="icArrow" @click="gotoDetail(applyIndex)" />
      </div>
    </div>
    <v-empty v-if="!applyList.length && isOverLoading" :desc="emptyDesc">
      <div class="common-submit-btn">
        <div class="submit-btn">
          <Button @click="gotoApply">马上去申请</Button>
        </div>
      </div>
    </v-empty>
  </div>
</template>
<script>
import empty from '@/common/components/common/Empty.vue';
import { getPersonApplyList } from '@/request/interface/impower/Bill.js';
import { APPROVE_CODE } from '@/utils/common/config';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { commonMydMixin } from '@/modules/products/meng-yi-d/utils/common';

export default {
  name: 'MYDApplyRecord',
  mixins: [commonMydMixin],
  data() {
    return {
      emptyDesc: '暂无申请记录',
      icArrow: require('@/assets/imgs/icon/ic_arrow_wh.png'),
      isOverLoading: false,
      applyList: [],
      approveCode: APPROVE_CODE
    };
  },
  components: {
    'v-empty': empty
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      this.getMydUnionKey();
      getPersonApplyList()
        .then((res) => {
          res?.data?.data && (this.applyList = res.data.data);
        })
        .catch((err) => {
          this.$toasting.error({ msg: err?.data?.msg || '获取申请记录失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
          this.isOverLoading = true;
        });
    },

    // 查看产品的申请结果
    gotoDetail(index) {
      let apply = this.applyList[index];
      if (String(apply?.productId) === String(this.creditPreInfo.productId)) {
        this.gotoApply();
      }
    },

    /**
     * 去授信申请
     * */
    async gotoApply() {
      try {
        const productId = this.creditPreInfo.productId;
        const referrer = this.creditPreInfo.referrer;
        let nextPath = await queryNextByUnionKeyAndProdId(productId, this.applyUnionKey);
        this.$router.replace({ path: nextPath, query: { referrer, productId } });
      } catch (e) {
        this.$toasting.error({ msg: e?.data?.msg || '加载失败！' });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import '../../assets/css/common.scss';
.apply-record {
  min-height: 100vh;
  background: rgba(244, 246, 249, 1);
  .apply-record-item {
    background: #ffffff;
    position: relative;
    padding: 12px 24px;
    border: 1px solid rgba(244, 246, 249, 1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .apply-item-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .top-left {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .logo {
          width: 66px;
          background-size: 100% 100%;
          margin-right: 4px;
        }
        .product-name {
          font-size: 26px;
          font-weight: 500;
          color: rgba(51, 51, 51, 1);
          margin-right: 20px;
        }
        .product-tag-wrapper {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          flex: 1 1 7.625rem;
        }
        .product-tag {
          background: rgba(239, 245, 255, 1);
          font-size: 22px;
          font-weight: 500;
          color: rgba(57, 130, 255, 1);
          text-align: center;
          margin-right: 20px;
          padding: 4px 8px;
          margin-top: 4px;
        }
      }
      .apply-status {
        font-size: 26px;
        font-weight: 500;
        white-space: nowrap;
        color: rgba(27, 111, 251, 1);
      }
    }
    .apply-item-body {
      display: flex;
      justify-content: space-around;
      margin-top: 12px;
      padding-right: 1.875rem;
      .desc-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .product-desc {
          font-size: 22px;
          font-weight: 400;
          color: rgba(117, 117, 117, 1);
        }
        .product-num {
          text-align: center;
          font-size: 18px;
          font-weight: 500;
          color: rgba(51, 51, 51, 1);
        }
      }
    }
  }
  .arrow {
    padding: 10px;
    width: 45px;
    position: absolute;
    right: 15px;
    bottom: 8px;
  }
}
</style>
