;(function() {

  var CDN_MODULES = [
    'jquery', 'zepto', 'json', 'jasmine', 'underscore', 'handlebars',
    'seajs', 'moment', 'async', 'store', 'swfobject', 'backbone', 'raphael'
  ]

  var ALIPAY_BASE = 'https://a.alipayobjects.com/static/arale/'
  var GITHUB_BASE = 'https://raw.github.com/aralejs/'

  var mapRules = []
  mapRules.push(function(url) {

    // CDN_MODULES 直接从 alipay 的 cdn 上加载
    for (var i = 0; i < CDN_MODULES.length; i++) {
      if (url.indexOf(CDN_MODULES[i] + '/') > 0) {
        return url.replace(GITHUB_BASE, ALIPAY_BASE)
      }
    }

    // 将 "/master/xxx.js" 转换成 "/master/dist/xxx.js"
    url = url.replace(/\/master\/([^\/]+\.js)$/, '/master/dist/$1')

    // 将 "/1.0.2/xxx.js" 转换成 "/1.0.2/dist/xxx.js"
    url = url.replace(/\/([\d\.]+)\/([^\/]+\.js)$/, '/$1/dist/$2')

    // 本地开发中的文件，直接从本地加载
    if (url.indexOf('src') < 0 && url.indexOf('dist') < 0) {
      url = url.replace(GITHUB_BASE, '../src/')
    }

    // 如果访问 alipay.im 则从 git.alipay.im 加载
    if ((location.hostname.indexOf('alipay.im') != -1 || location.hostname.indexOf('127.0.0.1') != -1 || location.hash == '#gitlab')
        && url.indexOf(GITHUB_BASE) != -1) {
      // 链接转换成 http://git.alipay.im/overlay/0.9.9/dist/overlay.js
      url = url.replace(GITHUB_BASE, 'http://git.alipay.im/')

      // 将 alipay/xbox 这样的链接转成 alipay_xbox
      var match = url.match(/http:\/\/git\.alipay\.im\/(.*?)\/[\d\.|master]+/)
      if (match && match.length == 2) {
        var m = match[1]
        url = url.replace(m, m.split('/').join('_'))
      }

      // http://git.alipay.im/overlay/0.9.9/blob?path=dist/overlay.js
      url = url.replace('dist', 'blob?path=dist')
    }

    return url
  })


  seajs.config({
    base: GITHUB_BASE,
    alias: {
      '$': 'jquery/1.7.2/jquery',
      '$-debug': 'jquery/1.7.2/jquery-debug',

      'jquery': 'jquery/1.7.2/jquery',
      'jquery-debug': 'jquery/1.7.2/jquery-debug',

      'zepto': 'https://a.alipayobjects.com/static/handy/zepto/0.9.0/zepto.js'

    },
    map: mapRules,
    preload: [
      'seajs/plugin-json',
      'seajs/plugin-text'
    ]
  })

  if (location.href.indexOf('examples') > 0 || location.href.indexOf('tests') > 0) {
    var aliasIsParsed = false
    var _use = seajs.use

    seajs.use = function(ids, callback) {
      _use('../package.json', function(data) {

        if (aliasIsParsed === false) {
          // 有可能存在 { '$': '$' } 配置，需排除掉
          data.dependencies && (delete data.dependencies['$'])
          data.devDependencies && (delete data.devDependencies['$'])

          seajs.config({ alias: data.dependencies })
          seajs.config({ alias: data.devDependencies })

          aliasIsParsed = true
          seajs.use = _use
        }

        _use(ids, callback)
      })
    }
  }

})()
