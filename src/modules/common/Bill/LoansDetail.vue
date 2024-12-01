<template>
  <div class="loans-detail-wrapper">
    <div class="card">
      <div class="title-wrapper" slot="title">
        <img class="logo" :src="loanInfo.productLogo" alt />
        {{loanInfo.productName}}
      </div>
      <p class="guarantee-count">{{loanAmount}}</p>
      <p class="guarantee-unit">借款金额(元)</p>
    </div>
    <div class="list-wrapper">
      <div class="item-wrapper" v-for="(item, key) in confirmInfo" :key="key">
        <p class="confirm-key">{{confirmInfoKeyInfo[key]}}</p>
        <p class="confirm-val">{{item}}</p>
        <p class="rate-desc" v-if="key === 'loansInterstRate' && !isShowGuarantee">（年化利率按照单利计算）</p>
      </div>
      <!-- && isOverOneDay -->
      <div class="item-wrapper" v-if="isShowProtocolDoor  && isShowGuarantee" @click="switchShowProtocol">
        <p class="last-item">借款服务协议及相关协议</p>
        <img :src="arrowIcon" class="ic_arrow" />
      </div>
    </div>
    <div class="pdf-wrapper" v-if="isShowProtocol">
      <p-protocol-list
        @closeProtocol="switchShowProtocol"
        @getProtocolText="getProtocolText"
        :protocolText="protocolText"
        :protocolList="protocolList"
      ></p-protocol-list>
    </div>
  </div>
</template>
<script>
import { queryBorrowingDetail } from '@/controller/bill.js';
import { CONFIRM_LOANS_REFUND_TYPE } from '@/modules/products/xiao-meng-kd/page/loans/config.js';
import { getProtocolAfterLoan } from '@/controller/protocol.js';
import ProtocolList from '@/common/components/common/ProtocolList.vue';
export default {
  data() {
    return {
      arrowIcon: require('@/assets/imgs/icon/ic_arrow.png'),
      confirmInfoKeyInfo: {
        loanTerm: '借款期限',
        loansInterstRate: '综合利率',
        debitCardNum: '收款账户',
        refundMode: '还款方式',
        loansNo: '借款单号',
        loansDate: '借款日期'
      },
      confirmInfo: {
        loanTerm: '',
        loansInterstRate: '',
        debitCardNum: '',
        refundMode: '',
        loansNo: '',
        loansDate: ''
      },
      loanInfo: {},
      loanAmount: 0,
      productId: '',
      isShowProtocolDoor: true,
      isShowProtocol: false,
      isOverOneDay: false,
      isShowGuarantee: '',
      protocolList: [
        { code: '07', name: '互联网个人经营性贷款借款合同', isPdf: true },
        { code: '10', name: '担保服务合同' },
        { code: '08', name: '用途申明书' },
        { code: '02', name: '还款账户变更和授信期限变更协议' }
      ],
      protocolText: []
    };
  },
  components: {
    'p-protocol-list': ProtocolList
  },
  created() {
    let loanInfo = this.$route.query.loanInfo ? JSON.parse(this.$route.query.loanInfo) : {};
    this.loanInfo = loanInfo;
    this.getBorrowingDetail();
    this.productId = this.$store.state.productId.toString();
    this.isShowGuarantee = this.productId === '1000';
    !this.isShowGuarantee && (this.confirmInfoKeyInfo.loansInterstRate = '年化利率');
  },
  methods: {
    getBorrowingDetail() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      queryBorrowingDetail({ loanNo: this.loanInfo.loanNo })
        .then((res) => {
          let loanFailCode = '02';
          this.loanAmount = res.loanAmount;
          this.confirmInfo = {
            loanTerm: res.loanTerm,
            loansInterstRate: this.isShowGuarantee ? `年化${res.interestRate * 100}%+担保费（${res.guaranteeFee})` : 0,
            refundMode: CONFIRM_LOANS_REFUND_TYPE[res.paymentType],
            debitCardNum: res.bankCardDesc,
            loansNo: this.loanInfo.loanNo,
            loansDate: res.createTime
          };
          this.isOverOneDay = res.isOverOneDay;
          this.isShowProtocolDoor = res.loanAppCode !== loanFailCode;
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },
    switchShowProtocol() {
      this.isShowProtocol = !this.isShowProtocol;
    },
    getProtocolText(protocol) {
      let code = protocol.code;
      this.protocolText = [];
      let params = {
        loanNo: this.loanInfo.loanNo,
        fileType: code
      };
      getProtocolAfterLoan(params)
        .then((textArr) => {
          this.protocolText = textArr;
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg });
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.loans-detail-wrapper {
  height: 100%;
  background: rgba(244, 246, 249, 1);
  .card {
    text-align: center;
    background: #ffffff;
    padding: 23px 20px 20px 20px;
    border-radius: 10px;
    .guarantee-count {
      font-size: 65px;
      margin-top: 20px;
      font-weight: 600;
      color: rgba(51, 51, 51, 1);
    }
    .guarantee-unit {
      font-size: 26px;
      font-weight: 400;
      color: rgba(51, 51, 51, 1);
    }
  }
  .title-wrapper {
    display: flex;
    align-items: center;
    font-size: 28px;
    font-weight: 500;
    .logo {
      height: 60px;
      max-width: 100px;
      margin-right: 10px;
    }
  }
  .list-wrapper {
    background: #ffffff;
    margin-top: 10px;
    border-radius: 10px;
  }
  .item-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    padding: 20px;
    border-bottom: 1px rgba(238, 241, 245, 1) solid;
    .last-item {
      font-size: 24px;
      font-weight: 400;
      color: rgba(51, 51, 51, 1);
    }
    .ic_arrow {
      height: 30px;
      width: 30px;
    }
    .rate-desc {
      position: absolute;
      font-size: 22px;
      left: 58px;
      bottom: 4px;
    }
  }
  .sub-btn {
    width: 90%;
    margin-top: 25px;
    font-weight: 500;
    margin-left: 5%;
  }
}
</style>
