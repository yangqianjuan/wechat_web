import {
  checkWithdrawBefore,
  checkWithdrawBeforeResult,
  checkWithdrawPassAfterPreBorrowingApply
} from '@/utils/common/global';
import { BORROW_ROUTER, CARD_CONFIG_ROUTER } from '@/utils/common/config.js';

export default {
  // 小萌
  methods: {
    LoanStepOne(params) {
      if (params.isOnEffect) {
        this.$notify.info({
          msg: '额度已失效，请重新申请授信！'
        });
        this.$toasting.hide();
        return;
      }
      if (params.credit.agreeProduct === 1000) {
        if (params.isBankOnEffect) {
          this.$notify.info({
            msg: '额度已失效，请重新申请授信！'
          });
          this.$toasting.hide();
          return;
        }
        if (params.isBankQuotaPause) {
          this.$notify.info({
            msg: '您的额度已被银行冻结，暂不支持提款！'
          });
          this.$toasting.hide();
          return;
        }
      }
      if (params.isQuotaPause) {
        this.$notify.info({
          msg: '您的额度已冻结，暂不支持提款！'
        });
        this.$toasting.hide();
        return;
      }
      if (params.credit.avaliableCredit <= 0) {
        this.$notify.info({
          msg: '可用额度为0，暂时不可以借款！'
        });
        this.$toasting.hide();
        return;
      }

      this.productId === 1000 && params.applyUnionKey
        ? this.withdrawHandler(params.applyUnionKey, params.paramsJump)
        : this.borrowJump(params.paramsJump);
    },
    /**
     * 提款校验 （xmkd）
     *      0, "拒绝" 1, "通过"  2, "补件"  3,"税务授权"  4,"存在处于借款审核中的件" 5、"当前正在校验中，"
     * */
    withdrawHandler(applyUnionKey, paramsJump) {
      // 获取校验结果
      checkWithdrawBeforeResult(applyUnionKey)
        .then(res => {
          res?.data?.data
            ? this.checkWithdrawResponse(res.data.data, applyUnionKey, paramsJump)
            : this.$toasting.hide();
        })
        .catch(err => {
          this.$toasting.hide();
          this.$notify.error({ msg: err?.data?.msg || '提款校验失败！' });
        });
    },

    /**
     * 提款校验结果的处理
     * */
    checkWithdrawResponse(response, applyUnionKey, paramsJump, isGetVerify) {
      if (!response) {
        this.$toasting.hide();
        this.$notify.error({ msg: '提款校验失败！' });
        return;
      }
      if (response.verifyRsult === 6) {
        if (!isGetVerify) {
          // 触发提款校验
          checkWithdrawBefore(applyUnionKey)
            .then(res => {
              res?.data?.data
                ? this.checkWithdrawResponse(res.data.data, applyUnionKey, paramsJump, 'no')
                : this.$notify.error({ msg: '提款校验失败！' });
            })
            .catch(err => {
              this.$notify.error({ msg: err?.data?.msg || '提款校验失败！' });
            })
            .finally(_ => {
              this.$toasting.hide();
            });
        } else if (isGetVerify === 'no') {
          this.$toasting.hide();
          this.linesFreezeText = '当前正在校验中，请等待！';
          this.$notify.info({ msg: this.linesFreezeText, duration: 0 });
        }
      } else {
        this.$toasting.hide();
        if (response.verifyRsult === 0) {
          this.linesFreezeText = response?.reason[0] || '提款校验失败！';
          this.$notify.info({ msg: this.linesFreezeText, duration: 0 });
        } else if (response.verifyRsult === 1) {
          this.borrowJump(paramsJump);
        } else if (response.verifyRsult === 3) {
          paramsJump.path = '/tax_info';
          paramsJump.checkWithdrawType = 'borrow';
          this.borrowJump(paramsJump);
        } else if (response.verifyRsult === 4) {
          this.linesFreezeText = response?.reason[0] || '存在处于借款审核中的件！';
          this.$notify.info({ msg: this.linesFreezeText, duration: 0 });
        } else if (response.verifyRsult === 5) {
          this.linesFreezeText = response?.reason[0] || '当前正在校验中，请等待...';
          this.$notify.info({ msg: this.linesFreezeText, duration: 0 });
        } else {
          this.$notify.error({ msg: `提款校验匹配出错，状态码--${response.verifyRsult}` });
        }
      }
    },

    /**
     * 获取放款准备信息
     * */
    async preBorrowApplyHandler(applyUnionKey, productId, paramsJump) {
      try {
        productId === 1000 && applyUnionKey && (await this.borrowRecordHandler(applyUnionKey, paramsJump));
        return Promise.resolve(true);
      } catch (e) {
        this.$toasting.hide();
        this.$notify.error({ msg: e?.data?.msg || '放款准备信息获取失败！' });
        return Promise.reject(false);
      }
    },
    /**
     * 新加的功能，支用功能的添加，首页的功能，用户点击提款的时候，会进行提款校验，校验通过之后也就是状态为1的时候，获取放款准备信息
     * 提款校验通过之后，获取放款准备信息
     *  放款准备接口：
     *      res：{
     *            needGuaranteeConfirmOrder: 1 || 0; 1页面跳转到担保费页面（携带担保费的信息），0页面按照以前的逻辑正常跳转
     "applyUnionKey": 0, "bankCardNo": "",  "creditNo": "",
     "guaranteeFee": 0, "loanAmount": 0, "loanNo": ""
     *
     * }
     * */

    borrowRecordHandler(applyUnionKey, paramsJump) {
      return new Promise((resolve, reject) => {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        checkWithdrawPassAfterPreBorrowingApply(applyUnionKey)
          .then(res => {
            if (res?.data?.data) {
              res.data.data.needGuaranteeConfirmOrder === 1
                ? this.$router.replace({
                    path: '/pay_guarantee_cost',
                    query: { applyUnionKey: res.data.data.applyUnionKey }
                  })
                : resolve('ok');
            } else {
              reject({ data: { msg: '放款准备信息获取失败！' } });
            }
          })
          .catch(err => {
            reject({ data: { msg: err?.data?.msg || '放款准备信息获取失败！' } });
          });
      });
    },

    formateMenuConfig(credit) {
      try {
        this.$store.commit('setApplyUnionKey', credit.applyUnionKey?.toString());
        this.$store.commit('setProductId', credit.agreeProduct);
        this.$store.commit('setReferrer', credit.referrerId);
        sessionStorage.setItem('creditNo', credit.creditNo);
        localStorage.referrer = credit.referrerId;
        localStorage.productId = credit.agreeProduct;
        this.applyUnionKey = credit.applyUnionKey?.toString();
        if (String(this.productId) !== '1038') {
          if (String(this.productId) === '1035') {
            this.cardConfig[0].targetPath = `/xwe_repay_acount?creditNo=${credit.creditNo}&productId=${credit.agreeProduct}`;
            this.cardConfig[4].targetPath = `/xwe_bank_card_mana?applyUnionKey=${credit.applyUnionKey?.toString()}&productId=${
              credit.agreeProduct
            }`;
          } else {
            this.cardConfig[0].targetPath = `/repay_acount?creditNo=${credit.creditNo}&productId=${credit.agreeProduct}`;
            this.cardConfig[4].targetPath = `/bank_card_mana?applyUnionKey=${credit.applyUnionKey?.toString()}&productId=${
              credit.agreeProduct
            }`;
          }
        }
      } catch (error) {
        console.log(error);
      }
    },

    borrowJump(params) {
      let query = {
        productId: params?.productId,
        applyUnionKey: params?.applyUnionKey
      };
      if (params?.checkWithdrawType) query.checkWithdrawType = params.checkWithdrawType;
      this.$router.push({
        path: params?.path,
        query: query
      });
    },

    getCreditByUnionKey(creditInfoArr = []) {
      let creditInfo = creditInfoArr.find(credit => {
        return credit.applyUnionKey.toString() === this.applyUnionKey;
      });
      if (creditInfo) {
        return creditInfo;
      } else {
        this.hasSelectCredit = false;
      }
    },

    singleCreditHandler(creditInfo) {
      if (!creditInfo) {
        return;
      }

      let productId = String(creditInfo.agreeProduct);

      switch (productId) {
        case '1155': {
          // beijing -- bank need jump page
          this.loadBeijingHome(creditInfo);
          break;
        }

        default: {
          // default product
          this.nowCreditInfo = creditInfo;
          this.hasSelectCredit = true;
          this.productId = creditInfo.agreeProduct;
          this.cardConfig = CARD_CONFIG_ROUTER[this.productId];
          this.borrowPath = BORROW_ROUTER[this.productId];
          this.formateMenuConfig(creditInfo || {});
        }
      }
    }
  }
};
