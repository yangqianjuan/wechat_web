<template>
  <div class="img-list-wrapper">
    <div class="title-wrapper">
      <p class="title">{{title}}</p>
    </div>
    <div class="upload-img-wrapper">
      <div class="img-warpper" v-for="(imgItem, index) in imgList" :key="index">
        <img class="uploaded-img" :src="imgItem" />
        <img class="ic-remove" @click="removeImg(index)" :src="icRemove" />
      </div>
      <div @click="uplaodImg" class="ic-add-wrapper">
        <img :src="icAdd" class="ic-add" alt="添加照片" />
        <p class="add-desc">添加照片</p>
      </div>
    </div>
  </div>
</template>
<script>
import { chooseWxImage, getFileName, uploadUtil } from '@/utils/wx/wxUtils';
import { dataURLtoFile } from '@/utils/common/common';
import initUploadObj from '@/controller/upload';
export default {
  name: 'imgUpload',
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
      icRemove: require('@/assets/imgs/icon/ic_remove.png')
    };
  },
  methods: {
    // 图片的选取与上传
    uplaodImg() {
      let imgList = this.imgList;
      let jsapiList = ['chooseImage', 'uploadImage', 'getLocalImgData', 'previewImage'];
      let that = this;
      chooseWxImage(jsapiList)
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
.img-list-wrapper {
  background: #ffffff;
  .title-wrapper {
    padding-left: 20px;
    border-bottom: 1px solid #e9e9e9;
    .title {
      font-size: 26px;
      font-weight: 500;
      line-height: 40px;
    }
  }
  .upload-img-wrapper {
    padding: 16px 0 16px 20px;
    display: flex;
    flex-wrap: wrap;
    .ic-add-wrapper {
      width: 180px;
      height: 180px;
      border: 1px dashed #bababa;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-right: 1.125rem;
      margin: 0.625rem 0.7rem 0 0;
      .ic-add {
        height: 40px;
        width: 40px;
      }
      .add-desc {
        margin-top: 30px;
        font-size: 26px;
        color: #9d9d9d;
      }
    }

    .img-warpper {
      width: 200px;
      height: 200px;
      position: relative;
      border: 1px dashed #bababa;
      margin: 0.625rem 0.7rem 0 0;
      display: flex;
      align-items: center;
      .uploaded-img {
        width: 100%;
        max-height: 100%;
      }
      .ic-remove {
        position: absolute;
        top: -0.375rem;
        right: -0.375rem;
        height: 26px;
        width: 26px;
      }
    }
  }
}
</style>
