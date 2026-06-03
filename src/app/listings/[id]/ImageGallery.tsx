"use client";

import { useState } from "react";
import styles from "./listing.module.css";

export default function ImageGallery({ images, title }: { images: string[], title: string }) {
  const [mainImage, setMainImage] = useState(images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80");

  if (!images || images.length === 0) {
    return (
      <div className={styles.imageGallery}>
        <img 
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80" 
          alt={title} 
          className={styles.mainImage}
        />
      </div>
    );
  }

  return (
    <>
      <div className={styles.imageGallery}>
        <img 
          src={mainImage} 
          alt={title} 
          className={styles.mainImage}
          style={{ transition: "all 0.3s ease" }}
        />
      </div>
      
      {images.length > 1 && (
        <div className={styles.galleryGrid}>
          {images.map((img, idx) => (
            <img 
              key={idx} 
              src={img} 
              alt={`${title} - ảnh ${idx + 1}`} 
              className={styles.galleryItem} 
              onClick={() => setMainImage(img)}
              style={{ 
                cursor: "pointer", 
                border: mainImage === img ? "3px solid var(--primary)" : "1px solid var(--border)",
                opacity: mainImage === img ? 1 : 0.7
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
