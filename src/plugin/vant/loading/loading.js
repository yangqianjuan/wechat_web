// loading.js
import LoadingComponent from '@/common/components/common/Loading.vue';

const loading = {
  install: function(Vue) {
    // 创建一个Vue的“子类”组件
    const LoadingConstructor = Vue.extend(LoadingComponent);

    // 创建一个该子类的实例,并挂载到一个元素上
    const instance = new LoadingConstructor();

    // 将这个实例挂载到动态创建的元素上,并将元素添加到全局结构中
    instance.$mount(document.createElement('div'));
    document.body.appendChild(instance.$el);

    // 在Vue的原型链上注册方法，控制组件

    Vue.prototype.$loading = {
      show: options => {
        if (options && !Array.isArray(options) && typeof options === 'object') {
          if (Object.keys(options).length) {
            for (let key in options) {
              instance.loading[key] = options[key];
            }
          }
        }
        instance.show = true;
      },
      hide: options => {
        if (options && !Array.isArray(options) && typeof options === 'object') {
          if (Object.keys(options).length) {
            for (let key in options) {
              instance.loading[key] = options[key];
            }
          }
        }
        instance.show = false;
      }
    };
  }
};

export default loading;
