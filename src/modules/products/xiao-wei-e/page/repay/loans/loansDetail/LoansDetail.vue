<template>
  <div class="loans-detail-wrapper" v-if="isShow">
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
      <!-- 借款之后的协议的展示 -->
      <div class="item-wrapper" v-if="isShowProtocolDoor  && isShowGuarantee" @click="switchShowProtocol">
        <p class="last-item">借款服务协议及相关协议</p>
        <img :src="arrowIcon" class="ic_arrow" />
      </div>
    </div>
    <div class="pdf-wrapper" v-if="isShowProtocol">
      <p-protocol-list
        @closeProtocol="switchShowProtocol"
        @getProtocolText="getProtocolText"
        :isShowDoc="true"
        :protocoldoc="protocolText"
        :protocolList="protocolList"
      ></p-protocol-list>
    </div>
  </div>
</template>
<script>
import { queryGFBorrowingDetail } from '@/controller/bill.js';
import { LOANS_REFUND_TYPE } from '@/modules/products/xiao-wei-e/page/borrow/config.js';
import ProtocolList from '@/common/components/common/ProtocolList.vue';
import { getGFCreditContractEnd, getGFLendingContractEnd } from '@/request/interface/gf/common.js';
export default {
  /**
   * 借款详情
   *
   * */
  data() {
    return {
      arrowIcon: require('@/assets/imgs/icon/ic_arrow.png'),
      confirmInfoKeyInfo: {
        loanTerm: '借款期限',
        loansInterstRate: '综合利率',
        // guaranteeIr: '担保费率',
        // guaranteeCount: '担保费',
        debitCardNum: '收款账户',
        refundMode: '还款方式',
        loansNo: '借款单号',
        loansDate: '借款日期'
      },
      confirmInfo: {
        loanTerm: '',
        loansInterstRate: '',
        // guaranteeIr: '',
        // guaranteeCount: '',
        debitCardNum: '',
        refundMode: '',
        loansNo: '',
        loansDate: ''
      },
      isShowGuarantee: '',
      loanInfo: {},
      loanAmount: 0,
      productId: '',
      isShowProtocolDoor: true,
      isShowProtocol: false,
      isOverOneDay: false,
      isShow: false,
      protocolList: [
        { code: '07', name: '广发银行贷款合同及相关授权协议（授信）', isReadOver: false },
        { code: '08', name: '广发银行贷款合同及相关授权协议（借款）', isReadOver: false }
      ],
      protocolText: ''
    };
  },

  components: {
    'p-protocol-list': ProtocolList
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      let loanInfo = this.$route.query.loanInfo ? JSON.parse(this.$route.query.loanInfo) : {};
      if (loanInfo && loanInfo.loanNo) {
        this.loanInfo = loanInfo;
        this.getBorrowingDetail();
        this.productId = this.$store.state.productId.toString();
        this.confirmInfoKeyInfo.loansInterstRate = '年化利率';
        this.isShowGuarantee = true;
      } else {
        this.$notify.info({ msg: '暂无详情数据！' });
      }
    },

    /**
     * 获取借款详情
     *
     * */
    getBorrowingDetail() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      queryGFBorrowingDetail({ loanNo: this.loanInfo.loanNo })
        .then((res) => {
          if (res) {
            // 放款失败
            let loanFailCode = '02';
            this.loanAmount = res.loanAmount;
            // 还款方式
            let refundMode;
            LOANS_REFUND_TYPE.forEach((item) => {
              if (item.value === res.paymentType) {
                refundMode = item.name;
              }
            });
            this.confirmInfo = {
              loanTerm: res.loanTerm,
              loansInterstRate: this.isShowGuarantee ? `年化${parseFloat(res.interestRate * 100).toFixed(2)}%` : '0%',
              refundMode: refundMode,
              debitCardNum: res.bankCardDesc,
              loansNo: this.loanInfo.loanNo,
              loansDate: res.createTime
            };
            this.isOverOneDay = res.isOverOneDay;
            this.isShowProtocolDoor = res.loanAppCode !== loanFailCode;
            this.isShow = true;
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '获取借款详情信息失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    switchShowProtocol() {
      this.isShowProtocol = !this.isShowProtocol;
    },

    getProtocolText(protocol) {
      let index = protocol.index;
      this.protocolText = '';
      if (protocol.code === '07') {
        let params = {
          applyUnionKey: sessionStorage.getItem('applyUnionKey_1035')
        };
        getGFCreditContractEnd(params)
          .then((res) => {
            if (res) {
              this.protocolList[index].isReadOver = true;
              this.protocolText = res;
            } else {
              this.isShowProtocol = false;
              this.$notify.error({
                msg: '文件获取失败！'
              });
            }
          })
          .catch((err) => {
            this.isShowProtocol = false;
            this.$notify.error({
              msg: '文件获取失败！'
            });
          });
      }
      if (protocol.code === '08') {
        let params = {
          loanNo: this.loanInfo.loanNo
        };
        getGFLendingContractEnd(params)
          .then((res) => {
            if (res) {
              this.protocolList[index].isReadOver = true;
              this.protocolText = res;
            } else {
              this.isShowProtocol = false;
              this.$notify.error({
                msg: '文件获取失败！'
              });
            }
          })
          .catch((err) => {
            this.isShowProtocol = false;
            this.$notify.error({
              msg: '文件获取失败！'
            });
          });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.loans-detail-wrapper {
  height: 100%;

  .card {
    text-align: center;
    // background: #ffffff;
    background: #f4f6f9;
    -moz-box-shadow: 0 0 10px #f4f6f9;
    -webkit-box-shadow: 0 0 10px #f4f6f9;
    box-shadow: 0 0 10px #f4f6f9;
    padding: 23px 20px 25px 20px;
    // border-radius: 10px;
    .guarantee-count {
      font-size: 65px;
      margin-top: 20px;
      font-weight: 600;
      color: rgba(51, 51, 51, 1);
    }
    .guarantee-unit {
      font-size: 28px;
      font-weight: 500;
      margin-top: 12px;
      color: rgba(51, 51, 51, 1);
    }
  }
  .title-wrapper {
    display: flex;
    align-items: center;
    font-size: 32px;
    font-weight: 500;
    .logo {
      height: 60px;
      max-width: 100px;
      margin-right: 20px;
    }
  }

  // 列表展示
  .list-wrapper {
    background: #f4f6f9;
    -moz-box-shadow: 0 0 10px #f4f6f9;
    -webkit-box-shadow: 0 0 10px #f4f6f9;
    box-shadow: 0 0 10px #f4f6f9;
    padding: 20px 12px;
    // background: #ffffff;
    margin-top: 24px;
    // border-radius: 10px;
  }
  .item-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    padding: 30px 20px;
    border-bottom: 1px rgba(238, 241, 245, 1) solid;
    .last-item {
      font-size: 26px;
      font-weight: 500;
      color: rgba(51, 51, 51, 1);
    }
    .confirm-key {
      color: #333;
      font-size: 26px;
      font-weight: 500;
    }
    .confirm-val {
      color: #333;
      font-size: 26px;
      font-weight: 500;
    }
    .ic_arrow {
      height: 30px;
      width: 30px;
    }
    .rate-desc {
      position: absolute;
      font-size: 20px;
      left: 62px;
      bottom: 2px;
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
