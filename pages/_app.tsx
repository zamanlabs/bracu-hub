import { useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
import '../styles/globals.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Only render the dynamic parts of the application after client-side hydration is complete
  return (
    <>
      <style jsx global>{`
        body {
          visibility: ${mounted ? 'visible' : 'hidden'};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  )
} 