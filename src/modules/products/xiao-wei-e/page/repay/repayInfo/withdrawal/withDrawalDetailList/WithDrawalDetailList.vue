<template>
  <div>
    <div class="elec-info-list" v-if="listShow">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list :finished="finished" @load="onLoad">
          <div v-for="(item, index) in list" :key="item.payeeAccountName + index" :title="item">
            <div class="option">
              <div class="option-1">
                <div
                  class="name ellipsis"
                >{{item.payeeAccountName + ' ( '}}{{ item.payeeAccountNo | bankShowAfterFour }}{{' )'}}</div>
                <div class="num ellipsis">{{ item.withdrawAmt?(item.withdrawAmt + '元'):'' }}</div>
              </div>
              <div class="option-2">
                <div class="date">{{ item.createTime }}</div>
                <div class="status ellipsis" :class="[handleSatus(item.withdrawStatus)]">{{ item.withdrawStatusStr }}</div>
              </div>
            </div>
            <!-- <div class="fill"></div> -->
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
    <div v-if="noData">
      <van-empty description="暂无数据" />
    </div>
  </div>
</template>
<script>
import { gfWithDrawList } from '@/request/interface/gf/common.js';
import { getUnionKey } from '@/request/interface/common/index';
export default {
  /**
   * 提现明细
   *
   */
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
      listShow: true,
      applyUnionKey: ''
    };
  },
  // createTime	提现申请时间	string(date-time)
  // finWithdrawId	普惠提现id	string
  // payeeAccountName	收款账户户名	string
  // payeeAccountNo	收款账户编号	string
  // payerAccountName	付款账户户名	string
  // payerAccountNo	付款账户编号	string
  // withdrawApplyId	提现单号	string
  // withdrawMoney	提现金额	number
  // withdrawStatus	提现状态:1_提现中,2_成功,3_失败,0_未知	integer(int32)
  // withdrawStatusStr	提现状态描述	string
  created() {
    this.init();
  },

  methods: {
    //  加载数据
    onLoad() {
      // 滚动条与底部距离小于 offset 时触发
      if (this.pageNum > 1) {
        this.pageNum += 1;
      }
      this.loading = true;
      if (this.list.length && this.list.length >= this.total) {
        // 所有的数据都加载完了，就是滑到底部，就不会触发下拉刷新了
        this.finished = true;
      } else {
        this.getGFWithDrawList();
      }
    },

    // 下拉刷新
    onRefresh() {
      // 初始化
      this.list = [];
      this.pageNum = 1;
      this.finished = false;
      this.getGFWithDrawList();
    },

    init() {
      if (!sessionStorage.getItem('repayApplyUnionKey')) {
        this.getApplyUnionKey();
      } else {
        this.applyUnionKey = sessionStorage.getItem('repayApplyUnionKey');
      }
    },

    getApplyUnionKey() {
      let payload = {};
      payload.referrer = this.$store.state.referrer;
      payload.productId = this.$store.state.productId;
      getUnionKey(payload)
        .then((res) => {
          if (res?.data?.data) {
            this.applyUnionKey = res.data.data;
            sessionStorage.setItem('repayApplyUnionKey', res.data.data);
          }
        })
        .catch((err) => {
          this.$notify.error({
            msg: err?.data?.msg || '获取用户的操作标识失败！'
          });
        })
        .finally(() => {});
    },

    /**
     * 获取提现明细列表
     * */
    getGFWithDrawList() {
      let params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        applyUnionKey: this.applyUnionKey
      };
      gfWithDrawList(params)
        .then((res) => {
          if (res?.data?.success) {
            if (res?.data?.data?.data?.length) {
              this.list = [...this.list, ...res.data.data.data];
              this.total = res.data.data.total;
            }
            if (!this.list.length) {
              this.listShow = false;
              this.noData = true;
            }
          } else {
            this.$notify.error({
              msg: res?.data?.msg || '明细获取失败！'
            });
          }
        })
        .catch((err) => {
          this.finished = true;
          this.$notify.error({
            msg: err?.data?.msg || '明细获取失败！'
          });
        })
        .finally(() => {
          //   控制滑动到底部的时候的加载状态
          this.loading = false;
          //   控制下拉刷新的加载状态
          this.refreshing = false;
          // this.$loading.hide();
        });
    },

    // 处理提现的状态
    handleSatus(data) {
      // 充值状态:1_充值中,2_成功,3_失败,0_未知	integer(int32)\
      if (data === 0) {
        return 'status-pending';
      }
      if (data === 1) {
        return 'status-pending';
      }
      if (data === 2) {
        return 'status-success';
      }
      if (data === 3) {
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
    width: 700px;
    padding: 16px 25px;
    margin-top: 16px;
    background: #f4f6f9;
    -moz-box-shadow: 0 0 10px #f4f6f9;
    -webkit-box-shadow: 0 0 10px #f4f6f9;
    box-shadow: 0 0 10px #f4f6f9;
    border-radius: 4px;
    .option-1 {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      .name {
        flex: 1;
        font-size: 30px;
        font-weight: 400;
        color: #333333;
      }
      .num {
        font-size: 30px;
        font-weight: 400;
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
    font-size: 30px;
    font-weight: 400;
    color: #009700;
  }
  .status-err {
    font-size: 30px;
    font-weight: 400;
    color: #e41e26;
  }
  .status-pending {
    font-size: 30px;
    font-weight: 400;
    color: #3552d0;
  }
  .van-pull-refresh {
    min-height: 100vh;
  }
}
</style>
