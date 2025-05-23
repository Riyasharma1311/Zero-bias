"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export function DashboardHeader() {
  return (
    <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6 bg-pink-50">
      <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold sm:text-base mr-4">
        <Heart className="w-6 h-6 text-pink-600 fill-pink-600" />
        <span className="text-pink-600 font-bold">Heart Sync</span>
      </Link>
      <nav className="hidden font-medium sm:flex flex-row items-center gap-5 text-sm lg:gap-6">
        <Link href="/dashboard" className="font-bold">
          Dashboard
        </Link>
        <Link href="/patients" className="text-muted-foreground">
          Patients
        </Link>
        <Link href="/analytics" className="text-muted-foreground">
          Analytics
        </Link>
        <Link href="/reports" className="text-muted-foreground">
          Reports
        </Link>
        <Link href="/settings" className="text-muted-foreground">
          Settings
        </Link>
      </nav>
      <div className="flex items-center w-full gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <Button
          variant="outline"
          className="ml-auto border-pink-200 text-pink-600 hover:bg-pink-100 hover:text-pink-700"
          asChild
        >
          <Link href="/patients/new">Add New Patient</Link>
        </Button>
        <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/login" })}>
          Log Out
        </Button>
      </div>
    </header>
  )
}
