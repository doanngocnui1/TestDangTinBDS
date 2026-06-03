import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return NextResponse.json({ message: "Tài khoản không tồn tại" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: "Mật khẩu không đúng" }, { status: 401 });
    }

    const secret = process.env.NEXTAUTH_SECRET || "fallback_secret";
    
    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      secret,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Mobile Login Error:", error);
    return NextResponse.json({ message: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
