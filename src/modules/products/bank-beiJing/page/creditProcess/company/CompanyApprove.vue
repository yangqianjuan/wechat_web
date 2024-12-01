<!--
 * @Author: hsf
 * @Date: 2023-06-16 09:19:20
 * @LastEditors: hsf
 * @LastEditTime: 2023-11-24 14:45:21
 * @Description:
-->
<template>
  <div class="business-license beijing-common">
    <div class="top-step">
      <step :steps="[0]"></step>
    </div>

    <!-- 上传营业执照照片 -->
    <div class="upload-license">
      <div class="describe">2、上传本人为企业法人的营业执照照片</div>
      <div class="upload" @click="uploadCardHandler">
        <img v-if="picFace" :src="picFace" alt="" class="zhizhao" />
        <img v-else src="../../../static/image/zhizhao.png" alt="" class="zhizhao" />
        <img src="../../../static/image/photo.png" alt="" class="photo" />
        <div class="upload-btn">上传营业执照</div>
      </div>
    </div>

    <!-- 企业信息填写 -- ocr回填  -->
    <div class="company-info">
      <van-form validate-first :label-width="70" ref="formDynamic">
        <van-field
          v-model="busindessLicense.corpName"
          name="corpName"
          label="企业名称"
          placeholder="扫描识别后自动填充"
          :rules="ruleValidate.corpName"
        />
        <van-field
          v-model="busindessLicense.corpId"
          name="corpId"
          label="信用代码"
          :rules="ruleValidate.corpId"
          placeholder="扫描识别后自动填充"
        />
        <van-field
          v-model="busindessLicense.registerAddr"
          name="registerAddr"
          label="注册地址"
          :rules="ruleValidate.registerAddr"
          placeholder="扫描识别后自动填充"
        />
        <van-field
          v-model="busindessLicense.detailAddress"
          readonly
          label="经营地址"
          name="detailAddress"
          :rules="ruleValidate.detailAddress"
          placeholder="请选择实际经营地址"
          @click-input="open"
        >
          <template #button>
            <div class="location__img" @click="open">
              <img src="../../../static/image/credit/location.png" />
            </div>
          </template>
        </van-field>
        <!--        <div class="map">-->
        <!--          <div class="color9cc">经营地址</div>-->
        <!--          <div class="map-outside">-->
        <!--            <div class="map-container">-->
        <!--              <div class="map-box">-->
        <!--                <iframe-->
        <!--                  id="mapPage"-->
        <!--                  width="100%"-->
        <!--                  height="350px"-->
        <!--                  frameborder="0"-->
        <!--                  src="https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=DVUBZ-G47KU-WMVVG-45YKH-YDZOE-UHFDF&referer=testMyAddress"-->
        <!--                ></iframe>-->
        <!--              </div>-->
        <!--            </div>-->
        <!--            <div class="mask" @click="open"></div>-->
        <!--            <van-field-->
        <!--              v-model="busindessLicense.detailAddress"-->
        <!--              disabled-->
        <!--              is-link-->
        <!--              name="detailAddress"-->
        <!--              :rules="ruleValidate.detailAddress"-->
        <!--              placeholder="请选择地址"-->
        <!--            />-->
        <!--          </div>-->
        <!--        </div>-->
      </van-form>
    </div>

    <!-- 协议信息 -->
    <div class="protocol-link-wrapper checkoutBox" v-if="!isShowProtocol">
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
        <span @click="switchCompanyShowProtocol" class="empower">{{ ptotocolListShowText }}</span>
      </p>
    </div>

    <div class="pdf-wrapper beijing-protocol" v-if="isShowProtocol">
      <p-protocol-list
        @closeProtocol="switchCompanyShowProtocol"
        @getProtocolText="getProtocolText"
        :isPdf="protocolDocType"
        :protocolText="protocolText"
        :protocolList="protocolList"
      ></p-protocol-list>
    </div>

    <div class="seize"></div>
    <div class="submit">
      <div class="text">
        请确认营业执照信息无误后再提交!
      </div>
      <!-- disabled -->
      <van-button class="btn" :disabled="!isSubmitDisabledUpdateInfo" @click="submitInfo">确认提交</van-button>
    </div>
    <!-- 地址的搜索 -->
    <van-dialog
      v-model="mapShow"
      class="location-dialog"
      show-cancel-button
      confirmButtonColor="#2d8cf0"
      :overlay-style="{ zIndex: 200001 }"
      @cancel="mapShow = false"
    >
      <iframe
        v-if="delayShowMap"
        id="mapPage"
        width="100%"
        height="350px"
        frameborder="0"
        src="https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=DVUBZ-G47KU-WMVVG-45YKH-YDZOE-UHFDF&referer=testMyAddress"
      ></iframe>
      <div style="height:350px" v-else></div>
    </van-dialog>
  </div>
</template>
<script>
import Step from '../../../component/steps/Steps.vue';
import { chooseWxImage, getFileName } from '@/utils/wx/wxUtils';
import initUploadObj from '@/controller/upload';
import { dataURLtoFile, jdugeImgDirection } from '@/utils/common/common';
import BusindessLicense from '@/model/BusindessLicense';
import { saveCorpBaseInfo } from '@/request/interface/impower/UserInfo';
import { bizLicenseOCR } from '@/request/interface/txQrc/readerPci';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { jdugeNewUserRoute } from '@/controller/userController';
import MxProtocol from '@/common/mixin/MxProtocol.js';
import { COOKIE_ID } from '@/utils/common/config';
import { beijingDialog, clickControl, pageKeyInfoSearch } from '../../../utils/common';
import { getCurrentLocation } from '@/request/interface/common/index';
import { getBeijingProtocolUrl } from '@/request/interface/impower/Product';

export default {
  name: 'BjbCompanyApprove',
  mixins: [MxProtocol],
  components: { Step },
  data() {
    return {
      //地图延迟显示避免闪烁
      delayShowMap: false,
      disabled: true, //按钮是否生效
      mapShow: false,
      checked: false, //授权协议
      picFace: '',
      // 企业信息 -- ocr 字段
      busindessLicense: {
        corpName: '',
        corpId: '',
        code: '',
        registerAddr: '',
        detailAddress: ''
      },
      ruleValidate: {
        corpName: [{ required: true, message: '请填写企业名称', trigger: 'onBlur' }],
        corpId: [{ required: true, message: '请填写社会统一信用代码', trigger: 'onBlur' }],
        code: [{ required: true, message: '请选择地区', trigger: 'onBlur' }],
        registerAddr: [{ required: true, message: '请填写企业注册地址', trigger: 'onBlur' }],
        detailAddress: [{ required: true, message: '请选择地址', trigger: 'onBlur' }]
      },

      userId: '',
      userInfo: {},

      // 协议文档默认展示类型： pdf
      protocolDocType: true,
      protocolText: [],
      isShowProtocol: false,
      isAgree: '',
      applyUnionKey: '',
      referrer: '',
      productId: '',

      mapLocationDetail: {
        operateAddress: '',
        operateAreaCode: '',
        longtitudeAndLatitude: '',
        latlng: {
          lat: '',
          lng: ''
        }
      }
    };
  },

  computed: {
    isSubmitDisabledUpdateInfo() {
      return this.busindessLicense.corpId;
    }
  },

  created() {
    this.init();
  },

  methods: {
    async init() {
      try {
        this.setWechatTitle('企业认证');
        this.userId = this.getCookie('wecaheat_xm_userid');
        this.applyUnionKey = this.getCookie(COOKIE_ID.applyUnionKey);

        const { referrer, productId, applyUnionKey } = await pageKeyInfoSearch.call(this);

        if (referrer) {
          this.referrer = referrer;
          this.productId = productId;
          this.applyUnionKey = applyUnionKey;
          Promise.all([
            this.getProtocolList(this.productId),
            jdugeNewUserRoute().then(user => {
              this.userInfo = user;
            })
          ]);
          return;
        }
      } catch (error) {
        console.log(error);
      }
    },

    open() {
      this.watchLocation();
      this.mapShow = true;
      //延迟显示防止闪烁
      let timer = setTimeout(() => {
        this.delayShowMap = true;
        clearTimeout(timer);
      }, 500);
    },

    //获取地图选择位置
    watchLocation() {
      let that = this;
      window.addEventListener(
        'message',
        function(event) {
          let loc = event.data;
          if (loc?.module == 'locationPicker') {
            that.mapLocationDetail.operateAddress = loc.poiaddress;
            that.mapLocationDetail.longtitudeAndLatitude = `${loc.latlng?.lng},${loc.latlng?.lat}`;
            that.busindessLicense.detailAddress = loc.poiaddress;
            that.mapLocationDetail.latlng = loc.latlng;
          }
        },
        false
      );
    },

    uploadCardHandler() {
      clickControl.call(this, this.chooseImg);
    },

    async chooseImg() {
      try {
        let jsApiList = ['chooseImage', 'uploadImage', 'getLocalImgData', 'previewImage'];
        let chooseRes = await chooseWxImage(jsApiList);
        this.$toasting.show({ message: '读取中', forbidClick: true });
        this.picFace = chooseRes;

        await jdugeImgDirection(chooseRes);

        this.uploadIdPic();
      } catch (error) {
        this.$toasting.hide();
        beijingDialog({
          message: '相册读取失败！',
          confirmButtonText: '确定'
        });
      } finally {
        // this.$toasting.hide();
      }
    },

    async uploadIdPic() {
      if (this.picFace) {
        try {
          let picFace = dataURLtoFile(this.picFace, getFileName());
          this.$toasting.show({ message: '上传中', forbidClick: true });
          let imgUploadRes = await this.uploadUtil(picFace);

          let ocrRes = await bizLicenseOCR({ imageUrl: imgUploadRes });
          this.setWechatTitle('企业信息确认');

          if (ocrRes?.data?.data) {
            let busindessLicense = new BusindessLicense(ocrRes.data.data);
            if (!busindessLicense.isIntact) {
              this.$toasting.info({ msg: '图片清晰度过低，请重新识别' });
              this.qcrErrHandle();

              return;
            }
            this.$toasting.success({ msg: '成功' });
            this.isStepUpload = false;
            let detailAddress = this.busindessLicense.detailAddress;
            this.busindessLicense = busindessLicense;
            this.busindessLicense.detailAddress = detailAddress;

            return;
          }
        } catch (error) {
          this.$toasting.error({ msg: '识别失败' });
          this.qcrErrHandle();
        } finally {
          this.$toasting.hide();
        }
      } else {
        this.$toasting.info({ msg: '请上传营业执照照片' });
      }
    },

    qcrErrHandle() {
      this.picFace = '';
    },

    resetImgUrl() {
      this.picFace = '';
    },

    switchCompanyShowProtocol() {
      if (!this.busindessLicense.corpName) {
        this.$toasting.info({ msg: '请上传企业信息', className: 'read-protocol' });
        return;
      }

      this.isShowProtocol = !this.isShowProtocol;
    },

    async getProtocolText(protocol) {
      try {
        let fileTypeCode = protocol?.code;

        switch (fileTypeCode) {
          case '09': {
            this.protocolDocType = true;
            let protocolRes = await getBeijingProtocolUrl({ contractType: 2 });
            if (protocolRes?.data?.success && protocolRes?.data?.data) {
              this.protocolText = protocolRes.data.data.baseImages;
              this.protocolList[protocol.index].isReadOver = true;
              let isAllRead = this.protocolList.every(item => {
                return item.isReadOver;
              });
              isAllRead && (this.isAgree = true);
            }
            break;
          }
          case '24': {
            // clear last txt
            this.protocolDocType = false;
            this.protocolText = '';

            this.$nextTick(() => {
              let params = {
                corpName: this.busindessLicense.corpName,
                idCard: this.userInfo.idNo,
                userName: this.userInfo.name,
                applyUnionKey: this.applyUnionKey,
                fileType: fileTypeCode
              };
              this.queryProtocolText(params, protocol.index).then(res => {
                if (res && this.protocolList?.length) {
                  let isAllRead = this.protocolList.every(item => {
                    return item.isReadOver;
                  });
                  isAllRead && (this.isAgree = true);
                }
              });
            });
            break;
          }
          case '21': {
            // clear last txt
            this.protocolDocType = false;
            this.protocolText = '';

            this.$nextTick(() => {
              let params = {
                corpName: this.busindessLicense.corpName,
                idCard: this.userInfo.idNo,
                userName: this.userInfo.name,
                applyUnionKey: this.applyUnionKey,
                fileType: fileTypeCode
              };
              this.queryProtocolText(params, protocol.index).then(res => {
                if (res && this.protocolList?.length) {
                  let isAllRead = this.protocolList.every(item => {
                    return item.isReadOver;
                  });
                  isAllRead && (this.isAgree = true);
                }
              });
            });
            break;
          }
        }
      } catch (error) {
        this.isShowProtocol = false;
        beijingDialog({
          message: error?.data?.msg,
          confirmButtonText: '确定'
        });
      }
    },

    uploadUtil(picFace) {
      let that = this;
      return new Promise((resolve, reject) => {
        initUploadObj(
          that,
          new Date().getTime(),
          picFace,
          'image',
          res => {
            resolve(res.pic);
          },
          'biz_license'
        );
      });
    },

    switchShowPdf() {
      this.isShowProtocol = !this.isShowProtocol;
    },

    submitInfo() {
      // check is ocr
      if (!this.picFace) {
        this.$toasting.info({ msg: '请上传营业执照' });
        return;
      }

      // no select address modal tips
      if (!this.mapLocationDetail.longtitudeAndLatitude || !this.busindessLicense.detailAddress) {
        beijingDialog({
          message: '请选择企业经营地址',
          confirmButtonText: '确定'
        });
        return;
      }

      if (!this.protocolList[0].isReadOver) {
        this.$toasting.info({ msg: '请阅读并同意协议', className: 'read-protocol' });
        this.isShowProtocol = true;
        return;
      }

      if (!this.isAgree) {
        this.$toasting.info({ msg: '请阅读并同意协议' });
        return;
      }

      clickControl.call(this, this.checkCompanyInfo);
    },

    checkCompanyInfo() {
      this.$refs.formDynamic.validate(['corpName', 'corpId', 'registerAddr', 'detailAddress']).then(async valid => {
        if (!valid) {
          try {
            // 解析经纬度 -- get 省市区编码
            const locationMap = await getCurrentLocation({
              location: `${this.mapLocationDetail.latlng?.lat},${this.mapLocationDetail.latlng?.lng}`,
              key: 'DVUBZ-G47KU-WMVVG-45YKH-YDZOE-UHFDF'
            });

            let operateAreaCode = '';

            if (locationMap?.data?.success && locationMap.data.data) {
              let areaCode = locationMap.data.data?.result?.ad_info?.adcode;

              if (areaCode) {
                const provinceCode = areaCode.slice(0, 2) + '0000';
                const cityCode = areaCode.slice(0, 4) + '00';
                const district = areaCode;
                operateAreaCode = `${provinceCode},${cityCode},${district}`;
              }
            }

            let busindessLicense = this.busindessLicense;
            let referrer = this.referrer || localStorage.referrer;
            let productId = '1155';
            this.$store.commit('setProductId', productId);
            this.$store.commit('setReferrer', referrer);
            busindessLicense.referrer = referrer;
            busindessLicense.productId = productId;
            busindessLicense.operateAddress = this.mapLocationDetail.operateAddress;
            busindessLicense.operateAreaCode = operateAreaCode;
            busindessLicense.longtitudeAndLatitude = this.mapLocationDetail.longtitudeAndLatitude;

            this.$toasting.show({ message: '上传中', forbidClick: true });

            let saveInfoRes = await saveCorpBaseInfo(busindessLicense);
            if (saveInfoRes?.data?.success) {
              let nextPath = await queryNextByUnionKeyAndProdId('1155');
              if (nextPath !== '/bjb_company_approve') {
                this.$toasting.success({ msg: '成功' });
                setTimeout(() => {
                  this.$router.replace({
                    path: nextPath,
                    query: {
                      referrer: this.referrer,
                      productId: this.productId
                    }
                  });
                }, 800);

                return;
              }

              this.$toasting.error({ msg: '信息录入失败' });
              return;
            }

            this.$toasting.error({ msg: '信息录入失败' });
          } catch (error) {
            this.$toasting.hide();
            let msg = error?.data?.msg || '企业认证失败！';
            let code = error?.data?.code;
            if (code === '80000') {
              // 风控审核中，拒绝下一步，直接跳转到申请结果, 流程图中有
              this.riskFailHandle();
            } else if (code === '80101') {
              beijingDialog({
                message: '服务错误，请重试',
                confirmButtonText: '确定'
              });
            } else {
              beijingDialog({
                message: msg,
                confirmButtonText: '确定'
              }).then(res => {
                // 该企业区域为独家所有，与当前客户经理可进件地区不匹配!
                if (msg && msg.indexOf('企业区域') !== -1 && msg.indexOf('独家所有') !== -1) {
                  this.$router.replace({
                    path: '/credit_area_reject',
                    query: {
                      referrer: this.referrer,
                      productId: this.productId,
                      errorMsg: msg
                    }
                  });
                }
              });
              // this.resetImgUrl();
            }
          } finally {
            this.$toasting.hide();
          }
        }
      });
    },

    //
    riskFailHandle() {
      this.$toasting.show({ message: '风控审核中', forbidClick: true });
      setTimeout(() => {
        this.$toasting.error({ msg: '审核拒绝' });
        // 申请结果页
        this.$router.replace({ path: '/bjb_credit_result' });
      }, 800);
    },

    clickShow(type) {
      if (type === 'area') {
        if (!Object.keys(this.areaList).length) {
          this.$toasting.info({ msg: '暂无区域信息' });
        } else {
          this.addressShow = true;
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.business-license {
  background: #f8f8f8;
  width: 100vw;
  min-height: 100vh;
  position: relative;

  .top-step {
    padding-top: 40px;
    background: #f8f8f8 url('../../../static/image/top_bg.png');
    background-size: contain;
    background-repeat: no-repeat;
    height: 404px;
  }

  .upload-license {
    padding: 40px;
    margin: 0 auto;
    margin-top: -150px;
    width: 686px;
    height: 521px;
    background: #ffffff;
    box-shadow: 0px 0px 32px -8px rgba(78, 6, 6, 0.2);
    border-radius: 16px;

    .describe {
      font-size: 28px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #2b0e0c;
    }

    .zhizhao {
      width: 100%;
      height: 305px;
    }

    .upload {
      margin-top: 32px;
      position: relative;

      .photo {
        position: absolute;
        width: 80px;
        top: 35%;
        left: 45%;
      }
    }

    .upload-btn {
      width: 100%;
      height: 64px;
      background: #df0301 linear-gradient(129deg, #cd1101 0%, #a70500 100%);
      border-radius: 0px 0px 16px 16px;
      font-size: 24px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #ffffff;
      text-align: center;
      line-height: 64px;
    }
  }

  .company-info {
    padding-top: 20px;
    margin: 0 auto;
    margin-top: 40px;
    width: 686px;
    // height: 694px;
    background: #ffffff;
    border-radius: 16px;

    /deep/ .van-field__label {
      color: #c8c9cc;
    }

    .location__img {
      display: flex;
      align-items: center;

      img {
        width: 32px;
        height: 32px;
      }
    }

    .map {
      display: flex;
      padding: 20px 32px;

      .color9cc {
        white-space: nowrap;
        font-size: 28px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #8f8b8a;
      }

      .map-outside {
        margin-left: 45px;
        position: relative;

        /deep/ .van-cell {
          // padding-left: 0;
        }

        /deep/ .van-field {
          padding-left: 0 !important;
        }

        /deep/ .van-cell::after {
          left: 0 !important;
        }
      }

      .mask {
        width: 454px;
        height: 390px;
        position: absolute;
        top: 0;
        background-color: transparent;
        z-index: 10;
      }

      .map-container {
        z-index: 1;
        width: 454px;
        height: 320px;
        overflow: hidden;
        border-radius: 20px;

        .map-box {
          margin-top: -90px;
          height: 410px;
          transform: scale(1.3);
        }
      }
    }
  }

  .location-dialog {
    z-index: 200002 !important;
  }

  .checkoutBox {
    margin-top: 24px;
    margin-left: 32px;
    margin-right: 32px;
    display: flex;
    align-items: center;

    .empower {
      color: #335af5;
    }

    .checkBox {
      width: 24px;
      height: 24px;
      margin-right: 8px;
    }
  }

  .seize {
    height: 212px;
    width: 100%;
    margin-top: 32px;
  }

  .submit {
    height: 212px;
    width: 100%;
    position: fixed;
    bottom: 0;
    background: #ffffff;
    box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.11);
    text-align: center;
    z-index: 100000;

    .text {
      margin-top: 28px;
      font-size: 28px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #2b0e0c;
      margin-bottom: 24px;
    }

    .btn {
      width: 686px;
      height: 88px;
      background: linear-gradient(129deg, #b80701 0%, #9a0400 100%);
      border-radius: 45px;
      text-align: center;
      line-height: 88px;

      /deep/ .van-button__text {
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #ffffff;
      }
    }

    .disable {
      opacity: 0.5;
    }
  }

  /deep/ .van-field__control {
    font-size: 28px !important;
    font-family: PingFangSC-Medium, PingFang SC !important;
    font-weight: 500 !important;
    color: #2b0e0c !important;
    -webkit-text-fill-color: unset;
    text-fill-color: unset;
  }
}
</style>
