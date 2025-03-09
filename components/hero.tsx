import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Secure QR Code Scanning
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Scan QR codes with confidence. Our advanced scanner detects and warns you about potentially malicious QR codes.
            </p>
          </div>
          <div className="space-x-0 space-y-2 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
            <Button asChild size="lg" className="transition-all duration-300 hover:shadow-md">
              <Link href="#scanner" className="transition-all duration-200">
                Scan Now <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="transition-all duration-300 hover:shadow-md">
              <Link href="#features" className="transition-all duration-200">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

