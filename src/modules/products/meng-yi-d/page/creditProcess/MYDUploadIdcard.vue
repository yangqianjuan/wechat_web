<template>
  <div class="myd-id-card" v-if="!isOverVerify">
    <div class="remind">{{readOver ? "请核对身份证信息" : "请上传本人真实有效信息"}}</div>
    <div v-if="!readOver" class="myd-id-card-title">上传身份证</div>
    <div v-if="!readOver" class="myd-id-card-desc">请拍摄或上传本人第二代居民身份证原件照片</div>
    <div v-if="!readOver">
      <div class="item-wrapper" @click="chooseImg('picFace')">
        <div class="img-wrapper front-bg">
          <div class="select-img-wrapper">
            <img :class="frontNeedRoate ? 'rotate-img' : 'select-img'" :src="picFace" v-if="picFace" alt="人像页" />
          </div>
        </div>
        <div class="sec-title">身份证人像面</div>
      </div>

      <div class="item-wrapper" @click="chooseImg('picNationalEm')">
        <div class="img-wrapper">
          <div class="select-img-wrapper">
            <img
              :class="backNeedRoate ? 'rotate-img' : 'select-img'"
              :src="picNationalEm"
              v-if="picNationalEm"
              alt="国徽页"
            />
          </div>
        </div>
        <div class="sec-title">身份证国徽面</div>
      </div>
    </div>
    <!--确认身份信息-->
    <div v-if="readOver" class="common-from">
      <Form :model="idCard" :label-width="100" :rules="ruleValidate" ref="formDynamic" label-position="left">
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
      <p class="notice">
        <Icon type="ios-alert-outline" />请确认身份证信息无误后，再提交！
      </p>
    </div>

    <div class="protocol-link-wrapper" v-if="!isShowProtocol && readOver">
      <Checkbox class="protocol-select-btn" v-model="isAgree" label="agree"></Checkbox>
      <p>
        <span class="agree">请阅读并同意协议</span>
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
    <div class="common-submit-btn">
      <div class="submit-btn">
        <Button @click="readOver ? submitInfo('formDynamic') : uploadIdPic()">{{readOver ? '确认提交' : '确认上传'}}</Button>
      </div>
      <div class="clear-btn">
        <Button v-if="readOver" @click="resetImgUrl">重新选择</Button>
      </div>
    </div>
  </div>
</template>
<script>
import { chooseWxImage, getFileName } from '@/utils/wx/wxUtils';
import { idCardOCR } from '@/request/interface/txQrc/readerPci';
import initUploadObj from '@/controller/upload';
import { dataURLtoFile, mergeObj, jdugeImgDirection } from '@/utils/common/common';
import { updateUserInfo, jdugeNewUserRoute } from '@/controller/userController';
import IdCard from '@/model/IdCared';
import ProtocolList from '@/common/components/common/ProtocolList.vue';
import MxProtocol from '@/common/mixin/MxProtocol.js';
import { commonMydMixin } from '@/modules/products/meng-yi-d/utils/common';

export default {
  name: 'MYDUploadCard',
  mixins: [MxProtocol, commonMydMixin],
  data() {
    const validateIdNum = (rule, value, callback) => {
      let _IDRe18 = /^([1-6][1-9]|50)\d{4}(18|19|20)\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
      let _IDre15 = /^([1-6][1-9]|50)\d{4}\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}$/;
      const regIdNum18 = new RegExp(_IDRe18);
      const regIdNum15 = new RegExp(_IDre15);
      if (regIdNum18.test(value) || regIdNum15.test(value)) {
        callback();
      } else {
        callback(new Error('身份证号格式错误'));
      }
    };

    return {
      picFace: '',
      picNationalEm: '',
      takePicIcon: require('@/assets/imgs/ic_shoot.png'),
      reChooseIcon: require('@/assets/imgs/icon/ic_re_choose.png'),
      readOver: false,
      frontNeedRoate: false,
      backNeedRoate: false,
      isShowProtocol: false,
      isAgree: '',
      idCard: {},
      redirectUrl: '',
      isOverVerify: '',
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
  components: {
    'p-protocol-list': ProtocolList
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      this.setWechatTitle('上传身份证照片');
      this.getMydUnionKey();
      this.getProtocolList(this.creditPreInfo.productId || '1038');
    },

    async chooseImg(target) {
      let japiList = ['chooseImage', 'uploadImage', 'getLocalImgData', 'previewImage'],
        isPress = true;
      try {
        this.$toasting.show({ message: '读取中', forbidClick: true });
        const chooseRes = await chooseWxImage(japiList, isPress);
        const directionRes = await jdugeImgDirection(chooseRes);
        if (target === 'picFace') {
          this.picFace = chooseRes;
          this.frontNeedRoate = directionRes;
        } else {
          this.picNationalEm = chooseRes;
          this.backNeedRoate = directionRes;
        }
      } catch (e) {
        this.$notify.error({ msg: e?.data?.msg || '相册读取失败！' });
      } finally {
        this.$toasting.hide();
      }
    },

    /**
     * 上传、识别idCard
     * */
    async uploadIdPic() {
      if (this.picFace && this.picNationalEm) {
        try {
          if (!this.readOver) {
            this.$toasting.show({ message: '识别中', forbidClick: true });
            let params = {
              frontImageUrl: this.picFace,
              backImageUrl: this.picNationalEm,
              productId: this.creditPreInfo.productId,
              selfFlag: true
            };
            const uploadFaceRes = await this.uploadUtil(dataURLtoFile(params.frontImageUrl, getFileName()));
            const uploadNationalRes = await this.uploadUtil(dataURLtoFile(params.backImageUrl, getFileName()));
            params.frontImageUrl = uploadFaceRes;
            params.backImageUrl = uploadNationalRes;
            const idCardOCRRes = (await idCardOCR(params))?.data?.data;
            const idCardRes = mergeObj(idCardOCRRes[0], idCardOCRRes[1]);
            const idCard = new IdCard(idCardRes);
            this.readOver = !this.readOver;
            this.setWechatTitle('身份证信息确认');
            this.idCard = idCard;
          }
        } catch (e) {
          this.$notify.error({ msg: '识别失败！' });
          this.uploadFail();
        } finally {
          this.$toasting.hide();
        }
      } else {
        this.$notify.error({ msg: '请选择图片！' });
      }
    },

    submitInfo(name) {
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          if (!this.isAgree) {
            this.$notify.info({ msg: '请阅读并同意协议！' });
            return;
          }
          this.$toasting.show({ message: '上传中', forbidClick: true });
          let idCard = this.idCard;
          idCard.referrer = this.creditPreInfo.referrer;
          idCard.productId = this.creditPreInfo.productId;
          idCard.applyUnionKey = this.applyUnionKey;
          try {
            const updateResult = (await updateUserInfo(idCard))?.data?.success;
            if (updateResult) {
              jdugeNewUserRoute();
              this.$router.replace({
                path: '/myd_idno_name_phone_verify',
                query: { referrer: this.creditPreInfo.referrer, productId: this.creditPreInfo.productId }
              });
            } else {
              this.$notify.error({ msg: '身份证上传失败！' });
            }
          } catch (e) {
            this.$notify.error({ msg: e?.data?.msg || '信息更新失败！' });
          } finally {
            this.$toasting.hide();
          }
        }
      });
    },

    uploadUtil(picFace) {
      return new Promise((resolve, reject) => {
        initUploadObj(this, new Date().getTime(), picFace, 'image', (res) => {
          resolve(res?.pic);
        });
      });
    },
    uploadFail() {
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
        fileType: protocol.code,
        applyUnionKey: this.applyUnionKey
      };
      this.queryProtocolText(params, index);
    },
    switchShowProtocol() {
      this.isShowProtocol = !this.isShowProtocol;
    }
  }
};
</script>
<style lang="scss" scoped>
@import '../../assets/css/common.scss';
.myd-id-card {
  .myd-id-card-title {
    margin-top: 42px;
    font-size: 40px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: $font-color-4;
    text-align: center;
  }
  .myd-id-card-desc {
    margin-top: 15px;
    text-align: center;
    font-size: 25px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: $font-color-5;
  }

  .item-wrapper {
    margin-top: 43px;
    .img-wrapper {
      width: 362px;
      height: 223px;
      margin: 0 auto;
      margin-top: 43px;
      background-image: url('../../../../../assets/imgs/myd/bg_national_emblem.png');
      background-repeat: no-repeat;
      background-size: contain;
      display: flex;
      justify-content: center;
      position: relative;
    }
    .front-bg {
      background-image: url('../../../../../assets/imgs/myd/bg_face.png');
    }
    .sec-title {
      margin-top: 24px;
      text-align: center;
      font-size: 32px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: $font-color-4;
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
  }
}
</style>
