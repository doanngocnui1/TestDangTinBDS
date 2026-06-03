"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./post.module.css";

export default function PostListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    area: "",
    location: "",
    images: ""
  });
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (status === "loading") return <div className="container mt-4">Đang tải...</div>;
  
  if (!session) {
    router.push("/login");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check configuration
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError("Hệ thống chưa được cấu hình Cloudinary để tải ảnh. Vui lòng xem hướng dẫn.");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: data,
        });

        const json = await res.json();
        if (json.secure_url) {
          uploadedUrls.push(json.secure_url);
        }
      }

      setPreviewImages([...previewImages, ...uploadedUrls]);
      
      // Update form data images with comma separated string
      const currentImages = formData.images ? formData.images.split(",") : [];
      setFormData({
        ...formData,
        images: [...currentImages, ...uploadedUrls].join(",")
      });

    } catch (err) {
      console.error(err);
      setError("Lỗi tải ảnh. Vui lòng thử lại.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      
      setMessage(data.message);
      setFormData({ title: "", description: "", price: "", area: "", location: "", images: "" });
      setPreviewImages([]);
      
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.postContainer}>
      <div className={styles.postCard}>
        <h1 className={styles.title}>Đăng Tin Mới</h1>
        
        {error && <div style={{color: 'red', marginBottom: '1rem', background: '#fee2e2', padding: '1rem', borderRadius: '8px'}}>{error}</div>}
        {message && <div style={{color: 'green', marginBottom: '1rem', padding: '1rem', background: '#dcfce7', borderRadius: '8px'}}>{message}</div>}
        
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.formLabel}>Tiêu đề tin đăng *</label>
            <input name="title" required value={formData.title} onChange={handleChange} className="input-field" placeholder="VD: Bán căn hộ 3PN cao cấp..." />
          </div>
          
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.formLabel}>Mô tả chi tiết *</label>
            <textarea name="description" required value={formData.description} onChange={handleChange} className={`input-field ${styles.textareaField}`} placeholder="Thông tin chi tiết về bất động sản..."></textarea>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Giá (Tỷ VNĐ) *</label>
            <input name="price" type="number" step="0.1" required value={formData.price} onChange={handleChange} className="input-field" placeholder="VD: 5.5" />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Diện tích (m²) *</label>
            <input name="area" type="number" step="1" required value={formData.area} onChange={handleChange} className="input-field" placeholder="VD: 100" />
          </div>
          
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.formLabel}>Địa chỉ *</label>
            <input name="location" required value={formData.location} onChange={handleChange} className="input-field" placeholder="VD: Quận 1, TP. HCM" />
          </div>
          
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.formLabel}>Tải Hình Ảnh (Trực tiếp)</label>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleImageUpload} 
              className={styles.fileInput} 
              disabled={uploadingImage}
            />
            {uploadingImage && <span style={{fontSize: '0.9rem', color: 'var(--primary)'}}>Đang tải ảnh lên...</span>}
            
            {previewImages.length > 0 && (
              <div className={styles.imagePreviewContainer}>
                {previewImages.map((img, idx) => (
                  <div key={idx} className={styles.imagePreview}>
                    <img src={img} alt={`Preview ${idx}`} />
                  </div>
                ))}
              </div>
            )}
            <small style={{color: '#64748b', display: 'block', marginTop: '0.5rem'}}>
              * Yêu cầu cấu hình Cloudinary trong file .env để tải ảnh. Nếu không, hệ thống sẽ dùng ảnh mặc định.
            </small>
          </div>
          
          <button type="submit" disabled={loading || uploadingImage} className={`btn btn-primary ${styles.fullWidth} ${styles.submitBtn}`}>
            {loading ? "Đang xử lý..." : "Đăng Tin (Chờ Duyệt)"}
          </button>
        </form>
      </div>
    </div>
  );
}
