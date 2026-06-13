(function () {
  var scriptElement = document.currentScript;
  var hlsModuleUrl = scriptElement ? new URL('hls-vendor-dru42stk.js', scriptElement.src).href : './assets/hls-vendor-dru42stk.js';

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.querySelector('[data-player-overlay]');
    var prepared = false;
    var preparing = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function attachNative() {
      video.src = streamUrl;
      prepared = true;
    }

    function attachHls(Hls) {
      if (Hls && Hls.isSupported && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        prepared = true;
      } else {
        attachNative();
      }
    }

    function prepare() {
      if (prepared || preparing) {
        return Promise.resolve();
      }
      preparing = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        attachNative();
        preparing = false;
        return Promise.resolve();
      }
      return import(hlsModuleUrl).then(function (module) {
        attachHls(module.H);
        preparing = false;
      }).catch(function () {
        attachNative();
        preparing = false;
      });
    }

    function startPlayback() {
      prepare().then(function () {
        video.controls = true;
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  };
})();
