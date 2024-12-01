<template>
  <div class="prduct-detail-wrapper" v-if="isOverLaoding">
    <div class="product-name-logo-wrapper">
      <div class="name-warpper">
        <div class="product-name-wwrapper">
          <p class="product-name">{{ productDetail.productName }}</p>
        </div>
        <img class="pf-logo" :src="pufayinhang" alt />
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
            <span>：{{ productDetail.interrestRateMin * 360 }}%</span>
          </span>
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
    <p-modal
      v-show="isShowAddress"
      title="企业经营地址"
      @ok="confirmAddress"
      @cancel="switchShowAddress"
      :loading="addressLoading"
    >
      <div class="address-sel-wrapper">
        <v-distpicker @province="getPprovinceCode" @city="getCityCode"></v-distpicker>
      </div>
    </p-modal>
  </div>
</template>
<script>
import Address from '@/common/components/address/Address';
import Modal from '@/common/components/common/Modal';
import { verifyClientAreaCode } from '@/request/interface/impower/UserInfo.js';
import { jdugeNewUserRoute } from '../../../../../../controller/userController';
import { toThousands } from '@/utils/common/common';
import { COOKIE_ID, SESSION_ID } from '../../../../../../utils/common/config';
import { getUnionKey } from '@/request/interface/common';
import { getUserBaseeinfoStatus } from '@/request/interface/impower/UserInfo.js';
import { getProduceDetail } from '@/request/interface/impower/Bank.js';
import MxProtocol from '@/common/mixin/MxProtocol.js';
import { infoRegister } from '@/utils/common/common';
import { judgeXMDApplyRoute } from '@/utils/credit/jdugeNextPath';
export default {
  /**
   * xmkd的产品详情，
   *    1、详情的展示
   *    2、企业地址的录入
   *
   * */
  name: 'ProductionDetail',
  data() {
    return {
      phoneNum: '',
      logo: require('@/assets/imgs/icon/ic_logo.png'),
      pufayinhang: require('@/assets/imgs/icon/pufayinhang.png'),
      isShowMask: false,
      isShowAddress: false,
      payload: {
        referrer: '',
        productId: '',
        ts: ''
      },
      applyUnionKey: '',
      productDescList: [],
      productLoanDesc: [],
      productDetail: {},
      icCir: require('@/assets/imgs/product/ic_cir.png'),
      icGapRow: require('@/assets/imgs/product/ic_gap.png'),
      productFeatureList: [
        {
          icon: require('@/assets/imgs/product/ic_sim.png'),
          desc: '操作简单'
        },
        {
          icon: require('@/assets/imgs/product/ic_safe.png'),
          desc: '快捷方便'
        },
        {
          icon: require('@/assets/imgs/product/ic_prepay.png'),
          desc: '随借随还'
        }
      ],
      isAgree: '',
      isOverLaoding: false,
      addressLoading: false,
      isReadOver: false,
      nextPath: '/upload_idcard',
      address: {
        province: '',
        city: ''
      }
    };
  },
  components: {
    'p-modal': Modal,
    'v-distpicker': Address
  },
  mixins: [MxProtocol],
  created() {
    this.init();
  },
  methods: {
    init() {
      let ts = this.getUrlParam('ts');
      this.payload.referrer = this.getUrlParam('uid');
      this.payload.productId = this.getUrlParam('prid');
      this.applyUnionKey = this.getUrlParam('applyUnionKey');
      this.payload.ts = ts;
      localStorage.referrer = this.payload.referrer;
      localStorage.productId = this.payload.productId;
      localStorage.ts = ts;
      this.$store.commit('setProductId', this.payload.productId);
      this.$store.commit('setReferrer', this.payload.referrer);
      window.localStorage.removeItem('liveVerifyTime');
      this.jdugeNewUser();
      this.getProtocolList(this.payload.productId);
      // 注册使用的信息
      infoRegister('1000', { referrer: this.payload.referrer });
    },
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
        if (this.nextPath === '/upload_idcard') {
          this.isShowAddress = true;
        } else {
          this.agreeProtocol();
        }
      }
    },
    getProduct() {
      getProduceDetail({ productId: this.payload.productId || '1000' }).then(res => {
        let data = res.data.data;
        data.limitMax = toThousands((data.limitMax * 10000).toFixed(2));
        this.productDetail = data;
        // this.formateProductLoanDesc(data)
        let productDescList = JSON.parse(data.productDesc);
        productDescList.forEach(productDesc => {
          productDesc.descItemList[0] = productDesc.descItemList[0].replace(/\n/g, '<br>');
        });
        this.productDescList = productDescList;
      });
    },
    formateProductLoanDesc(data) {
      let productLoanDesc = [];
      productLoanDesc.push({ title: '最高额度', desc: `${data.limitMax}万` });
      productLoanDesc.push({ title: '最长期限', desc: data.productTermMax });
      productLoanDesc.push({
        title: '最低日利率',
        desc: `${data.interrestRateMin}%`
      });
      this.productLoanDesc = productLoanDesc;
    },
    getProtocolText(protocol) {
      this.protocolText = [];
      let code = protocol.code;
      let index = protocol.index;
      this.queryProtocolText({ fileType: code }, index);
    },
    confirmAddress() {
      this.addressLoading = true;
      if (!this.address.province) {
        this.$notify.error({ msg: '请选择省份！' });
        return this.addressHideLoading();
      } else if (!this.address.city) {
        this.$notify.error({ msg: '请选择城市！' });
        return this.addressHideLoading();
      }
      let params = {
        applyUnionKey: this.applyUnionKey,
        areaCode: this.address.city,
        productId: this.payload.productId,
        referrer: this.payload.referrer
      };
      verifyClientAreaCode(params)
        .then(res => {
          this.addressHideLoading();
          let result = res?.data?.data;
          if (result && res?.data?.success) {
            this.agreeProtocol();
          } else {
            let referrer = this.payload.referrer;
            this.$notify.error({ msg: `与客户经理(${referrer})可进件地区不匹配！` });
          }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '验证失败，请重试！' });
          this.addressHideLoading();
        });
    },
    getPprovinceCode(province) {
      this.address.province = province;
      this.address.city = '';
    },
    getCityCode(city) {
      this.address.city = city;
    },
    addressHideLoading() {
      this.addressLoading = false;
    },
    bindPhoneNoitfy() {
      this.isShowMask = false;
      this.phoneNum = 'replace';
      this.nextStep();
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
    switchShowAddress() {
      this.isShowAddress = !this.isShowAddress;
    },
    jdugeNewUser() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      this.getProduct();
      jdugeNewUserRoute()
        .then(user => {
          this.succHandle(user);
        })
        .finally(_ => {
          this.$toasting.hide();
        });
    },
    succHandle(user) {
      let baseInfoStatus;
      let payload = this.payload;
      let applyUnionKey = '';
      sessionStorage.removeItem(SESSION_ID.unionKey);
      if (this.applyUnionKey) {
        let time = 1000 * 60 * 60 * 24 * 7;
        this.setCookie(COOKIE_ID.applyUnionKey, this.applyUnionKey, time);
        sessionStorage.setItem(SESSION_ID.unionKey, this.applyUnionKey);
        getUserBaseeinfoStatus({ applyUnionKey: this.applyUnionKey })
          .then(res => {
            baseInfoStatus = res.data.data;
            this.nextPath = judgeXMDApplyRoute(baseInfoStatus);
          })
          .catch(err => {
            this.$notify.error({ msg: err?.data?.msg });
          })
          .finally(() => {
            this.isOverLaoding = true;
          });
      } else {
        getUnionKey(payload)
          .then(res => {
            let time = 1000 * 60 * 60 * 24 * 7;
            applyUnionKey = res.data.data;
            this.applyUnionKey = applyUnionKey;
            this.setCookie(COOKIE_ID.applyUnionKey, applyUnionKey, time);
            sessionStorage.setItem(SESSION_ID.unionKey, applyUnionKey);
            return getUserBaseeinfoStatus({ applyUnionKey });
          })
          .catch(err => {
            let msg = err.data.msg;
            this.$router.replace({ path: '/error', query: { msg } });
          })
          .then(res => {
            baseInfoStatus = res.data.data;
            this.nextPath = judgeXMDApplyRoute(baseInfoStatus);
          })
          .catch(err => {
            this.$notify.error({ msg: err?.data?.msg });
            console.log(err);
          })
          .finally(() => {
            this.isOverLaoding = true;
          });
      }
      this.phoneNum = user.phoneNum;
    }
  }
};
</script>
<style lang="scss" scoped>
.address-sel-wrapper {
  .selectAddress {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 1 1 6.5rem;
  }
}
/deep/.selectAddress select {
  -webkit-appearance: none;
  height: 30px;
  width: 110px;
  min-width: 4.375rem;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  background-color: #f1f1f1;
  direction: rtl;
  border: none;
  outline: none;
  background: #ffffff;
  color: #7f7f7f;
  font-size: 24px;
}
/deep/.selectAddress option {
  height: 30px;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  margin-left: 15px;
  font-size: 24px;
}
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
  padding: 155px 20px 25px 20px;
  min-height: 100vh;
  background: #ffffff url('../../../../../../assets/imgs/product/bg_prodcut_detail.png') no-repeat top / 100vw;
  .product-name-logo-wrapper {
    background: #ffffff;
    box-shadow: 0.25rem 0.3125rem 0.3125rem 0.0625rem rgba(53, 82, 209, 0.1);
    border-radius: 0.5rem;
    padding: 15px 30px;
    .name-warpper {
      display: flex;
      align-items: center;
    }
    .pf-logo {
      height: 60px;
      width: 178px;
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
      // background: url("../../assets/imgs/product/ic_gap_clo.png") no-repeat left bottom / auto 0.3125rem;
      background: url('../../../../../../assets/imgs/product/ic_gap_clo.png') no-repeat left bottom / 35vw 4px;
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
