interface TableProps {
  children: React.ReactNode
}

export default function Table({ children }: TableProps) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  )
}
