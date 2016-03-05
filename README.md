# Twitter Image Archive
Downloads all images from Twitter Archive.
You can see attached image while you are offline.

## Usage
1. Download twitter archive.
2. Go to twitter settings -> Account -> Your Twitter archive.
3. `git clone https://github.com/if1live/twitter-image-archive.git`
4. `cd twitter-image-archive`
5. `npm install`
6. Unzip twitter archive into `archive`. `<project path>/index.js` and `<project_path>/archive/index.html` have to exist.
7. `npm start`. 
8. wait long time...
9. `npm install -g http-server` (for view)
10. `cd archive`
11. `http-server`

## Help
### Error: getaddrinfo ENOTFOUND pbs.twimg.com pbs.twimg.com:443
```
stream.js:74
      throw er; // Unhandled stream error in pipe.
      ^

Error: getaddrinfo ENOTFOUND pbs.twimg.com pbs.twimg.com:443
    at errnoException (dns.js:26:10)
    at GetAddrInfoReqWrap.onlookup [as oncomplete] (dns.js:77:26)
    at Function.module.exports.loopWhile (/private/tmp/twitter-ar/twitter-image-archive/node_modules/deasync/index.js:64:21)
    at Function.sleep (/private/tmp/twitter-ar/twitter-image-archive/node_modules/deasync/index.js:36:18)
    at downloadLinks (/private/tmp/twitter-ar/twitter-image-archive/index.js:213:13)
    at Object.<anonymous> (/private/tmp/twitter-ar/twitter-image-archive/index.js:222:1)
    at Module._compile (module.js:413:34)
    at Object.Module._extensions..js (module.js:422:10)
    at Module.load (module.js:357:32)
    at Function.Module._load (module.js:314:12)
```

if `Error: getaddrinfo ENOTFOUND pbs.twimg.com pbs.twimg.com:443` occur, execute `npm start` again.
