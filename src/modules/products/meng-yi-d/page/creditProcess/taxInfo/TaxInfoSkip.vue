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
    <Modal v-show="phoneInputStatus" title="企业办税人手机号" :isShowCancel="false" @ok="phoneInputHandler('formDynamic')">
      <div class="phone-input" style="padding: 8px 16px;">
        <Form :model="taxDatCollect" :label-width="70" :rules="ruleValidate" ref="formDynamic" label-position="left">
          <FormItem label="手机号：" prop="phone">
            <i-input v-model="taxDatCollect.phone"></i-input>
          </FormItem>
        </Form>
      </div>
    </Modal>
  </div>
</template>
<script>
import { updateCorpBaseInfo, getCorpBaseInfo } from '@/request/interface/impower/UserInfo';
import TaxinfoByAcountPwd from '@/common/components/taxInfo/ByAcountPwd';
import ProtocolList from '@/common/components/common/ProtocolList.vue';
import { quertProtocolUrl } from '@/controller/protocol.js';
import { jdugeNewUserRoute } from '@/controller/userController';
import { getLoginStyle, TAX_LOGIN_TYPE } from '@/utils/tax/taxLoginHelper.js';
import Modal from '../../common/Modal.vue';
import { commonMydMixin } from '@/modules/products/meng-yi-d/utils/common';

export default {
  name: 'MYDTaxInfoSkip',
  mixins: [commonMydMixin],
  data() {
    const validatePhone = (rule, value, callback) => {
      const reg = new RegExp(/^1\d{10}$/);
      if (reg.test(value)) {
        callback();
      } else {
        callback(new Error('手机号格式不正确'));
      }
    };
    return {
      formItem: {
        companyName: '',
        acountNum: '',
        acountPwd: '',
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
      taxDatCollect: {
        phone: ''
      },
      ruleValidate: {
        phone: [
          { required: true, message: '请填写手机号' },
          { trigger: 'blur', validator: validatePhone }
        ]
      },
      taxRequestId: '',
      phoneInputStatus: false
    };
  },
  components: {
    'p-protocol-list': ProtocolList,
    'p-taxinfo-by-acount-pwd': TaxinfoByAcountPwd,
    Modal
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.setWechatTitle('企业税务电子信息授权');
      this.showLoading('加载中');
      this.getMydUnionKey();
      Promise.all([
        jdugeNewUserRoute()
          .then((user) => {
            this.userInfo = user;
          })
          .catch((err) => {
            this.$notify.error({
              msg: err?.data?.msg || '用户信息获取失败！'
            });
          }),
        this.getUserCorpBaseInfo()
      ]);
    },
    switchShowProtocol() {
      this.isShowProtocol = !this.isShowProtocol;
    },

    getUserCorpBaseInfo() {
      getCorpBaseInfo({ applyUnionKey: this.applyUnionKey })
        .then((res) => {
          if (res?.data?.data) {
            let data = res.data.data;
            this.formItem.companyName = data.corpName;
            this.formItem.acountNum = data.corpId;
            this.formItem.id = data.id;
            this.loginStyle = getLoginStyle(data.corpId);
            this.isPageOverLoad = true;
          }
        })
        .catch((err) => {
          this.$notify.error({
            msg: err?.data?.msg || '企业信息获取失败！'
          });
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
      acountInfo && (this.formItem.acountPwd = acountInfo.acountPwd);
      this.phoneInputStatus = !this.phoneInputStatus;
    },

    updateUserCorpBaseInfo() {
      this.isLoading = true;
      let params = {
        nationalTaxAccount: this.formItem.acountNum,
        nationalTaxPassword: this.formItem.acountPwd || 'xmjr',
        id: this.formItem.id,
        taxPhone: this.taxDatCollect.phone,
        applyUnionKey: this.applyUnionKey
      };
      updateCorpBaseInfo(params)
        .then((res) => {
          res?.data?.success &&
            this.$router.replace({
              path: '/myd_replenish_file_upload',
              query: { referrer: this.creditPreInfo.referrer, productId: this.creditPreInfo.productId }
            });
        })
        .catch((err) => {
          this.errHandle(err);
        })
        .finally(() => {
          this.$toasting.hide();
          this.isLoading = false;
        });
    },

    phoneInputHandler(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.showLoading('保存中. . .');
          this.isLoginSucc = true;
          this.updateUserCorpBaseInfo();
        }
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
      this.isLoading = false;
      this.$notify.error({
        msg: err?.data?.msg || '信息保存失败'
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
      let params = {
        idCard: this.userInfo.idNo,
        userName: this.userInfo.name,
        corpName: this.formItem.companyName,
        applyUnionKey: this.applyUnionKey,
        fileType
      };
      quertProtocolUrl(params)
        .then((textArr) => {
          this.protocolList[index].isReadOver = true;
          this.protocolText = textArr;
        })
        .catch((err) => {
          this.$notify.error({
            msg: err?.data?.msg || '协议获取失败！'
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
