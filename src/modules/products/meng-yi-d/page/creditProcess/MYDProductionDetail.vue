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
  </div>
</template>
<script>
import { jdugeNewUserRoute } from '@/controller/userController';
import { toThousands } from '@/utils/common/common';
import { getProduceDetail } from '@/request/interface/impower/Bank.js';
import MxProtocol from '@/common/mixin/MxProtocol.js';
import { commonMydMixin } from '@/modules/products/meng-yi-d/utils/common';
import { getSXPrepareMess } from '@/request/interface/common/index';
import { sanXianPageRedirect } from '@/utils/common/global';

export default {
  /**
   * 产品详情页
   * */
  name: 'MYDProDetail',
  mixins: [MxProtocol, commonMydMixin],
  data() {
    return {
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
      // 银行icon
      bankIcon: require('@/assets/imgs/icon/sanxiang.png'),
      // 产品介绍的背景原图icon
      icCir: require('@/assets/imgs/product/ic_cir.png'),
      // 产品name下的填充
      icGapRow: require('@/assets/imgs/product/ic_gap.png'),
      // 提示
      showNotice: false
    };
  },
  created() {
    this.init();
  },

  methods: {
    async init() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      const result = await this.getMydUnionKey();
      result && Promise.all([this.jdugeNewUser(), this.getProtocolList(this.creditPreInfo.productId)]);
    },

    // 立即申请
    async gotoApply() {
      if (!this.isOverLoading) {
        return;
      }
      if (!this.isAgree) {
        this.$notify.info({
          msg: '请阅读并同意协议，并查看注意事项！'
        });
        return;
      }
      const sxPreInfo = (await getSXPrepareMess({ applyUnionKey: this.applyUnionKey }))?.data?.data;
      sxPreInfo && this.mydJump(sxPreInfo);
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

    // 获取协议
    getProtocolText(protocol) {
      let code = protocol.code,
        index = protocol.index;
      this.protocolText = [];
      this.queryProtocolText({ fileType: code }, index);
    },

    /**
     * 1、获取产品信息
     * 2、获取用户的基本信息
     * 3、获取用户的唯一标识
     */
    jdugeNewUser() {
      this.getProduct();
      jdugeNewUserRoute()
        .then(() => {
          this.isOverLoading = true;
        })
        .finally(_ => {
          this.$toasting.hide();
        });
    },

    // 获取底部的产品的介绍
    getProduct() {
      getProduceDetail({ productId: this.creditPreInfo.productId || '1038' })
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

    openNotice() {
      this.showNotice = true;
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
  padding: 155px 20px 25px 20px;
  min-height: 100vh;
  background: #ffffff url('../../../../../assets/imgs/product/bg_prodcut_detail.png') no-repeat top / 100vw;
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
      height: 60px;
      width: 250px;
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
      background: url('../../../../../assets/imgs/product/ic_gap_clo.png') no-repeat left bottom / 92px 4px;
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
</style>
