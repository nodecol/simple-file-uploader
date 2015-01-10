var formidable = require('formidable')
  , mkdirp = require('mkdirp')
  , serveStatic = require('serve-static')
  , finalhandler = require('finalhandler')
  , http = require('http')
  , util = require('util')
  , fs = require('fs')
  , path = require('path')
  , options = {
    uploadDataFieldName: 'Filedata',
    uploadDir: __dirname + '/public/files',
    host: "http://localhost:3000",
    port: 3000
  };

fs.exists(options.uploadDir, function (exists) {
  if (!exists) {
    mkdirp(options.uploadDir, function (err) {
      if (err) {
        console.error(dir + ' does not exists. Please create the folder');
        process.exit(0);
      }
    });
  }
});

var serve = serveStatic('public');

http.createServer(function (req, res) {
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') { // 上传
    // parse a file upload
    var form = new formidable.IncomingForm();

    form.uploadDir = options.uploadDir;
    form.keepExtensions = true;

    form.parse(req, function (err, fields, files) {
      res.writeHead(200, {'content-type': 'application/json'});
      if (err) {
        return res.end(JSON.stringify({
          "error": 1,
          "msg": err
        }));
      }

      //console.log(files);
      var fileObj = files[options.uploadDataFieldName];
      if (!fileObj) {
        return res.end(JSON.stringify({
          "error": 2,
          "msg": 'no uploadData field name'
        }));
      }

      var fileName = path.basename(fileObj.path);
      res.end(JSON.stringify({
        "error": 0,
        "name": fileName,
        "type": fileObj.type,
        "url": options.host + '/files/' + fileName
      }));
    });
  } else if (/^\/files\S*/.test(req.url)) { // 请求已上传的文件
    var done = finalhandler(req, res);
    serve(req, res, done);
  } else {
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
      '<form action="/upload" enctype="multipart/form-data" method="post">'+
      '<input type="text" name="title"><br>'+
      '<input type="file" name="'+ options.uploadDataFieldName +'" multiple="multiple"><br>'+
      '<input type="submit" value="Upload">'+
      '</form>'
    );
  }
}).listen(options.port);