<!--
 * @Author: hsf
 * @Date: 2023-06-16 09:19:20
 * @LastEditors: hsf
 * @LastEditTime: 2024-05-30 10:56:04
 * @Description:
-->
<template>
  <div class="authentication beijing-common">
    <step :steps="[0]"></step>

    <!-- 身份证上传 -->
    <div class="id-card">
      <div class="title">1、上传你的身份证照片</div>
      <div class="tip">
        <span>拍摄时确保身份证</span>
        <span class="important">边框完整，字体清晰，亮度均匀</span>
      </div>
      <div class="upload-box">
        <div class="card-item" @click="uploadIdCardHandler('picFace')">
          <img v-if="picFace" :src="picFace" alt="" class="card" />
          <img v-else src="../../../static/image/card_back.png" alt="" class="card" />
          <img src="../../../static/image/photo.png" alt="" class="photo" />
          <div class="btn">拍摄人像面</div>
        </div>
        <div class="card-item" @click="uploadIdCardHandler('picNationalEm')">
          <img v-if="picNationalEm" :src="picNationalEm" alt="" class="card" />
          <img v-else src="../../../static/image/card_front.png" alt="" class="card" />
          <img src="../../../static/image/photo.png" alt="" class="photo" />
          <div class="btn">拍摄国徽面</div>
        </div>
      </div>
    </div>

    <!-- 个人信息 -- ocr 回填 -->
    <div class="user-information">
      <van-form validate-first :label-width="70" ref="formDynamic">
        <van-field v-model="idCard.name" name="name" label="姓名" placeholder="扫描识别后自动填充" />
        <van-field v-model="idCard.idNum" name="idNum" label="身份证号" placeholder="扫描识别后自动填充" />
        <van-field v-model="idCard.address" name="address" label="住址" placeholder="扫描识别后自动填充" />
        <van-field v-model="idCard.authority" name="authority" label="签发机关" placeholder="扫描识别后自动填充" />
        <van-field
          v-model="idCard.validDate"
          name="validDate"
          disabled
          label="有效日期"
          placeholder="扫描识别后自动填充"
        />
      </van-form>
    </div>

    <!-- 电话填写 -- 三要素 -->
    <div class="mobile">
      <van-form validate-first ref="formDynamicSms">
        <van-field
          v-model="phoneInfo.phoneNum"
          name="phoneNum"
          label="手机号"
          placeholder="请输入手机号"
          :disabled="phoneInfo.phoneDisabled"
          :class="['phone__input--normal', phoneInfo.phoneDisabled ? 'phone__input--disabled' : '']"
          :rules="ruleValidateSMS.phoneNum"
        >
          <template #button>
            <div class="changeNumber" @click="modifyPhone">点击更换</div>
          </template>
        </van-field>
        <van-field
          v-model="phoneInfo.smsCode"
          name="smsCode"
          :class="['sms__input--normal']"
          label="验证码"
          minlength="6"
          maxlength="6"
          placeholder="请输入验证码"
          :rules="ruleValidateSMS.smsCode"
        >
          <div slot="right-icon" class="sms-content changeNumber">
            <SendSms ref="send-sms-bank" @sendSms="sendSmsBank"></SendSms>
          </div>
        </van-field>
      </van-form>
    </div>

    <!-- 更换手机号 -->
    <div class="modify-phone beijing-common">
      <van-dialog
        v-model="modifyPhoneShow"
        title="更换手机号"
        clearable
        :close-on-click-overlay="false"
        show-cancel-button
        :before-close="changePhoneHandler"
      >
        <van-form validate-first ref="formDynamicChangePhone" label-width="50">
          <van-field
            v-model="changePhoneInfo.phoneNum"
            name="phoneNum"
            autofocus
            label=""
            placeholder="请输入手机号"
            :rules="changeRuleValidatePhone.phoneNum"
          >
          </van-field>
        </van-form>
      </van-dialog>
    </div>

    <!-- 协议信息 -->
    <div class="protocol-link-wrapper agreement" v-if="!isShowProtocol">
      <img
        v-if="isAgree"
        @click="isAgree = !isAgree"
        src="../../../static/image/selected.png"
        alt=""
        class="checkBox"
      />
      <img v-else @click="isAgree = !isAgree" src="../../../static/image/unselected.png" alt="" class="checkBox" />
      <p>
        <label for="agree">本人己阅读并同意签署</label>
        <span @click="switchUploadShowProtocol" class="sign">{{ ptotocolListShowText }}</span>
      </p>
    </div>

    <div class="pdf-wrapper beijing-protocol" v-if="isShowProtocol">
      <p-protocol-list
        @closeProtocol="switchUploadShowProtocol"
        @getProtocolText="getProtocolText"
        :protocolText="protocolText"
        :protocolList="protocolList"
      ></p-protocol-list>
    </div>

    <div class="set"></div>
    <div class="submitBox">
      <div class="tip">请确认身份证信息无误后再提交!</div>
      <van-button :disabled="!isSubmitDisabledUpdateInfo" class="submit" @click="submitInfoToNext">确认提交</van-button>
    </div>
  </div>
</template>
<script>
import Step from '../../../component/steps/Steps.vue';
import { chooseWxImage, getFileName } from '@/utils/wx/wxUtils';
import { idCardOCR } from '@/request/interface/txQrc/readerPci';
import initUploadObj from '@/controller/upload';
import { dataURLtoFile, jdugeImgDirection as judgeImgDirection, mergeObj } from '@/utils/common/common';
import { jdugeNewUserRoute, updateBeiJingUserInfo } from '@/controller/userController';
import IdCard from '@/model/IdCared';
import ProtocolList from '@/common/components/common/ProtocolList.vue';
import MxProtocol from '@/common/mixin/MxProtocol.js';
import {
  beijingDialog,
  clickControl,
  pageKeyInfoSearch,
  validateIdCard,
  validatePhoneNo,
  validateSmsCode
} from '../../../utils/common';
import SendSms from '../../../component/sms/SendSms.vue';
import { beijingChangePhone, beijingSendCode } from '@/request/interface/impower/UserInfo';
import { formateDate } from '@/utils/dataProcess/dateUtil';
import _ from 'lodash';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath';

let cacheUploadIdCard = {};
export default {
  /**
   * 北京 -- 身份证信息上传
   */
  name: 'BjbUploadIdCard',
  mixins: [MxProtocol],
  components: {
    'p-protocol-list': ProtocolList,
    Step,
    SendSms
  },
  data() {
    return {
      sendCode: '发送验证码',
      isChecked: false,
      picFace: '',
      picNationalEm: '',
      takePicIcon: require('@/assets/imgs/ic_shoot.png'),
      reChooseIcon: require('@/assets/imgs/icon/ic_re_choose.png'),
      isShowProtocol: false,
      isAgree: '',
      isSubmitOCR: false,

      // 身份证ocr之后的信息
      idCard: {},
      phoneInfo: {
        phoneNum: '',
        userName: '',
        smsCode: '',
        userId: '',
        phoneDisabled: false,
        smsIdentificationCode: undefined
      },
      // change phone
      changePhoneInfo: {
        phoneNum: ''
      },
      modifyPhoneShow: false,
      referrer: '',
      productId: '',
      applyUnionKey: '',

      ruleValidate: {
        name: [{ required: true, message: '请填写姓名', trigger: 'onBlur' }],
        address: [{ required: true, message: '请填写地址', trigger: 'onBlur' }],
        idNum: [
          { required: true, message: '请填写身份证号', trigger: 'onBlur' },
          { required: true, validator: validateIdCard, message: '身份证号格式错误！' }
        ],
        authority: [{ required: true, message: '请填写签发机关', trigger: 'onBlur' }]
      },

      // 校验规则
      ruleValidateSMS: {
        phoneNum: [
          { required: true, message: '请输入手机号', trigger: 'onBlur' },
          { required: true, validator: validatePhoneNo, message: '手机号格式错误！' }
        ],
        smsCode: [
          { required: true, message: '请输入验证码', trigger: 'onBlur' },
          { required: true, validator: validateSmsCode, message: '验证码格式错误！' }
        ]
      },

      // change phone rule
      changeRuleValidatePhone: {
        phoneNum: [
          { required: true, message: '请输入手机号', trigger: 'onBlur' },
          { required: true, validator: validatePhoneNo, message: '手机号格式错误！' }
        ]
      }
    };
  },
  created() {
    this.init();
  },

  computed: {
    isSubmitDisabledUpdateInfo() {
      return this.idCard.idNum && this.phoneInfo.smsCode && this.phoneInfo.smsIdentificationCode;
    }
  },

  watch: {
    isSubmitOCR: {
      handler(nVal, oVal) {
        if (nVal && this.picFace && this.picNationalEm) {
          this.submitOCR();
        }
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    async init() {
      this.setWechatTitle('上传身份证照片');
      const { referrer, productId, applyUnionKey, phone } = await pageKeyInfoSearch.call(this);

      if (referrer) {
        this.referrer = referrer;
        this.productId = productId;
        this.applyUnionKey = applyUnionKey;
        if (phone) {
          this.phoneInfo.phoneNum = phone;
          this.phoneInfo.phoneDisabled = true;
        }
        this.getProtocolList(this.productId);
        return;
      }

      this.$toasting.info({ msg: '未找到用户的相关信息，请退出页面，重新进入' });
    },

    uploadIdCardHandler(target) {
      clickControl.call(this, this.chooseImg(target));
    },

    async chooseImg(target) {
      try {
        this.resetUploadIdCardStatus(target);
        let jsApiList = ['chooseImage', 'uploadImage', 'getLocalImgData', 'previewImage'];
        let isPress = true;
        let chooseRes = await chooseWxImage(jsApiList, isPress);
        this.$toasting.show({ message: '读取中', forbidClick: true });
        await judgeImgDirection(chooseRes);

        // 正面人脸 -- 信息的保存
        if (target === 'picFace') {
          this.picFace = chooseRes;
          return;
        }

        // 反面 -- 国徽
        this.picNationalEm = chooseRes;
      } catch (error) {
        beijingDialog({
          message: '相册读取失败！',
          confirmButtonText: '确定'
        });
      } finally {
        //  start OCR
        if (this.picFace && this.picNationalEm) {
          this.isSubmitOCR = true;
        }
        this.$toasting.hide();
      }
    },

    resetUploadIdCardStatus(target) {
      if (!target) {
        return;
      }

      if (this.picFace && this.picNationalEm) {
        switch (target) {
          case 'picFace': {
            this.picFace = null;
            this.isSubmitOCR = false;
            this.clearUploadInfo();
            break;
          }

          case 'picNationalEm': {
            this.picNationalEm = null;
            this.isSubmitOCR = false;
            this.clearUploadInfo();
            break;
          }
        }
      }
    },

    // clear upload info
    clearUploadInfo() {
      this.idCard = {};
    },

    // rouse start OCR
    submitOCR() {
      clickControl.call(this, this.uploadIdPic);
    },

    async uploadIdPic() {
      if (this.picFace && this.picNationalEm) {
        try {
          let params = {
            frontImageUrl: this.picFace,
            backImageUrl: this.picNationalEm,
            productId: this.productId,
            selfFlag: true
          };

          let picFace = dataURLtoFile(this.picFace, getFileName());
          let picNationalEm = dataURLtoFile(this.picNationalEm, getFileName());

          this.$toasting.show({ message: '识别中', forbidClick: true });

          let uploadFrontRes = await this.uploadUtil(picFace);
          let uploadBackRes = await this.uploadUtil(picNationalEm);

          params.frontImageUrl = uploadFrontRes;
          params.backImageUrl = uploadBackRes;

          if (params.frontImageUrl && params.backImageUrl) {
            let ocrRes = await idCardOCR(params);
            let idcarddArr = ocrRes?.data?.data || null;

            if (idcarddArr) {
              this.$toasting.success({ msg: '识别成功' });

              setTimeout(() => {
                let idCardRes = mergeObj(idcarddArr[0], idcarddArr[1]);
                let idCard = new IdCard(idCardRes);
                this.idCard = idCard;
                // cacheUploadIdCard = _.cloneDeep(idCard);
              }, 500);
            } else {
              this.$toasting.error({ msg: '识别失败' });
            }
          }
        } catch (error) {
          this.$toasting.error({ msg: error?.data?.msg || '识别失败' });
          this.uploadFail(error);
        } finally {
          this.$toasting.hide();
        }
      } else {
        this.$toasting.info({ msg: '请选择图片' });
      }
    },

    uploadUtil(picFace) {
      let that = this;
      return new Promise((resolve, reject) => {
        initUploadObj(that, new Date().getTime(), picFace, 'image', res => {
          resolve(res.pic);
        });
      });
    },

    uploadFail(err) {
      this.resetImgUrl();
    },

    // reset
    resetImgUrl() {
      this.isSubmitOCR = false;
      this.picFace = '';
      this.picNationalEm = '';
    },

    getProtocolText(protocol) {
      this.protocolText = [];
      let index = protocol.index,
        params = {
          idCard: this.idCard.idNum,
          userName: this.idCard.name,
          fileType: protocol.code
        };
      this.queryProtocolText(params, index).then(res => {
        if (res && this.protocolList?.length) {
          let isAllRead = this.protocolList.every(item => {
            return item.isReadOver;
          });
          isAllRead && (this.isAgree = true);
        }
      });
    },

    switchUploadShowProtocol() {
      if (!this.idCard.idNum || !this.idCard.name) {
        this.$toasting.info({ msg: '请上传身份证', className: 'read-protocol' });
        return;
      }

      this.isShowProtocol = !this.isShowProtocol;
    },

    sendSmsBank() {
      if (!this.idCard.idNum || !this.picFace || !this.picNationalEm) {
        this.$toasting.info({ msg: '请上传身份证' });
        return;
      }
      this.$refs.formDynamicSms.validate(['phoneNum']).then(async res => {
        if (!res) {
          this.$toasting.show({ message: '发送中', forbidClick: true });
          this.$refs['send-sms-bank'].smsSending();
          try {
            let [idValidityStart, idValidityStop] = this.idCard.validDate.split('-');
            idValidityStart = formateDate(idValidityStart, '.');

            if (idValidityStop === '长期') {
              let date = new Date();
              date.setFullYear(9999);
              idValidityStop = date;
            } else {
              idValidityStop = formateDate(idValidityStop, '.');
            }

            let params = {
              applyUnionKey: this.applyUnionKey,
              idAddress: this.idCard.address,
              idBirthday: formateDate(this.idCard.birth, '/'),
              idNo: this.idCard.idNum,
              idValidityStart: idValidityStart,
              idValidityStop: idValidityStop,
              mobileNo: this.phoneInfo.phoneNum,
              userName: this.idCard.name
            };
            let sendRes = await beijingSendCode(params);
            if (sendRes?.data?.success && sendRes.data.data) {
              // send sms first and compare assign to cacheUploadIdCard
              if (!this.phoneInfo.smsIdentificationCode && sendRes.data.data.referenceNo) {
                cacheUploadIdCard = _.cloneDeep(this.idCard);
              } else if (this.phoneInfo.smsIdentificationCode && sendRes.data.data.referenceNo) {
                const checkRes = _.isEqual(this.idCard, cacheUploadIdCard);
                if (!checkRes) {
                  cacheUploadIdCard = _.cloneDeep(this.idCard);
                }
              }

              this.phoneInfo.smsIdentificationCode = sendRes.data.data.referenceNo;
            }
            sendRes?.data?.success
              ? this.$refs['send-sms-bank'].sendSuccess()
              : this.$refs['send-sms-bank'].sendError(sendRes?.data?.msg);
          } catch (error) {
            if (error?.code !== 403) {
              this.$refs['send-sms-bank'].sendError(error?.data?.msg);
            } else {
              this.$refs['send-sms-bank'].reset();
            }
            this.$toasting.hide();
          }
        } else {
          this.$toasting.info({ msg: '暂无手机号' });
        }
      });
    },

    resetSmsCodeStatus() {
      this.phoneInfo.smsIdentificationCode = '';
      this.phoneInfo.smsCode = '';
    },

    changePhoneHandler(action, done) {
      if (action === 'confirm') {
        if (this.phoneInfo.phoneNum === this.changePhoneInfo.phoneNum) {
          done();
          return;
        }

        this.$refs.formDynamicChangePhone
          .validate(['phoneNum'])
          .then(async res => {
            if (!res) {
              try {
                this.$toasting.show({ message: '更换中', forbidClick: true });
                let params = {
                  newMobileNo: this.changePhoneInfo.phoneNum
                };
                let changeRes = await beijingChangePhone(params);
                if (changeRes?.data?.success) {
                  this.phoneInfo.phoneNum = this.changePhoneInfo.phoneNum;
                  return;
                }
              } catch (error) {
                beijingDialog({
                  message: error?.data?.msg || '更换失败！',
                  confirmButtonText: '确定'
                });
              } finally {
                done();
                this.$toasting.hide();
              }
            }
          })
          .catch(_ => {
            done(false);
          });
      } else {
        done();
      }
    },

    submitInfoToNext() {
      const checkRes = _.isEqual(this.idCard, cacheUploadIdCard);
      if (!checkRes) {
        this.$toasting.info({ msg: '请重新发送验证码' });
        this.$refs['send-sms-bank'].reset();
        this.resetSmsCodeStatus();
        cacheUploadIdCard = _.cloneDeep(this.idCard);
        return;
      }

      clickControl.call(this, this.checkCardOrPhoneInfo);
    },
    checkCardOrPhoneInfo() {
      if (!this.isAgree) {
        this.$toasting.info({ msg: '请阅读并同意协议' });
        return;
      }

      this.$refs.formDynamic
        .validate(['name', 'address', 'idNum', 'authority'])
        .then(async res => {
          if (!res) {
            this.$refs.formDynamicSms.validate(['phoneNum', 'smsCode']).then(async res => {
              if (!res) {
                let idCard = this.idCard;
                idCard.referrer = this.referrer;
                idCard.productId = this.productId || '1155';
                idCard.mobileNo = this.phoneInfo.phoneNum;
                idCard.smsCode = this.phoneInfo.smsCode;
                idCard.referenceNo = this.phoneInfo.smsIdentificationCode;

                try {
                  this.$toasting.show({ message: '上传中', forbidClick: true });

                  // 1、update idCard info
                  const updateInfoRes = await updateBeiJingUserInfo(idCard);

                  if (updateInfoRes?.data?.success) {
                    let params = {
                      newMobileNo: this.phoneInfo.phoneNum
                    };
                    let changeRes = await beijingChangePhone(params);
                    if (changeRes?.data?.success) {
                      try {
                        let globalInfoPreSet = localStorage.globalInfoPreSet;
                        if (globalInfoPreSet) {
                          globalInfoPreSet = JSON.parse(globalInfoPreSet);
                          globalInfoPreSet = { ...globalInfoPreSet, phone: this.phoneInfo.phoneNum };
                          localStorage.globalInfoPreSet = JSON.stringify(globalInfoPreSet);
                        } else {
                          globalInfoPreSet = { phone: this.phoneInfo.phoneNum };
                          localStorage.globalInfoPreSet = JSON.stringify(globalInfoPreSet);
                        }
                      } catch (error) {}
                      // update

                      let singleCreditInfo = sessionStorage.getItem('single_credit_info') || {};

                      try {
                        if (singleCreditInfo && typeof JSON.parse(singleCreditInfo) === 'object') {
                          let creditInfo = JSON.parse(singleCreditInfo);
                          let result = {
                            ...creditInfo,
                            referrer: creditInfo.referrer,
                            productId: creditInfo.productId || '1155',
                            phone: this.phoneInfo.phoneNum
                          };
                          sessionStorage.setItem('single_credit_info', JSON.stringify(result));
                        }
                      } catch (error) {
                        console.log(error);
                      }

                      jdugeNewUserRoute();
                      cacheUploadIdCard = {};

                      let nextPath = await queryNextByUnionKeyAndProdId('1155');
                      setTimeout(() => {
                        this.$router.replace({
                          path: nextPath,
                          query: {
                            referrer: this.referrer,
                            productId: this.productId
                          }
                        });
                      }, 800);
                      // setTimeout(() => {
                      //   this.$router.replace({
                      //     path: '/bjb_face_pp',
                      //     query: {
                      //       referrer: this.referrer,
                      //       productId: this.productId
                      //     }
                      //   });
                      // }, 800);
                      return;
                    }
                    return;
                  }
                } catch (error) {
                  if (error?.data?.code === '10420') {
                    this.$router.replace({
                      path: '/bjb_credit_result',
                      query: {
                        referrer: this.referrer,
                        productId: this.productId,
                        errorMsg: error?.data?.msg
                      }
                    });
                  } else {
                    beijingDialog({
                      message: error?.data?.msg || '信息录入失败！',
                      confirmButtonText: '确定'
                    });
                  }
                } finally {
                  this.$toasting.hide();
                }
              }
            });
          }
        })
        .catch(err => {});
    },

    modifyPhone() {
      this.phoneInfo.phoneDisabled = false;
      this.phoneInfo.phoneNum = '';
      this.resetSmsCodeStatus();
      // this.changePhoneInfo.phoneNum = this.phoneInfo.phoneNum;
      // this.modifyPhoneShow = true;
      // beijingDialog({
      //   message: '确定修改手机号吗？',
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消'
      // })
      //   .then(_ => {
      //     this.phoneInfo.phoneDisabled = false;
      //     this.phoneInfo.phoneNum = '';
      //     this.phoneInfo.smsCode = '';
      //   })
      //   .catch(_ => {});
    }
  }
};
</script>
<style lang="scss" scoped>
.authentication {
  width: 100%;
  min-height: 100vh;
  background: #f8f8f8;
  position: relative;

  .id-card {
    padding: 40px;
    width: 686px;
    height: 433px;
    background: #ffffff;
    box-shadow: 0px 0px 32px -8px rgba(78, 6, 6, 0.2);
    border-radius: 16px;
    margin: 0 auto;
    margin-top: -190px;

    .title {
      font-size: 28px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #2b0e0c;
    }

    .tip {
      margin-top: 12px;
      font-size: 24px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #8f8b8a;

      .important {
        color: #df0301;
      }
    }

    .upload-box {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;

      .card-item {
        width: 288px;
        height: 236px;
        position: relative;

        .card {
          width: 288px;
          height: 172px;
        }

        .photo {
          position: absolute;
          width: 64px;
          top: 25%;
          left: 40%;
        }

        .btn {
          width: 288px;
          height: 64px;
          background: #df0301 linear-gradient(129deg, #cd1101 0%, #a70500 100%);
          border-radius: 0px 0px 16px 16px;
          font-size: 24px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #ffffff;
          text-align: center;
          line-height: 64px;
          margin-top: -10px;
        }
      }
    }
  }

  .user-information {
    margin: 0 auto;
    width: 686px;
    background: #ffffff;
    border-radius: 16px;
    margin-top: 32px;

    ::v-deep .van-field__label {
      color: #c8c9cc;
    }

    ::v-deep .van-field--disabled {
      .van-field__body .van-field__control {
        // color: #c8c9cc !important;
        color: #8f8b8a !important;
      }
    }
  }

  .mobile {
    margin: 0 auto;
    width: 686px;
    background: #ffffff;
    border-radius: 16px;
    margin-top: 32px;

    ::v-deep .van-field__label {
      color: #c8c9cc;
    }

    .changeNumber {
      ::v-deep .van-button__text {
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #df0301;
      }
    }

    .changeNumber {
      font-size: 28px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #df0301;
    }

    // phone input right icon
    .phone__input--normal {
      .changeNumber {
        width: 192px;
        height: 64px;
        background: #f9f5f5 linear-gradient(129deg, #cd1101 0%, #a70500 100%);
        border-radius: 32px;
        line-height: 64px;
        cursor: pointer;
        text-align: center;
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #ffffff;
      }
    }

    .phone__input--disabled {
      ::v-deep input {
        font-size: 28px !important;
        font-family: PingFangSC-Regular, PingFang SC !important;
        font-weight: 400 !important;
        color: #8f8b8a !important;
      }
    }

    // sms code status
    .sms__input--normal {
      .changeNumber {
        ::v-deep .van-button {
          width: 192px;
          height: 64px;
          background: #f9f5f5 linear-gradient(129deg, #cd1101 0%, #a70500 100%);
          border-radius: 32px;
          line-height: 64px;
          cursor: pointer;
          text-align: center;

          .van-button__content {
            .van-button__text {
              font-size: 28px;
              font-family: PingFangSC-Medium, PingFang SC;
              font-weight: 500;
              color: #ffffff;
            }
          }
        }
      }
    }
  }

  .agreement {
    margin: 24px 32px;
    display: flex;
    align-items: center;

    .checkBox {
      width: 24px;
      height: 24px;
      margin-right: 8px;
    }

    .sign {
      color: #335af5;
    }
  }

  .set {
    width: 750px;
    height: 212px;
    margin-top: 40px;
  }

  .submitBox {
    width: 750px;
    height: 212px;
    background: #ffffff;
    box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.11);
    position: fixed;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    .tip {
      font-size: 28px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #2b0e0c;
      margin-top: 28px;
      text-align: center;
    }

    .submit {
      width: 686px;
      height: 88px;
      background: linear-gradient(129deg, #b80701 0%, #9a0400 100%), linear-gradient(129deg, #cd1101 0%, #a70500 100%);
      border-radius: 45px;
      margin: 0 auto;
      margin-top: 24px;

      ::v-deep .van-button__text {
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #ffffff;
      }
    }
  }

  ::v-deep .van-field__control {
    font-size: 28px !important;
    font-family: PingFangSC-Medium, PingFang SC !important;
    font-weight: 500 !important;
    color: #2b0e0c !important;
    -webkit-text-fill-color: unset;
    text-fill-color: unset;
  }

  .modify-phone {
    ::v-deep .van-dialog {
      .van-dialog__header {
        padding-top: 48px;
        font-size: 32px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #2b0e0c;
        border: unset !important;
      }

      .van-dialog__content {
        padding: 28px 60px;

        .van-field::after {
          border: unset !important;
        }

        .van-field {
          border: 1px solid #d8d8d8;
        }

        .van-field__label {
          padding: 10px 0;
          white-space: nowrap;

          span {
            font-size: 32px !important;
            font-weight: 500 !important;
            color: #999999 !important;
          }
        }

        .van-field__value {
          .van-field__body {
            .van-field__control {
              font-family: PingFangSC-Semibold, PingFang SC !important;
              font-weight: 500 !important;
              color: #2b0e0c !important;
              font-size: 32px !important;
            }
          }
        }
      }

      .van-dialog__footer {
        .van-dialog__cancel {
          .van-button__text {
            font-size: 32px;
            font-family: PingFangSC-Semibold, PingFang SC;
            font-weight: 500;
            color: #2b0e0c;
          }
        }

        .van-dialog__confirm {
          .van-button__text {
            font-size: 32px;
            font-family: PingFangSC-Semibold, PingFang SC;
            font-weight: 500;
            color: #df0301;
          }
        }
      }
    }
  }
}
</style>
