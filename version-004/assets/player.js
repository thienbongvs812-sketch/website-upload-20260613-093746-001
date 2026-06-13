(function () {
    var video = document.getElementById('moviePlayer');
    var cover = document.querySelector('[data-player-cover]');
    var message = document.querySelector('[data-player-message]');
    var hls = null;
    var attached = false;

    if (!video || !cover) {
        return;
    }

    function showMessage(text) {
        if (message) {
            message.textContent = text;
            message.classList.add('show');
        }
    }

    function attachSource() {
        if (attached) {
            return;
        }

        var source = video.getAttribute('data-src');

        if (!source) {
            showMessage('暂时无法播放，请稍后重试');
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            attached = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    showMessage('暂时无法播放，请稍后重试');
                }
            });
            attached = true;
            return;
        }

        showMessage('暂时无法播放，请稍后重试');
    }

    function beginPlay() {
        attachSource();
        cover.classList.add('is-hidden');
        var playResult = video.play();

        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
                cover.classList.remove('is-hidden');
            });
        }
    }

    cover.addEventListener('click', beginPlay);

    video.addEventListener('click', function () {
        if (video.paused) {
            beginPlay();
        }
    });

    video.addEventListener('play', function () {
        cover.classList.add('is-hidden');
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
})();
