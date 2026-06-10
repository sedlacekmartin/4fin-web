import Ticker from "@/components/Ticker";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsBand from "@/components/StatsBand";
import Benefits from "@/components/Benefits";
import HowItWorks from "@/components/HowItWorks";
import RatesDashboard from "@/components/RatesDashboard";
import InvestmentTeaser from "@/components/InvestmentTeaser";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";
import Team from "@/components/Team";
import LeadForm from "@/components/LeadForm";
import Branches from "@/components/Branches";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Ticker />
      <Navbar />
      <main>
        {/* 1. Hook + kalkulačka */}
        <Hero />

        {/* 2. Rychlá důvěra */}
        <StatsBand />

        {/* 3. Proč poradce — klíčový argument */}
        <Benefits />

        {/* 4. Jak to funguje — odstranění nejistoty */}
        <HowItWorks />

        {/* 5. Live sazby — ukázka hodnoty */}
        <RatesDashboard />

        {/* 6. Prémiový trik — engagement */}
        <InvestmentTeaser />

        {/* 7. Co všechno řešíme */}
        <Services />

        {/* 8. Proč zrovna 4fin — proof */}
        <WhyUs />

        {/* 9. Tým — lidský prvek */}
        <Team />

        {/* 10. Konverze */}
        <LeadForm />

        {/* 11. Kde nás najdete */}
        <Branches />
      </main>
      <Footer />
    </>
  );
}
