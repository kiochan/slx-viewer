// app/uploadAction.ts
"use server";

import { parseSlxBuffer } from "../lib/slx-parser";
import { setSimulinkData } from "./serverState";

// Server Action：解析 slx 并存到后端状态
export async function uploadSlxAction(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file uploaded");

  // 读入 buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 调用解析逻辑
  const data = parseSlxBuffer(buffer);

  // 返回前端
  return data;
}
