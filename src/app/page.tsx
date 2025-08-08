import Link from "next/link";
import { Cloud, Shield, Users, Zap, Database, Globe, ArrowRight, Star, CheckCircle, Sparkles, Github, Mail, Play, ChevronDown, Rocket, Target, Clock, Award } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function Home() {
  return (
    <div className="min-h-screen hetzner-bg hetzner-text overflow-hidden">
      {/* Enhanced Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="group">
              <Logo size="md" className="transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="hetzner-text-muted hover:hetzner-text transition-all duration-200 text-sm font-medium relative group"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 hetzner-red-bg transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                href="#how-it-works"
                className="hetzner-text-muted hover:hetzner-text transition-all duration-200 text-sm font-medium relative group"
              >
                How it Works
                <span className="absolute bottom-0 left-0 w-0 h-0.5 hetzner-red-bg transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                href="#testimonials"
                className="hetzner-text-muted hover:hetzner-text transition-all duration-200 text-sm font-medium relative group"
              >
                Testimonials
                <span className="absolute bottom-0 left-0 w-0 h-0.5 hetzner-red-bg transition-all duration-200 group-hover:w-full"></span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="hetzner-text-muted hover:hetzner-text transition-all duration-200 text-sm font-medium relative group"
              >
                Login
                <span className="absolute bottom-0 left-0 w-0 h-0.5 hetzner-red-bg transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                href="/signup"
                className="hetzner-btn-primary px-6 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 active:scale-95 relative overflow-hidden group"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center relative z-10">
            {/* Enhanced Badge */}
            <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-4 sm:mb-6 group hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-500">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 hetzner-red mr-1.5 sm:mr-2 group-hover:animate-spin" />
              <span className="text-xs sm:text-sm hetzner-text-muted font-medium">🚀 Trusted by 10,000+ developers</span>
              <div className="ml-1.5 sm:ml-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>

            {/* Main Heading - Much Smaller Sizes */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 tracking-tight leading-tight">
              <span className="block mb-1 sm:mb-2">Manage Your</span>
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-red-600">
                  S3 & R2 Buckets
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 blur-2xl -z-10"></div>
              </span>
              <br className="hidden sm:block" />
              <span className="block mt-1 sm:mt-2">
                with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                  Absolute Ease
                </span>
              </span>
            </h1>

            {/* Description - Much Smaller Text */}
            <p className="text-sm sm:text-base lg:text-lg hetzner-text-muted mb-6 sm:mb-8 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed">
              The most <span className="text-white font-semibold">modern</span>, <span className="text-white font-semibold">secure</span>, and <span className="text-white font-semibold">intuitive</span> interface for managing your cloud storage across
              AWS S3, Cloudflare R2, and other S3-compatible providers. Built for developers who demand excellence.
            </p>

            {/* CTA Buttons - Smaller Sizes */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12">
              <Link
                href="/signup"
                className="group relative hetzner-btn-primary px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-xl hover:shadow-red-500/25 hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <Rocket className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-bounce" />
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <Link
                href="#how-it-works"
                className="group relative hetzner-btn-secondary px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:bg-white/10 hover:border-white/30 flex items-center justify-center backdrop-blur-sm"
              >
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform duration-300" />
                Watch Demo
                <ChevronDown className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-bounce transition-transform duration-300" />
              </Link>
            </div>

            {/* Enhanced Social Proof */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-2xl lg:max-w-3xl mx-auto">
              {/* Rating */}
              <div className="flex flex-col items-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-0.5 sm:gap-1 mb-1.5 sm:mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400 group-hover:animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
                <div className="text-lg sm:text-xl font-bold hetzner-text mb-0.5 sm:mb-1">4.9/5</div>
                <div className="text-xs hetzner-text-muted text-center">from 2,000+ reviews</div>
              </div>

              {/* Users */}
              <div className="flex flex-col items-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 hetzner-red mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-lg sm:text-xl font-bold hetzner-text mb-0.5 sm:mb-1">10,000+</div>
                <div className="text-xs hetzner-text-muted text-center">Active developers</div>
              </div>

              {/* Security */}
              <div className="flex flex-col items-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-lg sm:text-xl font-bold hetzner-text mb-0.5 sm:mb-1">SOC 2</div>
                <div className="text-xs hetzner-text-muted text-center">Type II Compliant</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Dynamic Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Large Animated Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/15 to-pink-500/15 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-red-500/8 to-orange-500/8 rounded-full blur-3xl animate-pulse"></div>

          {/* Additional Floating Elements */}
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-gradient-to-r from-cyan-500/8 to-blue-500/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>

          {/* Enhanced Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              ></div>
            ))}
          </div>

          {/* Radial Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/40"></div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 border-t border-white/10 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-4 sm:mb-6">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 hetzner-red mr-1.5 sm:mr-2" />
              <span className="text-xs hetzner-red font-semibold uppercase tracking-wide">How it Works</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 tracking-tight">
              Get Started in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                3 Simple Steps
              </span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg hetzner-text-muted max-w-xl lg:max-w-2xl mx-auto leading-relaxed">
              From setup to management, we've made cloud storage as simple as it should be.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {[
              {
                step: "01",
                title: "Connect Your Storage",
                description: "Add your AWS S3, Cloudflare R2, or any S3-compatible storage provider with our secure connection wizard.",
                icon: Database,
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "02",
                title: "Organize & Manage",
                description: "Upload, organize, and manage your files with our intuitive drag-and-drop interface and powerful search.",
                icon: Cloud,
                color: "from-purple-500 to-pink-500"
              },
              {
                step: "03",
                title: "Collaborate & Scale",
                description: "Invite team members, set permissions, and scale your storage management as your business grows.",
                icon: Users,
                color: "from-red-500 to-orange-500"
              }
            ].map((step, index) => (
              <div key={index} className="relative group">
                {/* Connection Line */}
                {index < 2 && (
                  <div className="hidden lg:block absolute top-1/2 left-full w-full h-px bg-gradient-to-r from-white/20 to-transparent transform -translate-y-1/2 z-0"></div>
                )}

                <div className="relative z-10 text-center px-4">
                  {/* Step Number */}
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-lg sm:text-2xl font-bold hetzner-red">{step.step}</span>
                  </div>

                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-r ${step.color} p-0.5 mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-black rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <step.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold hetzner-text mb-3 sm:mb-4 group-hover:text-white transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base hetzner-text-muted leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-500/5 to-purple-500/5 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 border-t border-white/10 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-4 sm:mb-6">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 hetzner-red mr-1.5 sm:mr-2" />
              <span className="text-xs hetzner-red font-semibold uppercase tracking-wide">Features</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 tracking-tight">
              Everything You{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                Need & More
              </span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg hetzner-text-muted max-w-xl lg:max-w-2xl mx-auto leading-relaxed">
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
                className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-red-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 transform-gpu perspective-1000"
                style={{
                  animationDelay: `${index * 100}ms`,
                  transform: 'translateZ(0)'
                }}
              >
                {/* Enhanced Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-20 transition-all duration-500 -z-10`}></div>

                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-5"></div>

                <div className="relative z-10">
                  {/* Enhanced Icon Container */}
                  <div className="relative mb-4 sm:mb-6">
                    <div className="p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/10 to-white/5 w-fit group-hover:scale-110 transition-all duration-300 group-hover:rotate-3 transform-gpu">
                      <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 hetzner-red group-hover:animate-pulse" />
                    </div>
                    {/* Icon glow effect */}
                    <div className="absolute inset-0 p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl bg-red-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                  </div>

                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-white transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="hetzner-text-muted leading-relaxed text-sm sm:text-base lg:text-lg group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>

                  {/* Hover arrow indicator */}
                  <div className="mt-4 sm:mt-6 flex items-center text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2">
                    <span className="text-xs sm:text-sm font-medium mr-2">Learn more</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                </div>

                {/* Enhanced border glow */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-red-500/0 via-red-500/30 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-20"></div>

                {/* Corner accent */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section id="testimonials" className="py-12 sm:py-16 lg:py-20 border-t border-white/10 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-4 sm:mb-6">
              <Award className="h-3 w-3 sm:h-4 sm:w-4 hetzner-red mr-1.5 sm:mr-2" />
              <span className="text-xs hetzner-red font-semibold uppercase tracking-wide">Testimonials</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 tracking-tight">
              Loved by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                Developers Worldwide
              </span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg hetzner-text-muted max-w-xl lg:max-w-2xl mx-auto leading-relaxed">
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
                className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-red-500/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 transform-gpu"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Quote mark decoration */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-4xl sm:text-6xl text-red-500/20 font-serif leading-none">"</div>

                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-5"></div>

                <div className="relative z-10">
                  {/* Rating */}
                  <div className="flex items-center mb-4 sm:mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-yellow-400 group-hover:animate-pulse"
                          style={{ animationDelay: `${i * 100}ms` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Testimonial Content */}
                  <p className="hetzner-text-muted mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base lg:text-lg italic group-hover:text-gray-300 transition-colors duration-300">
                    "{testimonial.content}"
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white font-bold mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-sm sm:text-base">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      {/* Avatar glow */}
                      <div className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                    </div>
                    <div>
                      <div className="font-bold hetzner-text text-sm sm:text-base lg:text-lg group-hover:text-white transition-colors duration-300">
                        {testimonial.name}
                      </div>
                      <div className="text-xs sm:text-sm hetzner-text-muted group-hover:text-gray-400 transition-colors duration-300">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced border glow */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-20"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-l from-red-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-transparent rounded-full blur-3xl"></div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 border-t border-white/10 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-4 sm:mb-6 group hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-500">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 hetzner-red mr-1.5 sm:mr-2 group-hover:animate-spin" />
            <span className="text-xs hetzner-text-muted font-medium">🎉 Free & Open Source Forever</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 tracking-tight leading-tight">
            Ready to Simplify Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-red-600">
              Cloud Storage?
            </span>
          </h2>

          <p className="text-sm sm:text-base lg:text-lg hetzner-text-muted mb-8 sm:mb-12 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed">
            Join thousands of developers who use BucketBuddy for their cloud storage management needs.
            Completely free, open source, and ready to use in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center mb-12 sm:mb-16">
            <Link
              href="/signup"
              className="group relative hetzner-btn-primary px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg lg:text-xl transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/30 hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                <Rocket className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:animate-bounce" />
                Get Started Free
                <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:translate-x-2" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link
              href="/login"
              className="group relative hetzner-btn-secondary px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg lg:text-xl transition-all duration-300 hover:bg-white/10 hover:border-white/30 flex items-center justify-center backdrop-blur-sm"
            >
              <span className="flex items-center">
                Sign In
                <div className="ml-2 sm:ml-3 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-current opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
              </span>
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

      {/* Enhanced Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
            {/* Logo and Description */}
            <div className="flex flex-col items-center sm:items-start gap-4">
              <Logo size="md" />
              <p className="text-sm hetzner-text-muted text-center sm:text-left max-w-md">
                The modern way to manage your cloud storage. Built with ❤️ for developers.
              </p>
            </div>

            {/* Contact and Links */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <a
                href="mailto:hi@aysh.me"
                className="group flex items-center gap-3 hetzner-text-muted hover:hetzner-text transition-all duration-300 text-sm font-medium"
              >
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors duration-300">
                  <Mail className="h-4 w-4" />
                </div>
                <span>hi@aysh.me</span>
              </a>
              <a
                href="https://github.com/cyberboyayush/bucketbuddy"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 hetzner-text-muted hover:hetzner-text transition-all duration-300 text-sm font-medium"
              >
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors duration-300">
                  <Github className="h-4 w-4" />
                </div>
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-sm hetzner-text-muted">
              © 2024 BucketBuddy. Open source and free forever. Made with passion for the developer community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
