<template>
  <div class="page-container">
    <div class="remind">请填写联系人信息</div>
    <div class="from-container">
      <div class="module-1">
        <div class="module-title">
          <div class="left"></div>
          <div class="middle">紧急联系人</div>
          <div class="right">(以下信息为必填项)</div>
        </div>
        <div class="module-content">
          <Form
            :model="specialInfo"
            :label-width="80"
            :rules="specialRuleValidate"
            ref="formDynamic1"
            class="common-from"
            label-position="left"
          >
            <FormItem label="姓名" prop="name">
              <i-input v-model="specialInfo.name"></i-input>
            </FormItem>
            <FormItem label="电话" prop="phone">
              <i-input v-model="specialInfo.phone"></i-input>
            </FormItem>
            <FormItem label="地址" prop="area">
              <div class="address-content">
                <v-distpicker
                  wrapper="selectAddress"
                  @province="getOneProvinceCode"
                  @city="getOneCityCode"
                  @area="getOneAreaCode"
                ></v-distpicker>
              </div>
            </FormItem>
            <FormItem label="详细地址" prop="addressDetail">
              <i-input v-model="specialInfo.addressDetail"></i-input>
            </FormItem>
            <FormItem label="关系" prop="relationship">
              <Select v-model="specialInfo.relationship" placeholder="请选择">
                <Option value="01">配偶</Option>
                <Option value="02">亲属</Option>
                <Option value="03">朋友</Option>
                <Option value="04">同事</Option>
                <Option value="05">担保人</Option>
                <Option value="06">其他</Option>
              </Select>
            </FormItem>
          </Form>
        </div>
      </div>
      <div class="module-2">
        <div class="module-title">
          <div class="left"></div>
          <div class="middle">普通联系人</div>
          <div class="right">(以下信息为必填项)</div>
        </div>
        <div class="module-content">
          <Form
            :model="commonInfo"
            :label-width="80"
            :rules="commonRuleValidate"
            ref="formDynamic2"
            label-position="left"
            class="common-from"
          >
            <FormItem label="姓名" prop="name">
              <i-input v-model="commonInfo.name"></i-input>
            </FormItem>
            <FormItem label="电话" prop="phone">
              <i-input v-model="commonInfo.phone"></i-input>
            </FormItem>
            <FormItem label="地址" prop="area">
              <div class="address-content">
                <v-distpicker
                  wrapper="selectAddress"
                  @province="getTwoProvinceCode"
                  @city="getTwoCityCode"
                  @area="getTwoAreaCode"
                ></v-distpicker>
              </div>
            </FormItem>
            <FormItem label="详细地址" prop="addressDetail">
              <i-input v-model="commonInfo.addressDetail"></i-input>
            </FormItem>
            <FormItem label="关系" prop="relationship">
              <Select v-model="commonInfo.relationship" placeholder="请选择">
                <Option value="01">配偶</Option>
                <Option value="02">亲属</Option>
                <Option value="03">朋友</Option>
                <Option value="04">同事</Option>
                <Option value="05">担保人</Option>
                <Option value="06">其他</Option>
              </Select>
            </FormItem>
          </Form>
        </div>
      </div>
      <Button class="sub-btn" type="primary" :loading="isLoading" @click="handleSubmit">提交</Button>
    </div>
  </div>
</template>
<script>
import { COOKIE_ID, SESSION_ID } from '@/utils/common/config';
import VDistpicker from 'v-distpicker';
import { insertOrModifyUserInfo } from '@/request/interface/common/index';
import { getUnionKey } from '@/request/interface/common';
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

    return {
      specialInfo: {
        name: '',
        phone: '',
        address: '',
        addressDetail: '',
        relationship: '',
        province: '',
        city: '',
        area: ''
      },
      specialRuleValidate: {
        name: [{ required: true, message: '请填写姓名', trigger: 'blur' }],
        phone: [
          { required: true, message: '请填写手机号', trigger: 'blur' },
          { required: true, validator: validatePhoneNum }
        ],
        area: [{ required: true, message: '请填写地址', trigger: 'blur' }],
        addressDetail: [{ required: true, message: '请填写详细地址', trigger: 'blur' }],
        relationship: [{ required: true, message: '请选择关系', trigger: 'blur' }]
      },
      commonInfo: {
        name: '',
        phone: '',
        address: '',
        addressDetail: '',
        relationship: '',
        province: '',
        city: '',
        area: ''
      },
      commonRuleValidate: {
        name: [{ required: true, message: '请填写姓名', trigger: 'blur' }],
        phone: [
          { required: true, message: '请填写手机号', trigger: 'blur' },
          { required: true, validator: validatePhoneNum }
        ],
        area: [{ required: true, message: '请填写地址', trigger: 'blur' }],
        addressDetail: [{ required: true, message: '请填写详细地址', trigger: 'blur' }],
        relationship: [{ required: true, message: '请选择关系', trigger: 'blur' }]
      },
      isLoading: false,
      referrer: '',
      productId: '1000',
      applyUnionKey: ''
    };
  },
  components: {
    'v-distpicker': VDistpicker
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.referrer = this.$store.state.referrer || localStorage.referrer;
      const applyUnionKey = this.getCookie(COOKIE_ID.applyUnionKey) || sessionStorage.getItem(SESSION_ID.unionKey);
      this.applyUnionKey = applyUnionKey;
      if (!applyUnionKey || applyUnionKey === 'null') {
        this.$toasting.show({ message: '加载中', forbidClick: true });
        getUnionKey({ referrer: this.referrer, productId: '1000' })
          .then(res => {
            if (res?.data?.success && res?.data?.data) {
              this.applyUnionKey = res.data.data;
              let time = 1000 * 60 * 60 * 24 * 7;
              this.setCookie(COOKIE_ID.applyUnionKey, this.applyUnionKey, time);
              sessionStorage.setItem(SESSION_ID.unionKey, this.applyUnionKey);
            } else {
              this.$notify.error({
                msg: '获取申请标识失败！'
              });
            }
          })
          .catch(err => {
            this.$notify.error({
              msg: err?.data?.msg || '获取申请标识失败！'
            });
          })
          .finally(_ => {
            this.$toasting.hide();
          });
      }
    },

    handleSubmit() {
      this.$refs['formDynamic1'].validate(valid1 => {
        if (valid1) {
          this.$refs['formDynamic2'].validate(valid2 => {
            if (valid2) {
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
              this.isLoading = true;
              this.$toasting.show({ message: '上传中', forbidClick: true });
              insertOrModifyUserInfo([option1, option2])
                .then(async res => {
                  if (res?.data?.success) {
                    let nextPath = await queryNextByUnionKeyAndProdId('1000');
                    this.$router.replace({ path: nextPath });
                  } else {
                    this.$notify.error({
                      msg: '联系人信息更新失败！'
                    });
                  }
                })
                .catch(err => {
                  this.$notify.error({
                    msg: err?.data?.msg || '联系人信息更新失败！'
                  });
                })
                .finally(() => {
                  this.isLoading = false;
                  this.$toasting.hide();
                });
            }
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
    }
  }
};
</script>
<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  padding-bottom: 200px;
  background: #f7f7f7;
  .from-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .module-1 {
    width: 670px;
    margin-top: 16px;
    background: #ffffff;
    border-radius: 8px;
    padding: 32px 32px 16px;
    .module-title {
      display: flex;
      align-items: center;
      padding-bottom: 32px;
      border-bottom: 1px solid #f7f7f7;
      .left {
        width: 6px;
        height: 24px;
        background: #2781ee;
        border-radius: 4px;
      }
      .middle {
        font-size: 28px;
        font-family: PingFangSC, PingFangSC-Medium;
        font-weight: 500;
        color: #333333;
        margin: 0 16px;
      }
      .right {
        font-size: 22px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        color: #2781ee;
      }
    }
    .module-content {
      padding-top: 20px;
      /* padding: 16px 40px; */
    }
  }

  .module-2 {
    width: 670px;
    margin-top: 16px;
    background: #ffffff;
    border-radius: 8px;
    padding: 32px 32px 16px;
    .module-title {
      display: flex;
      align-items: center;
      padding-bottom: 32px;
      border-bottom: 1px solid #f7f7f7;
      .left {
        width: 6px;
        height: 24px;
        background: #2781ee;
        border-radius: 4px;
      }
      .middle {
        font-size: 28px;
        font-family: PingFangSC, PingFangSC-Medium;
        font-weight: 500;
        color: #333333;
        margin: 0 16px;
      }
      .right {
        font-size: 22px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        color: #2781ee;
      }
    }
    .module-content {
      padding-top: 20px;
      /* padding: 16px 40px; */
    }
  }
  .address-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
  }
}
::v-deep(.ivu-form-item) {
  height: 64px !important;
  margin-bottom: 36px !important;
  border-bottom: 1px solid #f7f7f7 !important;
  .ivu-form-item-label {
    font-size: 26px;
    font-family: PingFangSC, PingFangSC-Regular;
    font-weight: 400;
    text-align: left;
    color: #333333;
  }
  .ivu-form-item-content {
    .ivu-input {
      border: 0 !important;
      text-align: right;
      font-size: 26px;
      font-family: PingFangSC, PingFangSC-Medium;
      font-weight: 500;
      text-align: right;
      color: #333333;
    }
  }
  .ivu-form-item-error-tip {
    padding-top: 0;
    font-size: 22px !important;
    right: 0 !important;
    text-align: right;
  }
}
::v-deep(.ivu-select-selection) {
  border: 0 !important;
  .ivu-select-placeholder {
    display: none !important;
  }
  .ivu-select-selected-value {
    justify-content: flex-end;
    color: #333 !important;
  }
}

::v-deep(.sub-btn) {
  width: 632px;
  height: 96px;
  background: #2781ee;
  border-radius: 6px;
  margin-top: 50px;

  span {
    font-size: 32px;
    font-family: PingFangSC, PingFangSC-Medium;
    font-weight: 500;
    text-align: center;
    color: #ffffff;
  }
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
  color: #333 !important;
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
</style>
