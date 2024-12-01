const apiDomain = process.env.VUE_APP_API_DOMAIN;

const taxApi = {
  // 初始化税局信息
  taxLoginInit: `${apiDomain}tax/init`,
  // 获取税务局登录二维码
  getQrCode: `${apiDomain}tax/getQrCode`,
  //江苏获取登录身份
  queryJSempoyeeList: `${apiDomain}tax/jiangsu/chooseUser`,
  // 江苏登录
  jsTaxLogin: `${apiDomain}tax/jiangsu/login`,
  // 获取税务局二维码登录状态
  getQrCodeStaus: `${apiDomain}tax/getCodeStatus`,
  // 更新国税账号
  modifyTaxRequestId: `${apiDomain}app/baseInfo/modifyTaxRequestId`,

  // 四川税务信息获取短信验证码
  getScTaxSmsCode: `${apiDomain}tax/sichuan/getSmsCode`,
  // 四川税务登录
  scTaxLogin: `${apiDomain}tax/sichuan/login`,

  // 四川登录
  sichuanCheckPassword: `${apiDomain}tax/sichuan/checkPassword`,
  // 获取图片验证码
  sichuanGetCaptcha: `${apiDomain}tax/sichuan/getCaptcha`,
  // 登录
  sichuanLogin: `${apiDomain}tax/sichuan/login`,
  // 发送手机验证码
  sichuanSendSms: `${apiDomain}tax/sichuan/sendSms`,

  // 河北税务获取图片验证码
  getHbImgComput: `${apiDomain}tax/hebei/captcha`,
  // 河北税务系统登录
  hbTaxLogin: `${apiDomain}tax/hebei/login`,
  // 根据上级ID获取所有下级行政区域,0为全国
  queryChildArea: `${apiDomain}app/area/pcode`,
  verifyClientAreaCode: `${apiDomain}app/baseInfo/verifyClientAreaCode`,
  //获取上海电子税务局登录验证码
  getSHImgVerifyUrl: `${apiDomain}tax/shanghai/captcha`,
  //上海电子税务局预登录
  getSHEmployeeList: `${apiDomain}tax/shanghai/employee`,
  //上海电子税务局发送手机验证码
  getShSms: `${apiDomain}tax/shanghai/send`,
  //上海电子税务局登录
  shTaxLogin: `${apiDomain}tax/shanghai/login`,
  //重庆获取验证码
  getCQImgVerifyUrl: `${apiDomain}tax/chongqing/captcha`,
  //重庆登录
  cqTaxLogin: `${apiDomain}tax/chongqing/login`,
  cqTaxNsrChoose: `${apiDomain}tax/chongqing/nsrchoose`,
  // 获取浙江电子税务局登录验证码
  getZJImgVerifyUrl: `${apiDomain}tax/zhejiang/captcha`,
  // 浙江电子税务局获取员工列表
  queryZJempoyeeList: `${apiDomain}tax/zhejiang/employee`,
  // 浙江电子税务局登录
  zjTaxLogin: `${apiDomain}tax/zhejiang/login`,
  //湖南税局登录
  hnTaxLogin: `${apiDomain}tax/hunan/login`,

  // 云南
  //获取云南电子税务局登录验证码
  getYunNanVerify: `${apiDomain}tax/yunnan/captcha`,
  //云南电子税务局获取员工列表
  getYunNanEmployeeList: `${apiDomain}tax/yunnan/employee`,
  //云南电子税务局登录
  yunNanTaxLogin: `${apiDomain}tax/yunnan/login`,
  // 手机验证码方式登录
  yunnanSendSms: `${apiDomain}tax/yunnan/sendSms`,
  yunnansmsLogin: `${apiDomain}tax/yunnan/smsLogin`,

  //广东账号密码验证码登录
  guanDongTaxLogin: `${apiDomain}tax/guangdong/login`,

  // 青岛
  qingdaosfChoose: `${apiDomain}tax/qingdao/sfChoose`,
  qingdaosfzPassStepOne: `${apiDomain}tax/qingdao/sfzPassStepOne`,
  qingdaosfzPassStepTwo: `${apiDomain}tax/qingdao/sfzPassStepTwo`,
  qingdaosfzSendCode: `${apiDomain}tax/qingdao/sfzSendCode`,

  // 陕西
  sxSmsSend: `${apiDomain}tax/shanxishan/sendCode`,
  sxTaxPreLogin: `${apiDomain}tax/shanxishan/getNsrxx`,
  shanxishanCheckWeak: `${apiDomain}tax/shanxishan/checkWeak`,
  sxTaxLogin: `${apiDomain}tax/shanxishan/login`,
  sxVerifyUrl: `${apiDomain}tax/shanxishan/captcha`,

  // 北京
  // 北京获取验证码
  getBjImgVerifyUrl: `${apiDomain}tax/beijing/captcha`,
  // 北京预登陆
  bjPreLogin: `${apiDomain}tax/beijing/preLogin`,
  // 北京登陆
  bjTaxLogin: `${apiDomain}tax/beijing/passwordLogin`,
  // 手机号验证码
  bjPhoneSms: `${apiDomain}tax/beijing/sendMsg`,
  // 手机号的方式登陆
  bjPhoneLogin: `${apiDomain}tax/beijing/smsLogin`,

  // 获取福建电子税务局登录验证码
  getFJVerifyImgUrl: `${apiDomain}tax/fujian/captcha`,
  // 获取福建电子税务局登录员工列表
  getFjEmployeeList: `${apiDomain}tax/fujian/employee`,
  // 登录福建电子税务局
  fjTaxLogin: `${apiDomain}tax/fujian/login`,
  // 获取福建短信验证码
  fjSendSmsCode: `${apiDomain}tax/fujian/sendSms`,
  // 福建预登陆的接口
  fuJianPreLogin: `${apiDomain}tax/fujian/preLogin`,
  // 获取福建电子税务局纳税主体
  getTazPayer: `${apiDomain}tax/fujian/taxpayer`,
  // 贵州税务登录
  guiZhouTaxLogin: `${apiDomain}tax/guizhou/login`,
  guiZhousecondaryLogin: `${apiDomain}tax/guizhou/secondaryLogin`,
  guiZhouprimaryTaxLogin: `${apiDomain}tax/guizhou/primaryLogin`,
  guiZhouChooseTaxOrganization: `${apiDomain}tax/guizhou/chooseTaxOrganization`,

  // 贵州发送验证码
  guiZhouSendSmsCode: `${apiDomain}tax/guizhou/primarySendSms`,
  guiZhousecondarySendSms: `${apiDomain}tax/guizhou/secondarySendSms`,
  guizhouGetCaptcha: `${apiDomain}tax/guizhou/getClickWordCaptcha`,

  // 山东登录
  shanDongTaxLogin: `${apiDomain}tax/shandong/login`,
  // 山东获取验证码
  getShanDongImgVerifyUrl: `${apiDomain}tax/shandong/captcha`,
  // 山东选择登录企业
  chooseqy: `${apiDomain}tax/shandong/chooseqy`,

  // 获取厦门电子税务局登录验证码
  getXiaMenVerifyImgUrl: `${apiDomain}tax/xiamen/captcha`,
  // 获取厦门电子税务局登录员工列表
  getXiaMenEmployeeList: `${apiDomain}tax/xiamen/employees`,
  // 登录厦门电子税务局
  xiaMenTaxLogin: `${apiDomain}tax/xiamen/login`,
  // 获取厦门短信验证码
  xiaMenSendSmsCode: `${apiDomain}tax/xiamen/sendSms`,
  // 安徽账号密码验证码登录
  anHuiBifLogin: `${apiDomain}tax/anhui/biflogin`,

  // 获取广西的纳税人列表
  guangxiGetEmployee: `${apiDomain}tax/guangxi/getEmployee`,
  guangxiSendSms: `${apiDomain}tax/guangxi/sendSms`,
  guangxiLogin: `${apiDomain}tax/guangxi/login`,

  // 安徽获取验证
  anHuiGetVerifyCode: `${apiDomain}tax/anhui/captcha`,
  //安徽二级密码登录
  anHuiTaxLogin: `${apiDomain}tax/anhui/realLogin`,
  // 深圳获取验证码
  getShenZhenImgVerifyUrl: `${apiDomain}tax/shenzhen/captcha`,
  // 深圳获取公钥
  getShenZhenPubKey: `${apiDomain}tax/shenzhen/getPubKey`,
  // 深圳预登录
  shenZhenPreLogin: `${apiDomain}tax/shenzhen/preLogin`,
  // 深圳正式登录
  shenZhenTaxLogin: `${apiDomain}tax/shenzhen/realLogin`,
  // 深圳发送短信
  shenZhenSendSmsCode: `${apiDomain}tax/shenzhen/sendCode`,

  // 河南发送短信
  heNanSendSmsCode: `${apiDomain}tax/henan/sendSms`,
  // 获取河南电子税务局登录手机
  heNanPreLogin: `${apiDomain}tax/henan/telephone`,
  // 河南税务登录
  heNanTaxLogin: `${apiDomain}tax/henan/login`,
  // 获取天津电子税务局登录图片验证码
  getTianJinCaptcha: `${apiDomain}tax/tianjin/captcha`,
  // 登录天津电子税务局
  tianJinTaxLogin: `${apiDomain}tax/tianjin/login`,
  // 山西税局登录
  shanXiTaxLogin: `${apiDomain}tax/shanxijin/login`,
  // 山西税局获取短信验证码
  shanXiGetSmsCode: `${apiDomain}tax/shanxijin/sms`,
  // 甘肃税局登录
  ganSuTaxLogin: `${apiDomain}tax/gansu/login`,
  // 甘肃税局获取纳税人列表
  ganSuNSRList: `${apiDomain}tax/gansu/nsrList`,
  // 甘肃税局获取短信验证码
  ganSuGetSmsCode: `${apiDomain}tax/gansu/sms`,

  // 微风（税局）采集方式
  // 获取微风税局的登录链接 （外部链接的形式）
  getWFLoginLink: `${apiDomain}app/wfq/tax/authorizeUrl`,
  // 微风企授信成功的回调数据
  getWFLoginResult: `${apiDomain}app/wfq/tax/authorizeCallBack`,
  // 微风企授信结果通知
  getWFAuthorizeResultCallback: `${apiDomain}app/wfq/tax/authorizeResultCallback`,
  // 微风企采集文件结果通知
  getWFGatherFileCallBack: `${apiDomain}app/wfq/tax/gatherFileCallBack`,
  // 手动调用查询微风企数据
  getWFReParseData: `${apiDomain}app/wfq/tax/reParseData`,
  // 获取内部授信的申请（主要是微风授权的时候）状态
  getWFApplyStatus: `${apiDomain}app/wfq/tax/getApplyStatus`,
  // 更新注册的产品机构账号
  modifyInstProduct: `${apiDomain}tax/api/modifyInstProduct`,

  // 湖北
  hubeiNsrChoose: `${apiDomain}tax/hubei/nsrChoose`,
  hubeiCaptcha: `${apiDomain}tax/hubei/captcha`,
  hubeiLogin: `${apiDomain}tax/hubei/login`,
  // 宁波
  ningboLogin: `${apiDomain}tax/ningbo/login`,
  getNingBoCode: `${apiDomain}tax/ningbo/send`
};

export default {
  taxApi
};
