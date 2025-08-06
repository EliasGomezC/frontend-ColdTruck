import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  Droplets,
  Home,
  MapPin,
  ThermometerSun,
  TrendingDown,
  TrendingUp,
  Truck,
} from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { getOrderedAlerts } from "../services/alertService"
import { getSensorReadingsForStackedChart } from "../services/sensorReadingService"
import { getInTransitTripCount, getScheduledTripCount } from "../services/tripService"
import { getAvailableTruckCount } from "../services/truckService"
import type { Alert2 } from "../types/Alert2"

interface SensorReadingChartPoint {
  dateTime: string
  temperature: number
  humidity: number
}

interface Alert {
  IDAlert: number
  dateTime: string
  IDTrip: number
  IDTruck: number
  IDBox: number
  IDDriver: {
    name: string
    lastName: string
    secondLastName: string
  }
  humidity?: number
  temperature?: number
}

const Dashboard: React.FC = () => {
  const [chartData, setChartData] = useState<SensorReadingChartPoint[]>([])
  const [inTransitTrips, setInTransitTrips] = useState(0)
  const [scheduledTrips, setScheduledTrips] = useState(0)
  const [availableTrucks, setAvailableTrucks] = useState(0)
  const [alerts, setAlerts] = useState<Alert2[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
    const fetchData = async (isAutoRefresh = false) => {
      try {
        if (!isAutoRefresh) {
          setLoading(true)
        } else {
          setIsRefreshing(true)
        }

        const [sensorRes, inTransitRes, scheduledRes, truckRes, alertRes] = await Promise.all([
          getSensorReadingsForStackedChart(),
          getInTransitTripCount(),
          getScheduledTripCount(),
          getAvailableTruckCount(),
          getOrderedAlerts(),
        ])

        setChartData(sensorRes)
        setInTransitTrips(inTransitRes.activeTrips)
        setScheduledTrips(scheduledRes.scheduledTrips)
        setAvailableTrucks(truckRes.availableTrucks)
        setAlerts(alertRes.alerts)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        if (!isAutoRefresh) {
          setLoading(false)
        } else {
          setIsRefreshing(false)
        }
      }
    }

    // Initial data fetch
    fetchData()

    // Set up auto-refresh every 20 seconds
    const interval = setInterval(() => {
      fetchData(true)
    }, 20000)

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    }
  }

  const formatTooltipDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const alertDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const getAlertInfo = (alert: Alert) => {
    if (alert.temperature !== undefined) {
      if (alert.temperature > 50) {
        return {
          type: "High Temperature",
          value: `${alert.temperature}°C`,
          severity: "high",
          icon: <TrendingUp className="h-5 w-5" />,
          headerColor: "bg-blue-100",
          headerText: "text-blue-800",
          valueColor: "bg-blue-50",
          valueText: "text-blue-700",
          description: "Alert for temperature greater than the permitted range.",
        }
      }
      if (alert.temperature < 0) {
        return {
          type: "Low Temperature",
          value: `${alert.temperature}°C`,
          severity: "high",
          icon: <TrendingDown className="h-5 w-5" />,
          headerColor: "bg-blue-200",
          headerText: "text-blue-900",
          valueColor: "bg-blue-100",
          valueText: "text-blue-800",
          description: "Alert for temperature below the permitted range.",
        }
      }
      return {
        type: "Temperature",
        value: `${alert.temperature}°C`,
        severity: "medium",
        icon: <ThermometerSun className="h-5 w-5" />,
        headerColor: "bg-blue-200",
        headerText: "text-blue-900",
        valueColor: "bg-blue-100",
        valueText: "text-blue-800",
        description: "Temperature monitoring alert.",
      }
    }
    if (alert.humidity !== undefined) {
      if (alert.humidity > 60) {
        return {
          type: "High Humidity",
          value: `${alert.humidity}%`,
          severity: "medium",
          icon: <Droplets className="h-5 w-5" />,
          headerColor: "bg-orange-200",
          headerText: "text-orange-900",
          valueColor: "bg-orange-100",
          valueText: "text-orange-800",
          description: "Alert for humidity greater than the permitted range.",
        }
      }
      if (alert.humidity < 30) {
        return {
          type: "Low Humidity",
          value: `${alert.humidity}%`,
          severity: "medium",
          icon: <Droplets className="h-5 w-5" />,
          headerColor: "bg-orange-100",
          headerText: "text-orange-800",
          valueColor: "bg-orange-50",
          valueText: "text-orange-700",
          description: "Alert for humidity below the permitted range.",
        }
      }
      return {
        type: "Humidity",
        value: `${alert.humidity}%`,
        severity: "low",
        icon: <Droplets className="h-5 w-5" />,
        headerColor: "bg-orange-100",
        headerText: "text-orange-800",
        valueColor: "bg-orange-50",
        valueText: "text-orange-700",
        description: "Humidity monitoring alert.",
      }
    }
    return {
      type: "General",
      value: "N/A",
      severity: "low",
      icon: <AlertTriangle className="h-5 w-5" />,
      headerColor: "bg-gray-100",
      headerText: "text-gray-800",
      valueColor: "bg-gray-50",
      valueText: "text-gray-700",
      description: "General system alert.",
    }
  }

  const StatCard = ({
    title,
    value,
    icon,
    bgColor,
    textColor,
    trend,
  }: {
    title: string
    value: number
    icon: React.ReactNode
    bgColor: string
    textColor: string
    trend?: string
  }) => (
    <div className={`${bgColor} rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 border-0`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className={`text-sm font-medium ${textColor} opacity-80`}>{title}</p>
          <div className="flex items-center space-x-2">
            <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
            {trend && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} border border-current border-opacity-20`}
              >
                {trend}
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-full ${textColor} bg-white bg-opacity-50`}>{icon}</div>
      </div>
    </div>
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{formatTooltipDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.dataKey === "temperature" ? "°C" : "%"}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6">
        <div className=" mx-auto space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className=" bg-gradient-to-br from-slate-50 to-slate-100 py-6">
      <div className="px-20 mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
                    <div className="flex gap-4 ">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Home className="h-6 w-6 text-white"/>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            </div>
          </div>
          <p className="text-gray-600">Real-time monitoring of operations and alerts</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Trips"
            value={inTransitTrips}
            icon={<Activity className="h-6 w-6" />}
            bgColor="bg-yellow-100"
            textColor="text-yellow-800"
            trend="In Transit"
          />
          <StatCard
            title="Trips"
            value={scheduledTrips}
            icon={<Calendar className="h-6 w-6" />}
            bgColor="bg-blue-100"
            textColor="text-blue-800"
            trend="Scheduled"
          />
          <StatCard
            title="Trucks"
            value={availableTrucks}
            icon={<Truck className="h-6 w-6" />}
            bgColor="bg-green-100"
            textColor="text-green-800"
            trend="Available"
          />
          <StatCard
            title="Today's alerts"
            value={alerts.length}
            icon={<AlertTriangle className="h-6 w-6" />}
            bgColor="bg-red-100"
            textColor="text-red-800"
            trend={alerts.length > 0 ? "Needs attention" : "All good"}
          />
        </div>

        {/* Charts and Alerts Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Temperature Chart */}
            <div className="bg-white rounded-lg shadow-lg border-0">
              <div className="p-6 pb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <ThermometerSun className="h-5 w-5 text-red-600" />
                  Temperature Readings
                </h3>
                <p className="text-sm text-gray-500">Continuous temperature monitoring</p>
              </div>
              <div className="px-6 pb-6">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="temperature" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="dateTime"
                      tickFormatter={(val) =>
                        new Date(val).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      }
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#temperature)"
                      name="Temperature"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Humidity Chart */}
            <div className="bg-white rounded-lg shadow-lg border-0">
              <div className="p-6 pb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-600" />
                  Humidity Readings
                </h3>
                <p className="text-sm text-gray-500">Continuous humidity monitoring</p>
              </div>
              <div className="px-6 pb-6">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="humidity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="dateTime"
                      tickFormatter={(val) =>
                        new Date(val).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      }
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="humidity"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#humidity)"
                      name="Humidity"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg border-0 h-full">
              <div className="p-6 pb-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Recent Alerts
                    </h3>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 max-h-[600px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No active alerts</p>
                    <p className="text-gray-400 text-sm">All systems are working correctly</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert, i) => {
                      const alertInfo = getAlertInfo(alert)
                      const dateInfo = formatDate(alert.dateTime)

                      return (
                        <div key={i} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                          {/* Header */}
                          <div className={`${alertInfo.headerColor} px-4 py-3 flex items-center justify-between`}>
                            <div className="flex items-center gap-2">
                              <div className={`${alertInfo.headerText}`}>{alertInfo.icon}</div>
                              <span className={`font-semibold text-sm ${alertInfo.headerText}`}>{alertInfo.type}</span>
                            </div>
                            <span className={`text-xs ${alertInfo.headerText} opacity-75`}>
                              {getTimeAgo(alert.dateTime)}
                            </span>
                          </div>

                          {/* Body */}
                          <div className="px-4 py-3 bg-white">
                            <p className="text-sm text-gray-600 mb-3">{alertInfo.description}</p>

                            {/* Value Section */}
                            <div className={`${alertInfo.valueColor} rounded-md px-3 py-2 mb-3`}>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium ${alertInfo.valueText}`}>
                                  {alert.temperature !== undefined ? "Temperature" : "Humidity"}
                                </span>
                              </div>
                              <div className={`text-lg font-bold ${alertInfo.valueText}`}>{alertInfo.value}</div>
                            </div>

                            {/* Footer Info */}
                            <div className="space-y-1 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>Trip #{alert.IDTrip}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Truck className="h-3 w-3" />
                                <span>Truck {alert.IDTruck}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {dateInfo.date}, {dateInfo.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
