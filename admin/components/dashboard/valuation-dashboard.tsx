"use client"

import { useState } from "react"
import {
  BarChart3,
  TrendingUp,
  Home,
  DollarSign,
  Download,
  Share2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Plus,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ValuationDashboardProps {
  data: any
  onNewValuation?: () => void
}

export default function ValuationDashboard({ data, onNewValuation }: ValuationDashboardProps) {
  const [isExporting, setIsExporting] = useState(false)
  const prop = data.property_info || {}
  const cond = data.condition_assessment || {}

  // Valuation calculation
  const basePrice = 20000000 // 20M VND/m2
  const usableArea = prop.usable_area || 0
  const estimatedTotal = basePrice * usableArea

  const conditionMultiplier: Record<string, number> = {
    Mới: 1.08,
    "Còn mới": 1.04,
    "Trung bình": 1.0,
    Cũ: 0.88,
    "Xuống cấp": 0.75,
  }

  const multiplier = conditionMultiplier[cond.overall_condition as keyof typeof conditionMultiplier] || 1.0
  const adjustedPrice = estimatedTotal * multiplier
  const pricePerM2 = usableArea > 0 ? adjustedPrice / usableArea : 0

  const priceRange = {
    low: adjustedPrice * 0.9,
    high: adjustedPrice * 1.1,
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getConditionBgClass = (condition: string) => {
    const classes: Record<string, string> = {
      Mới: "bg-green-50",
      "Còn mới": "bg-blue-50",
      "Trung bình": "bg-yellow-50",
      Cũ: "bg-orange-50",
      "Xuống cấp": "bg-red-50",
    }
    return classes[condition] || "bg-gray-50"
  }

  const getConditionBorderClass = (condition: string) => {
    const classes: Record<string, string> = {
      Mới: "border-green-200",
      "Còn mới": "border-blue-200",
      "Trung bình": "border-yellow-200",
      Cũ: "border-orange-200",
      "Xuống cấp": "border-red-200",
    }
    return classes[condition] || "border-gray-200"
  }

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case "Mới":
      case "Còn mới":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "Trung bình":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case "Cũ":
      case "Xuống cấp":
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Home className="w-5 h-5 text-gray-600" />
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const reportContent = `
BÁNG CÁO ĐỊNH GIÁ BẤT ĐỘNG SẢN
================================

ĐỊA CHỈ: ${prop.address || "N/A"}
LOẠI BĐS: ${prop.property_type || "N/A"}

GIÁ ĐỊNH GIÁ
-----------
Giá ước tính: ${formatCurrency(adjustedPrice)}
Giá/m²: ${formatCurrency(pricePerM2)}
Khoảng giá: ${formatCurrency(priceRange.low)} - ${formatCurrency(priceRange.high)}

THÔNG TIN CƠ BẢN
----------------
Diện tích sử dụng: ${prop.usable_area || 0} m²
Diện tích đất: ${prop.land_area || "N/A"} m²
Phòng ngủ: ${prop.bedrooms || 0}
Phòng tắm: ${prop.bathrooms || 0}
Số tầng: ${prop.floors || 1}
Hướng: ${prop.direction || "N/A"}
Pháp lý: ${prop.legal_status || "N/A"}
Nội thất: ${prop.furniture || "N/A"}

TÌNH TRẠNG
----------
Tình trạng tổng thể: ${cond.overall_condition || "N/A"}
Độ sạch sẽ: ${cond.cleanliness || "N/A"}
Bảo trì: ${cond.maintenance_status || "N/A"}

${cond.major_issues?.length > 0 ? `VẤN ĐỀ PHÁT HIỆN\n${cond.major_issues.map((issue: string) => `- ${issue}`).join("\n")}` : ""}

${cond.overall_description ? `NHẬN XÉT TỔNG QUAN\n${cond.overall_description}` : ""}

Lưu ý: Giá ước tính này dựa trên phân tích AI và thông tin được cung cấp.
      `

      const element = document.createElement("a")
      element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(reportContent))
      element.setAttribute("download", `valuation-${prop.address?.replace(/\s+/g, "-")}.txt`)
      element.style.display = "none"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Valuation Card */}
      <div
        className={`card-elevated p-8 ${getConditionBgClass(cond.overall_condition)} border-2 ${getConditionBorderClass(cond.overall_condition)}`}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Định giá bất động sản</h2>
            <p className="text-gray-600">{prop.address || "Địa chỉ không xác định"}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Estimated Price */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-gray-600">Giá ước tính</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(adjustedPrice)}</p>
            <p className="text-xs text-gray-500 mt-2">Giá trung bình</p>
          </div>

          {/* Price Range Low */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-gray-600">Giá thấp</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(priceRange.low)}</p>
            <p className="text-xs text-gray-500 mt-2">-10% từ ước tính</p>
          </div>

          {/* Price Range High */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <p className="text-sm font-medium text-gray-600">Giá cao</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(priceRange.high)}</p>
            <p className="text-xs text-gray-500 mt-2">+10% từ ước tính</p>
          </div>

          {/* Price per m2 */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-5 h-5 text-purple-600" />
              <p className="text-sm font-medium text-gray-600">Giá/m²</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(pricePerM2)}</p>
            <p className="text-xs text-gray-500 mt-2">Giá trung bình thị trường</p>
          </div>
        </div>
      </div>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Chi tiết</TabsTrigger>
          <TabsTrigger value="condition">Tình trạng</TabsTrigger>
          <TabsTrigger value="analysis">Phân tích</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
              <div className="space-y-4">
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Loại BĐS:</span>
                  <span className="font-medium text-gray-900">{prop.property_type || "N/A"}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Diện tích sử dụng:</span>
                  <span className="font-medium text-gray-900">{prop.usable_area || 0} m²</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Diện tích đất:</span>
                  <span className="font-medium text-gray-900">{prop.land_area || "N/A"} m²</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Phòng ngủ:</span>
                  <span className="font-medium text-gray-900">{prop.bedrooms || 0}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Phòng tắm:</span>
                  <span className="font-medium text-gray-900">{prop.bathrooms || 0}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Số tầng:</span>
                  <span className="font-medium text-gray-900">{prop.floors || 1}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Hướng:</span>
                  <span className="font-medium text-gray-900">{prop.direction || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pháp lý:</span>
                  <span className="font-medium text-gray-900">{prop.legal_status || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bổ sung</h3>
              <div className="space-y-4">
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Nội thất:</span>
                  <span className="font-medium text-gray-900">{prop.furniture || "N/A"}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Chiều rộng:</span>
                  <span className="font-medium text-gray-900">{prop.width || "N/A"} m</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Chiều dài:</span>
                  <span className="font-medium text-gray-900">{prop.length || "N/A"} m</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-900">
                    <strong>Hệ số điều chỉnh tình trạng:</strong> {(multiplier * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Condition Tab */}
        <TabsContent value="condition" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Condition */}
            <div
              className={`card-elevated p-6 ${getConditionBgClass(cond.overall_condition)} border-2 ${getConditionBorderClass(cond.overall_condition)}`}
            >
              <div className="flex items-center gap-3 mb-4">
                {getConditionIcon(cond.overall_condition)}
                <h4 className="text-lg font-semibold text-gray-900">Tình trạng tổng thể</h4>
              </div>
              <p className="text-3xl font-bold text-gray-900">{cond.overall_condition || "N/A"}</p>
              <p className="text-sm text-gray-600 mt-2">Đánh giá chung về tình trạng bất động sản</p>
            </div>

            {/* Cleanliness */}
            <div className="card-elevated p-6 bg-green-50 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="text-lg font-semibold text-gray-900">Độ sạch sẽ</h4>
              </div>
              <p className="text-3xl font-bold text-gray-900">{cond.cleanliness || "N/A"}</p>
              <p className="text-sm text-gray-600 mt-2">Mức độ sạch sẽ và gọn gàng</p>
            </div>

            {/* Maintenance */}
            <div className="card-elevated p-6 bg-blue-50 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Home className="w-5 h-5 text-blue-600" />
                <h4 className="text-lg font-semibold text-gray-900">Bảo trì</h4>
              </div>
              <p className="text-3xl font-bold text-gray-900">{cond.maintenance_status || "N/A"}</p>
              <p className="text-sm text-gray-600 mt-2">Tình trạng bảo trì và sửa chữa</p>
            </div>
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {/* Major Issues */}
          {cond.major_issues && cond.major_issues.length > 0 && (
            <div className="card-elevated p-6 border-l-4 border-red-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Vấn đề chính phát hiện ({cond.major_issues.length})
              </h3>
              <ul className="space-y-2">
                {cond.major_issues.map((issue: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <span className="text-red-600 font-bold flex-shrink-0 mt-0.5">•</span>
                    <span className="text-gray-700">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Overall Description */}
          {cond.overall_description && (
            <div className="card-elevated p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nhận xét tổng quan</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{cond.overall_description}</p>
              </div>
            </div>
          )}

          {!cond.major_issues?.length && !cond.overall_description && (
            <div className="card-elevated p-6 text-center">
              <p className="text-gray-500">Không có phân tích chi tiết</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Lưu ý:</strong> Giá ước tính này dựa trên phân tích AI và thông tin được cung cấp. Giá thực tế có thể
          khác nhau tùy thuộc vào thị trường địa phương, vị trí chính xác, và các yếu tố khác.
        </p>
      </div>

      {/* Export Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          {isExporting ? "Đang xuất..." : "Tải báo cáo"}
        </button>
        <button className="h-12 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5" />
          Chia sẻ
        </button>
        {onNewValuation && (
          <button
            onClick={onNewValuation}
            className="h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Định giá mới
          </button>
        )}
      </div>
    </div>
  )
}
