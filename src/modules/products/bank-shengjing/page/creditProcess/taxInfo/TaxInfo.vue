<template>
  <div class="beijing-common" v-if="isPageOverLoad">
    <div v-if="taxCollect.normalFlag">
      <div v-if="taxCollect.pageType">
        <div v-if="isPageOverLoad" class="from-container">
          <template v-if="isAutoGetLink">
            <TaxWeb :referrer="referrer"></TaxWeb>
          </template>

          <template v-if="verifyTaxLinkPass && !isAutoGetLink">
            <div class="top-content">
              <div class="steps">
                <Steps :steps="[0, 1]"></Steps>
              </div>
            </div>
            <div class="middle-content">
              <div class="middle-desc">
                <div class="desc-1">重新授权</div>
                <div class="desc-2">授权税票贷款通过更轻松</div>
              </div>
              <div class="top-logo">
                <img src="../../../static/image/tax-info/tax-logo.png" alt />
              </div>
              <div class="tip-content">
                <div class="tip-row1">尊敬的客户：您的税票授权采集未完成,</div>
                <div class="tip-row2">请点击下方按钮重试!</div>
              </div>
              <div class="operate-auth" v-if="isContinueTax">
                <van-button class="btn" type="primary" @click="goGetLink">去授权</van-button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div v-else>
      <van-empty image="error" description="维护中..." />
    </div>
  </div>
</template>
<script>
import { commonMixin, loginMixin } from '@/utils/tax/taxMixin';
import { taxProductConfigHandler } from '@/utils/tax/taxCommon';
import TaxWeb from '@/system/tax/TaxWeb.vue';
import Steps from '../../../component/steps/Steps.vue';
import { getUserBaseeinfoStatus } from '@/request/interface/impower/UserInfo.js';
import { beijingDialog, pageKeyInfoSearch } from '../../../utils/common';

export default {
  name: 'BjbTaxLogin',
  mixins: [commonMixin, loginMixin],
  components: {
    TaxWeb,
    Steps
  },
  data() {
    return {
      referrer: '',
      isAutoGetLink: false,
      isContinueTax: true,
      verifyTaxLinkPass: false
    };
  },

  methods: {
    async updateInfo() {
      this.buildParams.productId = '9999';
      this.buildParams.applyUnionKey = sessionStorage.getItem('union_key') || this.getCookie('union_key');
      const { referrer } = await pageKeyInfoSearch.call(this);

      if (referrer) {
        this.referrer = referrer;
        return;
      }
    },

    taxStatusControl() {
      taxProductConfigHandler(
        {
          taxId: this.formItem.acountNum,
          productId: '9999'
        },
        this,
        async (config) => {
          this.taxStatusConfigHandler(config);
          let stepInfo = await getUserBaseeinfoStatus();
          if (stepInfo?.data?.success && stepInfo?.data?.data) {
            if (stepInfo.data.data.bjAuthorizationUrl === 'N') {
              // 用户没有授权过
              this.isAutoGetLink = true;
            } else if (stepInfo.data.data.bjAuthorizationUrl === 'Y') {
              if (stepInfo.data.data.bjAuthorizedTwice === 'Y') {
                this.isContinueTax = false;
                // 用户授权过两次
                beijingDialog({
                  message: '人工补件处理中，请耐心等待！'
                });
              }
            }
          }

          // open next tax btn
          this.verifyTaxLinkPass = true;
        }
      );
    },

    goGetLink() {
      try {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        this.isAutoGetLink = true;

        // beijingDialog({
        //   message: '将进行采税！',
        //   confirmButtonText: '确定',
        //   cancelButtonText: '取消'
        // })
        //   .then(_ => {
        //     this.$toasting.show({ message: '加载中', forbidClick: true });
        //     this.isAutoGetLink = true;
        //   })
        //   .catch(_ => {
        //     this.isAutoGetLink = false;
        //   });
      } catch (error) {
        this.$toasting.hide();
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.from-container {
  min-height: 100vh;
  max-width: 100vw;
  overflow-x: hidden;
  background: #f8f8f8;
  display: flex;
  flex-direction: column;
  align-items: center;

  .top-content {
    width: 100%;
    height: 404px;
  }

  .middle-content {
    margin-top: -184px;
    width: 686px;
    height: 1160px;
    background: #ffffff;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .middle-desc {
      margin-top: 96px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .desc-1 {
        font-size: 40px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #2b0e0c;
        text-align: center;
      }

      .desc-2 {
        margin-top: 16px;
        font-size: 24px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #8f8b8a;
        text-align: center;
      }
    }

    .top-logo {
      margin-top: 38px;

      img {
        width: 558px;
        height: 381px;
      }
    }

    .tip-content {
      margin-top: 48px;

      .tip-row1 {
        text-align: center;
        font-size: 32px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #8f8b8a;
        line-height: 45px;
      }

      .tip-row2 {
        text-align: center;
        font-size: 32px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #a90500;
        line-height: 45px;
      }
    }

    .operate-auth {
      margin-top: 64px;

      ::v-deep .btn {
        border: unset !important;
        width: 320px;
        height: 88px;
        background: linear-gradient(129deg, #b80701 0%, #9a0400 100%), linear-gradient(129deg, #cd1101 0%, #a70500 100%);
        border-radius: 44px;
        line-height: 88px;

        .van-button__text {
          font-size: 28px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #ffffff;
        }
      }
    }
  }
}
</style>
