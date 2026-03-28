# Monitoring — Prometheus + Grafana

Monitor your app's health, performance, and errors in real-time.

## What is Monitoring?

| Tool | What it does | Analogy |
|------|-------------|---------|
| **Prometheus** | Collects metrics (CPU, memory, request count) | A health sensor |
| **Grafana** | Displays dashboards with charts | A TV showing vital signs |
| **CloudWatch** | AWS-specific monitoring | Built-in AWS health monitor |
| **Alertmanager** | Sends alerts (email, Slack) | A nurse who pages the doctor |

## What You'll Monitor

| Metric | Why it matters |
|--------|---------------|
| **Response time** | Are API calls getting slow? |
| **Error rate** | How many 500 errors per minute? |
| **Request count** | How much traffic are you getting? |
| **CPU usage** | Is the server overloaded? |
| **Memory usage** | Is the app leaking memory? |
| **DB connections** | Are MongoDB connections healthy? |

## Architecture

```
Your App --> Prometheus (scrapes metrics every 15s) --> Grafana (displays dashboards)
                                                    --> Alertmanager (sends alerts)
```

## Exercise Files (we'll create these step by step)

```
monitoring/
  docker-compose.monitoring.yml  # Prometheus + Grafana containers
  prometheus.yml                  # What to monitor
  grafana/
    dashboards/                   # Pre-built dashboards
```

## Coming Soon
This exercise will be built when you're ready for Phase 7.
