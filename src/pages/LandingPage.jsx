import { Link } from 'react-router-dom';
import { BarChart3, MessageSquare, Calendar, Mail, TrendingUp, PieChart, FileText, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Social Media Analysis",
      description: "Track and analyze comments from VK, Instagram, Telegram, and WhatsApp"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Smart Email Management",
      description: "Filter important emails and get AI-powered summaries"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Unified Calendar",
      description: "Aggregate events from multiple business tools"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Revenue Tracking",
      description: "Monitor revenue, expenses, and growth metrics"
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: "Custom Analytics",
      description: "Create custom charts and visualizations"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Workplace",
      description: "Built-in ChatGPT workspace for analysis"
    }
  ];

  return (
    <div className={`min-h-screen transition-smooth ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Navigation */}
      <nav className={`border-b transition-smooth ${
        theme === 'dark' ? 'border-gray-800/50 bg-black/80 backdrop-blur-md' : 'border-gray-200 bg-white/80 backdrop-blur-md'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 font-semibold">
              <div className={`p-2 rounded-lg btn-gradient`}>
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl">Business Copilot</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-smooth hover:scale-110 ${
                  theme === 'dark'
                    ? 'bg-gray-900/50 hover:bg-gray-800'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <Link
                to="/login"
                className={`px-6 py-3 rounded-lg transition-smooth hover:scale-105 ${
                  theme === 'dark'
                    ? 'hover:bg-gray-900'
                    : 'hover:bg-gray-100'
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 btn-gradient text-white rounded-lg transition-smooth btn-hover-lift font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`w-full px-4 sm:px-6 lg:px-8 py-32 text-center relative overflow-hidden`}>
        {/* Gradient background */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-20 left-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-blue-500 to-cyan-500 rounded-full blur-3xl"></div>
        </div>
        
        <h1 className="text-6xl sm:text-7xl font-bold mb-6 leading-tight">
          Your Business Intelligence,
          <br />
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Unified and AI-Powered
          </span>
        </h1>
        <p className={`text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Manage your entire business from one visual dashboard. Connect all your tools, 
          track metrics, and get AI-powered insights instantly.
        </p>
        <div className="flex gap-6 justify-center flex-wrap">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3 btn-gradient text-white rounded-lg font-semibold transition-smooth btn-hover-lift"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/canvas"
            className={`inline-flex items-center gap-2 px-8 py-3 border-2 rounded-lg font-semibold transition-smooth btn-hover-lift ${
              theme === 'dark'
                ? 'border-white/30 hover:bg-white/5'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            Try Live Demo
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-32">
        <h2 className="text-4xl font-bold text-center mb-4">
          Everything You Need
        </h2>
        <p className={`text-center mb-24 text-lg ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          All-in-one business management made simple
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`text-center group p-8 rounded-2xl border transition-smooth hover:scale-105 cursor-default shadow-soft hover:shadow-md-modern ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
                  : 'bg-gray-50/50 border-gray-200 hover:bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-smooth group-hover:scale-110 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                  : 'bg-gradient-to-br from-blue-100 to-purple-100'
              }`}>
                <div className="text-blue-500">{feature.icon}</div>
              </div>
              <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Visual Preview Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-32">
        <div className={`rounded-3xl border overflow-hidden shadow-lg-modern transition-smooth ${
          theme === 'dark'
            ? 'border-gray-700/50 bg-gradient-to-br from-gray-900 to-black'
            : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white'
        }`}>
          <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center canvas-dots relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
            </div>
            <div className="text-center p-8 relative z-10">
              <BarChart3 className="w-24 h-24 mx-auto mb-4 opacity-40 animate-bounce" />
              <p className={`text-lg font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Interactive Canvas - Try the Live Demo Above
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={`w-full px-4 sm:px-6 lg:px-8 py-32 rounded-3xl ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50'
          : 'bg-gradient-to-r from-blue-50 to-purple-50'
      }`}>
        <h2 className="text-4xl font-bold text-center mb-16">Why Choose Business Copilot?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { title: "Real-time Insights", description: "Get instant updates on all your business metrics" },
            { title: "AI-Powered Analysis", description: "Leverage ChatGPT for smart business decisions" },
            { title: "Zero Setup Time", description: "Start managing your business in minutes" },
            { title: "Fully Customizable", description: "Create dashboards tailored to your needs" },
            { title: "Multi-Platform", description: "Access from desktop, tablet, or mobile" },
            { title: "Data Privacy First", description: "Your data stays secure and local" }
          ].map((benefit, index) => (
            <div key={index} className="flex gap-4">
              <Check className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              <div className="text-center">
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Business?</h2>
        <p className={`text-xl mb-16 max-w-2xl mx-auto ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Join hundreds of business owners who already use Business Copilot to stay on top of their operations.
        </p>
        <div className="flex gap-6 justify-center flex-wrap">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 btn-gradient text-white rounded-lg text-lg font-semibold transition-smooth btn-hover-lift"
          >
            Get Started for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/canvas"
            className={`inline-flex items-center gap-2 px-8 py-4 border-2 rounded-lg text-lg font-semibold transition-smooth btn-hover-lift ${
              theme === 'dark'
                ? 'border-white/30 hover:bg-white/5'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            Explore Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t transition-smooth ${
        theme === 'dark'
          ? 'border-gray-800/50 bg-gray-900/30'
          : 'border-gray-200 bg-gray-50/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Business Copilot</h4>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                AI-powered business intelligence dashboard
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><Link to="/" className="hover:text-blue-500 transition-colors">Features</Link></li>
                <li><Link to="/" className="hover:text-blue-500 transition-colors">Pricing</Link></li>
                <li><Link to="/canvas" className="hover:text-blue-500 transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><Link to="/" className="hover:text-blue-500 transition-colors">About</Link></li>
                <li><Link to="/" className="hover:text-blue-500 transition-colors">Blog</Link></li>
                <li><Link to="/" className="hover:text-blue-500 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className={`text-center pt-8 border-t ${
            theme === 'dark' ? 'border-gray-800/50 text-gray-500' : 'border-gray-200 text-gray-600'
          }`}>
            <p>© 2024 Business Copilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
