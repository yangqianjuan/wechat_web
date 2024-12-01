<template>
  <div>
    <div class="with-drawal-detail" v-if="detailInfo.cardNo">
      <div class="desc">
        <div class="title">提现到{{detailInfo.bankName + ' ( '}}{{ detailInfo.cardNo | bankShowAfterFour }}{{' )'}}</div>
        <div class="num">{{ detailInfo.drawMoney }}</div>
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
            <div class="date">{{ detailInfo.drawMoneyDate }}</div>
          </van-step>
          <van-step>
            <div class="pending">{{ '银行处理中'}}</div>
          </van-step>
          <van-step>
            <div class="result">{{ resultShow() ? resultShow(): detailInfo.trsDesc }}</div>
          </van-step>
        </van-steps>
      </div>
      <div class="fill"></div>
      <div class="card">
        <div class="row-1">
          <div class="title">收款银行</div>
          <div class="name">{{ detailInfo.bankName }}</div>
        </div>
        <div class="row-2">
          <div class="title">收款账号</div>
          <div class="num">{{ detailInfo.cardNo | formatBankNo }}</div>
        </div>
      </div>
      <div class="operate">
        <van-button class="foot-operate-btn" @click.stop="judge">完成</van-button>
      </div>
    </div>
    <div v-if="noData">
      <NoData></NoData>
    </div>
  </div>
</template>
<script>
import { drawMoneyResult } from '@/request/interface/bank/repay.js';
import NoData from '@/common/components/common/showStatus/NoData.vue';
export default {
  // 提现详情
  name: 'WithDrawalDetail',
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
    if (this.$route.query.drawNo) {
      this.drawNo = this.$route.query.drawNo;
      this.getDetailInfo();
    } else {
      this.$notify.info({
        msg: '暂无提现详情！'
      });
    }
  },
  components: {
    NoData
  },
  methods: {
    // "bankName": "",
    // "cardNo": "",
    // "drawMoney": 0,
    // "drawMoneyDate": "",
    // "trsDesc": "",
    // "trsState": ""
    // 获取提现详情
    getDetailInfo() {
      this.$toasting.show({ message: '加载中...', forbidClick: true });
      drawMoneyResult({ drawNo: this.drawNo })
        .then((res) => {
          if (res?.data?.data) {
            this.trsStateHandle(res.data.data.trsState);
            this.detailInfo = res.data.data;
          } else {
            this.noData = true;
          }
        })
        .catch((err) => {
          this.$notify.error({
            msg: err.data.msg
          });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },
    judge() {
      this.$router.replace('/xmkd_repay_elec_detail_list');
    },
    handleShow(type, data) {
      if (type === 'bankCardNo' && typeof data === 'string' && data.length && data.length > 4) {
        return data.substring(data.length - 4);
      }
    },
    twoLevel() {
      if (this.detailInfo.trsState === '02') {
        return this.detailInfo.trsDesc;
      }
      if (this.detailInfo.trsState === '03') {
        return this.detailInfo.trsDesc;
      }
      return undefined;
    },
    resultShow() {
      if (this.detailInfo.trsState === '02') {
        return '申请成功';
      }
      if (this.detailInfo.trsState === '03') {
        return '申请成功';
      }
      if (this.detailInfo.trsState === null) {
        return '申请成功';
      }
      return undefined;
    },
    // 查询结果的状态的处理
    trsStateHandle(trsState) {
      // 提现结果状态:00_提现成功,01_提现失败,02_未明,03_提现中,04_提现申请失败,已重新发提现申请
      if (trsState === '00') {
        this.trsState = 2;
        this.activeIcon = 'checked';
      }
      if (trsState === '01') {
        this.trsState = 2;
        this.activeIcon = 'clear';
      }
      if (trsState === '02') {
        this.trsState = 1;
        this.activeIcon = 'underway';
      }
      if (trsState === '03') {
        this.trsState = 1;
        this.activeIcon = 'underway';
      }
      if (trsState === '04') {
        this.trsState = 2;
        this.activeIcon = 'clear';
      }
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
    .title {
      // font-size: 32px !important;
      //
      // font-weight: 400;
      margin-bottom: 12px;
      // margin-left: 37px;
    }
    .date {
      // font-size: 26px;
      //
      // font-weight: 500;
      // color: #6b6b6b;
      // margin-bottom: 64px;
      // margin-left: 37px;
    }
    .pending {
      // font-size: 29px;
      //
      // font-weight: 600;
      // color: #000000;
      margin-bottom: 95px;
      // margin-left: 37px;
    }
    .result {
      // font-size: 29px;
      //
      // font-weight: 400;
      // color: #979797;
      // margin-left: 37px;
      min-height: 15px;
    }
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
