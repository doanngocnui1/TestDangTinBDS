import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

// GET tất cả bài đăng
export async function GET(req: Request) {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, email: true } }
      }
    });
    return NextResponse.json(listings);
  } catch (error) {
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}

// POST bài đăng mới (có xác thực Bearer Token)
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.NEXTAUTH_SECRET || "fallback_secret";
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return NextResponse.json({ message: "Token không hợp lệ hoặc đã hết hạn" }, { status: 401 });
    }

    const { title, description, price, area, location, images } = await req.json();

    if (!title || !price || !area || !location) {
      return NextResponse.json({ message: "Vui lòng nhập các trường bắt buộc" }, { status: 400 });
    }

    const imageUrl = images || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";

    const newListing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        area: parseFloat(area),
        location,
        images: imageUrl,
        status: "PENDING",
        authorId: decoded.id,
      }
    });

    return NextResponse.json({ message: "Đăng tin thành công", listing: newListing }, { status: 201 });
  } catch (error) {
    console.error("Mobile Post Error:", error);
    return NextResponse.json({ message: "Đã xảy ra lỗi hệ thống" }, { status: 500 });
  }
}
