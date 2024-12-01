- init Project master
  <!-- 注意 -->
  项目启动前需要启动 nginx，nginx 提供 http://dev.xiaomengjr.com 的访问权限，开启 switchHost，转发本地的 9000 端口的服务，

<!-- 微信公众号开发之授权登录（前端vue篇） -->

https://blog.csdn.net/I_am_ken/article/details/102695009

<!-- 移动端的适配 -->

参考的设计稿：width: 750px height: 1334px 链接
https://blog.csdn.net/stenphencurry/article/details/120216640

<!-- 问题 -->

##### webpack版本问题

```pascal
打包的时候出现 TypeError:Cannot read property ‘tapPromise‘ of undefined 问题，检查后发现是 compression-webpack-plugin 插件版本问题导致的
npm uninstall compression-webpack-plugin
npm i compression-webpack-plugin@5.0.1 --save-dev
```



##### node16+ 对应的node-sass,sass-loader版本

```pascal
"sass-loader": "^10.2.0",
"node-sass": "^6.0.1",
```


如果报错：

```tex
Syntax Error: ValidationError: Invalid options object. Sass Loader has been initialized using an options object that does not match the API schema.

- options has an unknown property 'prependData'. These properties are valid:
  object { implementation?, sassOptions?, additionalData?, sourceMap?, webpackImporter? }
```

则检查webpack配置：

```js
module.exports = {
css: {
loaderOptions: {
	sass: { // 加载全局scss文件
		additionalData: '@import "@/assets/css/common/common.scss";'
			}
		}
	},  
}


由于sass-loader版本不同，loaderOptions中additionalData的键名也不同，

sass-loader v8-, 选项名是 "data"
sass-loader v8，选项名是 "prependData"
sass-loader v10+, 选项名是 "additionalData"
```

```shell
npm/cnpm install --ignore-scripts
```

