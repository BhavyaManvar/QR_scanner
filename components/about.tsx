"use client"

import { Shield, Zap, Lock, Search, AlertTriangle, Database } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function About() {
  return (
    <section id="about" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              About Our QR Scanner
            </h2>
            <p className="text-muted-foreground md:text-xl">
              We built this QR code scanner with security in mind. In today's digital world, QR codes can be manipulated
              to lead users to malicious websites or trigger harmful actions.
            </p>
            <div className="space-y-2">
              <p className="text-muted-foreground md:text-lg transition-opacity duration-200 hover:opacity-80">
                Our scanner analyzes each QR code for potential threats, checking for:
              </p>
              <ul className="ml-6 list-disc text-muted-foreground space-y-2">
                <li className="transition-all duration-200 hover:translate-x-1">Malicious URLs and phishing attempts</li>
                <li className="transition-all duration-200 hover:translate-x-1">Suspicious redirects and forwarding</li>
                <li className="transition-all duration-200 hover:translate-x-1">Known malware distribution sites</li>
                <li className="transition-all duration-200 hover:translate-x-1">Compromised domains and servers</li>
              </ul>
            </div>
            <Button asChild size="lg" className="mt-4 transition-all duration-300 hover:shadow-md">
              <Link href="#scanner" className="transition-all duration-200">
                Try It Now <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-center px-4">
            <div className="relative h-[250px] w-[250px] sm:h-[300px] sm:w-[300px] md:h-[350px] md:w-[350px] lg:h-[400px] lg:w-[400px] rounded-full bg-gradient-to-b from-primary/20 to-muted transition-all duration-500 hover:from-primary/30 hover:to-muted/80 shadow-sm">
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="text-center space-y-3">
                  <h3 className="text-xl sm:text-2xl font-bold transition-all duration-200 hover:scale-105">Trusted by Users</h3>
                  <p className="text-sm sm:text-base text-muted-foreground transition-all duration-200">Secure. Fast. Reliable.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 