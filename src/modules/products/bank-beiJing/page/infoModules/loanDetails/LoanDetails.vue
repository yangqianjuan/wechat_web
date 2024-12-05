<template>
  <div class="loan-details">
    <div class="loan-content">
      <div class="loan-bg">
        <div class="label">借款金额(元)</div>
        <div class="value">
          {{ loanDetail.loanAmount || 0.0 }}
        </div>
      </div>
      <div class="load-list">
        <div class="load-item">
          <div class="label">借款期限</div>

          <div class="value">{{ loanDetail.loanTerm + '期' }}</div>
        </div>
        <div class="load-item">
          <div class="label">年化利率</div>
          <div class="value">{{ loanDetail.interestRate * 100 + '%' }}</div>
        </div>
        <div class="load-item">
          <div class="label">还款方式</div>
          <div class="value">等额本息</div>
        </div>
        <!-- <div class="load-item">
          <div class="label">借款单号</div>
          <div class="value loan-no">
            <div>
              {{ loanDetail.loanNo || '' }}
            </div>
          </div>
        </div> -->

        <div class="load-item">
          <div class="label">借据单号</div>
          <div class="value">{{ loanDetail.loanReceiptNo || '' }}</div>
        </div>

        <div class="load-item">
          <div class="label">借款状态</div>
          <div class="value">{{ loanApplyStatus[loanDetail.loanAppCode] || '' }}</div>
        </div>

        <div class="load-item">
          <div class="label">借款日期</div>
          <div class="value">{{ loanDetail.createTime || '' }}</div>
        </div>

        <div class="load-item">
          <div class="label">借款合同</div>
          <div class="preview" @click="startPreviewProtocol">点击预览</div>
        </div>
      </div>
    </div>
    <van-popup class="pdf-wrapper beijing-protocol" v-model="isShowProtocol">
      <p-read-prf
        title="借款合同"
        :protocolText="protocolText"
        :isPdf="true"
        :isShowDoc="false"
        :isNess="false"
        :isRead="true"
        @closePdf="closeProtocolShow"
      ></p-read-prf>
    </van-popup>
  </div>
</template>
<script>
/**
 * 借款详情
 */
import { queryBorrowingDetail } from '@/controller/bill.js';
import { beijingDialog } from '../../../utils/common';
import { getBeijingLoanDetailProtocolUrl } from '@/request/interface/impower/Product';
import ReadPdf from '@/common/components/common/ReadPdf.vue';

export default {
  name: 'BjbLoanRecordDetail',
  components: {
    'p-read-prf': ReadPdf
  },
  data() {
    return {
      loanDetail: {},
      isShowProtocol: false,
      protocolText: [],
      // 借款状态
      loanApplyStatus: {
        // 放款成功
        '00': '放款成功',
        // 放款中
        // '01': require(''),
        // 放款失败
        '02': '放款失败'
      }
    };
  },

  created() {
    this.getBorrowingDetail();
  },
  methods: {
    async getBorrowingDetail() {
      try {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        let result = await queryBorrowingDetail({ loanNo: this.$route.query.loanNo });
        result && (this.loanDetail = result);
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '借款详情查询失败！',
          confirmButtonText: '确定'
        });
      } finally {
        this.$toasting.hide();
      }
    },

    async getProtocolText() {
      this.protocolText = [];
      let params = {
        businessKey: this.$route.query.loanNo,
        businessType: 1
      };

      try {
        let protocolRes = await getBeijingLoanDetailProtocolUrl(params);
        if (protocolRes?.data?.success && protocolRes?.data?.data) {
          this.closeProtocolShow();
          this.protocolText = protocolRes.data.data.dataBase64;
        }
      } catch (error) {
        this.isShowProtocol = false;
        beijingDialog({
          message: error?.data?.msg,
          confirmButtonText: '确定'
        });
      }
    },

    startPreviewProtocol() {
      this.getProtocolText();
    },

    closeProtocolShow() {
      this.isShowProtocol = !this.isShowProtocol;
    }
  }
};
</script>
<style lang="scss" scoped>
.loan-details {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 40px 32px;

  .loan-content {
    width: 100%;
    height: calc(100vh - 40px);
    background: #ffffff;
    border-radius: 20px 20px 0px 0px;
    padding: 40px 32px;

    .loan-bg {
      background: url('../../../static/image/repayment/loan_bg.png');
      background-size: contain;
      background-repeat: no-repeat;
      width: 622px;
      height: 228px;
      padding-top: 48px;

      .label {
        font-size: 28px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #8f8b8a;
        text-align: center;
      }

      .value {
        font-size: 64px;
        font-family: DINAlternate-Bold, DINAlternate;
        font-weight: bold;
        color: #a90600;
        text-align: center;
        margin-top: 10px;
      }
    }

    .load-list {
      .load-item {
        height: 104px;
        min-height: 104px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #f4f4f4;

        .label {
          font-size: 28px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #8f8b8a;
        }

        .value {
          font-size: 28px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #2b0e0c;
          max-width: 70%;
        }

        .loan-no {
          div {
            width: 100%;
            font-size: 28px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #2b0e0c;
            //white-space: normal;
            word-wrap: break-word;
          }
        }

        .preview {
          font-size: 28px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #df0301;
        }

        &:last-child {
          border-bottom: none;
        }
      }
    }
  }

  .pdf-wrapper {
    width: 100%;
    height: 100%;
    min-height: 100vh;

    ::v-deep button {
      display: none;
    }
  }
}
</style>
