<template>
  <div class="repay-bill-detail">
    <div class="top-content">
      <div class="top-content-container">
        <div class="product-info">
          <div class="product-icon">
            <van-icon name="chat-o" color="#ee0a24" />
          </div>
          <div class="product-name">微盟SaaS贷</div>
          <div class="judge">
            <van-icon name="arrow" />
          </div>
        </div>
        <div class="summary">
          <div class="summary-date">
            <div class="title">借款时间：</div>
            <div class="desc">2021-10-07</div>
          </div>
          <div class="summary-amount">
            <div class="title">借款金额：</div>
            <div class="desc">¥250,000.00</div>
          </div>
        </div>
      </div>
    </div>
    <div class="middle-content">
      <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <van-cell v-for="item in list" :key="item">
          <div class="amount-show">¥2500.00</div>
          <div class="middle-fill"></div>
          <div class="date-show">还款日期：2020-10-25</div>
          <div class="suspension-show">
            <div class="circle-fill"></div>
            <div class="nper-text">第2/12期</div>
          </div>
        </van-cell>
      </van-list>
    </div>
    <div class="btm-content">
      <van-button round type="info">去还款</van-button>
    </div>
  </div>
</template>
<script>
export default {
  // 账单详情
  name: "BillDetail",
  data() {
    return {
      list: [],
      loading: false,
      finished: false
    };
  },
  methods: {
    onLoad() {
      // 异步更新数据
      // setTimeout 仅做示例，真实场景中一般为 ajax 请求
      setTimeout(() => {
        for (let i = 0; i < 10; i++) {
          this.list.push(this.list.length + 1);
        }

        // 加载状态结束
        this.loading = false;

        // 数据全部加载完成
        if (this.list.length >= 40) {
          this.finished = true;
        }
      }, 1000);
    }
  }
};
</script>
<style lang="scss" scoped>
.repay-bill-detail {
  width: 100%;
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  .top-content {
    height: 240px;
    width: 100%;
    background-color: #3552d0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .top-content-container {
      width: 686px;
      height: 80%;
      .product-info {
        width: 100%;
        height: 50%;
        display: flex;
        align-items: center;
        .product-icon {
          width: 20%;
          text-align: left;
          display: flex;
          align-items: center;
          .van-icon {
            font-size: 32px;
            font-weight: 600;
            color: #ffffff;
          }
        }
        .product-name {
          width: 40%;
          font-size: 32px;

          font-weight: 500;
          color: #ffffff;
        }
        .judge {
          width: 40%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 12px;
          .van-icon {
            font-size: 40px;
            font-weight: 600;
            color: #ffffff;
          }
        }
      }
      .summary {
        width: 100%;
        height: 50%;
        display: flex;
        align-items: center;
        .summary-date {
          width: 50%;
          display: flex;
          align-items: center;
          .title {
            font-size: 25px;

            font-weight: 500;
            color: #ffffff;
            line-height: 36px;
          }
          .desc {
            font-size: 31px;

            font-weight: bold;
            color: #ffffff;
            text-align: right;
            line-height: 40px;
          }
        }
        .summary-amount {
          width: 50%;
          display: flex;
          align-items: center;
          .title {
            font-size: 25px;

            font-weight: 500;
            color: #ffffff;
            line-height: 36px;
          }
          .desc {
            font-size: 31px;

            font-weight: bold;
            color: #ffffff;
            text-align: right;
            line-height: 40px;
          }
        }
      }
    }
  }
  .middle-content {
    margin-top: 32px;
    padding-bottom: 60px;
    flex: 1;
    overflow: auto;
    display: flex;
    justify-content: center;
    .van-cell {
      width: 686px;
      height: 195px;
      margin-top: 20px;
      background: #f3f3f3;
      border-radius: 14px;
      border: 4px solid #3552d0;
      display: flex;
      flex-direction: column;
      padding: 0 !important;
      position: relative;
      .amount-show {
        height: 65%;
        font-size: 58px;

        font-weight: bold;
        color: #333333;
        margin-left: 65px;
        display: flex;
        align-items: center;
      }
      .middle-fill {
        width: 100%;
        height: 1px;
        background-color: #d9d9d9;
      }
      .date-show {
        height: 34%;
        font-size: 25px;
        margin-left: 65px;

        font-weight: 500;
        color: #999999;
        display: flex;
        align-items: center;
      }
      .suspension-show {
        position: absolute;
        right: -2px;
        top: 34px;
        display: flex;
        align-items: center;
        width: 200px;
        height: 49px;
        background: #3552d0;
        border-radius: 98px 0px 0px 98px;
        .circle-fill {
          width: 10px;
          height: 10px;
          background: #ffffff;
          border-radius: 50%;
          margin: 0 20px;
        }
        .nper-text {
          font-size: 25px;

          font-weight: 600;
          color: #ffffff;
          letter-spacing: 2px;
        }
      }
    }
  }
  .btm-content {
    margin: 50px 0;
    width: 100%;
    display: flex;
    justify-content: center;
    .van-button {
      width: 532px;
      height: 100px;
      background: #3552d0;
      box-shadow: 0px 14px 23px -2px rgba(53, 82, 208, 0.45);
      border-radius: 50px;
      font-size: 34px;

      font-weight: 400;
      color: #ffffff;
      letter-spacing: 1px;
    }
  }
}
</style>
