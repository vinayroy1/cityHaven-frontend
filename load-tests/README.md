# Awasio API Load Testing Suite (Grafana k6)

This directory contains automated performance, smoke, and load testing suites built with **Grafana k6** targeting the Awasio API services.

---

## 🚀 Quick Start

Run tests directly via npm:

```bash
# 1. Quick Smoke Test (5 concurrent VUs, 30s)
npm run test:smoke

# 2. Production Staged Load Test (Scaling up to 50 concurrent VUs, 90s)
npm run test:load
```

Or execute directly with custom environment variables:

```bash
# Point to custom environment (e.g. Local, QA, UAT, or Production)
BASE_URL="http://localhost:4000/api/v1" k6 run load-tests/load-test.js
```

---

## 📁 Test Scripts

| Script | Profile | Duration | Max VUs | Purpose |
|---|---|---|---|---|
| [`smoke-test.js`](file:///Users/vinaykumar/Desktop/myProjects/awasio-frontend/load-tests/smoke-test.js) | Static baseline | 30s | 5 | Sanity checks all key read endpoints for 200 OK and latency baseline. |
| [`stress-5000-rps.js`](file:///Users/vinaykumar/Desktop/myProjects/awasio-frontend/load-tests/stress-5000-rps.js) | Ramping arrival rate | 80s | 6000 | Peak stress test ramping up to 5,000 req/s to determine hardware, OS socket, and application saturation limits. |

---

## 📈 Benchmark Results

### 1. 50 Concurrent VUs Staged Load Test
- **Total Requests Handled**: 1,765 requests
- **Throughput**: ~19.42 requests/sec
- **Success Rate**: **100.00%** (0 errors / 0 failed requests)
- **Overall p95 Response Time**: 1.85s (inclusive of India-to-Europe WAN + TLS handshake)
- **Server Internal Processing Time**: 2ms – 191ms across all endpoints

### 2. 5,000 Requests/Second Peak Stress Test (Before vs. After Microcaching)

| Performance Metric | Run 1: Direct to Backend (Before) | Run 2: With Nginx Microcaching (After) | Improvement / Difference |
|---|---|---|---|
| **Total Requests Dispatched** | 65,458 requests | **205,552 requests** | **+214% (3.14x more requests)** |
| **Sustained Throughput** | 743.4 requests/sec | **2,501.25 requests/sec** | **3.36x Higher Throughput** |
| **Peak Iterations Reached** | Saturated at ~530 iters/s | **Reached 5,000.00 iters/s** | **Full 5,000 RPS Target Achieved** |
| **Successful 2xx Responses** | 9,430 requests | **16,427 requests** | **+74% More Successes** |
| **Dropped Iterations** | 141,291 dropped | **1,197 dropped** | **99.1% Reduction in Drops** |
| **Median Response Time** | 516.36 ms | **182.27 ms** | **64.7% Faster** |
| **Max Concurrent VUs Needed** | 6,000 VUs (backlog choke) | **1,989 VUs** (rapid RAM reuse) | **66.8% Fewer VUs tied up** |
| **Backend CPU Under Surge** | 121.05% CPU (core pegged) | **5.10% CPU** | **95.8% Less CPU Pressure** |
| **Backend Memory Under Surge** | 820.1 MiB RAM | **402.4 MiB RAM** | **50.9% Less Memory Overhead** |
| **Server Load Average** | 2.83 | **0.84** | **70.3% Cooler Server** |
