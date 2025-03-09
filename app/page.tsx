import type { Metadata } from "next"
import Hero from "@/components/hero"
import Features from "@/components/features"
import QrScannerSection from "@/components/qr-scanner-section"
import About from "@/components/about"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "QR Code Vulnerability Scanner",
  description: "A security tool to detect malicious QR codes",
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <Hero />
        <Features />
        <QrScannerSection />
        <About />
      </main>
      <Footer />
    </div>
  )
}

