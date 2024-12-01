<template>
  <div class="loans-result-wrapper" v-if="isShow">
    <div class="title-wrapper" slot="title">
      <img class="status-icon" :src="openResultIcon[openSstatusCode]" alt />
      <p class="loans-result" v-if="openSstatusCode === '01'">开户中，请等待一段时间后，再刷新页面，获取其开户结果...</p>
      <p class="loans-result" v-else>{{openResultText}}</p>
    </div>
    <div class="sub-btn-wrapper">
      <van-button
        class="sub-btn bg-blue foot-operate-btn"
        :disabled="refreshBtnDis"
        v-if="openSstatusCode === '01'"
        @click="refresh"
      >{{ refreshBtnDis? time + 's': "刷新" }}</van-button>
      <van-button class="sub-btn bg-blue foot-operate-btn" v-if="openSstatusCode === '00'" @click="goBorrow">去借款</van-button>
      <van-button class="sub-btn foot-operate-btn open-btn" v-if="openSstatusCode === '02'" @click="goOpen">重新开户</van-button>
      <van-button class="sub-btn foot-operate-btn close-btn" @click="goBack">关闭</van-button>
    </div>
  </div>
</template>
<script>
import { gfDealOpenAccount } from '@/request/interface/gf/common.js';
import { getGfSessionId } from '@/controller/common.js';
const OPEN_RESULT_ICON = {
  '01': require('@/assets/imgs/icon/ic_cre_ing.png'),
  '02': require('@/assets/imgs/icon/ic_cre_fail.png'),
  '00': require('@/assets/imgs/icon/ic_cre_succ.png')
};

export default {
  /**
   * 开户的结果
   *    新开户 / 二类户 / 一类卡  ----- 》 开户的结果页
   * */
  data() {
    return {
      openResultIcon: OPEN_RESULT_ICON,
      openResultText: '',
      openSstatusCode: '',
      gfOpenAccountStatus: {},
      applyUnionKey: '',
      refreshBtnDis: true,
      time: 10,
      isShow: false
    };
  },
  created() {
    this.getGfDealOpenAccount();
    // if (this.$route.query.productId) {
    //   this.getGfDealOpenAccount();
    // } else {
    //   this.$notify.info({ msg: "暂无该用户的开户状态！" });
    // }
  },

  methods: {
    // 查询广发银行的开户状态、
    getGfDealOpenAccount() {
      if (!this.applyUnionKey) {
        this.applyUnionKey = sessionStorage.getItem('applyUnionKey_1035') || sessionStorage.getItem('union_key');
      }
      let params = { applyUnionKey: this.applyUnionKey };
      this.$toasting.show({ message: '加载中', forbidClick: true });
      this.refreshBtnDis = true;
      gfDealOpenAccount(params)
        .then((res) => {
          if (res?.data?.data) {
            this.isShow = true;
            this.gfOpenAccountStatus = res.data.data;
            this.modifyOpenSatus(res.data.data.code);
          } else {
            this.$notify.info({ msg: '未获取到开户状态信息！' });
          }
        })
        .catch((err) => {
          this.$toasting.error({ msg: err?.data?.msg || '加载失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },
    goBack() {
      this.$router.replace({ path: '/' });
    },

    refresh() {
      this.getGfDealOpenAccount();
    },

    modifyOpenSatus(code) {
      if (code === '1001') {
        //   需要重新开户
        this.openSstatusCode = '02';
        this.openResultText = `开户失败，是否重新开户`;
      }

      if (code === '1002') {
        //   存在使用的电子账户，确定信息之后，电子开户
        this.$toasting.show({ message: '跳转中', forbidClick: true });
        setTimeout(() => {
          this.$toasting.hide();
          this.$router.replace({
            path: '/xwe_bank_info',
            query: {
              productId: this.$route.query.productId || '1035',
              applyUnionKey: this.applyUnionKey
            }
          });
        }, 1500);
      }

      if (code === '1003') {
        // 开户成功， 可以发起借款
        this.openSstatusCode = '00';
        this.openResultText = `开户成功，可以进行借款`;
      }

      if (code === '1004') {
        //   存在本行卡，跳到本行卡确认页进行确认，开通
        this.$toasting.show({ message: '跳转中', forbidClick: true });
        setTimeout(() => {
          this.$toasting.hide();
          this.$router.replace({
            path: '/xwe_bank_info',
            query: {
              productId: this.$route.query.productId || '1035',
              applyUnionKey: this.applyUnionKey
            }
          });
        }, 1500);
      }

      if (code === '1005') {
        //   等待中，开户中
        this.openSstatusCode = '01';
        this.timer();
      }

      if (code === '1006') {
        //   需要重新开户
        this.openSstatusCode = '02';
        this.openResultText = `开户失败，是否重新开户`;
      }
    },

    // 去开户
    goOpen() {
      // 开户的都是电子账户
      getGfSessionId({ applyUnionKey: this.applyUnionKey, type: 4 })
        .then(() => {
          this.$router.replace({
            path: '/xwe_open_account_face'
          });
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '会话失败' });
        });
    },

    // 去借款
    goBorrow() {
      this.$router.replace({
        path: '/xwe_loans_base_info',
        query: {
          productId: this.$route.query.productId || '1035',
          applyUnionKey: this.applyUnionKey
        }
      });
    },

    btnStatus() {
      this.refreshBtnDis = false;
    },

    timer() {
      let time = 10;
      setInterval(() => {
        if (time) {
          time -= 1;
          this.time = time;
        } else {
          this.btnStatus();
          this.time = 10;
        }
      }, 1000);
    }
  }
};
</script>
<style lang="scss" scoped>
.loans-result-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  background: rgba(244, 246, 249, 1);
}
.sub-btn-wrapper {
  position: fixed;
  bottom: 58px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  .sub-btn {
    width: 80%;
    margin-left: 10%;
  }
  .bg-blue {
    background: #1b6ffb;
    color: #ffffff;
    // box-shadow: -2px 2px 5px 2px rgba(27, 111, 251, 0.26);
  }
  .bg-gary {
    color: #b0b0b0;
    // box-shadow: -2px 2px 5px 2px rgba(153, 153, 153, 0.21);
    border-radius: 3px;
    border: 1px solid #b0b0b0;
  }
  .tip {
    text-align: center;
    margin-top: 10px;
    color: #1b6ffb;
  }
}
.warning-text {
  padding: 0 5vw;
  font-weight: 400;
  color: #db2b13;
  margin-top: 0.9375rem;
  background: #ffffff;
}
.title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  justify-content: center;
  background: #ffffff;
  .status-icon {
    height: 25vh;
    margin-top: 60px;
  }
  .loans-result {
    margin-top: 30px;
    font-weight: 600;
    width: 500px;
    font-size: 30px;
    text-align: center;
    color: rgba(51, 51, 51, 1);
  }
  .desc {
    margin-top: 12px;
    font-size: 26px;
    font-weight: 400;
    color: #0e80ed;
  }
}
.close-btn {
  margin-top: 20px;
  border: 1px solid #d8d8d8;
  span {
    color: #333 !important;
  }
}
.open-btn {
  background-color: #0e80ed;
  span {
    color: #ffffff;
  }
}
/deep/.refresh-btn {
  width: 200px;
  padding: 20px 0;
  height: unset;
  margin-top: 30px;
  .van-button__text {
    font-size: 26px;
    font-weight: 500;
  }
}
</style>
