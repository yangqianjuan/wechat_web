import { sanXianPageRedirect } from '@/utils/common/global';
import { infoGet } from '@/utils/common/common';
import { getUnionKey } from '@/request/interface/common';
import { getUserBaseeinfoStatus } from '@/request/interface/impower/UserInfo.js';
import { getSXPrepareMess } from '@/request/interface/common/index';
import MYDApplyResult from '@/modules/products/meng-yi-d/page/home/MYDApplyResult.vue';
import productConfig from '@/config/product/product';
import { sanXianInfoRegister } from '@/views/login/common/index';
export default {
  // 三湘
  components: {
    MYDApplyResult
  },
  methods: {
    /**
     * 处理三湘用户
     *  暂时不考虑多个产品
     * */
    async mydHandler(creditInfo) {
      const mydData = infoGet(productConfig.productId['myd']) || null;
      this.sanXianInfoHandler();
      this.userCreditSummary = creditInfo;
      if (creditInfo.creditInfoArr.length) {
        if (creditInfo.creditInfoArr.length === 1) {
          if (String(creditInfo.creditInfoArr[0]?.agreeProduct) === productConfig.productId['myd']) {
            this.isMYDProduct = true;
          } else if (mydData?.referrer) {
            this.mydApplyHandler();
          } else {
            this.isOverLoading = true;
          }
        } else {
          if (mydData?.referrer) {
            this.mydApplyHandler();
          } else {
            this.isOverLoading = true;
          }
        }
      } else {
        this.mydApplyHandler();
      }
    },

    /**
     * currentProductType: 1_小萌快贷,2_小微E秒贷款,3_三湘,4_其他
     * sxCustomerInfoSyncStatus: Y 有三湘的进件记录 N 没有三湘的进件记录
     * */
    async mydApplyHandler() {
      const mydData = infoGet(productConfig.productId['myd']) || null;
      if (!mydData?.referrer) {
        this.isOverLoading = true;
        return;
      }
      try {
        const unionKeyRes = (
          await getUnionKey({
            referrer: mydData.referrer,
            productId: mydData.productId || productConfig.productId['myd']
          })
        )?.data?.data;
        const stepStatus = (await getUserBaseeinfoStatus({ applyUnionKey: unionKeyRes }))?.data?.data;
        stepStatus.currentProductType === '3'
          ? this.creditProductHandler(stepStatus, unionKeyRes)
          : this.creditProductHandler();
      } catch (e) {
        this.$notify.error({ msg: e?.data?.msg });
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

    async creditProductHandler(option, applyUnionKey) {
      const mydData = infoGet(productConfig.productId['myd']) || null;
      try {
        if (option?.sxCustomerInfoSyncStatus === 'N') {
          this.$router.replace({
            path: 'prod_myd',
            query: { referrer: mydData.referrer, productId: productConfig.productId['myd'] }
          });
          // const sxPreInfo = (await getSXPrepareMess({ applyUnionKey }))?.data?.data;
          // sxPreInfo && this.mydJump(sxPreInfo);
        } else if (option?.sxCustomerInfoSyncStatus === 'Y') {
          this.isMYDProduct = true;
          this.isOverLoading = true;
        }
        !option && !applyUnionKey && (this.isOverLoading = true);
      } catch (e) {
        this.$notify.error({ msg: e?.data?.msg });
      }
    },

    sanXianInfoHandler() {
      let href = (href = decodeURIComponent(window.location.href));
      if (href?.indexOf('entryType=0002?') !== -1) {
        const params = href
          .split('#')[1]
          .split('/')[1]
          .split('?')[2];
        localStorage.pathRedirect = params + `&entryType=0002`;
        localStorage.pathRedirect && sanXianInfoRegister();
        localStorage.pathRedirect = '';
      }
    }
  }
};
