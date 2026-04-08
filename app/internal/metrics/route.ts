import { NextResponse } from "next/server"
import Prometheus from "prom-client"

// Register default metrics on first import
Prometheus.collectDefaultMetrics()

export async function GET() {
  const metrics = await Prometheus.register.metrics()
  return new NextResponse(metrics, {
    headers: { "Content-Type": Prometheus.register.contentType },
  })
}
