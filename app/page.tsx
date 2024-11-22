import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, GraduationCap, Globe, Video, Brain } from 'lucide-react'
import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'


export default async function Home() {
  const { userId } = await auth()
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center justify-center">
          <GraduationCap className="h-6 w-6" />
          <span className="ml-2 text-xl font-bold">EduBot</span>
        </Link>
        {userId ? (<nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <UserButton />
        </nav>): (<nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get Started</Button>
          </Link>
        </nav>)}
        
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your AI Education Counselor
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Get personalized guidance for your international education journey through human-like video interactions
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/sign-up">
                  <Button size="lg" className="inline-flex items-center">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4">
                <Video className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Video Interactions</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Natural conversations through AI-powered video chat
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <Brain className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Smart Recommendations</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Personalized program suggestions based on your profile
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <Globe className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Global Opportunities</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Access to programs from universities worldwide
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 EduBot. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}