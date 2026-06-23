interface PolicyBoxProps {
  article: string
  articleName: string
  explanation: string
}

export default function PolicyBox({ article, articleName, explanation }: PolicyBoxProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">
          {article}
        </span>
        <span className="text-sm font-semibold text-red-900">{articleName}</span>
      </div>
      <p className="text-sm text-red-700">{explanation}</p>
    </div>
  )
}
