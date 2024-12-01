<template>
  <div class="login-wrapper reset-form">
    <div v-if="!isPfCard" class="remind">电子账户开户信息确认</div>
    <div v-if="!isPfCard" class="show-container">
      <div v-for="(item, key) in userInfo" :key="key">
        <show-item v-if="userInfoKey[key]" :itemName="userInfoKey[key]" :itemVal="item"></show-item>
      </div>
    </div>
    <div>
      <div class="remind">请填写手机尾号 {{phoneTailNum}} 接收的验证码</div>
      <div class="input-wrapper">
        <van-form validate-first ref="formDynamic">
          <van-field
            v-model="formItem.smsCode"
            name="smsCode"
            :maxlength="maxSmsCode"
            required
            label="验证码"
            placeholder="请输入验证码"
            :rules="ruleValidate.smsCode"
          />
        </van-form>
      </div>
      <van-button
        class="foot-operate-btn sub-btn"
        :disabled="disabledBtn"
        type="primary"
        @click="handleSubmit('formDynamic')"
      >确定</van-button>
      <div class="protocol-link-wrapper">
        <input class="protocol-select-btn" id="agree" type="radio" value="agree" v-model="isAgree" />
        <p>
          <label for="agree">我已阅读并同意</label>
          <span @click="switchShowProtocol" class="protocol">《浦发银行开户及电子户相关协议》</span>
        </p>
      </div>
    </div>
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
import ProtocolList from '@/common/components/common/ProtocolList.vue';
import { quertProtocolUrl } from '@/controller/protocol.js';
import { EleAccountVerify } from '@/controller/bank';
export default {
  /**
   * 小萌快贷 非浦发卡开户 ---》 电子户确认页
   * */
  name: 'EAVerifyPhone',

  components: {
    'show-item': showItem,
    'p-protocol-list': ProtocolList
  },

  data() {
    const validateSmscode = (value, rule) => {
      const reg = new RegExp(/^\d{6}$/);
      if (reg.test(value)) {
        return true;
      } else {
        return false;
      }
    };
    return {
      isPfCard: false,
      disabledBtn: false,
      formItem: {
        smsCode: ''
      },
      maxSmsCode: 6,
      ruleValidate: {
        smsCode: [
          { required: true, message: '请输入验证码', trigger: 'onBlur' },
          { required: true, validator: validateSmscode, message: '请输入正确的验证码' }
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
      ],
      userInfoKey: {
        name: '姓名',
        idNum: '身份证号',
        debitCardNum: '银行卡号',
        phoneNum: '预留手机号'
      },
      userInfo: {
        name: '',
        idNum: '',
        debitCardNum: '',
        phoneNum: ''
      }
    };
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.setWechatTitle('填写验证码');
      if (this.$route.query.bankInfo) {
        this.bankInfo = JSON.parse(this.$route.query.bankInfo);
        this.phoneTailNum = this.bankInfo.phoneNum ? this.bankInfo.phoneNum.substr(7, 11) : '';
        this.userInfo = this.formateUserInfo();
      } else {
        this.$notify.info({ msg: '暂无用户需要确认开通的电子账户信息！' });
        this.disabledBtn = true;
      }
    },

    // 提交
    handleSubmit(name) {
      this.$refs[name].validate(['smsCode']).then((vaild) => {
        if (!vaild) {
          if (!this.isAgree) {
            this.$notify.info({ msg: '请阅读并同意协议！' });
            return false;
          }
          if (!this.protocolList[0].isReadOver) {
            this.$notify.info({ msg: '请阅读并同意协议！' });
            this.isShowProtocol = true;
            return false;
          }
          this.openEleAccount();
        }
      });
    },

    switchShowProtocol() {
      this.isShowProtocol = !this.isShowProtocol;
    },

    // 开通
    openEleAccount() {
      this.bankInfo.verifyCode = this.formItem.smsCode;
      this.$toasting.show({ message: '开通中', forbidClick: true });
      EleAccountVerify(this.bankInfo)
        .then((res) => {
          res?.data?.success && this.$router.replace({ path: '/credut_result?isWaitEacount=true' });
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '开通失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // 获取协议
    getProtocolText(protocol) {
      this.protocolText = [];
      let code = protocol.code;
      let fileType = protocol.code;
      let index = protocol.index;
      quertProtocolUrl({ code, fileType })
        .then((textArr) => {
          if (textArr) {
            this.protocolList[index].isReadOver = true;
            this.protocolText = textArr;
          } else {
            this.$notify.info({ msg: '未获取到合同信息！' });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '获取合同失败！' });
        });
    },

    formateUserInfo() {
      let bankInfo = this.bankInfo;
      return {
        name: bankInfo.name || '',
        idNum: bankInfo.idNo || '',
        debitCardNum: bankInfo.debitCardNum || '',
        phoneNum: bankInfo.phoneNum || ''
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
  margin-top: 12px;
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
