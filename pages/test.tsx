import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/client'

interface TestResult {
  tableName: string
  exists: boolean
  error?: string
}

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function testConnection() {
      const tables = ['users', 'global_messages', 'direct_messages', 'message_reactions']
      const testResults: TestResult[] = []

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1)

          testResults.push({
            tableName: table,
            exists: !error,
            error: error?.message
          })
        } catch (err) {
          testResults.push({
            tableName: table,
            exists: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          })
        }
      }

      setResults(testResults)
      setLoading(false)
    }

    testConnection()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Setup Test Results</h1>
      <div className="space-y-4">
        {results.map((result) => (
          <div
            key={result.tableName}
            className={`p-4 rounded-lg ${
              result.exists ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <h2 className="font-semibold">
              Table: {result.tableName}
              <span
                className={`ml-2 ${
                  result.exists ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {result.exists ? '✓' : '✗'}
              </span>
            </h2>
            {result.error && (
              <p className="text-red-600 text-sm mt-1">{result.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 