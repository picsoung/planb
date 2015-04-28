var fs = require('fs')
var path = require('path')
var package = require('../../package')

var name = package.name

var configName = '.' + name + '.json'
var dataDirName = '.' + name + '.d'

if (process.env.NODE_ENV === 'test') {
  configName = configName + '.test'
  dataDirName = dataDirName + '.test'
}

var defaultConfigData = {
  endpoints: []
}

function getProjectRoot(cb, dots) {
  dots = dots || '.'

  var currentPath = path.join(process.cwd(), dots)
  var projectPath = currentPath + '/' + dataDirName

  fs.stat(projectPath, function(err, stat) {
    if (err) {
      if (currentPath === '/') {
        cb(null)
      } else {
        if (dots === '.') {
          dots = '..'
        } else {
          dots = dots + '/..'
        }

        getProjectRoot(cb, dots)
      }
    } else {
      cb(currentPath)
    }
  })
}

function init(cb) {
  fs.mkdir(process.cwd() + '/' + dataDirName, function(err) {
    if (err) { cb(err); return }

    var configPath = process.cwd() + '/' + configName

    fs.writeFile(configPath, defaultConfigData, function(err) {
      if (err) { cb(err); return }

      cb()
    })
  })
}

module.exports = {
  dataDirName: dataDirName,
  configName: configName,
  getProjectRoot: getProjectRoot,
  init: init
}
