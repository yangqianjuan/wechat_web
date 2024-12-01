<template>
  <div class="product-wrapper">
    <div class="from-wrapper">
      <img class="bg_prod" :src="prodBg" alt />
      <div class="product-from-wrapper">
        <div class="product-sec-title">请填写信息</div>
        <div class="input-warpper">
          <p-input
            v-if="pageConfig.companyShow"
            label="企业名称"
            ref="companyName"
            :isErr="isCompanyNameErr"
            v-model="companyName"
            textPlaceholder="请输入企业名称"
            :isRequired="isRequired"
          ></p-input>
        </div>
        <div class="input-warpper">
          <p-input
            label="姓名"
            ref="userName"
            :isErr="isUserNameErr"
            v-model="userName"
            textPlaceholder="请输入姓名"
            :isRequired="isRequired"
          ></p-input>
        </div>
        <div class="input-warpper">
          <p-input
            label="身份证号"
            ref="idCardNum"
            :isErr="isIdCardNumErr"
            v-model="idCardNum"
            textPlaceholder="请输入身份证号"
            :isRequired="isRequired"
          ></p-input>
        </div>
        <div class="input-warpper">
          <p-input
            label="手机号码"
            ref="phoneNum"
            :isErr="isPhoneNumErr"
            v-model="phoneNum"
            textPlaceholder="请输入手机号码"
            :isRequired="isRequired"
          ></p-input>
        </div>
        <Button class="sub-btn" :loading="isLoading" type="primary" @click="handleSubmit('formDynamic')"
          >确认提交</Button
        >
        <p class="tip">请确认信息无误后，再提交！</p>
      </div>
    </div>
  </div>
</template>
<script>
import { getFsdApplyUrl } from '@/request/interface/impower/Product.js';
import { getProduceDetail } from '@/request/interface/impower/Bank.js';
import { isIdCard } from '@/utils/common/common';
import textInput from '@/common/components/common/textInput';
export default {
  data() {
    return {
      prodBg: require('@/assets/imgs/bg/bg_prod_fsd.png'),
      companyName: '',
      referId: '',
      isLoading: false,
      isRequired: true,
      productId: '',
      componyName: '',
      userName: '',
      idCardNum: '',
      phoneNum: '',
      errMsg: '',
      isCompanyNameErr: false,
      isUserNameErr: false,
      isIdCardNumErr: false,
      isPhoneNumErr: false,
      pageConfig: {
        companyShow: true
      }
    };
  },
  components: {
    'p-input': textInput
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.referId = this.getUrlParam('uid');
      this.productId = this.getUrlParam('prid');
      this.configFilterHandler(this.productId);
      this.setProdPageTitle();
    },
    setProdPageTitle() {
      getProduceDetail({ productId: this.productId })
        .then(res => {
          this.setWechatTitle(res?.data?.data?.productName);
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg });
        });
    },
    configFilterHandler(productId) {
      if (!productId) return;
      // if (String(productId) === '1047') {
      //   this.pageConfig.companyShow = false;
      // }
    },
    handleSubmit() {
      let isPassVali = this.formVali();
      if (!isPassVali) {
        return;
      }
      this.isLoading = true;
      let params = {
        // corpname: this.companyName,
        recommendid: parseInt(this.referId),
        idNo: this.idCardNum,
        productId: this.productId,
        userName: this.userName,
        mobile: this.phoneNum
      };
      if (this.pageConfig.companyShow) {
        params.corpname = this.companyName;
      }
      getFsdApplyUrl(params)
        .then(res => {
          window.location.replace(res?.data?.data);
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg });
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    formVali() {
      let errMsg = '';
      this.pageConfig.companyShow && this.$refs.companyName.isEmpty();
      this.$refs.userName.isEmpty();
      this.$refs.idCardNum.isEmpty();
      this.$refs.phoneNum.isEmpty();
      let fromPass = false;
      if (this.pageConfig.companyShow && !this.companyName) {
        this.isCompanyNameErr = true;
        errMsg = '请输入企业名称';
      } else {
        this.isCompanyNameErr = false;
      }
      if (!this.userName) {
        this.isUserNameErr = true;
        errMsg = errMsg || '请输入姓名';
      } else {
        this.isUserNameErr = false;
      }
      if (!this.idCardNum) {
        this.isIdCardNumErr = true;
        errMsg = errMsg || '请输入身份证号';
      } else if (!isIdCard(this.idCardNum)) {
        this.isIdCardNumErr = true;
        errMsg = errMsg || '身份证格式错误';
      } else {
        this.isIdCardNumErr = false;
      }
      if (!this.phoneNum) {
        this.isPhoneNumErr = true;
        errMsg = errMsg || '请输入手机号码';
      } else if (!this.valiPhone(this.phoneNum)) {
        this.isPhoneNumErr = true;
        errMsg = errMsg || '手机号格式错误';
      } else {
        this.isPhoneNumErr = false;
      }
      if (!errMsg) {
        fromPass = true;
      }
      this.errMsg = errMsg;
      return fromPass;
    },
    validateIdNum(value) {
      let _IDRe18 = /^([1-6][1-9]|50)\d{4}(18|19|20)\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
      let _IDre15 = /^([1-6][1-9]|50)\d{4}\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}$/;
      const regIdNum18 = new RegExp(_IDRe18);
      const regIdNum15 = new RegExp(_IDre15);
      return regIdNum18.test(value) || regIdNum15.test(value) ? true : false;
    },
    valiPhone(value) {
      const reg = new RegExp(
        /^1(3[0-9]|4[0,5,6,7,9]|5[0,1,2,3,5,6,7,8,9]|6[2,5,6,7]|7[0,1,2,3,5,6,7,8]|8[0-9]|9[1,5,7,8,9])\d{8}$/
      );
      return reg.test(value) ? true : false;
    }
  }
};
</script>
<style lang="scss" scoped>
.product-wrapper {
  background: #0072c3;
  min-height: 100vh;
  .bg_prod {
    width: 100%;
    z-index: 1;
  }
  .product-from-wrapper {
    background: rgba(255, 255, 255, 1);
    margin: 2.75rem 0.9375rem 0;
    position: relative;
    top: -3.9375rem;
    z-index: 2;
    border-radius: 0.625rem;
    padding: 2.625rem 0.625rem 0.9375rem;
    .product-sec-title {
      width: 13.1875rem;
      height: 2.5rem;
      line-height: 2.5rem;
      background-image: url('../../assets/imgs/bg/bg_prod_tag.png');
      background-size: contain;
      background-repeat: no-repeat;
      font-weight: 400;
      color: rgba(255, 255, 255, 1);
      text-align: center;
      margin: -4.0625rem auto 0;
    }
    .product-item-title {
      font-weight: 400;
      color: rgba(51, 51, 51, 1);
      margin-top: 1.5rem;
    }
    .tip {
      text-align: center;
      margin-top: 0.625rem;
    }
  }
  .product-title {
    font-weight: 400;
    color: rgba(127, 127, 127, 1);
    padding: 0 0 0.625rem 1.25rem;
  }
  .input-warpper {
    margin-top: 0.8125rem;
  }
  .notice {
    text-align: center;
    font-size: 24px;
    margin-top: 25px;
    font-weight: 400;
    color: rgba(219, 43, 19, 1);
  }
  .sub-btn {
    width: 57%;
    margin-left: 18.5%;
    margin-top: 42px;
    border-radius: 1.0625rem;
    margin-top: 1.2625rem;
    background: linear-gradient(243deg, rgba(11, 185, 251, 1), rgba(66, 133, 235, 1));
    border: none;
    box-shadow: 0px 2px 6px 0px rgba(3, 0, 0, 0.41);
  }
}
.err-msg {
  height: 10px;
  font: 300 0.75rem PingFang SC;
  color: rgba(224, 0, 0, 1);
  text-align: center;
  margin-top: 0.3125rem;
}
</style>
