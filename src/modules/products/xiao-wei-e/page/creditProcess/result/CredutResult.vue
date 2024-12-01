<template>
  <div class="loans-result-wrapper" v-if="isLoadOver ">
    <div class="title-wrapper" slot="title">
      <img class="status-icon" :src="approveIconCode[approve]" alt />
      <p class="loans-result">{{approveStatus}}</p>
      <p class="desc">{{approveDesc}}</p>
      <!-- <div class="warning-text" v-if="approve=== 'PASS'">{{warnText}}</div> -->
    </div>
    <!-- 职业信息出错的提示文本 -->
    <div
      class="warning-text job-fail"
      v-if="approve === 'JOB_FAIL'"
    >尊敬的客户：您的职业信息校验不通过，请登录【广发银行-手机银行】完成修改！若已完成修改，请点击下方完成修改按钮，重新发起授信！</div>

    <div class="sub-btn-wrapper">
      <van-button class="sub-btn foot-operate-btn" type="primary" v-if="approve=== 'PASS'" @click="goBackHome">查看我的额度</van-button>
      <!-- 授信的职业信息出错 -->
      <van-button
        class="sub-btn foot-operate-btn"
        type="primary"
        v-if="approve === 'JOB_FAIL'"
        @click="applyCredit"
      >完成修改</van-button>

      <van-button class="sub-btn bg foot-operate-btn" @click="gotoPeronsal">完成</van-button>
      <p class="tip">请勿取消关注，以防错过审核通知！</p>
    </div>
  </div>
</template>
<script>
import { queryApplyInfoIndexStatus } from '@/request/interface/impower/UserInfo.js';
import { APPROVE_CODE, APPROVE_ICON } from '@/utils/common/config';
import { WARN_TEXT } from '@/modules/products/xiao-meng-kd/page/loans/config.js';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { gfCreditApply } from '@/request/interface/gf/common.js';
import { COOKIE_ID } from '@/utils/common/config';

export default {
  /**
   * 申请的结果
   * */
  name: 'XWECredutResult',
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
      warnText: WARN_TEXT,
      errorShow: false
    };
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.setWechatTitle('申请结果');
      this.$toasting.show({ message: '加载中', forbidClick: true });
      this.getPath();
    },
    async getPath() {
      // 校验是否完成了授信的整个流程
      let productId = localStorage.getItem('productId') || '1035';
      let nextPath = await queryNextByUnionKeyAndProdId(productId);
      this.$toasting.hide();
      nextPath !== '/xwe_credut_result'
        ? setTimeout(() => {
            this.$router.replace({ path: nextPath });
          }, 1500)
        : this.getStatus();
    },
    getStatus() {
      queryApplyInfoIndexStatus()
        .then((res) => {
          if (res?.data?.data) {
            let approveCode = res.data.data;
            this.approve = approveCode;
            this.approveStatus = this.approveCode[approveCode];
            this.jdugeApplyDesc();
          } else {
            this.$notify.error({ msg: '授信状态获取失败！' });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '授信状态获取失败！' });
          this.errorShow = true;
        })
        .finally(() => {
          this.$toasting.hide();
          this.isLoadOver = true;
        });
    },

    // 描述
    jdugeApplyDesc() {
      let approve = this.approve;
      if (approve === 'APPLYING') {
        this.approveDesc = '预计1天内完成审核';
      } else if (approve === 'FAIL') {
        this.approveDesc = '很抱歉，暂时无法为你提供借款服务';
      }
    },

    goBackHome() {
      if (this.approve === 'PASS') {
        this.$router.replace({ path: '/' });
      } else {
        window.close();
      }
    },

    // 去我的
    gotoPeronsal() {
      this.$router.replace({ path: '/psersonal' });
    },

    // 发起授信的申请
    applyCredit() {
      let params = {
        userId: sessionStorage.getItem('userId'),
        applyUnionKey: sessionStorage.getItem('applyUnionKey_1035') || this.getCookie(COOKIE_ID.applyUnionKey)
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
  margin-top: 50px;
  background: #ffffff;
  .status-icon {
    height: 8rem;
  }
  .loans-result {
    margin-top: 20px;
    font-size: 28px;
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
.job-fail {
  font-size: 26px;
  text-indent: 2em;
  line-height: 1.5;
}
</style>
