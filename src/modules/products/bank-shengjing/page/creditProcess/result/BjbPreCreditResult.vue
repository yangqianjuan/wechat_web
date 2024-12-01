<template>
  <div class="loans-result-wrapper beijing-common">
    <!-- 职业信息出错则不展示 -->
    <div class="product-wrapper" v-if="$route.query.applyInfo">
      <img class="product-logo" :src="applyInfo.productImage" alt="产品logo" />
      <p class="product-name">{{ applyInfo.productName }}</p>
    </div>

    <!-- 授信的状态 -->
    <div class="title-wrapper" slot="title">
      <img class="logo" :src="approveIconCode[applyInfo.applyStatus]" alt />
      <p class="loans-result">{{ approveCode[applyInfo.applyStatus] }}</p>
      <p class="desc">{{ approveStatus }}</p>
    </div>

    <!-- 申请通过的提示文本 -->
    <div class="warning-text" v-if="applyInfo.applyStatus === 'PASS'">{{ warnText }}</div>

    <!-- 职业信息出错的提示文本 -->
    <div
      class="warning-text job-fail"
      v-if="applyInfo.applyStatus === 'JOB_FAIL'"
    >尊敬的客户：您的职业信息校验不通过，请登录【广发银行-手机银行】完成修改！若已完成修改，请点击下方完成修改按钮，重新发起授信！</div>

    <!-- 不是职业信息出错 -->
    <van-button
      class="sub-btn foot-operate-btn"
      type="primary"
      v-if="applyInfo.applyStatus !== 'JOB_FAIL'"
      @click="goBackHome"
    >{{ applyInfo.applyStatus === 'PASS' ? '查看我的额度，去借款' : '关闭' }}</van-button>

    <!-- 授信的职业信息出错 -->
    <van-button
      class="sub-btn foot-operate-btn"
      type="primary"
      v-if="applyInfo.applyStatus === 'JOB_FAIL'"
      @click="applyCredit"
    >完成修改</van-button>
    <van-button
      class="sub-btn go-home foot-operate-btn"
      type="primary"
      v-if="applyInfo.applyStatus === 'JOB_FAIL'"
      @click="toHome"
    >返回</van-button>
    <div class="tip" v-if="applyInfo.applyStatus === 'JOB_FAIL'">请勿取消关注，以防错过审核通知！</div>
  </div>
</template>
<script>
import { APPROVE_CODE, APPROVE_ICON } from '@/utils/common/config';
import { WARN_TEXT_BYPROD } from '@/modules/products/xiao-meng-kd/page/loans/config.js';
import { queryApplyInfoIndexStatus } from '@/request/interface/impower/UserInfo.js';
import { gfCreditApply } from '@/request/interface/gf/common.js';
export default {
  /**
   * 授信的结果页
   * */
  data() {
    return {
      logo: require('@/assets/imgs/icon/ic_logo.png'),
      resIcon: require('@/assets/imgs/icon/ic_result.png'),
      succIcon: require('@/assets/imgs/icon/ic_cre_succ.png'),
      applyingIcon: require('@/assets/imgs/icon/ic_cre_ing.png'),
      failIcon: require('@/assets/imgs/icon/ic_cre_fail.png'),
      isFistCome: true,
      approveStatus: '预计1天内完成审核',
      applyInfo: {
        applyStatus: undefined
      },
      // 申请文本
      approveCode: APPROVE_CODE,
      // 图片的展示
      approveIconCode: APPROVE_ICON,
      // 提示文本
      warnText: '',
      JobFaiL: false,
      // 外部信息
      otherInfo: {}
    };
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.setWechatTitle('申请结果');
      if (this.$route.query.applyInfo) {
        // 用户正常从申请记录中进入的
        this.applyInfo = JSON.parse(this.$route.query.applyInfo);
        this.warnText = WARN_TEXT_BYPROD[this.applyInfo.productId || '9999'];
        this.jdugeApplyDesc();
      } else {
        // 用户通过外部链接，回调的形式进入的
        this.otherInfo = sessionStorage.getItem('credit_job_fail_info')
          ? JSON.parse(sessionStorage.getItem('credit_job_fail_info'))
          : {};
        this.getStatus();
      }
    },

    goBackHome() {
      if (this.applyInfo.applyStatus === 'PASS') {
        let isShowList = true;
        this.$router.replace({ path: '/', query: { isShowList } });
      } else {
        this.$router.back(-1);
      }
    },

    /**
     * 处理职业信息失败导致授信失败，的返回的操作
     * */
    toHome() {
      if (this.$route.query.applyInfo) {
        this.$router.back(-1);
      } else {
        this.$router.replace({ path: '/' });
      }
    },

    // 处理状态的展示
    jdugeApplyDesc() {
      let applyStatus = this.applyInfo.applyStatus;
      let approveDesc = this.approveCode[applyStatus];
      if (approveDesc === '审核中') {
        this.approveStatus = '预计1天内完成审核';
      } else if (approveDesc === '审核拒绝') {
        this.approveStatus = '很抱歉，暂时无法为你提供借款服务';
      } else if (approveDesc === '授信失败') {
        this.approveStatus = '';
      } else {
        this.approveStatus = '';
      }
    },

    // 获取授信状态
    getStatus() {
      if (this.otherInfo.applyUnionKey) {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        let params = {
          applyUnionKey: this.otherInfo.applyUnionKey
        };
        queryApplyInfoIndexStatus(params)
          .then((res) => {
            if (res?.data?.success) {
              let approveCode = res.data.data;
              this.applyInfo.applyStatus = approveCode;
              this.jdugeApplyDesc();
            } else {
              this.$notify.info({ msg: '暂无用户的申请状态！' });
            }
          })
          .catch((err) => {
            this.$notify.error({ msg: err?.data?.msg || '获取授信状态异常！' });
          })
          .finally(() => {
            this.$toasting.hide();
          });
      } else {
        this.$notify.info({ msg: '暂无用户的申请状态！' });
      }
    },

    // 发起授信的申请
    applyCredit() {
      let params = {
        userId: sessionStorage.getItem('userId'),
        applyUnionKey: this.otherInfo.applyUnionKey
      };
      if (params.userId && params.applyUnionKey) {
        this.$toasting.show({ message: '授信申请中', forbidClick: true });
        gfCreditApply(params)
          .then((res) => {
            if (res?.data?.success) {
              // 刷新页面
              this.init();
            } else {
              let msg = '授信申请异常！';
              this.$notify.error({
                msg: msg
              });
            }
          })
          .catch((err) => {
            this.$notify.error({
              msg: err?.data?.msg || '授信申请异常！'
            });
          })
          .finally(() => {
            this.$toasting.hide();
          });
      } else {
        this.$notify.error({
          msg: '授信申请失败！'
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.loans-result-wrapper {
  height: 100vh;
  overflow: hidden;
  background: #ffffff;
}
.product-wrapper {
  display: flex;
  align-items: center;
  margin-top: 40px;
  .product-logo {
    width: 60px;
    height: 60px;
    margin-left: 40px;
  }
  .product-name {
    font-size: 30px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
    margin-left: 20px;
  }
}
.sub-btn {
  position: fixed;
  width: 80%;
  margin-left: 10%;
  font-size: 26px;
  bottom: 140px;
  background: rgba(27, 111, 251, 1);
}
.title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 80px;
  background: #ffffff;
  .logo {
    height: 8rem;
  }
  .loans-result {
    font-size: 28px;
    margin-top: 40px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
  }
  .desc {
    font-size: 28px;
    margin-top: 20px;
    font-weight: 400;
    color: rgba(134, 134, 134, 1);
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
.tip {
  position: fixed;
  text-align: center;
  width: 100%;
  color: #1b6ffb;
  bottom: 60px;
}
.job-fail {
  font-size: 26px;
  text-indent: 2em;
  line-height: 1.5;
}
.go-home {
  bottom: 90px;
  background-color: #ffffff !important;
  /deep/span {
    color: #333 !important;
  }
}
</style>
