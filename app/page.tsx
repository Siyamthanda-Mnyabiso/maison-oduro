import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import PopularRightNow from "@/components/PopularRightNow";
import ProductSection from "@/components/ProductSection";
import StoryBanner from "@/components/StoryBanner";
import { softsense, vengeance } from "@/lib/data";

export default function Home() {
  return (
    <>
      <div className="relative">
        <AnnouncementBar />
        <Header />
        <Hero />
      </div>
      <main>
        <ProductSection id="collection" title="SoftSense™" products={softsense} />
        <StoryBanner />
        <ProductSection title="Vengeance" products={vengeance} />
        <PopularRightNow />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
