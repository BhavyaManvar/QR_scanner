import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex items-center justify-center py-10 px-4 md:h-24 md:py-0 md:px-6">
        <div className="text-center">
          <p className="text-sm leading-loose text-muted-foreground">
            © 2024 QR Scanner. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

