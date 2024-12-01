<template>
  <div class="prduct-detail-wrapper" v-if="isOverLaoding">
    <div class="product-name-logo-wrapper">
      <div class="name-warpper">
        <div class="product-name-wwrapper">
          <p class="product-name">{{ productDetail.productName }}</p>
        </div>
        <img class="pf-logo" :src="productDetail.productImage" alt />
      </div>
      <div class="product-saas-label" v-if="productDetail.productId === 1023">
        <img class="ic-cir" :src="toTipSrc" />
        <span>尊敬的客户：该产品银行实际年化利率8.5%，利息由微盟集团贴付，请知悉！</span>
      </div>
      <p class="title-max">最高额度</p>
      <p class="limit-max">{{ productDetail.limitMax }}</p>

      <div class="product-label-wrapper">
        <div class="product-label">
          <img class="ic-cir" :src="icCir" />
          <span>最长期限：{{ productDetail.productTermMax }}</span>
        </div>
        <div class="product-label product-label-margin">
          <img class="ic-cir" :src="icCir" />
          <span>
            年化利率
            <span class="rate-desc">(年化利率按照单利计算)</span>
            <span>：{{ productDetail.interrestRateMin }}%</span>
          </span>
        </div>
      </div>
      <div class="product-label-wrapper" v-if="productDetail.productId !== 1023">
        <div class="product-label">
          <img class="ic-cir" :src="icCir" />
          <span>银行实际年化利率8.5%，此产品客户无需承担利息</span>
        </div>
      </div>
      <div class="sub-btn-wrapper">
        <Button class="phone-sms-ver-sub-btn" @click="gotoApply">立即申请</Button>
      </div>
      <div class="protocol-link-wrapper">
        <input class="protocol-select-btn" id="agree" type="radio" value="agree" v-model="isAgree" />
        <p>
          <label for="agree">请阅读并同意协议</label>
          <span @click="switchShowProtocol" class="protocol">{{ ptotocolListShowText }}</span>
        </p>
      </div>
    </div>

    <div>
      <div class="sec-title-wrapper">
        <img class="ic-gap-row" :src="icGapRow" />
        <span class="sec-title">产品特点</span>
      </div>
      <div class="product-desc-wrapper">
        <div class="product-feature-wrapper">
          <div class="feature-item-wrapper" v-for="(productFeature, index) in productFeatureList" :key="index">
            <img class="ic-feature" :src="productFeature.icon" />
            <p>{{ productFeature.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-for="(prodcutDesc, index) in productDescList" :key="index">
      <div class="sec-title-wrapper">
        <img class="ic-gap-row" :src="icGapRow" />
        <span class="sec-title">{{ prodcutDesc.title }}</span>
      </div>
      <div class="product-desc-wrapper" v-if="prodcutDesc.type === 'text'">
        <div v-for="(descItem, index) in prodcutDesc.descItemList" :key="index" v-html="descItem"></div>
      </div>
      <div class="product-desc-wrapper" v-if="prodcutDesc.type === 'img'">
        <img class="ic-apply-flow" :src="prodcutDesc.descItemList[0]" />
      </div>
    </div>
    <div class="pdf-wrapper" v-if="isShowProtocol">
      <p-protocol-list
        @closeProtocol="switchShowProtocol"
        @getProtocolText="getProtocolText"
        :protocolText="protocolText"
        :protocolList="protocolList"
      ></p-protocol-list>
    </div>
  </div>
</template>
<script>
import { jdugeNewUserRoute } from '@/controller/userController';
import { toThousands } from '@/utils/common/common';
import { COOKIE_ID, SESSION_ID } from '@/utils/common/config';
import { getUnionKey } from '@/request/interface/common';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { getProduceDetail } from '@/request/interface/impower/Bank.js';
import { PRODUCT_FATURE_LIST, SASS_PRODUCT_DETAIL_PROTOCOL } from './utils/util';
import MxProtocol from '@/common/mixin/MxProtocol.js';
export default {
  /**
   * 这个是saas的产品详情
   *      1、产品的介绍
   * */
  name: 'SassProdcutDeatil',
  data() {
    return {
      phoneNum: '',
      pufayinhang: require('@/assets/imgs/icon/pufayinhang.png'),
      isShowMask: false,
      isShowProtocol: false,
      payload: {
        referrer: '',
        productId: '',
        ts: ''
      },
      applyUnionKey: '',
      productDescList: [],
      productDetail: {},
      protocolList: SASS_PRODUCT_DETAIL_PROTOCOL,
      icCir: require('@/assets/imgs/product/ic_cir.png'),
      icGapRow: require('@/assets/imgs/product/ic_gap.png'),
      toTipSrc: require('@/assets/imgs/totip.svg'),
      productFeatureList: PRODUCT_FATURE_LIST,
      isAgree: '',
      isOverLaoding: false,
      isReadOver: false,
      nextPath: '/upload_idcard'
    };
  },
  mixins: [MxProtocol],
  created() {
    let ts = this.getUrlParam('ts');
    this.payload.referrer = this.getUrlParam('uid');
    this.payload.productId = this.getUrlParam('prid');
    this.payload.ts = ts;
    localStorage.referrer = this.payload.referrer;
    localStorage.productId = this.payload.productId;
    localStorage.ts = ts;
    this.$store.commit('setProductId', this.payload.productId);
    this.$store.commit('setReferrer', this.payload.referrer);
    window.localStorage.removeItem('liveVerifyTime');
    this.jdugeNewUser();
    this.getProtocolList(this.payload.productId);
  },
  methods: {
    gotoApply() {
      this.isShowMask = false;
      if (!this.isOverLaoding) {
        return;
      }
      this.nextStep();
    },
    nextStep() {
      if (!this.isAgree) {
        this.$notify.info({ msg: '请阅读并同意协议！' });
      } else {
        this.agreeProtocol();
      }
    },
    getProduct() {
      getProduceDetail({ productId: this.payload.productId || '1023' }).then(res => {
        let data = res?.data?.data;
        data.limitMax = toThousands((data.limitMax * 10000).toFixed(2));
        this.productDetail = data;
        let productDescList = JSON.parse(data.productDesc);
        productDescList.forEach(productDesc => {
          productDesc.descItemList[0] = productDesc.descItemList[0].replace(/\n/g, '<br>');
        });
        this.productDescList = productDescList;
      });
    },
    getProtocolText(protocol) {
      this.protocolText = [];
      let code = protocol.code;
      let index = protocol.index;
      this.queryProtocolText({ fileType: code }, index);
    },
    agreeProtocol() {
      if (this.nextPath === '/face_pp') {
        this.$router.replace({ path: this.nextPath });
      } else {
        this.$router.replace({
          path: this.nextPath,
          query: {
            referrer: this.payload.referrer,
            productId: this.payload.productId
          }
        });
      }
    },
    jdugeNewUser() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      this.getProduct();
      jdugeNewUserRoute()
        .then(user => {
          this.succHandle(user);
        })
        .catch(err => {
          this.$toasting.hide();
        });
    },
    succHandle(user) {
      let payload = this.payload;
      let applyUnionKey = '';
      let that = this;
      sessionStorage.removeItem(SESSION_ID.unionKey);
      getUnionKey(payload)
        .then(async res => {
          let time = 1000 * 60 * 60 * 24 * 7;
          let homePath = '/';
          applyUnionKey = res?.data?.data;
          this.applyUnionKey = applyUnionKey;
          this.setCookie(COOKIE_ID.applyUnionKey, applyUnionKey, time);
          sessionStorage.setItem(SESSION_ID.unionKey, applyUnionKey);
          let nextPath = await queryNextByUnionKeyAndProdId(that.payload.productId, applyUnionKey);
          if (nextPath === homePath) {
            this.$router.replace({ path: nextPath });
            return;
          }
          nextPath && (this.nextPath = nextPath);
        })
        .catch(err => {
          this.$router.replace({ path: '/error', query: { msg: err?.data?.msg } });
        })
        .finally(() => {
          this.$toasting.hide();
          this.isOverLaoding = true;
        });
      this.phoneNum = user.phoneNum;
    }
  }
};
</script>
<style lang="scss" scoped>
.desc-wrapper {
  height: 300px;
}
.apply-btn {
  width: 84%;
  height: 50px;
  margin-top: 20px;
  font-size: 26px;
  margin-left: 8%;
}
.mask {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  -moz-opacity: 0.5;
  filter: alpha(opacity=50);
  z-index: 3;
}
.prduct-detail-wrapper {
  // padding: 25px 20px;
  padding: 155px 20px 25px 20px;
  min-height: 100vh;
  background: #ffffff url('../../../../assets/imgs/product/bg_prodcut_detail.png') no-repeat top / 100vw;
  .product-name-logo-wrapper {
    // margin-top: -1rem;
    background: #ffffff;
    box-shadow: 0.25rem 0.3125rem 0.3125rem 0.0625rem rgba(53, 82, 209, 0.1);
    border-radius: 0.5rem;
    padding: 15px 30px;
    .name-warpper {
      display: flex;
      align-items: center;
    }
    .pf-logo {
      // height: 60px;
      // position: relative;
      // top: -20px;
      width: 140px;
      background-size: 200px 200px;
      margin-left: 20px;
    }
    .product-saas-label {
      margin-top: 1rem;
      font-size: 18px;
      color: #adabab;
      .ic-cir {
        height: 20px;
        width: 20px;
        margin-bottom: -0.2rem;
      }
    }
    .product-name-wwrapper {
      background: url('../../../../assets/imgs/product/ic_gap_clo.png') no-repeat left bottom / 30vw 4px;
      display: inline-block;
      .product-name {
        font-size: 30px;
        font-weight: 600;
        color: rgba(51, 51, 51, 1);
        margin-bottom: 8px;
      }
    }
    .title-max {
      text-align: center;
      margin-top: 20px;
      font-weight: 600;
      font-size: 28px;
      color: rgba(153, 153, 153, 1);
    }
    .limit-max {
      text-align: center;
      font-size: 72px;
      font-weight: 700;
      color: rgba(53, 82, 209, 1);
    }
    .product-label-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 20px;
      .rate-desc {
        font-size: 16px !important;
        font-weight: 500 !important;
        color: #a2a2a2;
      }
      .product-label {
        display: flex;
        align-items: center;

        color: #999999;
        .ic-cir {
          width: 10px;
          height: 10px;
          margin-right: 8px;
        }
        span {
          font-size: 20px;
          font-weight: bold;
        }
      }
      .product-label-margin {
        margin-left: 15px;
      }
    }
    .sub-btn-wrapper {
      margin-top: 30px;
      .phone-sms-ver-sub-btn {
        width: 70%;
        background: rgba(253, 105, 110, 1);
        box-shadow: 0.25rem 0.3125rem 0.5rem 0.0625rem rgba(253, 105, 110, 0.41);
        color: #ffffff;
        border-radius: 1.125rem;
        font-size: 26px;
        font-weight: 500;
        margin-left: 15%;
      }
    }
  }
  .sec-title-wrapper {
    margin-top: 30px;
    display: flex;
    align-items: center;
    .ic-gap-row {
      width: 8px;
      height: 25px;
    }
    .sec-title {
      font-size: 28px;
      color: rgba(153, 153, 153, 1);
      margin-left: 20px;
      font-weight: 500;
    }
  }
  .product-desc-wrapper {
    margin-top: 15px;
    font-size: 22px;
    color: rgba(153, 153, 153, 1);
    font-weight: 600;
    padding: 24px 29px;
    box-shadow: 0px 3px 10px 2px rgba(53, 82, 209, 0.1);
    border-radius: 0.25rem;
    .product-feature-wrapper {
      display: flex;
      justify-content: space-between;
      .feature-item-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        .ic-feature {
          height: 60px;
          width: 60px;
          margin-bottom: 12px;
        }
      }
    }
    .ic-apply-flow {
      width: 100%;
    }
  }
}
.protocol-link-wrapper {
  padding: 26px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-size: 26px;
  .protocol-select-btn {
    margin: 20px 20px 0 0;
  }
  .protocol {
    color: #1b6ffb;
  }
}
</style>
