import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Shield, Activity, BarChart3, MapPin } from 'lucide-react';
import Container from '../../../components/common/Container';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';

const statCards = [
  { icon: Activity, label: 'Road Images Processed', value: '12,500+' },
  { icon: Shield, label: 'Detection Accuracy', value: '95%' },
  { icon: BarChart3, label: 'Reports Generated', value: '4,800+' },
  { icon: MapPin, label: 'Avg. Processing Time', value: '<3s' },
];

function AIIllustration() {
  return (
    <div className="relative w-full aspect-[4/3] max-w-lg mx-auto" role="img" aria-label="AI-powered road damage detection illustration">
      <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Gradient for road */}
          <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1F2937" />
          </linearGradient>
          {/* Gradient for scan line */}
          <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2970FF" stopOpacity="0" />
            <stop offset="50%" stopColor="#2970FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2970FF" stopOpacity="0" />
          </linearGradient>
          {/* Heatmap gradient */}
          <radialGradient id="heatGrad">
            <stop offset="0%" stopColor="#F04438" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#F79009" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#2970FF" stopOpacity="0" />
          </radialGradient>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Grid pattern */}
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2970FF" strokeWidth="0.3" strokeOpacity="0.15" />
          </pattern>
        </defs>

        {/* Background grid */}
        <rect x="0" y="0" width="400" height="300" fill="url(#grid)" rx="12" />

        {/* Road network */}
        <path d="M 0 150 Q 100 130 200 160 Q 300 190 400 140" fill="none" stroke="url(#roadGrad)" strokeWidth="8" strokeLinecap="round" />
        <path d="M 0 150 Q 100 130 200 160 Q 300 190 400 140" fill="none" stroke="#4B5563" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />

        {/* Road markings */}
        <path d="M 0 150 Q 100 130 200 160 Q 300 190 400 140" fill="none" stroke="#FBBF24" strokeWidth="1" strokeDasharray="10 8" strokeLinecap="round" opacity="0.6" />

        {/* Perpendicular road */}
        <path d="M 200 0 Q 180 80 200 160 Q 220 240 200 300" fill="none" stroke="url(#roadGrad)" strokeWidth="6" strokeLinecap="round" />
        <path d="M 200 0 Q 180 80 200 160 Q 220 240 200 300" fill="none" stroke="#FBBF24" strokeWidth="0.8" strokeDasharray="8 8" strokeLinecap="round" opacity="0.4" />

        {/* AI scan line */}
        <motion.rect
          x="30" y="0" width="340" height="4" fill="url(#scanGrad)" rx="2"
          animate={{ y: [0, 296] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          filter="url(#glow)"
        />

        {/* Heatmap overlay */}
        <ellipse cx="200" cy="160" rx="80" ry="60" fill="url(#heatGrad)" />

        {/* Detected potholes with bounding boxes */}
        {/* Pothole 1 */}
        <rect x="120" y="130" width="28" height="22" rx="3" fill="none" stroke="#F04438" strokeWidth="1.5" />
        <rect x="120" y="130" width="28" height="22" rx="3" fill="#F04438" fillOpacity="0.15" />
        <circle cx="134" cy="141" r="5" fill="#1F2937" opacity="0.8" />
        <circle cx="134" cy="141" r="3" fill="#111827" />
        {/* Confidence label */}
        <rect x="119" y="112" width="38" height="16" rx="3" fill="#F04438" />
        <text x="138" y="123" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">98%</text>

        {/* Pothole 2 */}
        <rect x="230" y="165" width="32" height="24" rx="3" fill="none" stroke="#F79009" strokeWidth="1.5" />
        <rect x="230" y="165" width="32" height="24" rx="3" fill="#F79009" fillOpacity="0.15" />
        <ellipse cx="246" cy="177" rx="7" ry="5" fill="#1F2937" opacity="0.8" />
        <rect x="229" y="147" width="42" height="16" rx="3" fill="#F79009" />
        <text x="250" y="158" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">87%</text>

        {/* Pothole 3 (small) */}
        <rect x="300" y="120" width="22" height="18" rx="3" fill="none" stroke="#F04438" strokeWidth="1.5" />
        <rect x="300" y="120" width="22" height="18" rx="3" fill="#F04438" fillOpacity="0.15" />
        <circle cx="311" cy="129" r="3.5" fill="#1F2937" opacity="0.8" />
        <rect x="299" y="102" width="36" height="16" rx="3" fill="#F04438" />
        <text x="317" y="113" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">92%</text>

        {/* Severity badges */}
        <rect x="152" y="134" width="38" height="14" rx="4" fill="#F04438" />
        <text x="171" y="144" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">CRITICAL</text>

        <rect x="266" y="169" width="34" height="14" rx="4" fill="#F79009" />
        <text x="283" y="179" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">MODERATE</text>

        {/* Floating analytics cards */}
        {/* Card 1 - Top right */}
        <motion.g
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x="280" y="20" width="100" height="40" rx="6" fill="white" opacity="0.95" />
          <rect x="280" y="20" width="100" height="40" rx="6" fill="none" stroke="#E4E7EC" strokeWidth="0.5" />
          <text x="295" y="36" fill="#667085" fontSize="7" fontFamily="sans-serif">Detected Issues</text>
          <text x="330" y="52" fill="#101828" fontSize="12" fontWeight="bold" fontFamily="sans-serif">247</text>
          <rect x="358" y="40" width="14" height="14" rx="3" fill="#FEF3F2" />
          <rect x="362" y="43" width="6" height="8" rx="1" fill="#F04438" />
        </motion.g>

        {/* Card 2 - Bottom left */}
        <motion.g
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x="30" y="230" width="90" height="36" rx="6" fill="white" opacity="0.95" />
          <rect x="30" y="230" width="90" height="36" rx="6" fill="none" stroke="#E4E7EC" strokeWidth="0.5" />
          <circle cx="46" cy="248" r="6" fill="#D1FAE5" />
          <path d="M 44 248 L 46 250 L 49 245" fill="none" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" />
          <text x="58" y="244" fill="#667085" fontSize="6" fontFamily="sans-serif">Accuracy</text>
          <text x="58" y="257" fill="#101828" fontSize="10" fontWeight="bold" fontFamily="sans-serif">95.2%</text>
        </motion.g>

        {/* Scan brackets */}
        <path d="M 80 60 L 80 55 L 95 55" fill="none" stroke="#2970FF" strokeWidth="1.5" opacity="0.6" />
        <path d="M 320 60 L 320 55 L 305 55" fill="none" stroke="#2970FF" strokeWidth="1.5" opacity="0.6" />
        <path d="M 80 240 L 80 245 L 95 245" fill="none" stroke="#2970FF" strokeWidth="1.5" opacity="0.6" />
        <path d="M 320 240 L 320 245 L 305 245" fill="none" stroke="#2970FF" strokeWidth="1.5" opacity="0.6" />

        {/* Edge devices */}
        <rect x="30" y="20" width="50" height="18" rx="4" fill="#EEF2FF" stroke="#2970FF" strokeWidth="0.5" />
        <circle cx="42" cy="29" r="4" fill="#2970FF" opacity="0.2" />
        <circle cx="42" cy="29" r="2" fill="#2970FF" />
        <text x="50" y="32" fill="#2970FF" fontSize="7" fontWeight="bold" fontFamily="sans-serif">LiDAR</text>

        <rect x="310" y="260" width="60" height="18" rx="4" fill="#EEF2FF" stroke="#2970FF" strokeWidth="0.5" />
        <circle cx="320" cy="269" r="4" fill="#2970FF" opacity="0.2" />
        <circle cx="320" cy="269" r="2" fill="#2970FF" />
        <text x="328" y="272" fill="#2970FF" fontSize="7" fontWeight="bold" fontFamily="sans-serif">5G</text>
      </svg>
    </div>
  );
}

export default function HeroSection() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const statVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.6 + i * 0.1, ease: 'easeOut' },
    }),
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-secondary-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-secondary-950 to-dark-950" />
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary-500/10 blur-3xl animate-pulse-soft"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary-500/5 blur-3xl animate-pulse-soft"
          style={{ animationDelay: '1s' }}
          aria-hidden="true"
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#2970FF 1px, transparent 1px), linear-gradient(90deg, #2970FF 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
          aria-hidden="true"
        />
      </div>

      <Container className="relative z-10 pt-24 pb-16 sm:pt-32 sm:pb-20">
        <motion.div
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left: Text Content */}
          <div className="text-center lg:text-left">
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-300 border border-primary-500/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" aria-hidden="true" />
                AI-Powered Infrastructure Intelligence
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white"
            >
              AI-Powered Smart Road{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">
                Infrastructure Intelligence
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-5 text-base sm:text-lg text-secondary-400 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Detect, analyze, and manage road damage in real-time using advanced computer vision and predictive analytics. Empowering smart cities with actionable infrastructure insights.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <Button
                variant="primary"
                size="lg"
                rightIcon={ArrowRight}
                onClick={() => navigate('/register')}
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                leftIcon={Play}
                onClick={() => navigate('/register')}
                className="border-secondary-600 text-secondary-300 hover:bg-secondary-800 hover:text-white"
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Stat cards row */}
            <motion.div
              variants={itemVariants}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {statCards.map((stat, i) => {
                const StatIcon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    custom={i}
                    variants={statVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center lg:items-start p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                  >
                    <StatIcon size={16} className="text-primary-400 mb-1.5" aria-hidden="true" />
                    <span className="text-lg font-bold text-white">{stat.value}</span>
                    <span className="text-xs text-secondary-400 mt-0.5">{stat.label}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Right: AI Illustration */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            {/* Glow behind illustration */}
            <div className="absolute inset-0 bg-primary-500/10 rounded-3xl blur-2xl" aria-hidden="true" />
            <Card
              elevation="lg"
              padding="none"
              className="relative overflow-hidden bg-secondary-900/80 border border-secondary-700/50 backdrop-blur-sm"
            >
              <AIIllustration />
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

