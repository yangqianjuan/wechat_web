<template>
  <div class="myd-three-info">
    <div class="remind">请输入本人实名认证的手机号</div>
    <div class="phone-info-show">
      <phone-verify
        @bindPhone="bindPhone"
        :isShowTitle="true"
        :phoneNum="phoneNum"
        :name="userName"
        :isReadOnly="isReadOnly"
      ></phone-verify>
    </div>
    <!-- <div class="rebindbtn-wrapper">
      <a class="rebindbtn" @click="switchLogoutModel">更换手机号</a>
    </div>-->
    <p-modal v-show="isShowRelogin" title="确认更换手机号" @ok="logout" @cancel="switchLogoutModel">
      <p class="logout">更换登录手机号</p>
    </p-modal>
  </div>
</template>
<script>
import PhoneVerify from '../common/PhoneVerify.vue';
import Modal from '../common/Modal.vue';
import { jdugeNewUserRoute } from '@/controller/userController';
import { threeMianVerify, logout } from '@/request/interface/impower/UserInfo.js';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { commonMydMixin } from '@/modules/products/meng-yi-d/utils/common';

export default {
  name: 'MYDIdnoNamePhoneVerify',
  mixins: [commonMydMixin],
  data() {
    return {
      userName: '',
      phoneNum: '',
      isReadOnly: true,
      isShowRelogin: false
    };
  },
  components: {
    'phone-verify': PhoneVerify,
    'p-modal': Modal
  },
  created() {
    this.init();
  },

  methods: {
    async init() {
      this.getMydUnionKey();
      jdugeNewUserRoute().then((user) => {
        this.userName = user.name;
        this.phoneNum = user.phoneNum;
      });
    },

    /**
     * 三要素的绑定与验证
     * */
    async bindPhone(mobileNo) {
      try {
        const threeRes = await threeMianVerify({ mobileNo, applyUnionKey: this.applyUnionKey });
        if (threeRes?.data?.success) {
          let code = threeRes.data.data;
          if (code === '01') {
            let nextPath = await queryNextByUnionKeyAndProdId(this.creditPreInfo.productId, this.applyUnionKey);
            this.$router.replace({
              path: nextPath,
              query: { referrer: this.creditPreInfo.referrer, productId: this.creditPreInfo.productId }
            });
          } else {
            this.$notify.error({ msg: `请使用${this.userName}实名的手机号！` });
          }
        } else {
          this.$notify.error({ msg: '用户三要素验证失败！' });
        }
      } catch (e) {
        this.$notify.error({ msg: e?.data?.msg || '用户三要素验证失败！' });
      } finally {
        this.$toasting.hide();
      }
    },

    switchLogoutModel() {
      this.isShowRelogin = !this.isShowRelogin;
    },

    /**
     * 更换手机号之后，退出登录
     * */
    logout() {
      let productId = this.creditPreInfo.productId;
      let referrer = this.creditPreInfo.referrer;
      let nextPath = `/prod_xmkd?uid=${referrer}&prid=${productId}`;
      this.$toasting.show({ message: '登出中', forbidClick: true });
      this.switchLogoutModel();
      logout()
        .then((res) => {
          this.$router.replace({ path: nextPath });
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '登出失败' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    }
  }
};
</script>
<style lang="scss" scoped>
@import '../../assets/css/common.scss';
.myd-three-info {
  .item-wrapper {
    padding: 22px 0;
    display: flex;
    justify-content: center;
  }
  .phone-info-show {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  .rebindbtn-wrapper {
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    .rebindbtn {
      font-size: 33px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: $btn-bg-color;
      line-height: 46px;
    }
  }
  .logout {
    padding-left: 20px;
  }
}
</style>
