'use client'

import { useState } from 'react'

export default function TestQwenPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setImageUrl(url)
      setResult(null)
      setError(null)
    }
  }

  // 将图片转换为Base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // 调用测试API
  const testQwen = async () => {
    if (!selectedImage) {
      setError('请先选择图片')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const base64Image = await convertToBase64(selectedImage)
      
      const response = await fetch('/api/test-qwen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data.prompt)
      } else {
        setError(data.error || '调用失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Qwen VL-Max 测试页面</h1>
      
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 图片上传区域 */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer block"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">点击选择图片</p>
            <p className="text-sm text-gray-400">支持 JPG、PNG、GIF 格式</p>
          </label>
        </div>

        {/* 图片预览 */}
        {imageUrl && (
          <div className="text-center">
            <img
              src={imageUrl}
              alt="预览"
              className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
            />
            <p className="text-sm text-gray-500 mt-2">已选择图片</p>
          </div>
        )}

        {/* 测试按钮 */}
        <div className="text-center">
          <button
            onClick={testQwen}
            disabled={!selectedImage || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            {loading ? '测试中...' : '测试 Qwen VL-Max'}
          </button>
        </div>

        {/* 结果显示 */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">生成的提示词：</h3>
            <p className="text-green-700 whitespace-pre-wrap">{result}</p>
          </div>
        )}

        {/* 错误显示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">错误：</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
