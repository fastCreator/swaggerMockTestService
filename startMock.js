// const swagger2MockTest = require('./swagger2MockTest');
// parseSwagger('D:\\My Documents\\桌面\\zyx-frame\\docs\\swagger', function (json) {
//   startMock(json)
// });
// async function parseSwagger(path, cb) {
//   const json = await swagger2MockTest(path);
//   cb(json);
// }


const express = require('express');
const bodyParser = require('body-parser')
app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
 * 开始生成模拟API
 * 
 * @param {any} json 
 * @param {any} path 
 * @param {any} port 
 */
function startMock(json, port) {
  Object.keys(json).forEach(function (url) {
    var myurl = url.replace(/\{/g, ":").replace(/\}/g, "");
    app.use(myurl, handleRouter(json[url], url));
  });
  app.use(err());
  app.listen(port || 3000);
  console.log('localhost:' + (port || 3000) + ' success');
}

/**
 * 处理路由
 * 
 * @param {JSON} data swagger文档数据 
 * @param {URL} url 原生地址 
 * @returns 
 */
function handleRouter(data, url) {
  return function (req, res, next) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    var mdata = data[req.method] || data[req.method.toLowerCase()];
    if (mdata && req.originalUrl.replace(/\/$|(\/?\?.*)/,'') === req.baseUrl) {
      var msg = paramsValidate(req, mdata.parameters);
      if (msg) {
        res.statusCode = 400;
        res.end(msg);
      } else {
        res.statusCode = 200; 
        res.end(JSON.stringify(mock(mdata.responses&&mdata.responses['200'])));
      }
    } else {
      next();
    }
  }
}

/**
 *  
 * @param {any} req 
 * @param {any} data 
 * @returns 判断是否通过验证 
 */
function paramsValidate(req, params) {
  return params ? params.test({
    body: req.body,
    query: req.query,
    path: req.params
  }) : '';
}

/**
 * 模拟返回值
 * 
 */
function mock(data) {
  if (data&&data.mock) {
    return data.mock();
  } else {
    return "success";
  }
}

/**
 * 错误处理
 *  
 */
function err() {
  return function (req, res) {
    console.log('未找到该路径:',req.originalUrl,req.method);
    res.statusCode = 400;
    res.end();
  }
}

module.exports = startMock;