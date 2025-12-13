
'use client' 

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Frown } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center"
      data-component-name="Error"
    >
      <div className="p-6 bg-destructive/10 rounded-full mb-6">
        <Frown className="size-12 text-destructive" />
      </div>
      <h1 className="text-4xl font-bold font-headline text-destructive">Something went wrong!</h1>
      <p className="mt-2 text-lg text-muted-foreground max-w-md">
        We're sorry, but an unexpected error occurred. Please try again or report this issue.
      </p>
      <div className="mt-8 flex gap-4">
        <Button onClick={() => reset()}>
          Try Again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/support">Report Issue</Link>
        </Button>
      </div>
    </div>
  )
}
