"""
VisionWave Guardian - API Server
簡易 Flask 伺服器，用於跨裝置的 controller ↔ 主頁面溝通
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# 共享狀態（記憶體中）
shared_state = {
    "distance_safe": True,
    "sitting": False
}

# 測試警示觸發旗標
test_alert_pending = {"triggered": False}


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/controller.html')
def controller():
    return send_from_directory('.', 'controller.html')


@app.route('/api/status', methods=['GET'])
def get_status():
    """主頁面輪詢此端點取得狀態"""
    return jsonify(shared_state)


@app.route('/api/status', methods=['POST'])
def update_status():
    """Controller 透過此端點更新狀態"""
    global shared_state
    data = request.get_json()
    if data:
        if 'distance_safe' in data:
            shared_state['distance_safe'] = bool(data['distance_safe'])
        if 'sitting' in data:
            shared_state['sitting'] = bool(data['sitting'])
    return jsonify(shared_state)


@app.route('/api/test-alert', methods=['POST'])
def trigger_test_alert():
    """Controller 觸發測試久坐警示"""
    test_alert_pending["triggered"] = True
    return jsonify({"status": "ok"})


@app.route('/api/test-alert', methods=['GET'])
def check_test_alert():
    """主頁面輪詢是否有測試警示"""
    triggered = test_alert_pending["triggered"]
    if triggered:
        test_alert_pending["triggered"] = False
    return jsonify({"triggered": triggered})

if __name__ == '__main__':
    print("🚀 VisionWave Guardian API Server")
    print("📡 主頁面: http://localhost:8000")
    print("🎮 遙控器: http://localhost:8000/controller.html")
    print("📊 API:    http://localhost:8000/api/status")
    app.run(host='0.0.0.0', port=8000, debug=True)
