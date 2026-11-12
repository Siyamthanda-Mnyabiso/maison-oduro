import { Fragment } from "react";
import AnnouncementBar, { hasAnnouncement } from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import PopularRightNow from "@/components/PopularRightNow";
import ProductSection from "@/components/ProductSection";
import StoryBanner from "@/components/StoryBanner";
import { getSiteContent } from "@/lib/content";
import type { SectionId } from "@/lib/content-defaults";

export default async function Home() {
  const content = await getSiteContent();
  const hasBar = hasAnnouncement(content.announcement);

  // The admin chooses the order of these sections (Admin > Page layout).
  const sections: Record<SectionId, React.ReactNode> = {
    collection: <ProductSection id="collection" title="SoftSense™" products={content.products.softsense} bottles={content.bottles} />,
    story: <StoryBanner story={content.story} />,
    vengeance: <ProductSection title="Vengeance" products={content.products.vengeance} bottles={content.bottles} />,
    popular: <PopularRightNow cards={content.popular.cards} />,
  };

  return (
    <>
      <div className="relative">
        <AnnouncementBar announcement={content.announcement} />
        <Header nav={content.nav.links} slogan={content.footer.slogan} hasBar={hasBar} />
        <Hero hero={content.hero} hasBar={hasBar} />
      </div>
      <main>
        {content.layout.order.map((id) => (
          <Fragment key={id}>{sections[id]}</Fragment>
        ))}
        <Newsletter />
      </main>
      <Footer footer={content.footer} />
    </>
  );
}
