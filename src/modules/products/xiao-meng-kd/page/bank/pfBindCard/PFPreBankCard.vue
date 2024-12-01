<template>
  <div class="pf-pre-bank-card">
    <van-empty v-if="isOpenStatus" image="error" description="获取账户信息失败..." />
  </div>
</template>
<script>
import { getPFHisOpenEAccount } from '@/request/interface/common';
import { infoRegister, infoGet } from '@/utils/common/common';
import { jdugeIsCanBindBankCard } from '@/controller/userController.js';
import { getUnionKey } from '@/request/interface/common';

export default {
  // 浦发绑卡页面入口
  name: 'PFPreBankCard',
  data() {
    return {
      isOpenStatus: false,
      applyUnionKey: '',
      referrer: ''
    };
  },
  created() {
    this.init();
  },
  methods: {
    // 初始化
    init() {
      let uid = this.getUrlParam('uid');
      if (uid) infoRegister('1000', { referrer: uid });
      localStorage.referrer = uid || (infoGet('1000') ? infoGet('1000').referrer : '');
      localStorage.productId = '1000';
      this.referrer = localStorage.referrer;
      this.getApplyUnionKey();
    },
    /**
     * 获取用户的开户的状态
     * */
    getOpenEAccountStatus() {
      let params = {
        productId: '1000'
      };
      getPFHisOpenEAccount(params)
        .then(res => {
          if (res?.data?.data) {
            this.statusHandler(res.data.data);
          } else {
            this.$notify.info({ msg: '未获取到开户状态信息！' });
          }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '获取失败' });
          this.isOpenStatus = true;
        })
        .finally(_ => {
          this.$toasting.hide();
        });
    },

    /**
     * 是否可以绑卡
     * */
    jdugeIsCanBind() {
      let params = {
        applyUnionKey: this.applyUnionKey
      };
      jdugeIsCanBindBankCard(params)
        .then(isCanBind => {
          if (!isCanBind) {
            this.$toasting.hide();
            // 不可以绑卡
            this.$router.replace({ path: '/credut_result' });
          } else {
            // 获取用户的开户的状态
            this.getOpenEAccountStatus();
          }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '获取失败' });
          this.$toasting.hide();
        });
    },
    /**
     * 处理用户的开户状态
     * */
    statusHandler(data) {
      if (data) {
        let type = typeof data.opening;
        if (type === 'boolean') {
          if (data.opening) {
            // 电子户
            this.$router.replace({ path: '/xm_ebc' });
          } else {
            // 实体卡
            this.$router.replace({ path: '/xm_bc' });
          }
        }
        if (type === 'string') {
          if (data.opening === 'true') {
            // 电子户
            this.$router.replace({ path: '/xm_ebc' });
          } else if (data.opening === 'false') {
            // 实体卡
            this.$router.replace({ path: '/xm_bc' });
          }
        }
        if (type === 'undefined') {
          this.$notify.info({ msg: '未获取到开户状态信息！' });
        }
      } else {
        this.$notify.info({ msg: '未获取到开户状态信息！' });
      }
    },

    // 获取用户的申请标识
    getApplyUnionKey() {
      let payload = {
        referrer: this.referrer,
        productId: '1000'
      };
      this.$toasting.show({ message: '获取开户状态', forbidClick: true });
      getUnionKey(payload)
        .then(res => {
          if (res?.data?.data) {
            this.applyUnionKey = res.data.data;
            this.jdugeIsCanBind();
          } else {
            this.$toasting.hide();
            this.$notify.info({ msg: '未获取到用户申请标识！' });
          }
        })
        .catch(err => {
          this.$toasting.hide();
          this.$notify.error({ msg: err?.data?.msg || '获取用户申请标识失败！' });
        });
    }
  }
};
</script>
