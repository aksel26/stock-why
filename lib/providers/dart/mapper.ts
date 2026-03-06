import type { DisclosureData } from "../../domain/schema";

interface DartListItem {
  rcept_no: string;
  corp_cls: string;
  corp_code: string;
  corp_name: string;
  report_nm: string;
  rcept_dt: string;
  flr_nm: string;
  rm: string;
}

type DisclosureType = "earnings" | "buyback" | "rights" | "other";

function classifyReport(reportName: string): DisclosureType {
  const name = reportName.toLowerCase();
  if (name.includes("사업보고서") || name.includes("분기보고서") || name.includes("반기보고서")) {
    return "earnings";
  }
  if (name.includes("자기주식") || name.includes("취득") || name.includes("소각")) {
    return "buyback";
  }
  if (name.includes("유상증자") || name.includes("무상증자") || name.includes("신주")) {
    return "rights";
  }
  return "other";
}

export function mapDartDisclosures(items: DartListItem[]): DisclosureData {
  const disclosures = items.map((item) => ({
    type: classifyReport(item.report_nm),
    title: item.report_nm,
    url: `https://dart.fss.or.kr/dsaf001/main.do?rcept_no=${item.rcept_no}`,
  }));

  return { disclosures };
}
