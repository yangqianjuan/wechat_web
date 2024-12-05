<template>
  <div class="confirm-borrow" v-if="isLoading">
    <div class="wrapper reset-form" v-if="isShow">
      <div class="card">
        <div class="title-wrapper" slot="title">
          <img class="logo" :src="producDetail.productLogo" alt />
          {{producDetail.productName}}
        </div>
        <!-- @click="switchModel" -->
        <div>
          <span class="guarantee-count">{{loansInfo.borrowBalanceDesc}}</span>
          <!-- <img class="qa-icon" :src="qaIcon" alt /> -->
        </div>
        <p class="guarantee-unit">借款金额(元)</p>
      </div>
      <div class="list-wrapper scroll-list-borrow">
        <div class="item-wrapper" v-for="(item, key) in confirmInfo" :key="key">
          <p class="confirm-key">{{confirmInfoKeyInfo[key]}}</p>
          <p class="confirm-val">{{item}}</p>
        </div>
        <div class="item-wrapper">
          <p class="confirm-key">手机号</p>
          <p class="confirm-val">{{ formItem.mobileNo }}</p>
        </div>
        <!-- <div class="loan-roat-desc">年化利率:采用单利方法计算</div> -->
        <van-form validate-first ref="formDynamic">
          <!-- <van-field v-model="formItem.mobileNo" disabled name="mobileNo" label="手机号" placeholder="请输入手机号"></van-field> -->
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
      </div>
      <div class="list-bottom-show-arrow" @click="arrowSign">
        <div class="arrow-sign" v-if="arrowSignShow">》</div>
      </div>
      <div class="protocol-link-wrapper">
        <input class="protocol-select-btn" id="agree" type="radio" value="agree" v-model="isAgree" />
        <p>
          <label for="agree">请阅读并同意协议</label>
          <span @click="switchShowProtocol" class="protocol">《广发银行贷款合同及相关授权协议》</span>
        </p>
      </div>
      <div class="sub-btn">
        <van-button class="foot-operate-btn" type="primary" @click="handleSubmit">确认借款</van-button>
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
      <v-com-model v-if="isShowModel" @ok="switchModel" title="担保费计算公式" btnDesc="关闭">
        <div class="model-desc">
          <p>担保费=放款金额 * 担保费率 * 借款期限/12</p>
          <p>(保留2位有效数字，四舍五入)</p>
        </div>
      </v-com-model>
    </div>
    <div class="empty-wrapper" v-if="!isShow">
      <img class="empty-icon" :src="emptyIcon" alt />
      <p>暂无借款信息</p>
    </div>
  </div>
</template>
<script>
import { toThousands } from '@/utils/common/common.js';
import ProtocolList from '@/common/components/common/ProtocolList.vue';
import ComModel from '@/common/components/common/ComModel.vue';
import { SESSION_ID } from '@/utils/common/config';
import SendSms from '../../../component/sms/SendSms.vue';
import { gfSendMess, gfBorrowingApply } from '@/request/interface/gf/common.js';
import { getGFLendingContract } from '@/request/interface/gf/common.js';

export default {
  data() {
    return {
      logo: require('@/assets/imgs/icon/ic_logo.png'),
      arrowIcon: require('@/assets/imgs/icon/ic_arrow.png'),
      qaIcon: require('@/assets/imgs/icon/ic_qa.png'),
      producDetail: {},
      loansInfo: {},
      isAgree: '',
      formItem: { smsCode: '', smsSerialNo: '', mobileNo: this.$store.state.userInfo.phoneNum },
      isLoading: false,
      isShow: true,
      emptyIcon: require('@/assets/imgs/icon/ic_empty.png'),
      confirmInfoKeyInfo: {
        loansInterstRate: '综合利率',
        guaranteeIr: '担保费率',
        // guaranteeFee: '担保费',
        refundMode: '还款方式',
        loansTimeLimit: '借款期限',
        loansPurpose: '借款用途',
        debitCardNum: '收款账户',
        loansUser: '借款人',
        idCradNum: '证件号'
      },
      confirmInfo: {
        loansInterstRate: '',
        guaranteeIr: '',
        guaranteeFee: '',
        refundMode: '',
        loansTimeLimit: '',
        loansPurpose: '',
        debitCardNum: '',
        loansUser: '',
        idCradNum: ''
      },
      protocolList: [
        { code: '07', name: '广发银行贷款合同及相关授权协议', isNess: true, isReadOver: false }
        // { code: "07", name: "互联网个人经营性贷款借款合同", isNess: true, isReadOver: false },
        // { code: "10", name: "担保服务合同", isReadOver: false },
        // { code: "08", name: "用途申明书", isReadOver: false },
        // { code: "02", name: "还款账户变更和授信期限变更协议", isReadOver: false }
      ],
      isShowProtocol: false,
      protocolText: [],
      redirectUrl: '',
      isShowModel: false,
      ruleValidate: {
        smsCode: [{ required: true, message: '请输入验证码', trigger: 'onBlur' }]
      },
      arrowSignShow: true
    };
  },

  components: {
    // "show-item": showItem,
    'v-com-model': ComModel,
    'p-protocol-list': ProtocolList,
    SendSms
  },

  mounted() {
    this.init();
  },

  methods: {
    init() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      setTimeout(() => {
        this.$toasting.hide();
        if (sessionStorage.getItem('xwe_borrow_info_single')) {
          this.isLoading = true;
          this.loansInfo = JSON.parse(sessionStorage.getItem('xwe_borrow_info_single')).formInfo;
          this.producDetail = JSON.parse(sessionStorage.getItem('xwe_borrow_info_single')).producDetail;
          let applyUnionKey = this.loansInfo.applyUnionKey;
          sessionStorage.setItem(SESSION_ID.unionKey, applyUnionKey);
          this.loansInfo.borrowBalanceDesc = toThousands(parseFloat(this.loansInfo.borrowBalance).toFixed(2));
          this.formateConfirmInfo();
        } else {
          this.isLoading = true;
          this.isShow = false;
        }
      }, 1500);
    },

    formateConfirmInfo() {
      let loansInfo = this.loansInfo;
      let confirmInfo = {
        loansInterstRate: `年化${parseFloat(loansInfo.interestRate * 100).toFixed(2)}%`,
        loansTimeLimit: loansInfo.loansTimeLimitName,
        refundMode: loansInfo.refundModeName,
        loansPurpose: loansInfo.loansPurposeName,
        debitCardNum: loansInfo.bankCardDesc,
        loansUser: this.$store.state.userInfo.name,
        idCradNum: this.$store.state.userInfo.idNo
      };
      this.confirmInfo = confirmInfo;
    },

    // 借款提交
    handleSubmit() {
      this.$refs.formDynamic
        .validate(['smsCode'])
        .then((valid) => {
          if (!valid) {
            if (!this.isAgree) {
              this.$notify.info({ msg: '请阅读并同意协议！' });
              return;
            }
            if (!this.protocolList[0].isReadOver) {
              this.$notify.info({ msg: '请阅读借款合同！' });
              this.isShowProtocol = true;
              return;
            }

            localStorage.loansInfo = JSON.stringify(this.loansInfo);
            localStorage.producDetail = JSON.stringify(this.producDetail);
            if (this.formItem.smsSerialNo) {
              let params = {
                applyUnionKey: this.loansInfo.applyUnionKey,
                productId: this.loansInfo.productId,
                // 借款的输入金额
                loanApplyAmount: this.loansInfo.borrowBalance,
                // 借款用途
                loanPurpose: this.loansInfo.loansPurpose,
                // 借款期限
                loanTerm: this.loansInfo.loansTimeLimit,
                // 还款和计息方式
                paymentType: '04',
                // 还息周期
                returninterestType: '4',
                // 还本周期
                returnperiod: '4',
                // 会话id
                sessionId: sessionStorage.getItem('withdraw_session_id'),
                // 验证码
                verifyCode: this.formItem.smsCode,
                // 流水号
                smsSerialNo: this.formItem.smsSerialNo
              };
              this.$dialog
                .confirm({
                  title: '提示',
                  message: '确定借款？'
                })
                .then(() => {
                  this.$toasting.show({ message: '申请中', forbidClick: true });
                  gfBorrowingApply(params)
                    .then((res) => {
                      if (res?.data?.data && res.data.success) {
                        sessionStorage.removeItem('xwe_borrow_info_single');
                        this.$router.replace({
                          path: '/xwe_loans_result',
                          query: {
                            borrowRes: { code: res.data.data.loanApplyStatus, desc: res.data.data.loanApplyStatusStr }
                          }
                        });
                      } else {
                        this.$notify.error({ msg: '申请失败，请重新填写信息，再次申请！' });
                      }
                    })
                    .catch((err) => {
                      this.$notify.error({
                        msg: err?.data?.msg || '申请失败，请重新填写信息，再次申请！'
                      });
                    })
                    .finally(() => {
                      this.$toasting.hide();
                    });
                });
            } else {
              this.$notify.info({ msg: '验证码失效，请一分钟之后，再次发送！' });
            }
          }
        })
        .catch((_) => {
          if (this.arrowSignShow) {
            this.$notify.info({ msg: '请展开, 填写手机验证码！' });
          }
        });
    },

    // 发送验证码
    sendSmsBank() {
      if (sessionStorage.getItem(SESSION_ID.withdrawSessionId) && sessionStorage.getItem(SESSION_ID.unionKey)) {
        let params = {
          applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey),
          sessionId: sessionStorage.getItem(SESSION_ID.withdrawSessionId)
        };
        this.$toasting.show({ message: '发送中', forbidClick: true });
        this.$refs['send-sms-bank'].smsSending();
        gfSendMess(params)
          .then((res) => {
            if (res?.data?.success && res.data.data) {
              this.formItem.smsSerialNo = res.data.data;
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
        this.$refs['send-sms-bank'].sendError();
      }
    },

    switchShowProtocol() {
      this.isShowProtocol = !this.isShowProtocol;
    },

    getProtocolText(protocol) {
      this.protocolText = [];
      // let fileType = protocol.code;
      let index = protocol.index;
      let params = {
        applyUnionKey: this.loansInfo.applyUnionKey,
        productId: this.loansInfo.productId,
        // 借款的输入金额
        loanApplyAmount: this.loansInfo.borrowBalance,
        // 借款用途
        loanPurpose: this.loansInfo.loansPurpose,
        // 借款期限
        loanTerm: this.loansInfo.loansTimeLimit,
        // 还款和计息方式
        paymentType: '04',
        // 还息周期
        returninterestType: '4',
        // 还本周期
        returnperiod: '4',
        // 会话id
        sessionId: sessionStorage.getItem('withdraw_session_id'),
        // 验证码
        verifyCode: this.formItem.smsCode,
        // 流水号
        smsSerialNo: this.formItem.smsSerialNo
      };
      getGFLendingContract(params)
        .then((res) => {
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
    },

    switchModel() {
      this.isShowModel = !this.isShowModel;
    },

    // 箭头展示
    arrowSign() {
      this.$nextTick(() => {
        this.arrowSignShow = false;
        let ele = document.getElementsByClassName('scroll-list-borrow');
        ele[0].style.overflow = 'auto';
        ele[0].scrollTop = ele[0].scrollHeight;
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.confirm-borrow {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wrapper {
  min-height: 100vh;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hiddens;
  background: rgba(244, 246, 249, 1);
  padding-bottom: 1.875rem;
  .card {
    text-align: center;
    background: #ffffff;
    padding: 23px 20px 20px 20px;
    border-radius: 10;
    .guarantee-count {
      font-size: 66px;
      margin-top: 20px;
      font-weight: 600;
      color: #333;
    }
    .qa-icon {
      height: 30px;
      width: 30px;
      position: relative;
      bottom: 10px;
      left: 15px;
    }
    .guarantee-unit {
      font-size: 28px;
      font-weight: 500;
      color: rgba(51, 51, 51, 1);
      margin: 10px 0 25px 0;
    }
  }
  .title-wrapper {
    display: flex;
    align-items: center;
    font-size: 28px;
    font-weight: 500;
    .logo {
      height: 80px;
      width: 80px;
      margin-right: 25px;
    }
  }
  .list-wrapper {
    flex: 1;
    overflow: hidden;
    background: #ffffff;
    margin-top: 15px;
    padding: 0 0 12px 0;
    // position: relative;

    // border-radius: 10px;
  }
  .list-bottom-show-arrow {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 5px;
    .arrow-sign {
      transform: rotate(90deg);
      font-size: 46px;
    }
  }
  .item-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30px 30px;
    border-bottom: 1px rgba(238, 241, 245, 1) solid;
    .last-item {
      font-size: 28px;
      font-weight: 500;
      color: rgba(27, 111, 251, 1);
    }
    .ic_arrow {
      height: 20px;
      width: 20px;
    }
  }
  .model-desc {
    color: rgba(217, 50, 50, 1);
    margin: 3.5rem 0 4.5rem 0;
    text-align: center;
    p {
      font-size: 24px;
      font-weight: 500;
    }
  }
  .sub-btn {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    button {
      width: 80%;
    }
  }
}
::v-deep(.van-field__error-message) {
  z-index: 10 !important;
}
.protocol-link-wrapper {
  padding: 30px 30px;
  display: flex;
  align-items: flex-start;
  font-size: 24px;
  .protocol-select-btn {
    margin-top: 0.25rem;
    margin-right: 0.25rem;
  }
  .protocol {
    color: #1b6ffb;
  }
}
.loan-roat-desc {
  position: absolute;
  top: 30px;
  right: 20px;
  font-size: 18px;
}
.confirm-key {
  font-size: 28px;
  font-weight: 500;
}
.confirm-val {
  font-size: 28px;
  font-weight: 500;
  text-align: right;
}
.empty-wrapper {
  position: absolute;
  top: -70px;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  p {
    font-size: 36px;
    margin-top: 22px;
    font-weight: 600;
  }
  .empty-icon {
    width: 330px;
    height: 330px;
  }
}

.van-cell {
  overflow: unset;
}
</style>
