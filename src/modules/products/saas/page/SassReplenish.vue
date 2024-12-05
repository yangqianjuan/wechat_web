<template>
  <div class="page-container">
    <div class="from-container">
      <div class="address-wrapper">
        <div class="address-span">
          居住地址
          <span class="ness">*</span>
        </div>
        <v-distpicker hide-area wrapper="selectAddress" @province="getPprovinceCode" @city="getCityCode"></v-distpicker>
      </div>

      <show-item title="详细地址">
        <div class="detail-address-input-wrapper">
          <input class="address-detail" placeholder="请输入详细地址" type="text" v-model="formItem.addressDetail" />
          <div class="map-btn-wrapper" @click="switchShowMap">
            <img class="ic-map-btn" :src="icLocation" alt />
            <p class="map-btn-desc">定位</p>
          </div>
        </div>
      </show-item>

      <show-item title="学历">
        <Select v-model="formItem.edu" style="width:200px" placeholder="请选择学历">
          <Option v-for="item in deuBackgroundArr" :value="item.key" :key="item.key">{{ item.value }}</Option>
        </Select>
      </show-item>
      <show-item title="学位">
        <Select v-model="formItem.degree" style="width:200px" placeholder="请选择学位">
          <Option v-for="item in degreeArr" :value="item.key" :key="item.key">{{ item.value }}</Option>
        </Select>
      </show-item>
      <show-item title="家庭年收入（万元）">
        <input
          class="address-detail"
          placeholder="请输入家庭年收入"
          :maxlength="5"
          @input="familyAnnualIncomeChange"
          type="text"
          v-model="formItem.familyAnnualIncome"
        />
      </show-item>
      <show-item title="个人年收入（万元）">
        <input
          class="address-detail"
          placeholder="请输入个人年收入"
          :maxlength="5"
          @input="personalAnnualIncomeChange"
          type="text"
          v-model="formItem.personalAnnualIncome"
        />
      </show-item>
      <show-item title="婚姻状况">
        <Select v-model="formItem.maritalStatus" style="width:200px" placeholder="请选择婚姻状态">
          <Option v-for="item in maritalStatusArr" :value="item.key" :key="item.key">{{ item.value }}</Option>
        </Select>
      </show-item>
    </div>
    <div class="map-wrapper" v-show="isShowMap">
      <iframe id="mapPage" width="100%" height="350px" frameborder="0" :src="mapSrc"></iframe>
    </div>
    <div class="address-err-desc">{{errText}}</div>
    <Button class="sub-btn" type="primary" :loading="isLoading" @click="handleSubmit">下一步</Button>
  </div>
</template>
<script>
import VDistpicker from 'v-distpicker';
import { saveApplyPersonBaseInfo } from '@/request/interface/impower/UserInfo';
import showItem from './components/showItem';
import { DEGREE_BACKGROUND_ARR, EDU_BACKGROUND_ARR, MARITAL_STATUS_ARR } from './utils/replenishUtil';
export default {
  /**
   * 信息补充： sass 单个使用
   *      1、
   * */
  name: 'SassReplenish',
  data() {
    return {
      formItem: {
        edu: '', // 学历
        degree: '', // 学位
        maritalStatus: '', // 婚姻状况
        addressDetail: '',
        familyAnnualIncome: '',
        personalAnnualIncome: ''
      },
      errText: '',
      province: '',
      city: '',
      isShowMap: false,
      isLoading: false,
      icLocation: require('@/assets/imgs/icon/ic_location.png'),
      deuBackgroundArr: EDU_BACKGROUND_ARR,
      degreeArr: DEGREE_BACKGROUND_ARR,
      maritalStatusArr: MARITAL_STATUS_ARR,
      mapSrc:
        'https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=DVUBZ-G47KU-WMVVG-45YKH-YDZOE-UHFDF&referer=testMyAddress'
    };
  },
  components: {
    'v-distpicker': VDistpicker,
    'show-item': showItem
  },
  created() {
    this.watchLocaltion();
  },
  methods: {
    watchLocaltion() {
      let that = this;
      window.addEventListener(
        'message',
        function (event) {
          // 接收位置信息，用户选择确认位置点后选点组件会触发该事件，回传用户的位置信息
          let loc = event.data;
          that.loc = JSON.stringify(loc);
          if (loc && loc.module == 'locationPicker') {
            //防止其他应用也会向该页面post信息，需判断module是否为'locationPicker'
            that.formItem.addressDetail = `${loc.poiaddress}`;
            that.switchShowMap();
          }
        },
        false
      );
    },

    // 提交
    handleSubmit(name) {
      let that = this;
      let errText = this.valiFrom();
      this.errText = errText;
      if (errText) {
        return;
      }
      this.isLoading = true;
      let baseInfo = {
        referrer: this.$store.state.referrer,
        productId: this.$store.state.productId,
        areaCode: `${this.province},${this.city}`,
        resideAddress: this.formItem.addressDetail,
        maritalStatus: this.formItem.maritalStatus,
        familyYearlySalary: this.formItem.familyAnnualIncome * 10000,
        yearlySalary: this.formItem.personalAnnualIncome * 10000,
        education: this.formItem.edu,
        degree: this.formItem.degree
      };
      this.$toasting.show({ message: '加载中', forbidClick: true });
      saveApplyPersonBaseInfo(baseInfo)
        .then((res) => {
          this.$router.replace({
            path: '/sass_replenish_id_card',
            query: { maritalStatus: this.formItem.maritalStatus }
          });
        })
        .catch((err) => {
          let msg = err?.data?.msg || '信息录入失败！';
          this.$notify.error({ msg: msg });
        })
        .finally(() => {
          this.isLoading = false;
          this.$toasting.hide();
        });
    },
    familyAnnualIncomeChange() {
      let familyAnnualIncome = this.formItem.familyAnnualIncome;
      familyAnnualIncome = familyAnnualIncome.replace(/[^0-9]+/g, '');
      this.$nextTick(() => {
        this.formItem.familyAnnualIncome = familyAnnualIncome;
      });
    },
    personalAnnualIncomeChange() {
      let personalAnnualIncome = this.formItem.personalAnnualIncome;
      personalAnnualIncome = personalAnnualIncome.replace(/[^0-9]+/g, '');
      this.$nextTick(() => {
        this.formItem.personalAnnualIncome = personalAnnualIncome;
      });
    },
    switchShowMap() {
      this.isShowMap = !this.isShowMap;
    },
    valiFrom() {
      let errText = '';
      if (!this.province) {
        errText = '请选择省份';
      } else if (!this.city) {
        errText = '请选择城市';
      } else if (!this.formItem.addressDetail) {
        errText = '请定位详细地址';
      } else if (!this.formItem.edu) {
        errText = '请选择学历';
      } else if (!this.formItem.degree) {
        errText = '请选择学位';
      } else if (!this.formItem.familyAnnualIncome) {
        errText = '请填写家庭年收入';
      } else if (!this.formItem.personalAnnualIncome) {
        errText = '请填写个人年收入';
      } else if (!this.formItem.maritalStatus) {
        errText = '请选择婚姻状况';
      } else {
        this.errText = '';
      }
      return errText;
    },
    getPprovinceCode(province) {
      this.province = province.code;
    },
    getCityCode(city) {
      this.city = city.code;
    }
  }
};
</script>
<style lang="scss" scoped>
.page-container {
  padding-top: 25px;
  min-height: 100vh;
  background: #f2f4f8;
}
.from-container {
  background: #ffffff;
}
.sub-btn {
  width: 80%;
  margin-left: 10%;
  margin-top: 30px;
}
.address-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  position: relative;
  padding: 0.75rem 0.9375rem 0.75rem 1.25rem;
  border-bottom: 1px solid #f2f4f8;
}
.address-span {
  margin-right: 33px;
  line-height: 30px;
  font-size: 26px;
  color: #333333;
}
.ness {
  color: #db0000;
}
.selectAddress {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1 1 6.5rem;
}
.selectAddress label:nth-child(0) {
  background: chartreuse;
}
.item-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 3.125rem;
  padding: 0 0.9375rem 0 1.25rem;
  border-bottom: 1px solid #f2f4f8;
  .item-title {
    font-weight: 600;
    font-size: 28px;
    color: #333333;
  }
  .item-value {
    font-weight: 500;
    font-size: 24px;
  }
}
.address-detail {
  height: 1.75rem;
  border: none;
  outline: none;
  flex-grow: 2;
  width: 100%;
  direction: rtl;
}
.detail-address-input-wrapper {
  display: flex;
  align-items: center;
  flex-grow: 1;
  .map-btn-wrapper {
    display: flex;
    align-items: center;
    .ic-map-btn {
      height: 0.9375rem;
      width: 0.75rem;
      margin: 0 5px;
    }
    .map-btn-desc {
      width: 1.75rem;
      white-space: nowrap;
      margin: 0 8px;
    }
  }
}
.map-wrapper {
  position: absolute;
  width: 100%;
  top: 8.4375rem;
}
::v-deep(.selectAddress select) {
  -webkit-appearance: none;
  height: 30px;
  width: 110px;
  min-width: 4.375rem;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  background-color: #f1f1f1;
  direction: rtl;
  border: none;
  outline: none;
  background: #ffffff;
  color: #7f7f7f;
}
::v-deep(.selectAddress) option {
  height: 30px;
  margin-left: 18px;
  border: 1px solid #dcdee2;
  border-radius: 4px;
}
.address-err-desc {
  margin: 0.625rem 0 0 1.1875rem;
  color: #ed4014;
  height: 0.75rem;
}
</style>
