<template>
  <div class="myd-base-info">
    <div class="from-container">
      <div>
        <div class="item-wrapper">
          <div class="item-title">姓名</div>
          <div class="item-value">{{formItem.emergencyContact}}</div>
        </div>
        <div class="address-wrapper">
          <div class="address-span">所在地区</div>
          <v-distpicker wrapper="selectAddress" @province="getProvinceCode" @city="getCityCode" @area="getAreaCode"></v-distpicker>
        </div>
        <div class="address-wrapper">
          <div class="address-span">详细地址</div>
          <input class="address-detail" placeholder="请输入详细地址" type="text" v-model="formItem.addressDetail" />
        </div>
      </div>
    </div>
    <iframe
      ref="mapPage"
      id="mapPage"
      width="100%"
      height="350px"
      frameborder="0"
      src="https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=DVUBZ-G47KU-WMVVG-45YKH-YDZOE-UHFDF&referer=testMyAddress"
    ></iframe>
    <div class="address-err-desc">{{addressErr}}</div>
    <div class="common-submit-btn">
      <div class="submit-btn">
        <Button class="sub-btn" @click="handleSubmit">确认提交</Button>
      </div>
    </div>
  </div>
</template>
<script>
import VDistpicker from 'v-distpicker';
import { saveApplyPersonBaseInfo } from '@/request/interface/impower/UserInfo';
import { jdugeNewUserRoute } from '@/controller/userController';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { commonMydMixin } from '@/modules/products/meng-yi-d/utils/common';

export default {
  name: 'MYDBaseInfo',
  mixins: [commonMydMixin],
  data() {
    return {
      formItem: {
        addressDetail: '',
        emergencyContact: '',
        userId: ''
      },
      addressErr: '',
      province: '',
      city: '',
      area: ''
    };
  },
  components: {
    'v-distpicker': VDistpicker
  },
  created() {
    this.init();
  },

  methods: {
    async init() {
      this.getMydUnionKey();
      jdugeNewUserRoute().then((user) => {
        this.formItem.emergencyContact = user.name;
        this.formItem.userId = user.userId;
      });
      this.watchLocaltion();
    },
    watchLocaltion() {
      let that = this;
      window.addEventListener(
        'message',
        function (event) {
          let loc = event.data;
          that.loc = JSON.stringify(loc);
          if (loc && loc.module == 'locationPicker') {
            that.formItem.addressDetail = `${loc.poiaddress}`;
          }
        },
        false
      );
    },

    handleSubmit(name) {
      if (!this.province) {
        this.addressErr = '请选择省份';
        return;
      } else if (!this.city) {
        this.addressErr = '请选择城市';
        return;
      } else if (!this.area) {
        this.addressErr = '请选择区域';
        return;
      } else if (!this.formItem.addressDetail) {
        this.addressErr = '请填写详细地址';
        return;
      } else {
        this.addressErr = '';
      }
      let baseInfo = {
        referrer: this.creditPreInfo.referrer,
        productId: this.creditPreInfo.productId,
        areaCode: `${this.province},${this.city},${this.area}`,
        resideAddress: this.formItem.addressDetail,
        applyUnionKey: this.applyUnionKey
      };
      this.$toasting.show({ message: '上传中', forbidClick: true });
      saveApplyPersonBaseInfo(baseInfo)
        .then(async (res) => {
          if (res?.data?.success) {
            let nextPath = await queryNextByUnionKeyAndProdId(this.creditPreInfo.productId, this.applyUnionKey);
            this.$router.replace({
              path: nextPath,
              query: { referrer: this.creditPreInfo.referrer, productId: this.creditPreInfo.productId }
            });
          } else {
            this.$notify.error({
              msg: '地址信息上传失败！'
            });
          }
        })
        .catch((err) => {
          this.$notify.error({
            msg: err?.data?.msg || '信息录入失败！'
          });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    getProvinceCode(province) {
      this.province = province?.code;
    },

    getCityCode(city) {
      this.city = city?.code;
    },

    getAreaCode(area) {
      this.area = area?.code;
    }
  }
};
</script>
<style lang="scss" scoped>
@import '../../assets/css/common.scss';
.myd-base-info {
  min-height: 100vh;
  .from-container {
    display: flex;
    justify-content: center;
    background-color: $white;
    width: 100%;
    padding-bottom: 18px;
    .item-wrapper {
      width: 686px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid $border-color-1;
      padding: 36px 0;
      .item-title {
        font-size: 30px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: $default-font-color;
        line-height: 42px;
      }
      .item-value {
        font-size: 30px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: $default-font-color;
        line-height: 42px;
      }
    }
    .address-wrapper {
      padding: 36px 0;
      width: 686px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      border-bottom: 1px solid $border-color-1;
      .address-span {
        margin-right: 16px;
        width: 20%;
        font-size: 30px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: $default-font-color;
        line-height: 42px;
      }
      .selectAddress {
        width: 80%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex: 1 1 6.5rem;
        label {
          width: 30%;
        }
      }
      .selectAddress label:nth-child(0) {
        background: chartreuse;
      }
      .address-detail {
        border: none;
        outline: none;
        width: 80%;
      }
      input {
        font-size: 30px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: $default-font-color;
        line-height: 42px;
      }
      input::-webkit-input-placeholder {
        color: $font-color-6;
        text-align: right;
      }
      input::-moz-placeholder {
        /* Mozilla Firefox 19+ */
        color: $font-color-6;
        text-align: right;
      }
      input:-moz-placeholder {
        /* Mozilla Firefox 4 to 18 */
        color: $font-color-6;
        text-align: right;
      }
      input:-ms-input-placeholder {
        /* Internet Explorer 10-11 */
        color: $font-color-6;
        text-align: right;
      }
    }
  }

  ::v-deep(.selectAddress select) {
    -webkit-appearance: none;
    width: 100%;
    min-width: 4.375rem;
    padding-right: 8px;
    border-radius: 4px;
    direction: rtl;
    border: none;
    outline: none;
    background: $white;
    color: $default-font-color;
    overflow: auto;
    font-size: 30px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
  }
  ::v-deep(.selectAddress option) {
    height: 32px;
    border: 1px solid $border-color-1;
    border-radius: 4px;
    margin-left: 15px;
  }
  .ivu-form-item {
    margin-bottom: 20px;
  }
  .address-err-desc {
    margin-top: 16px;
    text-align: center;
    font-size: 26px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: $font-color-1;
    line-height: 37px;
  }
}
</style>
