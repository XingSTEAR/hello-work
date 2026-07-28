import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { X } from 'lucide-react'

// 修复 Leaflet 默认图标路径（使用 CDN 避免 Vite 打包问题）
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// 自定义红色标记图标
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface MapViewProps {
  open: boolean
  onClose: () => void
  latitude?: number
  longitude?: number
  title: string
  address: string
}

const DEFAULT_LAT = 39.9042  // 北京天安门（默认中心点）
const DEFAULT_LNG = 116.4074

export default function MapView({ open, onClose, latitude = DEFAULT_LAT, longitude = DEFAULT_LNG, title, address }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!open || !containerRef.current) return

    // 延迟初始化确保 DOM 渲染完成
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.remove()
      }

      const map = L.map(containerRef.current!, {
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      const marker = L.marker([latitude, longitude], { icon: redIcon }).addTo(map)
      marker.bindPopup(`
        <div style="font-family: -apple-system, sans-serif; padding: 4px 0;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #1e293b;">${title}</div>
          <div style="font-size: 12px; color: #64748b;">📍 ${address}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">坐标: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}</div>
        </div>
      `, {
        maxWidth: 300,
        closeButton: true,
      })
      marker.openPopup()

      mapRef.current = map
      setMapReady(true)

      // 触发地图重新计算大小
      setTimeout(() => map.invalidateSize(), 100)
    }, 150)

    return () => {
      clearTimeout(timer)
    }
  }, [open, latitude, longitude, title, address])

  // 关闭时清理地图
  const handleClose = () => {
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }
    setMapReady(false)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">📍 {address}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative">
          <div
            ref={containerRef}
            className="w-full h-[420px]"
            style={{ zIndex: 1 }}
          />
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-400">加载地图中...</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            地图数据来自 OpenStreetMap 开源地图
          </p>
        </div>
      </div>
    </div>
  )
}

// 迷你地图组件（用于页面内嵌小地图）
interface MiniMapProps {
  latitude: number
  longitude: number
  title: string
  className?: string
}

export function MiniMap({ latitude, longitude, title, className = '' }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const timer = setTimeout(() => {
      if (!containerRef.current) return

      const map = L.map(containerRef.current, {
        center: [latitude, longitude],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map)

      L.marker([latitude, longitude]).addTo(map).bindPopup(title)

      mapRef.current = map
    }, 100)

    return () => {
      clearTimeout(timer)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [latitude, longitude, title])

  return <div ref={containerRef} className={`w-full h-full rounded-lg ${className}`} />
}
