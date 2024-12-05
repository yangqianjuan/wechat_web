<template>
  <div class="product-detail beijing-common">
    <div class="detail-content">
      <div class="amount-content">
        <div class="title">最高可申请额度(元)</div>
        <div class="quota-content">
          <!-- <div class="num">{{ productDetail.limitMax }}</div> -->
          <!-- <div class="after-fill">万</div> -->
          <div class="num">200000</div>
        </div>
        <!-- <div class="desc">年化利率（单利）{{ productDetail.rateYearDesc }}</div> -->
        <div class="desc">年化利率（单利）7.2% - 24%</div>
        <div class="desc">*无任何额外手续费</div>
      </div>
      <van-button class="submit" @click="gotoApply">申请产品</van-button>

      <!-- 协议 v-if="!isShowProtocol" -->
      <div class="protocol-link-wrapper agreement">
        <img
          v-if="isAgree"
          @click="isAgree = !isAgree"
          src="../../../static/image/detail-select.png"
          alt
          class="checkBox icon"
        />
        <img
          v-else
          @click="isAgree = !isAgree"
          src="../../../static/image/detail-unselect.png"
          alt
          class="checkBox icon"
        />
        <p>
          <label for="agree">申请产品代表您已同意</label>
          <span @click="switchShowProtocol" class="empower sign">{{ ptotocolListShowText }}</span>
        </p>
      </div>

      <div class="pdf-wrapper beijing-protocol" v-if="isShowProtocol">
        <p-protocol-list
          @closeProtocol="switchShowProtocol"
          @getProtocolText="getProtocolText"
          :protocolText="protocolText"
          :protocolList="protocolList"
        ></p-protocol-list>
      </div>
    </div>
    <div class="operate-flow__tips">
      <div class="tips__bg">
        <img src="../../../static/image/operate-flow-tips.png" alt />
      </div>
    </div>
  </div>
</template>
<script>
import { jdugeNewUserRoute } from '@/controller/userController';
import { COOKIE_ID, SESSION_ID } from '@/utils/common/config';
import { getUnionKey } from '@/request/interface/common/index';
import MxProtocol from '@/common/mixin/MxProtocol.js';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { beijingDialog, clickControl } from '../../../utils/common';
import { getProduceDetail } from '@/request/interface/impower/Bank.js';

export default {
  /**
   * 盛京 -- 产品详情页
   * */
  name: 'SjProDetail',
  mixins: [MxProtocol],
  data() {
    return {
      payload: {
        referrer: '',
        productId: '',
        ts: ''
      },
      applyUnionKey: '',
      productDetail: {},

      isOverLoading: true,
      isAgree: '',
      isReadOver: false,
      nextPath: '/sj_upload_idcard'
    };
  },
  created() {
    this.init();
  },

  methods: {
    init() {
      try {
        const uid = this.getUrlParam('uid');
        // const prid = this.getUrlParam('prid') || '9999';
        const prid = '9999';
        const ts = this.getUrlParam('ts');

        // add applyUnionKey get / has / not get applyUnionKey
        this.applyUnionKey = this.getUrlParam('applyUnionKey');

        if (!uid) {
          this.$toasting.info({ msg: '暂无销售人员的信息' });
          return;
        }

        this.payload.referrer = uid;
        this.payload.productId = prid;
        this.payload.ts = ts;

        localStorage.referrer = this.payload.referrer;
        localStorage.productId = this.payload.productId;
        localStorage.ts = this.payload.ts;

        this.$store.commit('setProductId', this.payload.productId);
        this.$store.commit('setReferrer', this.payload.referrer);

        window.localStorage.removeItem('liveVerifyTime');

        // this.getProduct()

        Promise.all([this.jdugeNewUser(), this.getProtocolList(this.payload.productId)]);
      } catch (error) {
        console.log(error);
      }
    },

    async jdugeNewUser() {
      try {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        let userInfo = await jdugeNewUserRoute();
        if (userInfo) {
          sessionStorage.removeItem(SESSION_ID.unionKey);
          sessionStorage.removeItem('single_credit_info');

          this.succHandle(userInfo);
          return;
        }

        this.$toasting.info({ msg: '未获取到用户信息' });
      } catch (error) {
        beijingDialog({
          message: error?.data?.msg || '获取用户信息失败！',
          confirmButtonText: '确定'
        });
      }
    },

    async getProduct() {
      let productRes = await getProduceDetail({ productId: '9999' });
      if (productRes?.data?.success && productRes?.data?.data) {
        let productDetail = {
          limitMax: productRes.data.data.limitMax,
          interrestRateMinYear: productRes.data.data.interrestRateMinYear,
          interrestRateMaxYear: productRes.data.data.interrestRateMaxYear,
          rateYearDesc: ''
        };
        if (productDetail.interrestRateMaxYear === productDetail.interrestRateMinYear) {
          productDetail.rateYearDesc = productDetail.interrestRateMaxYear + '%';
        } else {
          productDetail.rateYearDesc =
            productDetail.interrestRateMinYear + ' ~ ' + productDetail.interrestRateMaxYear + '%';
        }
        this.productDetail = productDetail;
      }
    },

    async succHandle() {
      try {
        const payload = this.payload;
        payload.productId = '9999';
        // init exist from url params
        let applyUnionKey = this.applyUnionKey;

        // if (!applyUnionKey) {
        //   let unionKeyRes = await getUnionKey(payload);

        //   if (unionKeyRes?.data?.success && unionKeyRes.data.data) {
        //     applyUnionKey = unionKeyRes.data.data;
        //   }
        // }

        applyUnionKey = '99999999';

        this.applyUnionKey = applyUnionKey;
        const time = 1000 * 60 * 60 * 24 * 7;
        this.setCookie(COOKIE_ID.applyUnionKey, this.applyUnionKey, time);
        sessionStorage.setItem(SESSION_ID.unionKey, this.applyUnionKey);

        this.storageCreditInfo({
          applyUnionKey: this.applyUnionKey,
          productId: this.payload.productId,
          referrer: this.payload.referrer
        });
      } catch (error) {
        this.$router.replace({ path: '/error', query: { msg: error?.data?.msg || '获取到申请记录出错！' } });
      } finally {
        this.$toasting.hide();
        this.isOverLoading = true;
      }
    },

    storageCreditInfo(option) {
      try {
        let globalInfoPreSet = localStorage.globalInfoPreSet;
        if (globalInfoPreSet) {
          globalInfoPreSet = JSON.parse(globalInfoPreSet);
          sessionStorage.setItem('single_credit_info', JSON.stringify({ ...option, ...globalInfoPreSet }));
        } else {
          sessionStorage.setItem('single_credit_info', JSON.stringify({ ...option }));
          localStorage.globalInfoPreSet = JSON.stringify({ ...option });
        }
      } catch (error) {}
    },

    agreeProtocol() {
      this.$router.push({
        path: this.nextPath,
        query: {
          referrer: this.payload.referrer,
          productId: this.payload.productId
        }
      });
    },

    gotoApply() {
      if (!this.isOverLoading) {
        return;
      }
      clickControl.call(this, this.nextStep);
    },

    nextStep() {
      if (!this.isAgree) {
        this.$toasting.info({ msg: '请阅读并同意协议' });
        return;
      }
      this.agreeProtocol();
    },

    getProtocolText(protocol) {
      let code = protocol.code,
        index = protocol.index;
      this.protocolText = [];

      this.queryProtocolText({ fileType: code }, index).then((res) => {
        if (res && this.protocolList?.length) {
          let isAllRead = this.protocolList.every((item) => {
            return item.isReadOver;
          });
          isAllRead && (this.isAgree = true);
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.product-detail {
  width: 100vw;
  min-height: 100vh;
  background-color: #b00700;
  background-image: url('../../../static/image/bg.png');
  background-size: contain;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  align-items: center;

  .detail-content {
    margin-top: 348px;
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 670px;
    height: 584px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 32px;
    // opacity: 0.1;

    .amount-content {
      margin-top: 52px;

      .title {
        text-align: center;
        font-size: 24px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #ffffff;
      }

      .quota-content {
        margin-top: 16px;
        display: flex;
        justify-content: center;
        align-items: flex-end;

        .num {
          font-size: 96px;
          font-family: DINAlternate-Bold, DINAlternate;
          font-weight: bold;
          color: #ffffff;
          margin-right: 8px;
        }

        .after-fill {
          font-size: 32px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #ffffff;
          margin-bottom: 30px;
        }
      }

      .desc {
        margin-top: 8px;
        text-align: center;
        font-size: 24px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #ffffff;
      }
    }

    .submit {
      margin-top: 26px;
      width: 606px;
      height: 88px;
      border-radius: 44px;
      background-color: #fff;

      ::v-deep .van-button__text {
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #a90a06;
      }
    }

    .agreement {
      margin-top: 32px;
      padding: 0 34px;
      font-size: 22px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #ead9d9;
      display: flex;

      .icon {
        width: 24px;
        height: 24px;
        margin-right: 8px;
        margin-top: 6px;
      }

      .sign {
        color: #fff;
      }
    }
  }

  .operate-flow__tips {
    margin-top: 40px;
    display: flex;
    justify-content: center;

    .tips__bg {
      width: 670px;
      height: 312px;

      img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
