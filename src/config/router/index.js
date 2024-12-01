/*
 * @Author: hsf
 * @Date: 2023-09-01 15:25:11
 * @LastEditors: hsf
 * @LastEditTime: 2024-11-05 16:23:42
 * @Description:
 */
import xweRouterMap from './xwe/index';
import xmkdRouterMap from './xmkd/index';
import sassRouterMap from './sass/index';
import common from './common/index';
import mydRouterMap from './myd/index';
import bjbRouterMap from './bjb/index';
import authSalesInfoRouterMap from './authSalesInfo/index';
import sjbRouterMap from './sjb/index';

const routerMap = {
  1025: xweRouterMap.routes,
  1000: xmkdRouterMap.routes,
  1023: sassRouterMap.routes,
  1155: bjbRouterMap.routes
};

export default {
  routerMap,
  commonRoutes: common.routes,
  allRoutes: [
    ...common.routes,
    ...sassRouterMap.routes,
    ...xmkdRouterMap.routes,
    ...xweRouterMap.routes,
    ...mydRouterMap.routes,
    ...bjbRouterMap.routes,
    ...authSalesInfoRouterMap.routes,
    ...sjbRouterMap.routes
  ]
};
