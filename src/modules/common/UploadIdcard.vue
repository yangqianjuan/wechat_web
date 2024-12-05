<template>
  <div v-if="!isOverVerify">
    <div class="remind">{{readOver ? "请核对身份证信息" : "请使用本人身份证照片"}}</div>
    <!--上传识别身份证-->
    <div v-if="!readOver">
      <div class="item-wrapper" @click="chooseImg('picFace')">
        <p class="sec-title">上传人像页照片</p>
        <div class="img-wrapper front-bg">
          <div class="select-img-wrapper">
            <img :class="frontNeedRoate ? 'rotate-img' : 'select-img'" :src="picFace" v-if="picFace" alt="人像页" />
          </div>
          <div class="notice-wrapper" :class="picFace ? 'img-wrapper-selected' : ''">
            <img class="shoot-icon" :src="picFace ? reChooseIcon : takePicIcon" />
            <span class="shoot-desc" :class="picFace ? 'img-select-text' : ''">点击拍照</span>
          </div>
        </div>
      </div>

      <div class="item-wrapper" @click="chooseImg('picNationalEm')">
        <p class="sec-title">上传国徽页照片</p>
        <div class="img-wrapper">
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
    <!--确认身份信息-->
    <div v-if="readOver" class="show-container">
      <Form :model="idCard" :label-width="75" :rules="ruleValidate" ref="formDynamic" label-position="left">
        <FormItem label="姓名" prop="name">
          <i-input v-model="idCard.name"></i-input>
        </FormItem>
        <FormItem label="地址" prop="address">
          <i-input v-model="idCard.address"></i-input>
        </FormItem>
        <FormItem label="身份证号" prop="idNum">
          <i-input v-model="idCard.idNum"></i-input>
        </FormItem>
        <FormItem label="签发机关" prop="authority">
          <i-input v-model="idCard.authority"></i-input>
        </FormItem>
        <FormItem label="有效期" prop="authority">
          <i-input v-model="idCard.validDate" disabled></i-input>
        </FormItem>
      </Form>
      <!-- <div v-for="(item, key) in idCard" :key="key">
        <show-item v-if="userInfoKey[key]" :itemName="userInfoKey[key]" :itemVal="item"></show-item>
      </div>-->
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
    <div>
      <Button
        @click="readOver ? submitInfo('formDynamic') : uploadIdPic()"
        class="sub-btn"
        type="primary"
        :loading="isLoading"
      >{{readOver ? '确认提交' : '确认上传'}}</Button>
      <Button class="sub-btn" v-if="readOver" @click="resetImgUrl">重新选择</Button>
    </div>
  </div>
</template>
<script>
import { chooseWxImage, getFileName } from '../../utils/wx/wxUtils';
import { idCardOCR } from '@/request/interface/txQrc/readerPci';
import initUploadObj from '../../controller/upload';
import { dataURLtoFile, mergeObj, jdugeImgDirection } from '../../utils/common/common';
import { updateUserInfo, jdugeNewUserRoute } from '../../controller/userController';
import IdCard from '../../model/IdCared';
import ProtocolList from '@/common/components/common/ProtocolList.vue';
import MxProtocol from '@/common/mixin/MxProtocol.js';

export default {
  /**
   * 身份证上传和扫描之后信息的确认，saas和xmkd共享的页面
   *      主要区分是根据：referrer （销售id）和 productId（产品id）
   *
   * */
  name: 'UploadIdcard',
  data() {
    const validateIdNum = (rule, value, callback) => {
      let _IDRe18 = /^([1-6][1-9]|50)\d{4}(18|19|20)\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
      let _IDre15 = /^([1-6][1-9]|50)\d{4}\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}$/;
      const regIdNum18 = new RegExp(_IDRe18);
      const regIdNum15 = new RegExp(_IDre15);
      if (regIdNum18.test(value) || regIdNum15.test(value)) {
        callback();
      } else {
        callback(new Error('身份证号格式错误！'));
      }
    };

    return {
      picFace: '',
      picNationalEm: '',
      takePicIcon: require('../../assets/imgs/ic_shoot.png'),
      reChooseIcon: require('../../assets/imgs/icon/ic_re_choose.png'),
      isLoading: false,
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
        name: [{ required: true, message: '请填写姓名', trigger: 'blur' }],
        address: [{ required: true, message: '请填写地址', trigger: 'blur' }],
        idNum: [
          { required: true, message: '请填写身份证号', trigger: 'blur' },
          { required: true, validator: validateIdNum }
        ],
        authority: [{ required: true, message: '请填写签发机关', trigger: 'blur' }]
      }
    };
  },
  mixins: [MxProtocol],
  components: {
    'p-protocol-list': ProtocolList
  },
  created() {
    this.setWechatTitle('上传身份证照片');
    let referrer = this.$route.query.referrer || localStorage.referrer;
    let productId = this.$route.query.productId || localStorage.productId;
    this.referrer = referrer;
    this.productId = productId;
    this.getProtocolList(productId);
  },
  methods: {
    dateChange(value) {
      console.log(value);
    },
    chooseImg(target) {
      let japiList = ['chooseImage', 'uploadImage', 'getLocalImgData', 'previewImage'];
      let isPress = true;
      this.$toasting.show({ message: '读取中', forbidClick: true });
      chooseWxImage(japiList, isPress)
        .then((res) => {
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
          this.$notify.error({ msg: err?.data?.msg || '相册读取失败！' });
        })
        .finally((_) => {
          this.$toasting.hide();
        });
    },
    // 上传、识别idCard
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
          this.isLoading = true;
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
              let idcarddArr = res.data.data;
              let idCardRes = mergeObj(idcarddArr[0], idcarddArr[1]);
              let idCard = new IdCard(idCardRes);
              this.readOver = !this.readOver;
              this.setWechatTitle('身份证信息确认');
              this.idCard = idCard;
            })
            .catch((err) => {
              this.$notify.error({ msg: '识别失败！' });
              this.uploadFail(err);
            })
            .finally(() => {
              this.isLoading = false;
              this.$toasting.hide();
            });
        }
      } else {
        this.$notify.error({ msg: '请选择图片！' });
      }
    },
    uploadUtil(picFace) {
      let that = this;
      return new Promise((resolve, reject) => {
        initUploadObj(that, new Date().getTime(), picFace, 'image', (res) => {
          resolve(res.pic);
        });
      });
    },
    uploadFail(err) {
      this.resetImgUrl();
    },
    resetImgUrl() {
      this.readOver = false;
      this.picFace = '';
      this.picNationalEm = '';
    },
    getProtocolText(protocol) {
      let index = protocol.index;
      this.protocolText = [];
      let params = {
        idCard: this.idCard.idNum,
        userName: this.idCard.name,
        fileType: protocol.code
      };
      this.queryProtocolText(params, index);
    },
    switchShowProtocol() {
      this.isShowProtocol = !this.isShowProtocol;
    },
    // 上传个人信息
    submitInfo(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (!this.protocolList[1].isReadOver) {
            this.$notify.info({ msg: '请阅读并同意协议！' });
            this.isShowProtocol = true;
            return false;
          }
          if (!this.isAgree) {
            this.$notify.info({ msg: '请阅读并同意协议！' });
            return;
          }
          this.isLoading = true;
          this.$toasting.show({ message: '上传中', forbidClick: true });
          let idCard = this.idCard;
          idCard.referrer = this.referrer || localStorage.referrer;
          idCard.productId = this.productId || localStorage.productId;
          updateUserInfo(idCard)
            .then((res) => {
              if (res?.data?.success) {
                jdugeNewUserRoute();
                this.$router.replace({ path: '/idno_name_phone_verify' });
              } else {
                this.isLoading = false;
                this.$notify.error({ msg: res?.data?.msg || '身份证上传失败！' });
              }
            })
            .catch((err) => {
              this.isLoading = false;
              this.$notify.error({ msg: err?.data?.msg || '信息更新失败！' });
            })
            .finally((_) => {
              this.$toasting.hide();
            });
        }
      });
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
  background-image: url('../../assets/imgs/bg_national_emblem.png');
  background-repeat: no-repeat;
  background-size: contain;
  display: flex;
  justify-content: center;
  position: relative;
}
.front-bg {
  background-image: url('../../assets/imgs/bg/bg_face.png');
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
.show-container {
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
// .pdf-wrapper {
//   position: fixed;
//   height: 100vh;
// }
::v-deep(.ivu-form-item-label:before) {
  content: '';
}
::v-deep(.ivu-input) {
  border: none;
  padding: 0;
}
::v-deep(.ivu-form-item) {
  margin-bottom: 0;
  padding-top: 0.5rem;
  padding-bottom: 0.8125rem;
  border-bottom: 1px solid #eadfdf;
  padding-left: 1.25rem;
}
::v-deep(.ivu-form-item-error-tip) {
  padding-top: 0;
}
::v-deep(.ivu-input[disabled]) {
  background: #ffffff;
}
.proptocol {
  width: 100%;
  color: #1b6ffb;
  text-align: center;
  position: absolute;
  bottom: 30px;
}
</style>
