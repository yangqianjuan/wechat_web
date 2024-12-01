export const DEGREE_BACKGROUND_ARR = [
  {
    key: '1',
    value: '名誉博士'
  },
  {
    key: '2',
    value: '博士'
  },
  {
    key: '3',
    value: '硕士'
  },
  {
    key: '4',
    value: '学士'
  },
  {
    key: '5',
    value: '无'
  },
  {
    key: '0',
    value: '其他'
  },
  {
    key: '9',
    value: '未知'
  }
];

export const EDU_BACKGROUND_ARR = [
  {
    key: '00',
    value: '未分类'
  },
  {
    key: '01',
    value: '博士'
  },
  {
    key: '10',
    value: '研究生'
  },
  {
    key: '20',
    value: '大学本科'
  },
  {
    key: '30',
    value: '大学专科或专科学校'
  },
  {
    key: '40',
    value: '中等专业学校或中等技术学校'
  },
  {
    key: '50',
    value: '技术学校'
  },
  {
    key: '60',
    value: '高中'
  },
  {
    key: '70',
    value: '初中'
  },
  {
    key: '80',
    value: '小学'
  },
  {
    key: '90',
    value: '文盲或半文盲'
  }
];

export const MARITAL_STATUS_ARR = [
  {
    key: '10',
    value: '未婚'
  },
  {
    key: '20',
    value: '已婚'
  },
  {
    key: '40',
    value: '离婚'
  },
  {
    key: '99',
    value: '其他'
  }
];

export const CONNECTION_TYPE_ARR = [
  {
    key: '1',
    value: '父母'
  },
  // {
  //   key: '2',
  //   value: '配偶'
  // },
  {
    key: '3',
    value: '亲属'
  },
  {
    key: '4',
    value: '朋友'
  },
  {
    key: '5',
    value: '同事'
  },
  {
    key: '0',
    value: '其他'
  }
];

export const ReplenishIdCardVali = {
  name: [{ required: true, message: '请填写姓名', trigger: 'blur' }],
  address: [{ required: true, message: '请填写地址', trigger: 'blur' }],
  idNum: [
    { required: true, message: '请填写身份证号', trigger: 'blur' },
    { validator: validateIdNum, trigger: 'blur' }
  ],
  authority: [{ required: true, message: '请填写签发机关', trigger: 'blur' }],
  mobileNo: [
    { required: true, message: '请填写手机号', trigger: 'blur' },
    { trigger: 'blur', validator: validatePhoenNum }
  ],
  contactType: [{ required: true, message: '请选择联系人关系', trigger: 'blur' }],
  resideAddress: [{ required: true, message: '请填写详细地址', trigger: 'blur' }]
};

export const validatePhoenNum = (rule, value, callback) => {
  const reg = new RegExp(/^1\d{10}$/);
  if (reg.test(value)) {
    callback();
  } else {
    callback(new Error('手机号格式不正确'));
  }
};

export const validateIdNum = (rule, value, callback) => {
  let _IDRe18 = /^([1-6][1-9]|50)\d{4}(18|19|20)\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  let _IDre15 = /^([1-6][1-9]|50)\d{4}\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}$/;
  const regIdNum18 = new RegExp(_IDRe18);
  const regIdNum15 = new RegExp(_IDre15);
  if (regIdNum18.test(value) || regIdNum15.test(value)) {
    callback();
  } else {
    callback(new Error('身份证号格式错误！'));
  }
};

export const ReplenishProtocol = [
  { code: '00', name: '个人信息查询和使用授权书', isReadOver: false },
  { code: '01', name: '个人信息查询和提供在线授权书', isNess: true, isReadOver: false }
];

export const getReplenisIdCardPageTitle = (isMarr = false) => {
  let ReplenisIdCardPageTitle = ['请上传配偶身份证', '请上传结婚证', '请核对身份证信息'];
  if (!isMarr) {
    ReplenisIdCardPageTitle[0] = '请上传联系人身份证';
  }
  return ReplenisIdCardPageTitle;
};
export const ReplenisIdCardPageTitle = [];

export const creditCallBackUrl = {
  development: 'https://dev.xiaomengjr.com/front/#/sass_credit_result?src=zgc',
  production: 'https://www.xiaomengjr.com/front/#/sass_credit_result?src=zgc'
};

export const loansCallBackUrl = {
  development: 'https://dev.xiaomengjr.com/front/#/sass_loans_baseinfo?src=zgc',
  production: 'https://www.xiaomengjr.com/front/#/sass_loans_baseinfo?src=zgc'
};
