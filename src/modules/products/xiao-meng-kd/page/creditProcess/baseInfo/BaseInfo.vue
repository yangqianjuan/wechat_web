<template>
  <div class="page-container">
    <div class="from-container">
      <div class="item-wrapper">
        <div class="item-title">姓名</div>
        <div class="item-value">{{formItem.emergencyContact}}</div>
      </div>
      <div class="address-wrapper">
        <div class="address-span">居住地址</div>
        <v-distpicker wrapper="selectAddress" @province="getPprovinceCode" @city="getCityCode" @area="getAreaCode"></v-distpicker>
      </div>
      <div class="address-wrapper">
        <input class="address-detail" placeholder="请输入详细地址" type="text" v-model="formItem.addressDetail" />
      </div>
    </div>
    <iframe
      id="mapPage"
      width="100%"
      height="350px"
      frameborder="0"
      src="https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=DVUBZ-G47KU-WMVVG-45YKH-YDZOE-UHFDF&referer=testMyAddress"
    ></iframe>
    <div class="address-err-desc">{{addressErr}}</div>
    <Button class="sub-btn" type="primary" :loading="isLoading" @click="handleSubmit">提交</Button>
  </div>
</template>
<script>
import VDistpicker from 'v-distpicker';
import { saveApplyPersonBaseInfo } from '@/request/interface/impower/UserInfo';
import { jdugeNewUserRoute } from '@/controller/userController';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
export default {
  data() {
    const validatePhoneNum = (rule, value, callback) => {
      const reg = new RegExp(/^1\d{10}$/);
      if (reg.test(value)) {
        callback();
      } else {
        callback(new Error('手机号不合法'));
      }
    };
    const validateIncoming = (rule, value, callback) => {
      value = parseInt(value);
      const regPos = new RegExp(/^\d+$/);
      const regNeg = new RegExp(/^\-[1-9][0-9]*$/);
      if ((regPos.test(value) || regNeg.test(value)) && value > 0 && value < 9999999) {
        callback();
      } else {
        callback(new Error('请填写0到9999999区间'));
      }
    };

    return {
      formItem: {
        job: '',
        incomming: '',
        edu: '',
        maritalStatus: '02',
        addressDetail: '',
        emergencyContact: '',
        emergencyContactPhone: '',
        relation: '',
        phoneNum: '',
        userId: ''
      },
      addressErr: '',
      province: '',
      city: '',
      area: '',
      isLoading: false,
      referrer: '',
      productId: '',
      ruleValidate: {
        edu: [{ required: true, message: '请选择学历', trigger: 'blur' }],
        job: [{ required: true, message: '请选择职业', trigger: 'blur' }],
        incomming: [
          { required: true, message: '请填写月收入', trigger: 'blur' },
          { trigger: 'blur', validator: validateIncoming }
        ],
        maritalStatus: [{ required: true, message: '请填写', trigger: 'blur' }],
        addressDetail: [{ required: true, message: '请填写详细地址', trigger: 'blur' }],
        emergencyContactPhone: [
          { required: true, message: '请填写', trigger: 'blur' },
          { trigger: 'blur', validator: validatePhoneNum }
        ],
        relation: [{ required: true, message: '请填写', trigger: 'blur' }],
        phoneNum: [{ required: true, message: '请填写', trigger: 'blur' }]
      }
    };
  },
  components: {
    'v-distpicker': VDistpicker
    // "show-item": showItem
  },
  created() {
    let userId = this.getCookie('wecaheat_xm_userid');
    this.formItem.userId = userId;
    let corpId = this.$route.query.corpId;
    this.referrer = this.$store.state.referrer ? this.$store.state.referrer : localStorage.referrer;
    this.productId = this.$store.state.productId ? this.$store.state.productId : localStorage.productId;
    jdugeNewUserRoute().then((user) => {
      this.formItem.emergencyContact = user.name;
    });
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
            // console.log("location", loc);
            that.formItem.addressDetail = `${loc.poiaddress}`;
          }
        },
        false
      );
    },
    handleSubmit(name) {
      let that = this;
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
      this.isLoading = true;
      let baseInfo = {};
      baseInfo.referrer = this.referrer;
      baseInfo.productId = this.productId;
      baseInfo.areaCode = `${this.province},${this.city},${this.area}`;
      baseInfo.resideAddress = this.formItem.addressDetail;
      that.$toasting.show({ message: '上传中', forbidClick: true });
      saveApplyPersonBaseInfo(baseInfo)
        .then(async (res) => {
          if (res?.data?.success) {
            let nextPath = await queryNextByUnionKeyAndProdId('1000');
            this.$router.replace({ path: nextPath });
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
          this.isLoading = false;
          this.$toasting.hide();
        });
    },
    getPprovinceCode(province) {
      this.province = province.code;
    },
    getCityCode(city) {
      this.city = city.code;
    },
    getAreaCode(area) {
      this.area = area.code;
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
}
.address-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  position: relative;
  padding: 0.5rem 0.9375rem 0.5rem 1.25rem;
  border-bottom: 1px solid #f2f4f8;
}
.address-span {
  margin-right: 16px;
  width: 18%;
  font-size: 26px;
  font-weight: 600;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.9375rem 0.5rem 1.25rem;
  border-bottom: 1px solid #f2f4f8;
  .item-title {
    font-size: 26px;
    font-weight: 600;
    color: #333333;
  }
  .item-value {
    font-size: 26px;
    font-weight: 500;
  }
}
.address-detail {
  height: 1.75rem;
  border: none;
  outline: none;
  width: 100%;
  direction: rtl;
  font-weight: 600;
}
/deep/.selectAddress select {
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
/deep/.selectAddress option {
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
</style>
