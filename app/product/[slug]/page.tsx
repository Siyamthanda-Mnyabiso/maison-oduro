import { Suspense } from "react";
import { notFound } from "next/navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductView from "@/components/ProductView";
import { allProducts, findProduct, slugify } from "@/lib/data";

export function generateStaticParams() {
  return allProducts().map((p) => ({ slug: slugify(p) }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  return (
    <>
      <AnnouncementBar />
      <Header solid />
      <Suspense>
        <ProductView product={product} related={allProducts().filter((p) => p !== product).slice(0, 4)} />
      </Suspense>
      <Footer />
    </>
  );
}
