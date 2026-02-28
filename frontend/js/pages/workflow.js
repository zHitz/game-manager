/**
 * Workflow Page V2 — Basic Linear Sequence Builder.
 * Integrated into SPA with dark-scoped theme.
 */

const WorkflowPage = {
    render() {
        return `
    <div class="wf-page">
      <div class="wf-topbar">
        <div class="wf-topbar-brand">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/><circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/><line x1="6" y1="7" x2="10" y2="11"/><line x1="18" y1="7" x2="14" y2="11"/><line x1="6" y1="17" x2="10" y2="13"/><line x1="18" y1="17" x2="14" y2="13"/></svg>
          <h1>Workflow</h1>
          <span class="wf-badge">V2 BASIC</span>
        </div>
        <input id="wf-name-input" class="wf-name-input" type="text" value="Farm + Scan Sequence" spellcheck="false" />
        <div class="wf-topbar-sep"></div>
        <button class="wf-tb-btn" onclick="WF.clearSequence()" title="New workflow">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Clear All
        </button>
        <div class="wf-topbar-sep"></div>
        <div class="wf-topbar-right">
          <span id="wf-status" class="wf-status">IDLE</span>
          <button class="wf-tb-btn run-btn" id="wf-btn-run" onclick="WF.runWorkflow()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Run Sequence
          </button>
          <button class="wf-tb-btn" onclick="WF.saveWorkflow()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save
          </button>
        </div>
      </div>

      <div class="wf-main">
        <div class="wf-palette">
          <div class="wf-palette-header">
            <h3>Add Step</h3>
          </div>
          <div id="wf-palette-list" class="wf-palette-list"></div>
        </div>

        <div class="wf-linear-builder">
            <div id="wf-sequence-container" class="wf-sequence-container">
                <!-- Sequence cards injected here -->
            </div>
        </div>
        
        <div id="wf-run-log" class="wf-run-log">
          <div class="wf-run-log-header">
            <span class="wf-run-log-title">Execution Log</span>
            <button class="wf-run-log-close" onclick="document.getElementById('wf-run-log').classList.remove('visible')">✕</button>
          </div>
          <div id="wf-run-log-body" class="wf-run-log-body"></div>
        </div>
      </div>

      <div id="wf-toast-zone" class="wf-toast-zone"></div>
    </div>`;
    },

    init() { WF.init(); },
    destroy() { WF.cleanup(); },
};

// ═══════════════════════════════════════════════
//  PALETTE DATA
// ═══════════════════════════════════════════════
const WF_ACTIONS = [
    {
        group: 'Emulator Control', items: [
            { type: 'emu-target', label: 'Select Target', sub: 'Choose emulators', icon: '🎯', color: 'var(--wf-target)', bg: 'rgba(99,102,241,.15)' },
            { type: 'emu-start', label: 'Start Emulator', sub: 'Launch instance', icon: '⏵', color: 'var(--wf-action)', bg: 'rgba(251,146,60,.15)' },
            { type: 'emu-stop', label: 'Stop Emulator', sub: 'Kill instance', icon: '⏹', color: 'var(--wf-action)', bg: 'rgba(251,146,60,.15)' },
            { type: 'emu-restart', label: 'Restart Emulator', sub: 'Stop then start', icon: '🔄', color: 'var(--wf-action)', bg: 'rgba(251,146,60,.15)' },
        ]
    },
    {
        group: 'Scripts', items: [
            { type: 'script-run', label: 'Run Macro', sub: 'Execute .record file', icon: '⚡', color: 'var(--wf-script)', bg: 'rgba(34,197,94,.12)' },
            { type: 'script-loop', label: 'Loop Script', sub: 'Repeat N times', icon: '🔁', color: 'var(--wf-script)', bg: 'rgba(34,197,94,.12)' },
        ]
    },
    {
        group: 'Scan Operations', items: [
            { type: 'scan-profile', label: 'Profile Scan', sub: 'Name + power level', icon: '👤', color: 'var(--wf-scan)', bg: 'rgba(56,189,248,.12)' },
            { type: 'scan-full', label: 'Full Scan', sub: 'All scans in sequence', icon: '🔍', color: 'var(--wf-scan)', bg: 'rgba(56,189,248,.12)' },
        ]
    },
    {
        group: 'Flow Control', items: [
            { type: 'flow-delay', label: 'Delay', sub: 'Wait N seconds', icon: '⏳', color: 'var(--wf-flow)', bg: 'rgba(167,139,250,.12)' },
        ]
    },
];

const WF_DEFAULTS = {
    'emu-target': { mode: 'tab', tab: 'Farming', count: 4 },
    'emu-start': { delay: 5 },
    'emu-stop': { force: false },
    'emu-restart': { wait: 3 },
    'script-run': { file: 'FARM +4', loop: 1 },
    'script-loop': { file: 'Swap_Charactor', times: 5 },
    'scan-profile': {},
    'scan-full': {},
    'flow-delay': { seconds: 15 }
};

// ═══════════════════════════════════════════════
//  WF TOAST (scoped)
// ═══════════════════════════════════════════════
const WfToast = {
    show(type, title, msg) {
        const zone = document.getElementById('wf-toast-zone');
        if (!zone) return;
        const el = document.createElement('div');
        el.className = `wf-toast ${type}`;
        el.innerHTML = `<div class="wf-t-dot"></div><span><strong>${title}</strong> — ${msg}</span>`;
        zone.appendChild(el);
        setTimeout(() => { el.classList.add('wf-toast-out'); setTimeout(() => el.remove(), 280); }, 2800);
    }
};

// ═══════════════════════════════════════════════
//  WORKFLOW ENGINE V2
// ═══════════════════════════════════════════════
const WF = {
    steps: [], // Array of step objects: { id, type, config }
    idCtr: 0,
    isRunning: false,

    // ── INIT ──
    init() {
        this.steps = [];
        this.idCtr = 0;
        this.isRunning = false;

        this.renderPalette();
        this.loadDemoSequence();
    },

    cleanup() {
        this.steps = [];
    },

    // ── PALETTE ──
    renderPalette() {
        const list = document.getElementById('wf-palette-list');
        if (!list) return;
        list.innerHTML = '';
        WF_ACTIONS.forEach(group => {
            const gl = document.createElement('div');
            gl.className = 'wf-palette-group-label';
            gl.textContent = group.group;
            list.appendChild(gl);

            group.items.forEach(item => {
                const el = document.createElement('div');
                el.className = 'wf-palette-item';
                el.dataset.type = item.type;
                el.onclick = () => this.addStep(item.type);
                el.innerHTML = `<div class="pi-icon" style="background:${item.bg};color:${item.color};">${item.icon}</div><div><div class="pi-label">${item.label}</div><div class="pi-sub">${item.sub}</div></div>`;
                list.appendChild(el);
            });
        });
    },

    getActionDef(type) {
        for (const g of WF_ACTIONS) {
            const f = g.items.find(i => i.type === type);
            if (f) return f;
        }
        return { icon: '?', color: '#999', bg: '#222', label: 'Unknown', sub: '' };
    },

    // ── SEQUENCE MANAGEMENT ──
    addStep(type) {
        if (this.isRunning) {
            WfToast.show('e', 'Locked', 'Cannot edit while workflow is running.');
            return;
        }

        const id = 's_' + (++this.idCtr) + '_' + Date.now();
        const defConfig = WF_DEFAULTS[type] || {};
        const step = {
            id,
            type,
            config: JSON.parse(JSON.stringify(defConfig))
        };

        this.steps.push(step);
        this.renderSequence();
        WfToast.show('s', 'Added', `Added ${this.getActionDef(type).label} step.`);

        // Scroll to bottom
        setTimeout(() => {
            const container = document.querySelector('.wf-linear-builder');
            if (container) container.scrollTop = container.scrollHeight;
        }, 50);
    },

    removeStep(index) {
        if (this.isRunning) return;
        this.steps.splice(index, 1);
        this.renderSequence();
    },

    moveStepUp(index) {
        if (this.isRunning || index === 0) return;
        const temp = this.steps[index];
        this.steps[index] = this.steps[index - 1];
        this.steps[index - 1] = temp;
        this.renderSequence();
    },

    moveStepDown(index) {
        if (this.isRunning || index === this.steps.length - 1) return;
        const temp = this.steps[index];
        this.steps[index] = this.steps[index + 1];
        this.steps[index + 1] = temp;
        this.renderSequence();
    },

    updateStepConfig(index, key, val) {
        if (this.steps[index]) {
            this.steps[index].config[key] = val;
        }
    },

    clearSequence() {
        if (this.isRunning) return;
        if (!confirm('Clear all steps in the sequence?')) return;
        this.steps = [];
        this.renderSequence();

        const s = document.getElementById('wf-status');
        if (s) { s.textContent = 'IDLE'; s.className = 'wf-status'; }

        const rl = document.getElementById('wf-run-log');
        if (rl) rl.classList.remove('visible');
    },

    // ── RENDERING ──
    renderSequence() {
        const container = document.getElementById('wf-sequence-container');
        if (!container) return;

        if (this.steps.length === 0) {
            container.innerHTML = `
                <div class="wf-empty-hint">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <h3>Sequence is empty</h3>
                    <p>Click an action from the left panel to add it to your workflow.</p>
                </div>`;
            return;
        }

        container.innerHTML = '';
        
        this.steps.forEach((step, index) => {
            const def = this.getActionDef(step.type);
            const card = document.createElement('div');
            card.className = 'wf-step-card';
            card.id = `step-card-${index}`;
            
            card.innerHTML = `
                <div class="wf-step-number">${index + 1}</div>
                <div class="wf-step-content">
                    <div class="wf-step-header">
                        <div class="wf-step-icon" style="background:${def.bg};color:${def.color};">${def.icon}</div>
                        <div>
                            <div class="wf-step-title">${def.label}</div>
                            <div class="wf-step-subtitle">${def.sub}</div>
                        </div>
                    </div>
                    ${this.renderStepConfigFields(step, index)}
                </div>
                
                <div class="wf-step-status-indicator" id="step-status-${index}">
                    <span class="wf-status-spinner"></span> Running...
                </div>
                
                <div class="wf-step-actions">
                    <button class="wf-icon-btn" onclick="WF.moveStepUp(${index})" ${index === 0 ? 'disabled style="opacity:0.3;cursor:default;"' : ''}>▲</button>
                    <button class="wf-icon-btn" onclick="WF.moveStepDown(${index})" ${index === this.steps.length - 1 ? 'disabled style="opacity:0.3;cursor:default;"' : ''}>▼</button>
                    <div style="flex:1"></div>
                    <button class="wf-icon-btn danger" onclick="WF.removeStep(${index})">✕</button>
                </div>
            `;
            container.appendChild(card);
        });
    },

    renderStepConfigFields(step, index) {
        const c = step.config;
        let fieldsHtml = '';
        
        const wrapField = (label, inputHtml) => `<div class="wf-cf-field"><span class="wf-cf-label">${label}</span>${inputHtml}</div>`;

        switch (step.type) {
            case 'emu-target':
                fieldsHtml += wrapField('Mode', `<select class="wf-cf-select" onchange="WF.updateStepConfig(${index},'mode',this.value)"><option value="all" ${c.mode === 'all' ? 'selected' : ''}>All running</option><option value="tab" ${c.mode === 'tab' ? 'selected' : ''}>By tab group</option></select>`);
                fieldsHtml += wrapField('Group', `<select class="wf-cf-select" onchange="WF.updateStepConfig(${index},'tab',this.value)"><option ${c.tab === 'All Instances' ? 'selected' : ''}>All Instances</option><option ${c.tab === 'Farming' ? 'selected' : ''}>Farming</option></select>`);
                break;
            case 'emu-start':
                fieldsHtml += wrapField('Delay', `<input class="wf-cf-input" type="number" min="0" max="60" value="${c.delay || 5}" onchange="WF.updateStepConfig(${index},'delay',+this.value)" style="width:60px;" /> sec`);
                break;
            case 'emu-restart':
                fieldsHtml += wrapField('Wait', `<input class="wf-cf-input" type="number" min="1" max="60" value="${c.wait || 3}" onchange="WF.updateStepConfig(${index},'wait',+this.value)" style="width:60px;" /> sec`);
                break;
            case 'script-run':
                fieldsHtml += wrapField('Macro File', `<select class="wf-cf-select" onchange="WF.updateStepConfig(${index},'file',this.value)"><option ${c.file === 'FARM +4' ? 'selected' : ''}>FARM +4</option><option ${c.file === 'Swap_Charactor' ? 'selected' : ''}>Swap_Charactor</option><option ${c.file === 'Auto_Shield' ? 'selected' : ''}>Auto_Shield</option></select>`);
                fieldsHtml += wrapField('Loops', `<input class="wf-cf-input" type="number" min="1" max="100" value="${c.loop || 1}" onchange="WF.updateStepConfig(${index},'loop',+this.value)" style="width:60px;" />`);
                break;
            case 'script-loop':
                fieldsHtml += wrapField('Macro', `<select class="wf-cf-select" onchange="WF.updateStepConfig(${index},'file',this.value)"><option ${c.file === 'Swap_Charactor' ? 'selected' : ''}>Swap_Charactor</option></select>`);
                fieldsHtml += wrapField('Repeat', `<input class="wf-cf-input" type="number" min="1" max="999" value="${c.times || 5}" onchange="WF.updateStepConfig(${index},'times',+this.value)" style="width:60px;" /> times`);
                break;
            case 'flow-delay':
                fieldsHtml += wrapField('Wait Duration', `<input class="wf-cf-input" type="number" min="1" max="3600" value="${c.seconds || 15}" onchange="WF.updateStepConfig(${index},'seconds',+this.value)" style="width:70px;" /> sec`);
                break;
            case 'scan-profile':
            case 'scan-full':
            case 'emu-stop':
                // No extra inline configs needed 
                break;
        }
        
        if(fieldsHtml) {
            return `<div class="wf-step-configs">${fieldsHtml}</div>`;
        }
        return '';
    },

    // ── SAVE ──
    saveWorkflow() {
        if(this.isRunning) return;
        const name = document.getElementById('wf-name-input')?.value || 'Untitled';
        const data = { name, steps: this.steps };
        localStorage.setItem('wf_v2_saved', JSON.stringify(data));
        WfToast.show('s', 'Saved', `Sequence "${name}" saved.`);
    },

    // ── DEMO ──
    loadDemoSequence() {
        this.addStep('emu-target');
        this.steps[0].config = { mode: 'tab', tab: 'Farming' };
        
        this.addStep('script-run');
        this.steps[1].config = { file: 'FARM +4', loop: 1 };
        
        this.addStep('flow-delay');
        this.steps[2].config = { seconds: 15 };
        
        this.addStep('scan-full');
        
        this.addStep('emu-stop');
        
        this.renderSequence();
    },

    // ── EXECUTION ──
    async runWorkflow() {
        if (this.isRunning) return;
        if (this.steps.length === 0) { 
            WfToast.show('e', 'Error', 'No steps in the sequence to run.'); 
            return; 
        }
        
        this.isRunning = true;
        
        // Setup UI for running
        const btn = document.getElementById('wf-btn-run');
        if (btn) { 
            btn.classList.add('running'); 
            btn.innerHTML = `<span class="wf-status-spinner" style="width:11px;height:11px;"></span> Running...`; 
        }
        
        const statusEl = document.getElementById('wf-status');
        if (statusEl) { 
            statusEl.textContent = 'RUNNING'; 
            statusEl.className = 'wf-status status-running'; 
        }
        
        const runLog = document.getElementById('wf-run-log');
        const logBody = document.getElementById('wf-run-log-body');
        if (runLog) runLog.classList.add('visible');
        if (logBody) logBody.innerHTML = '';
        
        const addLog = (type, msg) => {
            if (!logBody) return;
            const t = new Date();
            const ts = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`;
            const line = document.createElement('div');
            line.className = `wf-log-line log-${type}`;
            line.innerHTML = `<span class="log-time">${ts}</span><span>${msg}</span>`;
            logBody.appendChild(line); 
            logBody.scrollTop = logBody.scrollHeight;
        };
        
        // Reset all cards
        document.querySelectorAll('.wf-step-card').forEach(el => {
            el.classList.remove('running', 'success', 'error');
        });

        addLog('info', '▶ Sequence execution started');

        let allOk = true;
        
        // Iterate through steps linearly
        for(let i=0; i<this.steps.length; i++) {
            const step = this.steps[i];
            const def = this.getActionDef(step.type);
            const cardEl = document.getElementById(`step-card-${i}`);
            const indicatorEl = document.getElementById(`step-status-${i}`);
            
            if(cardEl) {
                cardEl.classList.add('running');
                cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            if(indicatorEl) indicatorEl.innerHTML = `<span class="wf-status-spinner"></span> Running...`;
            
            addLog('run', `[Step ${i+1}] ${def.label}...`);
            
            // Artificial delay simulating actual task execution
            const execTime = step.type === 'flow-delay' ? 1200 : 800 + Math.random() * 1000;
            await this.delay(execTime);
            
            // Success probability
            const ok = Math.random() > 0.05; // 95% success rate demo
            
            if (ok) { 
                if(cardEl) {
                    cardEl.classList.remove('running');
                    cardEl.classList.add('success');
                }
                if(indicatorEl) indicatorEl.innerHTML = '✓ Done';
                addLog('ok', `  ✓ ${def.label} complete.`); 
            } else { 
                if(cardEl) {
                    cardEl.classList.remove('running');
                    cardEl.classList.add('error');
                }
                if(indicatorEl) indicatorEl.innerHTML = '✕ Error';
                addLog('err', `  ✕ ${def.label} failed.`); 
                allOk = false; 
                break; // Stop execution on failure in a linear builder
            }
        }
        
        await this.delay(500);
        this.isRunning = false;
        
        // Restore UI
        if (btn) { 
            btn.classList.remove('running'); 
            btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Run Sequence`; 
        }
        
        if (allOk) { 
            if (statusEl) { statusEl.textContent = 'SUCCESS'; statusEl.className = 'wf-status status-success'; } 
            addLog('ok', '✅ Sequence completed successfully'); 
            WfToast.show('s', 'Done', 'Sequence finished!'); 
        } else { 
            if (statusEl) { statusEl.textContent = 'ERROR'; statusEl.className = 'wf-status status-error'; } 
            addLog('err', '❌ Sequence aborted due to error'); 
            WfToast.show('e', 'Error', 'Execution stopped.'); 
        }
    },

    delay(ms) { return new Promise(r => setTimeout(r, ms)); },
};
