<template>
  <div>
    <van-empty v-if="isOpenStatus" image="error" description="获取信息失败..." />
  </div>
</template>
<script>
import { gfDealOpenAccount } from '@/request/interface/gf/common.js';
import { getGfSessionId } from '@/controller/common.js';
import { getUnionKey } from '@/request/interface/common/index';
import { SESSION_ID } from '@/utils/common/config';

export default {
  /**
   * 开户的首次转发 (中转站)
   *  立即借款 -- >
   * */
  data() {
    return {
      // 用户申请标识
      applyUnionKey: '',
      // 产品id
      productId: '',
      // 查询的用户开户的状态信息
      gfOpenAccountStatus: {},
      isOpenStatus: false
    };
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.applyUnionKey = this.$route.query.applyUnionKey;
      this.productId = this.$route.query.productId || '1035';
      if (this.applyUnionKey && this.productId) {
        this.getGfDealOpenAccount();
        sessionStorage.setItem('applyUnionKey_' + this.productId, this.applyUnionKey);
        sessionStorage.setItem(SESSION_ID.unionKey, this.applyUnionKey);
      } else {
        this.getApplyUnionKey();
      }
    },

    // 查询广发银行的开户状态、（层级是一级的）
    getGfDealOpenAccount() {
      let params = { applyUnionKey: this.applyUnionKey };
      if (params.applyUnionKey) {
        this.$toasting.show({ message: '获取开户状态', forbidClick: true });
        sessionStorage.setItem('applyUnionKey_1035', params.applyUnionKey);
        gfDealOpenAccount(params)
          .then((res) => {
            if (res?.data?.data) {
              this.gfOpenAccountStatus = res.data.data;
              this.handlePathJump(this.gfOpenAccountStatus);
            } else {
              this.$notify.info({ msg: '未获取到开户状态信息！' });
            }
          })
          .catch((err) => {
            this.$toasting.error({ msg: err?.data?.msg || '获取失败' });
            this.isOpenStatus = true;
          });
      } else {
        this.getApplyUnionKey();
      }
    },

    // 流程控制
    handlePathJump(obj) {
      if (obj) {
        if (obj.code === '1001') {
          // 跳到开户页
          // 开户的都是电子账户
          getGfSessionId({ applyUnionKey: this.applyUnionKey, type: 4 })
            .then(() => {
              this.$router.replace({
                path: '/xwe_open_account_face'
              });
            })
            .catch((err) => {
              this.$notify.error({ msg: err?.data?.msg || '会话失败' });
            });
        } else if (obj.code === '1002') {
          // 存在电子卡信息，并不是第一次开户，直接跳到银行卡信息展示，确认是否使用
          this.$router.replace({
            path: '/xwe_bank_info',
            query: { productId: this.productId, applyUnionKey: this.applyUnionKey }
          });
        } else if (obj.code === '1003') {
          // 已开户，跳过开户
          this.$router.replace({
            path: '/xwe_loans_base_info',
            query: { productId: this.productId, applyUnionKey: this.applyUnionKey }
          });
        } else if (obj.code === '1004') {
          // 有本行的银行卡，但是没有在本系统开过户，需要绑卡
          this.$router.replace({
            path: '/xwe_bank_info',
            query: { productId: this.productId, applyUnionKey: this.applyUnionKey }
          });
        } else if (obj.code === '1005') {
          // 正在开户中
          this.$router.replace({
            path: '/xwe_open_card_result',
            query: { productId: this.productId, applyUnionKey: this.applyUnionKey }
          });
        } else if (obj.code === '1006') {
          // 开户失败
          // 开户的都是电子账户
          getGfSessionId({ applyUnionKey: this.applyUnionKey, type: 4 })
            .then(() => {
              this.$router.replace({
                path: '/xwe_open_account_face'
              });
            })
            .catch((err) => {
              this.$notify.error({ msg: err?.data?.msg || '会话失败' });
            });
        } else {
          this.$notify.info({ msg: '未获取到开户状态！' });
          setTimeout(() => {
            this.$router.replace({
              path: '/'
            });
          }, 1000);
        }
      } else {
        this.$notify.info({ msg: '未获取到开户状态！' });
        setTimeout(() => {
          this.$router.replace({
            path: '/'
          });
        }, 1000);
      }
    },

    /**
     * 获取用户申请信息的标识
     *
     * */
    getApplyUnionKey() {
      let payload = {};
      payload.referrer = this.$store.state.referrer;
      payload.productId = this.$store.state.productId ? this.$store.state.productId : '1035';
      getUnionKey(payload)
        .then((res) => {
          if (res?.data?.data && res.data.success) {
            this.applyUnionKey = res.data.data;
            sessionStorage.setItem(SESSION_ID.unionKey, this.applyUnionKey);
            sessionStorage.setItem('applyUnionKey_' + this.productId, this.applyUnionKey);
            this.getGfDealOpenAccount();
          } else {
            this.$notify.error({ msg: '未获取到用户申请信息！' });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '未获取到用户申请信息！' });
          this.isOpenStatus = true;
        });
    }
  }
};
</script>
