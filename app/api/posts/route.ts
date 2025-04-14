import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// 🔐 JWT нууц үг .env-д байгаа эсэхээ шалгаарай
const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });

    if (!token || !token.id) {
      console.log("🔐 Token байхгүй байна");
      return NextResponse.json({ message: "Нэвтрэх шаардлагатай" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, imageUrl, tags } = body;

    if (!title || !content) {
      return NextResponse.json({ message: "Гарчиг болон агуулга оруулна уу" }, { status: 400 });
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        tags: tags && Array.isArray(tags) ? tags : [],
        authorId: token.id, // 🤝 token-аас авсан ID-г ашиглана
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Нийтлэл үүсгэх алдаа:", error);
    return NextResponse.json({ message: "Алдаа гарлаа" }, { status: 500 });
  }
}
