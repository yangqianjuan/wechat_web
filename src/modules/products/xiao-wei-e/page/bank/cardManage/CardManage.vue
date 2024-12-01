<template>
  <div v-if="isLoading">
    <div class="bank-card-mana-wrapper" v-if="bankCardList.length">
      <!-- 银行卡的列表·展示 -->
      <div class="bank-card-list-wrapper">
        <bank-card-item
          class="bank-card-item"
          :loading="itemIsLoading"
          @changeBankCard="changeBankCard"
          v-for="bankcard in bankCardList"
          :key="bankcard.id"
          :bankcardConfig="bankcard"
        ></bank-card-item>
      </div>
      <van-button class="add-card-btn foot-operate-btn" type="primary" @click="gotoAddBankCard">添加银行卡</van-button>

      <div v-if="isShowMask">
        <v-change-eacount-sms
          :phoneNum="phoneNum"
          :isShowMask.sync="isShowMask"
          @hideMask="switchMask"
          @smsVerify="smsVerify"
        ></v-change-eacount-sms>
      </div>
      <van-dialog v-model="showModel" title="变更申请" showCancelButton @confirm="useCardChange" @cancel="cancel">
        <div class="change-card">您确定将您当前使用的卡变更到{{bankCard.bankName}}的这张卡吗？</div>
      </van-dialog>
    </div>
    <div v-else>
      <van-empty description="暂无绑定的银行卡" />
    </div>
  </div>
</template>
<script>
import BankCardItem from '../components/BankCardItem.vue';
import { queryBankCardListByProdId } from '@/controller/bank.js';
import mxBankCardChangeMixin from '../components/mxBankCardChange';
import ChaneEacountSmsVeriyf from '../components/ChaneEacountSmsVeriyf';
import { getQueryWaitBankChangeRecord, gfOtherBankCardChange } from '@/request/interface/gf/common';
import { getGfSessionId } from '@/controller/common.js';
import { SESSION_ID } from '@/utils/common/config';
export default {
  /**
   * 银行卡管理列表
   *
   * */
  data() {
    return {
      addCardPath: '/xwe_bind_bank_card',
      bankCardList: [],
      applyUnionKey: '',
      productId: '',
      isShowMask: false,
      itemIsLoading: false,
      showModel: false,
      phoneNum: '',
      bankCard: {},
      isBtnLoading: false,
      isLoading: false
    };
  },
  components: {
    'bank-card-item': BankCardItem,
    'v-change-eacount-sms': ChaneEacountSmsVeriyf
  },
  mixins: [mxBankCardChangeMixin],
  created() {
    this.init();
  },
  methods: {
    init() {
      this.applyUnionKey = this.getUrlParam('applyUnionKey');
      this.productId = this.getUrlParam('productId');
      if (this.applyUnionKey && this.productId) {
        getGfSessionId({ applyUnionKey: this.applyUnionKey, type: 5 });
        this.getBankCardList();
      } else {
        this.$notify.error({ msg: '银行卡信息查询失败！' });
      }
    },

    // 查询绑卡的列表
    getBankCardList() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      queryBankCardListByProdId({ productId: this.productId })
        .then((bankCardList) => {
          this.isLoading = true;
          this.bankCardList = bankCardList;
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '银行卡信息查询失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    /**
     * 添加银行卡
     * */
    gotoAddBankCard() {
      getQueryWaitBankChangeRecord({ applyUnionKey: this.applyUnionKey })
        .then((res) => {
          // console.log("dadada", res);
          if (!res?.data?.data) {
            this.$router.push({
              path: 'xwe_bind_bank_card',
              query: { applyUnionKey: this.applyUnionKey }
            });
          } else {
            this.$router.push({
              path: 'xwe_bind_bank_card_result',
              query: {
                changeNo: res?.data?.data?.id,
                applyUnionKey: res?.data?.data?.applyUnionKey
              }
            });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '银行卡信息查询失败！' });
        });
    },

    // 更换银行卡
    changeBankCard(bankCard) {
      if (this.isBtnLoading) {
        return;
      }
      this.showModel = true;
      this.bankCard = bankCard;
    },

    // 银行卡的变更
    useCardChange() {
      getQueryWaitBankChangeRecord({ applyUnionKey: this.applyUnionKey })
        .then((res) => {
          if (!res?.data?.data) {
            let changeParams = {
              applyUnionKey: this.applyUnionKey,
              bankCardNo: this.bankCard.bankCardNo,
              bankCardReservePhone: this.bankCard.bankCardReservePhone,
              bankName: this.bankCard.bankName,
              bankNo: this.bankCard.bankNo,
              productId: 1035,
              verifyCode: '',
              smsSerialNo: '',
              sessionId: sessionStorage.getItem(SESSION_ID.changeCardSessionId)
            };
            if (this.bankCard.bankNo === '306581000003') {
              this.itemIsLoading = true;
              this.phoneNum = this.bankCard.bankCardReservePhone;
              this.isShowMask = true;
            } else {
              // 本行卡不需要验证码
              this.$toasting.show({ message: '申请中', forbidClick: true });
              gfOtherBankCardChange(changeParams)
                .then((res) => {
                  res?.data?.data && this.bindCardStatusHandler(res.data.data);
                })
                .catch((err) => {
                  this.$notify.error({ msg: err?.data?.msg || '绑定银行卡失败！' });
                })
                .finally(() => {
                  this.$toasting.hide();
                });
            }
          } else {
            this.$router.push({
              path: 'xwe_bind_bank_card_result',
              query: {
                changeNo: res?.data?.data?.id,
                applyUnionKey: res?.data?.data?.applyUnionKey
              }
            });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '银行卡信息查询失败！' });
        });
    },

    // 取消
    cancel() {
      this.showModel = false;
    },

    // 切换手机验证码的状态
    switchMask() {
      this.itemIsLoading = false;
    },

    // 验证码填写完毕 --- 换绑银行卡
    smsVerify(data) {
      // console.log("获取的颜怎吗", data);
      let changeParams = {
        applyUnionKey: this.applyUnionKey,
        bankCardNo: this.bankCard.bankCardNo,
        bankCardReservePhone: this.bankCard.bankCardReservePhone,
        bankName: this.bankCard.bankName,
        bankNo: this.bankCard.bankNo,
        productId: 1035,
        verifyCode: data.code,
        smsSerialNo: data.smsSerialNo,
        sessionId: sessionStorage.getItem(SESSION_ID.changeCardSessionId)
      };
      // 本行卡不需要验证码
      this.$toasting.show({ message: '申请中', forbidClick: true });
      gfOtherBankCardChange(changeParams)
        .then((res) => {
          res?.data?.data && this.bindCardStatusHandler(res.data.data);
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '换绑银行卡失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // 绑卡的（结果）状态的处理
    bindCardStatusHandler(data) {
      if (data.code === '1001') {
        // 本行换本行
        if (data.result === '1') {
          // 添加银行卡成功 --- 银行卡列表
          this.$notify.success({ msg: '添加银行卡成功！' });
          setTimeout(() => {
            this.$router.replace({
              path: 'xwe_bank_card_mana',
              query: {
                applyUnionKey: this.$route.query.applyUnionKey,
                productId: '1035'
              }
            });
          }, 1000);
        } else if (data.result === '0') {
          this.$notify.error({ msg: '添加银行卡失败，请检查自己信息，是否有误！' });
        }
      } else if (data.code === '1002') {
        // 去开户 ---
        this.$notify.info({ msg: '暂不支持，本行卡变他行卡的操作！' });

        // 本行变他行 --- 去到开户页面
      } else if (data.code === '1003') {
        // 本行变他行 --- 电子户确认页面
        this.$notify.info({ msg: '暂不支持，本行卡变他行卡的操作！' });
      } else if (data.code === '1004') {
        // 他行变本行
        // --- 电子户信息展示页 --- 自动确认开通
        this.$router.replace({
          path: '/xwe_bank_info',
          query: {
            productId: '1035',
            applyUnionKey: this.$route.query.applyUnionKey,
            bindCardInfo: JSON.stringify(data.bancardInfo)
          }
        });
      } else if (data.code === '1005') {
        // 他行变他行
        if (data.result === '1') {
          // 添加银行卡成功 --- 银行卡列表
          this.$notify.success({ msg: '添加银行卡成功！' });
          setTimeout(() => {
            this.$router.replace({
              path: 'xwe_bank_card_mana',
              query: {
                applyUnionKey: this.$route.query.applyUnionKey,
                productId: '1035'
              }
            });
          }, 1000);
        } else if (data.result === '0') {
          this.$notify.error({ msg: '添加银行卡失败，请检查自己信息，是否有误！' });
        } else if (data.result === '2') {
          this.$toasting.show({ message: '获取结果中', forbidClick: true });
          getQueryWaitBankChangeRecord({ applyUnionKey: this.$route.query.applyUnionKey })
            .then((res) => {
              if (res?.data?.data) {
                this.$router.push({
                  path: 'xwe_bind_bank_card_result',
                  query: {
                    changeNo: res.data.data.id,
                    applyUnionKey: res.data.data.applyUnionKey
                  }
                });
              } else {
                this.$notify.error({ msg: '换卡处理中，请等待！' });
              }
            })
            .catch((err) => {
              this.$notify.error({ msg: err?.data?.msg || '获取结果失败！' });
            })
            .finally((_) => {
              this.$toasting.hide();
            });
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.bank-card-mana-wrapper {
  background-color: #f4f6f9;
  min-height: 100vh;
  padding: 28px 16px 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .bank-card-list-wrapper {
    width: 100%;
  }
}
.bank-card--warpper {
  display: flex;
  padding: 0.625rem 0 0 0.9375rem;
  .logo-warpper {
    display: flex;
    width: 20px;
    height: 20px;
    padding: 0.3125rem;
    background: #ffffff;
    border-radius: 50%;
  }
}
.bank-card-item {
  margin-bottom: 0.625rem;
}
.add-card-btn {
  width: 80%;
  margin-top: 60px;
  box-shadow: -2px 2px 5px 2px rgba(27, 111, 251, 0.26);
}
.change-card {
  padding: 16px 22px;
  margin-top: 2px;
  font-size: 26px;
  text-indent: 2em;
}
</style>
