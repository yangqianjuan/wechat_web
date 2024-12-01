export default class User {
  constructor(params) {
    this.id = params.userId || '' ;
    this.name = params.userName || '' ;
    this.idNo = params.idno || '' ;
    this.phoneNum = params.mobileNo || '' ;
    this.createTime = params.createTime || '' ;
    this.address = params.idAddress || '' ;
    this.birthDate = params.idBirthday || '' ;
    this.gender = params.idGender || '' ;
    this.ghStatus = params.idGhStatus || '' ;
    this.singOrg = params.idSignOrg || '' ;
    this.validityStart = params.idValidityStart || '' ;
    this.validityStop = params.idValidityStop || '' ;
    this.updateTime =  params.updateTime || '' ;
    this.idTxStatus = params.idTxStatus || '' ;
    this.maritalStatus = params.maritalStatus || ''
  }
}