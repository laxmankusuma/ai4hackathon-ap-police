import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Shield,
  Phone,
  MapPin,
  Mic,
  ArrowRight,
  Play,
  CheckCircle,
  Mail,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';

interface MainHomeProps {
  onEnterDashboard: () => void;
}

export const MainHome: React.FC<MainHomeProps> = ({ onEnterDashboard }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const features = [
    {
      icon: Phone,
      title: "24/7 Emergency Response",
      description: "Round-the-clock monitoring and response to emergency calls across Andhra Pradesh with intelligent call routing and priority management",
      color: "text-red-500"
    },
    {
      icon: Mic,
      title: "AI Voice Processing",
      description: "Advanced AI technology for real-time transcription, sentiment analysis, and intelligent call categorization for faster response",
      color: "text-blue-500"
    },
    {
      icon: MapPin,
      title: "Live Crime Mapping",
      description: "Interactive heatmaps with predictive analytics showing real-time crime incidents, response patterns, and resource allocation",
      color: "text-green-500"
    },
    {
      icon: Shield,
      title: "Automated Ticket Generation",
      description: "Instant ticket creation with smart location resolution, priority assignment, and automated dispatch to nearest response units",
      color: "text-purple-500"
    }
  ];

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {/* Andhra Police Logo */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                  <img src="favicon.ico" alt="" />
                </div>

                {/* Separator X */}
                <div className="text-2xl font-bold text-gray-400">×</div>

                {/* Posidex Logo */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center">
                  <img src="posidex.png" alt="" />
                </div>
              </div>

              <div className="hidden md:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Dial 112 System
                </h1>
                <p className="text-xs text-gray-500">AP Police × Posidex</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition-colors duration-200 hover:scale-105"
                >
                  {item.name}
                </a>
              ))}
              <Button
                onClick={onEnterDashboard}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Dashboard
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200/20">
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <Button
                  onClick={onEnterDashboard}
                  className="mx-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full"
                >
                  Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div id="home" className="relative overflow-hidden pt-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <div className="flex justify-center mb-12">
              <div className="relative group">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110">
                  <span className="text-white font-bold text-4xl">112</span>
                </div>
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 scale-150 animate-ping"></div>
              </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight">
              Dial{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-pulse">
                112
              </span>{' '}
              System
            </h1>

            <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Revolutionary AI-Powered Emergency Response System
              <br />
              <span className="text-lg text-blue-600 dark:text-blue-400 font-semibold">
                Transforming Public Safety in Andhra Pradesh
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group"
                onClick={onEnterDashboard}
              >
                Enter Dashboard
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="px-12 py-6 text-xl rounded-full border-2 border-gray-300 hover:border-blue-500 hover:bg-white dark:hover:bg-gray-800 transition-all duration-500 hover:scale-105 group shadow-lg hover:shadow-xl"
              >
                <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Secure & Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span>24/7 Operations</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-500" />
                <span>26 Districts Covered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Advanced Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Cutting-edge technology designed to enhance emergency response and public safety with intelligent automation and real-time insights
            </p>
          </div>

          <Carousel className="w-full max-w-6xl mx-auto">
            <CarouselContent className="-ml-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <CarouselItem key={index} className="pl-4 md:basis-1/2">
                    <div className="h-full">
                      <Card className="h-full hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl group">
                        <CardHeader className="text-center pb-6">
                          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg">
                            <Icon className={`h-10 w-10 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                          </div>
                          <CardTitle className="text-2xl font-bold">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-gray-600 dark:text-gray-400 text-center text-lg leading-relaxed">
                            {feature.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Emergency Response?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed">
            Join the digital revolution in emergency services and help build a safer Andhra Pradesh with intelligent AI-powered solutions
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-16 py-6 text-2xl rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group"
            onClick={onEnterDashboard}
          >
            Get Started Today
            <CheckCircle className="ml-3 h-7 w-7 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center">
                    <img src="favicon.ico" alt="" />
                  </div>
                  <div className="text-2xl font-bold text-gray-400">×</div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <img src="posidex.png" alt="" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">AI Dial 112 System</h3>
                  <p className="text-gray-400">Andhra Pradesh Police × Posidex</p>
                </div>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                Revolutionizing emergency response through advanced AI technology and intelligent automation for a safer tomorrow.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors duration-200 hover:underline"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xl font-semibold mb-6">Contact</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400">Emergency: 112</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-purple-400" />
                  <span className="text-gray-400">support@dial112.ap.gov.in</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-green-400" />
                  <span className="text-gray-400">Andhra Pradesh, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-center md:text-left">
              © 2025 AI Dial 112 System. All rights reserved. | Powered by AI Technology
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors duration-200">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};