import { Suspense } from "react";
import { notFound } from "next/navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductView from "@/components/ProductView";
import { getSiteContent } from "@/lib/content";
import { slugify } from "@/lib/data";

const allProducts = (c: Awaited<ReturnType<typeof getSiteContent>>) => [
  ...c.products.softsense,
  ...c.products.vengeance,
];

export async function generateStaticParams() {
  const content = await getSiteContent();
  return allProducts(content).map((p) => ({ slug: slugify(p) }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getSiteContent();
  const all = allProducts(content);
  const product = all.find((p) => slugify(p) === slug);
  if (!product) notFound();

  return (
    <>
      <AnnouncementBar announcement={content.announcement} />
      <Header solid nav={content.nav.links} slogan={content.footer.slogan} />
      <Suspense>
        <ProductView
          product={product}
          related={all.filter((p) => p !== product).slice(0, 4)}
          bottles={content.bottles}
          gallery={content.gallery.images.map((g) => g.url)}
          shipping={content.productInfo.shipping}
        />
      </Suspense>
      <Footer footer={content.footer} />
    </>
  );
}
