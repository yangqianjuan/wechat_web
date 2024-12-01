<template>
  <div class="myd-home">
    <div class="remind" v-if="isQuotaPause">您的额度被冻结，暂不支持提款</div>
    <div class="myd-home-content">
      <template v-if="creditInfo.creditInfoArr.length">
        <div class="credit-list">
          <v-credit-limit-card
            v-for="creditInfo in creditInfo.creditInfoArr"
            :cardConfig="creditInfo"
            :key="creditInfo.applyUnionKey"
            @getNowCredit="loanProcessor"
          ></v-credit-limit-card>
        </div>
      </template>
      <template v-if="!creditInfo.creditInfoArr.length">
        <div class="empty">
          <img class="empty-icon" :src="emptyIcon" alt />
          <p>您当前暂无额度</p>
          <div class="common-submit-btn">
            <div class="submit-btn">
              <Button @click="applyRecord">查看申请记录</Button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import CreditLimitCard from '../common/CreditLimitCard.vue';
import { infoRegHandler } from '@/modules/products/meng-yi-d/utils/common';
import { getSXPrepareMess, sxCheckAuditConfirm } from '@/request/interface/common/index';
import { sanXianPageRedirect } from '@/utils/common/global';

export default {
  name: 'MYDApplyRecord',
  props: {
    creditInfo: {
      type: Object,
      default: () => {
        return {};
      }
    },
    isQuotaPause: {
      type: Boolean,
      default: () => {
        return false;
      }
    }
  },
  data() {
    return {
      creditPreInfo: {},
      emptyIcon: require('@/assets/imgs/icon/ic_empty.png')
    };
  },
  created() {
    this.init();
  },

  components: {
    'v-credit-limit-card': CreditLimitCard
  },

  methods: {
    init() {
      this.creditPreInfo = infoRegHandler();
    },
    /**
     * 借款
     */
    async loanProcessor(creditInfo) {
      if (creditInfo.isQuotaPause) {
        this.$notify.info({
          msg: '您的额度已冻结，暂不支持提款！'
        });
        return;
      }
      if (creditInfo.avaliableCredit <= 0) {
        this.$notify.info({
          msg: '可用额度为0，暂时不可以借款！'
        });
        return;
      }
      if (creditInfo.applyUnionKey) {
        const checkResult = await sxCheckAuditConfirm({ applyUnionKey: creditInfo.applyUnionKey });
        if (checkResult?.data?.success) {
          const sxPreInfo = (await getSXPrepareMess({ applyUnionKey: creditInfo.applyUnionKey }))?.data?.data;
          sxPreInfo && this.mydJump(sxPreInfo);
        } else {
          this.$notify.info({
            msg: checkResult?.data?.data || '没有进行额度确认，或者额度确认拒绝！'
          });
        }
      }
    },

    mydJump(option) {
      const url = sanXianPageRedirect({
        openId: option.openId,
        outSeqNum: option.outSeqNum,
        token: option.token
      });
      this.$toasting.show({ message: '跳转中', forbidClick: true });
      url ? (window.location.href = url) : this.$toasting.hide();
    },

    /**
     * 申请记录
     * */
    applyRecord() {
      this.$router.push({ path: '/myd_apply_record', query: { ...this.creditPreInfo } });
    }
  }
};
</script>
<style lang="scss" scoped>
@import '../../assets/css/common.scss';
.myd-home {
  min-height: 100vh;
  background: $bg-color-2;

  .myd-home-content {
    display: flex;
    justify-content: center;
    width: 100%;
    .credit-list {
      width: 690px;
    }
    .empty {
      position: absolute;
      top: -70px;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      p {
        font-size: 34px;
        margin-top: 18px;
        font-weight: 600;
      }

      .empty-icon {
        width: 350px;
        height: 350px;
      }
    }

    .record-btn {
      margin-top: 42px;
      width: 33%;
      padding: 4px 0;
      height: unset;

      /deep/ .van-button__content {
        background: $btn-bg-color;
        padding: 12px 0;
      }
    }
  }
}
</style>
