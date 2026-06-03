"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user as any).role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchListings();
  }, [session, status]);

  const fetchListings = async () => {
    try {
      const res = await fetch("/api/listings?status=PENDING");
      const data = await res.json();
      setListings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setListings(listings.filter(item => item.id !== id));
        alert(newStatus === 'APPROVED' ? 'Đã duyệt bài!' : 'Đã từ chối bài!');
      }
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi");
    }
  };

  if (loading) return <div className="container mt-4">Đang tải...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Quản Trị Hệ Thống</h1>

      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Tin Chờ Duyệt ({listings.length})</h2>
        
        {listings.length === 0 ? (
          <p>Không có tin nào đang chờ duyệt.</p>
        ) : (
          <div className={styles.list}>
            {listings.map(listing => (
              <div key={listing.id} className={styles.listItem}>
                <div className={styles.itemInfo}>
                  <h3>{listing.title}</h3>
                  <div className={styles.itemMeta}>
                    Người đăng: {listing.author?.name || listing.author?.email} | 
                    Giá: {listing.price} Tỷ | Diện tích: {listing.area}m²
                  </div>
                  <div className={styles.itemMeta} style={{marginTop: '0.5rem'}}>
                    {listing.description.substring(0, 100)}...
                  </div>
                </div>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <button 
                    onClick={() => handleAction(listing.id, 'APPROVED')} 
                    className="btn btn-primary"
                  >
                    Duyệt
                  </button>
                  <button 
                    onClick={() => handleAction(listing.id, 'REJECTED')} 
                    className="btn" 
                    style={{backgroundColor: 'var(--danger)', color: 'white'}}
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
