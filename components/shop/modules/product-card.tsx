import Link from "next/link";

type ProductCardProps = {
  title: string;
  price: number;
  description: string;
  href?: string;
};

export default function ProductCard({ title, price, description, href = "/checkout" }: ProductCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="h-48 rounded-3xl bg-slate-100" />
      <h3 className="mt-6 text-2xl font-semibold">{title}</h3>
      <p className="mt-3 text-slate-600">{description}</p>
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-xl font-semibold">฿{price}</span>
        <Link href={href} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
          Buy now
        </Link>
      </div>
    </article>
  );
}
