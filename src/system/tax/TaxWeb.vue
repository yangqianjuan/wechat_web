<template>
  <div class="tax-web-system">
    <iframe ref="taxWebSystem" id="tax-web" width="100%" height="100%" style="border:unset" :src="link" @load="loaded">
    </iframe>
    <XweMixin v-if="isOpenXwe" @isRead="isReadHandler"></XweMixin>
    <Modal
      v-show="phoneInputStatus"
      title="企业办税人手机号"
      :isShowCancel="false"
      @ok="phoneInputHandler('formDynamic')"
    >
      <div class="phone-input" style="padding: 8px 16px;">
        <Form :model="taxDatCollect" :label-width="70" :rules="ruleValidate" ref="formDynamic" label-position="left">
          <FormItem label="手机号：" prop="phone">
            <i-input v-model="taxDatCollect.phone"></i-input>
          </FormItem>
        </Form>
      </div>
    </Modal>
  </div>
</template>
<script>
import { getWFLoginLink } from '@/request/interface/wf/wf';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import XweMixin from '@/system/tax/mixin/XweMixin.vue';
import Modal from '@/modules/products/meng-yi-d/page/common/Modal.vue';
import { updateCorpBaseInfoHandler } from '@/utils/tax/taxCommon';
export default {
  // 税局
  name: 'TaxWeb',
  inject: ['initBuildParams'],
  props: {
    productId: {
      type: String,
      default: () => {
        return '';
      }
    },
    referrer: {
      type: String,
      default: () => {
        return '';
      }
    }
  },
  components: {
    Modal,
    XweMixin
  },
  data() {
    const validatePhone = (rule, value, callback) => {
      const reg = new RegExp(/^1\d{10}$/);
      if (reg.test(value)) {
        callback();
      } else {
        callback(new Error('手机号格式不正确'));
      }
    };
    return {
      link: '',
      isOpenXwe: false,
      phoneInputStatus: false,
      taxDatCollect: {
        phone: ''
      },
      ruleValidate: {
        phone: [
          { required: true, message: '请填写手机号' },
          { trigger: 'blur', validator: validatePhone }
        ]
      },
      callbackUrl: ''
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      window.addEventListener('message', this.handleTaxMessage);
      this.$on('hook:beforeDestory', () => {
        window.removeEventListener('message', this.handleTaxMessage);
      });
      this.paramsBuildHandler();
    },

    buildOtherLink() {
      let params = {
        orderNo: this.initBuildParams.applyUnionKey,
        companyName: this.initBuildParams.companyName,
        type: 'all',
        callbackUrl: this.buildCallbackUrl()
      };
      this.$toasting.show({ message: '加载中', forbidClick: true });
      getWFLoginLink(params)
        .then(res => {
          if (res?.data?.data) {
            this.link = res.data.data;
          }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '登录链接获取异常！' });
        })
        .finally(_ => {
          this.$toasting.hide();
        });
    },

    buildCallbackUrl() {
      let url = '';
      const paramsRoute = this.$route.query;
      const productId = this.initBuildParams?.productId;
      switch (productId) {
        case '1000':
          if (paramsRoute?.checkWithdrawType === 'borrow') {
            url =
              process.env.VUE_APP_API_DOMAIN +
              'front/#/loans_base_info?productId=' +
              paramsRoute.productId +
              '&applyUnionKey=' +
              paramsRoute.applyUnionKey;
          } else {
            url = process.env.VUE_APP_API_DOMAIN + 'front/#/replenish_file_upload';
          }
          break;
        case '1035':
          url = process.env.VUE_APP_API_DOMAIN + 'front/#/xwe_credut_result';
          break;
        case '1038':
          if (this.$route.query.creditType === 'loan') {
            url = process.env.VUE_APP_API_DOMAIN + 'front/#/';
          } else {
            url =
              process.env.VUE_APP_API_DOMAIN +
              'front/#/myd_replenish_file_upload?referrer=' +
              this.referrer +
              '&productId=' +
              productId;
          }
          break;
        case '1155':
          url =
            process.env.VUE_APP_API_DOMAIN +
            'front/#/bjb_base_info?referrer=' +
            this.referrer +
            '&productId=' +
            productId;
          break;
        default:
          url = process.env.VUE_APP_API_DOMAIN + 'front/#/';
          break;
      }
      return url;
    },

    loaded() {
      this.$toasting.hide();
      const iframe = this.$refs.taxWebSystem.contentWindow;
      iframe.postMessage(
        {
          type: 'front',
          platform: 'phone',
          contentHeight: '65%'
        },
        '*'
      );
    },

    // 参数的构建
    paramsBuildHandler() {
      try {
        // 测试
        // this.initBuildParams.creditNo = '91610131MA6URD2HX6';
        // const admin = 'http://localhost:3000/';
        // console.log('ddddd', this.initBuildParams);

        // this.$toasting.show({ message: '加载中', forbidClick: true });
        if (this.initBuildParams?.productId === '1035') this.isOpenXwe = true;
        // const admin = process.env.VUE_APP_API_DOMAIN;
        // const basePath = 'xmtax/#/login';
        // const params = `?creditNo=${this.initBuildParams.creditNo}&webAuthorizeChannelCode=xmjr&nonce=${JSON.stringify({
        //   code: 'XM-100001',
        //   data: { ...this.initBuildParams, part_org: undefined, credit_no: undefined }
        // })}`;
        // this.link = admin + basePath + params;
        this.buildOtherLink();
      } catch (error) {
        this.$toasting.hide();
        console.log(error);
      }
    },

    // iframe的监听
    handleTaxMessage(event) {
      if (event?.data?.type === 'close-tax') this.moreProductJump();
    },

    moreProductJump() {
      const productId = this.initBuildParams?.productId;
      switch (productId) {
        case '1000':
          this.commonJumpPath(productId);
          break;
        case '1035':
          this.xweJump(productId);
          break;
        case '1038':
          this.phoneInputStatus = true;
          break;
        case '1155':
          this.beijingJumpPath(productId);
          break;
        default:
          this.commonJumpPath(productId);
          break;
      }
    },

    /**
     * 广发-流转
     * */
    async xweJump(productId) {
      let nextPath = await queryNextByUnionKeyAndProdId(productId);
      setTimeout(() => {
        this.$router.replace({ path: nextPath, query: { comeFrom: 'xwe_company_approve' } });
      }, 1500);
    },

    /**
     * 三湘-流转
     * */
    async medJump(productId) {
      this.$route.query.creditType === 'loan'
        ? this.$router.replace({
            path: '/'
          })
        : this.$router.replace({
            path: '/myd_replenish_file_upload',
            query: { referrer: this.referrer, productId }
          });
    },

    /**
     * 浦发-流转
     * */
    commonJumpPath(productId) {
      const paramsRoute = this.$route.query;
      if (paramsRoute?.checkWithdrawType === 'borrow') {
        this.$router.replace({
          path: '/loans_base_info',
          query: { productId: paramsRoute.productId, applyUnionKey: paramsRoute.applyUnionKey }
        });
      } else {
        this.$router.replace({ path: '/replenish_file_upload' });
      }
    },

    /**
     * 北京-流转
     * */
    async beijingJumpPath(productId) {
      let nextPath = await queryNextByUnionKeyAndProdId(productId);
      setTimeout(() => {
        this.$router.replace({ path: nextPath, query: { productId, referrer: this.referrer } });
      }, 1500);
      // this.$router.replace({
      //   path: '/bjb_base_info',
      //   query: { productId, referrer: this.referrer }
      // });
    },

    isReadHandler() {
      this.isOpenXwe = false;
    },

    phoneInputHandler(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.updateUserCorpBaseInfo();
        }
      });
    },

    /**
     * 更新税局的信息
     * */
    updateUserCorpBaseInfo() {
      const params = {
        nationalTaxAccount: this.initBuildParams.creditNo,
        nationalTaxPassword: 'xmjr',
        id: this.initBuildParams.corpId,
        taxPhone: this.taxDatCollect.phone,
        applyUnionKey: this.initBuildParams.applyUnionKey
      };
      this.$toasting.show({ message: '加载中', forbidClick: true });
      updateCorpBaseInfoHandler(params, this, config => {
        this.phoneInputStatus = !this.phoneInputStatus;
        this.$toasting.hide();
        this.medJump();
      });
    }
  }
};
</script>
<style lang="scss">
.tax-web-system {
  width: 100vw;
  height: 100vh;
}
</style>
