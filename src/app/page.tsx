import styles from "./page.module.css";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const featuredListings = await prisma.listing.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            Tìm Kiếm <span>Bất Động Sản</span> Lý Tưởng
          </h1>
          <p className={styles.heroSubtitle}>
            Khám phá hàng ngàn ngôi nhà, căn hộ và mảnh đất mơ ước với nền tảng cao cấp nhất dành cho bạn.
          </p>
          
          <form className={styles.searchForm}>
            <input 
              type="text" 
              placeholder="Nhập địa điểm, quận, tên đường..." 
              className={styles.searchInput}
            />
            <button type="submit" className={`btn btn-primary ${styles.searchBtn}`}>
              Tìm kiếm
            </button>
          </form>
        </div>
      </section>

      <section className={styles.featuredSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Tin Đăng Mới Nhất</h2>
            <p className="text-secondary">Những bất động sản vừa được kiểm duyệt</p>
          </div>
          
          <div className={styles.grid}>
            {featuredListings.length === 0 ? (
              <p style={{textAlign: 'center', gridColumn: '1 / -1'}}>Chưa có tin đăng nào.</p>
            ) : (
              featuredListings.map(listing => (
                <Link key={listing.id} href={`/listings/${listing.id}`} className={styles.card}>
                  <div className={styles.cardImageWrapper}>
                    <img 
                      src={listing.images || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"} 
                      alt={listing.title} 
                      className={styles.cardImage} 
                    />
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardPrice}>{listing.price} Tỷ</div>
                    <h3 className={styles.cardTitle}>{listing.title}</h3>
                    <div className={styles.cardLocation}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {listing.location}
                    </div>
                    <div className={styles.cardFeatures}>
                      <div className={styles.cardFeature}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        {listing.area} m²
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
