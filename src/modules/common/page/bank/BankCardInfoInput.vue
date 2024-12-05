<template>
  <div class="bank-card-info-input">
    <van-field
      v-model="debitCardNum"
      :label="config.bankNo.label"
      v-if="isShowBankCard"
      :placeholder="config.bankNo.placeholder"
      :maxlength="debitCardNumMaxLegnth"
    >
      <van-icon name="scan" slot="right-icon" @click="gotoQrcBankCard" />
    </van-field>
    <van-field :label="config.bankName.label" v-if="isShowBankName" :placeholder="config.bankName.placeholder">
      <van-dropdown-menu active-color="#3552D0" slot="input">
        <van-dropdown-item v-model="bankCode" :options="bankNameList" />
      </van-dropdown-menu>
    </van-field>
  </div>
</template>
<script>
import { chooseWxImage, getFileName } from '@/utils/wx/wxUtils';
import { dataURLtoFile } from '@/utils/common/common';
import { bankCardOCR } from '@/request/interface/txQrc/readerPci';
import { BankCard } from '@/model/BankCard';
import initUploadObj from '@/controller/upload';
import { BANKLIST_COMMON } from '@/utils/common/bank';
export default {
  // 银行卡信息的录入
  name: 'BankCardInfoUInput',
  props: {
    userId: {
      type: Number,
      require: true
    },
    productInfo: {
      type: Object
    },
    isShowBankName: {
      type: Boolean,
      default: () => {
        return true;
      }
    },
    isShowBankCard: {
      type: Boolean,
      default: () => {
        return true;
      }
    },
    config: {
      type: Object,
      default: () => {
        return {
          bankNo: {
            required: true,
            label: '银行卡号',
            placeholder: '银行卡号'
          },
          bankName: {
            required: true,
            label: '银行名称',
            placeholder: '银行名称'
          }
        };
      }
    }
  },
  data() {
    return {
      // 卡号长度
      debitCardNumMaxLegnth: 21,
      // 卡片信息
      bankCard: {},
      // 图片是否加载完成
      isPicLoadOver: true,
      // 银行卡号
      debitCardNum: '',
      // 银行名字
      bankName: '',
      // 银行的code
      bankCode: '',
      // 银行列表
      bankNameList: []
    };
  },
  created() {
    // 获取对应的银行名列表
    this.bankNameList = this.getBankNameList(this.productInfo.type);
  },
  methods: {
    // 通过选中图片的形式，快速填入用户信息
    gotoQrcBankCard() {
      if (!this.isPicLoadOver) {
        return;
      }
      this.isPicLoadOver = false;
      let japiList = ['chooseImage', 'uploadImage', 'getLocalImgData', 'previewImage'];
      let picFace = '';
      chooseWxImage(japiList)
        .then((res) => {
          this.$toasting.show({ message: '识别中', forbidClick: true });
          picFace = dataURLtoFile(res, getFileName());
          return this.uploadUtil(picFace);
        })
        .then((res) => {
          return bankCardOCR({ imageUrl: res, userId: this.userId });
        })
        .then((res) => {
          let bankCard = new BankCard(res?.data?.data);
          this.bankCard = bankCard;
          this.debitCardNum = bankCard.cardNo;
          let bankCardCode = this.getBankNumByName(bankCard.bankName);
          if (bankCardCode) {
            this.bankName = bankCard.bankName;
            this.bankCode = bankCardCode;
          }
        })
        .catch((err) => {
          this.hideLoading();
          this.$notify.error({
            msg: '识别失败!请确图片内容！'
          });
        })
        .finally(() => {
          this.hideLoading();
        });
    },

    // 隐藏图片加载完成
    hideLoading() {
      this.isPicLoadOver = true;
      this.$toasting.hide();
    },

    /**
     * 通过银行的名字，获取银行的编号code
     *
     */
    getBankNumByName(bankName) {
      let bankList = this.bankNameList;
      let bankNum;
      bankList.forEach((bank) => {
        if (bank.text === bankName) {
          bankNum = bank.value;
        }
      });
      return bankNum;
    },

    // 图片上传
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
          'bank_card'
        );
      });
    },

    // 获取对应产品的银行列表
    getBankNameList(type) {
      if (type) {
        if (type === 'xwe') {
          return BANKLIST_COMMON;
        }
      } else {
        this.$notify.info({
          msg: '传入相应的产品类型！'
        });
        return [];
      }
    },

    // 获取值
    getValue() {
      // 返回银行卡号、扫描的银行卡信息、每个银行对应的code、银行名
      return {
        bankCardNo: this.debitCardNum,
        bankCard: this.bankCard,
        bankCode: this.bankCode,
        bankName: this.bankName
      };
    }
  }
};
</script>
<style lang="scss" scoped>
.bank-card-info-input {
  width: 100%;
  .van-icon-scan {
    width: 40px;
    height: 40px;
  }
  .van-icon-scan::before {
    font-size: 40px;
    color: #3552d0;
  }
  ::v-deep(.van-dropdown-menu) {
    width: 100%;
    .van-dropdown-menu__bar {
      box-shadow: unset;
      height: 40px;
      .van-dropdown-menu__title {
        width: 100%;
      }
      .van-dropdown-menu__title::after {
        border: 8px solid;
        border-color: transparent transparent #dcdee0 #dcdee0;
        right: 0;
      }
    }
    .van-dropdown-item--down {
      background-color: #fff;

      .van-dropdown-item__content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 20px;
        .van-dropdown-item__option {
          width: 90%;
          min-height: 80px;
          .van-cell__title {
            span {
              font-size: 30px;
              // color: #999999;
            }
          }
        }
      }
    }
  }
  .van-cell--borderless::after,
  .van-cell:last-child::after {
    display: block;
  }
}
</style>
