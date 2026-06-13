function initMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var cover = document.getElementById(config.coverId);
    var button = document.getElementById(config.buttonId);
    var loaded = false;
    var hlsInstance = null;

    if (!video || !config.url) {
        return;
    }

    function attachVideo() {
        if (loaded) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = config.url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(config.url);
            hlsInstance.attachMedia(video);
        } else {
            video.src = config.url;
        }

        loaded = true;
    }

    function startPlay() {
        attachVideo();

        if (cover) {
            cover.classList.add('is-hidden');
        }

        video.controls = true;

        var result = video.play();

        if (result && typeof result.catch === 'function') {
            result.catch(function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    }

    if (cover) {
        cover.addEventListener('click', startPlay);
    }

    if (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            startPlay();
        });
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlay();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
