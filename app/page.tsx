import Ticker from "@/components/Ticker";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsBand from "@/components/StatsBand";
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
        <Hero />
        <StatsBand />
        <RatesDashboard />
        <InvestmentTeaser />
        <Services />
        <WhyUs />
        <Team />
        <LeadForm />
        <Branches />
      </main>
      <Footer />
    </>
  );
}
