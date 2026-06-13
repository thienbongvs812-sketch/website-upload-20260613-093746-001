import { H as Hls } from "./hls-vendor-dru42stk.js";

document.addEventListener("DOMContentLoaded", function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (shell) {
    var video = shell.querySelector("video[data-video-src]");
    var trigger = shell.querySelector("[data-play-trigger]");
    var status = shell.querySelector("[data-player-status]");

    if (!video || !trigger) {
      return;
    }

    var source = video.getAttribute("data-video-src");
    var hlsInstance = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function initialize() {
      if (initialized) {
        return Promise.resolve();
      }

      initialized = true;
      setStatus("正在加载播放源...");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus("已使用浏览器原生 HLS 播放。");
        return Promise.resolve();
      }

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          setStatus("HLS 播放源已就绪。");
        });

        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("播放源加载失败，请刷新页面重试。");
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
          }
        });

        return Promise.resolve();
      }

      setStatus("当前浏览器不支持 HLS 播放。建议使用 Chrome、Edge、Safari。");
      return Promise.reject(new Error("HLS is not supported"));
    }

    trigger.addEventListener("click", function () {
      initialize()
        .then(function () {
          trigger.classList.add("is-hidden");
          return video.play();
        })
        .then(function () {
          setStatus("正在播放");
        })
        .catch(function () {
          trigger.classList.remove("is-hidden");
        });
    });

    video.addEventListener("play", function () {
      trigger.classList.add("is-hidden");
      setStatus("正在播放");
    });

    video.addEventListener("pause", function () {
      setStatus("已暂停");
    });
  });
});
