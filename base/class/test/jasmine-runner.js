seajs.use(['../package.json', 'jasmine/1.1.0/jasmine-html', './jasmine-jquery.js'], function(meta) {

  var jasmineEnv = getJasmineEnv()

  // jasmine-jquery 配置
  jasmine.getFixtures().fixturesPath = 'fixtures'

  // 让 Jasmine 从文艺青年变成普通青年
  this.test = it
  this.xtest = xit

  // Go
  runSpecs()


  function getJasmineEnv() {
    var env = jasmine.getEnv()
    env.updateInterval = 1000

    var trivialReporter = new jasmine.TrivialReporter()
    env.addReporter(trivialReporter)

    env.specFilter = function(spec) {
      return trivialReporter.specFilter(spec)
    }
    return env
  }


  function runSpecs() {
    var tests = meta['tests'] || []

    // Get the default test from path: path/to/xxx/tests/runner.html
    if (tests.length === 0) {
      tests.push(location.href.replace(/.+\/([\w-]+)\/tests\/runner.+/, '$1'))
    }

    var specs = []
    for (var i = 0; i < tests.length; i++) {
      specs[i] = './' + tests[i] + '-spec.js'
    }

    seajs.use(specs, function() {
      jasmineEnv.execute()
    })
  }

})
