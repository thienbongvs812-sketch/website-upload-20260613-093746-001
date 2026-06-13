(function (global) {
    function initMoviePlayer(playbackUrl) {
        var video = document.getElementById("movie-player");
        var cover = document.querySelector("[data-play-button]");
        var hlsInstance = null;
        var bound = false;

        if (!video || !playbackUrl) {
            return;
        }

        function attemptPlay() {
            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        function bindPlayer() {
            if (bound) {
                return;
            }

            bound = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = playbackUrl;
                return;
            }

            if (global.Hls && global.Hls.isSupported()) {
                hlsInstance = new global.Hls({
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(playbackUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(global.Hls.Events.MANIFEST_PARSED, function () {
                    attemptPlay();
                });
                return;
            }

            video.src = playbackUrl;
        }

        function startPlayer() {
            bindPlayer();

            if (cover) {
                cover.classList.add("is-hidden");
            }

            attemptPlay();
        }

        if (cover) {
            cover.addEventListener("click", startPlayer);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayer();
            }
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    global.initMoviePlayer = initMoviePlayer;
})(window);
