<template>
  <div class="myd-loans-result-wrapper" v-if="isLoadOver">
    <div class="title-wrapper" slot="title">
      <img class="status-icon" :src="approveIconCode[approve]" alt />
      <p class="loans-result">{{approveStatus}}</p>
      <p class="desc">{{approveDesc}}</p>
      <div class="warning-text" v-if="approve=== 'PASS'">{{warnText}}</div>
    </div>
    <div class="sub-btn-wrapper">
      <div class="common-submit-btn">
        <div class="submit-btn">
          <Button v-if="approve=== 'PASS'" @click="goBackHome">查看我的额度，去借款</Button>
          <Button v-else @click="gotoPersonal">完成</Button>
        </div>
      </div>
      <p v-if="approve !== 'PASS'" class="tip">请勿取消关注，以防错过审核通知！</p>
    </div>
  </div>
</template>
<script>
import { queryApplyInfoIndexStatus } from '@/request/interface/impower/UserInfo.js';
import { WARN_TEXT } from '@/modules/products/xiao-meng-kd/page/loans/config.js';
import { getUnionKey } from '@/request/interface/common';
import { infoRegHandler } from '@/modules/products/meng-yi-d/utils/common';

const APPROVE_ICON = {
  APPLYING: require('@/assets/imgs/myd/audit.png'),
  FAIL: require('@/assets/imgs/myd/reject.png'),
  PASS: require('@/assets/imgs/myd/audit_success.png'),
  // 授信职业信息失败
  JOB_FAIL: require('@/assets/imgs/myd/reject.png')
};
const APPROVE_CODE = {
  APPLYING: '审核中...',
  FAIL: '审核拒绝',
  PASS: '审核通过',
  // 授信职业信息失败
  JOB_FAIL: '授信失败'
};
export default {
  name: 'MYDCredutResult',
  data() {
    return {
      approveCode: APPROVE_CODE,
      approveIconCode: APPROVE_ICON,
      approveStatus: '',
      approveDesc: '',
      approve: '',
      isLoadOver: false,
      warnText: WARN_TEXT,
      creditPreInfo: {}
    };
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      this.setWechatTitle('申请结果');
      this.creditPreInfo = infoRegHandler(this.$route.query, this);
      try {
        const unionKey = await getUnionKey({
          referrer: this.creditPreInfo.referrer,
          productId: this.creditPreInfo.productId
        });
        const approveDesc = await queryApplyInfoIndexStatus({ applyUnionKey: unionKey?.data?.data });
        this.approve = approveDesc?.data?.data;
        this.approveStatus = this.approveCode[this.approve];
        this.judgeApplyDesc();
        this.isLoadOver = true;
      } catch (e) {
        this.$notify.error({ msg: e?.data?.msg || '授信结果查询失败！' });
      }
    },
    judgeApplyDesc() {
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
    gotoPersonal() {
      this.$router.replace({ path: '/psersonal' });
    }
  }
};
</script>
<style lang="scss" scoped>
@import '../../assets/css/common.scss';
.myd-loans-result-wrapper {
  height: 100%;
  .title-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 78px;
    .status-icon {
      height: 140px;
      width: 140px;
    }
    .loans-result {
      margin-top: 70px;
      font-size: 36px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: $font-color-4;
      line-height: 50px;
    }
    .desc {
      margin-top: 16px;
      font-size: 28px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: $font-color-7;
      line-height: 40px;
      text-align: center;
    }
  }
  .sub-btn-wrapper {
    margin-top: 120px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .tip {
      margin-top: 20px;
      text-align: center;
      font-size: 28px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      line-height: 40px;
      color: $font-color-1;
    }
  }
  .warning-text {
    margin-top: 16px;
    width: 630px;
    font-size: 28px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: $font-color-7;
    line-height: 40px;
  }
}
</style>
