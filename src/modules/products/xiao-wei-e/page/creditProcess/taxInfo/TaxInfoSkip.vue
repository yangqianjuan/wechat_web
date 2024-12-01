<template>
  <div class="from-container" v-if="isPageOverLoad">
    <!-- 账号密码 -->
    <p-taxinfo-by-acount-pwd
      @applyUserCreditCard="applyUserCreditCard"
      :companyName="formItem.companyName"
      :acountNum="formItem.acountNum"
      :isLoading="isLoading"
    ></p-taxinfo-by-acount-pwd>

    <div class="protocol-link-wrapper">
      <input class="protocol-select-btn" id="agree" type="radio" value="agree" v-model="isAgree" />
      <p>
        <label class="agree-text" for="agree">请阅读并同意协议</label>
        <span @click="switchShowProtocol" class="protocol">《广发银行贷款合同及相关授权协议》</span>
        <!-- <span @click="switchShowProtocol" class="protocol">《授信合同》《数据使用授权书》</span> -->
      </p>
    </div>

    <div class="pdf-wrapper" v-if="isShowProtocol">
      <p-protocol-list
        @closeProtocol="switchShowProtocol"
        @getProtocolText="getProtocolText"
        :isShowDoc="true"
        :protocoldoc="protocolText"
        :protocolList="protocolList"
      ></p-protocol-list>
    </div>
  </div>
</template>
<script>
import { updateCorpBaseInfo, getCorpBaseInfo } from '@/request/interface/impower/UserInfo';
import TaxinfoByAcountPwd from '@/common/components/taxInfo/ByAcountPwd';
import ProtocolList from '@/common/components/common/ProtocolList.vue';
import { jdugeNewUserRoute } from '@/controller/userController';
import { getLoginStyle, TAX_LOGIN_TYPE } from '@/utils/tax/taxLoginHelper.js';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { getGFCreditContract } from '@/request/interface/gf/common.js';

export default {
  /**
   * 税局跳过采用
   * */
  name: 'TaxInfoSkip',
  data() {
    return {
      formItem: {
        companyName: '',
        acountNum: '',
        acountPwd: '',
        comfirmAcountPwd: '',
        id: ''
      },
      isAgree: '',
      loginStyle: '',
      loginStyleObj: TAX_LOGIN_TYPE,
      isLoading: false,
      isPageOverLoad: false,
      isShowProtocol: false,
      protocolText: '',
      userInfo: {},
      protocolList: [
        { code: '03', name: '广发银行贷款合同及相关授权协议', isNess: true, isReadOver: false }
        // { code: "03", name: "授信合同", isNess: true, isReadOver: false },
        // { code: "04", name: "数据使用授权书", isReadOver: false }
      ],
      msg: ''
    };
  },
  components: {
    'p-protocol-list': ProtocolList,
    'p-taxinfo-by-acount-pwd': TaxinfoByAcountPwd
  },
  created() {
    this.$toasting.show({ message: '加载中', forbidClick: true });
    this.setWechatTitle('企业税务电子信息授权');
    jdugeNewUserRoute()
      .then((user) => {
        this.userInfo = user;
      })
      .catch((err) => {
        this.$notify.error({
          msg: '用户信息获取失败！'
        });
      });
    this.getUserCorpBaseInfo();
  },

  methods: {
    switchShowProtocol() {
      this.isShowProtocol = !this.isShowProtocol;
    },

    // 获取用户的企业信息
    getUserCorpBaseInfo() {
      getCorpBaseInfo()
        .then((res) => {
          let data = res.data.data;
          this.formItem.companyName = data.corpName;
          this.formItem.acountNum = data.corpId;
          // this.formItem.acountNum = '91130602MA07LJ35XL';
          this.formItem.id = data.id;
          this.loginStyle = getLoginStyle(data.corpId);
          this.isPageOverLoad = true;
        })
        .catch((err) => {
          // console.log(err);
          this.isPageOverLoad = true;
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    /**
     * 用户税局信息登录
     * */
    applyUserCreditCard(acountInfo) {
      if (!this.jdeugeProtocoIsAgree()) {
        return;
      }
      if (acountInfo) {
        this.formItem.acountPwd = acountInfo.acountPwd;
      }
      this.$toasting.show({ message: '登录中', forbidClick: true });
      this.updateUserCorpBaseInfo();
    },

    // 更新企业信息
    updateUserCorpBaseInfo() {
      this.isLoading = true;
      let params = {
        nationalTaxAccount: this.formItem.acountNum,
        nationalTaxPassword: this.formItem.acountPwd ? this.formItem.acountPwd : 'xmjr',
        id: this.formItem.id
      };
      updateCorpBaseInfo(params)
        .then(async (res) => {
          this.$toasting.success({ msg: '登录成功' });
          let productId = localStorage.getItem('productId');
          let nextPath = await queryNextByUnionKeyAndProdId(productId);
          setTimeout(() => {
            this.$router.replace({ path: nextPath });
            // this.$router.replace({ path: "/xwe_credut_result" });
          }, 1500);
        })
        .catch((err) => {
          this.errHandle(err);
        })
        .finally(() => {
          this.$toasting.hide();
          this.isLoading = false;
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

    errHandle(err) {
      console.log(err);
      this.isLoading = false;
      let errMsg = '';
      errMsg = !err || !err.data || !err.data.msg ? '信息保存失败' : err.data.msg;
      this.$notify.error({
        msg: errMsg
      });
    },

    /**
     * 获取用户需要展示的协议
     * */
    getProtocolText(protocol) {
      let fileType = protocol.code;
      let index = protocol.index;
      this.protocolText = '';
      let userInfo = this.userInfo;
      // 测试
      let params = {
        applyUnionKey: sessionStorage.getItem('union_key')
      };
      getGFCreditContract(params)
        .then((res) => {
          // console.log("dd", res.data.data);
          if (res) {
            this.protocolList[index].isReadOver = true;
            this.protocolText = res;
          } else {
            this.isShowProtocol = false;
            this.$notify.error({
              msg: '文件获取失败！'
            });
          }
        })
        .catch((err) => {
          this.isShowProtocol = false;
          this.$notify.error({
            msg: '文件获取失败！'
          });
        });
    }
  }
};
</script>
<style lang="scss" scoped>
//  ok
.from-container {
  min-height: 100vh;
  background: #ffffff;
}

.protocol-link-wrapper {
  padding: 0.625rem 0 1.25rem 2rem;
  display: flex;
  align-items: center;
  .agree-text {
    color: #999999;
  }
  .protocol-select-btn {
    margin-right: 0.25rem;
  }
  .protocol {
    color: #1b6ffb;
  }
}
</style>
