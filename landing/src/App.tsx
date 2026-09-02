import { CommunityOrbit } from "@/components/CommunityOrbit";
import { CommunityStories } from "@/components/CommunityStories";
import { CTASection } from "@/components/CTASection";
import { ExploreSection } from "@/components/ExploreSection";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { ImpactSection } from "@/components/ImpactSection";
import { LiveCommunity } from "@/components/LiveCommunity";
import { Navbar } from "@/components/Navbar";
import { CustomCursor } from "@/components/shared/CustomCursor";

export default function App() {
  return (
    <div className="grain relative">
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <CommunityOrbit />
        <ExploreSection />
        <LiveCommunity />
        <ImpactSection />
        <CommunityStories />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
