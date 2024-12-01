<template>
  <div>
    <div class="elec-account-info" v-if="Object.keys(elecInfo).length">
      <div class="option">
        <div class="title">客户姓名</div>
        <div class="desc">{{ elecInfo.userName }}</div>
      </div>
      <div class="fill"></div>
      <div class="option">
        <div class="title">电子账户</div>
        <div class="bank-card-no">
          <span class="desc">{{
            bankCardShow ? formatBankNo(elecInfo.bankCardNo) : desensitizationInfo(elecInfo.bankCardNo, 'bankCard')
          }}</span>
          <img class="search-eye" v-if="!bankCardShow" :src="eyeClose" @click="elecShowNo" />
          <img class="search-eye" v-if="bankCardShow" :src="eyeOpen" @click="elecShowNo" />
        </div>
      </div>
      <div class="fill"></div>
      <div class="option">
        <div class="title">开户银行</div>
        <div class="desc">{{ elecInfo.bankName }}</div>
      </div>
      <!-- <div class="fill"></div> -->
      <!-- <div class="option">
        <div class="title">账户余额</div>
        <div class="desc">{{ elecInfo.remainingSum ? elecInfo.remainingSum + " 元" : '0.00 元' }}</div>
      </div> -->
      <div class="fill"></div>
      <div class="protocol-link-wrapper">
        <div class="fill-1">温馨提示：</div>
        <div class="fill-2">查询电子户余额，请下载并登录浦发手机银行APP进行查看！</div>
      </div>
      <div class="operate">
        <van-button v-if="isShowBtn" class="foot-operate-btn" @click.stop="withdrawal">立即提现</van-button>
        <div class="detail" @click.stop="toWithDrawalDetailList">提现明细</div>
      </div>
    </div>
    <div v-else>
      <NoData></NoData>
    </div>
    <van-dialog
      v-model="openIframe"
      title="账户信息"
      cancelButtonText="关闭"
      show-cancel-button
      :showConfirmButton="false"
    >
      <iframe :src="cardShowlink" width="100%" height="100%" frameborder="0"></iframe>
    </van-dialog>
  </div>
</template>
<script>
import NoData from '@/common/components/common/showStatus/NoData.vue';
import { desensitizationInfo } from '@/utils/common/common.js';
import commonFilters from '@/utils/vue/filters/common.js';
export default {
  // 还款电子账户信息
  name: 'ElecAccountInfo',
  props: {
    info: {
      type: Object
    }
  },
  data() {
    return {
      elecInfo: {},
      // 按钮是否展示
      isShowBtn: true,

      // 卡号信息的展示
      openIframe: false,
      bankCardShow: false,
      cardShowlink: '',
      eyeOpen: require('@/assets/imgs/icon/ic_eye.svg'),
      eyeClose: require('@/assets/imgs/icon/ic-eye-close.svg')
    };
  },
  components: {
    NoData
  },
  watch: {
    info: {
      handler: function(nVal, oVal) {
        if (nVal) {
          if (!nVal.remainingSum) {
            this.isShowBtn = false;
          }
          this.elecInfo = nVal;
        }
      },
      immediate: true,
      deep: true
    }
  },

  methods: {
    // 提现
    withdrawal() {
      if (this.elecInfo.routerProductId) {
        this.$router.push({
          name: 'WithDrawal',
          query: { pro_id: this.elecInfo.routerProductId, cre_no: this.elecInfo.routerCreditNo }
        });
      } else {
        this.$notify.info({
          msg: '并未查到对应的产品信息！'
        });
      }
    },

    // 提现明细列表
    toWithDrawalDetailList() {
      if (this.elecInfo.routerProductId) {
        this.$router.push({
          name: 'WithDrawalDetailList',
          query: { pro_id: this.elecInfo.routerProductId, cre_no: this.elecInfo.routerCreditNo }
        });
      } else {
        this.$notify.info({
          msg: '并未查到对应的产品信息！'
        });
      }
    },
    desensitizationInfo,
    formatBankNo: commonFilters.formatBankNo,
    elecShowNo() {
      if (this.elecInfo?.successfulLink) {
        this.cardShowlink = this.elecInfo.successfulLink;
        this.openIframe = true;
      } else {
        this.bankCardShow = !this.bankCardShow;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.elec-account-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  .option {
    width: 100%;
    padding: 0 2vw;
    display: flex;
    align-items: center;
    .title {
      width: 25%;
      font-size: 32px;
      font-weight: 400;
      color: #333333;
      margin: 16px 8px;
    }
    .desc {
      flex: 1;
      font-size: 32px;
      font-weight: 400;
      color: #333333;
    }
  }
  .operate {
    margin-top: 200px;
    width: 80%;
    .van-button {
      width: 100%;
      border-radius: 5px;
      font-size: 36px;
      color: #ffffff;
      background: #1b6ffb;
      font-weight: 600;
    }
    .detail {
      font-size: 30px;

      font-weight: 500;
      color: #3552d0;
      margin-top: 42px;
      text-align: center;
    }
  }
  .fill {
    width: 100%;
    height: 1px;
    background-color: #d8d8d8;
  }
  .protocol-link-wrapper {
    padding: 0.875rem 0.9375rem 1.25rem 1.25rem;
    /* margin-top: 30px; */
    font-weight: 500;
    color: rgba(219, 43, 19, 1);

    .fill-1 {
      font-size: 28px;
      font-weight: 500;
    }
    .fill-2 {
      margin-top: 8px;
      font-size: 28px;
      margin-left: 40px;
      font-weight: 500;
    }
  }
  .bank-card-no {
    display: flex;
    align-items: center;
    width: 80%;
    .desc {
      width: 80%;
      padding: 0 8px;
    }
    .search-eye {
      margin-left: 18px;
      margin-right: 8px;
      width: 40px;
      height: 32px;
    }
  }
}
/deep/.van-dialog__content {
  height: 50vh !important;
}
</style>
