/**
 * AERO PRODUCTIVITY - POPUP LOGIC
 */

const API_URL = "http://localhost:5010/api";

document.addEventListener("DOMContentLoaded", async () => {
    // ==================== UI ELEMENTS ====================
    // Auth Elements
    const authView = document.getElementById("auth-view");
    const mainView = document.getElementById("main-view");
    const tabLogin = document.getElementById("tabLogin");
    const tabRegister = document.getElementById("tabRegister");
    const authForm = document.getElementById("authForm");
    const nameFieldToggle = document.getElementById("nameFieldToggle");
    const authName = document.getElementById("authName");
    const authEmail = document.getElementById("authEmail");
    const authPassword = document.getElementById("authPassword");
    const authError = document.getElementById("authError");
    const authSubmitBtn = document.getElementById("authSubmitBtn");

    // Main Elements
    const scoreVal = document.getElementById("scoreValue");
    const currentSite = document.getElementById("currentSite");
    const elapsedTime = document.getElementById("elapsedTime");
    const focusToggle = document.getElementById("focusModeToggle");
    const pomoBtn = document.getElementById("pomoBtn");
    const pomoTimer = document.getElementById("pomoTimer");
    const scoreMeter = document.querySelector(".meter");
    const dashboardBtn = document.getElementById("dashboardBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const settingsBtn = document.getElementById("settingsBtn");

    // ==================== AUTH ROUTING & LOGIC ====================
    let isLoginMode = true;

    function checkAuth() {
        chrome.storage.local.get(["accessToken"], (data) => {
            if (data.accessToken) {
                authView.style.display = "none";
                mainView.style.display = "flex";

                // Immediately display cached UI, but trigger a background sync for fresh preferences
                updateUI();
                chrome.runtime.sendMessage({ action: "syncAll" }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.warn("Could not sync with background:", chrome.runtime.lastError.message);
                    } else {
                        // After fresh data is pulled into local storage, update UI again
                        updateUI();
                    }
                });
            } else {
                mainView.style.display = "none";
                authView.style.display = "flex";
            }
        });
    }

    tabLogin.addEventListener("click", () => {
        isLoginMode = true;
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        nameFieldToggle.style.display = "none";
        authSubmitBtn.textContent = "LOGIN";
        authError.textContent = "";
    });

    tabRegister.addEventListener("click", () => {
        isLoginMode = false;
        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");
        nameFieldToggle.style.display = "flex";
        authSubmitBtn.textContent = "REGISTER";
        authError.textContent = "";
    });

    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        authError.textContent = "";
        authSubmitBtn.disabled = true;
        authSubmitBtn.textContent = "PLEASE WAIT...";

        const endpoint = isLoginMode ? "/auth/login" : "/auth/register";
        const payload = {
            email: authEmail.value,
            password: authPassword.value
        };

        if (!isLoginMode) {
            payload.name = authName.value;
        }

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            let data = {};
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error(res.ok ? "Invalid server response" : (text || "Server error"));
            }

            if (!res.ok) {
                throw new Error(data.error || "Authentication failed");
            }

            // Save token and init background sync
            chrome.storage.local.set({ accessToken: data.accessToken }, () => {
                chrome.runtime.sendMessage({ action: "syncAll" });
                checkAuth();
            });
        } catch (err) {
            authError.textContent = err.message;
        } finally {
            authSubmitBtn.disabled = false;
            authSubmitBtn.textContent = isLoginMode ? "LOGIN" : "REGISTER";
        }
    });

    logoutBtn.addEventListener("click", () => {
        chrome.storage.local.remove(["accessToken"], () => {
            checkAuth();
        });
    });

    settingsBtn.addEventListener("click", () => {
        chrome.tabs.create({ url: "http://localhost:3000/settings" });
    });

    // Check auth on load
    checkAuth();

    // ==================== MAIN DASHBOARD LOGIC ====================

    function updateUI() {
        chrome.storage.local.get(
            ["activeTab", "startTime", "productivityScore", "focusModeEnabled", "deepWorkActive", "deepWorkEndTime", "preferences"],
            (data) => {
                // Update Current Site
                if (data.activeTab) {
                    currentSite.textContent = data.activeTab;
                    updateElapsedTime(data.startTime);
                } else {
                    currentSite.textContent = "Not Tracking";
                    elapsedTime.textContent = "00:00:00";
                }

                // Update Score
                const score = data.productivityScore || 0;
                scoreVal.textContent = score;
                const offset = 283 - (283 * score) / 100;
                scoreMeter.style.strokeDashoffset = offset;

                // Update Focus Mode
                if (focusToggle) {
                    focusToggle.checked = !!data.focusModeEnabled;
                }

                // Update Deep Work
                if (data.deepWorkActive) {
                    pomoBtn.textContent = "STOP";
                    pomoBtn.classList.add("danger");
                    startPomoUIUpdate(data.deepWorkEndTime);
                } else {
                    pomoBtn.textContent = "START";
                    pomoBtn.classList.remove("danger");

                    const prefs = data.preferences || {};
                    const deepWorkMins = prefs.deepWorkMinutes || 25;
                    pomoTimer.textContent = `${deepWorkMins}:00`;
                }
            }
        );
    }

    function updateElapsedTime(startTime) {
        if (!startTime) return;
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        elapsedTime.textContent = `${h}:${m}:${s}`;
    }

    // ==================== EVENT LISTENERS ====================

    if (focusToggle) {
        focusToggle.addEventListener("change", (e) => {
            const enabled = e.target.checked;
            chrome.storage.local.set({ focusModeEnabled: enabled }, () => {
                chrome.runtime.sendMessage({ action: "syncAll" }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.warn("Could not sync with background:", chrome.runtime.lastError.message);
                    }
                });
            });
        });
    }

    pomoBtn.addEventListener("click", () => {
        chrome.storage.local.get(["deepWorkActive", "preferences"], (data) => {
            if (data.deepWorkActive) {
                // Stop Deep Work
                chrome.alarms.clear("deepWork");
                chrome.storage.local.set({ deepWorkActive: false });
                updateUI();
            } else {
                // Start Deep Work
                const prefs = data.preferences || {};
                const minutes = prefs.deepWorkMinutes || 25;
                chrome.runtime.sendMessage({ action: "startDeepWork", minutes: minutes }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Deep Work error:", chrome.runtime.lastError.message);
                    } else if (response && response.success) {
                        updateUI();
                    }
                });
            }
        });
    });

    dashboardBtn.addEventListener("click", () => {
        chrome.tabs.create({ url: "http://localhost:3000" });
    });

    // ==================== REAL-TIME UPDATES ====================

    setInterval(() => {
        // Only run real-time updates if main view is visible
        if (mainView.style.display !== "none") {
            chrome.storage.local.get(["startTime", "activeTab"], (data) => {
                if (data.activeTab && data.startTime) {
                    updateElapsedTime(data.startTime);
                }
            });
        }
    }, 1000);

    let pomoInterval;
    function startPomoUIUpdate(endTime) {
        if (pomoInterval) clearInterval(pomoInterval);
        pomoInterval = setInterval(() => {
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            const m = Math.floor(remaining / 60).toString().padStart(2, "0");
            const s = (remaining % 60).toString().padStart(2, "0");
            pomoTimer.textContent = `${m}:${s}`;
            if (remaining <= 0) {
                clearInterval(pomoInterval);
                updateUI();
            }
        }, 1000);
    }
});
