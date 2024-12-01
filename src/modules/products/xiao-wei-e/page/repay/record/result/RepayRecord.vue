<template>
  <div class="bill-wrapper" v-if="isOverLoading">
    <div class="title-wrapper" v-if="isOverLoading && repayList.length">
      <repay-item
        v-for="(repay, index) in repayList"
        :key="index"
        :billItemConfig="repay"
        @gotoDetail="gotoDetail(index)"
      ></repay-item>
    </div>
    <van-dialog v-model="isShowModel" title="还款详情" cancelButtonText="关闭" show-cancel-button :showConfirmButton="false">
      <div class="prepay-detail">
        <p class="prepay-item">
          还款金额:
          <span class="prepay-value">{{selectItem.realRepayAmt}}</span>
        </p>
        <p class="prepay-item">
          还款时间:
          <span class="prepay-value">{{selectItem.date}}</span>
        </p>
        <p class="prepay-item">
          支付单号:
          <span class="prepay-value">{{selectItem.repaySeqNo}}</span>
        </p>
        <p class="prepay-item">
          借款单号:
          <span class="prepay-value">{{selectItem.loanReceiptNo}}</span>
        </p>
      </div>
    </van-dialog>
    <div class="empty-wrapper" v-if="isOverLoading && !repayList.length">
      <img class="empty-icon" :src="emptyIcon" alt />
      <p>暂无还款记录</p>
    </div>
  </div>
</template>

<script>
import { queryCapRepayRetByLoanReceiptNo } from '@/request/interface/impower/Bill.js';
import { toThousands } from '@/utils/common/common';
import RepayItem from '../common/RepayItem.vue';
export default {
  // 还款记录
  data() {
    return {
      isShowModel: false,
      selectItem: {},
      repayList: [],
      isOverLoading: false,
      emptyIcon: require('@/assets/imgs/icon/ic_empty.png')
    };
  },
  created() {
    this.getCapRepayRetByLoanReceiptNo();
  },

  components: {
    'repay-item': RepayItem
  },
  // loanReceiptNo	普惠借据单号	string
  // productId	产品Id	string
  // productImage	产品图片	string
  // productName	产品名称	string
  // realRepayAmt	还款金额	number
  // repaySeqNo	还款流水号	string
  // repayStatus	还款状态:1还款中,2成功,3失败	integer(int32)
  // repayStatusStr	还款状态详情	string
  // transDate	还款申请日期
  methods: {
    /**
     * 获取还款的记录
     * */
    getCapRepayRetByLoanReceiptNo() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      let applyUnionKey = this.$store.state.applyUnionKey;
      queryCapRepayRetByLoanReceiptNo({ applyUnionKey })
        .then((res) => {
          let repayList = res?.data?.data;
          if (repayList?.length) {
            repayList.forEach((repay) => {
              let date = repay.transDate;
              repay.realRepayAmt = toThousands(parseInt(repay.realRepayAmt).toFixed(2));
              repay.date = `${date.substr(0, 4)}-${date.substr(4, 2)}-${date.substr(6, 2)}`;
            });
            this.repayList = repayList;
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '还款记录获取错误！' });
        })
        .finally(() => {
          this.$toasting.hide();
          this.isOverLoading = true;
        });
    },

    /**
     * 查看还款的详情
     * */
    gotoDetail(index) {
      let repay = this.repayList[index];
      if (repay) {
        this.selectItem = repay;
        this.isShowModel = true;
      } else {
        this.$toasting.info({ msg: '暂无详情' });
      }
    },

    ok() {},
    cancel() {}
  }
};
</script>
<style lang="scss" scoped>
.bill-wrapper {
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .title-wrapper {
    background: #ffffff;
    border-radius: 5px;
    flex: 1;
    overflow: auto;
    margin-bottom: 5vh;
  }
}
.prepay-detail {
  padding: 8px 8px;
}
.prepay-item {
  margin: 12px 0 12px 16px;
  font-size: 26px;
  font-weight: 500;
  color: rgba(51, 51, 51, 1);
}
.prepay-value {
  color: rgba(117, 117, 117, 1);
  margin-left: 8px;
}
/deep/ .van-dialog {
  border-radius: 0;
  .van-dialog__header {
    padding: 12px 0 !important;
  }
}
.empty-wrapper {
  position: absolute;
  top: -70px;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  p {
    font-size: 36px;
    margin-top: 22px;
    font-weight: 600;
  }
  .empty-icon {
    width: 330px;
    height: 330px;
  }
}
</style>
