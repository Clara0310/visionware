// =====================================
// VisionWave API Controller
// =====================================

// API base URL (auto-detect: same origin as the page)
const API_BASE = window.location.origin;

// State Management
const state = {
    distance_safe: true,  // true = 距離安全 (>= 40cm), false = 距離過近 (< 40cm)
    sitting: false        // true = 偵測到坐著, false = 未偵測到
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 VisionWave API 遙控器啟動');
    console.log('📡 API 端點:', API_BASE + '/api/status');

    // Load saved state from API server
    loadState();

    // Set up event listeners
    setupEventListeners();

    // Update UI
    updateUI();
});

// Load state from API server
async function loadState() {
    try {
        const response = await fetch(API_BASE + '/api/status');
        if (response.ok) {
            const data = await response.json();
            state.distance_safe = data.distance_safe;
            state.sitting = data.sitting;
            updateUI();
            console.log('📥 已從伺服器載入狀態:', state);
        }
    } catch (error) {
        console.error('❌ 載入狀態失敗:', error);
    }
}

// Save state to API server
async function saveState() {
    try {
        const response = await fetch(API_BASE + '/api/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state)
        });
        if (response.ok) {
            console.log('💾 已儲存狀態到伺服器:', state);
        }
    } catch (error) {
        console.error('❌ 儲存狀態失敗:', error);
    }
    updateUI();
}

// Setup event listeners
function setupEventListeners() {
    const distanceToggle = document.getElementById('distance-toggle');
    const sittingToggle = document.getElementById('sitting-toggle');

    distanceToggle.addEventListener('change', (e) => {
        state.distance_safe = e.target.checked;
        saveState();
        showNotification('distance_safe', e.target.checked);
    });

    sittingToggle.addEventListener('change', (e) => {
        state.sitting = e.target.checked;
        saveState();
        showNotification('sitting', e.target.checked);
    });
}

// Update UI
function updateUI() {
    // Update toggles
    document.getElementById('distance-toggle').checked = state.distance_safe;
    document.getElementById('sitting-toggle').checked = state.sitting;

    // Update labels
    const distanceLabel = document.getElementById('distance-label');
    const sittingLabel = document.getElementById('sitting-label');

    distanceLabel.textContent = state.distance_safe ? '安全 (true)' : '過近 (false)';
    distanceLabel.style.color = state.distance_safe ? '#10b981' : '#ef4444';

    sittingLabel.textContent = state.sitting ? '偵測到 (true)' : '未偵測 (false)';
    sittingLabel.style.color = state.sitting ? '#f472b6' : '#718096';

    // Update JSON display
    const jsonOutput = document.getElementById('json-output');
    jsonOutput.textContent = JSON.stringify(state, null, 2);
}

// Show notification (visual feedback)
function showNotification(field, value) {
    const messages = {
        'distance_safe_true': '✅ 設定為安全距離',
        'distance_safe_false': '⚠️ 設定為距離過近',
        'sitting_true': '🪑 設定為正在久坐',
        'sitting_false': '🚶 設定為未偵測到'
    };

    const key = `${field}_${value}`;
    console.log(messages[key]);
}

// Quick scenario presets
function setScenario(scenario) {
    switch (scenario) {
        case 'safe':
            // 理想狀態：安全距離，未久坐
            state.distance_safe = true;
            state.sitting = false;
            break;

        case 'distance-warning':
            // 距離警告：距離過近（需要偵測到人才有效）
            state.distance_safe = false;
            state.sitting = true;
            break;

        case 'sitting':
            // 久坐：只設定有人坐著，不改變視距狀態
            state.sitting = true;
            break;

        case 'danger':
            // 危險狀態：距離過近且久坐
            state.distance_safe = false;
            state.sitting = true;
            break;
    }

    saveState();

    // 久坐場景同時觸發立即警示
    if (scenario === 'sitting') {
        fetch(API_BASE + '/api/test-alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Visual feedback
    const btn = event.target.closest('.action-btn');
    if (btn) {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);
    }

    console.log(`🎬 場景設定: ${scenario}`, state);
}

// Make setScenario globally accessible
window.setScenario = setScenario;

// Test alert trigger (透過 API 跨裝置)
function triggerTestAlert() {
    fetch(API_BASE + '/api/test-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }).then(() => {
        console.log('🧪 已觸發測試久坐警示');
    }).catch(error => {
        console.error('❌ 觸發測試警示失敗:', error);
    });
}

// Make triggerTestAlert globally accessible
window.triggerTestAlert = triggerTestAlert;

console.log('✅ VisionWave API 遙控器準備就緒');
console.log('💡 開啟主監測頁面 (index.html) 進行測試');
