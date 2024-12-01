<template>
  <div class="credit-face">
    <van-empty v-if="identifying" :description="identifyText" />
  </div>
</template>
<script>
import { getSalesFacePToken } from '@/controller/faceP.js';
import { getVerification } from '@/request/interface/txQrc/faceP.js';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { SESSION_ID } from '@/utils/common/config.js';

export default {
  /**
   * 销售人脸识别（授信流程）
   *
   * */
  data() {
    return {
      // 今天验证的次数
      liveVerifyTime: 0,
      applyUnionKey: '',
      productId: '',
      identifying: false,
      identifyText: '识别中...',
      redirectUrl: '',
      wxjs_environment: window.__wxjs_environment
    };
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.productId = this.$route.query.productId;
      this.liveVerifyTime = localStorage.creditLiveVerifyTime ? parseInt(localStorage.creditLiveVerifyTime) : 0;
      this.liveVerifyTime ? this.getVerifyResult() : this.gotoLivingVerify();
    },

    /**
     * 获取人脸的跳转路径，对接腾讯的人脸识别
     * 获取的结果中有跳转到人脸识别的连接地址（url， BizToken， "RequestId）
     * */
    gotoLivingVerify() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      if (this.liveVerifyTime >= 50) {
        this.$toasting.hide();
        this.$notify.error({
          msg: '活体识别次数过多，请明天再尝试！'
        });
        return false;
      }
      let liveVerifyTime = this.liveVerifyTime;
      window.localStorage.setItem('creditLiveVerifyTime', liveVerifyTime + 1);
      getSalesFacePToken()
        .then(res => {
          this.redirectUrl = res;
          this.redirectUrl &&
            setTimeout(() => {
              window.location.href = this.redirectUrl;
            }, 500);
        })
        .catch(err => {
          this.$notify.error({
            msg: err?.data?.msg || '获取人脸识别链接失败！'
          });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    /**
     * 获取人脸识别的结果
     *
     */
    getVerifyResult() {
      this.$toasting.show({ message: '获取结果中', forbidClick: true });
      let bizToken = this.getCookie('tencent_biz_token');
      let faceStage = 'OPENYARD';
      // OPENYARD 是销售开码的标识
      getVerification({ bizToken, faceStage, searchType: 'sales' })
        .then(async res => {
          if (res?.data?.success) {
            // {"code":"00000","data":{"appId":"TIDAA6wR","bestFrameUrl":"https://dev-xm-1256921822.cos.ap-shanghai.myqcloud.com/faceid/253_0Yrp1GdOGH4Msr0a.jpg","bizSeqNo":"23090620001184432419501580519376","liveRate":"99","livenessVideoUrl":"https://dev-xm-1256921822.cos.ap-shanghai.myqcloud.com/faceid/253_gXHkYOx6gkg8l63Q.avi","occurredTime":"20230906195009","orderNo":"253","photo":""},"errorData":null,"msg":"成功","respid":"744c8056f7fc4298","success":true}
            this.$notify.info({ msg: '识别成功！' });
            window.localStorage.removeItem('liveVerifyTime');
            if (this.wxjs_environment == 'miniprogram') {
              let nextPath = await queryNextByUnionKeyAndProdId(1000000);
              this.callBackRouter !== 'null' && (nextPath = `/${this.callBackRouter}`);
              this.$router.replace({
                path: nextPath,
                query: { productId: this.$route.query.productId, referrer: this.$route.query.referrer }
              });
            } else {
              this.$router.replace({
                path: '/auth_product_poster',
                query: { productId: this.$route.query.productId, referrer: this.$route.query.referrer }
              });
            }

            this.clear();
          } else {
            // 验证失败重新验证
            this.$notify.error({ msg: '活体识别失败！' });
            setTimeout(() => {
              this.gotoLivingVerify();
            }, 1500);
          }
        })
        .catch(err => {
          this.$toasting.error({ msg: '获取失败，请重新识别' });
          setTimeout(() => {
            this.gotoLivingVerify();
          }, 1500);
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // 清除
    clear() {
      // 清空
      window.localStorage.removeItem('creditLiveVerifyTime');
      this.setCookie('tencent_biz_token', '');
      window.sessionStorage.removeItem(SESSION_ID.bizUrl);
    }
  }
};
</script>
