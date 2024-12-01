<template>
  <div>
    <div class="repay-acount-wrapper" v-if="Object.keys(repayBankCard).length">
      <div class="remind">
        <div v-if="repayBankCard && repayBankCard.type === '02'">客户 {{repayBankCard.userName}} 电子账户信息</div>
        <div v-if="repayBankCard && repayBankCard.type === '01'">客户 {{repayBankCard.userName}} 银行卡信息</div>
        <div class="right-detail" @click.stop="toDetailInfo" v-if="repayBankCard && repayBankCard.type === '02'">
          <div>明细详情</div>
          <van-icon name="arrow" />
        </div>
      </div>
      <!-- 银行卡类型 -->
      <div class="bank-info" v-if="repayBankCard && repayBankCard.type === '01'">
        <div class="info-item">
          <div class="title">姓名:</div>
          <div class="desc black-col">{{repayBankCard.userName}}</div>
        </div>
        <div class="info-item">
          <div class="title">银行卡号:</div>
          <div class="desc">{{repayBankCard.bankCardNo | formatBankNo}}</div>
        </div>
        <div class="info-item">
          <div class="title">开户行:</div>
          <div class="desc">{{repayBankCard.bankName}}</div>
        </div>
      </div>
      <!-- 电子账户类型 -->
      <div v-if="repayBankCard && repayBankCard.type === '02'">
        <ElecAccountInfo :info="repayBankCard"></ElecAccountInfo>
      </div>
    </div>
    <div v-if="isShow">
      <van-empty description="暂无账户信息" />
    </div>
  </div>
</template>
<script>
import { queryReapyAcountInfo } from '@/controller/bank.js';
import ElecAccountInfo from './electronicAccountInfo/ElecAccountInfo.vue';
import { getUnionKey } from '@/request/interface/common/index';
export default {
  data() {
    return {
      creditNo: '',
      productId: '',
      repayBankCard: {},
      isShow: false
    };
  },
  components: { ElecAccountInfo },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.creditNo = this.getUrlParam('creditNo');
      this.productId = this.getUrlParam('productId');
      if (this.creditNo && this.productId) {
        this.getRepayAcountInfo();
        this.getApplyUnionKey();
      }
    },

    getApplyUnionKey() {
      let payload = {};
      payload.referrer = this.$store.state.referrer;
      payload.productId = this.$store.state.productId;
      getUnionKey(payload)
        .then((res) => {
          if (res?.data?.data) {
            sessionStorage.setItem('repayApplyUnionKey', res.data.data);
          }
        })
        .catch((err) => {
          this.$notify.error({
            msg: err?.data?.msg || '获取用户的操作标识失败！'
          });
        });
    },

    getRepayAcountInfo() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      queryReapyAcountInfo({ creditNo: this.creditNo, productId: this.productId })
        .then((repayBankCard) => {
          if (repayBankCard) {
            this.repayBankCard = repayBankCard;
            if (!Object.keys(this.repayBankCard).length) {
              this.isShow = true;
            }
            this.repayBankCard.routerProductId = this.productId;
            this.repayBankCard.routerCreditNo = this.creditNo;
          } else {
            this.isShow = true;
          }
        })
        .catch((err) => {
          this.$notify.error({
            msg: err?.data?.msg || '还款账户信息获取失败！'
          });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    /**
     * 明细详情在电子账户的信息类型下展示
     *
     * */
    toDetailInfo() {
      if (Object.keys(this.repayBankCard).length) {
        this.$router.push({ name: 'XWEBankAcountDetailInfo', query: { info: JSON.stringify(this.repayBankCard) } });
      } else {
        this.$notify.error({
          msg: '暂无还款账户信息！'
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.repay-acount-wrapper {
  min-height: 100vh;
}
.remind {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.right-detail {
  display: flex;
  margin-right: 20px;
  align-items: center;

  i {
    height: 21px;
    font-size: 32px;
    margin-left: 10px;
  }
  .van-icon::before {
    color: #7f7f7f;
  }
}
.bank-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 8px 16px;
  padding: 16px 16px;
  background-color: #f4f6f9;
  border-radius: 8px;
  -moz-box-shadow: 0 0 10px #f4f6f9;
  -webkit-box-shadow: 0 0 10px #f4f6f9;
  box-shadow: 0 0 10px #f4f6f9;
  .info-item {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 12px;

    .title {
      width: 23%;
      font-size: 28px;
      font-weight: 400;
      color: #333333;
      margin: 12px 8px;
    }
    .desc {
      flex: 1;
      font-size: 28px;
      font-weight: 400;
      color: #333333;
    }
  }
}

.desc {
  font-weight: 400;
}
.black-col {
  color: #333333;
}
</style>
