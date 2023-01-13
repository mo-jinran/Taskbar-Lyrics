"use strict";


const TaskbarLyricsApiPort = BETTERNCM_API_PORT + 1;


const work = (TaskbarLyricsApiPort) => {
    setInterval(() => {
        fetch(`http://127.0.0.1:${TaskbarLyricsApiPort}/taskbar/heartbeat`);
    }, 15000);
};
const workBlob = new Blob([`(${work.toString()})(${TaskbarLyricsApiPort})`]);
const workUrl = URL.createObjectURL(workBlob);
new Worker(workUrl);


const mutationObserver = new MutationObserver(mutations => {
    for (const mutation of mutations) {
        let basic = null;
        let extra = null;

        if (mutation.addedNodes[2]) {
            basic = mutation.addedNodes[0].firstChild.textContent;
            if (mutation.addedNodes[2].firstChild) {
                extra = mutation.addedNodes[2].firstChild.textContent;
            }
        } else {
            basic = mutation.addedNodes[0].textContent;
        }

        let params = `basic=${basic}`;
        if (extra) params = params.concat(`&extra=${extra}`);
        fetch(`http://127.0.0.1:${TaskbarLyricsApiPort}/taskbar/lyrics?${params}`);
    }
});

const mLyric = await betterncm.utils.waitForElement("#x-g-mn .m-lyric");
mutationObserver.observe(mLyric, { childList: true, subtree: true });



plugin.onLoad(async () => {
    let exePath = `"${loadedPlugins["Taskbar-Lyrics"].pluginPath}\\taskbar-lyrics.exe"`;
    await betterncm.app.exec(`${exePath} ${TaskbarLyricsApiPort}`, false, true);
});