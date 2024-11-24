"use client"

import { UserButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Video, 
  GraduationCap, 
  UserCircle,
  Menu,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: "text-sky-500"
  },
  {
    label: 'Video Chat',
    icon: Video,
    href: '/chat',
    color: "text-violet-500",
  },
  {
    label: 'Programs',
    icon: GraduationCap,
    href: '/programs',
    color: "text-pink-700",
  },
  {
    label: 'My Conversations',
    icon: GraduationCap,
    href: '/conversations',
    color: "text-pink-700",
  },
  {
    label: 'Profile',
    icon: UserCircle,
    href: '/profile',
    color: "text-orange-700",
  }
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="h-full relative">
      <div 
        className={cn(
          "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 bg-gray-900 transition-all duration-300",
          isCollapsed ? "md:w-16 hover:w-72 group" : "md:w-72"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex h-14 items-center px-4 border-b border-gray-800">
            <div className="flex items-center justify-between w-full">
              <Link href="/" className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-white" />
                <span className={cn("text-xl font-bold text-white transition-opacity duration-300", 
                  isCollapsed ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                )}>
                  EduBot
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-white"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-x-2 text-sm font-medium px-3 py-2 rounded-lg transition-all hover:text-white hover:bg-white/10",
                    pathname === route.href 
                      ? "text-white bg-white/10" 
                      : "text-zinc-400"
                  )}
                >
                  <route.icon className={cn("h-5 w-5", route.color)} />
                  <span className={cn("transition-opacity duration-300",
                    isCollapsed ? "opacity-0 group-hover:opacity-100 group-hover:inline" : "opacity-100"
                  )}>
                    {route.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "md:pl-16" : "md:pl-72"
      )}>
        <div className="flex h-14 items-center px-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="ml-auto flex items-center gap-x-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
