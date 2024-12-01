<template>
  <div>
    <div class="with-drawal-detail" v-if="detailInfo.payeeAccountNo">
      <div class="desc">
        <div
          class="title"
        >提现到{{detailInfo.payeeBankName + ' ( '}}{{ detailInfo.payeeAccountNo | bankShowAfterFour }}{{' )'}}</div>
        <div class="num">{{ detailInfo.withdrawAmt }}</div>
      </div>
      <div class="status">
        <van-steps
          direction="vertical"
          :active-icon="activeIcon"
          :active="trsState"
          :active-color="activeColor"
          inactive-color="#BBBBBB"
        >
          <van-step>
            <div class="title">发起提现申请</div>
            <div class="date">{{ detailInfo.createTime }}</div>
          </van-step>
          <van-step>
            <div class="pending">{{ twoLevel()? twoLevel(): '提现中'}}</div>
          </van-step>
          <van-step>
            <div class="result">{{ detailInfo.withdrawStatusStr ? detailInfo.withdrawStatusStr:"申请成功" }}</div>
          </van-step>
        </van-steps>
      </div>
      <div class="fill"></div>
      <div class="card">
        <div class="row-1">
          <div class="title">付款银行</div>
          <div class="name">{{ detailInfo.payerBankName }}</div>
        </div>
        <div class="row-2">
          <div class="title">付款账号</div>
          <div class="num">{{ detailInfo.payerAccountNo | formatBankNo }}</div>
        </div>
      </div>
      <div class="operate">
        <van-button class="foot-operate-btn" @click.stop="judge">完成</van-button>
      </div>
    </div>
    <div v-if="noData">
      <van-empty description="暂无数据" />
    </div>
  </div>
</template>
<script>
import { gfWithDrawResult } from '@/request/interface/gf/common.js';
export default {
  // 提现详情
  data() {
    return {
      detailInfo: {},
      drawNo: undefined,
      trsState: 1,
      activeColor: '#1b6ffb',
      noData: false,
      activeIcon: 'underway'
    };
  },
  created() {
    this.getDetailInfo();
  },
  methods: {
    // 获取提现详情
    getDetailInfo() {
      if (this.$route.query.withdrawId) {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        gfWithDrawResult({ withDrawApplyId: this.$route.query.withdrawId })
          .then((res) => {
            if (res?.data?.data) {
              this.trsStateHandle(res.data.data.withdrawStatus);
              this.detailInfo = res.data.data;
            } else {
              this.noData = true;
            }
          })
          .catch((err) => {
            this.$notify.error({
              msg: err?.data?.msg || '获取提现记录失败！'
            });
          })
          .finally(() => {
            this.$toasting.hide();
          });
      } else {
        this.$notify.error({
          msg: '获取提现记录失败！'
        });
      }
    },
    judge() {
      this.$router.replace('/xwe_bank_withDrawal_detail_list');
    },
    handleShow(type, data) {
      if (type === 'bankCardNo' && typeof data === 'string' && data.length && data.length > 4) {
        return data.substring(data.length - 4);
      }
    },
    twoLevel() {
      if (this.detailInfo.withdrawStatus === '1') {
        return this.detailInfo.withdrawStatusStr;
      }
      if (this.detailInfo.withdrawStatus === '0') {
        return '提现中';
      }
      return undefined;
    },
    // 查询结果的状态的处理
    trsStateHandle(trsState) {
      // 充值状态:1_充值中,2_成功,3_失败,0_未知	integer(int32)
      if (trsState === 2) {
        this.trsState = 2;
        // this.activeColor = "#009700";
        this.activeIcon = 'checked';
      }
      if (trsState === 3) {
        this.trsState = 2;
        // this.activeColor = "#E41E26";
        this.activeIcon = 'clear';
      }
      // this.trsState = 1;
      // this.activeIcon = "checked";
    }
  }
};
</script>
<style lang="scss" scoped>
.with-drawal-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  .desc {
    width: 750px;
    height: 295px;
    background: #f0f4ff;
    display: flex;
    flex-direction: column;
    align-items: center;
    .title {
      font-size: 32px;
      font-weight: 500;
      color: #333333;
      margin: 58px 0 23px 0;
    }
    .num {
      font-size: 80px;
      font-weight: 600;
      color: #333333;
      margin-right: 18px;
    }
  }
  .status {
    width: 100%;
    padding: 75px 0 64px 95px;
  }
  .card {
    width: 675px;
    padding: 56px 31px;

    .row-1 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
      .title {
        font-size: 32px;

        font-weight: 400;
        color: #333333;
      }
      .name {
        font-size: 32px;

        font-weight: 400;
        color: #333333;
      }
    }
    .row-2 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .title {
        font-size: 32px;

        font-weight: 400;
        color: #333333;
      }
      .num {
        font-size: 32px;

        font-weight: 400;
        color: #333333;
      }
    }
  }
  .operate {
    margin: 70px 0 150px 0;
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
      font-weight: 400;
      color: #3552d0;
      margin-top: 42px;
      text-align: center;
    }
  }
  .fill {
    width: 675px;
    height: 0.5px;
    background-color: #d8d8d8;
  }
  /deep/.van-step__circle-container {
    .van-step__circle {
      width: 30px;
      height: 30px;
    }
    .van-step__icon--active {
      width: 62px;
      height: 52px;
    }
    .van-step__icon--active::before {
      font-size: 62px;
    }
  }
  /deep/.van-steps__items {
    height: 100%;
  }
  // 未激活,
  /deep/.van-step .van-step__title {
    div {
      font-size: 26px !important;
      font-weight: 400;
      margin-left: 30px;
    }
  }
  // 结束
  /deep/.van-step--finish {
    .van-step__title {
      margin-bottom: 54px;
      div {
        font-size: 26px !important;
        font-weight: 500;
        color: #333333;
        margin-left: 30px;
      }
    }
  }
  // 激活
  /deep/.van-step--process {
    .van-step__title--active {
      div {
        font-size: 33px !important;
        font-weight: 600;
        margin-bottom: 95px;
        margin-left: 30px;
      }
    }
  }
  /deep/.van-step--vertical:not(:last-child)::after {
    border-bottom-width: 0;
  }
  /deep/.van-step--finish .van-step__line {
    background-color: unset !important;
    border-left: 1px dashed #3552d0 !important;
    width: 1.5px;
  }
  /deep/.van-step--process .van-step__line {
    background-color: unset !important;
    border-left: 1px dashed rgb(187, 187, 187) !important;
    width: 1.5px;
  }
  /deep/.van-step:last-child .van-step__line {
    display: none;
  }
  /deep/.van-step__line {
    height: 93% !important;
  }
}
</style>
