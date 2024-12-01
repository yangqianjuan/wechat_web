<template>
  <div class="img-list-content">
    <div class="title-content">
      <p class="title">{{title}}</p>
    </div>
    <div class="upload-img-content">
      <div class="img-content" v-for="(imgItem, index) in imgList" :key="index">
        <img class="uploaded-img" :src="imgItem" />
        <img class="ic-remove" @click="removeImg(index)" :src="icRemove" />
      </div>
      <div @click="uploadImg" class="ic-add-content">
        <img :src="icAdd" class="ic-add" alt="添加照片" />
        <p class="add-desc">添加照片</p>
      </div>
    </div>
  </div>
</template>
<script>
import { chooseWxImage, getFileName, uploadUtil } from '@/utils/wx/wxUtils';
import { dataURLtoFile } from '@/utils/common/common';
export default {
  name: 'ImgUpload',
  model: {
    prop: 'imgList',
    event: 'change'
  },
  props: {
    title: {
      type: String
    },
    imgList: {
      type: Array
    }
  },
  data() {
    return {
      icAdd: require('@/assets/imgs/icon/ic_add.png'),
      icRemove: require('@/assets/imgs/myd/close.png')
    };
  },
  methods: {
    uploadImg() {
      let imgList = this.imgList;
      const that = this;
      const uploadTypeList = ['chooseImage', 'uploadImage', 'getLocalImgData', 'previewImage'];
      chooseWxImage(uploadTypeList)
        .then((file) => {
          this.$toasting.show({ message: '读取中', forbidClick: true });
          file = dataURLtoFile(file, getFileName());
          return uploadUtil(that, file, 'audit_file');
        })
        .then((imgUrl) => {
          imgList.push(imgUrl);
          that.$emit('change', imgList);
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },
    removeImg(index) {
      let imgList = this.imgList;
      imgList.splice(index, 1);
      this.$emit('change', imgList);
    }
  }
};
</script>
<style lang="scss" scoped>
@import '../../assets/css/common.scss';
.img-list-content {
  background: $white;
  width: 686px;
  .title-content {
    padding: 28px 0;
    border-bottom: 1px solid #e5e5e5;
    .title {
      font-size: 30px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: $default-font-color;
      line-height: 42px;
    }
  }
  .upload-img-content {
    padding: 40px 0;
    display: flex;
    flex-wrap: wrap;
    .ic-add-content {
      width: 105px;
      height: 105px;
      border: 1px dashed #c2c2c2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .ic-add {
        height: 26px;
        width: 26px;
      }
      .add-desc {
        margin-top: 12px;
        font-size: 20px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #c2c2c2;
        line-height: 28px;
      }
    }

    .img-content {
      position: relative;
      width: 105px;
      height: 105px;
      border: 1px dashed #c2c2c2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-right: 50px;

      .uploaded-img {
        width: 100%;
        max-height: 100%;
      }
      .ic-remove {
        position: absolute;
        top: -6px;
        right: -6px;
        width: 30px;
        max-height: 30px;
      }
    }
  }
}
</style>
