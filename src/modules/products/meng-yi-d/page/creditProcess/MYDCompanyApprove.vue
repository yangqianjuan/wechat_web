<template>
  <div class="myd-company-approve">
    <div class="remind">{{ isStepUpload ? '请使用本人为企业法人的营业执照照片' : '请核对企业信息' }}</div>
    <div v-if="isStepUpload" class="myd-company-title">上传营业执照照片</div>
    <div v-if="isStepUpload" class="myd-company-desc">请拍摄或上传本人为企业法人的营业执照照片</div>
    <div v-if="isStepUpload">
      <div class="item-wrapper">
        <div class="img-wrapper" @click="chooseImg">
          <div v-if="picFace" class="company-wrapper">
            <img :class="frontNeedRoate ? 'select-img' : 'rotate-img'" :src="picFace" alt="营业执照" />
          </div>
          <div class="notice-wrapper">
            <img class="shoot-icon" :src="takePicIcon" alt="营业执照" />
            <span class="shoot-desc">点击拍照</span>
          </div>
        </div>
      </div>
    </div>
    <!--确认公司信息-->
    <div v-if="!isStepUpload" class="common-from">
      <Form :model="busindessLicense" :label-width="150" :rules="ruleValidate" ref="formDynamic" label-position="left">
        <FormItem label="企业名称" prop="corpName">
          <i-input v-model="busindessLicense.corpName"></i-input>
        </FormItem>
        <FormItem label="统一信用代码" prop="corpId">
          <i-input v-model="busindessLicense.corpId"></i-input>
        </FormItem>
      </Form>
    </div>

    <div v-if="isShowProtocol" class="mask">
      <div class="protocol-wrapper">
        <p-protocol-list
          @closeProtocol="switchShowProtocol"
          @getProtocolText="getProtocolText"
          :protocolText="protocolText"
          :protocolList="protocolList"
        ></p-protocol-list>
      </div>
    </div>
    <div class="common-submit-btn">
      <div class="submit-btn" v-if="!isShowProtocol">
        <Button @click="isStepUpload ? uploadIdPic() : submitInfo('formDynamic')">{{
          isStepUpload ? '确认上传' : '确认提交'
        }}</Button>
      </div>
      <div class="clear-btn" v-if="!isStepUpload">
        <Button @click="resetImgUrl">重新识别</Button>
      </div>
    </div>

    <div class="protocol-link-wrapper" v-if="!isShowProtocol && !isStepUpload" style="padding-top:12px;">
      <Checkbox class="protocol-select-btn" v-model="isAgree" label="agree"></Checkbox>
      <p @click="switchShowProtocol">
        请阅读并同意
        <span class="protocol">{{ ptotocolListShowText }}</span>
      </p>
    </div>
  </div>
</template>
<script>
import { chooseWxImage, getFileName } from '@/utils/wx/wxUtils';
import initUploadObj from '@/controller/upload';
import { dataURLtoFile, jdugeImgDirection } from '@/utils/common/common';
import BusindessLicense from '@/model/BusindessLicense';
import { saveCorpBaseInfo } from '@/request/interface/impower/UserInfo';
import { bizLicenseOCR } from '@/request/interface/txQrc/readerPci';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { jdugeNewUserRoute } from '@/controller/userController';
import MxProtocol from '@/common/mixin/MxProtocol.js';
import { commonMydMixin } from '@/modules/products/meng-yi-d/utils/common';

export default {
  name: 'MYDCompanyApprove',
  mixins: [MxProtocol, commonMydMixin],
  data() {
    return {
      picFace: '',
      isStepUpload: true,
      busindessLicense: {},
      takePicIcon: require('@/assets/imgs/myd/company.png'),
      userId: '',
      userInfo: {},
      ruleValidate: {
        corpName: [{ required: true, message: '请填写企业名称!', trigger: 'blur' }],
        corpId: [{ required: true, message: '请填写社会统一信用代码!', trigger: 'blur' }]
      },
      protocolText: [],
      frontNeedRoate: false,
      isShowProtocol: false,
      isAgree: ''
    };
  },

  created() {
    this.init();
  },
  methods: {
    init() {
      this.setWechatTitle('企业认证');
      this.getMydUnionKey();
      if (this.creditPreInfo.referrer) {
        this.isStepUpload = true;
        this.getProtocolList(this.creditPreInfo.productId || '1038');
        jdugeNewUserRoute().then(user => {
          this.userInfo = user;
        });
      }
    },

    async chooseImg() {
      try {
        let japiList = ['chooseImage', 'uploadImage', 'getLocalImgData', 'previewImage'];
        this.$toasting.show({ message: '读取中', forbidClick: true });
        const chooseRes = await chooseWxImage(japiList);
        this.picFace = chooseRes;
        const directionRes = await jdugeImgDirection(chooseRes);
        this.frontNeedRoate = directionRes;
      } catch (e) {
        this.$notify.error({ msg: '识别失败！' });
      } finally {
        this.$toasting.hide();
      }
    },
    async uploadIdPic() {
      if (this.picFace) {
        try {
          this.$toasting.show({ message: '识别中', forbidClick: true });
          const uploadRes = await this.uploadUtil(dataURLtoFile(this.picFace, getFileName()));
          const bizLicenseOCRes = (await bizLicenseOCR({ imageUrl: uploadRes }))?.data?.data;
          if (bizLicenseOCRes) {
            this.setWechatTitle('企业信息确认');
            let busindessLicense = new BusindessLicense(bizLicenseOCRes);
            if (!busindessLicense.isIntact) {
              this.$notify.error({
                msg: '图片清晰度过低，请重新识别！'
              });
              this.qcrErrHandle();
            } else {
              this.isStepUpload = false;
              this.busindessLicense = busindessLicense;
            }
          }
        } catch (e) {
          this.$notify.error({
            msg: '识别失败！'
          });
          this.qcrErrHandle();
        } finally {
          this.$toasting.hide();
        }
      } else {
        this.$notify.info({
          msg: '请上传营业执照照片！'
        });
      }
    },

    qcrErrHandle() {
      this.picFace = '';
      this.isStepUpload = true;
    },

    resetImgUrl() {
      this.isStepUpload = true;
      this.picFace = '';
    },

    getProtocolText(protocol) {
      let fileType = protocol.code ? protocol.code : this.protocolList[0].code;
      let index = protocol.index;
      this.protocolText = [];
      let params = {
        corpName: this.busindessLicense.corpName,
        idCard: this.userInfo.idNo,
        userName: this.userInfo.name,
        applyUnionKey: this.applyUnionKey,
        fileType
      };
      this.queryProtocolText(params, index);
    },

    uploadUtil(picFace) {
      return new Promise((resolve, reject) => {
        initUploadObj(
          this,
          new Date().getTime(),
          picFace,
          'image',
          res => {
            resolve(res?.pic);
          },
          'biz_license'
        );
      });
    },

    switchShowPdf() {
      this.isShowProtocol = !this.isShowProtocol;
    },

    // 确认企业信息之后进行提交
    submitInfo(name) {
      this.$refs[name].validate(valid => {
        if (!valid) {
          return;
        }
        // if (!this.protocolList[0].isReadOver) {
        //   this.$notify.info({
        //     msg: '请阅读授信合同！'
        //   });
        //   this.isShowProtocol = true;
        //   return false;
        // }
        // if (!this.isAgree) {
        //   this.$notify.info({
        //     msg: '请阅读并同意协议！'
        //   });
        //   return;
        // }
        let busindessLicense = this.busindessLicense;
        busindessLicense.referrer = this.creditPreInfo.referrer;
        busindessLicense.productId = this.creditPreInfo.productId;
        this.$toasting.show({ message: '保存中', forbidClick: true });
        let params = {
          ...busindessLicense
        };
        params.applyUnionKey = this.applyUnionKey;
        saveCorpBaseInfo(params)
          .then(async res => {
            if (res?.data?.success) {
              let nextPath = await queryNextByUnionKeyAndProdId(this.creditPreInfo.productId, this.applyUnionKey);
              this.$router.replace({
                path: nextPath,
                query: { referrer: this.creditPreInfo.referrer, productId: this.creditPreInfo.productId }
              });
            } else {
              this.$notify.error({
                msg: '企业信息上传失败！'
              });
            }
          })
          .catch(err => {
            if (err?.data?.code === '80000') {
              this.riskFailHandle();
            } else if (err?.data?.code === '80101') {
              this.$notify.error({
                msg: '服务错误，请重试！'
              });
            } else {
              this.$notify.error({
                msg: err?.data?.msg || '企业认证失败！'
              });
              this.resetImgUrl();
            }
          })
          .finally(_ => {
            this.$toasting.hide();
          });
      });
    },

    riskFailHandle() {
      this.$toasting.show({ message: '风控审核中', forbidClick: true });
      setTimeout(() => {
        this.$toasting.hide();
        this.$notify.error({
          msg: '风控审核拒绝！'
        });
        this.$router.replace({
          path: '/myd_credit_result',
          query: { referrer: this.creditPreInfo.referrer, productId: this.creditPreInfo.productId }
        });
      }, 3000);
    }
  }
};
</script>
<style lang="scss" scoped>
@import '../../assets/css/common.scss';
.myd-company-approve {
  .myd-company-title {
    margin-top: 42px;
    font-size: 40px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: $font-color-4;
    text-align: center;
  }
  .myd-company-desc {
    margin-top: 15px;
    text-align: center;
    font-size: 25px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: $font-color-5;
  }

  .item-wrapper {
    .img-wrapper {
      width: 60%;
      height: 600px;
      margin: 0 auto;
      margin-top: 60px;
      background-image: url('../../../../../assets/imgs/company_approve.png');
      background-repeat: no-repeat;
      background-size: contain;
      overflow: hidden;
    }
    .notice-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      .shoot-icon {
        width: 116px;
        height: 116px;
      }
      .shoot-desc {
        margin-top: 12px;
        font-size: 24px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: $btn-bg-color;
        line-height: 33px;
      }
    }
    .company-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      .select-img {
        width: 100%;
        object-fit: cover;
      }
      .rotate-img {
        height: 56.3vw;
        width: 79.5vw;
        margin-top: 2.5rem;
        transform: rotate(-90deg);
      }
    }
  }
  .notice {
    margin-top: 55px;
    padding: 0 6vw;
    div {
      font-size: 24px;
      font-weight: 400;
      color: $font-color-1;
      text-indent: 1em;
    }
    .notice-one {
      text-indent: 1em;
    }
  }
  .mask {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100vw;
    text-align: center;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10001;
    .protocol-wrapper {
      position: absolute;
      bottom: 0;
    }
  }
}
</style>
