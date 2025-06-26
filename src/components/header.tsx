import { Users } from 'lucide-react'
import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b w-full bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
        <Link
          href="/"
          className="flex items-center gap-3 font-bold text-xl text-card-foreground"
        >
          <Users className="h-7 w-7 text-primary" />
          <span className="font-headline">MentorMatch AI</span>
        </Link>
      </div>
    </header>
  )
}
