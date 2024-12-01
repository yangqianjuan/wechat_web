<!--
 * @Author: hsf
 * @Date: 2023-06-19 09:28:09
 * @LastEditors: hsf
 * @LastEditTime: 2023-08-11 14:06:22
 * @Description:
-->
<template>
  <div class="supply-inform beijing-common">
    <step :steps="[0, 1, 2]"></step>
    <!-- address -->
    <div class="residential-address">
      <div class="title">
        <img src="../../../static/image/home.png" alt="" class="home" />
        <div class="text">您的现居住地址</div>
      </div>
      <van-form :label-width="80" ref="formDynamic3">
        <van-field
          v-model="mapLocationDetail.operateAddress"
          label="现居住地址"
          readonly
          :rules="addressRuleValidate.operateAddress"
          name="operateAddress"
          placeholder="请选择您的现居住地址"
          @click-input="open"
        >
          <template #button>
            <div class="location__img" @click="open">
              <img src="../../../static/image/credit/location.png" />
            </div>
          </template>
        </van-field>
      </van-form>
      <!--      <div class="map-outside">-->
      <!--        <div class="map-container">-->
      <!--          <div class="map-box">-->
      <!--            <iframe-->
      <!--              id="mapPage"-->
      <!--              width="100%"-->
      <!--              height="350px"-->
      <!--              frameborder="0"-->
      <!--              src="https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=DVUBZ-G47KU-WMVVG-45YKH-YDZOE-UHFDF&referer=testMyAddress"-->
      <!--            ></iframe>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--        <div class="mask" @click="open"></div>-->
      <!--      </div>-->
    </div>

    <!-- 紧急联系人 -->
    <div class="emergency-contact">
      <div class="title-des">
        <img src="../../../static/image/people.png" alt="" class="home" />
        <div class="text">紧急联系人</div>
      </div>
      <div class="form-emergency">
        <van-form :label-width="80" ref="formDynamic1">
          <van-field
            v-model="specialInfo.name"
            name="name"
            label="姓名"
            placeholder="请输入联系人姓名"
            :rules="specialRuleValidate.name"
          />
          <van-field
            v-model="specialInfo.phone"
            name="phone"
            label="手机号"
            placeholder="请输入联系人手机号"
            :rules="specialRuleValidate.phone"
          />
          <van-field
            v-model="specialInfo.showArea"
            is-link
            readonly
            name="showArea"
            label="所在地区"
            placeholder="请选择省、市、区"
            @click="showArea = true"
            :rules="specialRuleValidate.showArea"
          />

          <van-field
            v-model="specialInfo.addressDetail"
            name="addressDetail"
            label="详细地址"
            placeholder="请输入详细地址"
            :rules="specialRuleValidate.addressDetail"
          />
          <van-field
            v-model="specialInfo.relationshipName"
            is-link
            readonly
            name="relationshipName"
            label="与本人关系"
            placeholder="请选择与本人关系"
            @click="showSpouse = true"
            :rules="specialRuleValidate.relationshipName"
          />
        </van-form>
      </div>
    </div>

    <!-- 普通联系人 -->
    <div class="emergency-contact">
      <div class="title-des">
        <img src="../../../static/image/people.png" alt="" class="home" />
        <div class="text">普通联系人</div>
      </div>
      <div class="form-emergency">
        <van-form :label-width="80" ref="formDynamic2">
          <van-field
            v-model="commonInfo.name"
            name="name"
            label="姓名"
            placeholder="请输入联系人姓名"
            :rules="commonRuleValidate.name"
          />
          <van-field
            v-model="commonInfo.phone"
            name="phone"
            label="手机号"
            placeholder="请输入联系人手机号"
            :rules="commonRuleValidate.phone"
          />
          <van-field
            v-model="commonInfo.showArea"
            is-link
            readonly
            name="showArea"
            label="所在地区"
            placeholder="请选择省、市、区"
            @click="showAreaGeneral = true"
            :rules="commonRuleValidate.showArea"
          />

          <van-field
            v-model="commonInfo.addressDetail"
            name="addressDetail"
            label="详细地址"
            placeholder="请输入详细地址"
            :rules="commonRuleValidate.addressDetail"
          />
          <van-field
            v-model="commonInfo.relationshipName"
            is-link
            readonly
            name="relationshipName"
            label="与本人关系"
            placeholder="请选择与本人关系"
            @click="showGeneral = true"
            :rules="commonRuleValidate.relationshipName"
          />
        </van-form>
      </div>
    </div>
    <div class="set"></div>
    <div class="submit-box">
      <van-button class="btn" @click="handleSubmit">确认提交</van-button>
    </div>

    <!-- 地址的搜索 -->
    <van-dialog v-model="mapShow" show-cancel-button confirmButtonColor="#2d8cf0" @cancel="mapShow = false">
      <iframe
        v-if="delayShowMap"
        id="mapPage"
        width="100%"
        height="350px"
        frameborder="0"
        src="https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=DVUBZ-G47KU-WMVVG-45YKH-YDZOE-UHFDF&referer=testMyAddress"
      ></iframe>
      <div style="height:350px" v-else></div>
    </van-dialog>

    <!-- 普通联系人弹窗 -->
    <van-popup
      :style="{ height: '56%' }"
      closeable
      v-model="showAreaGeneral"
      round
      position="bottom"
      class="my-area-list"
    >
      <div class="title">地区选择</div>
      <van-area
        :area-list="areaList"
        :value="commonInfo.area"
        :columns-placeholder="['请选择', '请选择', '请选择']"
        @change="normalArea"
      />
      <div class="area-btn">
        <van-button class="area-submit" @click="selectNormalArea">确认</van-button>
      </div>
    </van-popup>

    <!-- 普通关系 -->
    <van-popup closeable v-model="showGeneral" round position="bottom" :style="{ height: '42%' }" class="my-spouse">
      <div class="title">与本人关系</div>
      <div class="list">
        <div
          @click="commonSelectionRelation(item, index)"
          v-for="(item, index) in spouseList"
          :key="index"
          class="list-item"
          :class="index == selectGeneral && 'selected'"
        >
          {{ item.desc }}
        </div>
      </div>
      <div class="btn">
        <van-button
          class="submit"
          @click="
            () => {
              normalRelation(selectGeneral);
            }
          "
          >确认
        </van-button>
      </div>
    </van-popup>

    <!-- 紧急联系人弹窗 -->
    <van-popup closeable v-model="showSpouse" round position="bottom" :style="{ height: '42%' }" class="my-spouse">
      <div class="title">与本人关系</div>
      <div class="list">
        <div
          @click="specialSelectionRelation(item, index)"
          v-for="(item, index) in spouseList"
          :key="index"
          class="list-item"
          :class="index == selectSpouse && 'selected'"
        >
          {{ item.desc }}
        </div>
      </div>
      <div class="btn">
        <van-button
          class="submit"
          @click="
            () => {
              emergeRelation(selectSpouse);
            }
          "
          >确认
        </van-button>
      </div>
    </van-popup>
    <van-popup :style="{ height: '56%' }" closeable v-model="showArea" round position="bottom" class="my-area-list">
      <div class="title">地区选择</div>
      <van-area
        :area-list="areaList"
        :value="specialInfo.showArea"
        :columns-placeholder="['请选择', '请选择', '请选择']"
        @change="emergentArea"
      />
      <div class="area-btn">
        <van-button class="area-submit" @click="selectEmergentArea">确认</van-button>
      </div>
    </van-popup>
  </div>
</template>
<script>
import Step from '../../../component/steps/Steps.vue';
import { getCurrentLocation, insertOrModifyUserInfo } from '@/request/interface/common/index';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { beijingDialog, pageKeyInfoSearch, validatePhoneNo } from '../../../utils/common';
import { saveApplyPersonBaseInfo } from '@/request/interface/impower/UserInfo';
import { areaList } from '@vant/area-data';

export default {
  name: 'BjbInformationCollection',
  data() {
    return {
      //地图延迟显示避免闪烁
      delayShowMap: false,
      disabled: true, //按钮是否生效
      areaList,
      //是否可提交
      notSubmit: true,
      mapShow: false,
      //紧急联系人选择
      selectSpouse: 0,
      showSpouse: false,
      showArea: false,
      //普通联系人选择
      selectGeneral: 0,
      showGeneral: false,
      showAreaGeneral: false,
      spouseList: [
        { desc: '朋友', code: '01' },
        { desc: '同事', code: '02' },
        { desc: '父母', code: '03' },
        { desc: '子女', code: '04' },
        { desc: '配偶', code: '05' },
        { desc: '兄弟', code: '06' },
        { desc: '姐妹', code: '07' },
        { desc: '同学', code: '08' },
        { desc: '股东', code: '09' }
      ],

      // 紧急联系人信息
      specialInfo: {
        name: '',
        addressDetail: '',
        phone: '',
        relationship: '',
        relationshipName: '',
        province: '',
        city: '',
        area: '',
        showArea: ''
      },
      specialRuleValidate: {
        name: [{ required: true, message: '请填写姓名', trigger: 'onBlur' }],
        phone: [
          { required: true, message: '请填写手机号', trigger: 'onBlur' },
          { required: true, validator: validatePhoneNo, message: '请填写正确的手机号', trigger: 'onBlur' }
        ],
        showArea: [{ required: true, message: '请填写地址', trigger: 'onBlur' }],
        addressDetail: [{ required: true, message: '请填写详细地址', trigger: 'onBlur' }],
        relationshipName: [{ required: true, message: '请选择关系', trigger: 'onBlur' }]
      },

      // 普通联系人
      commonInfo: {
        name: '',
        phone: '',
        addressDetail: '',
        relationship: '',
        province: '',
        city: '',
        area: '',
        relationshipName: '',
        showArea: ''
      },
      commonRuleValidate: {
        name: [{ required: true, message: '请填写姓名', trigger: 'onBlur' }],
        phone: [
          { required: true, message: '请填写手机号', trigger: 'onBlur' },
          { required: true, validator: validatePhoneNo, message: '请填写正确的手机号', trigger: 'onBlur' }
        ],
        showArea: [{ required: true, message: '请填写地址', trigger: 'onBlur' }],
        addressDetail: [{ required: true, message: '请填写详细地址', trigger: 'onBlur' }],
        relationshipName: [{ required: true, message: '请选择关系', trigger: 'onBlur' }]
      },
      addressRuleValidate: {
        operateAddress: [{ required: true, message: '请选择地址', trigger: 'onBlur' }]
      },
      referrer: '',
      productId: '',
      applyUnionKey: '',
      mapLocationDetail: {
        operateAddress: '',
        operateAreaCode: '',
        longtitudeAndLatitude: '',
        latlng: {
          lat: '',
          lng: ''
        }
      }
    };
  },
  components: {
    Step
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      try {
        const { referrer, productId, applyUnionKey } = await pageKeyInfoSearch.call(this);

        if (referrer) {
          this.referrer = referrer;
          this.productId = productId;
          this.applyUnionKey = applyUnionKey;
          this.getProtocolList(this.productId);
          return;
        }

        this.$toasting.info({ msg: '未找到用户的相关信息，请退出页面，重新进入' });
      } catch (error) {
        console.log(error);
      }
    },

    //选择关系
    emergeRelation(index) {
      this.showSpouse = false;
      this.specialInfo.relationship = this.spouseList[index].code;
      this.specialInfo.relationshipName = this.spouseList[index].desc;
    },
    normalRelation(index) {
      this.showGeneral = false;
      this.commonInfo.relationship = this.spouseList[index].code;
      this.commonInfo.relationshipName = this.spouseList[index].desc;
    },

    //获取地图选择位置
    watchLocation() {
      let that = this;
      window.addEventListener(
        'message',
        function(event) {
          let loc = event.data;
          if (loc?.module == 'locationPicker') {
            that.mapLocationDetail.operateAddress = loc.poiaddress;
            that.mapLocationDetail.longtitudeAndLatitude = `${loc.latlng?.lng},${loc.latlng?.lat}`;
            that.mapLocationDetail.latlng = loc.latlng;
          }
        },
        false
      );
    },

    //确认选择紧急联系人地区
    selectEmergentArea() {
      if (this.emergeAreaSelect?.length) {
        let province = this.emergeAreaSelect[0]?.code;
        let city = this.emergeAreaSelect[1]?.code;
        let area = this.emergeAreaSelect[2]?.code;

        if (!province || !city || !area) {
          this.$toasting.info({ msg: '请将地址选择完整', className: 'read-protocol' });
          return;
        }

        this.specialInfo.showArea = this.emergeAreaSelect.map(item => item.name).join('/');
        this.specialInfo.province = province;
        this.specialInfo.city = city;
        this.specialInfo.area = area;
        this.showArea = false;
        return;
      }
    },

    //确认选择普通联系人地区
    selectNormalArea() {
      if (this.normalAreaSelect?.length) {
        let province = this.normalAreaSelect[0]?.code;
        let city = this.normalAreaSelect[1]?.code;
        let area = this.normalAreaSelect[2]?.code;

        if (!province || !city || !area) {
          this.$toasting.info({ msg: '请将地址选择完整', className: 'read-protocol' });
          return;
        }

        this.commonInfo.showArea = this.normalAreaSelect.map(item => item.name).join('/');
        this.commonInfo.province = province;
        this.commonInfo.city = city;
        this.commonInfo.area = area;
        this.showAreaGeneral = false;
        return;
      }
    },

    //紧急联系人选择地址
    emergentArea(selectedValues, selectedOptions) {
      this.emergeAreaSelect = selectedOptions;
    },

    //普通联系人选择地址
    normalArea(selectedValues, selectedOptions) {
      this.normalAreaSelect = selectedOptions;
    },

    open() {
      this.mapShow = true;
      this.watchLocation();
      //延迟显示防止闪烁
      let timer = setTimeout(() => {
        this.delayShowMap = true;
        clearTimeout(timer);
      }, 500);
    },

    handleSubmit() {
      if (!this.mapLocationDetail.longtitudeAndLatitude || !this.mapLocationDetail.operateAddress) {
        beijingDialog({
          message: '请选择您的现居住地址',
          confirmButtonText: '确定'
        });
        return;
      }

      this.$refs.formDynamic3.validate(['operateAddress']).then(valid3 => {
        if (!valid3) {
          this.$refs.formDynamic1
            .validate(['name', 'phone', 'showArea', 'addressDetail', 'relationshipName'])
            .then(valid1 => {
              if (!valid1) {
                this.$refs.formDynamic2
                  .validate(['name', 'phone', 'showArea', 'addressDetail', 'relationshipName'])
                  .then(async valid2 => {
                    if (!valid2) {
                      try {
                        //  check address code
                        // special
                        if (!this.specialInfo.province || !this.specialInfo.city || !this.specialInfo.area) {
                          this.$toasting.info({ msg: '请将紧急联系人地址选择完整', className: 'read-protocol' });
                          return;
                        }

                        // common
                        if (!this.commonInfo.province || !this.commonInfo.city || !this.commonInfo.area) {
                          this.$toasting.info({ msg: '请将普通联系人地址选择完整', className: 'read-protocol' });
                          return;
                        }

                        this.$toasting.show({ message: '上传中', forbidClick: true });

                        // 解析经纬度 -- get 省市区编码
                        const locationMap = await getCurrentLocation({
                          location: `${this.mapLocationDetail.latlng?.lat},${this.mapLocationDetail.latlng?.lng}`,
                          key: 'DVUBZ-G47KU-WMVVG-45YKH-YDZOE-UHFDF'
                        });

                        let operateAreaCode = '';

                        if (locationMap?.data?.success && locationMap.data.data) {
                          let areaCode = locationMap.data.data?.result?.ad_info?.adcode;

                          if (areaCode) {
                            const provinceCode = areaCode.slice(0, 2) + '0000';
                            const cityCode = areaCode.slice(0, 4) + '00';
                            const district = areaCode;
                            operateAreaCode = `${provinceCode},${cityCode},${district}`;
                          }
                        }

                        let baseInfo = {};
                        baseInfo.referrer = this.referrer;
                        baseInfo.productId = this.productId;
                        baseInfo.areaCode = operateAreaCode;
                        baseInfo.resideAddress = this.mapLocationDetail.operateAddress;
                        baseInfo.longtitudeAndLatitude = this.mapLocationDetail.longtitudeAndLatitude;
                        await saveApplyPersonBaseInfo(baseInfo);

                        const option1 = {
                          address: this.specialInfo.addressDetail,
                          applyUnionKey: this.applyUnionKey,
                          area: this.specialInfo.area,
                          city: this.specialInfo.city,
                          mobile: this.specialInfo.phone,
                          name: this.specialInfo.name,
                          province: this.specialInfo.province,
                          relation: this.specialInfo.relationship,
                          type: '01'
                        };

                        const option2 = {
                          address: this.commonInfo.addressDetail,
                          applyUnionKey: this.applyUnionKey,
                          area: this.commonInfo.area,
                          city: this.commonInfo.city,
                          mobile: this.commonInfo.phone,
                          name: this.commonInfo.name,
                          province: this.commonInfo.province,
                          relation: this.commonInfo.relationship,
                          type: '02'
                        };

                        let modifyUserInfoRes = await insertOrModifyUserInfo([option1, option2]);

                        if (modifyUserInfoRes?.data?.success) {
                          let nextPath = await queryNextByUnionKeyAndProdId('1155');
                          setTimeout(() => {
                            this.$router.replace({
                              path: nextPath,
                              query: {
                                referrer: this.referrer,
                                productId: this.productId
                              }
                            });
                          }, 800);

                          return;
                        }
                      } catch (error) {
                        beijingDialog({
                          message: error?.data?.msg || '联系人信息更新失败！',
                          confirmButtonText: '确定'
                        });
                      } finally {
                        this.$toasting.hide();
                      }
                    }
                  })
                  .catch(error => {
                    this.$refs.formDynamic2.scrollToField('relationshipName', false);
                  });
              }
            })
            .catch(error => {
              this.$refs.formDynamic1.scrollToField('relationshipName', false);
            });
        }
      });
    },

    // 地址的切换
    getOneProvinceCode(province) {
      this.specialInfo.province = province.code;
    },
    getOneCityCode(city) {
      this.specialInfo.city = city.code;
    },
    getOneAreaCode(area) {
      this.specialInfo.area = area.code;
    },
    getTwoProvinceCode(province) {
      this.commonInfo.province = province.code;
    },
    getTwoCityCode(city) {
      this.commonInfo.city = city.code;
    },
    getTwoAreaCode(area) {
      this.commonInfo.area = area.code;
    },

    specialSelectionRelation(item, index) {
      this.selectSpouse = index;
      this.specialInfo.relationship = item.code;
    },
    commonSelectionRelation(item, index) {
      this.selectGeneral = index;
      this.commonInfo.relationship = item.code;
    },

    commonAddressConfirm(item) {
      console.log('地区', item);
    },
    specialAddressConfirm(item) {
      console.log('地区', item);
    }
  }
};
</script>
<style lang="scss" scoped>
.supply-inform {
  width: 100%;
  min-height: 100vh;
  background: #f8f8f8;
  position: relative;

  .residential-address {
    padding: 40px 28px;
    padding-bottom: 0;
    width: 686px;
    background: #ffffff;
    box-shadow: 0px 0px 32px -8px rgba(78, 6, 6, 0.2);
    border-radius: 16px;
    margin: 0 auto;
    margin-top: -180px;

    .location__img {
      display: flex;
      align-items: center;

      img {
        width: 32px;
        height: 32px;
      }
    }

    .map-outside {
      position: relative;
      margin-top: 24px;
    }

    .mask {
      width: 100%;
      height: 390px;
      position: absolute;
      top: 0;
      background-color: transparent;
      z-index: 10;
    }

    .map-container {
      z-index: 1;
      width: 100%;
      height: 320px;
      overflow: hidden;
      border-radius: 20px;

      .map-box {
        margin-top: -90px;
        height: 410px;
        transform: scale(1.3);
      }
    }

    /deep/ .van-field__control {
      font-size: 28px !important;
      font-family: PingFangSC-Medium, PingFang SC !important;
      font-weight: 500 !important;
      color: #2b0e0c !important;
      -webkit-text-fill-color: unset;
      text-fill-color: unset;
    }

    /deep/ .van-cell {
      padding-left: 4px;
      padding-right: 0;
    }

    .title {
      display: flex;
      align-items: center;

      .home {
        width: 40px;
        margin-right: 8px;
      }

      .text {
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #2b0e0c;
      }
    }
  }

  .title-des {
    display: flex;
    align-items: center;
    padding: 0 28px 32px;
    border-bottom: 1px solid #f8f8f8;

    .home {
      width: 40px;
      margin-right: 8px;
    }

    .text {
      font-size: 28px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #2b0e0c;
    }
  }

  .emergency-contact {
    padding: 40px 0;
    width: 686px;
    background: #ffffff;
    border-radius: 16px;
    margin: 0 auto;
    margin-top: 32px;
  }

  .set {
    margin-top: 40px;
    width: 100%;
    height: 152px;
  }

  .submit-box {
    width: 100%;
    height: 152px;
    position: fixed;
    bottom: 0;
    background: #ffffff;
    box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.11);
    display: flex;
    align-items: center;
    justify-content: center;

    .btn {
      width: 686px;
      height: 88px;
      background: linear-gradient(129deg, #b80701 0%, #9a0400 100%), linear-gradient(129deg, #cd1101 0%, #a70500 100%);
      border-radius: 45px;
      text-align: center;
      line-height: 88px;

      /deep/ .van-button__text {
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #ffffff;
      }
    }

    .disable {
      opacity: 0.5;
    }
  }
}

.my-spouse {
  .title {
    height: 125px;
    text-align: center;
    line-height: 125px;
    font-size: 30px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #2b0e0c;
    border-bottom: 1px solid #f8f9fa;
  }

  .list {
    padding: 32px 40px;
    display: flex;
    flex-wrap: wrap;

    .list-item {
      width: 207px;
      height: 72px;
      background: #ffffff;
      border-radius: 8px;
      font-size: 28px;
      text-align: center;
      line-height: 72px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #333333;
      background: #f7f8f9;
      margin-right: 15px;
      margin-bottom: 24px;

      &:nth-child(3n) {
        margin-right: 0;
      }
    }

    .selected {
      width: 207px;
      height: 72px;
      background: #ffffff;
      border: 2px solid #df0301;
      font-weight: 500;
      color: #df0301;
      line-height: 64px;
      box-sizing: border-box;
    }
  }

  .btn {
    width: 100%;
    height: 128px;
    background: #ffffff;
    box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.11);
    display: flex;
    justify-content: center;
    align-items: center;

    .submit {
      width: 686px;
      height: 88px;
      background: linear-gradient(129deg, #b80701 0%, #9a0400 100%), linear-gradient(129deg, #cd1101 0%, #a70500 100%);
      border-radius: 45px;
      text-align: center;
      line-height: 88px;

      /deep/ .van-button__text {
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #ffffff;
      }
    }
  }
}

.my-area-list {
  .title {
    height: 125px;
    font-size: 32px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #2b0e0c;
    text-align: center;
    line-height: 125px;
    border-bottom: 1px solid #f8f9fa;
  }

  /deep/ .van-picker__toolbar {
    display: none;
  }

  .area-btn {
    position: absolute;
    bottom: 6px;
    z-index: 100;
    margin-top: 32px;
    width: 100%;
    height: 128px;
    background: #fff;
    box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.11);
    display: flex;
    align-items: center;
    justify-content: center;

    .area-submit {
      width: 686px;
      height: 88px;
      background: linear-gradient(129deg, #b80701 0%, #9a0400 100%), linear-gradient(129deg, #cd1101 0%, #a70500 100%);
      border-radius: 45px;
      font-size: 28px;
      font-family: PingFangSC-Medium, PingFang SC;

      /deep/ .van-button__text {
        font-size: 28px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #ffffff;
      }
    }
  }
}
</style>
