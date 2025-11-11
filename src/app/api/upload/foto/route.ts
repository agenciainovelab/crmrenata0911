import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("foto") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Foto e ID do usuário são obrigatórios" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "O arquivo deve ser uma imagem" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "A imagem deve ter no máximo 5MB" },
        { status: 400 }
      );
    }

    // Get current user to delete old photo
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { foto: true },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = file.name.split(".").pop();
    const filename = `user-${userId}-${timestamp}-${random}.${ext}`;
    const filepath = join(process.cwd(), "public", "uploads", filename);

    // Save file
    await writeFile(filepath, buffer);

    // Update database
    const updatedUsuario = await prisma.usuario.update({
      where: { id: userId },
      data: { foto: `/uploads/${filename}` },
    });

    // Delete old photo if exists
    if (usuario.foto && usuario.foto.startsWith("/uploads/")) {
      try {
        const oldPath = join(process.cwd(), "public", usuario.foto);
        await unlink(oldPath);
      } catch (error) {
        console.error("Erro ao deletar foto antiga:", error);
      }
    }

    return NextResponse.json({
      foto: updatedUsuario.foto,
      message: "Foto atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao fazer upload da foto:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload da foto" },
      { status: 500 }
    );
  }
}
