<template>
  <div>
    <div class="elec-info-list" v-if="listShow">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-model="loading" :finished="finished" @load="onLoad">
          <div v-for="(item, index) in list" :key="item.bankCardNo + index" :title="item">
            <div class="option">
              <div class="option-1">
                <div class="name ellipsis">{{item.bankName + ' ( '}}{{ item.bankCardNo | bankShowAfterFour }}{{' )'}}</div>
                <div class="num ellipsis">{{ item.drawMoney }}</div>
              </div>
              <div class="option-2">
                <div class="date">{{ item.drawDate }}</div>
                <div class="status ellipsis" :class="[handleSatus(item.drawStatus)]">{{ item.drawStatusName }}</div>
              </div>
            </div>
            <div class="fill"></div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
    <div v-if="noData">
      <NoData></NoData>
    </div>
  </div>
</template>
<script>
import { listWithDrawCashInfo } from '@/request/interface/bank/repay.js';
import NoData from '@/common/components/common/showStatus/NoData.vue';
export default {
  // 提现明细
  name: 'WithDrawalDetailList',
  data() {
    return {
      list: [],
      //  加载数据的时候的loading
      loading: false,
      //  是否加载完成
      finished: false,
      //  下拉刷新时候开启
      refreshing: false,
      pageNum: 1,
      pageSize: 10,
      total: 0,
      noData: false,
      listShow: true
    };
  },
  components: {
    NoData
  },
  methods: {
    //  加载数据
    onLoad() {
      // 滚动条与底部距离小于 offset 时触发
      if (this.pageNum > 1) {
        this.pageNum += 1;
      } else if (this.pageNum === 1 && this.total !== 0) {
        this.pageNum = 2;
      }
      this.loading = true;
      if (this.list.length && this.list.length >= this.total) {
        // 所有的数据都加载完了，就是滑到底部，就不会触发下拉刷新了
        this.finished = true;
      } else {
        this.getListWithDrawCashInfo();
      }
    },

    // 下拉刷新
    onRefresh() {
      // 初始化
      this.list = [];
      this.pageNum = 1;
      this.finished = false;
      this.getListWithDrawCashInfo();
    },

    /**
     * 获取提现明细列表
     * */
    getListWithDrawCashInfo() {
      let productId = this.$route.query.pro_id;
      let params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        productId: productId
      };
      listWithDrawCashInfo(params)
        .then((res) => {
          if (res?.data?.data?.data && res.data.data.data.length) {
            this.list = [...this.list, ...res.data.data.data];
            this.total = res.data.data.total;
          }
          if (!this.list.length) {
            this.listShow = false;
            this.noData = true;
          }
        })
        .catch((err) => {
          this.finished = true;
        })
        .finally(() => {
          //   控制滑动到底部的时候的加载状态
          this.loading = false;
          //   控制下拉刷新的加载状态
          this.refreshing = false;
        });
    },

    // 处理提现的状态
    handleSatus(data) {
      // 提现状态:00_提现成功,01_提现失败,02_未明,03_提现中,04_提现申请失败
      if (data === '00') {
        return 'status-success';
      }
      if (data === '01') {
        return 'status-err';
      }
      if (data === '02') {
        return 'status-pending';
      }
      if (data === '03') {
        return 'status-pending';
      }
      if (data === '04') {
        return 'status-err';
      }

      return '';
    }
  }
};
</script>
<style lang="scss" scoped>
.elec-info-list {
  margin-bottom: 80px;
  min-height: 100vh;
  .van-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 500px;
  }
  .option {
    width: 675px;
    padding: 30px 8px;
    .option-1 {
      display: flex;
      align-items: center;
      margin-bottom: 28px;
      .name {
        flex: 1;
        font-size: 32px;
        font-weight: 500;
        color: #333333;
      }
      .num {
        font-size: 32px;
        font-weight: 500;
        color: #333333;
      }
    }
    .option-2 {
      display: flex;
      align-items: center;
      .date {
        flex: 1;
        white-space: nowrap;
        font-size: 32px;
        font-weight: 500;
        margin-right: 10px;
        color: #999999;
      }
    }
  }
  .fill {
    width: 675px;
    height: 1px;
    background-color: #d8d8d8;
  }
  .status-success {
    font-size: 32px;
    font-weight: 500;
    color: #009700;
  }
  .status-err {
    font-size: 32px;

    font-weight: 500;
    color: #e41e26;
  }
  .status-pending {
    font-size: 32px;

    font-weight: 500;
    color: #3552d0;
  }
  .van-pull-refresh {
    min-height: 100vh;
  }
}
</style>
