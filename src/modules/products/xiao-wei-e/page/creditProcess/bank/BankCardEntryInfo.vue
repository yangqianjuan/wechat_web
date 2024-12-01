<template>
  <div class="bind-bank-card-wrapper reset-form" v-if="isOverLoading">
    <div class="remind">请填写 {{formItem.name}} 本人信息</div>
    <div class="from-container">
      <van-form validate-first ref="formDynamic">
        <van-field
          v-model="formItem.name"
          required
          name="name"
          disabled
          label="姓名"
          placeholder="请输入姓名"
          :rules="ruleValidate.name"
        />
        <van-field
          v-model="formItem.idCard"
          name="idCard"
          required
          disabled
          label="身份证号"
          placeholder="请输入身份证号"
          :rules="ruleValidate.idCard"
        />
        <van-field
          v-model="formItem.debitCardNum"
          label="银行卡号"
          required
          name="debitCardNum"
          placeholder="请输入银行卡号"
          :maxlength="debitCardNumMaxLegnth"
          :rules="ruleValidate.debitCardNum"
        >
          <van-icon name="scan" slot="right-icon" @click="gotoQrcBankCard" />
        </van-field>
        <van-field
          v-model="formItem.phoneNum"
          name="phoneNum"
          required
          label="预留手机号"
          placeholder="请输入银行预留手机号"
          :rules="ruleValidate.phoneNum"
        />
        <van-field
          v-model="formItem.smsCode"
          name="smsCode"
          required
          label="验证码"
          placeholder="请输入验证码"
          :rules="ruleValidate.smsCode"
        >
          <div slot="right-icon" class="sms-content">
            <SendSms ref="send-sms-bank" @sendSms="sendSmsBank"></SendSms>
          </div>
        </van-field>
      </van-form>
      <div class="protocol-link-wrapper">
        <input class="protocol-select-btn" id="agree" type="radio" value="agree" v-model="isAgree" />
        <p>
          <label class="agree-text" for="agree">请阅读并同意协议</label>
          <span @click="switchShowProtocol" class="protocol">《实名认证授权书》</span>
        </p>
      </div>
      <div class="pdf-wrapper" v-if="isShowProtocol">
        <p-protocol-list
          @closeProtocol="switchShowProtocol"
          @getProtocolText="getProtocolText"
          :protocolText="protocolText"
          :protocolList="protocolList"
        ></p-protocol-list>
      </div>
      <van-button
        class="btn-foot-fixed foot-operate-btn next-btn"
        type="primary"
        @click="handleSubmit('formDynamic')"
      >下一步</van-button>
    </div>

    <!-- <div class="rebindbtn-wrapper">
      <a class="rebindbtn" @click="switchLogoutModel">更换手机号</a>
    </div>-->
    <p-modal v-show="isShowRelogin" title="确认更换手机号" @ok="logout" @cancel="switchLogoutModel">
      <p class="logout">确定登出？</p>
    </p-modal>
  </div>
</template>
<script>
import { chooseWxImage, getFileName } from '@/utils/wx/wxUtils';
import initUploadObj from '@/controller/upload';
import { dataURLtoFile } from '@/utils/common/common';
import { bankCardOCR } from '@/request/interface/txQrc/readerPci';
import { SESSION_ID } from '@/utils/common/config';
import { BankCard } from '@/model/BankCard';
import { getUnionKey } from '@/request/interface/common/index';
import mxModal from '@/common/mixin/mxModal.js';
import SendSms from '../../../component/sms/SendSms.vue';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { validateIdCard, validatePhoneNo } from '../../../utils/common';
import { gfSendMess, gfUnionPayVerify, gfVerifyMess } from '@/request/interface/gf/common.js';
import { logout } from '@/request/interface/impower/UserInfo';
import Modal from '@/common/components/common/Modal';
import { gfCreditSessionId } from '@/modules/products/xiao-wei-e/page/creditProcess/utils/utils.js';
import ProtocolList from '@/common/components/common/ProtocolList.vue';
import { quertProtocolUrl } from '@/controller/protocol.js';
import { bankCardCheck } from '@/utils/common/common';

export default {
  /**
   * gf银行四要素的录入
   * */
  name: 'BankCardEntryInfo',

  components: {
    SendSms,
    'p-modal': Modal,
    'p-protocol-list': ProtocolList
  },
  mixins: [mxModal],

  data() {
    return {
      // 表单信息
      formItem: {
        debitCardNum: '',
        phoneNum: '',
        name: '',
        referrer: '',
        productId: '',
        applyUnionKey: '',
        idCard: '',
        smsCode: ''
      },
      isShowRelogin: false,
      // 是否加载结束
      isOverLoading: false,
      // 图片信息
      bankCard: {},
      phoneNumMaxLength: 11,
      debitCardNumMaxLegnth: 21,
      // 银行图片是否已经扫过
      isPicLoadOver: true,
      isAgree: '',
      protocolList: [{ code: '18', name: '实名认证授权书', isReadOver: false }],
      protocolText: [],
      isShowProtocol: false,
      // 校验规则
      ruleValidate: {
        name: [{ required: true, message: '请输入姓名', trigger: 'onBlur' }],
        debitCardNum: [
          { required: true, message: '请输入银行卡号', trigger: 'onBlur' },
          { validator: bankCardCheck, message: '请输入正确的银行卡号' }
        ],
        phoneNum: [
          { required: true, message: '请输入手机号', trigger: 'onBlur' },
          { required: true, validator: validatePhoneNo, message: '请输入正确手机号！' }
        ],
        idCard: [
          { required: true, message: '请输入身份证号', trigger: 'onBlur' },
          { required: true, validator: validateIdCard, message: '请输入正确身份证号！' }
        ],
        smsCode: [{ required: true, message: '请输入验证码', trigger: 'onBlur' }]
      }
    };
  },

  created() {
    this.init();
  },

  methods: {
    /**
     * 初始化：
     *    1、授信的页面进入，不需要产品id
     *    2、有产品id，看是否需要绑卡，如果已经绑定，到查看结果页
     * */
    init() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      Promise.all([
        this.getApplyUnionKey()
          .then((res) => {
            if (res?.data?.data) {
              this.formItem.applyUnionKey = res.data.data;
              sessionStorage.setItem(SESSION_ID.unionKey, this.formItem.applyUnionKey);
              this.formatePageLocalData();
            } else {
              this.$notify.info({ msg: '未获取到用户申请记录！' });
            }
          })
          .catch((err) => {
            let errMsg = err?.data?.msg || '用户申请记录获取失败！';
            this.$notify.error({
              msg: errMsg
            });
          }),
        gfCreditSessionId()
      ]);
    },

    // 打开更换手机号的弹框
    switchLogoutModel() {
      this.isShowRelogin = !this.isShowRelogin;
    },

    //  表单提交
    handleSubmit(name) {
      this.isShowProtocol = false;
      this.$refs[name].validate(['name', 'debitCardNum', 'phoneNum', 'idCard', 'smsCode']).then((valid) => {
        if (!valid) {
          if (!this.isAgree) {
            this.$notify.info({ msg: '请阅读协议！' });
            return;
          }
          if (sessionStorage.getItem('sms_serial_no')) {
            let params = {
              applyUnionKey: this.formItem.applyUnionKey,
              mobile: this.formItem.phoneNum,
              verifyCode: this.formItem.smsCode,
              sessionId: sessionStorage.getItem(SESSION_ID.creditSessionId),
              smsSerialNo: sessionStorage.getItem('sms_serial_no')
            };
            this.$toasting.show({ message: '上传中', forbidClick: true });
            gfVerifyMess(params)
              .then((res) => {
                if (res?.data?.data) {
                  // 接口中存在isNeedUnionKey = true 会自动添加
                  // 三要素的验证
                  sessionStorage.removeItem('sms_serial_no');
                  let params = {
                    accountNo: this.formItem.debitCardNum,
                    idNo: this.formItem.idCard,
                    applyUnionKey: this.formItem.applyUnionKey,
                    mobile: this.formItem.phoneNum,
                    sessionId: sessionStorage.getItem(SESSION_ID.creditSessionId)
                  };
                  return gfUnionPayVerify(params);
                } else {
                  this.$notify.error({ msg: '短信验证码错误！' });
                }
              })
              .then(async (res) => {
                if (res?.data?.success) {
                  let productId = localStorage.getItem('productId') || '1035';
                  let nextPath = await queryNextByUnionKeyAndProdId(productId);
                  if (nextPath !== '/xwe_bankCard_info_entry') {
                    this.$toasting.success({ msg: '成功' });
                    setTimeout(() => {
                      this.$router.replace({ path: nextPath });
                    }, 1500);
                  } else {
                    this.$toasting.error({ msg: '信息录入失败' });
                  }
                } else {
                  this.$notify.error({
                    msg: '信息认证失败！'
                  });
                }
              })
              .catch((err) => {
                let errMsg = err?.data?.msg || '信息录入失败！';
                this.$notify.error({
                  msg: errMsg
                });
              })
              .finally(() => {
                this.loading = false;
                this.$toasting.hide();
              });
          } else {
            this.$notify.info({ msg: '请重新获取验证码！' });
          }
        }
      });
    },

    // 格式化本地数据
    formatePageLocalData() {
      // console.log("dddd", this.$store.state.userInfo);
      setTimeout(() => {
        this.$toasting.hide();
        let user = this.$store.state.userInfo;
        this.formItem.name = user.name;
        this.formItem.userId = user.id;
        this.formItem.idNo = user.idNo;
        this.formItem.idCard = user.idNo;
        this.formItem.referrer = this.$store.state.referrer;
        this.formItem.productId = this.$store.state.productId;
        sessionStorage.setItem(
          'single_credit_info',
          JSON.stringify({
            applyUnionKey: this.formItem.applyUnionKey,
            productId: this.formItem.productId,
            referrer: this.formItem.referrer
          })
        );
        this.isOverLoading = true;
      }, 1000);
    },

    // 获取用户的唯一认证
    getApplyUnionKey() {
      let payload = {};
      payload.referrer = this.$store.state.referrer;
      payload.productId = this.$store.state.productId || '1035';
      return getUnionKey(payload);
    },

    // 识别银行卡, 扫描图片
    gotoQrcBankCard() {
      if (!this.isPicLoadOver) {
        return;
      }
      this.isPicLoadOver = false;
      let japiList = ['chooseImage', 'uploadImage', 'getLocalImgData', 'previewImage'];
      let picFace = '';
      chooseWxImage(japiList)
        .then((res) => {
          this.$toasting.show({ message: '识别中', forbidClick: true });
          picFace = dataURLtoFile(res, getFileName());
          return this.uploadUtil(picFace);
        })
        .then((res) => {
          return bankCardOCR({ imageUrl: res, userId: this.formItem.userId });
        })
        .then((res) => {
          if (res?.data?.data) {
            let bankCard = new BankCard(res?.data?.data);
            this.bankCard = bankCard;
            this.formItem.debitCardNum = bankCard.cardNo;
          } else {
            this.$notify.error({
              msg: '银行卡识别失败，请重新尝试！'
            });
          }
        })
        .catch((err) => {
          this.hideLoading();
          this.$notify.error({
            msg: '银行卡识别失败，请重新尝试！'
          });
        })
        .finally(() => {
          this.hideLoading();
          this.$toasting.hide();
        });
    },

    // 关掉loading
    hideLoading() {
      this.isPicLoadOver = true;
    },

    // 文件上传
    uploadUtil(picFace) {
      let that = this;
      return new Promise((resolve, reject) => {
        initUploadObj(
          that,
          new Date().getTime(),
          picFace,
          'image',
          (res) => {
            resolve(res.pic);
          },
          'bank_card'
        );
      });
    },

    // 发送验证码
    sendSmsBank() {
      /**
       * 验证码发送的前提是：
       *      1、银行卡号存在，且有效
       *      2、手机号存在且有效
       * */
      this.$refs.formDynamic.validate(['debitCardNum']).then((res) => {
        if (!res) {
          this.$refs.formDynamic.validate(['phoneNum']).then((res) => {
            if (!res) {
              if (sessionStorage.getItem(SESSION_ID.creditSessionId)) {
                let params = {
                  applyUnionKey: this.formItem.applyUnionKey,
                  mobile: this.formItem.phoneNum,
                  sessionId: sessionStorage.getItem(SESSION_ID.creditSessionId)
                };
                this.$toasting.show({ message: '发送中', forbidClick: true });
                this.$refs['send-sms-bank'].smsSending();
                gfSendMess(params)
                  .then((res) => {
                    if (res?.data?.success && res?.data?.data) {
                      sessionStorage.setItem('sms_serial_no', res?.data?.data);
                      this.$refs['send-sms-bank'].sendSuccess();
                    } else {
                      this.$refs['send-sms-bank'].sendError();
                    }
                  })
                  .catch((err) => {
                    if (err.code !== 403) {
                      this.$refs['send-sms-bank'].sendError();
                    } else {
                      this.$refs['send-sms-bank'].reset();
                    }
                  });
              } else {
                gfCreditSessionId();
              }
            }
          });
        }
      });
    },

    /**
     * 更换手机号之后，退出登录
     * */
    logout() {
      let creditInfo = JSON.parse(sessionStorage.getItem('single_credit_info'));
      let productId = creditInfo.productId;
      let referrer = creditInfo.referrer;
      let nextPath = `/prod_xwe?uid=${referrer}&prid=${productId}`;
      this.switchLogoutModel();
      this.$toasting.show({ message: '登出中', forbidClick: true });
      logout()
        .then((res) => {
          this.$toasting.success({ msg: '登出成功' });
          setTimeout(() => {
            this.$router.replace({ path: nextPath });
          }, 1000);
        })
        .catch((err) => {
          this.$notify.error({
            msg: err?.data?.msg || '登出失败'
          });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    switchShowProtocol() {
      this.isShowProtocol = !this.isShowProtocol;
    },

    getProtocolText(protocol) {
      let fileType = protocol.code;
      let index = protocol.index;
      this.protocolText = [];
      let userInfo = this.userInfo;

      // 测试
      let params = {
        fileType: fileType
        // applyUnionKey: sessionStorage.getItem("union_key")
      };
      quertProtocolUrl(params)
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
.errMsg {
  padding: 0 1.25rem;
  max-height: 120px;
  display: flex;
  overflow: auto;
}
.rebindbtn-wrapper {
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  a {
    font-size: 30px;
    font-weight: 500;
  }
}
.next-btn {
  bottom: 120px;
}
.logout {
  padding-left: 20px;
  text-align: center;
  font-size: 26px;
  font-weight: 500;
}
/deep/.model-wrapper {
  .title-warpper {
    display: flex;
    justify-content: center;
  }
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
