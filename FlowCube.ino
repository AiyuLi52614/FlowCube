// FlowCube - M5Stack Core2 主程序 (极简纯净版)
// 功能：IMU 绝对 2 秒防抖 + 超大字体纯净显示 + 亮蓝色调优 + WebSocket / HTTP 上报

#include <M5Unified.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>
#include "config.h"

// ── 检测阈值 ──────────────────────────────────────────────────────
#define TILT_THRESHOLD   0.8f   // 按规格：0.8 G
#define POLL_INTERVAL_MS 50     // IMU 采样间隔（ms）
#define PING_INTERVAL_MS 20000  // WebSocket keepalive 间隔（ms）

// ── 姿态定义 ──────────────────────────────────────────────────────
enum Face { FACE_IDLE, FACE_STUDY, FACE_PAUSE, FACE_SPORT, FACE_REST, FACE_UNKNOWN };

const char* faceActions[] = { "idle", "study", "pause", "exercise", "rest", "unknown" };

// ── 全局状态 ──────────────────────────────────────────────────────
Face     currentFace  = FACE_UNKNOWN;
Face     pendingFace  = FACE_UNKNOWN;
Face     lastSentFace = FACE_UNKNOWN;

uint32_t stableStartTime = 0;   // 用于精确记录 2 秒防抖的时间戳
bool     wsConnected  = false;
bool     wifiConnected = false;
uint32_t lastPingMs   = 0;
uint32_t lastImuMs    = 0;

WebSocketsClient wsClient;

// ─────────────────────────────────────────────────────────────────
// 震动与声音控制
// ─────────────────────────────────────────────────────────────────
void vibrate(int count, int onMs, int offMs) {
  for (int i = 0; i < count; i++) {
    M5.Power.setVibration(255); 
    delay(onMs);
    M5.Power.setVibration(0);   
    if (i < count - 1) delay(offMs);
  }
}

void playStudySound() { M5.Speaker.tone(2000, 150); }
void playSportSound() { 
  M5.Speaker.tone(1000, 100); 
  delay(120);
  M5.Speaker.tone(1000, 100);
}
void playPauseSound() { M5.Speaker.tone(1500, 100); }
void playEndSound()   { M5.Speaker.tone(500, 400);  }

// ─────────────────────────────────────────────────────────────────
// 极简屏幕绘制 (仅显示超大状态文字)
// ─────────────────────────────────────────────────────────────────
void drawScreen(Face face) {
  uint32_t bg = TFT_BLACK;
  String displayText = "";

  switch (face) {
    case FACE_STUDY: 
      bg = M5.Display.color565(0, 170, 255); 
      displayText = "study"; 
      break;
    case FACE_PAUSE:
      bg = M5.Display.color565(100, 100, 100);
      displayText = "pause";
      break;
    case FACE_SPORT: 
      bg = TFT_RED;   
      displayText = "sport"; 
      break;
    case FACE_REST:   
      bg = TFT_GREEN; 
      displayText = "end"; 
      break;
    default:         
      bg = TFT_BLACK; 
      displayText = "ready"; 
      break;
  }
  M5.Display.fillScreen(bg);

  // 文字颜色：绿色背景用黑字，其余用白字，待机用灰色
  uint32_t fg = (face == FACE_REST) ? TFT_BLACK : TFT_WHITE;
  if (face == FACE_IDLE || face == FACE_UNKNOWN) fg = 0x555555;

  // 修改点 2: 极简 UI，只有超大的状态文字
  M5.Display.setTextColor(fg);
  M5.Display.setTextDatum(MC_DATUM); // 设置绝对居中对齐
  M5.Display.setTextSize(6);         // 设置超大字号
  M5.Display.drawString(displayText, 160, 120); // 在屏幕正中心绘制
}

// ─────────────────────────────────────────────────────────────────
// 姿态事件处理
// ─────────────────────────────────────────────────────────────────
void handleFaceEvent(Face face) {
  drawScreen(face);

  switch (face) {
    case FACE_STUDY:
      playStudySound(); vibrate(1, 100, 0); break;
    case FACE_PAUSE:
      playPauseSound(); vibrate(1, 50, 0); break;
    case FACE_SPORT:
      playSportSound(); vibrate(2, 100, 120); break;
    case FACE_REST:
      playEndSound();   vibrate(1, 400, 0); break;
    default:
      return;  
  }

  // 串口 JSON 打印
  StaticJsonDocument<64> serialDoc;
  serialDoc["action"] = faceActions[face];
  serializeJson(serialDoc, Serial);
  Serial.println();

  // WebSocket 发送
  if (wsConnected) {
    StaticJsonDocument<128> wsDoc;
    wsDoc["type"]      = "orientation";
    wsDoc["device_id"] = DEVICE_ID;
    wsDoc["face"]      = faceActions[face];
    wsDoc["timestamp"] = millis();
    char wsBuf[128];
    serializeJson(wsDoc, wsBuf);
    wsClient.sendTXT(wsBuf);
  }

  // HTTP POST
  if (wifiConnected) {
    HTTPClient http;
    char url[96];
    snprintf(url, sizeof(url), "http://%s:%d/device/orientation", SERVER_HOST, SERVER_PORT);
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<128> postDoc;
    postDoc["deviceId"]    = DEVICE_ID;
    postDoc["event"]       = "flip";
    postDoc["orientation"] = faceActions[face];
    postDoc["ts"]          = (uint32_t)(millis() / 1000);
    char postBuf[128];
    serializeJson(postDoc, postBuf);

    http.POST(postBuf);
    http.end();
  }
}

// ─────────────────────────────────────────────────────────────────
// IMU 翻转检测 
// ─────────────────────────────────────────────────────────────────
Face detectFace() {
  float ax = 0.0, ay = 0.0, az = 0.0;
  M5.Imu.getAccel(&ax, &ay, &az); 

  if (az >  TILT_THRESHOLD) return FACE_STUDY; // 屏幕朝上
  if (ax >  TILT_THRESHOLD) return FACE_SPORT; // 向左翻转 (Gravity on +X)
  if (ax < -TILT_THRESHOLD) return FACE_PAUSE; // 向右翻转 (Gravity on -X)
  if (ay < -TILT_THRESHOLD) return FACE_REST;  // 向前翻转 (Gravity on -Y)

  return FACE_IDLE;
}

// ─────────────────────────────────────────────────────────────────
// 网络底层代码 (WebSocket & WiFi)
// ─────────────────────────────────────────────────────────────────
void sendHandshake() {
  StaticJsonDocument<128> doc;
  doc["type"] = "handshake"; doc["client_type"] = "device"; doc["device_id"] = DEVICE_ID;
  char buf[128]; serializeJson(doc, buf); wsClient.sendTXT(buf);
}
void sendPing() {
  StaticJsonDocument<64> doc; doc["type"] = "ping";
  char buf[64]; serializeJson(doc, buf); wsClient.sendTXT(buf);
}

void onWsEvent(WStype_t type, uint8_t* payload, size_t length) {
  if (type == WStype_CONNECTED) { wsConnected = true; sendHandshake(); }
  else if (type == WStype_DISCONNECTED) { wsConnected = false; }
}

void connectWiFi() {
  M5.Display.fillScreen(TFT_BLACK);
  M5.Display.setTextColor(0x888888);
  M5.Display.setTextDatum(MC_DATUM);
  M5.Display.setTextSize(2);
  M5.Display.drawString("Connecting WiFi...", 160, 120);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500); attempts++;
  }
  wifiConnected = (WiFi.status() == WL_CONNECTED);
}

// ─────────────────────────────────────────────────────────────────
// Setup & Loop
// ─────────────────────────────────────────────────────────────────
void setup() {
  auto cfg = M5.config();  
  M5.begin(cfg);
  Serial.begin(115200);
  
  M5.Display.setBrightness(255); // 屏幕最高亮度（为了透光）
  M5.Speaker.setVolume(128);     // 开启喇叭音量

  connectWiFi();

  if (wifiConnected) {
    wsClient.begin(SERVER_HOST, SERVER_PORT, SERVER_PATH);
    wsClient.onEvent(onWsEvent);
    wsClient.setReconnectInterval(5000);
  }

  currentFace = detectFace();
  pendingFace = currentFace;
  lastSentFace = FACE_UNKNOWN;
  drawScreen(currentFace);
}

void loop() {
  M5.update(); 
  uint32_t now = millis();

  // 网络保活
  if (wifiConnected) {
    wsClient.loop();
    if (wsConnected && (now - lastPingMs > PING_INTERVAL_MS)) {
      sendPing(); lastPingMs = now;
    }
  }

  // 修改点 1: 精确的 2 秒绝对时间防抖
  if (now - lastImuMs >= POLL_INTERVAL_MS) {
    lastImuMs = now;
    Face raw = detectFace();

    if (raw != pendingFace) {
      // 姿态发生变化，重置防抖计时器
      pendingFace = raw;
      stableStartTime = now; 
    } else {
      // 如果当前姿态已经连续保持了 2000 毫秒（2秒）！
      if (now - stableStartTime >= 2000) {
        if (currentFace != pendingFace) {
          currentFace = pendingFace;
          
          // 如果是一个有意义的面，且和上次发出的不同，则触发动作
          if (currentFace != FACE_IDLE && currentFace != FACE_UNKNOWN) {
            if (currentFace != lastSentFace) {
              lastSentFace = currentFace;
              handleFaceEvent(currentFace);
            }
          } else {
            // 处于中间未定义角度，恢复 "ready" 界面
            drawScreen(currentFace);
            lastSentFace = FACE_UNKNOWN;
          }
        }
      }
    }
  }

  delay(10);
}