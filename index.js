var glob = require("glob");
var _ = require("underscore");
var path = require("path");
var fs = require("fs");
var url = require("url");
var mkdirp = require("mkdirp");
var request = require("request");
var async = require("async");
var deasync = require("deasync");
var Tweet = require("./tweet").Tweet;

function extractAllExternalImageUrls() {
  var links = [];
  var sync = true;

  glob("./archive/data/js/tweets/*", {}, function(err, files) {
    var files = _.filter(files, function(elem) {
      var filename = path.basename(elem);
      var patt = /\d{4}_\d{2}.js$/;
      return patt.test(filename)
    });

    for(var i = 0 ; i < files.length ; i++) {
      links = links.concat(extractExternalImageUrls(files[i]));
    }
    sync = false;
  });

  while(sync) {
    deasync.sleep(100);
  }
  return links;
}

function readTweetDataStr(filename) {
  var text = fs.readFileSync(filename, "utf8");
  var lines = text.split("\n");

  // first line
  // Grailbird.data.tweets_2010_12 =
  var head = lines[0];
  var body = lines.slice(1, lines.length).join("\n");
  return {
    head: head,
    body: body
  };
}

function readTweetData(filename) {
  var data = readTweetDataStr(filename);
  return JSON.parse(data.body);
}

function extractExternalImageUrls(filename) {
  function extractUrls(data) {
    var tw = new Tweet(data);
    return tw.getAllLinks();
  }

  var jsonData = readTweetData(filename);
  var links = _.map(jsonData, function(elem) {
    return extractUrls(elem);
  });
  links = _.flatten(links);
  links = _.uniq(links);

  links = _.select(links, function(link) {
    return (link.startsWith("http://") || link.startsWith("https://"));
  });
  return links;
}

function modifyAllExternalLinks() {
  var sync = true;

  glob("./archive/data/js/tweets/*", {}, function(err, files) {
    var files = _.filter(files, function(elem) {
      var filename = path.basename(elem);
      var patt = /\d{4}_\d{2}.js$/;
      return patt.test(filename)
    });

    async.each(files, function(file, callback) {
      console.log(file);
      modifyExternalLinks(file);
      callback();
    }, function done() {
      sync = false;
    });
  });

  while(sync) {
    deasync.sleep(100);
  }
  return true;
}

function modifyExternalLinks(filename) {
  var data = readTweetDataStr(filename);
  // backup original file
  fs.writeFileSync(filename + ".bak", data.head + "\n" + data.body);

  var body = data.body;
  var jsonData = JSON.parse(body);
  var links = _.map(jsonData, function(data) {
    var tw = new Tweet(data);
    return tw.getAllLinks();
  })
  links = _.flatten(links);

  var lines = [data.head];
  lines = lines.concat(data.body.split("\n"));

  var urlLineIndices = [];
  var schemas = ["http://", "https://"];

  var patterns = _.map(schemas, function(schema) {
    return new RegExp(schema.replace("//", "\\\\/\\\\"), 'g')
  });

  _.each(patterns, function(re) {
    _.each(lines, function(line, idx) {
      if(re.test(line)) {
        urlLineIndices.push(idx);
      }
    });
  });

  var tw = new Tweet();
  for(var i = 0 ; i < urlLineIndices.length ; i++) {
    var idx = urlLineIndices[i];
    lines[idx] = tw.sanitizeUrl(lines[idx]);
  }

  var content = lines.join("\n");
  //fs.writeFileSync("/tmp/test", content);
  fs.writeFileSync(filename, content);
}


function downloadLinks(links) {
  var sync = true;
  var total = links.length;
  var curr = 0;
  async.eachLimit(links, 5, function(uri, callback) {
    curr += 1;
    var currMsg = `${curr} / ${total} : `;

    var urlinfo = url.parse(uri);
    var filename = path.basename(uri);
    var dirname = path.join(
      "archive",
      "cache",
      urlinfo.hostname,
      path.dirname(urlinfo.pathname)
    );

    mkdirp(dirname, function(err) {
      if(err) {
        console.error(err);
        callback();
        return;
      }

      var filepath = path.join(dirname, filename);

      try {
        var stats = fs.lstatSync(filepath);
        if(stats.size == 0) {
          console.log(currMsg + `empty file? : ${filepath}`);
          throw("empty-file");
        }
        //console.log(currMsg + `use previous : ${filepath}`);
        callback();

      } catch(e) {
        //console.log(currMsg + `request : ${uri}`);

        request.get(uri, function(error, response, body) {
          if(!error && response.statusCode === 200) {
            var r = request(uri).pipe(fs.createWriteStream(filepath));

            console.log(currMsg + `download : ${uri}`);
            callback();

          } else if(response) {
            if(response.statusCode === 404) {
              console.log(currMsg + `404 not found : ${uri}`);
              callback();

            } else if(response.statusCode === 403) {
              console.log(currMsg + `403 forbidden : ${uri}`);
              callback();

            } else {
              console.error(currMsg + `${response.statusCode} : ${uri}`);
              callback();
            }
          } else {
            console.error(currMsg + "unknown error : " + uri);
          }
        });
      }
    })
  }, function(err) {
    if(err) {
      console.error(err);
    }
    sync = false;
  });

  while(sync) {
    deasync.sleep(100);
  }
  return links;
}

//var filename = "./archive/data/js/tweets/2016_02.js";
//var links = extractExternalImageUrls(filename);

var links = extractAllExternalImageUrls();
downloadLinks(links);

//var filename = "./archive/data/js/tweets/2016_02.js";
//modifyExternalLinks(filename);
modifyAllExternalLinks();
