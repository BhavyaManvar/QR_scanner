import {
  Shield,
  AlertTriangle,
  History,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Shield,
    title: "Advanced Security",
    description: "Real-time analysis of QR codes to detect potential security threats and malicious content."
  },
  {
    icon: AlertTriangle,
    title: "Threat Detection",
    description: "Identifies suspicious patterns and warns you before accessing potentially harmful links."
  },
  {
    icon: History,
    title: "Scan History",
    description: "Keep track of your scanned QR codes and their security status for future reference."
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description: "Quick scanning with instant results, powered by advanced security algorithms."
  }
]

export default function Features() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Discover what makes our QR code scanner the most secure choice for your scanning needs.
            </p>
          </div>
          <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-center">
                    <feature.icon className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <CardTitle className="transition-colors duration-200 group-hover:text-primary">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="transition-colors duration-200">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

