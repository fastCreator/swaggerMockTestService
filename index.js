const readline = require('readline');
const program = require('commander');

const swagger2MockTest = require('./swagger2MockTest');
const startMock = require('./startMock');
const startTest = require('./startTest');



buildCli();

/**
 * 生成手脚架
 * 
 */
function buildCli() {
  //buildRouter('D:\\My Documents\\桌面\\zyx-frame\\docs\\swagger', program.prot);

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  program
    .option('-t, --test', 'test api')
    .option('-m, --mock', 'mock api')
    .parse(process.argv);

  if (program.test) {
    rl.question('请输入swagger文档路径:', (answer) => {
      rl.question('请输入服务端host:', (answer2) => {
        parseSwagger(answer, function (json) {
          startTest(answer2, json)
        });
        rl.close();
      });
    });
  } else {
    rl.question('请输入swagger文档路径:', (answer) => {
      rl.question('请服务端口号:', (port) => {
        parseSwagger(answer, function (json) {
          startMock(json, port)
          rl.close();
        });
      });

    });

  }
}

/**
 * 生成路由 
 * 
 * @param {String} path swagger文档路径
 * @param {Number} port 路由地址
 */
async function parseSwagger(path, cb) {
  const json = await swagger2MockTest(path);
  cb(json);
} 