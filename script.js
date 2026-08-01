// ==UserScript==
// @name         Evomớiv4 (0ms Ultra-Fast Attack - Synchronized Weapon Stats)
// @namespace    http://tampermonkey.net/
// @version      4.1.1 (Fixed Equal Circle Radius)
// @description  MOD EVOWARS.IO VIP BY NLHH (Integrated 0ms Ultra-Fast Attack Engine - Max Reactivity - Synced Stats)
// @author       #NLHH & KILLER (Upgraded 0ms)
// @match        https://evowars.io/*
// @grant        none
// @license      MIT
// ==/UserScript==
(function() {
    'use strict';
    let isAuthenticated = false;
    const ADMIN_PASS = "2014";
    const VALID_KEYS = {
        "EVO-TEST-15M": { type: "15 Phút (TEST)", duration: 15 * 60 * 1000 },
        "EVO-HOUR-111": { type: "1 Giờ", duration: 1 * 60 * 60 * 1000 },
        "EVO-HOUR-222": { type: "1 Giờ", duration: 1 * 60 * 60 * 1000 },
        "EVO-DAY-A1B2": { type: "1 Ngày", duration: 24 * 60 * 60 * 1000 },
        "EVO-DAY-C3D4": { type: "1 Ngày", duration: 24 * 60 * 60 * 1000 },
        "EVO-WEEK-VIP1": { type: "1 Tuần", duration: 7 * 24 * 60 * 60 * 1000 },
        "1234": { type: "Vĩnh Viễn", duration: Infinity }
    };
    // Đồng bộ WEAPON_STATS
    const WEAPON_STATS = {
        0: { distance: 200, degrees: 125 }, 2: { distance: 235, degrees: 90 }, 3: { distance: 245, degrees: 125 },
        4: { distance: 260, degrees: 125 }, 5: { distance: 300, degrees: 133 }, 6: { distance: 340, degrees: 125 },
        7: { distance: 380, degrees: 131 }, 8: { distance: 343, degrees: 130 }, 9: { distance: 350, degrees: 125 },
        10: { distance: 470, degrees: 133 }, 11: { distance: 510, degrees: 129 }, 12: { distance: 520, degrees: 133 },
        13: { distance: 555, degrees: 134 }, 14: { distance: 595, degrees: 125 }, 15: { distance: 650, degrees: 129 },
        16: { distance: 655, degrees: 131 }, 17: { distance: 660, degrees: 125 }, 18: { distance: 695, degrees: 125 },
        19: { distance: 690, degrees: 125 }, 20: { distance: 710, degrees: 130 }, 21: { distance: 775, degrees: 130 },
        22: { distance: 805, degrees: 136 }, 23: { distance: 680, degrees: 122 }, 24: { distance: 870, degrees: 125 },
        25: { distance: 940, degrees: 137 }, 26: { distance: 975, degrees: 130 }, 27: { distance: 1050, degrees: 125 },
        28: { distance: 1095, degrees: 125 }, 29: { distance: 1000, degrees: 135 }, 30: { distance: 995, degrees: 125 },
        31: { distance: 1050, degrees: 130 }, 32: { distance: 1145, degrees: 134 }, 33: { distance: 1120, degrees: 139 },
        34: { distance: 1125, degrees: 124 }, 35: { distance: 1145, degrees: 135 }, 36: { distance: 1250, degrees: 122 },
        37: { distance: 1300, degrees: 125 }, 38: { distance: 1300, degrees: 125 }, 39: { distance: 1300, degrees: 125 }
    };
    const getWeaponStats = level => WEAPON_STATS[level] || { distance: Math.max(200, level * 30), degrees: 125 };
    // Đồng bộ ARC_MULTIPLIERS
    const ARC_MULTIPLIERS = {
        1: 0.6, 2: 0.75, 3: 0.7, 4: 0.75, 5: 0.8, 6: 0.75, 7: 0.76, 8: 0.75, 9: 0.9, 10: 0.95,
        11: 0.8, 12: 0.75, 13: 0.75, 14: 0.8, 15: 0.8, 16: 0.7, 17: 0.75, 18: 0.8, 19: 0.8,
        20: 0.85, 21: 0.85, 22: 0.81, 23: 0.82, 24: 1.05, 25: 0.85, 26: 0.8, 27: 0.85, 28: 0.78,
        29: 0.7, 30: 0.8, 31: 0.85, 32: 0.85, 33: 0.8, 34: 0.8, 35: 0.83, 36: 0.9, 37: 0.85,
        38: 0.9, 39: 0.95, 40: 0.91, 41: 1.06
    };
    const getArcMultiplier = (level, defaultMul) => ARC_MULTIPLIERS[Math.floor(level) + 1] || defaultMul;
    window.ultimate_ghostAngle = null;
    window.ultimate_angleLockTime = 0;
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
        #evo-lock-screen { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: linear-gradient(135deg, #0f0c20 0%, #15102a 50%, #060409 100%); z-index: 2147483646; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: all; gap: 20px; font-family: 'Inter', sans-serif; }
        #evo-key-panel { width: 420px; background: rgba(12, 10, 18, 0.96); border: 2px solid #7c3aed; border-radius: 20px; padding: 30px; box-shadow: 0 0 40px rgba(124, 58, 237, 0.6); color: #fff; text-align: center; z-index: 2147483647; box-sizing: border-box; display: flex; flex-direction: column; gap: 0; }
        #evo-key-input, #evo-admin-input { width: 100%; padding: 14px; margin: 10px 0; background: #161421; border: 1px solid #4a2080; border-radius: 10px; color: #fff; font-size: 15px; text-align: center; outline: none; box-sizing: border-box; font-weight: 600; letter-spacing: 0.5px; }
        #evo-key-input:focus, #evo-admin-input:focus { border-color: #7c3aed; box-shadow: 0 0 10px rgba(124,58,237,0.5); }
        .evo-key-btn { width: 100%; padding: 12px; border-radius: 10px; font-weight: bold; font-size: 14px; cursor: pointer; border: none; margin: 5px 0; transition: 0.2s; }
        #evo-btn-submit { background: #7c3aed; color: white; } #evo-btn-submit:hover { background: #6d28d9; box-shadow: 0 0 12px rgba(124,58,237,0.6); }
        #evo-key-msg { font-size: 13px; margin-top: 5px; font-weight: 600; min-height: 20px; line-height: 1.4; }
        #evo-key-list-box { width: 100%; background: rgba(20, 16, 35, 0.9); border: 1px dashed #4a2080; border-radius: 15px; padding: 15px; color: #aaa; box-sizing: border-box; font-size: 12px; max-height: 180px; overflow-y: auto; margin-top: 15px; display: none; }
        #evo-key-list-box::-webkit-scrollbar { width: 6px; } #evo-key-list-box::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 3px; }
        .key-item { display: flex; justify-content: space-between; padding: 6px 8px; margin: 4px 0; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid rgba(124, 58, 237, 0.1); }
        .key-string { color: #a78bfa; font-weight: bold; cursor: pointer; } .key-string:hover { text-decoration: underline; color: #c084fc; }
        .key-type { color: #34d399; font-weight: 500; }
        #evo-toggle-btn { position: fixed; bottom: 20px; left: 20px; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; background: rgba(20,20,20,0.8); backdrop-filter: blur(6px); color: #fff; border-radius: 50%; cursor: pointer; z-index: 99999; font-size: 20px; border: 1px solid #7c3aed; box-shadow: 0 0 15px rgba(124, 58, 237, 0.5); transition: all 0.25s ease; opacity: 0.6; display: none; }
        #evo-toggle-btn:hover { transform: scale(1.15); opacity: 1; background: rgba(40,40,40,0.9); box-shadow: 0 0 25px rgba(124, 58, 237, 0.8); }
        #evo-menu { position: fixed; top: 50px; left: 50px; width: 700px; height: 490px; background: rgba(12, 10, 18, 0.95); backdrop-filter: blur(12px); border-radius: 12px; color: #aaa; z-index: 99998; box-shadow: 0 10px 40px rgba(0,0,0,0.8); border: 1px solid #4a2080; display: flex; flex-direction: column; resize: both; overflow: auto; min-width: 550px; min-height: 350px; display: none; }
        #evo-menu::-webkit-scrollbar { width: 8px; height: 8px; } #evo-menu::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 4px; }
        #evo-header { height: 50px; min-height: 50px; padding: 0 20px; font-size: 15px; font-weight: 700; color: #fff; border-bottom: 1px solid #4a2080; cursor: grab; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(90deg, #1e0a32, #121212); position: sticky; top: 0; z-index: 2; user-select: none; border-radius: 12px 12px 0 0; }
        #evo-header:active { cursor: grabbing; } #evo-close { cursor: pointer; font-size: 22px; color: #aaa; transition: 0.2s; } #evo-close:hover { color: #ef4444; }
        .evo-body { display: flex; padding: 20px; gap: 20px; flex-wrap: wrap; } .evo-col { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 15px; }
        .section-title { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #a78bfa; margin-bottom: 6px; text-transform: uppercase; }
        .section { background: rgba(25, 25, 25, 0.5); border-radius: 8px; padding: 15px; display: flex; flex-direction: column; gap: 12px; border: 1px solid #2d2d3d; }
        .row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #e2e8f0; font-weight: 500; }
        .switch { position: relative; width: 36px; height: 20px; flex-shrink: 0;} .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #333; transition: .2s; border-radius: 20px; } .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background: #fff; transition: .2s; border-radius: 50%; }
        input:checked + .slider { background: #7c3aed; box-shadow: 0 0 8px rgba(124,58,237,0.6); } input:checked + .slider:before { transform: translateX(16px); }
        .range-wrap { display: flex; align-items: center; gap: 10px; width: 60%; } input[type=range] { -webkit-appearance: none; width: 100%; height: 6px; background: #333; border-radius: 3px; outline: none; } input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #7c3aed; cursor: pointer; box-shadow: 0 0 5px rgba(124,58,237,0.8); }
        .val-disp { color: #a78bfa; font-size: 12px; font-weight: bold; min-width: 35px; text-align: right; }
        .btn-mode { padding: 4px 10px; background: #333; border: 1px solid #555; color: #fff; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; transition: 0.2s; }
        .btn-mode.active { background: #7c3aed; border-color: #a78bfa; box-shadow: 0 0 8px rgba(124,58,237,0.6); }
    `;
    document.head.appendChild(styleElement);
    const config = {
        filter: true, lines: true, hitboxes: true, cooldown: true, playerArc: true, punish: false,
        dodge: false, sprint: false, hunt: false, attack: false, zoom: 1, lvlMin: 0, lvlMax: 200, reachMul: 0.85,
        gameMode: "ffa", lang: "vi", attackHitboxPct: 1
    };
    const lockScreen = document.createElement("div");
    lockScreen.id = "evo-lock-screen";
    let keyListHTML = `<div id="evo-key-list-box"><div style="font-weight:bold; color:#fff; margin-bottom:8px; text-align:center; font-size:11px; letter-spacing:1px;">DANH SÁCH KEY HỆ THỐNG</div>`;
    for (const key in VALID_KEYS) {
        keyListHTML += `
            <div class="key-item">
                <span class="key-string" onclick="document.getElementById('evo-key-input').value='${key}'">${key}</span>
                <span class="key-type">${VALID_KEYS[key].type}</span>
            </div>`;
    }
    keyListHTML += `</div>`;
    lockScreen.innerHTML = `
        <div id="evo-key-panel">
            <h2 style="margin:0 0 10px 0; font-size:22px; font-weight:900; letter-spacing:1px; background:linear-gradient(45deg, #a78bfa, #f43f5e); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">EVOKID SYSTEM LOCK</h2>
            <p style="font-size:13px; color:#9ca3af; margin:0;">Vui lòng nhập Key kích hoạt chính xác để trải nghiệm bản Hack</p>
            <input type="text" id="evo-key-input" placeholder="NHẬP KEY KÍCH HOẠT TẠI ĐÂY...">
            <button id="evo-btn-submit" class="evo-key-btn">KÍCH HOẠT HỆ THỐNG</button>
            <div id="evo-key-msg"></div>
            <input type="password" id="evo-admin-input" placeholder="MẬT KHẨU ADMIN ĐỂ XEM KEY...">
            ${keyListHTML}
        </div>
    `;
    document.body.appendChild(lockScreen);
    const toggleButton = document.createElement("div");
    toggleButton.id = "evo-toggle-btn";
    toggleButton.innerHTML = "🤖";
    document.body.appendChild(toggleButton);
    const menuContainer = document.createElement("div");
    menuContainer.innerHTML = `
        <div id="evo-menu">
            <div id="evo-header">
                <span data-i18n="title">EVOKID BY NLHH</span>
                <span style="display:flex; gap:10px; align-items:center;">
                    <span id="evo-lang-btn" style="cursor:pointer; font-size:10px; border:1px solid #7c3aed; padding:2px 6px; border-radius:4px; color:white;">VN</span>
                    <span id="evo-close" style="cursor:pointer">&times;</span>
                </span>
            </div>
            <div class="evo-body">
                <div class="evo-col">
                    <div>
                        <div class="section-title" data-i18n="visuals">VISUALS (ESP)</div>
                        <div class="section">
                            <div class="row"><span data-i18n="visual_cd">Visual CD Timer</span><label class="switch"><input type="checkbox" id="c-cooldown" checked><span class="slider"></span></label></div>
                            <div class="row"><span data-i18n="blaze">Blaze Perfect Arc</span><label class="switch"><input type="checkbox" id="c-player-arc" checked><span class="slider"></span></label></div>
                            <div class="row"><span data-i18n="lines">Draw Target Lines</span><label class="switch"><input type="checkbox" id="c-lines" checked><span class="slider"></span></label></div>
                            <div class="row"><span data-i18n="hitboxes">Show Hitboxes & Level</span><label class="switch"><input type="checkbox" id="c-hitboxes" checked><span class="slider"></span></label></div>
                        </div>
                    </div>
                    <div>
                        <div class="section-title" data-i18n="utility">MODIFIERS & UTILITY</div>
                        <div class="section">
                            <div class="row"><span data-i18n="zoom">Camera Zoom</span><div class="range-wrap"><input type="range" id="c-zoom" min="0.1" max="4" step="0.05" value="1"><div class="val-disp" id="v-zoom">1.00</div></div></div>
                            <div class="row">
                                <span style="font-weight:bold; color:#a78bfa;">CHẾ ĐỘ CHƠI:</span>
                                <div>
                                    <button id="mode-ffa" class="btn-mode">FFA</button>
                                    <button id="mode-team" class="btn-mode">TEAM</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="evo-col">
                    <div>
                        <div class="section-title" data-i18n="combat">COMBAT AUTOMATION</div>
                        <div class="section">
                            <div class="row" style="color: #f43f5e;"><span data-i18n="filter">Filter Low Lv (E)</span><label class="switch"><input type="checkbox" id="c-filter" checked><span class="slider"></span></label></div>
                            <div class="row" style="color: #fbbf24;"><span data-i18n="punish">True AI Punish</span><label class="switch"><input type="checkbox" id="c-punish"><span class="slider"></span></label></div>
                            <div class="row" style="color: #34d399;"><span data-i18n="predator">Predator Aim</span><label class="switch"><input type="checkbox" id="c-blaze-aim" checked disabled><span class="slider"></span></label></div>
                            <div class="row"><span data-i18n="dodge">Auto-Dodge</span><label class="switch"><input type="checkbox" id="c-dodge"><span class="slider"></span></label></div>
                            <div class="row"><span data-i18n="sprint">Auto-Sprint</span><label class="switch"><input type="checkbox" id="c-sprint"><span class="slider"></span></label></div>
                            <div class="row"><span data-i18n="hunt">Auto-Hunt</span><label class="switch"><input type="checkbox" id="c-hunt"><span class="slider"></span></label></div>
                            <div class="row"><span data-i18n="attack">0ms Ultra-Fast Attack</span><label class="switch"><input type="checkbox" id="c-attack"><span class="slider"></span></label></div>
                            <div class="row" style="margin-top: 5px; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 8px;"><span data-i18n="hitboxPct" style="color: #60a5fa; font-weight: bold;">Tầm kiếm lấn vòng đối thủ (%)</span><div class="range-wrap" style="width: 45%;"><input type="range" id="c-hitbox-pct" min="1" max="100" step="1" value="1"><div class="val-disp" id="v-hitbox-pct" style="color: #60a5fa;">1%</div></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(menuContainer);
    const menuElement = document.getElementById("evo-menu");
    let menuVisible = false;
    const toggleMenu = () => {
        if (!isAuthenticated) return;
        menuVisible = !menuVisible;
        menuElement.style.display = menuVisible ? "flex" : "none";
    };
    toggleButton.addEventListener("click", toggleMenu);
    document.getElementById("evo-close").addEventListener("click", toggleMenu);
    let isDragging = false, dragOffsetX, dragOffsetY, menuLeft, menuTop;
    document.getElementById("evo-header").addEventListener("mousedown", e => {
        if (e.target.id === "evo-close") return;
        isDragging = true;
        dragOffsetX = e.clientX;
        dragOffsetY = e.clientY;
        const rect = menuElement.getBoundingClientRect();
        menuLeft = rect.left;
        menuTop = rect.top;
        e.preventDefault();
    });
    document.addEventListener("mousemove", e => {
        if (!isDragging) return;
        let newLeft = menuLeft + (e.clientX - dragOffsetX);
        let newTop = menuTop + (e.clientY - dragOffsetY);
        menuElement.style.left = Math.max(0, Math.min(newLeft, window.innerWidth - 100)) + "px";
        menuElement.style.top = Math.max(0, Math.min(newTop, window.innerHeight - 50)) + "px";
    });
    document.addEventListener("mouseup", () => isDragging = false);
    menuElement.addEventListener("mousedown", e => e.stopPropagation());
    const uiRefs = { menuCheckboxes: {}, panelButtons: {} };
    const syncUI = () => {
        for (let key in uiRefs.menuCheckboxes) {
            if (uiRefs.menuCheckboxes[key]) uiRefs.menuCheckboxes[key].checked = config[key];
        }
        for (let key2 in uiRefs.panelButtons) {
            if (uiRefs.panelButtons[key2]) uiRefs.panelButtons[key2]();
        }
        const ffaBtn = document.getElementById("mode-ffa");
        const teamBtn = document.getElementById("mode-team");
        if (ffaBtn && teamBtn) {
            if (config.gameMode === "ffa") {
                ffaBtn.classList.add("active");
                teamBtn.classList.remove("active");
            } else {
                teamBtn.classList.add("active");
                ffaBtn.classList.remove("active");
            }
        }
    };
    const TRANSLATIONS = {
        vi: {
            title: "EVOKID BY NLHH", visuals: "HIỂN THỊ (ESP)", visual_cd: "Đếm ngược CD", blaze: "Cung Blaze", lines: "Đường mục tiêu",
            hitboxes: "Khung hitbox", utility: "MODIFIER & TIỆN ÍCH", zoom: "Thu phóng Camera", combat: "TỰ ĐỘNG CHIẾN ĐẤU",
            filter: "Lọc cấp thấp", punish: "Tích hợp AI", predator: "Ngắm bắn Predator", dodge: "Tự né (Dodge)",
            sprint: "Tự tăng tốc (Sprint)", hunt: "Tự săn (Hunt)", attack: "Chém siêu tốc 0ms", hitboxPct: "Tầm kiếm lấn vòng đối thủ (%)", p_filter: "Lọc cấp thấp (E)",
            p_punish: "Tích hợp AI (P)", p_dodge: "Tự né (W)", p_attack: "Chém 0ms (C)", p_hunt: "Tự săn (V)", p_sprint: "Tự tăng tốc (B)"
        },
        en: {
            title: "EVOKID BY NLHH", visuals: "VISUALS (ESP)", visual_cd: "Visual CD Timer", blaze: "Blaze Perfect Arc", lines: "Draw Target Lines",
            hitboxes: "Show Hitboxes", utility: "MODIFIERS & UTILITY", zoom: "Camera Zoom", combat: "COMBAT AUTOMATION",
            filter: "Filter Low Lv (E)", punish: "True AI Punish", predator: "Predator Aim", dodge: "Auto-Dodge",
            sprint: "Auto-Sprint", hunt: "Auto-Hunt", attack: "0ms Ultra Attack", hitboxPct: "Sword Overlap Enemy Circle (%)", p_filter: "Filter Low Lv (E)",
            p_punish: "True AI Punish (P)", p_dodge: "Auto-Dodge (W)", p_attack: "0ms Attack (C)", p_hunt: "Auto-Hunt (V)", p_sprint: "Auto-Sprint (B)"
        }
    };
    const saveConfig = () => localStorage.setItem("evo_ult_cfg_v9", JSON.stringify(config));
    const loadConfig = () => {
        const saved = localStorage.getItem("evo_ult_cfg_v9");
        if (saved) try { Object.assign(config, JSON.parse(saved)); } catch (err) {}
    };
    loadConfig();
    const bindCheckbox = (elId, configKey) => {
        const el = document.getElementById(elId);
        if (el) {
            el.checked = config[configKey];
            uiRefs.menuCheckboxes[configKey] = el;
            el.addEventListener("change", ev => {
                config[configKey] = ev.target.checked;
                saveConfig();
                syncUI();
            });
        }
    };
    bindCheckbox("c-filter", "filter"); bindCheckbox("c-lines", "lines"); bindCheckbox("c-hitboxes", "hitboxes");
    bindCheckbox("c-cooldown", "cooldown"); bindCheckbox("c-player-arc", "playerArc"); bindCheckbox("c-punish", "punish");
    bindCheckbox("c-dodge", "dodge"); bindCheckbox("c-sprint", "sprint"); bindCheckbox("c-hunt", "hunt"); bindCheckbox("c-attack", "attack");
    const bindSlider = (sliderId, dispId, configKey, showVal = true, suffix = "") => {
        const slider = document.getElementById(sliderId), disp = document.getElementById(dispId);
        if (slider && disp) {
            slider.value = config[configKey];
            disp.textContent = (showVal ? config[configKey].toFixed(2) : config[configKey]) + suffix;
            slider.addEventListener("input", ev => {
                config[configKey] = showVal ? parseFloat(ev.target.value) : parseInt(ev.target.value);
                disp.textContent = (showVal ? config[configKey].toFixed(2) : config[configKey]) + suffix;
                saveConfig();
            });
        }
    };
    bindSlider("c-zoom", "v-zoom", "zoom");
    bindSlider("c-hitbox-pct", "v-hitbox-pct", "attackHitboxPct", false, "%");
    document.getElementById("mode-ffa").addEventListener("click", () => { config.gameMode = "ffa"; saveConfig(); syncUI(); });
    document.getElementById("mode-team").addEventListener("click", () => { config.gameMode = "team"; saveConfig(); syncUI(); });
    let runtime = null, playerType = null, gameCanvas = null, mouseInstance = null, isAimOverriding = false, aimX = 0, aimY = 0, lastAttackTime = 0, isRightClickHeld = false, lastRightClickTime = 0, centerX = window.innerWidth / 2, centerY = window.innerHeight / 2;
    const enemyTracker = new Map();
    // Cache canvas position để tránh giật lag (Reflow Layout Thrashing)
    let cachedCanvasRect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const updateCanvasRect = () => {
        if (gameCanvas) cachedCanvasRect = gameCanvas.getBoundingClientRect();
    };
    document.addEventListener("mousemove", e => { if (e.isTrusted) { centerX = e.clientX; centerY = e.clientY; } });
    document.addEventListener("contextmenu", e => { if (e.target === gameCanvas) e.preventDefault(); });
    const overlayCanvas = document.createElement("canvas"), ctx = overlayCanvas.getContext("2d");
    document.body.appendChild(overlayCanvas);
    overlayCanvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9997;";
    window.addEventListener("resize", () => {
        overlayCanvas.width = window.innerWidth;
        overlayCanvas.height = window.innerHeight;
        updateCanvasRect();
    });
    window.dispatchEvent(new Event("resize"));
    const getLevel = inst => inst.instance_vars && inst.instance_vars.length > 10 ? inst.instance_vars[10] : 0;
    const simulateRightClick = (isDown, x, y) => {
        if (!gameCanvas) return;
        const eventType = isDown ? "mousedown" : "mouseup";
        const opts = { clientX: x, clientY: y, button: 2, buttons: isDown ? 2 : 0, bubbles: true, cancelable: true };
        gameCanvas.dispatchEvent(new MouseEvent(eventType, opts));
        document.dispatchEvent(new MouseEvent(eventType, opts));
    };
    const executeKillerFastAttack = (target, localPlayer, now) => {
        if (!gameCanvas || !target || !localPlayer) return;
        lastAttackTime = now;
        const atkData = enemyTracker.get(target.uid);
        let predictX = target.x, predictY = target.y;
        if (atkData) { predictX += atkData.vx * 15; predictY += atkData.vy * 15; }
        const baseAngleRad = Math.atan2(predictY - localPlayer.y, predictX - localPlayer.x);
        const sweepDistance = 3000;
        const centerX_canvas = cachedCanvasRect.left + (cachedCanvasRect.width * 0.5);
        const centerY_canvas = cachedCanvasRect.top + (cachedCanvasRect.height * 0.5);
        const savedAngle = localPlayer.angle;
        let savedVar = undefined;
        if (localPlayer.instance_vars && localPlayer.instance_vars[15] !== undefined) savedVar = localPlayer.instance_vars[15];
        const localLevel = getLevel(localPlayer);
        const localWeaponData = getWeaponStats(localLevel);
        const sweepDegrees = localWeaponData.degrees;
        const adjustedAngleRad = baseAngleRad + (sweepDegrees * Math.PI / 180);
        const targetMouseX = centerX_canvas + Math.cos(adjustedAngleRad) * sweepDistance;
        const targetMouseY = centerY_canvas + Math.sin(adjustedAngleRad) * sweepDistance;
        if (typeof localPlayer.angle !== 'undefined') localPlayer.angle = adjustedAngleRad;
        if (savedVar !== undefined) localPlayer.instance_vars[15] = adjustedAngleRad;
        gameCanvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, buttons: 1, clientX: targetMouseX, clientY: targetMouseY }));
        gameCanvas.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0, buttons: 0, clientX: targetMouseX, clientY: targetMouseY }));
        if (typeof localPlayer.angle !== 'undefined') localPlayer.angle = savedAngle;
        if (savedVar !== undefined) localPlayer.instance_vars[15] = savedVar;
        gameCanvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: aimX || centerX, clientY: aimY || centerY }));
    };
    const mainTick = () => {
        if (!isAuthenticated || !runtime || !runtime.running_layout || !playerType) return;
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        const now = performance.now();
        if (now > window.ultimate_angleLockTime) window.ultimate_ghostAngle = null;
        const scrollX = runtime.running_layout.scrollX, scrollY = runtime.running_layout.scrollY;
        let localPlayer = null, closestDist = Infinity;
        for (const player of playerType.instances) {
            const dist = Math.hypot(player.x - scrollX, player.y - scrollY);
            if (dist < closestDist) { closestDist = dist; localPlayer = player; }
        }
        if (!localPlayer) {
            isAimOverriding = false; window.ultimate_ghostAngle = null;
            if (isRightClickHeld) { simulateRightClick(false, centerX, centerY); isRightClickHeld = false; }
            return;
        }
        const canvasCenterX = cachedCanvasRect.left + cachedCanvasRect.width / 2,
            canvasCenterY = cachedCanvasRect.top + cachedCanvasRect.height / 2,
            scaleX = cachedCanvasRect.width / gameCanvas.width,
            scaleY = cachedCanvasRect.height / gameCanvas.height,
            layerScale = localPlayer.layer.getScale(),
            localScreenX = canvasCenterX + (localPlayer.x - scrollX) * layerScale * scaleX,
            localScreenY = canvasCenterY + (localPlayer.y - scrollY) * layerScale * scaleY,
            localLevel = getLevel(localPlayer),
            localRadius = localPlayer.width * 0.5,
            localWeaponData = getWeaponStats(localLevel),
            weaponDistance = localWeaponData.distance,
            weaponDegrees = localWeaponData.degrees,
            reachMultiplier = getArcMultiplier(localLevel, config.reachMul),
            maxReach = weaponDistance * reachMultiplier,
            canAttack = true;
        let shouldSprint = false, attackTarget = null, attackTargetDist = Infinity, dodgeTarget = null, dodgeTargetDist = Infinity, huntTarget = null, huntTargetDist = Infinity, punishTarget = null, punishTargetDist = Infinity;
        const activeUids = new Set();
        // Vẽ vòng thân nhân vật bản thân
        if (config.hitboxes) {
            ctx.beginPath();
            ctx.arc(localScreenX, localScreenY, localRadius * layerScale * scaleX, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(34, 197, 94, 0.15)";
            ctx.fill();
            ctx.strokeStyle = "#22c55e";
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        ctx.textAlign = "center";
        for (const enemy of playerType.instances) {
            if (enemy.uid === localPlayer.uid || enemy.width <= 0) continue;
            if (config.gameMode === "team" && localPlayer.instance_vars && enemy.instance_vars && localPlayer.instance_vars[36] !== undefined && localPlayer.instance_vars[36] === enemy.instance_vars[36]) continue;
            activeUids.add(enemy.uid);
            if (!enemyTracker.has(enemy.uid)) enemyTracker.set(enemy.uid, { wasInThreat: false, attackStart: 0, lastX: enemy.x, lastY: enemy.y, vx: 0, vy: 0 });
            const enemyData = enemyTracker.get(enemy.uid);
            enemyData.vx = enemy.x - enemyData.lastX; enemyData.vy = enemy.y - enemyData.lastY; enemyData.lastX = enemy.x; enemyData.lastY = enemy.y;
            const dx = localPlayer.x - enemy.x,
                  dy = localPlayer.y - enemy.y,
                  distToEnemy = Math.hypot(dx, dy),
                  enemyLevel = getLevel(enemy),
                  enemyLevelFloored = Math.floor(enemyLevel) + 1,
                  enemyWeaponData = getWeaponStats(enemyLevel),
                  enemyReachMul = getArcMultiplier(enemyLevel, config.reachMul),
                  enemyMaxReach = enemyWeaponData.distance * enemyReachMul,
                  // ĐÃ CHỈNH: Sử dụng kích thước bán kính của bản thân (localRadius) cho cả đối thủ
                  enemyRadius = localRadius,
                  enemyScreenX = canvasCenterX + (enemy.x - scrollX) * layerScale * scaleX,
                  enemyScreenY = canvasCenterY + (enemy.y - scrollY) * layerScale * scaleY;
            let isValidTarget = true;
            if (config.filter && localLevel > enemyLevel && localLevel - enemyLevel >= 15) isValidTarget = false;
            const isInLevelRange = enemyLevel >= config.lvlMin && enemyLevel <= config.lvlMax && isValidTarget;
            let threatBuffer = enemyLevel >= localLevel ? 90 : 50;
            if (enemyLevelFloored === 27 || enemyLevelFloored === 28) threatBuffer += 130;
            const threatRange = enemyMaxReach + localRadius + threatBuffer, isInThreat = distToEnemy < threatRange, isApproaching = enemyData.vx * dx + enemyData.vy * dy < 0;
            if (isInThreat && !enemyData.wasInThreat && (isApproaching || distToEnemy < enemyMaxReach)) enemyData.attackStart = now;
            enemyData.wasInThreat = isInThreat;
            if (config.playerArc && isInLevelRange) {
                ctx.beginPath(); ctx.arc(enemyScreenX, enemyScreenY, enemyMaxReach * layerScale * scaleX, 0, Math.PI * 2); ctx.strokeStyle = isInThreat ? "rgba(239, 68, 68, 0.8)" : "rgba(251, 191, 36, 0.4)"; ctx.lineWidth = 1.5;
                if (ctx.setLineDash) ctx.setLineDash([4, 4]);
                ctx.stroke();
                if (ctx.setLineDash) ctx.setLineDash([]);
            }
            const maxCooldown = Math.max(800, enemyLevel * 60);
            let isSwinging = false, isOnCooldown = false, timeSinceAttack = 0;
            if (enemyData.attackStart) {
                timeSinceAttack = now - enemyData.attackStart;
                if (timeSinceAttack < 300) isSwinging = true;
                else if (timeSinceAttack < maxCooldown) isOnCooldown = true;
            }
            if (isSwinging && isInThreat) { if (distToEnemy < dodgeTargetDist) { dodgeTargetDist = distToEnemy; dodgeTarget = enemy; } }
            else {
                if (!canAttack && !isOnCooldown && distToEnemy < threatRange + 60) { if (distToEnemy < dodgeTargetDist) { dodgeTargetDist = distToEnemy; dodgeTarget = enemy; } }
                else if (!isOnCooldown && enemyLevel >= localLevel && isInThreat) { if (distToEnemy < dodgeTargetDist) { dodgeTargetDist = distToEnemy; dodgeTarget = enemy; } }
            }
            if (config.punish && isInLevelRange && (isOnCooldown || (isSwinging && !isInThreat))) { if (distToEnemy < punishTargetDist) { punishTargetDist = distToEnemy; punishTarget = enemy; } }
            else if (isInLevelRange && enemyLevel < localLevel) { if (distToEnemy < huntTargetDist) { huntTargetDist = distToEnemy; huntTarget = enemy; } }
            // TÍNH TOÁN ĐỘ LẤN CỦA TẦM KIẾM VÀO VÒNG ĐỐI THỦ
            if (distToEnemy <= maxReach + enemyRadius) {
                const overlapDepth = (maxReach + enemyRadius) - distToEnemy;
                const overlapPercent = (overlapDepth / (2 * enemyRadius)) * 100;
                if (isInLevelRange && overlapPercent >= config.attackHitboxPct && distToEnemy < attackTargetDist) {
                    attackTargetDist = distToEnemy;
                    attackTarget = enemy;
                }
            }
            // Vẽ vòng thân đối thủ (với bán kính bằng bản thân)
            const enemyRadiusScaled = enemyRadius * layerScale * scaleX;
            if (config.hitboxes) {
                ctx.beginPath();
                ctx.arc(enemyScreenX, enemyScreenY, enemyRadiusScaled, 0, Math.PI * 2);
                if (isSwinging) { ctx.fillStyle = "rgba(239, 68, 68, 0.3)"; ctx.fill(); ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 2.5; ctx.stroke(); }
                else if (isOnCooldown) { ctx.fillStyle = "rgba(251, 191, 36, 0.2)"; ctx.fill(); ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 2.5; ctx.stroke(); }
                else { ctx.fillStyle = isInLevelRange && enemyLevel <= localLevel ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"; ctx.fill(); ctx.strokeStyle = isInLevelRange && enemyLevel <= localLevel ? "#22c55e" : isInLevelRange ? "#ef4444" : "#9ca3af"; ctx.lineWidth = 1.5; ctx.stroke(); }
                const labelY = enemyScreenY - enemyRadiusScaled - 12;
                ctx.font = "900 12px Inter, sans-serif"; ctx.lineWidth = 3; ctx.strokeStyle = "#000000"; ctx.strokeText("Lv." + enemyLevelFloored, enemyScreenX, labelY); ctx.fillStyle = isInLevelRange ? "#ffffff" : "#9ca3af"; ctx.fillText("Lv." + enemyLevelFloored, enemyScreenX, labelY);
            }
            if (config.cooldown) {
                if (isSwinging) { ctx.fillStyle = "#ef4444"; ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.font = "900 13px Inter"; ctx.strokeText("⚔️ SWINGING!", enemyScreenX, enemyScreenY - enemyRadiusScaled - 30); ctx.fillText("⚔️ SWINGING!", enemyScreenX, enemyScreenY - enemyRadiusScaled - 30); }
                else if (isOnCooldown) {
                    const cdText = Math.max(0, (maxCooldown - timeSinceAttack) / 1000).toFixed(1), cdPct = timeSinceAttack / maxCooldown;
                    ctx.fillStyle = "#fbbf24"; ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.font = "900 12px Inter"; ctx.strokeText("⏳ CD: " + cdText + "s", enemyScreenX, enemyScreenY - enemyRadiusScaled - 30); ctx.fillText("⏳ CD: " + cdText + "s", enemyScreenX, enemyScreenY - enemyRadiusScaled - 30);
                    const barW = 50, barH = 6, barX = enemyScreenX - barW / 2, barY = enemyScreenY - enemyRadiusScaled - 45;
                    ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(barX, barY, barW, barH); ctx.fillStyle = "#fbbf24"; ctx.fillRect(barX, barY, barW * (1 - cdPct), barH); ctx.strokeStyle = "#000"; ctx.lineWidth = 1; ctx.strokeRect(barX, barY, barW, barH);
                }
            }
            if (config.lines && isInLevelRange) { ctx.beginPath(); ctx.moveTo(localScreenX, localScreenY); ctx.lineTo(enemyScreenX, enemyScreenY); ctx.strokeStyle = isSwinging ? "#ef4444" : isOnCooldown ? "#fbbf24" : distToEnemy < threatRange + 50 ? "rgba(239, 68, 68, 0.6)" : "rgba(168, 85, 247, 0.3)"; ctx.lineWidth = isOnCooldown || isSwinging ? 2 : 1; ctx.stroke(); }
        }
        for (const uid of enemyTracker.keys()) { if (!activeUids.has(uid)) enemyTracker.delete(uid); }
        if (config.dodge && dodgeTarget) {
            isAimOverriding = true;
            const dodgeDx = localPlayer.x - dodgeTarget.x, dodgeDy = localPlayer.y - dodgeTarget.y, dodgeDist = Math.hypot(dodgeDx, dodgeDy);
            aimX = canvasCenterX + (dodgeDx / dodgeDist) * 800; aimY = canvasCenterY + (dodgeDy / dodgeDist) * 800;
            const dodgeData = enemyTracker.get(dodgeTarget.uid), isEarlyAttack = dodgeData && dodgeData.attackStart && (now - dodgeData.attackStart < 300), dodgeDistRaw = Math.hypot(localPlayer.x - dodgeTarget.x, localPlayer.y - dodgeTarget.y), dodgeLvl = Math.floor(getLevel(dodgeTarget)) + 1;
            let extraBuf = 30;
            if (dodgeLvl === 27 || dodgeLvl === 28) extraBuf += 100;
            const inRange = dodgeDistRaw < getWeaponStats(getLevel(dodgeTarget)).distance + localRadius + extraBuf;
            if (config.sprint || isEarlyAttack || inRange || !canAttack) shouldSprint = true;
        } else if (config.punish && punishTarget) {
            isAimOverriding = true;
            const punishDx = punishTarget.x - localPlayer.x, punishDy = punishTarget.y - localPlayer.y, punishDist = Math.hypot(punishDx, punishDy);
            aimX = canvasCenterX + (punishDx / punishDist) * 800; aimY = canvasCenterY + (punishDy / punishDist) * 800; shouldSprint = true;
        } else if (config.hunt && huntTarget) {
            isAimOverriding = true;
            const huntDx = huntTarget.x - localPlayer.x, huntDy = huntTarget.y - localPlayer.y, huntDist = Math.hypot(huntDx, huntDist);
            aimX = canvasCenterX + (huntDx / huntDist) * 800; aimY = canvasCenterY + (huntDy / huntDist) * 800;
            if (config.sprint) shouldSprint = true;
        } else { isAimOverriding = false; aimX = centerX; aimY = centerY; }
        if (config.playerArc) {
            let cursorX = isAimOverriding ? aimX : centerX, cursorY = isAimOverriding ? aimY : centerY, worldCursorX = (cursorX - canvasCenterX) / (layerScale * scaleX) + scrollX, worldCursorY = (cursorY - canvasCenterY) / (layerScale * scaleY) + scrollY, aimAngle = window.ultimate_ghostAngle !== null ? window.ultimate_ghostAngle : Math.atan2(worldCursorY - localPlayer.y, worldCursorX - localPlayer.x) * 180 / Math.PI, arcStart = aimAngle * Math.PI / 180 - weaponDegrees * Math.PI / 180;
            ctx.beginPath(); ctx.arc(localScreenX, localScreenY, weaponDistance * layerScale * scaleX, arcStart - 1.09, arcStart + 1.09, false); ctx.strokeStyle = "rgba(0, 255, 0, 0.2)"; ctx.lineWidth = 1; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(localScreenX, localScreenY); ctx.arc(localScreenX, localScreenY, maxReach * layerScale * scaleX, arcStart - 1.09, arcStart + 1.09, false); ctx.lineTo(localScreenX, localScreenY); ctx.fillStyle = "rgba(0, 255, 0, 0.05)"; ctx.fill(); ctx.strokeStyle = "rgba(0, 255, 0, 0.4)"; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.beginPath(); ctx.arc(localScreenX, localScreenY, maxReach * layerScale * scaleX, 0, Math.PI * 2, false); ctx.strokeStyle = "rgba(0, 243, 255, 0.75)"; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = "rgba(0, 243, 255, 0.015)"; ctx.fill();
        }
        if (isAimOverriding && mouseInstance) { mouseInstance.mouseXcanvas = aimX; mouseInstance.mouseYcanvas = aimY; }
        if (shouldSprint) { if (!isRightClickHeld || now - lastRightClickTime > 50) { simulateRightClick(true, aimX || centerX, aimY || centerY); isRightClickHeld = true; lastRightClickTime = now; } }
        else if (isRightClickHeld) { simulateRightClick(false, centerX, centerY); isRightClickHeld = false; }
        if (config.attack && attackTarget) executeKillerFastAttack(attackTarget, localPlayer, now);
    };
    const animationLoop = () => {
        try {
            if (isAuthenticated && runtime && runtime.running_layout) {
                for (let layer of runtime.running_layout.layers) {
                    if (layer && layer.scale !== config.zoom) {
                        layer.scale = config.zoom;
                        if (layer.setZIndicesStaleFrom) layer.setZIndicesStaleFrom(0);
                    }
                }
                mainTick();
            } else { ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height); isAimOverriding = false; window.ultimate_ghostAngle = null; if (isRightClickHeld) { simulateRightClick(false, centerX, centerY); isRightClickHeld = false; } }
        } catch {}
        requestAnimationFrame(animationLoop);
    };
    const hookGame = () => {
        gameCanvas = runtime.canvas;
        updateCanvasRect();
        if (gameCanvas) gameCanvas.addEventListener("mousemove", mouseProto => { if (isAimOverriding) { mouseProto.stopImmediatePropagation(); mouseProto.stopPropagation(); } }, true);
        if (window.cr.plugins_.Mouse) {
            const mouseProto = window.cr.plugins_.Mouse.prototype.Instance.prototype, origMouseMove = mouseProto.onMouseMove;
            mouseProto.onMouseMove = function() { mouseInstance = this; origMouseMove.apply(this, arguments); if (isAimOverriding) { this.mouseXcanvas = aimX; this.mouseYcanvas = aimY; } };
        }
        if (window.cr.plugins_.NSG_PowerWS) {
            const wsProto = window.cr.plugins_.NSG_PowerWS.prototype.Instance.prototype, origTick = wsProto.tick;
            wsProto.tick = function() {
                if (this.wsWorker && !this.wsWorker._ultimateHooked) {
                    this.wsWorker._ultimateHooked = true;
                    const type_ = this.wsWorker.postMessage;
                    this.wsWorker.postMessage = function(msg) { if (msg && msg.action === "send" && msg.data && msg.data.a === "ps" && window.ultimate_ghostAngle !== null) { msg.data.d.a = Math.round(window.ultimate_ghostAngle); } return type_.apply(this, arguments); };
                }
                origTick.apply(this, arguments);
            };
        }
        for (const type_ of runtime.types_by_index) { if (type_ && type_.instvar_sids && type_.instvar_sids.length === 72) { playerType = type_; break; } }
        animationLoop();
    };
    const createShortcutPanel = () => {
        const panel = document.createElement("div");
        panel.style.cssText = "position: fixed; bottom: 20px; right: 20px; background: rgba(12,10,18,0.85); backdrop-filter: blur(8px); border: 1px solid #4a2080; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 10px; z-index: 99999; font-family: Inter, sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.6); opacity: 0.5; transition: all 0.3s ease; transform: scale(0.75); transform-origin: bottom right;";
        panel.addEventListener("mouseenter", () => { panel.style.opacity = "1"; panel.style.background = "rgba(12,10,18,0.98)"; });
        panel.addEventListener("mouseleave", () => { panel.style.opacity = "0.5"; panel.style.background = "rgba(12,10,18,0.85)"; });
        document.body.appendChild(panel);
        const inner = document.createElement("div");
        inner.id = "evo-expire-disp";
        inner.style.cssText = "color: #34d399; font-size: 11px; font-weight: bold; text-align: center; margin-bottom: 8px; border-bottom: 1px dashed #4a2080; padding-bottom: 8px; letter-spacing: 0.5px; min-height:15px;";
        panel.appendChild(inner);
        const storedKey = localStorage.getItem("evo_active_key");
        if (storedKey && VALID_KEYS[storedKey]) {
            const expTime = localStorage.getItem("evo_key_expire");
            if (VALID_KEYS[storedKey].duration === Infinity) {
                inner.textContent = "Hạn dùng: Vĩnh Viễn";
            } else {
                const updateRemaining = () => {
                    const remain = parseInt(expTime) - Date.now();
                    if (remain <= 0) { inner.textContent = "Key đã hết hạn!"; inner.style.color = "#f43f5e"; }
                    else {
                        const h = Math.floor(remain / 3600000), m = Math.floor((remain % 3600000) / 60000), s = Math.floor((remain % 60000) / 1000);
                        inner.textContent = `Hạn dùng còn: ${h}h ${m}m ${s}s`;
                    }
                };
                updateRemaining(); setInterval(updateRemaining, 1000);
            }
        }
        const addBtn = (event, changed, el) => {
            const updateFn = document.createElement("div"), key = () => {
                const label = TRANSLATIONS[config.lang][event];
                updateFn.innerHTML = "<span>" + el + " " + label + "</span> <span style=\"color:" + (config[changed] ? "#34d399" : "#f87171") + "\">" + (config[changed] ? "ON" : "OFF") + "</span>";
                updateFn.style.background = config[changed] ? "rgba(124,58,237,0.2)" : "rgba(39,39,42,0.6)";
                updateFn.style.border = config[changed] ? "1px solid #7c3aed" : "1px solid #3f3f46";
                updateFn.style.boxShadow = config[changed] ? "0 0 10px rgba(124,58,237,0.4)" : "none";
            };
            updateFn.style.cssText = "padding: 8px 12px; border-radius: 6px; cursor: pointer; color: #fff; font-size: 12px; font-weight: bold; display: flex; justify-content: space-between; gap: 15px; transition: 0.2s;";
            updateFn.addEventListener("click", () => { config[changed] = !config[changed]; saveConfig(); syncUI(); });
            key(); panel.appendChild(updateFn); uiRefs.panelButtons[changed] = key;
        };
        addBtn("p_filter", "filter", "🔍"); addBtn("p_punish", "punish", "🤖"); addBtn("p_dodge", "dodge", "🏃");
        addBtn("p_attack", "attack", "⚔️"); addBtn("p_hunt", "hunt", "🎯"); addBtn("p_sprint", "sprint", "⚡");
        const modeBtn = document.createElement("div");
        modeBtn.style.cssText = "padding: 8px 12px; border-radius: 6px; cursor: pointer; color: #fff; font-size: 12px; font-weight: bold; display: flex; justify-content: space-between; gap: 15px; transition: 0.2s;";
        const updateModeBtn = () => {
            const label = config.lang === "vi" ? "Chế độ chơi (T)" : "Game Mode (T)";
            const isFfa = config.gameMode === "ffa";
            modeBtn.innerHTML = `<span>🎮 ${label}</span> <span style="color:${isFfa ? '#34d399' : '#a78bfa'}">${isFfa ? 'FFA' : 'TEAM'}</span>`;
            modeBtn.style.background = isFfa ? "rgba(124,58,237,0.2)" : "rgba(59,130,246,0.2)";
            modeBtn.style.border = isFfa ? "1px solid #7c3aed" : "1px solid #3b82f6";
            modeBtn.style.boxShadow = "0 0 10px " + (isFfa ? "rgba(124,58,237,0.4)" : "rgba(59,130,246,0.4)");
        };
        modeBtn.addEventListener("click", () => { config.gameMode = config.gameMode === "ffa" ? "team" : "ffa"; saveConfig(); syncUI(); });
        updateModeBtn(); panel.appendChild(modeBtn); uiRefs.panelButtons["gameMode"] = updateModeBtn;
        syncUI();
        document.addEventListener("keydown", event => {
            if (document.activeElement.tagName === "INPUT") return;
            let changed = false;
            switch (event.key.toLowerCase()) {
                case "e": config.filter = !config.filter; changed = true; break;
                case "p": config.punish = !config.punish; changed = true; break;
                case "w": config.dodge = !config.dodge; changed = true; break;
                case "c": config.attack = !config.attack; changed = true; break;
                case "v": config.hunt = !config.hunt; changed = true; break;
                case "b": config.sprint = !config.sprint; changed = true; break;
                case "t": config.gameMode = config.gameMode === "ffa" ? "team" : "ffa"; changed = true; break;
                case "insert": toggleMenu(); break;
            }
            if (changed) { saveConfig(); syncUI(); }
        });
    };
    const applyTranslation = () => {
        const langStrings = TRANSLATIONS[config.lang];
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (langStrings[key]) el.textContent = langStrings[key];
        });
        document.getElementById("evo-lang-btn").textContent = config.lang === "vi" ? "🇲🇳 VN" : "🇺🇸 EN";
        syncUI();
    };
    const activateMod = () => {
        isAuthenticated = true;
        if (lockScreen) lockScreen.remove();
        document.getElementById("evo-toggle-btn").style.display = "flex";
        menuVisible = true;
        menuElement.style.display = "flex";
        const pollInterval = setInterval(() => { if (window.cr_getC2Runtime && (runtime = window.cr_getC2Runtime())) { clearInterval(pollInterval); hookGame(); createShortcutPanel(); } }, 500);
    };
    const checkSavedKey = () => {
        const savedKey = localStorage.getItem("evo_active_key");
        const expireTime = localStorage.getItem("evo_key_expire");
        if (savedKey && VALID_KEYS[savedKey]) {
            if (VALID_KEYS[savedKey].duration === Infinity || parseInt(expireTime) > Date.now()) {
                activateMod();
                setTimeout(() => applyTranslation(), 600);
                return true;
            }
        }
        return false;
    };
    setTimeout(() => {
        if (checkSavedKey()) return;
        const btnSubmit = document.getElementById("evo-btn-submit");
        const keyInput = document.getElementById("evo-key-input");
        const keyMsg = document.getElementById("evo-key-msg");
        const adminInput = document.getElementById("evo-admin-input");
        const listBox = document.getElementById("evo-key-list-box");
        if (adminInput && listBox) {
            adminInput.addEventListener("input", () => {
                if (adminInput.value.trim() === ADMIN_PASS) {
                    listBox.style.display = "block";
                } else {
                    listBox.style.display = "none";
                }
            });
        }
        if (btnSubmit && keyInput) {
            btnSubmit.addEventListener("click", () => {
                const inputKey = keyInput.value.trim();
                if (VALID_KEYS[inputKey]) {
                    const keyData = VALID_KEYS[inputKey];
                    localStorage.setItem("evo_active_key", inputKey);
                    if (keyData.duration === Infinity) {
                        localStorage.setItem("evo_key_expire", "Infinity");
                    } else {
                        localStorage.setItem("evo_key_expire", (Date.now() + keyData.duration).toString());
                    }
                    keyMsg.style.color = "#10b981";
                    keyMsg.textContent = "XÁC THỰC THÀNH CÔNG! ĐANG KHỞI ĐỘNG...";
                    setTimeout(() => {
                        activateMod();
                        const langBtn = document.getElementById("evo-lang-btn");
                        if (langBtn) langBtn.addEventListener("click", () => { config.lang = config.lang === "vi" ? "en" : "vi"; saveConfig(); applyTranslation(); });
                        applyTranslation();
                    }, 500);
                } else {
                    keyMsg.style.color = "#f43f5e";
                    keyMsg.textContent = "SAI KEY! VUI LÒNG KIỂM TRA LẠI.";
                }
            });
        }
    }, 300);
})();
