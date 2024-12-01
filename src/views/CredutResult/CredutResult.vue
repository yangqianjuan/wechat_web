<template>
  <div class="loans-result-wrapper" v-if="isLoadOver">
    <div class="title-wrapper" slot="title">
      <img class="status-icon" :src="approveIconCode[approve]" alt />
      <p class="loans-result">{{approveStatus}}</p>
      <p class="desc">{{approveDesc}}</p>
      <div class="warning-text" v-if="approve=== 'PASS'">{{warnText}}</div>
    </div>
    <div class="sub-btn-wrapper">
      <van-button
        class="sub-btn foot-operate-btn"
        type="primary"
        v-if="approve=== 'PASS'"
        @click="goBackHome"
      >查看我的额度，去借款</van-button>
      <van-button
        class="sub-btn bg-blue foot-operate-btn"
        type="primary"
        v-if="isCanBind"
        @click="gotoBindBankCard"
      >继续绑定银行卡</van-button>
      <van-button class="sub-btn bg foot-operate-btn" @click="toPersonal">完成</van-button>
      <p class="tip">请勿取消关注，以防错过审核通知！</p>
    </div>
  </div>
</template>
<script>
import { queryApplyInfoIndexStatus } from '@/request/interface/impower/UserInfo.js';
import { APPROVE_CODE, APPROVE_ICON } from '@/utils/common/config';
import { jdugeIsCanBindBankCard } from '@/controller/userController.js';
import { WARN_TEXT } from '@/modules/products/xiao-meng-kd/page/loans/config.js';
export default {
  /**
   *  授信流程 - 申请的结果
   * */
  name: 'CreditResult',
  data() {
    return {
      approveCode: APPROVE_CODE,
      approveIconCode: APPROVE_ICON,
      approveStatus: '',
      approveDesc: '',
      approve: '',
      isWaitEacount: false,
      isLoadOver: false,
      isCanBind: false,
      warnText: WARN_TEXT
    };
  },
  created() {
    this.init();
  },
  mounted() {
    this.getApplyInfo();
  },
  methods: {
    init() {
      this.setWechatTitle('申请结果');
      jdugeIsCanBindBankCard().then((isCanBind) => {
        this.isCanBind = isCanBind;
      });
    },
    getApplyInfo() {
      let isWaitEacount = this.getUrlParam('isWaitEacount');
      if (!isWaitEacount) {
        queryApplyInfoIndexStatus()
          .then((res) => {
            if (res?.data?.data) {
              let approveCode = res.data.data;
              this.approve = approveCode;
              this.approveStatus = this.approveCode[approveCode];
              this.jdugeApplyDesc();
            }
          })
          .finally(() => {
            this.isLoadOver = true;
          });
      } else {
        this.isWaitEacount = true;
        this.isLoadOver = true;
        this.approveStatus = '电子账户开通中';
        this.approve = 'APPLYING';
      }
    },
    jdugeApplyDesc() {
      let approve = this.approve;
      approve === 'APPLYING'
        ? (this.approveDesc = '预计1天内完成审核')
        : (this.approveDesc = '很抱歉，暂时无法为你提供借款服务');
    },

    /**
     * 绑定银行卡
     * */
    gotoBindBankCard() {
      localStorage.productId === '1023'
        ? this.$router.replace({ path: '/bind_bank_card' })
        : this.$router.replace({ path: '/xm_bc_entry' });
    },
    goBackHome() {
      this.approve === 'PASS' ? this.$router.replace({ path: '/' }) : window.close();
    },
    toPersonal() {
      this.$router.replace({ path: '/psersonal' });
    }
  }
};
</script>
<style lang="scss" scoped>
.loans-result-wrapper {
  height: 100%;
  background: rgba(244, 246, 249, 1);
}
.sub-btn-wrapper {
  position: fixed;
  bottom: 50px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  .sub-btn {
    width: 80%;
    margin-left: 10%;
    margin-bottom: 18px;
  }
  .bg-blue {
    margin-bottom: 18px;
  }
  .bg {
    border: 1px solid #d8d8d8;
    /deep/.van-button__text {
      color: #333 !important;
      font-size: 28px;
    }
  }
  .tip {
    text-align: center;
    margin-top: 16px;
    color: #1b6ffb;
  }
}
.warning-text {
  padding: 0 5vw;
  font-size: 24px;
  font-weight: 400;
  color: #db2b13;
  margin-top: 0.9375rem;
  background: #ffffff;
}
.title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  background: #ffffff;
  .status-icon {
    height: 10rem;
  }
  .loans-result {
    margin-top: 20px;
    font-size: 26px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
  }
  .desc {
    font-size: 26px;
    margin-top: 14px;
    font-weight: 400;
    color: #0e80ed;
  }
}
</style>
