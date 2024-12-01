import routerConfig from '@/config/router/index';
import route from '@/router/index.js';
/**
 * 通过控制路由的map来切换不同的产品
 */
const bootstrapRouter = function (options) {
  let productId = options.productId || '';
  let routerInstance = null;
  let routerMap = null;
  productId ? (routerMap = routerConfig.routerMap[productId]) : (routerMap = routerConfig.allRoutes);
  routerInstance = route.routeExe({ routes: routerMap }, () => {});
  return routerInstance;
};

const bootstrap = function (productId, options) {
  options.productId = productId || '';
  let result = {};
  result.routerInstance = bootstrapRouter(options);
  return result;
};

export default {
  bootstrapRouter,
  bootstrap
};
