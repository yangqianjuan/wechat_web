<template>
  <div>
    <div class="remind">请上传SaaS软件销售合同</div>
    <div class="img-list-warpper">
      <img
        v-for="(imgItem, index) in imgList"
        class="contract_item"
        @click="chooseImg(index)"
        :class="imgList.needRoate ? 'rotate-img' : 'select-img'"
        :key="index"
        :src="imgItem.imgUrl"
      />

      <!--上传合同照片-->
      <div class="img-wrapper" @click="chooseImg">
        <div class="notice-wrapper">
          <img class="shoot-icon" :src="takePicIcon" />
          <span class="shoot-desc">点击拍照</span>
        </div>
      </div>
    </div>
    <div>
      <Button @click="submitInfo" class="sub-btn" type="primary" :loading="isLoading">确认提交</Button>
    </div>
  </div>
</template>
<script>
import { chooseWxImage, getFileName } from '../../../../utils/wx/wxUtils';
import initUploadObj from '@/controller/upload';
import { dataURLtoFile, jdugeImgDirection } from '../../../../utils/common/common';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { saveSaleContract } from '@/request/interface/impower/Sass.js';
export default {
  /**
   * sass 销售合同的上传
   *
   * */
  name: 'SassContractUpload',
  data() {
    return {
      imgList: [],
      uploadImgList: [],
      takePicIcon: require('@/assets/imgs/ic_shoot.png'),
      reChooseIcon: require('@/assets/imgs/icon/ic_re_choose.png'),
      isLoading: false,
      readOver: false,
      frontNeedRoate: false,
      backNeedRoate: false,
      isAgree: '',
      idCard: {},
      protocolText: [],
      redirectUrl: '',
      isOverVerify: '',
      referrer: '',
      productId: ''
    };
  },
  created() {
    let referrer = this.$store.state.referrer;
    let productId = this.$store.state.productId;
    this.referrer = referrer;
    this.productId = productId;
  },
  methods: {
    dateChange(value) {
      console.log(value);
    },
    chooseImg(index = '') {
      console.log(index);
      const that = this;
      let japiList = ['chooseImage', 'getLocalImgData'];
      let isPress = true;
      let needRoate = false;
      this.$toasting.show({ message: '读取中', forbidClick: true });
      chooseWxImage(japiList, isPress)
        .then((res) => {
          jdugeImgDirection(res).then((res) => {
            needRoate = res;
          });
          let pic = dataURLtoFile(res, getFileName());
          return that.uploadUtil(pic);
        })
        .then((imgUrl) => {
          let imgItem = {
            imgUrl,
            needRoate
          };
          let imgList = this.imgList;
          let uploadImgList = this.uploadImgList;
          if (index >= 0) {
            imgList.splice(index, 1, imgItem);
            uploadImgList.splice(index, 1, imgUrl);
          } else {
            imgList.push(imgItem);
            uploadImgList.push(imgUrl);
          }
          this.uploadImgList = uploadImgList;
          this.imgList = imgList;
        })
        .catch((err) => {
          this.$notify.error({ msg: '相册读取失败！' });
        })
        .finally((_) => {
          this.$toasting.hide();
        });
    },
    // 上传、识别idCard
    uploadUtil(picFace) {
      let that = this;
      return new Promise((resolve, reject) => {
        initUploadObj(that, new Date().getTime(), picFace, 'image', (res) => {
          resolve(res.pic);
        });
      });
    },
    // 保存合同图片url
    submitInfo() {
      let pageAcount = 2;
      let uploadImgList = this.uploadImgList;
      if (uploadImgList.length >= pageAcount) {
        this.isLoading = true;
        this.$toasting.show({ message: '上传中', forbidClick: true });
        let params = {
          saleContractList: uploadImgList,
          productId: this.productId
        };
        saveSaleContract(params)
          .then(async (res) => {
            let nextPath = await queryNextByUnionKeyAndProdId(this.productId);
            this.$router.replace({ path: nextPath });
          })
          .catch((err) => {
            let errMsg = err?.data?.msg || '保存失败！';
            this.$notify.error({ msg: errMsg });
          })
          .finally(() => {
            this.$toasting.hide();
            this.isLoading = false;
          });
      } else {
        this.$notify.error({ msg: '请上传SaaS软件销售合同！' });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.notice-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
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

.img-list-warpper {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: space-around;
  margin: 0.75rem;
  .contract_item {
    width: 40vw;
    height: 60vw;
    border-radius: 0.4375rem;
    margin-top: 0.625rem;
  }
}

.show-container {
  .notice {
    text-align: center;
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
