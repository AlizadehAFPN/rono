import Navbar from "@/components/homepage/Navbar";
import Hero from "@/components/homepage/Hero";
import Problem from "@/components/homepage/Problem";
import Solution from "@/components/homepage/Solution";
import HowItWorks from "@/components/homepage/HowItWorks";
import Differentiators from "@/components/homepage/Differentiators";
import Platforms from "@/components/homepage/Platforms";
import Roadmap from "@/components/homepage/Roadmap";
import ContactCTA from "@/components/homepage/ContactCTA";
import Footer from "@/components/homepage/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <Differentiators />
        <Platforms />
        <Roadmap />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
