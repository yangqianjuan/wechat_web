<template>
  <div class="from-container" v-if="isPageOverLoad">
    <!-- 账号密码 -->
    <p-taxinfo-by-acount-pwd
      @applyUserCreditCard="applyUserCreditCard"
      :companyName="formItem.companyName"
      :acountNum="formItem.acountNum"
      :isLoading="isLoading"
    ></p-taxinfo-by-acount-pwd>

    <!-- <div class="protocol-link-wrapper">
      <input class="protocol-select-btn" id="agree" type="radio" value="agree" v-model="isAgree" />
      <p>
        <label class="agree-text" for="agree">请阅读并同意协议</label>
        <span @click="switchShowProtocol" class="protocol">《授信合同》《数据使用授权书》</span>
      </p>
    </div>-->

    <div class="pdf-wrapper" v-if="isShowProtocol">
      <p-protocol-list
        @closeProtocol="switchShowProtocol"
        @getProtocolText="getProtocolText"
        :protocolText="protocolText"
        :protocolList="protocolList"
      ></p-protocol-list>
    </div>
  </div>
</template>
<script>
import { updateCorpBaseInfo, getCorpBaseInfo } from '@/request/interface/impower/UserInfo';
import TaxinfoByAcountPwd from '@/common/components/taxInfo/ByAcountPwd';
import ProtocolList from '@/common/components/common/ProtocolList.vue';
import { quertProtocolUrl } from '@/controller/protocol.js';
import { jdugeNewUserRoute } from '@/controller/userController';
import { getLoginStyle, TAX_LOGIN_TYPE } from '@/utils/tax/taxLoginHelper.js';

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
      protocolText: [],
      userInfo: {},
      protocolList: [
        { code: '03', name: '授信合同', isNess: true, isReadOver: false },
        { code: '04', name: '数据使用授权书', isReadOver: false }
      ],
      msg: ''
    };
  },
  components: {
    'p-protocol-list': ProtocolList,
    'p-taxinfo-by-acount-pwd': TaxinfoByAcountPwd
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.showLoading('加载中. . .');
      this.setWechatTitle('企业税务电子信息授权');
      Promise.all([
        jdugeNewUserRoute()
          .then((user) => {
            this.userInfo = user;
          })
          .catch((err) => {
            this.$notify.error({
              msg: '用户信息获取失败！'
            });
          }),
        this.getUserCorpBaseInfo()
      ]);
    },
    switchShowProtocol() {
      this.isShowProtocol = !this.isShowProtocol;
    },

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
          this.isPageOverLoad = true;
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },
    applyUserCreditCard(acountInfo) {
      // if (!this.jdeugeProtocoIsAgree()) {
      //   return;
      // }
      if (acountInfo) {
        this.formItem.acountPwd = acountInfo.acountPwd;
      }
      this.showLoading('保存中. . .');
      this.updateUserCorpBaseInfo();
    },

    updateUserCorpBaseInfo() {
      this.isLoading = true;
      let params = {
        nationalTaxAccount: this.formItem.acountNum,
        nationalTaxPassword: this.formItem.acountPwd ? this.formItem.acountPwd : 'xmjr',
        id: this.formItem.id
      };
      updateCorpBaseInfo(params)
        .then((res) => {
          this.$router.replace({ path: '/replenish_file_upload' });
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
    showLoading(loadingMsg = '保存中. . .') {
      this.$toasting.hide();
      this.$toasting.show({ message: '加载中', forbidClick: true });
    },
    getProtocolText(protocol) {
      let fileType = protocol.code;
      let index = protocol.index;
      this.protocolText = [];
      let userInfo = this.userInfo;
      let params = {
        idCard: userInfo.idNo,
        userName: userInfo.name,
        corpName: this.formItem.companyName,
        fileType
      };
      quertProtocolUrl(params)
        .then((textArr) => {
          this.protocolList[index].isReadOver = true;
          this.protocolText = textArr;
        })
        .catch((err) => {
          this.$notify.error({
            msg: err.data.msg
          });
        });
    }
  }
};
</script>
<style lang="scss" scoped>
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
