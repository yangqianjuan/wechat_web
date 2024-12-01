<template>
  <div class="wf-tax-info">
    <van-empty v-if="isShow" description="未获取到登录链接" />
  </div>
</template>
<script>
import { getWFLoginLink, getWFApplyStatus } from '@/request/interface/wf/wf';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { getUnionKey } from '@/request/interface/common/index';
import { SESSION_ID } from '@/utils/common/config';

export default {
  /**
   * 微风税局授权
   * */
  name: 'WfTaxInfo',
  props: {
    cropName: {
      type: String,
      default: ''
    },
    nsrsbh: {
      type: String,
      default: ''
    },
    invoiceCollectionType: {
      type: [Number, null],
      default: null
    },
    collectionType: {
      type: [Number, null],
      default: null
    },
    taxCollectType: {
      type: [String, null],
      default: null
    },
    product: {
      type: [String, null],
      default: null
    },
    callbackUrl: {
      type: [String, null],
      default: null
    }
  },
  data() {
    return {
      loginUrl: '',
      isShow: false,
      // 用户申请的标识
      orderNo: ''
    };
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      if (!sessionStorage.getItem('union_key')) {
        this.getApplyUnionKey();
      } else {
        this.orderNo = sessionStorage.getItem('union_key');
        this.getWFApplyStatus();
      }
    },
    // 我这边再微风企授权回调我的时候更新requestId,然后给你了一个接口一直查询这次申请的状态
    // 传参：orderNo+nsrsbh   0：时候可申请，这种情况是上比单子一个小时超时，或者没申请过，  // 这个才可以进行微风的税局采集
    // 1：授权成功，  // 内部的采集状态
    // 2：采集文件成功，// 内部的采集状态
    // 3：解析文件成功；    // 真正促发我们的业务逻辑是3：解析成功之后
    // 4：数据采集失败(待内部处理)； // 重新微风的授权的登录
    // 5：数据获取失败，需重新授权！ // 重新微风的授权登录

    getWFApplyStatus() {
      let params = {
        nsrsbh: this.nsrsbh,
        orderNo: this.orderNo
      };
      getWFApplyStatus(params)
        .then(res => {
          if (res?.data?.data) {
            const result = res.data.data;
            if (result === '0') {
              this.getLoginLink();
            }
            if (result === '3') {
              // 数据采集成功，YN的状态更新
              this.nextStep();
            }
            // 前端层面的采集之后
            if (result === '1' || result === '2') {
              if (this.product === '1035') {
                this.$router.replace({ path: '/xwe_tax_wf_res' });
              } else if (this.product === '1000') {
                this.$router.replace({ path: '/tax_wf_res' });
              } else if (this.product === '1038') {
                this.$router.replace({ path: '/myd_tax_wf_res' });
              }
            }
            // 采集出错
            if (result === '4' || result === '5') {
              this.getLoginLink();
            }
          } else {
            this.isShow = true;
          }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '登录链接获取异常！' });
        });
    },

    /**
     * 采票类型的处理
     *    要查全部，你就type=all, 如果是发票，你就type=fp,如果是财税，你就type=cs
     *    目前支持：只是采税，或者及采税又采票，不支持只有采票的情况
     * */
    collectionTypeHandler() {
      let type = '';
      if (this.taxCollectType === '1') {
        type = 'cs';
      } else if (this.taxCollectType === '2') {
        type = 'fp';
      } else {
        if (this.invoiceCollectionType === 2 && this.collectionType === 2) {
          type = 'all';
        } else if (this.invoiceCollectionType === 2 && this.collectionType !== 2) {
          type = 'fp';
        } else if (this.invoiceCollectionType !== 2 && this.collectionType === 2) {
          type = 'cs';
        }
      }
      return type;
    },

    // 获取链接
    getLoginLink() {
      if (!this.collectionTypeHandler()) {
        this.$notify.error({ msg: '未获取到税务的采集方式！' });
        return;
      }
      let params = {
        orderNo: this.orderNo,
        companyName: this.cropName,
        // type: this.collectionTypeHandler()
        type: 'all',
        callbackUrl: process.env.VUE_APP_API_DOMAIN + 'front/#/' + this.callbackUrl
      };
      if (params.orderNo && params.companyName) {
        getWFLoginLink(params)
          .then(res => {
            if (res?.data?.data) {
              this.loginUrl = res.data.data;
              setTimeout(() => {
                window.location.href = res.data.data;
              }, 1000);
            } else {
              this.isShow = true;
            }
          })
          .catch(err => {
            this.$notify.error({ msg: err?.data?.msg || '登录链接获取异常！' });
          });
      } else {
        this.$notify.error({ msg: '登录链接获取异常！' });
      }
    },

    async nextStep() {
      let nextPath = await queryNextByUnionKeyAndProdId(this.product);
      this.$router.replace({ path: nextPath });
    },

    /**
     * 获取用户申请信息的标识
     * */
    getApplyUnionKey() {
      let payload = {
        referrer: this.$store.state.referrer || localStorage.getItem('referrer'),
        productId: this.product
      };

      getUnionKey(payload)
        .then(res => {
          if (res?.data?.data) {
            this.orderNo = res.data.data;
            sessionStorage.setItem(SESSION_ID.unionKey, res.data.data);
            if (this.product === '1035') {
              sessionStorage.setItem('applyUnionKey_1035', res.data.data);
            }
            this.getWFApplyStatus();
          } else {
            this.$notify.error({ msg: '未获取到用户申请信息！' });
          }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '未获取到用户申请信息！' });
        });
    }
  }
};
</script>
