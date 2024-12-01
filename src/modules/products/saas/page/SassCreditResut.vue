<template>
  <div class="loans-result-wrapper" v-if="isLoadOver">
    <div class="title-wrapper" slot="title">
      <img class="status-icon" :src="approveIconCode[approve]" alt />
      <p class="loans-result">{{approveStatus}}</p>
      <p class="desc">{{approveDesc}}</p>
    </div>
    <div class="sub-btn-wrapper">
      <Button class="sub-btn" type="primary" @click="goBackHome" v-if="approve=== 'PASS'">查看我的额度，去借款</Button>
      <Button class="sub-btn bg" @click="gotoPeronsal">完成</Button>
      <p class="tip">请勿取消关注，以防错过审核通知！</p>
    </div>
  </div>
</template>
<script>
import { queryApplyInfoIndexStatus } from '@/request/interface/impower/UserInfo.js';
import { APPROVE_CODE, APPROVE_ICON } from '@/utils/common/config';
import { qeurySassEcontractStatus } from '@/request/interface/impower/Sass.js';
export default {
  /**
   * 授信的申请结果
   *
   * */
  name: 'SassCreditResut',
  data() {
    return {
      approveCode: APPROVE_CODE,
      approveIconCode: APPROVE_ICON,
      approveStatus: '',
      approveDesc: '',
      approve: '',
      isWaitEacount: false,
      isLoadOver: false
    };
  },
  created() {
    this.setWechatTitle('申请结果');
  },
  mounted() {
    let isWaitEacount = this.getUrlParam('isWaitEacount');
    let sourceFrom = this.getUrlParam('src');
    if (sourceFrom) {
      this.getEcontractStatus();
    }
    if (!isWaitEacount) {
      queryApplyInfoIndexStatus()
        .then((res) => {
          let approveCode = res?.data?.data;
          this.approve = approveCode;
          this.approveStatus = this.approveCode[approveCode];
          this.jdugeApplyDesc();
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
  methods: {
    jdugeApplyDesc() {
      let approve = this.approve;
      if (approve === 'APPLYING') {
        this.approveDesc = '预计1天内完成审核';
      } else if (approve === 'FAIL') {
        this.approveDesc = '很抱歉，暂时无法为你提供借款服务';
      }
    },
    gotoBindBankCard() {
      this.$router.replace({ path: '/bind_bank_card' });
    },
    getEcontractStatus() {
      qeurySassEcontractStatus().then((res) => {
        let isSucc = res?.data?.data;
        if (!isSucc) {
          this.$notify.error({ msg: '合同签署失败！' });
          setTimeout(() => {
            this.$router.replace({ path: '/sing_sass_contract' });
          }, 2000);
        }
      });
    },
    goBackHome() {
      if (this.approve === 'PASS') {
        this.$router.replace({ path: '/' });
      } else {
        window.close();
      }
    },
    gotoPeronsal() {
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
    box-shadow: -2px 2px 5px 2px rgba(27, 111, 251, 0.26);
  }
  .bg-gary {
    color: #b0b0b0;
    box-shadow: -2px 2px 5px 2px rgba(153, 153, 153, 0.21);
    border-radius: 3px;
    border: 1px solid #b0b0b0;
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
