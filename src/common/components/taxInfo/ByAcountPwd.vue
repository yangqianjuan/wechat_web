<template>
  <div>
    <div class="remind">您将授权平台查询您的税务电子信息</div>
    <Form
      :model="formItem"
      :label-width="90"
      :rules="ruleValidate"
      ref="formDynamic"
      label-position="left"
      class="from-wrapper"
    >
      <FormItem label="企业名称" prop="companyName">
        <i-input v-model="formItem.companyName" disabled placeholder="请输入企业名称"></i-input>
      </FormItem>
      <FormItem label="国税账号" prop="acountNum">
        <i-input v-model="formItem.acountNum" placeholder="请输入国税账号"></i-input>
      </FormItem>
      <FormItem label="国税密码" prop="acountPwd">
        <i-input v-model="formItem.acountPwd" type="password" placeholder="请输入国税密码"></i-input>
      </FormItem>
      <FormItem label="确认密码" prop="comfirmAcountPwd">
        <i-input v-model="formItem.comfirmAcountPwd" type="password" placeholder="请再次输入国税密码"></i-input>
      </FormItem>
      <Button class="sub-btn" type="primary" :loading="isLoading" @click="handleSubmit('formDynamic')">提交</Button>
    </Form>
  </div>
</template>

<script>
export default {
  props: {
    companyName: {
      type: String,
      default: ""
    },
    acountNum: {
      type: String,
      default: ""
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateVomfirmAcountPwd = (rule, value, callback) => {
      if (value === this.formItem.acountPwd) {
        callback();
      } else {
        callback(new Error("两次密码输入不一致"));
      }
    };
    return {
      formItem: {
        companyName: "",
        acountNum: "",
        acountPwd: "",
        comfirmAcountPwd: ""
      },
      ruleValidate: {
        companyName: [{ required: true, message: "请填写企业名称", trigger: "blur" }],
        acountNum: [{ required: true, message: "请填写国税账号", trigger: "blur" }],
        acountPwd: [{ required: true, message: "请填写国税密码", trigger: "blur" }],
        comfirmAcountPwd: [
          { required: true, message: "请填写国税密码", trigger: "blur" },
          { validator: validateVomfirmAcountPwd, trigger: "blur" }
        ]
      }
    };
  },
  watch: {},
  created() {},
  mounted() {
    this.formItem.companyName = this.companyName;
    this.formItem.acountNum = this.acountNum;
  },
  methods: {
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.$emit("applyUserCreditCard", this.formItem);
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.sub-btn {
  width: 80%;
  margin-left: 10%;
  margin-top: 30px;
  span {
    font-size: 26px;
  }
}
/deep/.ivu-form-item-label:before {
  content: "";
}
/deep/.ivu-input {
  border: none;
  height: 1.125rem;
  padding: 0;
}
/deep/.ivu-form-item {
  margin-bottom: 15px;
  padding-top: 0.5rem;
  padding-bottom: 0.8125rem;
  border-bottom: 1px solid rgba(244, 246, 249, 1);
  padding-left: 1.25rem;
  background: #ffffff;
}
/deep/.ivu-form-item-error-tip {
  padding-top: 17px;
  padding-bottom: 12px;
  z-index: 10;
}
/deep/.ivu-input[disabled] {
  background: #ffffff;
}
</style>