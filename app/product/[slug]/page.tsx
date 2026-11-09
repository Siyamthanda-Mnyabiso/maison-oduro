import { notFound } from "next/navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductView from "@/components/ProductView";
import { allProducts, findProduct, slugify, productOptions, type ProductOption } from "@/lib/data";

export function generateStaticParams() {
  return allProducts().map((p) => ({ slug: slugify(p) }));
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ format?: string }>;
}) {
  const { slug } = await params;
  const { format } = await searchParams;
  const product = findProduct(slug);
  if (!product) notFound();
  const initial = productOptions.find((o) => o === format) ?? "Premium";

  return (
    <>
      <AnnouncementBar />
      <Header solid />
      <ProductView product={product} initialFormat={initial as ProductOption} />
      <Footer />
    </>
  );
}
