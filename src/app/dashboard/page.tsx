'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'
import Icon from '@/components/ui/icon'
import { TrendingUp, TrendingDown } from 'lucide-react'

// Mock data based on the dashboard image
const performanceData = [
  { category: 'On-time', value: 25, color: '#4ade80' },
  { category: 'Average', value: 85, color: '#a3e635' },
  { category: 'Inefficient', value: 30, color: '#f87171' }
]

const fuelEfficiencyData = [
  { category: 'Fuel Efficiency', efficiency: 7.8, compliance: 0 },
  { category: 'Productivity', efficiency: 6.5, compliance: 0 },
  { category: 'Compliance', efficiency: 6.8, compliance: 0 }
]

const vehiclePerformanceData = [
  { id: 'TRK-481', tcss: 10.5, mileage: 7.4, idleRatio: '10%', status: 'active' },
  { id: 'TRK-485', tcss: 4.1, mileage: 2.3, idleRatio: '10%', status: 'active' },
  { id: 'TRK-322', tcss: 4.1, mileage: 7.8, idleRatio: '18%', status: 'inactive' },
  { id: 'TRK-490', tcss: 2.9, mileage: 3.6, idleRatio: '0%', status: 'critical' },
  { id: 'TRK-203', tcss: 7.4, mileage: 5.4, idleRatio: '45%', status: 'critical' },
  { id: 'TRK-562', tcss: 45.9, mileage: 30, idleRatio: '0%', status: 'critical' }
]

const alertsData = [
  { id: 1, title: 'Excessive Delivery Wait Time', priority: 'high', count: 12 },
  { id: 2, title: 'Faulty Fuel Injector', priority: 'high', count: 8 },
  { id: 3, title: 'Driver Inefficiency', priority: 'medium', count: 6 },
  { id: 4, title: 'Overloaded Cargo', priority: 'medium', count: 5 },
  { id: 5, title: 'Tire Pressure Issues', priority: 'low', count: 4 }
]

const anomalyData = [
  { id: 'TRK-562', status: 'Standby', lastTCSS: '52.3', rootCause: 'Faulty Fuel Injector' },
  { id: 'TRK-677', status: 'Standby', lastTCSS: '52.3', rootCause: 'Awaiting Pickup' }
]

const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue,
  icon 
}: { 
  title: string
  value: string | number
  subtitle: string
  trend?: 'up' | 'down'
  trendValue?: string
  icon?: React.ReactNode
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="relative overflow-hidden border-primary/10 bg-gradient-to-br from-background to-accent/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-primary/80">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trend === 'up' ? 'text-positive' : 'text-destructive'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
)

const DashboardPage = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex h-screen w-full bg-background">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Icon type="gemini" size="sm" className="text-primary" />
                Truck Fleet Operational Insights
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Real-time Analytics Dashboard</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">View Period:</span>
              <select className="bg-accent border border-primary/10 rounded-lg px-3 py-1.5">
                <option>Monthly - North - Semi Truck</option>
              </select>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <KPICard
              title="Fleet Average TCSS"
              value="71.5"
              subtitle="Truck Composite Score: 340.845 km"
              trend="up"
              trendValue="+5.2% from last month"
              icon={<Icon type="activity" size="sm" />}
            />
            <KPICard
              title="Inefficient Vehicles (TCSS < 83)"
              value="18"
              subtitle="Vehicles requiring attention"
              trend="down"
              trendValue="-2 from last week"
              icon={<Icon type="alert-triangle" size="sm" />}
            />
            <KPICard
              title="Idle Time Ratio"
              value="22%"
              subtitle="Average idle time: 350.00 hrs"
              trend="down"
              trendValue="-3% improvement"
              icon={<Icon type="clock" size="sm" />}
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance Distribution */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle className="text-base">Performance Distribution</CardTitle>
                  <CardDescription>Fleet performance categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: 'Vehicles',
                        color: 'hsl(var(--chart-1))'
                      }
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="category" className="text-xs" />
                        <YAxis className="text-xs" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {performanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Fuel Efficiency Analysis */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle className="text-base">Factor Analysis</CardTitle>
                  <CardDescription>Truck Composite Score Metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      efficiency: {
                        label: 'Score',
                        color: 'hsl(var(--chart-2))'
                      }
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fuelEfficiencyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="category" className="text-xs" />
                        <YAxis className="text-xs" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="efficiency" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Vehicle Performance Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-base">Vehicle Performance Leaderboard</CardTitle>
                <CardDescription>Real-time fleet status monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-primary/10">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Truck ID</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">TCSS</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Mileage (km/L)</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Idle Ratio</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehiclePerformanceData.map((vehicle, idx) => (
                        <motion.tr
                          key={vehicle.id}
                          className="border-b border-primary/5 hover:bg-accent/50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <td className="py-3 px-4 font-medium">{vehicle.id}</td>
                          <td className="py-3 px-4">{vehicle.tcss}</td>
                          <td className="py-3 px-4">{vehicle.mileage}</td>
                          <td className="py-3 px-4">{vehicle.idleRatio}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              vehicle.status === 'active' 
                                ? 'bg-positive/20 text-positive' 
                                : vehicle.status === 'inactive'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-destructive/20 text-destructive'
                            }`}>
                              {vehicle.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bottom Row - Alerts and Anomalies */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top 5 Root Causes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-primary/10 bg-gradient-to-br from-purple-500/5 to-background">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon type="alert-triangle" size="sm" className="text-purple-500" />
                    Top 5 Root Causes
                  </CardTitle>
                  <CardDescription>Critical issues requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alertsData.map((alert, idx) => (
                      <motion.div
                        key={alert.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.05 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-medium">
                            #{alert.id}
                          </span>
                          <span className="text-sm font-medium">{alert.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            alert.priority === 'high' 
                              ? 'bg-destructive/20 text-destructive' 
                              : alert.priority === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-blue-500/20 text-blue-500'
                          }`}>
                            {alert.priority}
                          </span>
                          <span className="text-sm font-bold text-foreground">{alert.count}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Anomaly Detection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <Card className="border-primary/10 bg-gradient-to-br from-orange-500/5 to-background">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon type="activity" size="sm" className="text-orange-500" />
                    Anomaly Detection & Memory Queue
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Detected Anomalies:</span>
                        <span className="text-lg font-bold text-orange-500">5</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Memory (Verify Rec Rate):</span>
                        <span className="text-lg font-bold text-primary">75%</span>
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-primary/10">
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Truck ID</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Last TCSS</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Root Cause</th>
                        </tr>
                      </thead>
                      <tbody>
                        {anomalyData.map((anomaly, idx) => (
                          <motion.tr
                            key={anomaly.id}
                            className="border-b border-primary/5 hover:bg-accent/50 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + idx * 0.05 }}
                          >
                            <td className="py-3 px-3 font-medium">
                              <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-destructive/20 text-destructive">
                                {anomaly.id}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-500">
                                {anomaly.status}
                              </span>
                            </td>
                            <td className="py-3 px-3">{anomaly.lastTCSS}</td>
                            <td className="py-3 px-3 text-muted-foreground">{anomaly.rootCause}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            className="text-center text-xs text-muted-foreground py-4 border-t border-primary/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p>© 2025 - Dashboard © 2025 - Powered by AI-driven Fleet Intelligence</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
