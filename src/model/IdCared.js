export default class IdCard {
  constructor(params) {
    this.name = params.name;
    this.idNum = params.idNum;
    this.nation = params.nation;
    this.birth = params.birth;
    this.sex = params.sex;
    this.authority = params.authority;
    this.address = params.address;
    this.validDate = params.validDate
    this.advancedInfo = params.advancedInfo;
    this.requestId = params.requestId;
    this.mobileNo = ''
    this.contactType = ''
    this.areaCode = ''
    this.resideAddress = ''
  }
}