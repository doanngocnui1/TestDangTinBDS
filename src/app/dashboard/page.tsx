import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import styles from "./dashboard.module.css";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  const listings = await prisma.listing.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' }
  });

  const notifications = await prisma.notification.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className={styles.title} style={{marginBottom: 0}}>Quản Lý Tin Đăng</h1>
        <Link href="/post" className="btn btn-primary">Đăng Tin Mới</Link>
      </div>

      <div className={styles.grid}>
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Tin Đăng Của Bạn ({listings.length})</h2>
          
          {listings.length === 0 ? (
            <p>Bạn chưa có tin đăng nào.</p>
          ) : (
            <div className={styles.list}>
              {listings.map(listing => (
                <div key={listing.id} className={styles.listItem}>
                  <div className={styles.itemInfo}>
                    <h3>{listing.title}</h3>
                    <div className={styles.itemMeta}>
                      Giá: {listing.price} Tỷ | {new Date(listing.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <div>
                    <span className={`${styles.status} ${
                      listing.status === 'APPROVED' ? styles.statusApproved : 
                      listing.status === 'REJECTED' ? styles.statusRejected : styles.statusPending
                    }`}>
                      {listing.status === 'APPROVED' ? 'Đã duyệt' : 
                       listing.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Thông Báo</h2>
          
          {notifications.length === 0 ? (
            <p>Không có thông báo nào.</p>
          ) : (
            <div>
              {notifications.map(noti => (
                <div key={noti.id} className={styles.notification}>
                  <div>{noti.message}</div>
                  <div className={styles.notificationDate}>
                    {new Date(noti.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
