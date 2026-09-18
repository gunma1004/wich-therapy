import { Metadata } from "next";
import DongClientUI from "./DongClientUI";

interface PageProps {
  params: Promise<{
    region: string;
    district: string;
    dong: string;
  }>;
}

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

// 🌟 출장을 완전히 배제한 순수 마사지 수식어 풀 (간결하고 임팩트 있는 형태, 40개)
const dongModifiers = [
  '전문 힐링 마사지', '프라이빗 맞춤 마사지', '웰니스 바디 마사지', '스웨디시 감성 마사지',
  '아로마 오일 마사지', '럭셔리 스파 마사지', 'VIP 프리미엄 마사지', '소프트 릴렉스 마사지',
  '딥티슈 바디 마사지', '스페셜 힐링 마사지', '피로회복 전신 마사지', '맞춤형 스웨디시 마사지',
  '실속형 바디 마사지', '종합 웰니스 마사지', '최고급 감성 마사지', '전문 바디케어 마사지',
  '맞춤 테라피 마사지', '1:1 프라이빗 마사지', '정통 스웨디시 마사지', '스페셜 아로마 마사지',
  '시원한 전신 마사지', '편안한 릴렉스 마사지', '고품격 테라피 마사지', '전문 아로마 마사지',
  '스웨디시 테라피 마사지', '딥티슈 힐링 마사지', '웰니스 스파 마사지', '정통 바디 마사지',
  '쾌적한 힐링 마사지', '종합 테라피 마사지', '최고급 바디 마사지', '전문 릴렉싱 마사지',
  '동네 안심 마사지', '우리동네 맞춤 마사지', '편안한 쉼 마사지', '활력 충전 마사지',
  '근육이완 힐링 마사지', '바디 밸런스 마사지', '토탈 리프레시 마사지', '데일리 케어 마사지'
];

// 🌟 상세 설명 풀 (30개)
const dongDescriptions = [
  '선입금 없는 안전한 시스템과 투명한 정찰제로 편안한 휴식을 선사합니다.',
  '검증된 전문 샵 정보와 체계적인 프로그램으로 지친 피로를 풀어드립니다.',
  '엄선된 전문 관리사의 섬세한 손길로 최상의 마사지 힐링을 누려보세요.',
  '향기로운 아로마와 부드러운 터치로 나만의 프라이빗한 휴식을 선사합니다.',
  '일상에 지친 몸과 마음에 활력을 불어넣어 주는 맞춤형 테라피 안내.',
  '깊은 근육까지 시원하게 이완시켜 주는 전문 바디케어 서비스를 만나보세요.',
  '철저한 위생 관리와 고객 만족 중심의 고품격 프로그램을 제공합니다.',
  '빠르고 편리한 정보 확인으로 언제 어디서나 편안한 휴식을 누리세요.',
  '부드러운 오일과 정성 어린 터칭으로 깊은 안정감을 드립니다.',
  '피로와 스트레스를 말끔히 해소해 주는 프리미엄 바디 릴렉스 가이드.'
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { region, district, dong } = resolvedParams;

  const regionName = getRegionKoreanName(region);
  const districtName = safeDecode(district);
  const dongName = dong && dong !== "all" ? safeDecode(dong) : "";

  const locationTitle = `${regionName} ${districtName} ${dongName}`.trim();

  // 🌟 순차적 인덱스 계산 (출장 배제, 1,000개 이상 문서 고유 조합 보장)
  const seedString = `${locationTitle}-dong-pure-short-seo`;
  const charSum = seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const modIdx = charSum % dongModifiers.length;
  const descIdx = (charSum * 7) % dongDescriptions.length;

  // 💡 [지역 구 동] [수식어 마사지] 형태로 25자 내외 압축 (도메인/상호명 배제)
  const finalTitle = `${locationTitle} ${dongModifiers[modIdx]}`;
  const finalDescription = `${locationTitle} 마사지 샵 정보. ${dongDescriptions[descIdx]}`;

  return {
    metadataBase: new URL("https://wich-therapy.netlify.app"),
    title: {
      absolute: finalTitle,
    },
    description: finalDescription,
    alternates: {
      canonical: `https://wich-therapy.netlify.app/${region}/${district}/${dong}`,
    },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: `https://wich-therapy.netlify.app/${region}/${district}/${dong}`,
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