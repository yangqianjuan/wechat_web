export const runScript = function(code, allow) {
  // 对值的一些操作
  const handler = {
    get(obj, prop) {
      return Reflect.has(obj, prop) ? obj[prop] : null;
    },
    set(obj, prop, value) {
      Reflect.set(obj, prop, value);
      return true;
    },
    has(obj, prop) {
      return obj && Reflect.has(obj, prop);
    }
  };
  // 捕获的函数
  const captureHandler = {
    get(obj, prop) {
      return Reflect.get(obj, prop);
    },
    set() {
      return true;
    },
    has() {
      return true;
    }
  };

  //   白名单
  const allowList = {
    IS_BERIAL_SANDBOX: true,
    __proto__: null,
    eval: function(code) {
      return runScript('return ' + code, {});
    },
    ...allow
  };

  if (!Object.isFrozen(String.prototype)) {
    for (const k in allowList) {
      const fn = allowList[k];
      if (typeof fn === 'object' && fn.prototype) {
        Object.freeze(fn.prototype);
      }
      if (typeof fn === 'function') {
        Object.freeze(fn);
      }
    }
  }
  const proxy = new Proxy(allowList, handler);
  const capture = new Proxy(
    {
      __proto__: null,
      proxy,
      globalThis: new Proxy(allowList, handler),
      window: new Proxy(allowList, handler),
      self: new Proxy(allowList, handler)
    },
    captureHandler
  );

  console.log(proxy, capture);
  Function(
    'proxy',
    'capture',
    `with(capture) {
            with(proxy) {
              return (function(){
                "use strict";
                ${code};
                return window
              })();
            }
        }`
  )(proxy, capture);
  // return Function(
  //   'proxy',
  //   'capture',
  //   `with(capture) {
  //           with(proxy) {
  //             return (function(){
  //               "use strict";
  //               ${code};
  //               return window
  //             })();
  //           }
  //       }`
  // )(proxy, capture);
};

// headers: { 'Access-Control-Allow-Origin': '*' },
let a = [];
let b = '1035';
let lifecycles = runScript(a, { a: 1, b: 1 })['1035'];

console.log('sanbox', lifecycles);
