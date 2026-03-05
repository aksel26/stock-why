import { NextRequest, NextResponse } from "next/server";
import { runAnalysisPipeline } from "@/lib/pipeline";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code || !/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "올바른 종목코드(6자리 숫자)를 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    const data = await runAnalysisPipeline(code);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[analysis/route]", err);
    return NextResponse.json(
      { error: "분석 데이터를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
