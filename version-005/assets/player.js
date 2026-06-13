(function () {
  var source = window.moviePlaybackUrl;
  var video = document.querySelector("[data-video-player]");
  var layer = document.querySelector("[data-play-layer]");
  var wrap = document.querySelector("[data-player-wrap]");
  var attached = false;
  var hlsInstance = null;

  function attachStream() {
    if (!video || !source || attached) {
      return;
    }
    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 36,
        backBufferLength: 24
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function playMovie() {
    if (!video) {
      return;
    }
    attachStream();
    if (wrap) {
      wrap.classList.add("is-playing");
    }
    var playRequest = video.play();
    if (playRequest && typeof playRequest.catch === "function") {
      playRequest.catch(function () {});
    }
  }

  if (layer) {
    layer.addEventListener("click", playMovie);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        playMovie();
      }
    });
    video.addEventListener("play", function () {
      if (wrap) {
        wrap.classList.add("is-playing");
      }
    });
    video.addEventListener("pause", function () {
      if (wrap && video.currentTime === 0) {
        wrap.classList.remove("is-playing");
      }
    });
  }
})();
