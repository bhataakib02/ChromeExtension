document.addEventListener("DOMContentLoaded", () => {
    const siteList = document.getElementById("siteList");
    const dashboardBtn = document.getElementById("dashboardBtn");
    const clearDataBtn = document.getElementById("clearDataBtn");

    function formatTime(seconds) {
        if (seconds < 60) return `${Math.floor(seconds)}s`;
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        if (m < 60) return `${m}m ${s}s`;
        const h = Math.floor(m / 60);
        const mRemaining = m % 60;
        return `${h}h ${mRemaining}m`;
    }

    function updateUI() {
        chrome.storage.local.get(["siteTimes", "activeTab", "startTime", "lastSaveTime"], (data) => {
            let times = data.siteTimes || {};

            // Preview the running time for the current active tab
            if (data.activeTab && data.startTime) {
                const start = data.lastSaveTime || data.startTime;
                const elapsed = (Date.now() - start) / 1000;
                times[data.activeTab] = (times[data.activeTab] || 0) + elapsed;
            }

            siteList.innerHTML = "";
            const sortedSites = Object.entries(times).sort((a, b) => b[1] - a[1]);

            if (sortedSites.length === 0) {
                const li = document.createElement("li");
                li.style.padding = "16px";
                li.style.textAlign = "center";
                li.style.color = "var(--text-dim)";
                li.textContent = "No data yet.";
                siteList.appendChild(li);
                return;
            }

            sortedSites.forEach(([domain, seconds]) => {
                if (seconds < 1) return;
                const li = document.createElement("li");
                li.className = "site-item";

                const img = document.createElement("img");
                img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
                img.alt = domain;

                const spanDomain = document.createElement("span");
                spanDomain.className = "site-domain";
                spanDomain.textContent = domain;

                const spanTime = document.createElement("span");
                spanTime.className = "site-time";
                spanTime.textContent = formatTime(seconds);

                li.appendChild(img);
                li.appendChild(spanDomain);
                li.appendChild(spanTime);
                siteList.appendChild(li);
            });
        });
    }

    updateUI();
    setInterval(updateUI, 1000);

    dashboardBtn.addEventListener("click", () => {
        chrome.tabs.create({ url: "http://localhost:3000" });
    });

    clearDataBtn.addEventListener("click", () => {
        chrome.storage.local.set({ siteTimes: {} }, () => {
            chrome.runtime.sendMessage({ action: "resetTracking" });
            updateUI();
        });
    });
});
