import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-muted/20 pb-16 md:pb-0">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/">
              <a className="font-bold text-xl tracking-tight mb-4 inline-block">Vantage</a>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Convert messy Google Drive share links into clean, professional download pages with tracking, custom slugs, and analytics.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-foreground">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/">
                  <a className="hover:text-primary transition-colors">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/login">
                  <a className="hover:text-primary transition-colors">Dashboard</a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms">
                  <a className="hover:text-primary transition-colors">Terms & Conditions</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="hover:text-primary transition-colors">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="hover:text-primary transition-colors">Contact</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Vantage. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built for speed and simplicity.</p>
        </div>
      </div>
    </footer>
  );
}