<template>
  <div class="page-container">
    <div class="from-container">
      <div class="item-wrapper">
        <van-cell title="姓名" :value="pageInfo.emergencyContact" />
      </div>
      <div class="one-professional">
        <van-cell
          is-link
          arrow-direction="down"
          title="一级职业"
          :value="professionalValue.oneValue"
          @click="clickShow('one')"
        />
        <van-action-sheet
          v-model="oneProfessionalShow"
          :actions="oneProfessionalActions"
          @select="onOneSelect"
          description="一级职业"
          cancel-text="取消"
          close-on-click-action
        />
      </div>
      <div class="two-professional">
        <van-cell
          is-link
          arrow-direction="down"
          title="二级职业"
          :value="professionalValue.twoValue"
          @click="clickShow('two')"
        />
        <van-action-sheet
          v-model="twoProfessionalShow"
          :actions="twoProfessionalActions"
          description="二级职业"
          @select="onTwoSelect"
          cancel-text="取消"
          close-on-click-action
        />
      </div>

      <div class="address-wrapper">
        <van-cell is-link arrow-direction="down" title="居住地址" :value="addressInfo.value" @click="clickShow('area')" />
        <van-action-sheet v-model="addressShow" v-if="addressShow">
          <!-- :columns-num="3" -->
          <van-area
            title="地区"
            :area-list="areaList"
            :value="addressInfo.code"
            :columns-placeholder="['请选择', '请选择', '请选择']"
            @confirm="addressConfirm"
            @cancel="addressCancel"
          />
        </van-action-sheet>
      </div>
      <div class="address-wrapper">
        <van-field class="address-detail" v-model="pageInfo.addressDetail" placeholder="请输入详细地址" type="text">
          <van-icon name="location" slot="right-icon" @click.stop="openMap" />
        </van-field>
      </div>
    </div>
    <div class="tootip">
      <div class="circle"></div>
      <div class="tootip-desc">尊敬的客户：居住地址请详细填写，尽量精确到单元门牌号，若地址不详可能会影响您的授信申请，请知悉！</div>
    </div>
    <!-- 地址的搜索 -->
    <van-dialog
      v-model="mapShow"
      show-cancel-button
      confirmButtonColor="#2d8cf0"
      @confirm="mapConfirm"
      @cancel="mapCancel"
    >
      <iframe
        v-if="mapShow"
        id="mapPage"
        width="100%"
        height="350px"
        frameborder="0"
        src="https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=DVUBZ-G47KU-WMVVG-45YKH-YDZOE-UHFDF&referer=testMyAddress"
      ></iframe>
      <div class="address-err-desc">{{addressErr}}</div>
    </van-dialog>

    <!-- 操作 -->
    <van-button class="btn-foot-fixed foot-operate-btn" type="primary" @click="handleSubmit">下一步</van-button>
  </div>
</template>
<script>
import { saveApplyPersonBaseInfo } from '@/request/interface/impower/UserInfo';
import { jdugeNewUserRoute } from '@/controller/userController';
import { gfOccupationDict, gfAreaDictQuery } from '@/request/interface/gf/common.js';
export default {
  /**
   * 基本信息的录入
   * */
  name: 'XweBaseInfo',

  data() {
    return {
      // 页面信息的收集
      pageInfo: {
        addressDetail: '',
        emergencyContact: '',
        userId: ''
      },

      addressErr: '',
      referrer: '',
      productId: '',

      // 职业
      professionalValue: {
        oneValue: '',
        twoValue: '',
        oneObj: {},
        twoObj: {}
      },
      // 一级职业
      oneProfessionalShow: false,
      oneProfessionalActions: [],
      // 二级职业
      twoProfessionalShow: false,
      twoProfessionalActions: [],
      // 保存二级职业
      saveTwoProfessionalActions: [],

      // 地区
      areaList: {},
      // 区code前4位集合
      countyKeysFourList: [],
      // 默认是区不可以跳过
      isSkipArea: false,
      addressInfo: {
        value: '',
        obj: [],
        code: ''
      },
      addressShow: false,
      mapShow: false
    };
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      let userId = this.getCookie('wecaheat_xm_userid');
      this.pageInfo.userId = userId;
      let creditInfo = JSON.parse(sessionStorage.getItem('single_credit_info'));
      this.referrer = creditInfo.referrer || localStorage.referrer;
      this.productId = creditInfo.productId || '1035';
      Promise.all([
        jdugeNewUserRoute().then((user) => {
          user && (this.pageInfo.emergencyContact = user.name);
        }),
        this.watchLocaltion(),
        this.getGfOccupationDict(),
        this.getgfAreaDictQuery()
      ]);
    },

    // 获取职业信息
    getGfOccupationDict() {
      gfOccupationDict()
        .then((res) => {
          if (res?.data?.data) {
            if (res?.data?.data?.olist1 && res.data.data.olist1.length && Array.isArray(res.data.data.olist1)) {
              res.data.data.olist1.forEach((item) => {
                this.oneProfessionalActions.push({ name: item, value: undefined });
              });
            } else if (
              res?.data?.data?.olist1 &&
              Object.prototype.toString.call(res.data.data.olist1) === '[object Object]'
            ) {
              let keys = Object.keys(res.data.data.olist1);
              keys.forEach((item) => {
                if (item === '10000') {
                  this.oneProfessionalActions.push({ name: res.data.data.olist1[item], value: item });
                }
                if (item === '80000') {
                  this.oneProfessionalActions.push({ name: res.data.data.olist1[item], value: item });
                }
              });
            }

            if (res?.data?.data?.olist2 && res.data.data.olist2.length && Array.isArray(res.data.data.olist2)) {
              res.data.data.olist2.forEach((item) => {
                this.saveTwoProfessionalActions.push({ name: item, value: undefined });
              });
            } else if (
              res?.data?.data?.olist2 &&
              Object.prototype.toString.call(res.data.data.olist2) === '[object Object]'
            ) {
              let keys = Object.keys(res.data.data.olist2);
              keys.forEach((item) => {
                if (item === '10500') {
                  this.saveTwoProfessionalActions.push({ name: res.data.data.olist2[item], value: item });
                }
                if (item === '80400') {
                  this.saveTwoProfessionalActions.push({ name: res.data.data.olist2[item], value: item });
                }
                if (item === '80600') {
                  this.saveTwoProfessionalActions.push({ name: res.data.data.olist2[item], value: item });
                }
              });
            }
          } else {
            this.$toasting.error({ msg: '获取职业信息失败' });
          }
        })
        .catch(() => {
          this.$toasting.error({ msg: '获取职业信息失败' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // 获取省市区的接口
    getgfAreaDictQuery() {
      gfAreaDictQuery()
        .then((res) => {
          if (res?.data?.data) {
            this.areaList.province_list = res.data.data.provinceList ? res.data.data.provinceList : {};
            this.areaList.city_list = res.data.data.cityList ? res.data.data.cityList : {};
            this.areaList.county_list = res.data.data.countyList ? res.data.data.countyList : {};

            // 取地区的code的前四位
            let countyKeysList = Object.keys(this.areaList.county_list);
            let countyKeysFourList = [];
            if (countyKeysList.length) {
              countyKeysFourList = countyKeysList.map((key) => {
                return key ? key.slice(0, 4) : '';
              });
              this.countyKeysFourList = countyKeysFourList;
            }
          } else {
            this.$toasting.error({ msg: '获取区域信息失败' });
          }
        })
        .catch(() => {
          this.$toasting.error({ msg: '获取区域信息失败' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // map信息选择的监听
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
            // console.log("location", loc);
            that.pageInfo.addressDetail = `${loc.poiaddress}`;
          }
        },
        false
      );
    },

    // 职业选择 一
    onOneSelect(item) {
      // console.log("xaun", item);
      if (item) {
        this.professionalValue.oneObj = item;
        this.professionalValue.oneValue = item.name;

        // 重新设置 二级职业
        this.twoProfessionalActions = [];
        this.professionalValue.twoValue = '';
        this.professionalValue.twoObj = {};
      }
    },
    // 职业选择二
    onTwoSelect(item) {
      // console.log("xaun", item);
      if (item) {
        this.professionalValue.twoObj = item;
        this.professionalValue.twoValue = item.name;
      }
    },

    // 地区选择提交
    addressConfirm(item) {
      // console.log("addressConfirm", item);
      if (Array.isArray(item) && item.length) {
        let res = [];
        item.forEach((ele, index) => {
          if (ele && ele.name) {
            res.push(ele.name);
          }
        });
        this.addressInfo.value = res.join('-');
        this.addressInfo.obj = item;
        // 区别用户会选择省、市、区
        if (item[2] && item[2].code) {
          this.addressInfo.code = item[2].code;
        } else if (item[1] && item[1].code) {
          // 查找三级区域 (是否跳过三级区域的验证)
          let secondAreaPreFour = item[1].code.slice(0, 4);
          if (!this.countyKeysFourList.includes(secondAreaPreFour)) {
            this.isSkipArea = true;
          }

          this.addressInfo.code = item[1].code;
        } else if (item[0] && item[0].code) {
          this.addressInfo.code = item[0].code;
        }
        // console.log("dddd", this.addressInfo);
        this.$notify.success({
          msg: '地址选取成功！'
        });
        this.addressShow = false;
      } else {
        this.$notify.error({
          msg: '地址选取失败！'
        });
      }
    },

    // 取消地址选取
    addressCancel() {
      this.addressShow = false;
    },

    // 提交
    handleSubmit() {
      if (!this.professionalValue.oneValue || !this.professionalValue.twoValue) {
        this.$notify.info({
          msg: '请选择职业信息！'
        });
        return;
      }
      if (
        !this.addressInfo.obj[0] ||
        !this.addressInfo.obj[0].code ||
        !this.addressInfo.obj[1] ||
        !this.addressInfo.obj[1].code
      ) {
        this.$notify.info({
          msg: '请将地区选择完整！'
        });
        return;
      }
      // 三级区域的判断  没有三级的市，也可以过
      if (!this.isSkipArea && (!this.addressInfo.obj[2] || !this.addressInfo.obj[2].code)) {
        this.$notify.info({
          msg: '请将地区选择完整！'
        });
        return;
      }

      if (!this.pageInfo.addressDetail) {
        this.$notify.info({
          msg: '请填写详细地址！'
        });
        return;
      }

      let baseInfo = {};
      baseInfo.referrer = this.referrer;
      baseInfo.productId = this.productId ? this.productId : '1035';
      if (this.isSkipArea) {
        baseInfo.areaCode = `${this.addressInfo.obj[0].code},${this.addressInfo.obj[1].code}`;
      } else {
        baseInfo.areaCode = `${this.addressInfo.obj[0].code},${this.addressInfo.obj[1].code},${this.addressInfo.obj[2].code}`;
      }
      baseInfo.resideAddress = this.pageInfo.addressDetail;
      baseInfo.job = `${this.professionalValue.oneObj.value},${this.professionalValue.twoObj.value}`;
      this.$toasting.show({ message: '上传中', forbidClick: true });
      saveApplyPersonBaseInfo(baseInfo)
        .then((res) => {
          if (res?.data?.success) {
            this.$toasting.success({
              msg: '成功'
            });
            // 到补充信息页面
            setTimeout(() => {
              this.$router.replace({ path: '/xwe_replenish_file_upload' });
            }, 1500);
          } else {
            this.$notify.error({
              msg: '信息录入失败！'
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

    // 打开map
    openMap() {
      this.mapShow = true;
    },

    // map提交
    mapConfirm() {},

    mapCancel() {
      this.pageInfo.addressDetail = '';
    },
    clickShow(type) {
      if (type === 'one') {
        if (!this.oneProfessionalActions.length) {
          this.$notify.info({ msg: '暂无一级职业信息！' });
        } else {
          this.oneProfessionalShow = true;
        }
      }
      if (type === 'two') {
        if (this.oneProfessionalActions.length) {
          if (this.professionalValue.oneValue) {
            this.actionsListFilter(this.professionalValue.oneObj.value);
          } else {
            this.$notify.info({ msg: '请选择一级职业信息！' });
          }
        } else {
          this.$notify.info({ msg: '暂无二级职业信息！' });
        }
      }
      if (type === 'area') {
        if (!Object.keys(this.areaList).length) {
          this.$notify.info({ msg: '暂无区域信息！' });
        } else {
          this.addressShow = true;
        }
      }
    },

    actionsListFilter(type) {
      if (type === '80000') {
        this.saveTwoProfessionalActions.forEach((item) => {
          if (item && item.value) {
            if (item.value[0] === '8') {
              this.twoProfessionalActions.push(item);
            }
          }
        });
        if (this.twoProfessionalActions.length) {
          this.twoProfessionalShow = true;
        } else {
          this.$notify.info({ msg: '暂无二级职业信息！' });
        }
      }

      if (type === '10000') {
        this.saveTwoProfessionalActions.forEach((item) => {
          if (item && item.value) {
            if (item.value[0] === '1') {
              this.twoProfessionalActions.push(item);
            }
          }
        });
        if (this.twoProfessionalActions.length) {
          this.twoProfessionalShow = true;
        } else {
          this.$notify.info({ msg: '暂无二级职业信息！' });
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.page-container {
  padding-top: 40px;
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
  margin-bottom: 80px;
}
.address-wrapper {
  border-bottom: 1px solid #d8d8d8;
}
.address-span {
  margin-right: 16px;
  width: 18%;
  font-size: 26px;
  font-weight: 500;
  color: #333333;
}
.selectAddress {
  width: 82%;
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
.item-wrapper {
  border-bottom: 1px solid #d8d8d8;
}
.address-detail {
  border: none;
  outline: none;

  ::v-deep(.van-field__control) {
    font-size: 28px;
    direction: rtl;
    color: #333333;
    font-weight: 500;
  }
}
::v-deep(.selectAddress) select {
  -webkit-appearance: none;
  height: 30px;
  width: 100%;
  min-width: 4.375rem;
  padding-right: 8px;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  background-color: #f1f1f1;
  direction: rtl;
  border: none;
  outline: none;
  background: #ffffff;
  color: #7f7f7f;
  overflow: auto;
}
::v-deep(.selectAddress) option {
  height: 30px;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  margin-left: 15px;
}
.ivu-form-item {
  margin-bottom: 20px;
}
.address-err-desc {
  margin: 0.625rem 0 0 1.1875rem;
  color: #ed4014;
  height: 0.75rem;
}
.one-professional {
  border-bottom: 1px solid #d8d8d8;
}
.two-professional {
  border-bottom: 1px solid #d8d8d8;
}
::v-deep(.van-cell) {
  .van-cell__title {
    span {
      white-space: nowrap;
      font-size: 28px;
      font-weight: 500;
      white-space: nowrap;
      color: #333333;
    }
  }
  .van-cell__right-icon {
    font-size: 36px;
    margin-left: 12px;
    padding-top: 6px;
  }
  .van-cell__value {
    span {
      white-space: nowrap;
      font-size: 28px;
      font-weight: 500;
      white-space: nowrap;
      color: #333333;
    }
  }
}
::v-deep(.van-popup) {
  .van-action-sheet__description {
    font-size: 32px;
    font-weight: 500;
    border-bottom: 1px solid #e9eaec;
  }
  .van-action-sheet__content {
    .van-action-sheet__item {
      width: 90%;
      margin-left: 5%;
      border-bottom: 1px solid #e9eaec;
      span {
        font-size: 28px;
        font-weight: 500;
        color: #333333;
      }
    }
  }
  .van-action-sheet__cancel {
    font-size: 34px;
    font-weight: 500;
  }
}
::v-deep(.van-area) {
  .van-picker__toolbar {
    padding: 16px 12px;
    .van-picker__cancel {
      font-size: 30px;
    }
    .van-picker__confirm {
      font-size: 30px;
      color: #333333;
    }
    .van-picker__title {
      font-size: 36px;
    }
  }
  .van-picker-column__item--selected {
    background-color: #f2f4f8;
    color: #333333;
  }
  .van-picker-column__wrapper {
    .van-picker-column__item {
      .van-ellipsis {
        font-size: 30px;
        color: #333333;
      }
    }
  }
}
::v-deep(.van-icon-location) {
  font-size: 36px;
}
::v-deep(.van-dialog) {
  .van-dialog__content {
    padding: 50px 0;
  }
  .van-dialog__footer {
    .van-button__text {
      font-size: 30px;
    }
  }
}
.tootip {
  display: flex;
  justify-content: center;
  padding: 50px 40px;
  // .circle {
  //   margin: 20px 30px 0 20px;
  //   width: 20px;
  //   height: 16px;
  //   background: #d8d8d8;
  //   border: 1px solid #979797;
  //   border-radius: 50%;
  // }
  .tootip-desc {
    text-indent: 2em;
    font-size: 26px;
    font-weight: 400;
    color: #a7a7a7;
    text-stroke: 1px #979797;
  }
}
</style>
