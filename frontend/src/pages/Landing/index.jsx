import PageLayout from '../../components/layout/PageLayout';
import HeroSection from './components/HeroSection';
import ProblemStatementSection from './components/ProblemStatementSection';
import TechMarquee from './components/TechMarquee';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import ArchitectureSection from './components/ArchitectureSection';
import DashboardShowcase from './components/DashboardShowcase';
import StatisticsSection from './components/StatisticsSection';
import WhyRoadSenseAI from './components/WhyRoadSenseAI';
import FAQSection from './components/FAQSection';
import LandingFooter from './components/LandingFooter';

export default function Landing() {
  return (
    <PageLayout hideFooter>
      <HeroSection />
      <ProblemStatementSection />
      <TechMarquee />
      <FeaturesSection />
      <HowItWorksSection />
      <WhyRoadSenseAI />
      <ArchitectureSection />
      <DashboardShowcase />
      <StatisticsSection />
      <FAQSection />
      <LandingFooter />
    </PageLayout>
  );
}

