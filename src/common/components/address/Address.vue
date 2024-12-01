<template>
  <div class="address-wrapper">
    <div class="address-select-item-wrapper first-margin">
      <div class="select-wrapper">
        <select v-model="province" class="address-selecter" :class="province === '-1' ? 'default-option' : '' ">
          <option class="address-option" disabled selected value="-1">请选择</option>
          <option
            class="address-option"
            v-for="province in provinceList"
            :value="province.areaCode"
            :key="province.areaCode"
          >{{province.areaDesc}}</option>
        </select>
      </div>
      <img :src="icSel" class="select-icon" alt />
      <p class="select-desc">省</p>
    </div>

    <div class="address-select-item-wrapper">
      <div class="select-wrapper">
        <select
          v-model="city"
          :disabled="cityDisabled"
          class="address-selecter"
          :class="city === '-1' ? 'default-option' : '' "
        >
          <option disabled selected value="-1">请选择</option>
          <option v-for="city in cityList" :value="city.areaCode" :key="city.areaCode">{{city.areaDesc}}</option>
        </select>
      </div>
      <img :src="icSel" class="select-icon" alt />
      <p class="select-desc">市</p>
    </div>
  </div>
</template>

<script>
import { PROVINCE_AREA_CODE } from './config';
import { queryChildArea } from '@/request/interface/common';
export default {
  data() {
    return {
      province: '-1',
      city: '-1',
      cityDisabled: false,
      provinceList: PROVINCE_AREA_CODE,
      cityList: [],
      icSel: require('@/assets/imgs/icon/ic_check_box.png'),
      msg: ''
    };
  },
  watch: {
    province(newVal, oldVal) {
      this.queryCityList();
      let newProvince = newVal === '-1' ? '' : newVal;
      this.$emit('province', newProvince);
    },
    city(newVal, oldVal) {
      let newCity = newVal === '-1' ? '' : newVal;
      this.$emit('city', newCity);
    }
  },
  methods: {
    queryCityList() {
      let defaultProvince = '-1';
      let pcode = this.province;
      if (this.province === defaultProvince) {
        return false;
      }
      this.cityDisabled = true;
      queryChildArea({ pcode })
        .then((res) => {
          this.cityList = res?.data?.data;
          this.$nextTick(() => {
            this.city = '-1';
          });
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          this.cityDisabled = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.address-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  .address-select-item-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    .select-desc {
      font-weight: 500;
      font-size: 24px;
      color: #333333;
    }
    .select-icon {
      height: 100%;
      width: 16px;
      margin: 0 0.9375rem 0 0.625rem;
    }
  }
  .address-selecter {
    font-size: 24px;
    font-weight: 400;
    -webkit-appearance: none;
    max-width: 50px;
    background: #ffffff;
    border: none;
    outline: none;
  }
  .address-option {
    text-align: center;
  }
  .default-option {
    color: #999999;
  }
  .first-margin {
    margin-right: 20px;
  }
}
</style>
