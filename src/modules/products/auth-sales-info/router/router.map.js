const authSalesInfoRouterMap = [
  // ----------------------------------------------------------------------------  授信流程  ----------------------------------------------------------------

  // 上传身份证
  {
    path: '/auth_upload_idcard',
    name: 'AuthUploadIdcard',
    component: () =>
      import(/* webpackChunkName: "auth-credit-1" */ '../page/creditProcess/uploadIdCard/UploadIdCard.vue'),
    meta: {
      title: '上传身份证'
    }
  },
  // 3、三要素验证
  {
    path: '/auth_idno_name_phone_verify',
    name: 'AuthIdnoNamePhoneVerify',
    component: () => import(/* webpackChunkName: "auth-credit-1" */ '../page/creditProcess/threeInfo/ThreeInfo.vue'),
    meta: {
      title: '绑定手机号'
    }
  },

  // 4、活体识别（人脸识别）
  {
    path: '/auth_face_pp',
    name: 'AuthFace_pp',
    component: () => import(/* webpackChunkName: "auth-credit-1" */ '../page/creditProcess/face/FacePP.vue'),
    meta: {
      title: '人脸识别'
    }
  },

  // 5、产品海报
  {
    path: '/auth_product_poster',
    name: 'AuthProductPoster',
    component: () =>
      import(/* webpackChunkName: "auth-credit-1" */ '../page/creditProcess/productPoster/ProductPoster.vue'),
    meta: {
      title: '认证结果'
    }
  }
  // --------------------------------------------------------------------------------------------------------------------------------------------
];

export default {
  authSalesInfoRouterMap
};
