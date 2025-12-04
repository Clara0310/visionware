import h5py
import numpy as np

file_path = "/Users/zhongfuqian/Desktop/毫米波雷達＿模型訓練/_0001_2025_11_06_22_25_33.h5"

# ===== 門檻（可自行調整）=====
range_bin_threshold = 1              # 距離門檻（越小越靠近）
presence_strength_threshold = -50     # 強度門檻（判斷是否有人）

outputs = []   # 儲存每幀的偵測結果

with h5py.File(file_path, "r") as f:
    AXIS = f["AXIS"][:]   # shape = (N, 3)
    
    # 逐筆 frame 偵測，X速度,Y距離, Z強度
    for i in range(AXIS.shape[0]):
        speed_bin = AXIS[i, 0]
        distance_bin = AXIS[i, 1]
        strength_db = AXIS[i, 2]

        # --- Presence (有人嗎？) ---
        sitting = bool(strength_db > presence_strength_threshold)

        # --- Distance safe? (是否太靠近) ---
        distance_safe = bool(distance_bin >= range_bin_threshold)

        outputs.append({
            "distance_safe": distance_safe,
            "sitting": sitting
        })

# 展示前 10 筆結果
for i in range(10):
    print(f"Frame {i}: {outputs[i]}")
