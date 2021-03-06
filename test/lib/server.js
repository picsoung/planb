var stdout = require('test-console').stdout
var nock = require('nock')
var fs = require('fs')
var request = require('request')

var server = require('../../lib/server.js')
var manager = require('../../lib/manager.js')
var utils = require('../../lib/storage/utils')

describe('server', function(){
  afterEach(cleanup)

  before(function() {
    nock.enableNetConnect()
  })

  after(function() {
    nock.disableNetConnect()
  })

  context('no endpoints', function() {
    it('outputs a warning', function(done) {
      var inspect = stdout.inspect()

      server(function() {
        inspect.restore()
        assert.deepEqual(inspect.output, [ "add an endpoint first\n"])
        done()
      })

    })
  })

  context('has endpoints', function() {
    var endpoint0 = 'http://www.test.com/api/path'
    var endpoint1 = 'http://www.test.com/api/other'

    afterEach(server.close)

    beforeEach(function (done) {
      var inspect = stdout.inspect()
      manager.add(endpoint0, function() {
        inspect.restore()
        done()
      })
    })

    beforeEach(function (done) {
      var inspect = stdout.inspect()
      manager.add(endpoint1, function() {
        inspect.restore()
        done()
      })
    })

    beforeEach(function (done) {
      var name = 'www.test.com:api:path/'
      var path = utils.dataPath + name + '0'
      var data = '{"version":"0.0"}'

      fs.writeFile(path, data, function() {
        path = utils.dataPath + name + '1'
        data = '{"version":"0.1"}'
        fs.writeFile(path, data, function() {
          done()
        })
      })
    })

    beforeEach(function (done) {
      var name = 'www.test.com:api:other/'
      var path = utils.dataPath + name + '0'
      var data = '{"version":"1.0"}'

      fs.writeFile(path, data, function() {
        path = utils.dataPath + name + '1'
        data = '{"version":"1.1"}'
        fs.writeFile(path, data, function() {
          done()
        })
      })
    })

    it('serves latest endpoint versions', function(done) {
      var inspect = stdout.inspect()

      server(function(err) {
        assert.notOk(err)

        var url = 'http://localhost:5555/'
        request(url + 'api/path', function (error, response, body) {
          assert.equal(body, '{"version":"0.1"}')

          request(url + 'api/other', function (error, response, body) {
            inspect.restore()
            assert.equal(body, '{"version":"1.1"}')
            done()
          })
        })

      })
    })
  })

  context('has endpoints with a query string', function() {
    var endpoint0 = 'http://www.test.com/api?name=first&type=test'
    var endpoint1 = 'http://www.test.com/api?name=second&type=test'

    afterEach(server.close)

    beforeEach(function (done) {
      var inspect = stdout.inspect()
      manager.add(endpoint0, function() {
        inspect.restore()
        done()
      })
    })

    beforeEach(function (done) {
      var inspect = stdout.inspect()
      manager.add(endpoint1, function(err) {
        inspect.restore()
        done()
      })
    })

    beforeEach(function (done) {
      var name = 'www.test.com:api?name=first&type=test'
      var path = utils.dataPath + name + '/0'
      var data = '{"version":"0.0"}'

      fs.writeFile(path, data, function() {
        path = utils.dataPath + name + '/1'
        data = '{"version":"0.1"}'
        fs.writeFile(path, data, function() {
          done()
        })
      })
    })

    beforeEach(function (done) {
      var name = 'www.test.com:api?name=second&type=test'
      var path = utils.dataPath + name + '/0'
      var data = '{"version":"1.0"}'

      fs.writeFile(path, data, function() {
        path = utils.dataPath + name + '/1'
        data = '{"version":"1.1"}'
        fs.writeFile(path, data, function() {
          done()
        })
      })
    })

    it('serves endpoint versions with exact query params', function(done) {
      var inspect = stdout.inspect()

      server(function(err) {
        assert.notOk(err)

        var url = 'http://localhost:5555/'
        request(url + 'api?name=first&type=test', function (error, response, body) {
          assert.equal(body, '{"version":"0.1"}')

          request(url + 'api?name=second&type=test', function (error, response, body) {
            inspect.restore()
            assert.equal(body, '{"version":"1.1"}')
            done()
          })
        })

      })
    })
  })
})
