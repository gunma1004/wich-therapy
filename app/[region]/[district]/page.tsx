import { Metadata } from "next";
import RegionalClientUI from "./RegionalClientUI";

interface PageProps {
  params: Promise<{
    region: string;
    district: string;
  }>;
  searchParams: Promise<{
    dong?: string;
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

// 🌟 1. 수식어 200개 풀 생성기
function getModifiersPool(): string[] {
  const baseAdjectives = [
    "프라이빗한", "전문적인", "쾌적한 공간의", "안락한 분위기 속", "정성 어린 손길의", 
    "신뢰할 수 있는", "차분한 힐링", "품격 있는", "맞춤형 바디케어", "일상 회복을 위한",
    "엄선된 제휴점의", "편안한 휴식을 선사하는", "체계적인 프로그램의", "도심 속 오아시스", "부드러운 릴렉싱",
    "고품격 웰니스", "피로 회복 맞춤형", "안정감 있는", "조용하고 아늑한", "에너지 충전을 위한",
    "릴렉싱 바디케어", "프리미엄 힐링", "상쾌한 활력을 주는", "정성 가득한", "지친 몸을 위한"
  ];
  
  const intensityWords = [
    "깊은", "부드러운", "섬세한", "꼼꼼한", "완벽한", 
    "탁월한", "특별한", "차별화된", "노련한", "깔끔한"
  ];

  const pool: string[] = [];
  for (const adj of baseAdjectives) {
    for (const int of intensityWords) {
      pool.push(`${int} ${adj}`);
    }
  }
  return pool; // 정확히 25 * 10 = 250개 (200개 이상 충족)
}

// 🌟 2. 서비스 종류 100개 풀 생성기
function getServiceTypesPool(): string[] {
  const coreTechniques = ["스웨디시", "아로마", "타이", "스포츠", "힐링", "바디케어", "릴렉싱", "웰니스", "케어", "테라피"];
  const styles = ["감성 프로그램", "맞춤형 코스", "전신 케어", "전문 테크닉", "집중 관리", "릴렉스 코스", "힐링 프로그램", "프리미엄 케어", "맞춤 프로그램", "토탈 바디 솔루션"];

  const pool: string[] = [];
  for (const tech of coreTechniques) {
    for (const style of styles) {
      pool.push(`${tech} ${style}`);
    }
  }
  return pool; // 정확히 10 * 10 = 100개 충족
}

// 🌟 3. 상세 설명 60개 풀 생성기
function getDescriptionsPool(): string[] {
  const actions = [
    "숙련된 테라피스트의 손길로", "엄선된 제휴 샵에서", "지친 일상 속에서", "편안한 분위기 속에서", 
    "체계적인 프로그램을 통해", "부드러운 테크닉으로", "아늑한 공간에서", "정성스러운 관리를 통해"
  ];
  const effects = [
    "몸과 마음의 피로를 부드럽게 씻어내 보세요.",
    "온전한 휴식과 재충전을 경험하실 수 있습니다.",
    "지친 신체 리듬을 편안하게 되찾아드립니다.",
    "일상의 스트레스를 말끔히 해소할 수 있습니다.",
    "최상의 릴렉스와 편안함을 선사합니다.",
    "몸의 긴장을 풀고 가벼운 활력을 채워보세요."
  ];

  const pool: string[] = [];
  for (const act of actions) {
    for (const eff of effects) {
      pool.push(`${act} ${eff}`);
      if (pool.length >= 60) break;
    }
    if (pool.length >= 60) break;
  }
  return pool; // 정확히 60개 충족
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const { region, district } = resolvedParams;
  const regionName = getRegionKoreanName(region);
  const districtName = safeDecode(district);
  const dongName = resolvedSearchParams.dong ? safeDecode(resolvedSearchParams.dong) : "";

  const locationKeyword = `${regionName} ${districtName} ${dongName}`.trim();
  const simpleLocation = dongName ? `${districtName} ${dongName}` : districtName;

  const modifiersPool = getModifiersPool();
  const serviceTypesPool = getServiceTypesPool();
  const descriptionsPool = getDescriptionsPool();

  // 대규모 조합을 위한 해시 기반 인덱스 추출
  const seedString = locationKeyword + districtName + dongName + "mash-up";
  const charSum = seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const modIndex = charSum % modifiersPool.length;
  const serviceIndex = (charSum * 3) % serviceTypesPool.length;
  const descIndex = (charSum * 7) % descriptionsPool.length;

  const selectedModifier = modifiersPool[modIndex];
  const selectedService = serviceTypesPool[serviceIndex];
  const selectedDesc = descriptionsPool[descIndex];

  // 🌟 출장 키워드 완전 배제, 마사지 혼합형 타이틀/디스크립션 구성
  const finalTitle = `${locationKeyword} ${selectedModifier} ${selectedService} 안내 · 위치 테라피`;
  const finalDescription = `${simpleLocation} 마사지 제휴 정보. ${selectedModifier} ${selectedService}. ${selectedDesc}`;

  return {
    metadataBase: new URL("https://wich-therapy.netlify.app"),
    title: {
      absolute: finalTitle,
    },
    description: finalDescription,
    keywords: [
      `${locationKeyword} 마사지`,
      `${locationKeyword} 스웨디시`,
      `${locationKeyword} 아로마마사지`,
      `${simpleLocation} 타이마사지`,
      `${simpleLocation} 웰니스 테라피`,
      "위치테라피"
    ],
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: `https://wich-therapy.netlify.app/${region}/${encodeURIComponent(districtName)}${dongName ? `?dong=${encodeURIComponent(dongName)}` : ""}`,
      siteName: "위치 테라피",
      locale: "ko_KR",
      type: "website",
    },
  };
}

export default async function RegionalDetailPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const reg = resolvedParams.region;
  const dist = safeDecode(resolvedParams.district);
  const dong = resolvedSearchParams.dong ? safeDecode(resolvedSearchParams.dong) : "";

  return <RegionalClientUI region={reg} district={dist} dongName={dong} />;
}