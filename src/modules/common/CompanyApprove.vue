<template>
  <div class="company-approve-wrapper">
    <div class="remind">{{isStepUpload ? '请使用本人为企业法人的营业执照照片' : '请核对企业信息'}}</div>
    <div v-if="isStepUpload">
      <div class="item-wrapper">
        <p class="sec-title">上传营业执照照片</p>
        <div class="img-wrapper" @click="chooseImg">
          <div v-if="picFace" class="company-wrapper">
            <img :class="frontNeedRoate ? 'select-img' : 'rotate-img'" :src="picFace" alt="营业执照" />
          </div>
          <div class="notice-wrapper" v-else>
            <img class="shoot-icon" :src="takePicIcon" alt="营业执照" />
            <span class="shoot-desc">点击拍照</span>
          </div>
        </div>
      </div>
    </div>
    <!--确认公司信息-->
    <div v-if="!isStepUpload">
      <Form :model="busindessLicense" :label-width="130" :rules="ruleValidate" ref="formDynamic" label-position="left">
        <FormItem label="企业名称" prop="corpName">
          <i-input v-model="busindessLicense.corpName"></i-input>
        </FormItem>
        <FormItem label="社会统一信用代码" prop="corpId">
          <i-input v-model="busindessLicense.corpId"></i-input>
        </FormItem>
      </Form>
      <p class="notice">请确认企业信息无误后，再提交！</p>
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

    <Button
      v-if="!isShowProtocol"
      @click="isStepUpload ? uploadIdPic() : submitInfo('formDynamic')"
      class="sub-btn"
      type="primary"
      :loading="isLoading"
    >{{isStepUpload ? '确认上传' : '确认提交'}}</Button>
    <Button class="sub-btn reset-btn" v-if="!isStepUpload" @click="resetImgUrl">重新识别</Button>

    <div class="protocol-link-wrapper" v-if="!isShowProtocol && !isStepUpload">
      <input class="protocol-select-btn" type="radio" value="agree" v-model="isAgree" />
      <p @click="switchShowProtocol">
        请阅读并同意
        <span class="protocol">{{ ptotocolListShowText }}</span>
      </p>
    </div>
  </div>
</template>
<script>
import { chooseWxImage, getFileName } from '../../utils/wx/wxUtils';
import initUploadObj from '../../controller/upload';
import { dataURLtoFile, jdugeImgDirection } from '../../utils/common/common';
import BusindessLicense from '../../model/BusindessLicense';
import { saveCorpBaseInfo } from '@/request/interface/impower/UserInfo';
import { bizLicenseOCR } from '@/request/interface/txQrc/readerPci';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { jdugeNewUserRoute } from '../../controller/userController';
import MxProtocol from '@/common/mixin/MxProtocol.js';
import { COOKIE_ID } from '@/utils/common/config';
export default {
  /**
   * 企业信息的认证 （sass 和 xmkd 公用）
   *     1、证书上传
   *     2、企业信息的上传
   * */
  name: 'CompanyApprove',
  data() {
    return {
      picFace: '',
      isStepUpload: true,
      busindessLicense: {},
      takePicIcon: require('../../assets/imgs/ic_shoot.png'),
      userId: '',
      userInfo: {},
      ruleValidate: {
        corpName: [{ required: true, message: '请填写企业名称', trigger: 'blur' }],
        corpId: [{ required: true, message: '请填写社会统一信用代码', trigger: 'blur' }]
      },
      protocolText: [],
      frontNeedRoate: false,
      isShowProtocol: false,
      isLoading: false,
      isAgree: '',
      applyUnionKey: ''
    };
  },
  mixins: [MxProtocol],
  created() {
    this.setWechatTitle('企业认证');
    this.userId = this.getCookie('wecaheat_xm_userid');
    this.applyUnionKey = this.getCookie(COOKIE_ID.applyUnionKey);
    this.getProtocolList(this.$store.state.productId);
  },
  mounted() {
    this.isStepUpload = true;
    // 获取用户信息
    jdugeNewUserRoute().then((user) => {
      this.userInfo = user;
    });
  },
  methods: {
    // 处理选择图片
    chooseImg() {
      let japiList = ['chooseImage', 'uploadImage', 'getLocalImgData', 'previewImage'];
      this.$toasting.show({ message: '读取中', forbidClick: true });
      chooseWxImage(japiList)
        .then((res) => {
          this.picFace = res;
          jdugeImgDirection(res).then((res) => {
            this.frontNeedRoate = res;
          });
        })
        .finally((_) => {
          this.$toasting.hide();
        });
    },
    uploadIdPic() {
      if (this.picFace) {
        this.isLoading = true;
        this.$toasting.show({ message: '识别中', forbidClick: true });
        let picFace = dataURLtoFile(this.picFace, getFileName());
        this.uploadUtil(picFace)
          .then((res) => {
            return bizLicenseOCR({ imageUrl: res });
          })
          .then((res) => {
            this.setWechatTitle('企业信息确认');
            let busindessLicense = new BusindessLicense(res?.data?.data);
            if (!busindessLicense.isIntact) {
              this.$notify.error({ msg: '图片清晰度过低，请重新识别！' });
              this.qcrErrHandle();
            } else {
              this.isStepUpload = false;
              this.busindessLicense = busindessLicense;
            }
          })
          .catch((err) => {
            this.$notify.error({ msg: '识别失败！' });
            this.qcrErrHandle();
          })
          .finally(() => {
            this.$toasting.hide();
            this.isLoading = false;
          });
      } else {
        this.$notify.info({ msg: '请上传营业执照照片！' });
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
          'biz_license'
        );
      });
    },
    switchShowPdf() {
      this.isShowProtocol = !this.isShowProtocol;
    },

    // 确认企业信息之后进行提交
    submitInfo(name) {
      this.$refs[name].validate((valid) => {
        if (!valid) {
          return;
        }
        if (!this.isAgree) {
          this.$notify.info({ msg: '请阅读并同意协议！' });
          return;
        }
        this.isLoading = true;
        let busindessLicense = this.busindessLicense;
        let referrer = localStorage.referrer;
        let productId = localStorage.productId;
        this.$store.commit('setProductId', productId);
        this.$store.commit('setReferrer', referrer);
        busindessLicense.referrer = referrer;
        busindessLicense.productId = productId;
        saveCorpBaseInfo(busindessLicense)
          .then(async (res) => {
            let nextPath = await queryNextByUnionKeyAndProdId(busindessLicense.productId);
            this.$router.replace({ path: nextPath, query: { comeFrom: 'company_approve' } });
          })
          .catch((err) => {
            let msg = err?.data?.msg || '企业认证失败！';
            let code = err.data.code;
            if (code && code === '80000') {
              this.riskFailHandle();
            } else if (code && code === '80101') {
              this.$notify.error({ msg: '服务错误，请重试！' });
            } else {
              this.$notify.error({ msg: msg });
              this.resetImgUrl();
              this.isLoading = false;
            }
          });
      });
    },
    riskFailHandle() {
      this.$toasting.show({ message: '风控审核中', forbidClick: true });
      setTimeout(() => {
        this.$toasting.hide();
        this.isLoading = false;
        this.$notify.error({ msg: '风控审核拒绝！' });
        this.$router.replace({ path: '/credut_result' });
      }, 3000);
    }
  }
};
</script>
<style lang="scss" scoped>
.item-wrapper {
  padding-top: 30px;
}

.sec-title {
  font-size: 30px;
  font-weight: 600;
  margin-bottom: 30px;
  color: rgba(51, 51, 51, 1);
  text-align: center;
}
.img-wrapper {
  width: 56.3vw;
  height: 79.5vw;
  margin: 0 auto;
  margin-top: 30px;
  margin-bottom: 30px;
  background-image: url('../../assets/imgs/company_approve.png');
  background-repeat: no-repeat;
  background-size: contain;
  overflow: hidden;
}
.notice-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 107px;
}
.notice {
  text-align: center;
  margin-top: 30px;
  font-size: 24px;
  font-weight: 400;
  color: rgba(219, 43, 19, 1);
}
.shoot-icon {
  width: 100px;
  height: 100px;
}
.shoot-desc {
  margin-top: 30px;
  font-size: 30px;
  font-weight: 600;
  color: rgba(42, 118, 254, 1);
}
.sub-btn {
  width: 80%;
  margin-left: 10%;
  margin-top: 30px;
}
.reset-btn {
  z-index: -1;
  bottom: 1.5625rem;
}
.show-container {
  padding: 0 20px 0 20px;
}
.company-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}
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
.mask {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100vw;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  .protocol-wrapper {
    position: absolute;
    bottom: 0;
  }
}
.protocol-link-wrapper {
  padding: 0.875rem 0 1.25rem 1.25rem;
  display: flex;
  align-items: flex-start;
  font: 400 13px PingFangSC-Regular, PingFang SC;
  .protocol-select-btn {
    margin-top: 0.25rem;
    margin-right: 0.25rem;
  }
  .protocol {
    color: #1b6ffb;
  }
}
/deep/.ivu-form-item-label:before {
  content: '';
}
/deep/.ivu-input {
  border: none;
  height: 1.125rem;
  padding: 0;
}
/deep/.ivu-form-item {
  margin-bottom: 0;
  padding-top: 0.5rem;
  padding-bottom: 0.8125rem;
  border-bottom: 1px solid #eadfdf;
  padding-left: 1.25rem;
}
/deep/.ivu-form-item-error-tip {
  padding-top: 0;
}
/deep/.ivu-input[disabled] {
  background: #ffffff;
}
</style>
