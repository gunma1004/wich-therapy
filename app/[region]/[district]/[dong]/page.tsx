import { Metadata } from "next";
import DongClientUI from "./DongClientUI";

interface PageProps {
  params: Promise<{
    region: string;
    district: string;
    dong: string;
  }>;
}

const SITE_URL = "https://wich-therapy.netlify.app";

function getRegionKoreanName(region: string): string {
  switch (region.toLowerCase()) {
    case "seoul": return "서울";
    case "incheon": return "인천";
    case "gyeonggi": return "경기";
    default: return "수도권";
  }
}

function safeDecode(str: string): string {
  if (!str) return "";
  let decoded = str;
  try {
    decoded = decodeURIComponent(decodeURIComponent(str));
  } catch {
    try {
      decoded = decodeURIComponent(str);
    } catch {
      decoded = str;
    }
  }
  return decoded.trim();
}

// 🌟 1단: '출장'을 배제한 동 단위 메인 복합 코스 패턴 풀 (18개)
const dongServicePatterns = [
  '릴렉스 마사지·홈타이', '소프트스웨디시 마사지·홈타이', '아로마케어 마사지·홈타이',
  '감성힐링 마사지·홈타이', '프리미엄 마사지·홈타이', '바디케어 마사지·홈타이',
  '딥티슈이완 마사지·홈타이', '전신힐링 마사지·홈타이', '맞춤형케어 마사지·홈타이',
  '안심방문 마사지·홈타이', 'VIP스웨디시 마사지·홈타이', '명품테라피 마사지·홈타이',
  '소프트감성 마사지·홈타이', '림프순환 마사지·홈타이', '포근한힐링 마사지·홈타이',
  '체형맞춤 마사지·홈타이', '타이스트레칭 마사지·홈타이', '스페셜바디 마사지·홈타이'
];

// 🌟 2단: 구 단위 연계 안마 예약/안내 패턴 풀 (8개)
const districtBookingActions = [
  '안마 예약', '안마 방문예약', '테라피 예약', '힐링 안마예약',
  '바디케어 예약', '홈케어 예약', '방문 안마안내', '스웨디시 예약'
];

// 🌟 3단: 동 안내 페이지 전용 소구 키워드 풀 (브랜드명 대신 배치하여 스팸 필터링 방지)
const tertiaryActionPatterns = [
  '1:1 맞춤 방문케어', '프라이빗 힐링 안내', '전신 피로회복 총정리',
  '정직한 정찰제 안심 가이드', '당일 예약 맞춤 코스', '최고급 힐러진 프로그램',
  '안심 후불제 웰니스 안내', '전신 릴렉스 힐링 추천'
];

// 🌟 디스크립션 가격 및 소구점 조합 풀
const priceHooks = [
  '건식 6만원부터 심야할증 없이 방문합니다.',
  '건식 7만원부터 심야할증 없이 방문합니다.',
  '스웨디시 8만원부터 추가비용 없이 방문합니다.',
  '아로마 7만원부터 합리적인 정찰제로 방문합니다.',
  '타이 6만원부터 현장 결제 후불제로 방문합니다.'
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { region, district, dong } = resolvedParams;

  const regionName = getRegionKoreanName(region);
  const districtName = safeDecode(district);
  const dongName = dong && dong !== "all" ? safeDecode(dong) : "";

  const locationTitle = `${regionName} ${districtName} ${dongName}`.trim();
  const parentDistrict = districtName ? `${districtName}구` : regionName;
  const targetDong = dongName || districtName;

  // 🌟 순차적 인덱스 계산 (출장 배제, 1,000개 이상 문서 고유 조합 보장)
  const seedString = `${locationTitle}-wich-dong-careplace-style-seo`;
  const charSum = seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const part1Idx = charSum % dongServicePatterns.length;
  const part2Idx = (charSum * 3) % districtBookingActions.length;
  const part3Idx = (charSum * 5) % tertiaryActionPatterns.length;
  const priceIdx = (charSum * 7) % priceHooks.length;

  // 💡 [양재동 릴렉스 마사지·홈타이 | 서초구 안마 예약 | 1:1 맞춤 방문케어] 구조 (약 45~50자)
  const finalTitle = `${targetDong} ${dongServicePatterns[part1Idx]} | ${parentDistrict} ${districtBookingActions[part2Idx]} | ${tertiaryActionPatterns[part3Idx]}`;
  
  // 💡 [서울 서초구 양재동 마사지·홈타이·안마. 검증된 전문 관리사 100% 후불제. 건식 7만원부터 심야할증 없이 방문합니다.] 구조
  const finalDescription = `${locationTitle} 마사지·홈타이·안마. 검증된 전문 관리사 100% 후불제. ${priceHooks[priceIdx]}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      absolute: finalTitle,
    },
    description: finalDescription,
    alternates: {
      canonical: `${SITE_URL}/${region}/${district}/${dong}`,
    },
    keywords: [
      `${locationTitle} 마사지`,
      `${targetDong} 홈타이`,
      `${targetDong} 스웨디시`,
      `${parentDistrict} 안마`,
      `${locationTitle} 아로마마사지`,
      `${locationTitle} 타이마사지`,
      "방문케어"
    ],
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: `${SITE_URL}/${region}/${district}/${dong}`,
      locale: "ko_KR",
      type: "website",
    },
  };
}

export default async function DongPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { region, district, dong } = resolvedParams;

  const regionName = getRegionKoreanName(region);
  const districtName = safeDecode(district);
  const dongName = dong && dong !== "all" ? safeDecode(dong) : "";
  const locationTitle = `${regionName} ${districtName} ${dongName}`.trim();

  return (
    <DongClientUI 
      region={region} 
      district={district} 
      dong={dong} 
      locationTitle={locationTitle} 
    />
  );
}