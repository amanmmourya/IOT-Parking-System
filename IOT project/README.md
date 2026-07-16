# 🚗 IoT-Based Smart Parking System

An IoT-based Smart Parking System that provides **real-time parking slot monitoring** with a live web dashboard. The system uses **ESP32** and **HC-SR04 ultrasonic sensors** to detect vehicle occupancy and instantly updates the frontend using **WebSockets** for low-latency communication.

## 🚀 Features

* Real-time parking slot occupancy detection
* Live dashboard built with React
* Low-latency updates using WebSockets
* ESP32-based embedded controller
* HC-SR04 ultrasonic sensors for accurate vehicle detection
* Responsive and easy-to-use interface

## 🛠️ Tech Stack

* **Frontend:** React.js
* **Embedded:** ESP32
* **Communication:** WebSockets
* **Sensors:** HC-SR04 Ultrasonic Sensors

## 📌 How It Works

1. HC-SR04 sensors detect whether a parking slot is occupied.
2. ESP32 processes the sensor data.
3. Occupancy status is transmitted via WebSockets.
4. The React dashboard updates instantly, displaying live parking availability.

## 🎯 Future Improvements

* Parking reservation system
* Cloud data storage and analytics
* Mobile application support
* RFID/ANPR-based vehicle authentication
