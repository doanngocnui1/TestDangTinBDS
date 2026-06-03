import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
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

    const listings = await prisma.listing.findMany({
      where: { authorId: decoded.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(listings);
  } catch (error) {
    return NextResponse.json({ message: "Lỗi lấy danh sách tin cá nhân" }, { status: 500 });
  }
}
