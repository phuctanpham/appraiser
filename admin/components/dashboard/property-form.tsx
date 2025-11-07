"use client"

import { useState } from "react"
import { X, Eye, Loader2, AlertCircle } from "lucide-react"
import ImageUpload from "./image-upload"
import PropertyReview from "./property-review"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getValuations } from "@/lib/predictions"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3004"

interface PropertyFormProps {
  onValuationComplete: (data: any) => void
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

export default function PropertyForm({ onValuationComplete }: PropertyFormProps) {
  const [step, setStep] = useState<"upload" | "review">("upload")
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [formData, setFormData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFilesSelected = (files: File[]) => {
    setError(null)
    if (uploadedFiles.length + files.length > 20) {
      setError("Tối đa 20 ảnh được phép. Vui lòng giảm số lượng ảnh.")
      return
    }
    const fileObjects = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }))
    setUploadedFiles((prev) => [...prev, ...fileObjects])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index)
      URL.revokeObjectURL(prev[index].preview)
      return newFiles
    })
  }

  const analyzeImages = async () => {
    if (uploadedFiles.length === 0) {
      setError("Vui lòng chọn ít nhất một ảnh")
      return
    }

    setError(null)
    setIsAnalyzing(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        const authUrl = process.env.AUTH_GUI_URL || "https://auth.vpbank.workers.dev"
        window.location.href = authUrl
        return
      }

      const images_base64 = await Promise.all(
        uploadedFiles.map(({ file }) => toBase64(file))
      );
      
      const response = await fetch(`${API_BASE_URL}/api/ocr/analyze`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ images: images_base64 })
      })

      if (response.status === 401) {
        localStorage.removeItem("access_token")
        const authUrl = process.env.AUTH_GUI_URL || "https://auth.vpbank.workers.dev"
        window.location.href = authUrl
        return
      }

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Phân tích thất bại")

      setAnalysisResult(result.data)
      setFormData(result.data)
      setStep("review")

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra"
      setError(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReviewComplete = async (updatedData: any) => {
    setError(null);
    setIsSubmitting(true);
    try {
      console.log("📤 Submitting for prediction:", updatedData);
      const valuations = await getValuations(updatedData);
      console.log("✅ Valuations Result:", valuations);
      onValuationComplete(valuations);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi lấy giá trị.";
      console.error("❌ Valuation error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "upload" && (
        <div className="card-elevated p-8">
           <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tải lên ảnh bất động sản</h2>
            <p className="text-gray-600">
              Tải lên tất cả ảnh (bao gồm ảnh thông tin text + ảnh thực tế tình trạng nhà). Tối đa 20 ảnh.
            </p>
          </div>

          <ImageUpload onFilesSelected={handleFilesSelected} />

          {uploadedFiles.length > 0 && (
            <div className="mt-8">
               <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Đã chọn {uploadedFiles.length} ảnh</h3>
                {uploadedFiles.length > 0 && (
                  <button
                    onClick={() => {
                      uploadedFiles.forEach((f) => URL.revokeObjectURL(f.preview))
                      setUploadedFiles([])
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={file.preview || "/placeholder.svg"}
                      alt={file.name}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-400 transition-colors"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      title="Xóa ảnh"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-600 mt-2 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={analyzeImages}
            disabled={uploadedFiles.length === 0 || isAnalyzing}
            className="w-full mt-8 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang phân tích...
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                Phân tích tất cả ảnh
              </>
            )}
          </button>
        </div>
      )}

      {step === "review" && formData && (
        <PropertyReview
          formData={formData}
          uploadedFiles={uploadedFiles}
          onComplete={handleReviewComplete}
          onBack={() => setStep("upload")}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}
