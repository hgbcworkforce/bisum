import { merchandiseItems } from "../../../data/merchandiseData";
import MerchandiseDetailsClient from "./MerchandiseDetailsClient";

export function generateStaticParams() {
  return merchandiseItems.map((item) => ({
    id: item.id,
  }));
}

export default async function MerchandiseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MerchandiseDetailsClient id={id} />;
}
