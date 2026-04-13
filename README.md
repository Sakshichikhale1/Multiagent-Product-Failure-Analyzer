# OpsPulse 🔍

**Real-time Observability and AI-driven Root Cause Analysis for Modern Microservices**

InsightStream is a proactive observability platform that moves teams beyond reactive incident response. By combining real-time data streaming with AI-powered diagnostics, it significantly reduces Mean Time To Detect (MTTD) and Mean Time To Resolve (MTTR) across complex microservice environments.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Failure Scenarios](#failure-scenarios)
- [Pipeline](#pipeline)
- [Dashboard](#dashboard)
- [Multi-Agent Diagnosis](#multi-agent-diagnosis)
- [Challenges & Roadmap](#challenges--roadmap)

---

## Overview

Modern microservices generate massive volumes of logs and metrics, making manual monitoring nearly impossible. InsightStream tackles this by providing:

- **Real-time monitoring** of critical system health indicators
- **AI-powered root cause analysis** for rapid diagnostics
- **Actionable resolution steps** — not just detection, but proactive problem-solving

---

## Features

- 📡 **Real-time Metrics Streaming** — Live updates on CPU, memory, latency, and other KPIs
- 🧪 **Log Simulation** — Generates diverse log entries to test system states and failure scenarios
- 🚨 **Automated Failure Detection** — Identifies predefined anomaly patterns automatically
- 🤖 **AI-based Root Cause Analysis** — Intelligent diagnosis and suggested remediation via LLM
- 🖥️ **Live Dashboard** — Centralized command center for system health visualization

---

## Architecture

InsightStream follows an end-to-end data flow pipeline:

```
Simulator → WebSocket → Threshold Engine → LLM Analysis → Dashboard
```

| Component | Role |
|---|---|
| **Simulator** | Generates realistic logs, metrics, and failure scenarios |
| **WebSocket** | Provides low-latency, bidirectional real-time data streaming |
| **Threshold Engine** | Detects anomalies by comparing incoming data against baselines |
| **LLM (Claude API)** | Performs root cause analysis and suggests actionable fixes |
| **Dashboard** | Visualizes alerts, diagnostics, and resolution steps |

This modular design ensures scalability and efficient processing at every stage.

---

## Tech Stack

### Frontend
- **React** with **Vite** — Fast, modern UI framework
- **TypeScript** — Type-safe development
- **TailwindCSS** — Utility-first styling
- **Shadcn UI** — Accessible component library
- **Recharts** — Dynamic and interactive data visualizations

### Backend & AI
- **Supabase** — Database and serverless functions
- **Claude API** (via Edge Functions) — Advanced NLP for root cause analysis
- **WebSockets** — Real-time, bidirectional communication (eliminates HTTP polling overhead)

---

## Failure Scenarios

InsightStream can simulate the following common production incidents:

| Scenario | Description |
|---|---|
| **Memory Leak** | Gradual resource consumption leading to crashes |
| **DB Timeout** | Database connection issues and their downstream impact |
| **API Failure** | External service dependency failures |
| **Disk Full** | Storage exhaustion halting operations |
| **Deployment Regression** | New code introducing performance bottlenecks |
| **SSL Expiry** | Critical certificate renewal failures |

These simulations validate InsightStream's detection and analysis capabilities against real-world problems.

---

## Pipeline

A detailed trace of the InsightStream pipeline from data generation to diagnosis:

1. **Simulator** emits high-fidelity logs and metrics, including induced failure patterns
2. **WebSocket** transmits data in real-time with low latency to the monitoring service
3. **Threshold Engine** identifies anomalies by comparing data against established baselines
4. **LLM** processes anomalous data to pinpoint root causes and suggest actionable fixes
5. **Dashboard** displays alerts, detailed diagnostics, and step-by-step resolution guidance

### WebSocket & LLM Integration

- WebSockets maintain a persistent, bidirectional channel — eliminating the overhead of traditional HTTP polling and enabling real-time synchronization across multiple clients
- When anomalies are detected, relevant logs and metrics are automatically ingested by the LLM
- The AI performs contextual pattern recognition and correlation via the Claude API to deliver intelligent root cause identification and remediation steps

---

## Dashboard

The InsightStream dashboard is designed for rapid incident response and includes:

- **Real-time Charts** — Dynamic visualizations of CPU, Memory, and Latency
- **Live Logs Panel** — Streaming system logs with severity-based filtering and search
- **Incident Analysis Section** — AI-generated root cause summaries and suggested fixes
- **Interactive Failure Controls** — Manually inject failure scenarios for testing and validation

---

## Multi-Agent Diagnosis

InsightStream extends its AI capabilities through a **multi-agent collaborative diagnosis** system powered by **CrewAI**:

| Agent | Focus |
|---|---|
| **Infrastructure Agent** | Hardware metrics — CPU, RAM, and system-level signals |
| **App Log Agent** | Application logs — error patterns and stack traces |
| **Business Impact Agent** | Real-world cost assessment of ongoing incidents |

These agents collaborate through a CrewAI flow, debating and reaching a **unified diagnostic consensus** — providing a more comprehensive and accurate root cause analysis than any single agent could achieve alone.

---

## Challenges & Roadmap

### Challenges Overcome
- Real-time data processing at scale
- LLM prompt engineering for precise root cause analysis
- Simulator fidelity for realistic failure injection
- WebSocket scalability under high-volume conditions

### Future Enhancements
- 🔔 **Proactive Alerting** — Notify before incidents become critical
- 🧠 **ML-based Anomaly Detection** — Catch subtle patterns beyond threshold rules
- ☁️ **Cloud-native Deployment** — Kubernetes-ready, scalable infrastructure
- 🤖 **Automated Remediation** — Close the loop from detection to resolution automatically

---


**Team Cipher** — Building the future of intelligent observability.
