'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

type Props = {
  children: React.ReactNode
}

export default function Providers({ children }: Props) {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}