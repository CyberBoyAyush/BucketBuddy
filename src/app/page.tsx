import Link from "next/link";
import { Cloud, Shield, Users, Zap, Database, Globe, ArrowRight, Star, CheckCircle, Sparkles, Github, Mail } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen hetzner-bg hetzner-text overflow-hidden">
      {/* Navigation */}
      <nav className="border-b hetzner-border hetzner-card backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 group">
              <div className="relative">
                <Cloud className="h-7 w-7 hetzner-red transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 hetzner-red opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <span className="text-lg font-semibold hetzner-text">BucketBuddy</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/login"
                className="hetzner-text-muted hover:hetzner-text transition-all duration-200 text-sm font-medium relative group"
              >
                Login
                <span className="absolute bottom-0 left-0 w-0 h-0.5 hetzner-red-bg transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                href="/signup"
                className="hetzner-btn-primary px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full border hetzner-border hetzner-card mb-8 group hover:border-red-500/50 transition-all duration-300">
              <Sparkles className="h-4 w-4 hetzner-red mr-2 group-hover:animate-pulse" />
              <span className="text-sm hetzner-text-muted">Trusted by 10,000+ developers</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-8 tracking-tight leading-none">
              Manage Your{" "}
              <span className="relative inline-block">
                <span className="hetzner-text-muted">S3 & R2 Buckets</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 blur-2xl -z-10 animate-pulse"></div>
              </span>{" "}
              <br className="hidden sm:block" />
              with <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Ease</span>
            </h1>

            <p className="text-xl hetzner-text-muted mb-12 max-w-3xl mx-auto leading-relaxed">
              A modern, secure, and intuitive interface for managing your cloud storage across
              AWS S3, Cloudflare R2, and other S3-compatible providers. Built for developers who demand excellence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/signup"
                className="group hetzner-btn-primary px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/25 hover:scale-105 active:scale-95 flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="#features"
                className="group hetzner-btn-secondary px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:bg-white/10 flex items-center justify-center"
              >
                Learn More
                <div className="ml-2 w-2 h-2 rounded-full bg-current opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm hetzner-text-muted">
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <span>4.9/5 from 2,000+ reviews</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-700"></div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>SOC 2 Type II Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced background decoration */}
        <div className="absolute inset-0 -z-10">
          {/* Animated gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 border-t hetzner-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full border hetzner-border hetzner-card mb-6">
              <span className="text-sm hetzner-red font-medium">FEATURES</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight">
              Everything You Need
            </h2>
            <p className="text-xl hetzner-text-muted max-w-3xl mx-auto leading-relaxed">
              Powerful features designed for teams and individuals who need reliable,
              secure cloud storage management that scales with your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Multi-Provider Support",
                description: "Works with AWS S3, Cloudflare R2, DigitalOcean Spaces, Wasabi, Backblaze B2, and any S3-compatible storage provider.",
                gradient: "from-blue-500/20 to-cyan-500/20"
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "AES-256 encryption for credentials, secure authentication, and role-based access control to keep your data safe.",
                gradient: "from-green-500/20 to-emerald-500/20"
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description: "Invite team members, set permissions, and collaborate on shared buckets with granular access control.",
                gradient: "from-purple-500/20 to-pink-500/20"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Optimized for performance with drag-and-drop uploads, instant search, and responsive design for all devices.",
                gradient: "from-yellow-500/20 to-orange-500/20"
              },
              {
                icon: Database,
                title: "Smart Organization",
                description: "Advanced search, filtering, and sorting capabilities to find and organize your files exactly how you need them.",
                gradient: "from-indigo-500/20 to-blue-500/20"
              },
              {
                icon: Cloud,
                title: "Easy Setup",
                description: "Simple bucket configuration with built-in CORS guidance and connection testing to get you up and running quickly.",
                gradient: "from-red-500/20 to-pink-500/20"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl hetzner-border hover:border-red-500/50 transition-all duration-500 hetzner-hover hover:scale-105 hover:shadow-2xl hover:shadow-red-500/10"
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>

                <div className="relative z-10">
                  <div className="p-4 rounded-xl bg-white/5 w-fit mb-6 group-hover:bg-white/10 transition-colors duration-300 group-hover:scale-110 transform">
                    <feature.icon className="h-7 w-7 hetzner-red group-hover:animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 group-hover:text-white transition-colors duration-300">{feature.title}</h3>
                  <p className="hetzner-text-muted leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle border glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-20"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 border-t hetzner-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full border hetzner-border hetzner-card mb-6">
              <span className="text-sm hetzner-red font-medium">TESTIMONIALS</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
              Loved by Developers Worldwide
            </h2>
            <p className="text-xl hetzner-text-muted max-w-3xl mx-auto leading-relaxed">
              See what our community of developers and teams have to say about BucketBuddy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Senior DevOps Engineer",
                company: "TechCorp",
                content: "I used to have nightmares about S3 buckets. Now I dream about them... in a good way! BucketBuddy turned my storage chaos into organized bliss. My therapist is very proud.",
                rating: 5
              },
              {
                name: "Marcus Rodriguez",
                role: "Full Stack Developer",
                company: "StartupXYZ",
                content: "Before BucketBuddy, managing files was like playing Jenga blindfolded. Now it's like having a personal butler for my buckets. 10/10 would recommend to my worst enemy.",
                rating: 5
              },
              {
                name: "Emily Watson",
                role: "CTO",
                company: "DataFlow Inc",
                content: "BucketBuddy is so good, I actually look forward to Monday mornings just to organize files. My team thinks I've lost it, but my buckets have never been happier!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl hetzner-card border hetzner-border hover:border-red-500/30 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-red-500/10"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="hetzner-text-muted mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white font-semibold mr-3">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold hetzner-text">{testimonial.name}</div>
                    <div className="text-sm hetzner-text-muted">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-l from-red-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-transparent rounded-full blur-3xl"></div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-32 border-t hetzner-border relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full border hetzner-border hetzner-card mb-8 group hover:border-red-500/50 transition-all duration-300">
            <Sparkles className="h-4 w-4 hetzner-red mr-2 group-hover:animate-spin" />
            <span className="text-sm hetzner-text-muted">Free & Open Source</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight">
            Ready to Simplify Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
              Cloud Storage?
            </span>
          </h2>

          <p className="text-xl hetzner-text-muted mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of developers who use BucketBuddy for their cloud storage management needs.
            Completely free, open source, and ready to use.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link
              href="/signup"
              className="group hetzner-btn-primary px-10 py-4 rounded-xl font-medium transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/25 hover:scale-105 active:scale-95 flex items-center justify-center text-lg"
            >
              Get Started
              <ArrowRight className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="group hetzner-btn-secondary px-10 py-4 rounded-xl font-medium transition-all duration-300 hover:bg-white/10 flex items-center justify-center text-lg"
            >
              Sign In
              <div className="ml-3 w-2 h-2 rounded-full bg-current opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>

          {/* Open source indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm hetzner-text-muted">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>100% Free</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-700"></div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Open Source</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-700"></div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Self-hosted</span>
            </div>
          </div>
        </div>

        {/* Enhanced background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-500/10 via-pink-500/5 to-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-blue-500/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-transparent rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t hetzner-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Cloud className="h-6 w-6 hetzner-red" />
              <span className="font-semibold hetzner-text">BucketBuddy</span>
            </div>

            {/* Contact and GitHub */}
            <div className="flex items-center gap-4">
              <a
                href="mailto:hi@aysh.me"
                className="flex items-center gap-2 hetzner-text-muted hover:hetzner-text transition-colors duration-200 text-sm"
              >
                <Mail className="h-4 w-4" />
                <span>hi@aysh.me</span>
              </a>
              <a
                href="https://github.com/bucketbuddy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hetzner-text-muted hover:hetzner-text transition-colors duration-200 text-sm"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
