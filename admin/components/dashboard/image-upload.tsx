"use client"

import type React from "react"
import { Upload, ImageIcon } from "lucide-react"
import { useRef, useState } from "react"

interface ImageUploadProps {
  onFilesSelected: (files: File[]) => void
}

export default function ImageUpload({ onFilesSelected }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
        isDragging ? "border-blue-500 bg-blue-50 shadow-lg" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
      }`}
    >
      <div className="flex justify-center mb-4">
        {isDragging ? (
          <ImageIcon className="w-12 h-12 text-blue-500 animate-bounce" />
        ) : (
          <Upload className="w-12 h-12 text-gray-400" />
        )}
      </div>
      <p className="text-lg font-medium text-gray-700 mb-2">
        {isDragging ? "Thả ảnh vào đây" : "Click để chọn ảnh hoặc kéo thả vào đây"}
      </p>
      <p className="text-sm text-gray-500">Hỗ trợ: JPG, JPEG, PNG (tối đa 20 ảnh)</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
