export class BankCard {
  constructor(params) {
    this.bankInfo = params.bankInfo;
    this.bankName = this.bankInfo.split('(')[0];
    this.cardNo = params.cardNo;
    this.validDate = params.validDate;
  }
}

export class RepayBankCard {
  constructor(params) {
    this.userName = params.userName;
    this.bankCardNo = params.bankCardNo;
    this.mobile = params.bankCardReservePhone;
    this.type = params.type;
    this.bankName = params.bankName;
    this.bankIconUrl = params.bankIconUrl;
    this.eaccountBalance = params.eaccountBalance;
    this.successfulLink = params.successfulLink;
    this.remainingSum = params.remainingSum || 0;
    this.accountToBeCredited = params.accountToBeCredited || {};
    //01 本行卡 02 电子账户
  }
}

export class ProdBankCard {
  constructor(params) {
    this.bankNo = params.bankNo || '';
    this.bankCardNo = params.bankCardNo;
    this.agreeStatus = params.agreeStatus || '01'; // 00 正在使用中 01 待使用
    this.isInUse = this.agreeStatus === '01';
    this.bankCardReservePhone = params.bankCardReservePhone;
    this.bankName = params.bankName;
    this.userName = params.userName;
  }
}
