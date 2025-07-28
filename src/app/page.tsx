import Link from "next/link";
import { Cloud, Shield, Users, Zap, Database, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Cloud className="h-7 w-7 text-white" />
              <span className="text-lg font-semibold">S3R2UI</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/login"
                className="text-gray-400 hover:text-white transition-colors duration-150 text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-lg transition-all duration-150 text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-7xl font-bold mb-8 tracking-tight">
              Manage Your{" "}
              <span className="text-gray-400">
                S3 & R2 Buckets
              </span>{" "}
              with Ease
            </h1>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              A modern, secure, and intuitive interface for managing your cloud storage across
              AWS S3, Cloudflare R2, and other S3-compatible providers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-all duration-150"
              >
                Get Started Free
              </Link>
              <Link
                href="#features"
                className="border border-white/20 hover:border-white/40 px-8 py-3 rounded-lg font-medium transition-all duration-150 hover:bg-white/5"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Subtle background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Powerful features designed for teams and individuals who need reliable,
              secure cloud storage management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 hover:bg-white/[0.01]">
              <div className="p-3 rounded-lg bg-white/5 w-fit mb-6">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Provider Support</h3>
              <p className="text-gray-500 leading-relaxed">
                Works with AWS S3, Cloudflare R2, DigitalOcean Spaces, Wasabi,
                Backblaze B2, and any S3-compatible storage provider.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 hover:bg-white/[0.01]">
              <div className="p-3 rounded-lg bg-white/5 w-fit mb-6">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Enterprise Security</h3>
              <p className="text-gray-500 leading-relaxed">
                AES-256 encryption for credentials, secure authentication,
                and role-based access control to keep your data safe.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 hover:bg-white/[0.01]">
              <div className="p-3 rounded-lg bg-white/5 w-fit mb-6">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
              <p className="text-gray-500 leading-relaxed">
                Invite team members, set permissions, and collaborate on
                shared buckets with granular access control.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 hover:bg-white/[0.01]">
              <div className="p-3 rounded-lg bg-white/5 w-fit mb-6">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-gray-500 leading-relaxed">
                Optimized for performance with drag-and-drop uploads,
                instant search, and responsive design for all devices.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 hover:bg-white/[0.01]">
              <div className="p-3 rounded-lg bg-white/5 w-fit mb-6">
                <Database className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Organization</h3>
              <p className="text-gray-500 leading-relaxed">
                Advanced search, filtering, and sorting capabilities to
                find and organize your files exactly how you need them.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 hover:bg-white/[0.01]">
              <div className="p-3 rounded-lg bg-white/5 w-fit mb-6">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Setup</h3>
              <p className="text-gray-500 leading-relaxed">
                Simple bucket configuration with built-in CORS guidance
                and connection testing to get you up and running quickly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
            Ready to Simplify Your Cloud Storage?
          </h2>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of developers and teams who trust S3R2UI for their
            cloud storage management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-all duration-150"
            >
              Start Free Today
            </Link>
            <Link
              href="/login"
              className="border border-white/20 hover:border-white/40 px-8 py-3 rounded-lg font-medium transition-all duration-150 hover:bg-white/5"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <Cloud className="h-7 w-7 text-white" />
                <span className="text-lg font-semibold">S3R2UI</span>
              </div>
              <p className="text-gray-500 leading-relaxed max-w-md">
                The modern way to manage your S3 and R2 buckets. Secure, fast,
                and designed for teams.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-6 text-white">Product</h3>
              <ul className="space-y-3 text-gray-500">
                <li><Link href="#features" className="hover:text-white transition-colors duration-150">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors duration-150">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors duration-150">Documentation</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-6 text-white">Support</h3>
              <ul className="space-y-3 text-gray-500">
                <li><Link href="/help" className="hover:text-white transition-colors duration-150">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors duration-150">Contact</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors duration-150">Status</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-500">
            <p>&copy; 2024 S3R2UI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
