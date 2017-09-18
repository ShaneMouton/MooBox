var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = '/Users/ismouton/Desktop/em-dosbox/src/module/module.data';
    var REMOTE_PACKAGE_BASE = 'module/module.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);

    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;

    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onerror = function(event) {
        throw new Error("NetworkError for: " + packageName);
      }
      xhr.onload = function(event) {
        if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
          var packageData = xhr.response;
          callback(packageData);
        } else {
          throw new Error(xhr.statusText + " : " + xhr.responseURL);
        }
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };

      var fetchedCallback = null;
      var fetched = Module['getPreloadedPackage'] ? Module['getPreloadedPackage'](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;

      if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);

  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      }
    };

        var files = metadata.files;
        for (var i = 0; i < files.length; ++i) {
          new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
        }


    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;

        // Reuse the bytearray from the XHR as the source for file reads.
        DataRequest.prototype.byteArray = byteArray;

          var files = metadata.files;
          for (var i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
              Module['removeRunDependency']('datafile_/Users/ismouton/Desktop/em-dosbox/src/module/module.data');

    };
    Module['addRunDependency']('datafile_/Users/ismouton/Desktop/em-dosbox/src/module/module.data');

    if (!Module.preloadResults) Module.preloadResults = {};

      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }

  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }

 loadPackage({"files": [{"audio": 0, "start": 0, "crunched": 0, "end": 9407, "filename": "/CDUNGEON.DAT"}, {"audio": 0, "start": 9407, "crunched": 0, "end": 22296, "filename": "/CPALACE.DAT"}, {"audio": 0, "start": 22296, "crunched": 0, "end": 22351, "filename": "/DESKTOPD.CFG"}, {"audio": 0, "start": 22351, "crunched": 0, "end": 70896, "filename": "/DIGISND1.DAT"}, {"audio": 0, "start": 70896, "crunched": 0, "end": 100039, "filename": "/DIGISND2.DAT"}, {"audio": 0, "start": 100039, "crunched": 0, "end": 131039, "filename": "/DIGISND3.DAT"}, {"audio": 0, "start": 131039, "crunched": 0, "end": 141204, "filename": "/EDUNGEON.DAT"}, {"audio": 0, "start": 141204, "crunched": 0, "end": 155080, "filename": "/EPALACE.DAT"}, {"audio": 0, "start": 155080, "crunched": 0, "end": 161601, "filename": "/FAT.DAT"}, {"audio": 0, "start": 161601, "crunched": 0, "end": 168551, "filename": "/GUARD.DAT"}, {"audio": 0, "start": 168551, "crunched": 0, "end": 168668, "filename": "/GUARD1.DAT"}, {"audio": 0, "start": 168668, "crunched": 0, "end": 168785, "filename": "/GUARD2.DAT"}, {"audio": 0, "start": 168785, "crunched": 0, "end": 172469, "filename": "/IBM_SND1.DAT"}, {"audio": 0, "start": 172469, "crunched": 0, "end": 176253, "filename": "/IBM_SND2.DAT"}, {"audio": 0, "start": 176253, "crunched": 0, "end": 187734, "filename": "/INSTALL.EXE"}, {"audio": 0, "start": 187734, "crunched": 0, "end": 191967, "filename": "/INSTALL.PDM"}, {"audio": 0, "start": 191967, "crunched": 0, "end": 229116, "filename": "/KID.DAT"}, {"audio": 0, "start": 229116, "crunched": 0, "end": 266147, "filename": "/LEVELS.DAT"}, {"audio": 0, "start": 266147, "crunched": 0, "end": 275515, "filename": "/MIDISND1.DAT"}, {"audio": 0, "start": 275515, "crunched": 0, "end": 293923, "filename": "/MIDISND2.DAT"}, {"audio": 0, "start": 293923, "crunched": 0, "end": 297201, "filename": "/PRINCE.DAT"}, {"audio": 0, "start": 297201, "crunched": 0, "end": 420536, "filename": "/PRINCE.EXE"}, {"audio": 0, "start": 420536, "crunched": 0, "end": 446365, "filename": "/PV.DAT"}, {"audio": 0, "start": 446365, "crunched": 0, "end": 451080, "filename": "/SHADOW.DAT"}, {"audio": 0, "start": 451080, "crunched": 0, "end": 454944, "filename": "/SKEL.DAT"}, {"audio": 0, "start": 454944, "crunched": 0, "end": 491669, "filename": "/TITLE.DAT"}, {"audio": 0, "start": 491669, "crunched": 0, "end": 505889, "filename": "/VDUNGEON.DAT"}, {"audio": 0, "start": 505889, "crunched": 0, "end": 512000, "filename": "/VIZIER.DAT"}, {"audio": 0, "start": 512000, "crunched": 0, "end": 526226, "filename": "/VPALACE.DAT"}, {"audio": 0, "start": 526226, "crunched": 0, "end": 526448, "filename": "/file_id.diz"}], "remote_package_size": 526448, "package_uuid": "ec5e92d4-9cab-46ef-b33f-83863cb388c9"});

})();

Module['onRuntimeInitialized'] = main;

//Module['arguments'] = [ './PRINCE.EXE' ];
Module['arguments'] = [ '' ];
