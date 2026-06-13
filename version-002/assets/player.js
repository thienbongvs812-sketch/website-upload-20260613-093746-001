(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function attachVideo(video, url) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            return;
        }
        video.src = url;
    }

    function setupPlayer(container) {
        var video = container.querySelector("[data-player-video]");
        var url = container.getAttribute("data-stream");
        var started = false;
        if (!video || !url) {
            return;
        }

        function start() {
            if (!started) {
                attachVideo(video, url);
                started = true;
            }
            container.classList.add("is-playing");
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {});
            }
        }

        container.querySelectorAll("[data-play]").forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                start();
            });
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
    }

    ready(function () {
        document.querySelectorAll("[data-player]").forEach(setupPlayer);
    });
})();
