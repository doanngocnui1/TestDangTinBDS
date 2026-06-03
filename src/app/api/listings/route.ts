import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const { title, description, price, area, location, images } = await req.json();

    if (!title || !price || !area || !location) {
      return NextResponse.json({ message: "Vui lòng nhập các trường bắt buộc" }, { status: 400 });
    }

    // Default image if not provided
    const imageUrl = images || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";

    const newListing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        area: parseFloat(area),
        location,
        images: imageUrl,
        status: "PENDING", // Need admin approval
        authorId: (session.user as any).id,
      }
    });

    return NextResponse.json(
      { message: "Đăng tin thành công, chờ kiểm duyệt", listing: newListing },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi đăng tin:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi hệ thống" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "APPROVED";
    
    const listings = await prisma.listing.findMany({
      where: {
        status: status,
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json(listings);
  } catch (error) {
    return NextResponse.json(
      { message: "Lỗi lấy danh sách tin" },
      { status: 500 }
    );
  }
}
