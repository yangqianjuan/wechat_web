<!--
 * @Author: yanpeng
 * @Date: 2023-07-26 14:05:08
 * @LastEditors: hsf
 * @LastEditTime: 2023-11-29 17:18:17
 * @Description: 产品进件状态查询
-->
<template>
  <div class="search-detail">
    <div class="head">
      <div class="top">
        <img src="../../static/image/company-logo.png" class="money" />
        <div class="text">萌e贷</div>
      </div>
      <div class="company">{{ productItem.corpName }}</div>
      <div class="text mt16">{{ productItem.userName }}</div>
      <div class="search-content">
        <div v-for="(item, index) in list" :key="item.id" class="detail-item">
          <div class="item-top">
            <div class="line"></div>
            <div class="title">进件详情 {{ index + 1 }}</div>
          </div>
          <div class="list">
            <div class="list-item">
              <div class="label">申请时间：</div>
              <div class="value">{{ item.applyTime }}</div>
            </div>
            <div class="list-item">
              <div class="label">授信状态：</div>
              <div class="value" :style="`color: ${getColor(item.applyStatus)}`">
                {{ changeStatus(item.applyStatus) }}
              </div>
            </div>
            <div class="list-item" v-if="item.applyStatus == '11'">
              <div class="label">授信金额：</div>
              <div class="value">{{ item.creditAmount }}</div>
            </div>
            <div class="list-item" v-if="item.applyStatus == '11'">
              <div class="label">放款状态：</div>
              <div class="value" style="color: #4e6efc">{{ getLoan(item.loanStatus) }}</div>
            </div>
          </div>
          <div class="step" v-if="item.show">
            <div v-for="(i, j) in item.nodes" :key="j" class="step-item">
              <div class="left-line">
                <div class="circle"></div>
                <div class="line" v-if="j !== item.nodes.length - 1"></div>
              </div>
              <div>
                <div class="title-group">
                  <div class="title">{{ i.nodeName }}</div>
                </div>
                <div class="time">{{ i.nodeTime }}</div>
              </div>
            </div>
          </div>
          <div class="refuse" v-if="item.refuseReason">
            <div class="refuse-title mr32">拒绝原因</div>
            <div class="refuse-title flex1">{{ item.refuseReason }}</div>
          </div>
          <div class="openBtn" @click="item.show = !item.show">
            <div class="text" v-if="item.show">收起详情</div>
            <div class="text" v-else>展开详情</div>
            <img v-if="item.show" class="icon" src="../../static/image/searchProduct/up.png" />
            <img v-else class="icon" src="../../static/image/searchProduct/down.png" />
          </div>
        </div>
      </div>
      <div style="height: 30px"></div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      productItem: {},
      list: []
    };
  },
  computed: {
    changeStatus() {
      return function(val) {
        switch (val) {
          case '10':
            return '申请中';
          case '11':
            return '授信通过';
          case '12':
            return '授信拒绝';
          case '23':
            return '进件作废';
        }
      };
    },
    getColor() {
      return function(val) {
        switch (val) {
          case '10':
            return '#4E6EFC';
          case '11':
            return '#4E6EFC';
          case '12':
            return '#FA0E00';
          case '23':
            return '#FA0E00';
        }
      };
    },
    getLoan() {
      return function(val) {
        switch (val) {
          case '0':
            return '未放款';
          case '1':
            return '已放款';
          case '2':
            return '未知';
        }
      };
    }
  },
  created() {
    const query = this.$route.query;
    if (query) {
      const obj = JSON.parse(decodeURIComponent(query.productItem));
      obj.details.forEach(element => {
        this.$set(element, 'show', false);
      });
      this.productItem = obj;
      this.list = obj.details;
    }
  }
};
</script>

<style lang="scss" scoped>
.search-detail {
  min-height: 100vh;
  background-color: #f8f9fa;
  .head {
    background-image: url('../../static/image/searchProduct/detailBg.png');
    background-repeat: no-repeat;
    background-size: cover;
    height: 398px;
    .top {
      display: flex;
      align-items: center;
      padding-top: 32px;
      padding-left: 32px;
    }
    .text {
      font-size: 28px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #ffffff;
    }
    .money {
      width: 56px;
      height: 46px;
      margin-right: 6px;
      border-radius: 10px;
    }

    .company {
      font-size: 36px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #ffffff;
      text-align: center;
      margin-top: 32px;
    }
    .mt16 {
      margin-top: 16px;
      text-align: center;
    }
    .mt4 {
      text-align: center;
      margin-top: 4px;
    }

    .search-content {
      margin-top: 48px;

      .detail-item {
        margin: 0 auto;
        width: 686px;
        background: #ffffff;
        border-radius: 20px 20px 0px 0px;
        margin-bottom: 24px;
        padding: 40px 32px;
        box-sizing: border-box;
        .item-top {
          display: flex;
          align-items: center;
          .line {
            width: 6px;
            height: 24px;
            background: #425cfe;
            border-radius: 3px;
            margin-right: 24px;
          }
          .title {
            font-size: 28px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #333333;
          }
        }
        .list {
          width: 100%;
          margin-top: 24px;
          padding: 32px;
          background: #f7faff;
          border-radius: 12px;
          box-sizing: border-box;
          .list-item {
            display: flex;
            margin-bottom: 16px;
            .label {
              font-size: 28px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #8d95a1;
              margin-right: 32px;
            }
            .value {
              font-size: 28px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #141245;
            }
          }
        }
        .openBtn {
          margin-top: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          .icon {
            width: 20px;
            height: 20px;
            margin-left: 8px;
          }
          .text {
            font-size: 24px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #2750f1;
          }
        }
        .refuse {
          box-sizing: border-box;
          margin-top: 16px;
          width: 622px;
          background: #fff1f0;
          border-radius: 12px;
          padding: 32px;
          display: flex;
          .refuse-title {
            font-size: 28px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #fa0e00;
          }
          .flex1 {
            flex: 1;
          }
          .mr32 {
            margin-right: 32px;
            width: 112px;
          }
        }
      }
    }
  }

  .step {
    margin-top: 24px;
    .step-item {
      display: flex;
      .left-line {
        margin-right: 15px;
        margin-bottom: 10px;
        .circle {
          width: 20px;
          height: 20px;
          background: #ffffff;
          border: 2px solid #2750f1;
          border-radius: 50%;
          box-sizing: border-box;
        }
        .line {
          width: 4px;
          height: 80px;
          background: #ecf2ff;
          border-radius: 2px;
          margin-top: 12px;
          margin-left: 7px;
        }
      }
      .title-group {
        display: flex;
        .title {
          font-size: 28px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #333333;
        }
        .des {
          font-size: 24px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #333333;
          margin-left: 12px;
        }
      }
      .time {
        font-size: 24px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #969696;
        margin-top: 8px;
      }
    }
  }
}
</style>
