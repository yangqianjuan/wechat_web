import { getWFLoginResult, getWFApplyStatus, getWFLoginLink } from '@/request/interface/wf/wf.js';
import { getCorpBaseInfo } from '@/request/interface/impower/UserInfo';
import { jdugeNewUserRoute } from '@/controller/userController';
import { getUnionKey, getProductTaxConfig } from '@/request/interface/common/index';
import { SESSION_ID } from '@/utils/common/config';
export default {
  data() {
    return {
      statusUrlSuccess: require('@/assets/imgs/icon/ic_result.png'),
      statusUrlError: require('@/assets/imgs/icon/ic_cre_fail.png'),
      retCode: '',
      loginStatus: 'pending',
      isAgree: '',
      isShowProtocol: false,
      userInfo: {},
      companyName: '',
      msg: undefined,
      loginSuccessIcon: require('@/assets/imgs/tax/success.svg'),
      // 用户申请的标识
      orderNo: ''
    };
  },

  created() {
    this.init();
  },

  methods: {
    // 初始化
    async init(requestType) {
      if (requestType === 'click') {
        if (!this.jdeugeProtocoIsAgree()) {
          return;
        }
      }
      let unionKeyResult = true;
      this.getMydUnionKey && (unionKeyResult = await this.getMydUnionKey());
      if (!unionKeyResult) {
        return;
      }
      this.$toasting.show({ message: '加载中', forbidClick: true });
      if (sessionStorage.getItem('union_key')) {
        this.getLoginResult();
      } else {
        this.getApplyUnionKey();
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
      if (sessionStorage.getItem('nsrsbh')) {
        this.getWFApplyStatusOne();
      } else {
        this.getWFApplyStatusTwo();
      }
    },

    async getWFApplyStatusOne() {
      try {
        let params = {
          nsrsbh: sessionStorage.getItem('nsrsbh'),
          orderNo: sessionStorage.getItem('union_key') || this.orderNo
        };
        const wfApplyStatus = (await getWFApplyStatus(params))?.data?.data;
        if (wfApplyStatus) {
          this.getUserInfo();
          this.applyStatusHandler(wfApplyStatus);
        } else {
          this.loginStatus = 'reject';
        }
      } catch (e) {
        this.loginStatus = 'reject';
        this.$notify.error({
          msg: e?.data?.msg || '授权链接获取异常！'
        });
      } finally {
        this.$toasting.hide();
      }
    },

    async getWFApplyStatusTwo() {
      try {
        const corpBaseInfo = (await getCorpBaseInfo())?.data?.data;
        if (corpBaseInfo) {
          this.companyName = corpBaseInfo.corpName;
          this.getUserInfo('no');
          let params = {
            nsrsbh: corpBaseInfo.corpId,
            orderNo: sessionStorage.getItem('union_key') || this.orderNo
          };
          const wfApplyStatus = (await getWFApplyStatus(params))?.data?.data;
          if (wfApplyStatus) {
            this.applyStatusHandler(wfApplyStatus);
          } else {
            this.loginStatus = 'reject';
          }
        }
      } catch (e) {
        this.loginStatus = 'reject';
        this.$notify.error({
          msg: e?.data?.msg || '授权链接获取异常！'
        });
      } finally {
        this.$toasting.hide();
      }
    },

    /**
     *
     * 获取登录授权的结果
     *
     * */
    getLoginResult() {
      let message = this.getUrlParam('message');
      let params = { message };
      if (params.message) {
        this.getLoginResultOne(params);
      } else {
        this.getLoginResultTwo();
      }
    },

    getLoginResultOne(params) {
      getWFLoginResult(params)
        .then(res => {
          if (res?.data?.success) {
            this.getWFApplyStatus();
          } else {
            this.loginStatus = 'reject';
          }
        })
        .catch(err => {
          this.$notify.error({
            msg: err?.data?.msg || '授权结果获取异常！'
          });
          this.loginStatus = 'reject';
        })
        .finally(_ => {
          this.$toasting.hide();
        });
    },

    getLoginResultTwo() {
      getCorpBaseInfo()
        .then(res => {
          if (res?.data?.data) {
            let params = {
              nsrsbh: res.data.data.corpId,
              orderNo: sessionStorage.getItem('union_key') || this.orderNo
            };
            this.getLoginResultOne(params);
          } else {
            this.$toasting.hide();
          }
        })
        .catch(err => {
          this.loginStatus = 'reject';
          this.$notify.error({
            msg: err?.data?.msg || '授权链接获取异常！'
          });
        })
        .finally(_ => {
          this.$toasting.hide();
        });
    },

    // 授信申请的结果的处理
    applyStatusHandler(data) {
      if (data === '0') {
        this.getLoginLink();
      }
      if (data === '3') {
        this.loginStatus = 'resolve';
      }
      // 前端层面的采集之后
      if (data === '1' || data === '2') {
        this.loginStatus = 'pending';
      }
      // 采集出错
      if (data === '4' || data === '5') {
        this.getLoginLink();
      }
    },

    /**
     * 采票类型的处理
     *    要查全部，你就type=all, 如果是发票，你就type=fp,如果是财税，你就type=cs
     *    目前支持：只是采税，或者及采税又采票，不支持只有采票的情况
     * */
    collectionTypeHandler(invoiceCollectionType, collectionType, taxCollectType) {
      let type = '';
      if (taxCollectType === '1') {
        type = 'cs';
      } else if (taxCollectType === '2') {
        type = 'fp';
      } else {
        if (invoiceCollectionType === 2 && collectionType === 2) {
          type = 'all';
        } else if (invoiceCollectionType === 2 && collectionType !== 2) {
          type = 'fp';
        } else if (invoiceCollectionType !== 2 && collectionType === 2) {
          type = 'cs';
        }
      }
      return type;
    },

    // 获取登录的链接
    getLoginLink() {
      getCorpBaseInfo()
        .then(res => {
          if (res?.data?.data) {
            let { corpId, corpName } = res.data.data;
            this.taxStatusControl(corpId, corpName);
          }
        })
        .catch(err => {
          this.loginStatus = 'reject';
          this.$notify.error({
            msg: err?.data?.msg || '授权链接获取异常！'
          });
        });
    },

    // 切换协议的控制状态
    switchShowProtocol() {
      this.isShowProtocol = !this.isShowProtocol;
    },

    // 获取用户信息
    getUserInfo(isNeed) {
      jdugeNewUserRoute()
        .then(user => {
          this.userInfo = user;
          isNeed !== 'no'
            ? getCorpBaseInfo()
                .then(res => {
                  if (res?.data?.data) {
                    this.companyName = res.data.data.corpName;
                  }
                })
                .catch(err => {
                  this.$notify.error({
                    msg: err?.data?.msg || '授权链接获取异常！'
                  });
                })
            : '';
        })
        .catch(err => {
          this.$notify.error({
            msg: err?.data?.msg || '用户信息获取失败！'
          });
        });
    },

    // 判断用户是否同意并阅读协议
    jdeugeProtocoIsAgree() {
      if (!this.isAgree) {
        this.$notify.info({
          msg: '请阅读并同意协议！'
        });
        return false;
      }
      if (!this.protocolList[0].isReadOver) {
        this.$notify.info({
          msg: '请阅读授信合同！'
        });
        this.isShowProtocol = true;
        return false;
      }
      return true;
    },

    /**
     * 获取用户申请信息的标识
     * */
    getApplyUnionKey() {
      let payload = {
        referrer: this.$store.state.referrer || localStorage.getItem('referrer'),
        productId: this.$store.state.productId || localStorage.getItem('productId')
      };
      getUnionKey(payload)
        .then(res => {
          if (res?.data?.data) {
            this.orderNo = res.data.data;
            sessionStorage.setItem(SESSION_ID.unionKey, res.data.data);
            this.getLoginResult();
          } else {
            this.$notify.error({ msg: '未获取到用户申请信息！' });
          }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '未获取到用户申请信息！' });
        });
    },

    /**
     * 税局采集方式的控制
     *      invoiceCollectionType 采票方式 null 不采 1 自有 2 微风企
     *      判断顺序 先判断是否跳过----》在判断是否可以采集----》在判断采集的方式
     */
    async taxStatusConfig(corpId, corpName, productId) {
      try {
        let params = {
          corpId: corpId,
          productId: productId
        };
        const productTaxConfig = (await getProductTaxConfig(params))?.data?.data;
        if (productTaxConfig) {
          if (
            !this.collectionTypeHandler(
              productTaxConfig.invoiceCollectionType,
              productTaxConfig.collectionType,
              productTaxConfig.taxCollectType
            )
          ) {
            this.$notify.error({ msg: '未获取到税务的采集方式！' });
            return;
          }
          let params = {
            orderNo: sessionStorage.getItem('union_key') || this.orderNo,
            companyName: corpName,
            // type: this.collectionTypeHandler(
            //   productTaxConfig.invoiceCollectionType,
            //   productTaxConfig.collectionType,
            //   productTaxConfig.taxCollectType
            // )
            type: 'all',
            callbackUrl: process.env.VUE_APP_API_DOMAIN + 'front/#/' + this.callbackUrl
          };
          const link = (await getWFLoginLink(params))?.data?.data;
          if (link) {
            setTimeout(() => {
              window.location.href = link;
            }, 1000);
          } else {
            this.loginStatus = 'reject';
          }
        } else {
          this.$notify.error({
            msg: '未获取到产品的税局配置信息！'
          });
        }
      } catch (e) {
        this.$notify.error({
          msg: e?.data?.msg || '未获取到产品的税局配置信息！'
        });
      }
    }
  }
};
