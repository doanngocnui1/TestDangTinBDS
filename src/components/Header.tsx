"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import styles from "./Header.module.css";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          RealEstate
        </Link>
        
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Trang chủ</Link>
          <Link href="/search" className={styles.navLink}>Tìm kiếm</Link>
        </nav>

        <div className={styles.actions}>
          {session ? (
            <div className={styles.userMenu}>
              <span className={styles.userName}>Xin chào, {session.user?.name || session.user?.email}</span>
              {(session.user as any)?.role === "ADMIN" ? (
                <Link href="/admin" className="btn btn-secondary">Admin Panel</Link>
              ) : (
                <Link href="/dashboard" className="btn btn-secondary">Quản lý tin</Link>
              )}
              <Link href="/post" className="btn btn-primary">Đăng tin</Link>
              <button onClick={() => signOut()} className="btn btn-secondary">Đăng xuất</button>
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary">Đăng nhập</Link>
              <Link href="/register" className="btn btn-primary">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
