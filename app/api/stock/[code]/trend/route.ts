import { NextRequest, NextResponse } from "next/server";
import { runTrendPipeline } from "@/lib/trend/pipeline";
import { TrendPeriod } from "@/lib/trend/schema";
import { useMock } from "@/lib/config";
import { log, logError, createRequestId } from "@/lib/utils/logger";

export async function GET(
  req: NextRequest,
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

  const periodParam = req.nextUrl.searchParams.get("period") ?? "1M";
  const parsed = TrendPeriod.safeParse(periodParam);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "올바른 기간을 선택해주세요. (1W, 1M, 3M, 6M, 1Y)" },
      { status: 400 }
    );
  }

  log(requestId, "trend-api:request", { code, period: parsed.data, mock: useMock() });

  try {
    const data = await runTrendPipeline(code, parsed.data);
    log(requestId, "trend-api:response", { code, period: parsed.data, cache: data.meta.cache });
    return NextResponse.json(data);
  } catch (err) {
    logError(requestId, "trend-api:error", err);
    return NextResponse.json(
      { error: "추세 데이터를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
