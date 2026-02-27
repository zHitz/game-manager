/**
 * Global Store (SPA State Persistence)
 * Production-safe: sessionStorage backed, strictly serializable, no DOM refs.
 */

window.GlobalStore = {
    state: {
        selectedEmus: [],
        runningMacros: {},
        activityLogs: [],
        currentTab: 'emulators'   // Persist which tab is active across navigations
    },

    listeners: [],
    _pollingTimer: null,

    init() {
        this._load();
        if (this._pollingTimer) clearInterval(this._pollingTimer);
        this._pollingTimer = setInterval(() => this._pollBackend(), 2000);
        if (this.state.activityLogs.length === 0) {
            this.addActivityLog('Select emulators → run actions to see progress here', 'active');
        }
        window.__STORE_DEBUG__ = this.state;
    },

    subscribe(cb) {
        this.listeners.push(cb);
        return () => { this.listeners = this.listeners.filter(l => l !== cb); };
    },

    notify() {
        this._save();
        this.listeners.forEach(cb => { try { cb(this.state); } catch (e) { console.error('Store listener error:', e); } });
    },

    _save() {
        try { sessionStorage.setItem('COD_Store', JSON.stringify(this.state)); } catch (e) { }
    },

    _load() {
        try {
            const raw = sessionStorage.getItem('COD_Store');
            if (raw) {
                const parsed = JSON.parse(raw);
                // Merge carefully
                if (Array.isArray(parsed.selectedEmus)) this.state.selectedEmus = parsed.selectedEmus;
                if (parsed.runningMacros && typeof parsed.runningMacros === 'object') this.state.runningMacros = parsed.runningMacros;
                if (Array.isArray(parsed.activityLogs)) this.state.activityLogs = parsed.activityLogs;
                if (parsed.currentTab) this.state.currentTab = parsed.currentTab;
            }
        } catch (e) { }
    },

    // ── Emulators ──
    toggleEmulator(idx, isSelected) {
        const pos = this.state.selectedEmus.indexOf(idx);
        if (isSelected && pos === -1) this.state.selectedEmus.push(idx);
        else if (!isSelected && pos > -1) this.state.selectedEmus.splice(pos, 1);
        this.notify();
    },

    clearSelectedEmulators() { this.state.selectedEmus = []; this.notify(); },

    // ── Activity Logs ──
    addActivityLog(message, dotClass = 'info') {
        const timeStr = new Date().toLocaleTimeString();
        this.state.activityLogs.unshift({ timeStr, message: String(message), dotClass: String(dotClass) });
        if (this.state.activityLogs.length > 100) this.state.activityLogs.length = 100;
        this.notify();
    },

    // ── Macros ──
    setMacroRunning(filename, emulatorCount, totalDuration) {
        this.state.runningMacros[filename] = { startTime: Date.now(), totalDuration, emulatorCount };
        this.notify();
    },

    removeMacroRunning(filename) { delete this.state.runningMacros[filename]; this.notify(); },

    // ── Tab ──
    setCurrentTab(tab) { this.state.currentTab = tab; this.notify(); },

    // ── Backend Poll (stub) ──
    async _pollBackend() { }
};

window.GlobalStore.init();
