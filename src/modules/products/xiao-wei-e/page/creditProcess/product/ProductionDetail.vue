<template>
  <div class="prduct-detail-wrapper" v-if="isOverLoading">
    <!-- 产品的具体介绍 -->
    <div class="product-name-logo-wrapper">
      <div class="name-warpper">
        <div class="product-name-wwrapper">
          <p class="product-name">{{ productDetail.productName }}</p>
        </div>
        <img class="pf-logo" :src="bankIcon" alt />
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
        <van-button class="phone-sms-ver-sub-btn foot-operate-btn" @click="gotoApply">立即申请</van-button>
      </div>

      <!-- 协议 -->
      <div class="protocol-link-wrapper">
        <input class="protocol-select-btn" id="agree" type="radio" value="agree" v-model="isAgree" />
        <p>
          <label for="agree">请阅读并同意协议</label>
          <span @click="switchShowProtocol" class="protocol">{{ ptotocolListShowText }}</span>
        </p>
      </div>
      <!-- 注意 -->
      <div class="notice">
        <span @click.stop="openNotice">
          注意事项
          <van-icon name="info-o" />
        </span>

        <van-dialog v-model="showNotice" title="操作规范">
          <div class="notice-desc">
            <p>1、请保持良好的网络环境，避免造成信息的录入失败！</p>
            <p>2、请保证填入的信息真实有效，避免造成信息的录入失败！</p>
            <p>3、请按照规定的流程上传相关信息，避免造成信息的录入失败！</p>
            <p>4、请在上传信息的过程中，切勿随意关闭页面，避免造成信息的录入失败！</p>
            <p>5、在未知的情况下，信息的录入失败，请关闭页面，登出，或者刷新页面，重新上传！</p>
            <p class="p-end">谢谢你的配合！</p>
          </div>
        </van-dialog>
      </div>
    </div>

    <!-- 产品特点 -->
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

    <!-- 产品介绍、产品特点、申请条件等等 -->
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

    <!-- 协议列表的展示 -->
    <div class="pdf-wrapper" v-if="isShowProtocol">
      <p-protocol-list
        @closeProtocol="switchShowProtocol"
        @getProtocolText="getProtocolText"
        :protocolText="protocolText"
        :protocolList="protocolList"
      ></p-protocol-list>
    </div>

    <!-- 区域选择 -->
    <van-action-sheet v-model="addressShow" v-if="addressShow">
      <van-area
        title="地区"
        :area-list="areaList"
        :value="addressInfo.code"
        :columns-placeholder="['请选择', '请选择']"
        columns-num="2"
        @confirm="addressConfirm"
        @cancel="addressCancel"
      />
    </van-action-sheet>
  </div>
</template>
<script>
import { verifyClientAreaCode } from '@/request/interface/impower/UserInfo.js';
import { jdugeNewUserRoute } from '@/controller/userController';
import { toThousands } from '@/utils/common/common';
import { COOKIE_ID, SESSION_ID } from '@/utils/common/config';
import { getUnionKey } from '@/request/interface/common/index';
import { getProduceDetail } from '@/request/interface/impower/Bank.js';
import MxProtocol from '@/common/mixin/MxProtocol.js';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { gfAreaDictQuery } from '@/request/interface/gf/common.js';

export default {
  /**
   * 产品详情页
   * */
  name: 'XWEProDetail',
  mixins: [MxProtocol],
  data() {
    return {
      // 请求参数
      payload: {
        referrer: '',
        productId: '',
        ts: ''
      },
      // 用户的唯一标识
      applyUnionKey: '',
      // 产品的描述
      productDescList: [],
      // 产品贷款利率的格式化
      productLoanDesc: [],
      // 产品的大致详情
      productDetail: {},
      // 产品特点
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
      // 全局loading
      isOverLoading: false,
      // 是否同意协议
      isAgree: '',
      // 协议是否已读
      isReadOver: false,
      nextPath: '/xwe_upload_idcard',
      // 地址
      address: {
        province: '',
        city: ''
      },
      // 银行icon
      bankIcon: require('@/assets/imgs/icon/guangfayinhang.jpg'),
      // 产品介绍的背景原图icon
      icCir: require('@/assets/imgs/product/ic_cir.png'),
      // 产品name下的填充
      icGapRow: require('@/assets/imgs/product/ic_gap.png'),
      // 提示
      showNotice: false,
      // 区域的展示
      addressShow: false,
      // 地区
      areaList: {},
      // 地区选择的信息
      addressInfo: {
        value: '',
        obj: [],
        code: ''
      }
    };
  },
  created() {
    this.init();
  },

  methods: {
    init() {
      if (this.getUrlParam('uid')) {
        this.payload.referrer = this.getUrlParam('uid');
        this.payload.productId = this.getUrlParam('prid') || '1035';
        this.payload.ts = this.getUrlParam('ts');
        localStorage.referrer = this.payload.referrer;
        localStorage.productId = this.payload.productId;
        localStorage.ts = this.payload.ts;
        this.$store.commit('setProductId', this.payload.productId);
        this.$store.commit('setReferrer', this.payload.referrer);
        window.localStorage.removeItem('liveVerifyTime');
        Promise.all([this.jdugeNewUser(), this.getProtocolList(this.payload.productId), this.getgfAreaDictQuery()]);
      } else {
        this.$notify.info({
          msg: '暂无销售人员的信息!'
        });
      }
    },

    // 立即申请
    gotoApply() {
      if (!this.isOverLoading) {
        return;
      }
      this.nextStep();
    },

    /**
     * 1、是否同意协议，勾选协议
     * 2、下一步，是上传身份证信息，则展示地区的选择，进行跳转
     * */
    nextStep() {
      if (!this.isAgree) {
        this.$notify.info({
          msg: '请阅读并同意协议，并查看注意事项！'
        });
      } else {
        this.nextPath === '/xwe_upload_idcard' ? (this.addressShow = true) : this.agreeProtocol();
      }
    },

    // 获取协议
    getProtocolText(protocol) {
      let code = protocol.code,
        index = protocol.index;
      this.protocolText = [];
      this.queryProtocolText({ fileType: code }, index);
    },

    /**
     *  1、提交企业地区信息，进行验证，成功之后进行，下一步身份信息上传
     * */
    confirmAddress() {
      if (!this.address.province || !this.address.city) {
        this.$notify.info({
          msg: '请将地区选择完整！'
        });
        return;
      }
      this.addressShow = false;
      let params = {
        applyUnionKey: this.applyUnionKey,
        areaCode: this.address.city,
        productId: this.payload.productId,
        referrer: this.payload.referrer
      };
      this.$toasting.show({ message: '校验中', forbidClick: true });
      verifyClientAreaCode(params)
        .then(res => {
          let result = res?.data?.data ? res.data.data : null;
          if (result) {
            this.agreeProtocol();
          } else {
            let referrer = this.payload.referrer;
            this.$notify.info({
              msg: `与客户经理(${referrer})可进件地区不匹配，请重新选择！`
            });
          }
        })
        .catch(err => {
          let errMsg = err?.data?.msg || '校验失败，请重试！';
          this.$notify.error({
            msg: errMsg
          });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    /**
     * 地区选择成功之后的跳转，在此之前，这一步已经验证
     */
    agreeProtocol() {
      this.nextPath === '/xwe_face_pp'
        ? this.$router.replace({ path: this.nextPath })
        : this.$router.replace({
            path: this.nextPath,
            query: {
              referrer: this.payload.referrer,
              productId: this.payload.productId
            }
          });
    },

    /**
     * 1、获取产品信息
     * 2、获取用户的基本信息
     * 3、获取用户的唯一标识
     */
    jdugeNewUser() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      this.getProduct();
      jdugeNewUserRoute()
        .then(user => {
          user
            ? this.succHandle(user)
            : this.$notify.info({
                msg: '未获取到用户信息！'
              });
        })
        .catch(err => {
          let errMsg = err?.data?.msg || '获取用户信息失败！';
          this.$notify.error({
            msg: errMsg
          });
        });
    },

    // 获取底部的产品的介绍
    getProduct() {
      let productId = this.payload.productId || '1035';
      getProduceDetail({ productId: productId })
        .then(res => {
          let data = res?.data?.data || null;
          if (data) {
            data.limitMax = toThousands((data.limitMax * 10000).toFixed(2));
            this.productDetail = data;
            let productDescList = JSON.parse(data.productDesc);
            let productFeatureList = data.productLabel;
            productDescList.forEach(productDesc => {
              productDesc.descItemList[0] = productDesc.descItemList[0].replace(/\n/g, '<br>');
            });
            productFeatureList.forEach((item, index) => {
              this.productFeatureList[index].desc = item;
            });
            this.productDescList = productDescList;
          } else {
            this.$notify.info({
              msg: '未获取到产品详情信息！'
            });
          }
        })
        .catch(err => {
          this.$notify.error({
            msg: err?.data?.msg || '获取产品详情信息失败！'
          });
        });
    },

    /**
     * 1、获取用户的unionID，存储在sessionStorage、cookie
     * 2、用unionKey，获取当前用户的授信状态
     */
    succHandle(user) {
      let payload = this.payload;
      sessionStorage.removeItem(SESSION_ID.unionKey);
      sessionStorage.removeItem('single_credit_info');
      getUnionKey(payload)
        .then(async res => {
          this.applyUnionKey = res?.data?.data || undefined;
          if (this.applyUnionKey) {
            let time = 1000 * 60 * 60 * 24 * 7;
            this.setCookie(COOKIE_ID.applyUnionKey, this.applyUnionKey, time);
            sessionStorage.setItem(SESSION_ID.unionKey, this.applyUnionKey);
            let productId = this.payload.productId ? this.payload.productId : '1035';
            this.storageCreditInfo({
              applyUnionKey: this.applyUnionKey,
              productId: productId,
              referrer: this.payload.referrer
            });
            let nextPath = await queryNextByUnionKeyAndProdId(productId);
            this.nextPath = nextPath;
          } else {
            this.$notify.info({
              msg: '未获取到申请记录信息！'
            });
          }
        })
        .catch(err => {
          this.$router.replace({ path: '/error', query: { msg: err?.data?.msg || '获取到申请记录出错！' } });
        })
        .finally(() => {
          this.$toasting.hide();
          this.isOverLoading = true;
        });
    },

    // 存储单次用户的授信的基本信息
    storageCreditInfo(option) {
      sessionStorage.setItem('single_credit_info', JSON.stringify(option));
    },

    openNotice() {
      this.showNotice = true;
    },

    /**
     * 获取广发的省市区的信息
     *    用户授信的时候，直接调用
     * */
    // 获取省市区的接口
    getgfAreaDictQuery() {
      gfAreaDictQuery()
        .then(res => {
          if (res?.data?.data) {
            this.areaList.province_list = res.data.data.provinceList || {};
            this.areaList.city_list = res.data.data.cityList || {};
            this.areaList.county_list = res.data.data.countyList || {};
          }
        })
        .catch(err => {
          this.$notify.error({
            msg: err?.data?.msg || '获取区域信息失败！'
          });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // 地区选择提交
    addressConfirm(item) {
      if (Array.isArray(item) && item.length) {
        this.addressInfo.obj = item;
        // 省
        if (item[0] && item[0].code) {
          this.addressInfo.code = item[0].code;
          this.address.province = item[0].code;
        } else {
          this.address.province = '';
        }

        // 市
        if (item[1] && item[1].code) {
          this.addressInfo.code = item[1].code;
          this.address.city = item[1].code;
        } else {
          this.address.city = '';
        }

        this.confirmAddress();
      } else {
        this.$notify.error({
          msg: '地址选取失败！'
        });
      }
    },

    // 取消地址选取
    addressCancel() {
      this.addressShow = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.address-sel-wrapper {
  min-height: 5vh;
  ::v-deep(.address-wrapper) {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    select {
      -webkit-appearance: none;
      height: 60px;
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
      font-size: 25px;
    }
    option {
      height: 50px;
      border: 1px solid #dcdee2;
      border-radius: 4px;
      margin-left: 15px;
      font-size: 26px;
    }
    .select-desc {
      font-size: 25px;
    }
  }
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
  // padding: 25px 20px;
  padding: 155px 20px 25px 20px;
  min-height: 100vh;
  background: #ffffff url('../../../../../../assets/imgs/product/bg_prodcut_detail.png') no-repeat top / 100vw;
  .product-name-logo-wrapper {
    background: #ffffff;
    box-shadow: 0.25rem 0.3125rem 0.3125rem 0.0625rem rgba(53, 82, 209, 0.1);
    border-radius: 0.5rem;
    padding: 25px 30px;
    .name-warpper {
      display: flex;
      align-items: center;
    }
    .pf-logo {
      height: 40px;
      width: 200px;
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
      background: url('../../../../../../assets/imgs/product/ic_gap_clo.png') no-repeat left bottom / 92px 4px;
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
      margin-top: 30px;
      font-weight: 600;
      font-size: 32px;
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
        height: unset;
        padding: 12px 0;
        background: rgba(253, 105, 110, 1);
        box-shadow: 0.25rem 0.3125rem 0.5rem 0.0625rem rgba(253, 105, 110, 0.41);
        color: #ffffff;
        border-radius: 1.125rem;
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
.notice {
  font-weight: 500;
  text-align: center;
  font-size: 28px;
}
.notice-desc {
  font-size: 26px;
  padding: 26px 26px;
  p {
    margin-bottom: 16px;
    text-align: left;
  }
  .p-end {
    text-align: center;
    margin-top: 26px;
  }
}
::v-deep(.van-area) {
  .van-picker__toolbar {
    padding: 16px 12px;
    .van-picker__cancel {
      font-size: 30px;
    }
    .van-picker__confirm {
      font-size: 30px;
      color: #333333;
    }
    .van-picker__title {
      font-size: 36px;
    }
  }
  .van-picker-column__item--selected {
    background-color: #f2f4f8;
    color: #333333;
  }
  .van-picker-column__wrapper {
    .van-picker-column__item {
      .van-ellipsis {
        font-size: 30px;
        color: #333333;
      }
    }
  }
}
</style>
