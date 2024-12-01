<template>
  <div class="login-wrapper">
    <div v-if="!isPfCard" class="remind">电子账户开户信息确认</div>
    <div v-if="!isPfCard" class="show-container">
      <div v-for="(item, key) in userInfo" :key="key">
        <show-item v-if="userInfoKey[key]" :itemName="userInfoKey[key]" :itemVal="item"></show-item>
      </div>
    </div>
    <div>
      <div class="remind">请填写手机尾号 {{ phoneTailNum }} 接收的验证码</div>
      <div class="input-wrapper">
        <Form :model="formItem" :label-width="65" :rules="ruleValidate" ref="formDynamic" label-position="left">
          <FormItem label="验证码" prop="smsCode">
            <i-input v-model="formItem.smsCode" placeholder="请输入验证码" :maxlength="maxSmsCode"></i-input>
          </FormItem>
        </Form>
      </div>
      <Button class="sub-btn" type="primary" :disabled="!subBtnCanClick" @click="handleSubmit('formDynamic')"
        >确定</Button
      >
      <div class="protocol-link-wrapper">
        <input class="protocol-select-btn" id="agree" type="radio" value="agree" v-model="isAgree" />
        <p>
          <label for="agree">我已阅读并同意</label>
          <!-- <span @click="switchShowProtocol" class="protocol">《上海浦东发展银行个人电子账户产品服务协议》、《上海浦东发展银行电子银行个人客户服务协议及隐私协议》</span> -->
          <span @click="switchShowProtocol" class="protocol">《浦发银行开户及电子户相关协议》</span>
        </p>
      </div>
    </div>
    <p-modal v-show="isShowErrMsg" title="绑卡失败" @ok="switchModel" :isShowCancel="false" @cancel="switchModel">
      <p class="errMsg">{{ errMsg }}</p>
    </p-modal>
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
import showItem from '@/common/components/common/showItem';
import mxModal from '@/common/mixin/mxModal.js';
import ProtocolList from '@/common/components/common/ProtocolList.vue';
import { quertProtocolUrl } from '@/controller/protocol.js';
import { EleAccountVerify } from '../../../controller/bank.js';
export default {
  data() {
    const validateSmscode = (rule, value, callback) => {
      const reg = new RegExp(/^\d{6}$/);
      if (reg.test(value)) {
        callback();
      } else {
        callback(new Error('验证码格式不正确'));
      }
    };
    return {
      isPfCard: false,
      subBtnCanClick: true,
      formItem: {
        smsCode: ''
      },
      maxSmsCode: 6,
      ruleValidate: {
        smsCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { validator: validateSmscode, trigger: 'blur' }
        ]
      },
      bankInfo: {},
      phoneTailNum: '',
      protocolText: '',
      isAgree: '',
      isShowProtocol: false,
      protocolList: [
        // 新加的浦发协议
        { code: '19', name: '浦发银行开户及电子户相关协议', isReadOver: false, isNess: true }
        // { code: "12", name: "上海浦东发展银行个人电子账户产品服务协议", isReadOver: false },
        // { code: "11", name: "上海浦东发展银行电子银行个人客户服务协议及隐私协议", isReadOver: false }
      ],
      userInfoKey: {
        name: '姓名',
        idNum: '身份证号',
        debitCardNum: '银行卡号',
        phoneNum: '预留手机号'
      },
      nextPath: '',
      userInfo: {
        name: '',
        idNum: '',
        debitCardNum: '',
        phoneNum: ''
      }
    };
  },
  mixins: [mxModal],
  components: {
    'show-item': showItem,
    'p-protocol-list': ProtocolList
  },
  created() {
    this.setWechatTitle('填写验证码');
    this.bankInfo = JSON.parse(this.$route.query.bankInfo);
    let nextPath = this.$route.query.nextPath || '';
    if (nextPath) {
      let applyUnionKey = this.$store.state.applyUnionKey;
      let referrer = this.$store.state.referrer;
      this.bankInfo.referrer = referrer;
      this.bankInfo.applyUnionKey = applyUnionKey;
      this.nextPath = nextPath;
    }
  },
  mounted() {
    this.phoneTailNum = this.bankInfo.phoneNum?.substr(7, 11) || '';
    this.userInfo = this.formateUserInfo();
  },
  methods: {
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          if (!this.subBtnCanClick) {
            return;
          }
          if (!this.isAgree) {
            this.$notify.info({ msg: '请阅读并同意协议！' });
            return false;
          }
          if (!this.protocolList[0].isReadOver) {
            this.$notify.info({ msg: '请阅读并同意协议！' });
            this.isShowProtocol = true;
            return false;
          }
          this.subBtnCanClick = false;
          this.$toasting.show({ message: '开通中', forbidClick: true });
          this.bankInfo.verifyCode = this.formItem.smsCode;
          EleAccountVerify(this.bankInfo)
            .then(res => {
              let nextPath = this.nextPath;
              if (nextPath) {
                nextPath === '/bank_card_mana' ? this.$router.back(-1) : this.$router.replace({ path: nextPath });
              } else {
                this.$router.replace({ path: '/credut_result?isWaitEacount=true' });
              }
            })
            .catch(err => {
              this.errHandle(err, '电子账户验证失败');
            })
            .finally(() => {
              this.subBtnCanClick = true;
              this.$toasting.hide();
            });
        } else {
          this.$notify.error({ msg: '请确认信息格式正确！' });
        }
      });
    },
    switchShowProtocol() {
      this.isShowProtocol = !this.isShowProtocol;
    },
    getProtocolText(protocol) {
      this.protocolText = [];
      let code = protocol.code;
      let fileType = protocol.code;
      let index = protocol.index;
      quertProtocolUrl({ code, fileType })
        .then(textArr => {
          this.protocolList[index].isReadOver = true;
          this.protocolText = textArr;
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '合同获取失败！' });
        });
    },
    formateUserInfo() {
      let bankInfo = this.bankInfo;
      return {
        name: bankInfo.name || bankInfo.userName,
        idNum: bankInfo.idNo || '',
        debitCardNum: bankInfo.debitCardNum || bankInfo.bankCardNo,
        phoneNum: bankInfo.phoneNum || bankInfo.bankCardReservePhone
      };
    }
  }
};
</script>
<style lang="scss" scoped>
.login-wrapper {
  height: 100%;
  background: rgba(255, 255, 255, 1);
}

.input-wrapper {
  padding: 0 20px 0 20px;
  margin-top: 20px;
}
.sub-btn {
  width: 80%;
  margin-left: 10%;
  margin-top: 30px;
}
.protocol-link-wrapper {
  padding: 0.875rem 1.25rem 1.25rem 1.25rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  .protocol-select-btn {
    margin-top: 0.25rem;
    margin-right: 0.25rem;
  }
  .protocol {
    color: #1b6ffb;
  }
}
.errMsg {
  padding-left: 1.25rem;
}
.item-wrapper {
  padding-top: 20px;
  padding: 18px 0;
}
.show-container {
  padding: 0 20px 0 20px;
}
</style>
