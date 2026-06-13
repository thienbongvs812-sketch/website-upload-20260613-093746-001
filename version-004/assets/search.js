(function () {
    var input = document.getElementById('siteSearchInput');
    var button = document.getElementById('siteSearchButton');
    var results = document.getElementById('searchResults');
    var tips = document.getElementById('searchTips');
    var data = window.SEARCH_MOVIES || [];

    if (!input || !button || !results) {
        return;
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function renderCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '    <a class="movie-cover" href="' + escapeHtml(movie.url) + '">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="cover-shade"></span>',
            '        <span class="card-category">' + escapeHtml(movie.category) + '</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
            '        <p class="movie-line">' + escapeHtml(movie.oneLine || movie.summary || '') + '</p>',
            '        <div class="tag-row">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function movieText(movie) {
        return [
            movie.title,
            movie.year,
            movie.region,
            movie.type,
            movie.genre,
            movie.category,
            (movie.tags || []).join(' '),
            movie.oneLine,
            movie.summary
        ].join(' ').toLowerCase();
    }

    function search() {
        var keyword = input.value.trim().toLowerCase();
        var list = keyword ? data.filter(function (movie) {
            return movieText(movie).indexOf(keyword) !== -1;
        }) : [];

        results.innerHTML = list.slice(0, 120).map(renderCard).join('');

        if (tips) {
            if (!keyword) {
                tips.textContent = '请输入关键词或使用顶部搜索框进入结果页。';
            } else if (list.length) {
                tips.textContent = '找到 ' + list.length + ' 个结果，当前显示前 ' + Math.min(120, list.length) + ' 个。';
            } else {
                tips.textContent = '未找到相关内容，请尝试其他关键词。';
            }
        }
    }

    function applyQuery() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query) {
            input.value = query;
        }
        search();
    }

    button.addEventListener('click', search);
    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            search();
        }
    });

    applyQuery();
})();
