export const SassJdugeNextPath = (baseInfoStatus) => {
  let next = '/upload_idcard'
}

export const LOANS_RESULT_ICON = {
  '01': require("@/assets/imgs/icon/ic_cre_ing.png"),
  '02': require("@/assets/imgs/icon/ic_cre_fail.png"),
  '00': require("@/assets/imgs/icon/ic_cre_succ.png")
}

export const LOANS_RESULT_TEXT = {
  '01': '放款审核中',
  '02': '放款失败',
  '00': '放款成功'
}

export const PRODUCT_FATURE_LIST = [
  {
    icon: require("@/assets/imgs/product/ic_sim.png"),
    desc: "操作简单",
  },
  {
    icon: require("@/assets/imgs/product/ic_safe.png"),
    desc: "快捷方便",
  },
  {
    icon: require("@/assets/imgs/product/ic_prepay.png"),
    desc: "随借随还",
  },
]

export const SASS_PRODUCT_DETAIL_PROTOCOL = [
  { code: "06", name: "微萌助手隐私政策", isReadOver: false },
  { code: "05", name: "微萌助手平台用户注册协议", isReadOver: false },
]

export const SASS_BIND_CARD_VALIA = {
  debitCardNum: [
    { required: true, message: "请填写银行卡号", trigger: "blur" }
  ],
  bankName: [{ required: true, message: "请填写", trigger: "blur" }],
  phoneNum: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { trigger: "blur", validator: validatePhoneNum }
  ],
  protocol: [
    { required: true, message: "请阅读并同意协议", trigger: "blur" }
  ],
  smsCode: [
    { required: true, message: "请输入验证码", trigger: "blur" }
  ]
}
const validatePhoneNum = (rule, value, callback) => {
  const regPhone = new RegExp(/^1\d{10}$/);
  if (regPhone.test(value)) {
    callback();
  } else {
    callback(new Error("请填写正确手机号"));
  }
};
