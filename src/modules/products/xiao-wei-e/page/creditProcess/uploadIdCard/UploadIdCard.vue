<template>
  <div v-if="!isOverVerify" class="reset-form">
    <div class="remind">{{readOver ? "请核对身份证信息" : "请使用本人身份证照片"}}</div>
    <!--上传识别身份证 第一部分-- -->
    <div v-if="!readOver">
      <div class="item-wrapper">
        <p class="sec-title">上传人像页照片</p>
        <div class="img-wrapper front-bg" @click="chooseImg('picFace')">
          <div class="select-img-wrapper">
            <img :class="frontNeedRoate ? 'rotate-img' : 'select-img'" :src="picFace" v-if="picFace" alt="人像页" />
          </div>
          <div class="notice-wrapper" :class="picFace ? 'img-wrapper-selected' : ''">
            <img class="shoot-icon" :src="picFace ? reChooseIcon : takePicIcon" />
            <span class="shoot-desc" :class="picFace ? 'img-select-text' : ''">点击拍照</span>
          </div>
        </div>
      </div>

      <div class="item-wrapper">
        <p class="sec-title">上传国徽页照片</p>
        <div class="img-wrapper" @click="chooseImg('picNationalEm')">
          <div class="select-img-wrapper">
            <img
              :class="backNeedRoate ? 'rotate-img' : 'select-img'"
              :src="picNationalEm"
              v-if="picNationalEm"
              alt="国徽页"
            />
          </div>
          <div class="notice-wrapper" :class="picNationalEm ? 'img-wrapper-selected' : ''">
            <img class="shoot-icon" :src="picNationalEm ? reChooseIcon : takePicIcon" />
            <span class="shoot-desc" :class="picNationalEm ? 'img-select-text' : ''">点击拍照</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="readOver" class="show-container">
      <van-form validate-first ref="formDynamic">
        <van-field
          v-model="idCard.name"
          required
          name="name"
          label="姓名"
          placeholder="请输入姓名"
          :rules="ruleValidate.name"
        />
        <van-field
          v-model="idCard.address"
          name="address"
          required
          label="地址"
          placeholder="请输入地址"
          :rules="ruleValidate.address"
        />
        <van-field
          v-model="idCard.idNum"
          required
          name="idNum"
          label="身份证号"
          placeholder="请输入身份证号"
          :rules="ruleValidate.idNum"
        />
        <van-field
          v-model="idCard.authority"
          required
          name="authority"
          label="签发机关"
          placeholder="请输入签发机关"
          :rules="ruleValidate.authority"
        />
        <van-field v-model="idCard.validDate" required name="validDate" label="有效期" disabled placeholder="请输入有效期" />
      </van-form>
      <p class="notice">请确认身份证信息无误后，再提交！</p>
    </div>

    <div class="protocol-link-wrapper" v-if="!isShowProtocol && readOver">
      <input class="protocol-select-btn" id="agree" type="radio" value="agree" v-model="isAgree" />
      <p>
        <label for="agree">请阅读并同意协议</label>
        <span @click="switchShowProtocol" class="protocol">{{ ptotocolListShowText }}</span>
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

    <!-- 第一步，第二步 操作按钮 -->
    <div>
      <van-button
        @click="readOver ? submitInfo('formDynamic') : uploadIdPic()"
        class="sub-btn foot-operate-btn"
        type="primary"
        :loading="isLoading"
      >{{readOver ? '下一步' : '确认上传'}}</van-button>
      <van-button class="sub-btn rest-btn foot-operate-btn" v-if="readOver" @click="resetImgUrl">重新选择</van-button>
    </div>
  </div>
</template>
<script>
import { chooseWxImage, getFileName } from '@/utils/wx/wxUtils';
import { idCardOCR } from '@/request/interface/txQrc/readerPci';
import initUploadObj from '@/controller/upload';
import { dataURLtoFile, mergeObj, jdugeImgDirection } from '@/utils/common/common';
import { updateUserInfo, jdugeNewUserRoute } from '@/controller/userController';
import { getGfSessionId } from '@/controller/common.js';
import IdCard from '@/model/IdCared';
import ProtocolList from '@/common/components/common/ProtocolList.vue';
import MxProtocol from '@/common/mixin/MxProtocol.js';
import { validateIdCard } from '../../../utils/common';
import { SESSION_ID } from '@/utils/common/config.js';
export default {
  /**
   * gf身份证信息上传
   */
  name: 'XweUploadIdCard',
  mixins: [MxProtocol],
  components: {
    'p-protocol-list': ProtocolList
  },
  data() {
    return {
      picFace: '',
      picNationalEm: '',
      takePicIcon: require('@/assets/imgs/ic_shoot.png'),
      reChooseIcon: require('@/assets/imgs/icon/ic_re_choose.png'),
      isLoading: false,
      // 身份证图片是否读取
      readOver: false,
      frontNeedRoate: false,
      backNeedRoate: false,
      isShowProtocol: false,
      isAgree: '',
      idCard: {},
      redirectUrl: '',
      isOverVerify: '',
      referrer: '',
      productId: '',
      ruleValidate: {
        name: [{ required: true, message: '请填写姓名', trigger: 'onBlur' }],
        address: [{ required: true, message: '请填写地址', trigger: 'onBlur' }],
        idNum: [
          { required: true, message: '请填写身份证号', trigger: 'onBlur' },
          { required: true, validator: validateIdCard, message: '身份证号格式错误！' }
        ],
        authority: [{ required: true, message: '请填写签发机关', trigger: 'onBlur' }]
      }
    };
  },
  created() {
    this.init();
  },

  methods: {
    init() {
      this.setWechatTitle('上传身份证照片');
      let singleCreditInfo = sessionStorage.getItem('single_credit_info') || null;
      if (singleCreditInfo) {
        this.referrer = singleCreditInfo.referrer;
        this.productId = singleCreditInfo.productId || '1035';
        this.getProtocolList(this.productId);
      } else {
        this.isOverVerify = true;
        this.$notify.info({
          msg: '未找到用户的相关信息，请退出页面，重新进入！'
        });
      }
    },

    /**
     * 微信的一个工具，识别图片用的，
     *   1、识别成功，拿到图片的base64的编码，生产本地的url
     * */
    chooseImg(target) {
      let japiList = ['chooseImage', 'uploadImage', 'getLocalImgData', 'previewImage'];
      let isPress = true;
      chooseWxImage(japiList, isPress)
        .then((res) => {
          this.$toasting.show({ message: '读取中', forbidClick: true });
          // 正反面信息的保存
          if (target === 'picFace') {
            this.picFace = res;
            jdugeImgDirection(res).then((res) => {
              this.frontNeedRoate = res;
            });
          } else {
            this.picNationalEm = res;
            jdugeImgDirection(res).then((res) => {
              this.backNeedRoate = res;
            });
          }
        })
        .catch((err) => {
          this.$notify.error({
            msg: '相册读取失败！'
          });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    /**
     * 本页第一步；
     *      1、身份证图片信息上传，正反面都存在，上传图片文件数据uploadUtil，拿到返回的真实url
     *      2、验证身份证信息idCardOCR，验证通过到信息确认部分
     */
    uploadIdPic() {
      if (this.picFace && this.picNationalEm) {
        if (!this.readOver) {
          let params = {
            frontImageUrl: this.picFace,
            backImageUrl: this.picNationalEm,
            productId: this.productId,
            selfFlag: true
          };
          let picFace = dataURLtoFile(this.picFace, getFileName());
          let picNationalEm = dataURLtoFile(this.picNationalEm, getFileName());
          this.$toasting.show({ message: '识别中', forbidClick: true });
          this.uploadUtil(picFace)
            .then((res) => {
              params.frontImageUrl = res;
              return this.uploadUtil(picNationalEm);
            })
            .then((res) => {
              params.backImageUrl = res;
              if (params && params.frontImageUrl && params.backImageUrl) {
                return idCardOCR(params);
              }
            })
            .then((res) => {
              let idcarddArr = res?.data?.data ? res.data.data : null;
              if (idcarddArr) {
                this.$toasting.success({ msg: '识别成功' });
                setTimeout(() => {
                  let idCardRes = mergeObj(idcarddArr[0], idcarddArr[1]);
                  let idCard = new IdCard(idCardRes);
                  // console.log("上传的结果", idcarddArr, idCardRes, idCard);
                  this.readOver = !this.readOver;
                  this.setWechatTitle('身份证信息确认');
                  this.idCard = idCard;
                }, 1000);
              } else {
                this.$toasting.error({ msg: '识别失败' });
              }
            })
            .catch((err) => {
              this.$toasting.error({ msg: '识别失败' });
              this.uploadFail(err);
            })
            .finally(() => {
              this.isLoading = false;
              this.$toasting.hide();
            });
        }
      } else {
        this.$notify.info({
          msg: '请选择图片！'
        });
      }
    },

    /**
     * 文件上传
     */
    uploadUtil(picFace) {
      let that = this;
      return new Promise((resolve, reject) => {
        initUploadObj(that, new Date().getTime(), picFace, 'image', (res) => {
          resolve(res.pic);
        });
      });
    },

    /**
     * 文件上传失败
     * */
    uploadFail(err) {
      this.resetImgUrl();
    },

    resetImgUrl() {
      this.readOver = false;
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
      this.queryProtocolText(params, index);
    },

    switchShowProtocol() {
      this.isShowProtocol = !this.isShowProtocol;
    },

    /**
     * 本页的第二步：
     *     1、确认之后，上传身份证信息以及个人信息
     * */
    submitInfo(name) {
      this.$refs[name]
        .validate(['name', 'address', 'idNum', 'authority'])
        .then((res) => {
          if (!res) {
            if (!this.isAgree) {
              this.$notify.info({
                msg: '请阅读并同意协议！'
              });
              return;
            }
            let idCard = this.idCard;
            if (!this.$store.state.referrer) {
              idCard.referrer = localStorage.getItem('referrer');
            } else if (!this.$store.state.productId) {
              idCard.productId = localStorage.getItem('productId');
            } else {
              idCard.referrer = this.$store.state.referrer;
              idCard.productId = this.$store.state.productId;
            }
            idCard.productId = idCard.productId ? idCard.productId : '1035';
            this.$toasting.show({ message: '上传中', forbidClick: true });
            // 1、更新身份信息
            updateUserInfo(idCard)
              .then((res) => {
                if (res?.data?.success) {
                  jdugeNewUserRoute();
                  let applyUnionKey = sessionStorage.getItem(SESSION_ID.unionKey);
                  let params = {
                    applyUnionKey: applyUnionKey,
                    // 1 是授信阶段
                    type: 1
                  };
                  // 2、获取会话id
                  return getGfSessionId(params);
                } else {
                  return Promise.reject();
                }
              })
              .then(async (res) => {
                if (res?.data?.success) {
                  this.$toasting.success({ msg: '成功' });
                  setTimeout(() => {
                    this.$router.replace({ path: '/xwe_idno_name_phone_verify' });
                  }, 1500);
                } else {
                  this.$notify.error({
                    msg: res?.data?.msg || '信息录入失败，申请结束！'
                  });
                  // 业务结束
                  setTimeout(() => {
                    this.$router.replace('/');
                  }, 1500);
                }
              })
              .catch((err) => {
                this.isLoading = false;
                this.$notify.error({
                  msg: err?.data?.msg || '信息录入失败！'
                });
              })
              .finally(() => {
                this.$toasting.hide();
              });
          }
        })
        .catch((err) => {});
    }
  }
};
</script>
<style lang="scss" scoped>
.item-wrapper {
  padding-top: 40px;
}
.sec-title {
  font-size: 30px;
  font-weight: 600;
  color: rgba(51, 51, 51, 1);
  text-align: center;
}
.img-wrapper {
  width: 57vw;
  height: 36vw;
  margin: 0 auto;
  margin-top: 30px;
  margin-bottom: 50px;
  background-image: url('../../../../../../assets/imgs/bg_national_emblem.png');
  background-repeat: no-repeat;
  background-size: contain;
  display: flex;
  justify-content: center;
  position: relative;
}
.front-bg {
  background-image: url('../../../../../../assets/imgs/bg/bg_face.png');
}
.notice-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 100%;
  top: 0;
  bottom: 0;
  border-radius: 6px;
  .img-select-text {
    font-weight: 500;
    color: rgba(255, 255, 255, 1);
  }
}
.img-wrapper-selected {
  background: #000000;
  opacity: 0.6;
}
.shoot-icon {
  height: 80px;
  width: 80px;
}
.shoot-desc {
  font-size: 26px;
  font-weight: 700;
  margin-top: 26px;
  color: rgba(42, 118, 254, 1);
}
.sub-btn {
  width: 80%;
  margin-left: 10%;
  margin-top: 30px;
  padding-top: 18px;
  padding-bottom: 18px;
}
.rest-btn {
  border-color: #d8d8d8;
  /deep/.van-button__text {
    color: #333 !important;
  }
}
.show-container {
  padding-top: 20px;
  .notice {
    text-align: center;
    font-size: 24px;
    margin-top: 30px;
    font-weight: 400;
    color: rgba(219, 43, 19, 1);
  }
}
.select-img-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.select-img {
  width: 100%;
  object-fit: cover;
}
.rotate-img {
  height: 65vw;
  transform: rotate(-90deg);
  object-fit: cover;
}
.protocol-link-wrapper {
  padding: 0.875rem 0.9375rem 1.25rem 1.25rem;
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
.proptocol {
  width: 100%;
  color: #1b6ffb;
  text-align: center;
  position: absolute;
  bottom: 30px;
}
</style>
