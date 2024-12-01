<template>
  <div>
    <div class="remind">请输入本人实名认证的手机号</div>
    <!--上传识别身份证-->
    <div class="item-wrapper">
      <show-item itemName="姓名" :itemVal="userName"></show-item>
    </div>
    <div class="rebindbtn-wrapper">
      <a class="rebindbtn" @click="switchLogoutModel">更换手机号</a>
    </div>
    <p-modal v-show="isShowRelogin" title="确认更换手机号" @ok="logout" @cancel="switchLogoutModel">
      <p class="logout">更换登录手机号</p>
    </p-modal>

    <phone-verify
      @bindPhoneNoitfy="bindPhoneNoitfy"
      :isShowTitle="true"
      :loading="loading"
      :phoneNum="phoneNum"
      :isReadOnly="isReadOnly"
    ></phone-verify>
  </div>
</template>
<script>
import PhoneVerify from '../../common/components/home/PhoneVerify.vue';
import showItem from '../../common/components/common/showItem';
import Modal from '../../common/components/common/Modal';
import { jdugeNewUserRoute } from '../../controller/userController';
import { threeMianVerify, logout } from '@/request/interface/impower/UserInfo.js';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
export default {
  /**
   * 手机三要素页面
   * */
  name: 'IdnoNamePhoneVerify',
  data() {
    return {
      userName: '',
      phoneNum: '',
      msg: '',
      loading: false,
      isReadOnly: true,
      isShowRelogin: false
    };
  },
  components: {
    'show-item': showItem,
    'phone-verify': PhoneVerify,
    'p-modal': Modal
  },
  created() {
    this.init();
  },

  methods: {
    init() {
      let productId = this.$store.state.productId;
      this.productId = productId;
      jdugeNewUserRoute().then((user) => {
        this.userName = user.name;
        this.phoneNum = user.phoneNum;
      });
    },

    // 三要素的绑定与验证
    bindPhoneNoitfy(mobileNo) {
      this.loading = true;
      threeMianVerify({ mobileNo })
        .then(async (res) => {
          let code = res?.data?.data;
          if (code === '01') {
            // 当code 为 01 才通过
            let nextPath = await queryNextByUnionKeyAndProdId(this.productId);
            this.$router.replace({ path: nextPath });
          } else {
            this.$notify.error({ msg: `请使用${this.userName}实名的手机号！` });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg });
        })
        .finally(() => {
          this.loading = false;
        });
    },

    switchLogoutModel() {
      this.isShowRelogin = !this.isShowRelogin;
    },

    /**
     * 更换手机号之后，退出登录
     * */
    logout() {
      let productId = localStorage.productId;
      let referrer = localStorage.referrer;
      let nextPath = `/prod_xmkd?uid=${referrer}&prid=${productId}`;
      this.switchLogoutModel();
      this.$toasting.show({ message: '登出中', forbidClick: true });
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
.item-wrapper {
  padding-top: 18px;
  padding-bottom: 10px;
  padding-left: 18px;
  padding-right: 18px;
}
.rebindbtn-wrapper {
  position: fixed;
  bottom: 2.875rem;
  left: 50%;
  transform: translateX(-50%);
}
.rebindbtn {
  padding: 0.3125rem 0.625rem;
  margin-top: 2.5rem;
  font-size: 28px;
  font-weight: 500;
}
.logout {
  padding-left: 20px;
}
</style>
