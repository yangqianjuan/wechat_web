<template>
  <div class="company-approve-wrapper">
    <div class="remind">请上传预付款转账记录凭证照片</div>
    <div>
      <div class="item-wrapper">
        <p class="sec-title">上传预付款凭证</p>
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

    <Button @click="uploadIdPic" class="sub-btn" type="primary" :loading="isLoading">确认提交</Button>
  </div>
</template>
<script>
import { chooseWxImage, getFileName } from '@/utils/wx/wxUtils';
import initUploadObj from '@/controller/upload';
import { dataURLtoFile, jdugeImgDirection } from '@/utils/common/common';
import { transferVoucherUpload } from '@/request/interface/impower/Sass.js';

export default {
  data() {
    return {
      picFace: '',
      isStepUpload: true,
      busindessLicense: {},
      takePicIcon: require('@/assets/imgs/ic_shoot.png'),
      userInfo: {},
      ruleValidate: {
        corpName: [{ required: true, message: '请填写企业名称', trigger: 'blur' }],
        corpId: [{ required: true, message: '请填写社会统一信用代码', trigger: 'blur' }]
      },
      protocolText: [],
      frontNeedRoate: false,
      isLoading: false,
      applyUnionKey: ''
    };
  },

  created() {
    this.applyUnionKey = this.$route.query.applyUnionKey;
  },
  mounted() {
    this.isStepUpload = true;
  },
  methods: {
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
            let applyUnionKey = this.applyUnionKey;
            return transferVoucherUpload({ fileUrl: res, applyUnionKey });
          })
          .then((res) => {
            let query = { title: '转账记录审核结果', msg: '您的转账记录已提交，请等待管理员确认到账' };
            this.$router.replace({ path: '/sass_contract_result', query });
          })
          .catch((err) => {
            this.qcrErrHandle();
          })
          .finally(() => {
            this.$toasting.hide();
            this.isLoading = false;
          });
      } else {
        this.$notify.info({ msg: '请上传营业执照！' });
      }
    },
    qcrErrHandle() {
      this.picFace = '';
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
  background-image: url('../../../../assets/imgs/company_approve.png');
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
::v-deep(.ivu-form-item-label:before) {
  content: '';
}
::v-deep(.ivu-input) {
  border: none;
  height: 1.125rem;
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
</style>
