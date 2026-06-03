import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import styles from "./listing.module.css";
import ImageGallery from "./ImageGallery";

export const dynamic = 'force-dynamic';

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      author: {
        select: { name: true, email: true }
      }
    }
  });

  if (!listing) {
    notFound();
  }

  const imagesArray = listing.images ? listing.images.split(',') : [];

  return (
    <div className={styles.container}>
      <ImageGallery images={imagesArray} title={listing.title} />

      <div className={styles.header} style={{marginTop: '2rem'}}>
        <div>
          <h1 className={styles.title}>{listing.title}</h1>
          <div className={styles.location}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            {listing.location}
          </div>
        </div>
        <div className={styles.priceBox}>
          <div className={styles.price}>{listing.price} Tỷ</div>
          <div style={{fontSize: '0.9rem', opacity: 0.9}}>~ {(listing.price * 1000 / listing.area).toFixed(1)} Triệu/m²</div>
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.featureItem}>
          <svg className={styles.featureIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          {listing.area} m²
        </div>
      </div>

      <div style={{marginBottom: '2rem'}}>
        <h2 style={{marginBottom: '1rem'}}>Mô tả chi tiết</h2>
        <div className={styles.description}>
          {listing.description}
        </div>
      </div>

      <div className={styles.contactBox}>
        <h2 className={styles.contactTitle}>Thông tin liên hệ</h2>
        <p style={{fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem'}}>
          {listing.author.name || "Người dùng ẩn danh"}
        </p>
        <p style={{color: 'var(--secondary-foreground)', marginBottom: '1.5rem'}}>
          Email: {listing.author.email}
        </p>
        <button className="btn btn-primary" style={{padding: '1rem 3rem', fontSize: '1.1rem'}}>
          Liên hệ ngay
        </button>
      </div>
    </div>
  );
}
