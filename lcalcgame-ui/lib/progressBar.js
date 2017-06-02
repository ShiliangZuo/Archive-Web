var __PROGRESS_BAR_INTERVAL = null;
function setProgressBar(barId, containerId, percentage) {
    var bar = document.getElementById(barId);
    var container = document.getElementById(containerId);
    var startTime = Date.now();
    var duration = 400;
    var initialWidth = $(bar).width();
    var deltaWidth = $(container).width() * percentage - initialWidth;

    if (__PROGRESS_BAR_INTERVAL) clearInterval(__PROGRESS_BAR_INTERVAL);

    var iv = setInterval(frame, 10);
    __PROGRESS_BAR_INTERVAL = iv;

    function frame() {
        var elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
            bar.style.width = (initialWidth + deltaWidth) + 'px';
            clearInterval(iv);
        } else {
            bar.style.width = (initialWidth + deltaWidth * Math.pow(elapsed / duration, 2)) + 'px';
        }
    }
}
function setProgressBarColor(barId, color) {
    var bar = document.getElementById(barId);
    bar.style['background-color'] = color;
}
