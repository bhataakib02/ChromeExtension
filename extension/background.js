/**
 * =====================================================
 * PRODUCTIVITY PLATFORM - BACKGROUND SERVICE WORKER (V3)
 * =====================================================
 * Handles standalone local time tracking and auth-less syncing.
 * =====================================================
 */

const API_URL = "http://localhost:5010/api";
let activeTab = null;
let activeTitle = "";
let startTime = null;
let lastSaveTime = null;

// Initialization guard
let initialized = false;
const initPromise = init();

// ==================== HEARTBEAT ====================

async function heartbeat() {
    if (activeTab && startTime) {
        const now = Date.now();
        const start = lastSaveTime || startTime;
        const elapsed = (now - start) / 1000;

        if (elapsed >= 5) { // Save every 5 seconds
            await saveSession(activeTab, Math.floor(elapsed), activeTitle);
            lastSaveTime = now;
            chrome.storage.local.set({ lastSaveTime });
        }
    }
}

// ==================== CORE TRACKING ====================

function isTrackable(url) {
    if (!url) return false;
    try {
        const u = new URL(url);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

async function saveSession(website, timeSeconds, pageTitle = "") {
    if (!website || timeSeconds <= 0) return;

    // 1. Save to local storage for the extension's popup
    try {
        const data = await chrome.storage.local.get(["siteTimes"]);
        const siteTimes = data.siteTimes || {};
        siteTimes[website] = (siteTimes[website] || 0) + timeSeconds;
        await chrome.storage.local.set({ siteTimes });
    } catch (err) {
        console.error("❌ Local Tracking error:", err);
    }

    // 2. Sync to backend (now completely auth-less, will bind to default user)
    try {
        await fetch(`${API_URL}/tracking`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ website, time: timeSeconds, pageTitle })
        });
    } catch (err) {
        // Silent fail on backend sync if port 5010 isn't running
    }
}

async function handleTabSwitch(url, title = "") {
    await initPromise; // Ensure we have loaded state

    // If it's the same hostname and title, skip redundant calls
    if (activeTab && url.includes(activeTab) && title === activeTitle) {
        return;
    }

    // Save previous session
    if (activeTab && startTime) {
        const start = lastSaveTime || startTime;
        const elapsed = (Date.now() - start) / 1000;
        await saveSession(activeTab, Math.floor(elapsed), activeTitle);
    }

    lastSaveTime = null;
    chrome.storage.local.remove("lastSaveTime");

    if (!isTrackable(url)) {
        activeTab = null;
        activeTitle = "";
        startTime = null;
        chrome.storage.local.remove(["activeTab", "activeTitle", "startTime"]);
        return;
    }

    activeTab = new URL(url).hostname;
    activeTitle = title || "";
    startTime = Date.now();

    // Persist state for recovery
    chrome.storage.local.set({ activeTab, activeTitle, startTime });
}

// ==================== ALARMS & EVENTS ====================

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "heartbeat") {
        heartbeat();
    }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (tab && tab.url) handleTabSwitch(tab.url, tab.title);
    } catch (err) { }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active && tab.url) {
        handleTabSwitch(tab.url, tab.title);
    }
});

// Save session when browser window is closed
chrome.windows.onRemoved.addListener(async () => {
    if (activeTab && startTime) {
        const start = lastSaveTime || startTime;
        const elapsed = (Date.now() - start) / 1000;
        await saveSession(activeTab, Math.floor(elapsed), activeTitle);
        activeTab = null;
        startTime = null;
        lastSaveTime = null;
        chrome.storage.local.remove(["activeTab", "activeTitle", "startTime", "lastSaveTime"]);
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "resetTracking") {
        startTime = Date.now();
        lastSaveTime = null;
        chrome.storage.local.set({ startTime, lastSaveTime: null });
        sendResponse({ success: true });
    }
});

// ==================== INIT ====================

async function init() {
    const storage = await chrome.storage.local.get(["activeTab", "activeTitle", "startTime", "lastSaveTime"]);

    if (storage.activeTab && storage.startTime) {
        activeTab = storage.activeTab;
        activeTitle = storage.activeTitle || "";
        startTime = storage.startTime;
        lastSaveTime = storage.lastSaveTime || null;
    }

    // Use Alarms for periodic save
    chrome.alarms.create("heartbeat", { periodInMinutes: 0.1 }); // Every 6 seconds approx
    initialized = true;
}
