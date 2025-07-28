import Link from "next/link";
import { Cloud, Shield, Users, Zap, Database, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Cloud className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold">S3R2UI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              Manage Your{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                S3 & R2 Buckets
              </span>{" "}
              with Ease
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              A modern, secure, and intuitive interface for managing your cloud storage across
              AWS S3, Cloudflare R2, and other S3-compatible providers. Upload, organize, and
              share files with your team effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="#features"
                className="border border-gray-600 hover:border-gray-500 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need for Cloud Storage Management
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powerful features designed for teams and individuals who need reliable,
              secure cloud storage management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <Globe className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multi-Provider Support</h3>
              <p className="text-gray-300">
                Works with AWS S3, Cloudflare R2, DigitalOcean Spaces, Wasabi,
                Backblaze B2, and any S3-compatible storage provider.
              </p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <Shield className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
              <p className="text-gray-300">
                AES-256 encryption for credentials, secure authentication,
                and role-based access control to keep your data safe.
              </p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <Users className="h-12 w-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-gray-300">
                Invite team members, set permissions, and collaborate on
                shared buckets with granular access control.
              </p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <Zap className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-300">
                Optimized for performance with drag-and-drop uploads,
                instant search, and responsive design for all devices.
              </p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <Database className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Organization</h3>
              <p className="text-gray-300">
                Advanced search, filtering, and sorting capabilities to
                find and organize your files exactly how you need them.
              </p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <Cloud className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Setup</h3>
              <p className="text-gray-300">
                Simple bucket configuration with built-in CORS guidance
                and connection testing to get you up and running quickly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Simplify Your Cloud Storage?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers and teams who trust S3R2UI for their
            cloud storage management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Start Free Today
            </Link>
            <Link
              href="/login"
              className="border border-gray-600 hover:border-gray-500 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Cloud className="h-8 w-8 text-blue-500" />
                <span className="text-xl font-bold">S3R2UI</span>
              </div>
              <p className="text-gray-300 mb-4">
                The modern way to manage your S3 and R2 buckets. Secure, fast,
                and designed for teams.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 S3R2UI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
