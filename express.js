var express = require('express');
var fs = require('fs');
var path = require('path');
var process = require('process');
var os = require('os');

var ifaces = os.networkInterfaces();
var ip = '';
Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      return;
    }

    if (alias >= 1) {
      ip = iface.address;
      // console.log(ifname + ':' + alias, iface.address);
    } else {
      ip = iface.address;
      // console.log('本机 ip 地址为', ifname, iface.address);
    }
    ++alias;
  });
});

// 程序的当前路径
var _curpath = process.cwd();

var app = express();

// 解析命令参数
var _config = {
  name: 'express',
  description: '挂载静态路径',
  options: [{
    name: 'file',
    shortcut: 'f',
    description: '静态文件',
    default: ''
  }, {
    name: 'port',
    shortcut: 'p',
    description: '启用端口',
    default: 6688
  }, {
    name: 'zone',
    shortcut: 'z',
    description: '挂载的静态路径',
    default: '.'
  }, {
    name: 'usepath',
    shortcut: 'u',
    description: '挂载路径',
    default: '/'
  }]
}

const params = require('parameters')(_config);

var args = params.parse();

if (!args.help) {
  var _path = path.resolve(_curpath, `${args.zone}`);
  var _sPath = isPath(args.usepath) ? args.usepath : '/';
  if (!(_sPath[0] === '/')) {
    _sPath = `/${_sPath}`;
  }
  if (fs.existsSync(`${_path}/${args.file}`) && args.file) {
    app.use(_sPath, function (req, res) {
      res.sendFile(`${_path}/${args.file}`);
    });
  } else {
    app.use(_sPath, express.static(_path));
  }
  console.log('将当前路径 %s/%s 进行挂载', _path, args.file);
  console.log('可访问 localhost:%s%s', args.port, _sPath);
  console.log('或者可访问 %s:%s%s', ip, args.port, _sPath);
} else {
  console.log(params.help());
  process.exit()
}

app.listen(Number(args.port));

// 判断是否为 path 字符串
function isPath(path) {
  var reg = /[a-z0-9\s_@\-^!#$%&+={}\[\]]+$/i;
  return reg.test(path);
}