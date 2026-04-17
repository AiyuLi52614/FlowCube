// FlowCube M5Stack 配置文件
// 复制此文件为 config.h 并填入真实值。config.h 已加入 .gitignore，不会提交到版本库。

#pragma once

// WiFi
#define WIFI_SSID     "小美"
#define WIFI_PASSWORD "minjiminji"

// FlowCube 后端服务器（运行 Web_MVP/server 的主机）
#define SERVER_HOST "192.168.43.10"
#define SERVER_PORT 3000
#define SERVER_PATH "/ws"

// 设备唯一标识符（多设备时请修改）
#define DEVICE_ID "m5stack-flowcube-01"
