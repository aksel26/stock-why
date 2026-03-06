import { NextRequest, NextResponse } from "next/server";
import { runAnalysisPipeline } from "@/lib/pipeline";
import { useMock } from "@/lib/config";
import { log, logError, createRequestId } from "@/lib/utils/logger";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const requestId = createRequestId();

  if (!code || !/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "올바른 종목코드(6자리 숫자)를 입력해주세요." },
      { status: 400 }
    );
  }

  log(requestId, "api:request", { code, mock: useMock() });

  try {
    const data = await runAnalysisPipeline(code);
    log(requestId, "api:response", { code, cache: data.meta.cache, signalCount: data.context.signals.length });
    return NextResponse.json(data);
  } catch (err) {
    logError(requestId, "api:error", err);
    return NextResponse.json(
      { error: "분석 데이터를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
