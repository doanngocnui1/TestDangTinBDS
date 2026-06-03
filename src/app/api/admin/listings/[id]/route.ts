import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
    }

    const { status } = await req.json(); // "APPROVED" or "REJECTED"
    
    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json({ message: "Trạng thái không hợp lệ" }, { status: 400 });
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: { status }
    });

    // Tạo thông báo cho user
    await prisma.notification.create({
      data: {
        userId: listing.authorId,
        message: `Tin đăng "${listing.title}" của bạn đã ${status === 'APPROVED' ? 'được duyệt' : 'bị từ chối'}.`,
      }
    });

    return NextResponse.json({ message: "Cập nhật thành công", listing });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}
