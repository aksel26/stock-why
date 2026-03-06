// KIS Open API Mock Data
// 한국투자증권 API 응답 구조를 기반으로 생성
// 참고: https://github.com/koreainvestment/open-trading-api

// ============================================================
// 1. 주식현재가 시세 [국내주식-008]
// API: /uapi/domestic-stock/v1/quotations/inquire-price
// TR_ID: FHKST01010100
// ============================================================
export const mockInquirePrice = {
  "005930": {
    output: {
      stck_prpr: "71500",           // 주식 현재가
      prdy_vrss: "1500",            // 전일 대비
      prdy_vrss_sign: "2",          // 전일 대비 부호 (1:상한, 2:상승, 3:보합, 4:하한, 5:하락)
      prdy_ctrt: "2.14",            // 전일 대비율(%)
      acml_vol: "18234567",         // 누적 거래량
      acml_tr_pbmn: "1302456000000", // 누적 거래 대금
      stck_oprc: "70500",           // 시가
      stck_hgpr: "72000",           // 최고가
      stck_lwpr: "70200",           // 최저가
      stck_mxpr: "91000",           // 상한가
      stck_llam: "49000",           // 하한가
      stck_sdpr: "70000",           // 기준가
      wghn_avrg_stck_prc: "71234",  // 가중 평균 주식 가격
      hts_frgn_ehrt: "52.31",       // HTS 외국인 소진율
      frgn_ntby_qty: "3456789",     // 외국인 순매수 수량
      pgtr_ntby_qty: "1234567",     // 프로그램매매 순매수 수량
      per: "12.35",                 // PER
      pbr: "1.24",                  // PBR
      eps: "5789",                  // EPS
      bps: "57654",                 // BPS
      cpfn: "7780",                 // 자본금(억)
      hts_avls: "4267890",          // HTS 시가총액(억)
      lstn_stcn: "5969782550",      // 상장 주수
      stac_month: "12",             // 결산 월
      vol_tnrt: "0.31",             // 거래량 회전율
      w52_hgpr: "83000",            // 52주 최고가
      w52_hgpr_date: "20250715",    // 52주 최고가 일자
      w52_lwpr: "53000",            // 52주 최저가
      w52_lwpr_date: "20251105",    // 52주 최저가 일자
      whol_loan_rmnd_rate: "0.42",  // 전체 융자 잔고 비율
      ssts_yn: "Y",                 // 공매도가능여부
      bstp_kor_isnm: "전기전자",    // 업종 한글 종목명
      rprs_mrkt_kor_name: "KOSPI",  // 대표 시장 한글 명
      iscd_stat_cls_code: "55",     // 종목 상태 구분 코드
      temp_stop_yn: "N",            // 임시 정지 여부
      crdt_able_yn: "Y",            // 신용 가능 여부
      marg_rate: "20",              // 증거금 비율
      stck_shrn_iscd: "005930",     // 주식 단축 종목코드
      stck_fcam: "100",             // 주식 액면가
      frgn_hldn_qty: "3120456789",  // 외국인 보유 수량
      d250_hgpr: "83000",           // 250일 최고가
      d250_lwpr: "52500",           // 250일 최저가
      prdy_vrss_vol_rate: "134.56", // 전일 대비 거래량 비율
    },
  },
  "000660": {
    output: {
      stck_prpr: "178000",
      prdy_vrss: "-3500",
      prdy_vrss_sign: "5",
      prdy_ctrt: "-1.93",
      acml_vol: "4567890",
      acml_tr_pbmn: "813456000000",
      stck_oprc: "181000",
      stck_hgpr: "182500",
      stck_lwpr: "177000",
      stck_mxpr: "235500",
      stck_llam: "127500",
      stck_sdpr: "181500",
      wghn_avrg_stck_prc: "179230",
      hts_frgn_ehrt: "48.76",
      frgn_ntby_qty: "-1234567",
      pgtr_ntby_qty: "-567890",
      per: "8.92",
      pbr: "1.67",
      eps: "19955",
      bps: "106587",
      cpfn: "3657",
      hts_avls: "1295000",
      lstn_stcn: "728002365",
      stac_month: "12",
      vol_tnrt: "0.63",
      w52_hgpr: "235000",
      w52_hgpr_date: "20250820",
      w52_lwpr: "138000",
      w52_lwpr_date: "20251220",
      whol_loan_rmnd_rate: "0.31",
      ssts_yn: "Y",
      bstp_kor_isnm: "전기전자",
      rprs_mrkt_kor_name: "KOSPI",
      iscd_stat_cls_code: "55",
      temp_stop_yn: "N",
      crdt_able_yn: "Y",
      marg_rate: "20",
      stck_shrn_iscd: "000660",
      stck_fcam: "5000",
      frgn_hldn_qty: "355123456",
      d250_hgpr: "235000",
      d250_lwpr: "135000",
      prdy_vrss_vol_rate: "89.23",
    },
  },
};

// ============================================================
// 2. 주식현재가 투자자 (수급) [국내주식-012]
// API: /uapi/domestic-stock/v1/quotations/inquire-investor
// TR_ID: FHKST01010900
// ============================================================
export const mockInquireInvestor = {
  "005930": {
    output: [
      {
        stck_bsop_date: "20260305",  // 영업 일자
        stck_clpr: "71500",          // 종가
        prdy_vrss: "1500",           // 전일 대비
        prdy_vrss_sign: "2",         // 전일 대비 부호
        prsn_ntby_qty: "-5678901",   // 개인 순매수 수량
        frgn_ntby_qty: "3456789",    // 외국인 순매수 수량
        orgn_ntby_qty: "2345678",    // 기관계 순매수 수량
        prsn_ntby_tr_pbmn: "-406012", // 개인 순매수 거래 대금(백만)
        frgn_ntby_tr_pbmn: "247135",  // 외국인 순매수 거래 대금(백만)
        orgn_ntby_tr_pbmn: "167789",  // 기관계 순매수 거래 대금(백만)
        prsn_shnu_vol: "8901234",    // 개인 매수 거래량
        frgn_shnu_vol: "5678901",    // 외국인 매수 거래량
        orgn_shnu_vol: "3901234",    // 기관계 매수 거래량
        prsn_shnu_tr_pbmn: "636438", // 개인 매수 거래 대금
        frgn_shnu_tr_pbmn: "405891", // 외국인 매수 거래 대금
        orgn_shnu_tr_pbmn: "278888", // 기관계 매수 거래 대금
        prsn_seln_vol: "14580135",   // 개인 매도 거래량
        frgn_seln_vol: "2222112",    // 외국인 매도 거래량
        orgn_seln_vol: "1555556",    // 기관계 매도 거래량
        prsn_seln_tr_pbmn: "1042450", // 개인 매도 거래 대금
        frgn_seln_tr_pbmn: "158756",  // 외국인 매도 거래 대금
        orgn_seln_tr_pbmn: "111099",  // 기관계 매도 거래 대금
      },
      {
        stck_bsop_date: "20260304",
        stck_clpr: "70000",
        prdy_vrss: "-500",
        prdy_vrss_sign: "5",
        prsn_ntby_qty: "2345678",
        frgn_ntby_qty: "-1890123",
        orgn_ntby_qty: "-567890",
        prsn_ntby_tr_pbmn: "164197",
        frgn_ntby_tr_pbmn: "-132309",
        orgn_ntby_tr_pbmn: "-39752",
        prsn_shnu_vol: "9012345",
        frgn_shnu_vol: "3456789",
        orgn_shnu_vol: "2345678",
        prsn_shnu_tr_pbmn: "630864",
        frgn_shnu_tr_pbmn: "241975",
        orgn_shnu_tr_pbmn: "164197",
        prsn_seln_vol: "6666667",
        frgn_seln_vol: "5346912",
        orgn_seln_vol: "2913568",
        prsn_seln_tr_pbmn: "466667",
        frgn_seln_tr_pbmn: "374284",
        orgn_seln_tr_pbmn: "203950",
      },
      {
        stck_bsop_date: "20260303",
        stck_clpr: "70500",
        prdy_vrss: "800",
        prdy_vrss_sign: "2",
        prsn_ntby_qty: "-1234567",
        frgn_ntby_qty: "890123",
        orgn_ntby_qty: "456789",
        prsn_ntby_tr_pbmn: "-87037",
        frgn_ntby_tr_pbmn: "62754",
        orgn_ntby_tr_pbmn: "32204",
        prsn_shnu_vol: "7890123",
        frgn_shnu_vol: "4567890",
        orgn_shnu_vol: "3456789",
        prsn_shnu_tr_pbmn: "556254",
        frgn_shnu_tr_pbmn: "322036",
        orgn_shnu_tr_pbmn: "243704",
        prsn_seln_vol: "9124690",
        frgn_seln_vol: "3677767",
        orgn_seln_vol: "3000000",
        prsn_seln_tr_pbmn: "643291",
        frgn_seln_tr_pbmn: "259282",
        orgn_seln_tr_pbmn: "211500",
      },
    ],
  },
};

// ============================================================
// 3. 국내주식기간별시세 (일봉 차트) [국내주식-016]
// API: /uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice
// TR_ID: FHKST03010100
// ============================================================
export const mockDailyItemChartPrice = {
  "005930": {
    output1: {
      prdy_vrss: "1500",
      prdy_vrss_sign: "2",
      prdy_ctrt: "2.14",
      stck_prdy_clpr: "70000",    // 주식 전일 종가
      acml_vol: "18234567",
      acml_tr_pbmn: "1302456000000",
      hts_kor_isnm: "삼성전자",    // HTS 한글 종목명
      stck_prpr: "71500",
      stck_shrn_iscd: "005930",
      prdy_vol: "13567890",       // 전일 거래량
    },
    output2: [
      { stck_bsop_date: "20260305", stck_clpr: "71500", stck_oprc: "70500", stck_hgpr: "72000", stck_lwpr: "70200", acml_vol: "18234567", acml_tr_pbmn: "1302456000000", prdy_vrss: "1500", prdy_vrss_sign: "2", prdy_ctrt: "2.14", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260304", stck_clpr: "70000", stck_oprc: "70500", stck_hgpr: "71000", stck_lwpr: "69500", acml_vol: "13567890", acml_tr_pbmn: "952345000000", prdy_vrss: "-500", prdy_vrss_sign: "5", prdy_ctrt: "-0.71", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260303", stck_clpr: "70500", stck_oprc: "69500", stck_hgpr: "70800", stck_lwpr: "69200", acml_vol: "15678901", acml_tr_pbmn: "1105678000000", prdy_vrss: "800", prdy_vrss_sign: "2", prdy_ctrt: "1.15", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260302", stck_clpr: "69700", stck_oprc: "68900", stck_hgpr: "69900", stck_lwpr: "68500", acml_vol: "12456789", acml_tr_pbmn: "868901000000", prdy_vrss: "-300", prdy_vrss_sign: "5", prdy_ctrt: "-0.43", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260227", stck_clpr: "70000", stck_oprc: "70200", stck_hgpr: "70500", stck_lwpr: "69800", acml_vol: "11234567", acml_tr_pbmn: "786345000000", prdy_vrss: "200", prdy_vrss_sign: "2", prdy_ctrt: "0.29", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260226", stck_clpr: "69800", stck_oprc: "69500", stck_hgpr: "70100", stck_lwpr: "69200", acml_vol: "10567890", acml_tr_pbmn: "738234000000", prdy_vrss: "-200", prdy_vrss_sign: "5", prdy_ctrt: "-0.29", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260225", stck_clpr: "70000", stck_oprc: "70300", stck_hgpr: "70500", stck_lwpr: "69700", acml_vol: "9876543", acml_tr_pbmn: "691234000000", prdy_vrss: "500", prdy_vrss_sign: "2", prdy_ctrt: "0.72", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260224", stck_clpr: "69500", stck_oprc: "69000", stck_hgpr: "69800", stck_lwpr: "68800", acml_vol: "8765432", acml_tr_pbmn: "609234000000", prdy_vrss: "-500", prdy_vrss_sign: "5", prdy_ctrt: "-0.71", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260223", stck_clpr: "70000", stck_oprc: "69800", stck_hgpr: "70200", stck_lwpr: "69500", acml_vol: "7654321", acml_tr_pbmn: "536234000000", prdy_vrss: "300", prdy_vrss_sign: "2", prdy_ctrt: "0.43", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260220", stck_clpr: "69700", stck_oprc: "70000", stck_hgpr: "70200", stck_lwpr: "69400", acml_vol: "11234567", acml_tr_pbmn: "783456000000", prdy_vrss: "-100", prdy_vrss_sign: "5", prdy_ctrt: "-0.14", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260219", stck_clpr: "69800", stck_oprc: "69500", stck_hgpr: "70000", stck_lwpr: "69200", acml_vol: "9012345", acml_tr_pbmn: "629345000000", prdy_vrss: "300", prdy_vrss_sign: "2", prdy_ctrt: "0.43", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260218", stck_clpr: "69500", stck_oprc: "69200", stck_hgpr: "69800", stck_lwpr: "69000", acml_vol: "8234567", acml_tr_pbmn: "572456000000", prdy_vrss: "-200", prdy_vrss_sign: "5", prdy_ctrt: "-0.29", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260217", stck_clpr: "69700", stck_oprc: "70000", stck_hgpr: "70100", stck_lwpr: "69500", acml_vol: "7890123", acml_tr_pbmn: "549890000000", prdy_vrss: "200", prdy_vrss_sign: "2", prdy_ctrt: "0.29", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260216", stck_clpr: "69500", stck_oprc: "69800", stck_hgpr: "70000", stck_lwpr: "69300", acml_vol: "9345678", acml_tr_pbmn: "649456000000", prdy_vrss: "-300", prdy_vrss_sign: "5", prdy_ctrt: "-0.43", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260213", stck_clpr: "69800", stck_oprc: "69500", stck_hgpr: "70200", stck_lwpr: "69200", acml_vol: "10123456", acml_tr_pbmn: "706789000000", prdy_vrss: "500", prdy_vrss_sign: "2", prdy_ctrt: "0.72", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260212", stck_clpr: "69300", stck_oprc: "69000", stck_hgpr: "69600", stck_lwpr: "68800", acml_vol: "8567890", acml_tr_pbmn: "593456000000", prdy_vrss: "-400", prdy_vrss_sign: "5", prdy_ctrt: "-0.57", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260211", stck_clpr: "69700", stck_oprc: "70000", stck_hgpr: "70200", stck_lwpr: "69500", acml_vol: "7234567", acml_tr_pbmn: "504123000000", prdy_vrss: "200", prdy_vrss_sign: "2", prdy_ctrt: "0.29", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260210", stck_clpr: "69500", stck_oprc: "69200", stck_hgpr: "69800", stck_lwpr: "69000", acml_vol: "6789012", acml_tr_pbmn: "471890000000", prdy_vrss: "-100", prdy_vrss_sign: "5", prdy_ctrt: "-0.14", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260209", stck_clpr: "69600", stck_oprc: "69800", stck_hgpr: "70000", stck_lwpr: "69400", acml_vol: "8901234", acml_tr_pbmn: "619678000000", prdy_vrss: "100", prdy_vrss_sign: "2", prdy_ctrt: "0.14", flng_cls_code: "00", mod_yn: "N" },
      { stck_bsop_date: "20260206", stck_clpr: "69500", stck_oprc: "69000", stck_hgpr: "69700", stck_lwpr: "68800", acml_vol: "9567890", acml_tr_pbmn: "665234000000", prdy_vrss: "-300", prdy_vrss_sign: "5", prdy_ctrt: "-0.43", flng_cls_code: "00", mod_yn: "N" },
    ],
  },
};

// ============================================================
// 4. 공매도 일별추이 [국내주식-134]
// API: /uapi/domestic-stock/v1/quotations/daily-short-sale
// TR_ID: FHPST04830000
// ============================================================
export const mockDailyShortSale = {
  "005930": {
    output1: {
      stck_prpr: "71500",          // 주식 현재가
      prdy_vrss: "1500",           // 전일 대비
      prdy_vrss_sign: "2",         // 전일 대비 부호
      prdy_ctrt: "2.14",           // 전일 대비율
      acml_vol: "18234567",        // 누적 거래량
      prdy_vol: "13567890",        // 전일 거래량
    },
    output2: [
      {
        stck_bsop_date: "20260305",       // 영업 일자
        stck_clpr: "71500",               // 종가
        prdy_vrss: "1500",                // 전일 대비
        prdy_vrss_sign: "2",              // 전일 대비 부호
        prdy_ctrt: "2.14",                // 전일 대비율
        acml_vol: "18234567",             // 누적 거래량
        ssts_cntg_qty: "345678",          // 공매도 체결 수량
        ssts_vol_rlim: "1.90",            // 공매도 거래량 비중(%)
        stck_oprc: "70500",               // 시가
        stck_hgpr: "72000",               // 최고가
        stck_lwpr: "70200",               // 최저가
        acml_tr_pbmn: "1302456000000",    // 누적 거래 대금
        ssts_tr_pbmn: "24716000000",      // 공매도 거래 대금
        ssts_tr_pbmn_rlim: "1.90",        // 공매도 거래대금 비중(%)
      },
      {
        stck_bsop_date: "20260304",
        stck_clpr: "70000",
        prdy_vrss: "-500",
        prdy_vrss_sign: "5",
        prdy_ctrt: "-0.71",
        acml_vol: "13567890",
        ssts_cntg_qty: "567890",
        ssts_vol_rlim: "4.19",
        stck_oprc: "70500",
        stck_hgpr: "71000",
        stck_lwpr: "69500",
        acml_tr_pbmn: "952345000000",
        ssts_tr_pbmn: "39753000000",
        ssts_tr_pbmn_rlim: "4.17",
      },
      {
        stck_bsop_date: "20260303",
        stck_clpr: "70500",
        prdy_vrss: "800",
        prdy_vrss_sign: "2",
        prdy_ctrt: "1.15",
        acml_vol: "15678901",
        ssts_cntg_qty: "234567",
        ssts_vol_rlim: "1.50",
        stck_oprc: "69500",
        stck_hgpr: "70800",
        stck_lwpr: "69200",
        acml_tr_pbmn: "1105678000000",
        ssts_tr_pbmn: "16537000000",
        ssts_tr_pbmn_rlim: "1.50",
      },
      {
        stck_bsop_date: "20260302",
        stck_clpr: "69700",
        prdy_vrss: "-300",
        prdy_vrss_sign: "5",
        prdy_ctrt: "-0.43",
        acml_vol: "12456789",
        ssts_cntg_qty: "198765",
        ssts_vol_rlim: "1.60",
        stck_oprc: "68900",
        stck_hgpr: "69900",
        stck_lwpr: "68500",
        acml_tr_pbmn: "868901000000",
        ssts_tr_pbmn: "13854000000",
        ssts_tr_pbmn_rlim: "1.59",
      },
      {
        stck_bsop_date: "20260227",
        stck_clpr: "70000",
        prdy_vrss: "200",
        prdy_vrss_sign: "2",
        prdy_ctrt: "0.29",
        acml_vol: "11234567",
        ssts_cntg_qty: "289012",
        ssts_vol_rlim: "2.57",
        stck_oprc: "70200",
        stck_hgpr: "70500",
        stck_lwpr: "69800",
        acml_tr_pbmn: "786345000000",
        ssts_tr_pbmn: "20231000000",
        ssts_tr_pbmn_rlim: "2.57",
      },
    ],
  },
};

// ============================================================
// 5. 신용잔고 일별추이 [국내주식-110]
// API: /uapi/domestic-stock/v1/quotations/daily-credit-balance
// TR_ID: FHPST04760000
// ============================================================
export const mockDailyCreditBalance = {
  "005930": {
    output: [
      {
        stck_bsop_date: "20260305",    // 영업 일자
        stck_clpr: "71500",            // 종가
        prdy_vrss: "1500",             // 전일 대비
        prdy_vrss_sign: "2",           // 전일 대비 부호
        acml_vol: "18234567",          // 누적 거래량
        ldng_new_qty: "123456",        // 융자 신규 수량
        ldng_rdmp_qty: "98765",        // 융자 상환 수량
        ldng_rmnd_qty: "4567890",      // 융자 잔고 수량
        ldng_rmnd_rate: "0.42",        // 융자 잔고 비율(%)
        brrw_new_qty: "12345",         // 대주 신규 수량
        brrw_rdmp_qty: "11234",        // 대주 상환 수량
        brrw_rmnd_qty: "345678",       // 대주 잔고 수량
        brrw_rmnd_rate: "0.03",        // 대주 잔고 비율(%)
      },
      {
        stck_bsop_date: "20260304",
        stck_clpr: "70000",
        prdy_vrss: "-500",
        prdy_vrss_sign: "5",
        acml_vol: "13567890",
        ldng_new_qty: "156789",
        ldng_rdmp_qty: "134567",
        ldng_rmnd_qty: "4543199",
        ldng_rmnd_rate: "0.41",
        brrw_new_qty: "15678",
        brrw_rdmp_qty: "14567",
        brrw_rmnd_qty: "344567",
        brrw_rmnd_rate: "0.03",
      },
      {
        stck_bsop_date: "20260303",
        stck_clpr: "70500",
        prdy_vrss: "800",
        prdy_vrss_sign: "2",
        acml_vol: "15678901",
        ldng_new_qty: "178901",
        ldng_rdmp_qty: "167890",
        ldng_rmnd_qty: "4520977",
        ldng_rmnd_rate: "0.41",
        brrw_new_qty: "13456",
        brrw_rdmp_qty: "12345",
        brrw_rmnd_qty: "343456",
        brrw_rmnd_rate: "0.03",
      },
    ],
  },
};

// ============================================================
// 6. 종목별 투자자매매동향(일별)
// API: /uapi/domestic-stock/v1/quotations/investor-trade-by-stock-daily
// TR_ID: FHPTJ04160001
// ============================================================
export const mockInvestorTradeByStockDaily = {
  "005930": {
    output1: {
      stck_shrn_iscd: "005930",
      hts_kor_isnm: "삼성전자",
      stck_prpr: "71500",
      prdy_vrss: "1500",
      prdy_vrss_sign: "2",
      prdy_ctrt: "2.14",
    },
    output2: [
      {
        stck_bsop_date: "20260305",  // 영업 일자
        stck_clpr: "71500",          // 종가
        prdy_vrss: "1500",           // 전일 대비
        prdy_vrss_sign: "2",         // 전일 대비 부호
        prsn_ntby_qty: "-5678901",   // 개인 순매수
        frgn_ntby_qty: "3456789",    // 외국인 순매수
        orgn_ntby_qty: "2345678",    // 기관 순매수
        bank_ntby_qty: "123456",     // 은행 순매수
        scrt_ntby_qty: "234567",     // 증권 순매수
        insu_ntby_qty: "345678",     // 보험 순매수
        trus_ntby_qty: "456789",     // 신탁 순매수
        etc_orgt_ntby_qty: "67890",  // 기타법인 순매수
        pefd_ntby_qty: "890123",     // 연기금 순매수
        etc_ntby_qty: "12345",       // 기타 순매수
      },
      {
        stck_bsop_date: "20260304",
        stck_clpr: "70000",
        prdy_vrss: "-500",
        prdy_vrss_sign: "5",
        prsn_ntby_qty: "2345678",
        frgn_ntby_qty: "-1890123",
        orgn_ntby_qty: "-567890",
        bank_ntby_qty: "-45678",
        scrt_ntby_qty: "-89012",
        insu_ntby_qty: "-123456",
        trus_ntby_qty: "-167890",
        etc_orgt_ntby_qty: "-23456",
        pefd_ntby_qty: "-234567",
        etc_ntby_qty: "-8901",
      },
      {
        stck_bsop_date: "20260303",
        stck_clpr: "70500",
        prdy_vrss: "800",
        prdy_vrss_sign: "2",
        prsn_ntby_qty: "-1234567",
        frgn_ntby_qty: "890123",
        orgn_ntby_qty: "456789",
        bank_ntby_qty: "34567",
        scrt_ntby_qty: "56789",
        insu_ntby_qty: "78901",
        trus_ntby_qty: "123456",
        etc_orgt_ntby_qty: "12345",
        pefd_ntby_qty: "234567",
        etc_ntby_qty: "5678",
      },
    ],
  },
};

// ============================================================
// 7. 외국인/기관 매매종목 가집계 [국내주식-037]
// API: /uapi/domestic-stock/v1/quotations/foreign-institution-total
// TR_ID: FHPTJ04400000
// ============================================================
export const mockForeignInstitutionTotal = {
  output: [
    {
      hts_kor_isnm: "삼성전자",      // 종목명
      mksc_shrn_iscd: "005930",      // 종목코드
      stck_prpr: "71500",            // 현재가
      prdy_vrss: "1500",             // 전일대비
      prdy_vrss_sign: "2",           // 전일대비부호
      prdy_ctrt: "2.14",             // 전일대비율
      frgn_ntby_qty: "3456789",      // 외국인 순매수 수량
      orgn_ntby_qty: "2345678",      // 기관계 순매수 수량
      frgn_ntby_tr_pbmn: "247135",   // 외국인 순매수 거래대금
      orgn_ntby_tr_pbmn: "167789",   // 기관계 순매수 거래대금
    },
    {
      hts_kor_isnm: "SK하이닉스",
      mksc_shrn_iscd: "000660",
      stck_prpr: "178000",
      prdy_vrss: "-3500",
      prdy_vrss_sign: "5",
      prdy_ctrt: "-1.93",
      frgn_ntby_qty: "-1234567",
      orgn_ntby_qty: "-890123",
      frgn_ntby_tr_pbmn: "-219753",
      orgn_ntby_tr_pbmn: "-158442",
    },
    {
      hts_kor_isnm: "LG에너지솔루션",
      mksc_shrn_iscd: "373220",
      stck_prpr: "385000",
      prdy_vrss: "5000",
      prdy_vrss_sign: "2",
      prdy_ctrt: "1.32",
      frgn_ntby_qty: "567890",
      orgn_ntby_qty: "345678",
      frgn_ntby_tr_pbmn: "218638",
      orgn_ntby_tr_pbmn: "133086",
    },
  ],
};

// ============================================================
// 8. 종합 시황/공시(제목) [국내주식-141]
// API: /uapi/domestic-stock/v1/quotations/news-title
// TR_ID: FHKST01011800
// ============================================================
export const mockNewsTitle = {
  "005930": {
    output: [
      {
        news_ofer_entp_code: "2",       // 뉴스 제공 업체 코드
        news_titl: "삼성전자, 1분기 반도체 호조…영업이익 시장 기대 상회 전망",  // 뉴스 제목
        news_dttm: "20260305093000",    // 뉴스 일시
        news_ctgr: "01",               // 뉴스 카테고리
        cntt_srno: "00001234",          // 내용 일련번호
      },
      {
        news_ofer_entp_code: "2",
        news_titl: "삼성전자, 파운드리 수주 확대…AI 반도체 생산 본격화",
        news_dttm: "20260305083000",
        news_ctgr: "01",
        cntt_srno: "00001233",
      },
      {
        news_ofer_entp_code: "2",
        news_titl: "외국인, 삼성전자 3거래일 연속 순매수…수급 개선 신호",
        news_dttm: "20260305080000",
        news_ctgr: "02",
        cntt_srno: "00001232",
      },
      {
        news_ofer_entp_code: "2",
        news_titl: "삼성전자, HBM4 양산 일정 앞당겨…NVIDIA 납품 확대",
        news_dttm: "20260304160000",
        news_ctgr: "01",
        cntt_srno: "00001231",
      },
      {
        news_ofer_entp_code: "2",
        news_titl: "환율 하락에 반도체 수출주 강세…삼성전자·SK하이닉스 동반 상승",
        news_dttm: "20260304140000",
        news_ctgr: "03",
        cntt_srno: "00001230",
      },
    ],
  },
};

// ============================================================
// 9. 매크로 데이터 (지수/환율 - 별도 구성)
// ============================================================
export const mockMacroData = {
  kospi: {
    index_value: "2785.43",
    prdy_vrss: "32.15",
    prdy_vrss_sign: "2",
    prdy_ctrt: "1.17",
  },
  kosdaq: {
    index_value: "892.34",
    prdy_vrss: "8.56",
    prdy_vrss_sign: "2",
    prdy_ctrt: "0.97",
  },
  usd_krw: {
    rate: "1345.50",
    prdy_vrss: "-7.30",
    prdy_ctrt: "-0.54",
  },
  nasdaq: {
    index_value: "18234.56",
    prdy_vrss: "156.78",
    prdy_vrss_sign: "2",
    prdy_ctrt: "0.87",
  },
};

// ============================================================
// 10. 종목 마스터 (종목 검색용)
// ============================================================
export const mockStockMaster = [
  { code: "005930", name: "삼성전자", market: "KOSPI", sector: "전기전자" },
  { code: "000660", name: "SK하이닉스", market: "KOSPI", sector: "전기전자" },
  { code: "373220", name: "LG에너지솔루션", market: "KOSPI", sector: "전기전자" },
  { code: "005380", name: "현대차", market: "KOSPI", sector: "운수장비" },
  { code: "035420", name: "NAVER", market: "KOSPI", sector: "서비스업" },
  { code: "035720", name: "카카오", market: "KOSPI", sector: "서비스업" },
  { code: "051910", name: "LG화학", market: "KOSPI", sector: "화학" },
  { code: "006400", name: "삼성SDI", market: "KOSPI", sector: "전기전자" },
  { code: "068270", name: "셀트리온", market: "KOSPI", sector: "의약품" },
  { code: "105560", name: "KB금융", market: "KOSPI", sector: "기타금융" },
];

// ============================================================
// 11. StockDailyContext 변환 완료 Mock (PRD 스키마 기준)
// ============================================================
export const mockStockDailyContext = {
  stockCode: "005930",
  stockName: "삼성전자",
  date: "2026-03-05",

  price: {
    close: 71500,
    changePercent: 2.14,
  },

  supply: {
    foreignNetBuy: 3456789,
    institutionNetBuy: 2345678,
    individualNetBuy: -5678901,
    foreignTrendScore: 0.85,  // 최근 5일 중 순매수 일수 비율
  },

  short: {
    shortSellingVolume: 345678,
    shortChangeRate: -54.81,  // 전일(567890) 대비 변화율
  },

  credit: {
    creditBalanceRate: 0.42,
    creditRiskLevel: "normal" as const,
  },

  macro: {
    kospiChange: 1.17,
    usdKrwChange: -0.54,
    nasdaqChange: 0.87,
  },

  events: {
    news: [
      { title: "삼성전자, 1분기 반도체 호조…영업이익 시장 기대 상회 전망" },
      { title: "삼성전자, 파운드리 수주 확대…AI 반도체 생산 본격화" },
      { title: "외국인, 삼성전자 3거래일 연속 순매수…수급 개선 신호" },
    ],
    disclosures: [
      { type: "earnings" as const, title: "2025년 4분기 실적 발표 (잠정)" },
      { type: "buyback" as const, title: "자기주식 취득 결정" },
    ],
  },

  signals: [
    { type: "foreign_strong_buy" as const, strength: "high" as const },
    { type: "macro_support" as const, strength: "medium" as const },
    { type: "volatility_flag" as const, strength: "medium" as const },
  ],
};
