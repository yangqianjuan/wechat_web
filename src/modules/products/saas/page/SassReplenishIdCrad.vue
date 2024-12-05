<template>
  <div>
    <div class="remind">{{replenisIdCardPageTitle[step]}}</div>
    <!--上传识别身份证-->
    <div v-if="step === 0">
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

    <div v-if="step === 1">
      <div class="item-wrapper" @click="chooseImg('picMarriageLicense')">
        <!-- <p class="sec-title">上传结婚证照片</p> -->
        <p class="sec-title">
          上传
          <span style="color:red;">结婚证</span> 照片
        </p>
        <div class="img-wrapper front-bg">
          <div class="select-img-wrapper">
            <img
              :src="picMarLicence"
              :class="marLicenseNeedRoate ? 'rotate-img' : 'select-img'"
              v-if="picMarLicence"
              alt="人像页"
            />
          </div>
          <div class="notice-wrapper" :class="picMarLicence ? 'img-wrapper-selected' : ''">
            <img class="shoot-icon" :src="picMarLicence ? reChooseIcon : takePicIcon" />
            <span class="shoot-desc" :class="picMarLicence ? 'img-select-text' : ''">点击拍照</span>
          </div>
        </div>
      </div>
    </div>
    <!--确认身份信息-->
    <div v-if="step === 2" class="show-container">
      <Form :model="idCard" :label-width="75" :rules="ruleValidate" ref="formDynamic" label-position="left">
        <FormItem label="姓名" prop="name">
          <i-input v-model="idCard.name"></i-input>
        </FormItem>
        <FormItem label="地址" prop="address">
          <i-input v-model="idCard.address"></i-input>
        </FormItem>

        <FormItem label="居住城市">
          <v-distpicker hide-area wrapper="selectAddress" @province="getPprovinceCode" @city="getCityCode"></v-distpicker>
          <span class="area-err-msg">{{locationErrmsg}}</span>
        </FormItem>

        <FormItem label="详细地址" prop="resideAddress">
          <div class="detail-address-input-wrapper">
            <input class="address-detail" v-model="idCard.resideAddress" placeholder="请输入详细地址" type="text" />
            <div class="map-btn-wrapper" @click="switchShowMap">
              <img class="ic-map-btn" :src="icLocation" alt />
              <p class="map-btn-desc">定位</p>
            </div>
          </div>
        </FormItem>

        <FormItem label="身份证号" prop="idNum">
          <i-input v-model="idCard.idNum"></i-input>
        </FormItem>
        <FormItem label="有效期" prop="authority">
          <i-input v-model="idCard.validDate" disabled></i-input>
        </FormItem>
        <FormItem label="手机号" prop="mobileNo">
          <i-input v-model="idCard.mobileNo" :maxlength="11"></i-input>
        </FormItem>
        <FormItem label="关系" prop="contactType" v-if="!isMarried">
          <Select v-model="idCard.contactType" style="width:200px">
            <Option v-for="item in contactTypeArr" :value="item.key" :key="item.key">{{ item.value }}</Option>
          </Select>
        </FormItem>
        <FormItem label="关系" v-else>
          <i-input v-model="defaultContactType" disabled></i-input>
        </FormItem>
      </Form>
      <p class="notice">请确认身份证信息无误后，再提交！</p>
    </div>
    <div>
      <Button
        @click="step === 0 ? uploadIdPic() : step === 1 ? uploadMarLicence() : submitInfo('formDynamic')"
        class="sub-btn"
        type="primary"
        :loading="isLoading"
      >{{step == 2 ? '确认提交' : '确认上传'}}</Button>
      <Button class="sub-btn" v-if="step !== 0" @click="preStep">上一步</Button>
    </div>
    <div class="map-wrapper" v-show="isShowMap">
      <iframe id="mapPage" width="100%" height="350px" frameborder="0" :src="mapSrc"></iframe>
    </div>
  </div>
</template>
<script>
import { chooseWxImage, getFileName } from '@/utils/wx/wxUtils';
import { idCardOCR } from '@/request/interface/txQrc/readerPci';
import { dataURLtoFile, mergeObj, jdugeImgDirection } from '@/utils/common/common';
import {
  ReplenishProtocol,
  ReplenishIdCardVali,
  getReplenisIdCardPageTitle,
  CONNECTION_TYPE_ARR
} from './utils/replenishUtil';
import { jdugeNewUserRoute } from '@/controller/userController';
import MxSassProdMiXin from '@/common/mixin/MxSassProd.js';
import initUploadObj from '@/controller/upload';
import IdCard from '@/model/IdCared';
import { sassSaveConnection } from '@/request/interface/impower/Sass.js';
import { formateDate } from '@/utils/dataProcess/dateUtil';
import VDistpicker from 'v-distpicker';
export default {
  /**
   * 身份证信息的录入  sass使用
   *
   *
   * */
  name: 'SassReplenishIdCrad',
  data() {
    return {
      picFace: '',
      picNationalEm: '',
      picMarLicence: '',
      province: '',
      city: '',
      locationErrmsg: '',
      frontImageUrl: '',
      backImageUrl: '',
      msg: '',
      defaultContactType: '配偶',
      takePicIcon: require('@/assets/imgs/ic_shoot.png'),
      reChooseIcon: require('@/assets/imgs/icon/ic_re_choose.png'),
      icLocation: require('@/assets/imgs/icon/ic_location.png'),
      isLoading: false,
      readOver: false,
      frontNeedRoate: false,
      backNeedRoate: false,
      marLicenseNeedRoate: false,
      isShowProtocol: false,
      isMarried: false,
      isShowMap: false,
      step: 0,
      isAgree: '',
      idCard: {},
      idcarddArr: [],
      protocolText: [],
      referrer: '',
      productId: '',
      ruleValidate: ReplenishIdCardVali,
      protocolList: ReplenishProtocol,
      replenisIdCardPageTitle: [],
      contactTypeArr: CONNECTION_TYPE_ARR,
      mapSrc:
        'https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=DVUBZ-G47KU-WMVVG-45YKH-YDZOE-UHFDF&referer=testMyAddress'
    };
  },
  mixins: [MxSassProdMiXin],
  components: {
    'v-distpicker': VDistpicker
  },
  created() {
    this.setWechatTitle('上传身份证照片');
    this.watchLocaltion();
    this.referrer = localStorage.referrer;
    this.productId = localStorage.productId;
    let maritalStatus = this.$route.query.maritalStatus;
    this.jdugeMaritalStatus(maritalStatus);
    this.replenisIdCardPageTitle = getReplenisIdCardPageTitle(this.isMarried);
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
          } else if (target === 'picMarriageLicense') {
            this.picMarLicence = res;
            jdugeImgDirection(res).then((res) => {
              this.marLicenseNeedRoate = res;
            });
          } else {
            this.picNationalEm = res;
            jdugeImgDirection(res).then((res) => {
              this.backNeedRoate = res;
            });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: '相册读取失败！' });
        })
        .finally((_) => {
          this.$toasting.hide();
        });
    },
    watchLocaltion() {
      let that = this;
      window.addEventListener(
        'message',
        function (event) {
          // 接收位置信息，用户选择确认位置点后选点组件会触发该事件，回传用户的位置信息
          let loc = event.data;
          that.loc = JSON.stringify(loc);
          if (loc && loc.module == 'locationPicker') {
            //防止其他应用也会向该页面post信息，需判断module是否为'locationPicker'
            that.idCard.resideAddress = `${loc.poiaddress}`;
            that.switchShowMap();
          }
        },
        false
      );
    },
    switchShowMap() {
      this.isShowMap = !this.isShowMap;
    },
    getPprovinceCode(province) {
      this.province = province.code;
    },
    getCityCode(city) {
      this.city = city.code;
    },
    jdugeMaritalStatus(maritalStatus) {
      if (maritalStatus) {
        this.isMarried = maritalStatus === '20';
      } else {
        jdugeNewUserRoute().then((user) => {
          maritalStatus = user.maritalStatus;
          this.isMarried = maritalStatus === '20';
        });
      }
    },
    // 上传、识别idCard
    uploadIdPic() {
      if (this.verifyIdCardUrl()) {
        return;
      }
      if (this.picFace && this.picNationalEm) {
        this.startLoading();
        let params = {
          frontImageUrl: this.picFace,
          backImageUrl: this.picNationalEm,
          selfFlag: false,
          productId: this.productId
        };
        let picFace = dataURLtoFile(this.picFace, getFileName());
        let picNationalEm = dataURLtoFile(this.picNationalEm, getFileName());
        this.uploadUtil(picFace)
          .then((res) => {
            params.frontImageUrl = res;
            this.frontImageUrl = res;
            return this.uploadUtil(picNationalEm);
          })
          .then((res) => {
            params.backImageUrl = res;
            this.backImageUrl = res;
            if (params && params.frontImageUrl && params.backImageUrl) {
              return idCardOCR(params);
            }
          })
          .then((res) => {
            let idcarddArr = res.data.data;
            this.idcarddArr = idcarddArr;
            let idCardRes = mergeObj(idcarddArr[0], idcarddArr[1]);
            let idCard = new IdCard(idCardRes);
            this.step = this.isMarried ? 1 : 2;
            this.idCard = idCard;
          })
          .catch((err) => {
            this.$notify.error({ msg: '识别失败！' });
            console.log(err);
            this.uploadFail(err);
          })
          .finally(() => {
            this.hideLoading();
          });
      } else {
        this.$notify.error({ msg: '请选择图片！' });
      }
    },
    verifyIdCardUrl() {
      let isSkip = false;
      if (!this.picFace && !this.picNationalEm && !this.isMarried) {
        isSkip = true;
        this.$router.replace({ path: '/sass_contract_upload' });
      }
      return isSkip;
    },
    // 上传结婚证件
    uploadMarLicence() {
      if (!this.picMarLicence) {
        this.$notify.error({ msg: '请上传营业执照！' });
        return;
      }
      this.startLoading();
      let picMarLicence = dataURLtoFile(this.picMarLicence, getFileName());
      this.uploadUtil(picMarLicence)
        .then((res) => {
          this.picMarLicence = res;
          this.step = 2;
        })
        .catch((err) => {
          this.$notify.error({ msg: '识别失败！' });
        })
        .finally(() => {
          this.hideLoading();
        });
    },
    startLoading(content = '上传中. . .') {
      this.isLoading = true;
      this.$toasting.show({ message: content, forbidClick: true });
    },
    getLocationErrmsg() {
      let locationErrmsg = '';
      if (!this.province) {
        locationErrmsg = '请选择省份';
      } else if (!this.city) {
        locationErrmsg = '请选择城市';
      }
      this.locationErrmsg = locationErrmsg;
      return locationErrmsg;
    },
    hideLoading() {
      this.$toasting.hide();
      this.isLoading = false;
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
      this.step = 0;
      this.picFace = '';
      this.picNationalEm = '';
      this.picMarLicence = '';
    },
    preStep() {
      let step = this.step;
      step -= 1;
      if (step === 1 && !this.isMarried) {
        step = 0;
      }
      this.step = step;
    },

    // 上传个人信息
    submitInfo(name) {
      let areaErrMsg = this.getLocationErrmsg();
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.startLoading();
          if (areaErrMsg) {
            return;
          }
          let params = this.formateParams();
          sassSaveConnection(params)
            .then((res) => {
              // 获取步骤完成的情况
              this.goNext();
            })
            .catch((err) => {
              this.$notify.error({ msg: err?.data?.msg || '信息更新失败！' });
            })
            .finally(() => {
              this.hideLoading();
            });
        }
      });
    },
    formateParams() {
      let idcarddArr = this.idcarddArr;
      let idCard = this.idCard;
      idCard.marriageLicenseImageUrl = this.picMarLicence;
      idCard.frontImageContent = JSON.stringify(idcarddArr[0]);
      idCard.backImageContent = JSON.stringify(idcarddArr[1]);
      idCard.referrer = this.referrer ? this.referrer : this.$store.state.referrer;
      idCard.productId = this.productId ? this.productId : this.$store.state.productId;
      idCard.idno = idCard.idNum;
      idCard.userName = idCard.name;
      idCard.frontImageUrl = this.frontImageUrl;
      idCard.backImageUrl = this.backImageUrl;
      let areaCode = `${this.province},${this.city}`;
      let [idValidityStart, idValidityStop] = idCard.validDate.split('-');
      idValidityStart = formateDate(idValidityStart, '.');
      if (idValidityStop === '长期') {
        let date = new Date();
        date.setFullYear(9999);
        idValidityStop = date;
      } else {
        idValidityStop = formateDate(idValidityStop, '.');
      }
      let params = {
        backImageContent: JSON.stringify(idcarddArr[1]),
        backImageUrl: this.backImageUrl,
        contactType: this.isMarried ? '2' : idCard.contactType,
        frontImageContent: JSON.stringify(idcarddArr[0]),
        frontImageUrl: this.frontImageUrl,
        idValidityStart,
        idValidityStop,
        idno: idCard.idNum,
        marriageLicenseImageUrl: this.picMarLicence,
        userName: idCard.name,
        mobileNo: idCard.mobileNo,
        areaCode,
        resideAddress: idCard.resideAddress
      };
      return params;
    }
  }
};
</script>
<style lang="scss" scoped>
.map-wrapper {
  position: absolute;
  width: 100%;
  top: 8.4375rem;
}
.front-bg {
  background-image: url('../../../../assets/imgs/bg/bg_face.png');
}
.img-wrapper-selected {
  background: #000000;
  opacity: 0.6;
}
.detail-address-input-wrapper {
  display: flex;
  align-items: center;
  flex-grow: 1;
  padding-right: 20px;
  .map-btn-wrapper {
    display: flex;
    align-items: center;
    .ic-map-btn {
      width: 25px;
      height: 30px;
      margin: 0 5px;
    }
    .map-btn-desc {
      white-space: nowrap;
    }
  }
}
.address-detail {
  height: 1.75rem;
  border: none;
  outline: none;
  flex-grow: 2;
  width: 100%;
  color: rgb(81, 90, 110);
}
.area-err-msg {
  position: absolute;
  bottom: -0.9375rem;
  color: #ed4014;
}
::v-deep(.selectAddress) select {
  -webkit-appearance: none;
  height: 30px;
  width: 110px;
  min-width: 4.375rem;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  background-color: #f1f1f1;
  direction: rtl;
  border: none;
  outline: none;
  background: #ffffff;
  color: #7f7f7f;
}
::v-deep(.selectAddress) option {
  height: 30px;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  margin-left: 16px;
}

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
  background-image: url('../../../../assets/imgs/bg_national_emblem.png');
  background-repeat: no-repeat;
  background-size: contain;
  display: flex;
  justify-content: center;
  position: relative;
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
