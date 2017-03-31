// const swagger2MockTest = require('./swagger2MockTest');
// parseSwagger('D:\\My Documents\\桌面\\zyx-frame\\docs\\swagger', function (json) {
//     startTest('localhost:3000', json)
// });
// async function parseSwagger(path, cb) {
//     const json = await swagger2MockTest(path);
//     cb(json);
// }


var baseURL, count = 0, errMsg = '';
const axios = require('axios');

function startTest(host, jsons) {
    baseURL = 'http://' + host;
    for (var key in jsons) {
        for (var method in jsons[key]) {
            count++;
            //if (key === '/v2/pets')
                testOne(key, method, jsons[key][method]);
        }
    }

}

function testOne(key, method, json) {
    try {
        var data = json.parameters ? json.parameters.mock() : {};
    }
    catch (err) {
        console.log(key);
        console.log('模拟参数异常', err);
    }
    var path = key;

    for (var name in data.path) {
        path = replacePath(path, name, data.path[name])
    }
    var query = ''
    for (var name in data.query) {
        query += '&' + name + '=' + data.query[name]
    }
    if (query) {
        query = '?' + query.substr(1);
        path += query;
    }

    var opt = {
        headers: {
            'Accept': 'text/html; charset=utf-8',
            'Content-Type': 'application/json'
        },
        method: method,
        baseURL: baseURL,
        url: path,
        body: ""
    }

    if (data.body) opt.data = JSON.stringify(data.body[Object.keys(data.body)[0]]);
    axios(opt).then(function (d) {
        count--;
        var test = json.responses[200] && json.responses[200].test, msg = '';
        if (test) {
            msg = test(d.data);
            errMsg += msg;
        }
        if (msg) {
            console.log(msg)
        } else {
            console.log(key, method, '通过测试')
        }
        if (count == 0) {
            ajaxEnd();
        }
    }).catch(function (error) {
        console.log(key, method, '错误');
        throw new Error('发生错误！', error);
    });
}

function ajaxEnd() {
    if (errMsg) {
        console.log(errMsg)
    } else {
        console.log('恭喜全部通过测试')
    }
}

function replacePath(path, name, value) {
    var regx = new RegExp('\{' + name + '\}')
    return path.replace(regx, value)
}

module.exports = startTest;