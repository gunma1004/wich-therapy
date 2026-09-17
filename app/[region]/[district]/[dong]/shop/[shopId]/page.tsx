import { Metadata } from "next";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    region: string;
    district: string;
    shopId: string;
  }>;
}

// 🌐 영문 지역 코드를 한글 지역명으로 변환
function getRegionFullName(region: string): string {
  switch (region.toLowerCase()) {
    case "seoul": return "서울";
    case "gyeonggi": return "경기";
    case "incheon": return "인천";
    default: return region;
  }
}

// 🛠️ 이중 URL 인코딩까지 안전하게 풀어주는 디코딩 헬퍼 함수
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

function parseLocationText(region: string, district: string): string {
  const regionName = getRegionFullName(region);
  const decodedDistrict = safeDecode(district);
  return `${regionName} ${decodedDistrict}`.replace(/\s+/g, " ").trim();
}

// 🌟 1. 수식어 200개 이상 풀 생성기 ('출장' 키워드 포함)
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
      pool.push(`신속한 출장 서비스를 제공하는 ${int} ${adj}`);
      pool.push(`편안한 출장 홈케어를 지향하는 ${int} ${adj}`);
      pool.push(`고객 맞춤형 출장 케어를 선사하는 ${int} ${adj}`);
    }
  }
  return pool; // 750개 이상 풀
}

// 🌟 2. 서비스 종류 100개 풀 생성기 ('마사지' 키워드 포함, '출장'과 붙지 않음)
function getServiceTypesPool(): string[] {
  const coreTechniques = ["스웨디시", "아로마", "타이", "스포츠", "힐링", "바디케어", "릴렉싱", "웰니스", "전문", "프리미엄"];
  const styles = ["감성 마사지 코스", "맞춤형 마사지 프로그램", "전신 관리 마사지", "전문 테크닉 마사지", "집중 이완 마사지", "릴렉스 마사지 과정", "힐링 바디 마사지", "프리미엄 마사지 솔루션", "맞춤형 바디 마사지", "토탈 마사지 프로그램"];

  const pool: string[] = [];
  for (const tech of coreTechniques) {
    for (const style of styles) {
      pool.push(`${tech} 기반의 ${style}`);
      pool.push(`${tech} 전문 ${style}`);
    }
  }
  return pool; // 200개 이상 풀
}

// 🌟 3. 상세 설명 60개 이상 풀 생성기
function getDescriptionsPool(): string[] {
  const actions = [
    "숙련된 테라피스트가 고객 계신 곳으로 직접 출장하여 진행하는 전문 마사지는", 
    "엄선된 제휴 샵에서 출장 형태로 제공하는 맞춤형 마사지 프로그램은", 
    "지친 일상 속에서 편안하게 불러보는 출장 힐링 마사지는", 
    "안락한 공간에서 즐기는 전문적인 출장 테라피 마사지는", 
    "체계적인 손길을 통해 출장 서비스로 제공되는 프라이빗 마사지는", 
    "부드러운 테크닉이 돋보이는 릴렉스 중심의 출장 바디 마사지는"
  ];
  const effects = [
    "몸과 마음의 피로를 부드럽게 씻어내 줍니다.",
    "온전한 휴식과 재충전의 시간을 선사합니다.",
    "지친 신체 리듬을 편안하게 되찾아드립니다.",
    "일상의 스트레스를 말끔히 해소해 줍니다.",
    "최상의 릴렉스와 안락함을 제공합니다.",
    "몸의 긴장을 풀고 가벼운 활력을 채워줍니다.",
    "오래도록 지속되는 편안한 안정감을 전해드립니다.",
    "누적된 근육의 긴장을 개운하게 이완시켜 줍니다."
  ];

  const pool: string[] = [];
  for (const act of actions) {
    for (const eff of effects) {
      pool.push(`${act} ${eff}`);
      if (pool.length >= 80) break;
    }
    if (pool.length >= 80) break;
  }
  return pool;
}

// 💎 5개 제휴샵 데이터
const shopData: Record<
  string,
  {
    name: string;
    phone: string;
    location: string;
    badge: string;
    image: string;
    desc: string;
    courses: { name: string; time: string; price: string; desc: string }[];
    features: string[];
  }
> = {
  "1": {
    name: "한국미녀홈타이",
    phone: "0507-1280-3303",
    location: "수도권 주요 지역 25분 내 신속 방문",
    badge: "실시간 만족도 1위",
    image: "/shop1.jpg",
    desc: "지친 일상을 상쾌하게 정돈하는 1:1 방문 맞춤 케어! 자택으로 직접 찾아가는 출장 아로마 방문 케어 및 릴렉스 마사지 프로그램으로 편안한 휴식을 선사합니다.",
    courses: [
      { name: "아로디시 순환 방문 케어", time: "90분", price: "100,000원", desc: "부드러운 오일링과 마사지로 전신 순환을 돕는 힐링 아로디시 코스" },
      { name: "아로디시 롱타임 방문 테라피", time: "120분", price: "130,000원", desc: "여유로운 시간 동안 마사지와 휴식을 온전히 누리는 120분 코스" },
      { name: "VIP 스웨디시 방문 케어 A", time: "60분", price: "110,000원", desc: "감성적인 터치와 마사지로 굳은 긴장을 부드럽게 녹여주는 스웨디시" },
      { name: "VIP 스웨디시 방문 케어 B", time: "90분", price: "130,000원", desc: "깊은 피로 회복과 안정감을 선사하는 추천 VIP 마사지 코스" },
      { name: "VIP 스웨디시 풀케어 테라피", time: "120분", price: "150,000원", desc: "머리부터 발끝까지 여유롭게 이완하는 120분 전신 마사지 풀코스" },
      { name: "한국인 전문 관리사 방문 케어 A", time: "60분", price: "140,000원", desc: "실력파 테라피스트의 섬세한 1:1 맞춤형 방문 바디 마사지" },
      { name: "한국인 전문 관리사 방문 케어 B", time: "90분", price: "180,000원", desc: "최고의 만족감을 선사하는 프리미엄 스페셜 방문 마사지 코스" },
    ],
    features: ["100% 현장 안심 후불제", "24시간 365일 연중무휴", "수도권 주요 거점 25분 칼도착", "철저한 위생 및 방역 관리"],
  },
  "2": {
    name: "너무이쁜홈타이",
    phone: "0507-1280-3190",
    location: "수도권 주요 거점 신속 방문",
    badge: "재방문율 최우수",
    image: "/shop2.jpg",
    desc: "품격 있는 안식을 선사하는 프라이빗 홈케어! 편안한 공간에서 받는 출장 타이 방문 케어와 아로마 마사지로 굳어있던 바디 밸런스를 되찾아드립니다.",
    courses: [
      { name: "타이 스트레칭 방문 케어", time: "60분", price: "60,000원", desc: "전신 근육을 시원하게 늘려주어 뻐근함을 풀어주는 기본 타이 마사지" },
      { name: "타이 릴렉스 방문 테라피", time: "90분", price: "80,000원", desc: "여유로운 전신 스트레칭과 마사지로 묵은 긴장을 덜어내는 추천 코스" },
      { name: "타이 딥케어 방문 프로그램", time: "120분", price: "100,000원", desc: "전신 구석구석을 꼼꼼하게 이완시켜 주는 120분 집중 마사지 코스" },
      { name: "아로마 순환 방문 케어", time: "60분", price: "70,000원", desc: "부드러운 에센셜 오일로 전신 순환을 촉진하는 아로마 마사지" },
      { name: "아로마 힐링 방문 테라피", time: "90분", price: "90,000원", desc: "스트레스 완화와 포근한 휴식을 돕는 인기 아로마 마사지 코스" },
      { name: "아로마 딥릴렉스 방문 케어", time: "120분", price: "110,000원", desc: "깊은 이완과 활력을 전하는 120분 프리미엄 아로마 마사지 코스" },
      { name: "VIP 감성 릴렉스 방문 케어 A", time: "60분", price: "90,000원", desc: "부드러운 터치와 마사지가 결합된 시그니처 힐링 코스" },
      { name: "VIP 감성 릴렉스 방문 케어 B", time: "90분", price: "110,000원", desc: "높은 고객 만족도를 자랑하는 맞춤형 방문 바디 마사지" },
      { name: "VIP 감성 릴렉스 방문 케어 C", time: "120분", price: "130,000원", desc: "오래도록 지속되는 편안함과 마사지 효과를 주는 롱타임 코스" },
      { name: "VIP 스페셜 콤비 방문 케어 A", time: "60분", price: "100,000원", desc: "단시간에 효과적인 컨디션 회복을 누리는 방문 스페셜 마사지" },
      { name: "VIP 스페셜 콤비 방문 케어 B", time: "90분", price: "120,000원", desc: "체형 맞춤 테크닉이 적용된 고품격 힐링 방문 마사지 프로그램" },
      { name: "VIP 스페셜 콤비 방문 케어 C", time: "120분", price: "140,000원", desc: "최고의 안락함을 드리는 120분 프리미엄 마사지 스페셜 코스" },
      { name: "VIP 올인원 프리미엄 방문 케어", time: "150분", price: "160,000원", desc: "타이 스트레칭과 아로마 마사지, 풋케어를 모두 담은 종합 패키지" },
      { name: "한국 관리사 방문 스웨디시 A", time: "60분", price: "140,000원", desc: "한국인 전문 테라피스트의 디테일하고 정갈한 마사지 힐링 케어" },
      { name: "한국 관리사 방문 스웨디시 B", time: "90분", price: "180,000원", desc: "궁극의 편안함을 선사하는 최고급 감성 스웨디시 마사지 풀코스" },
    ],
    features: ["선입금 0원 100% 후불제", "친절 마인드 전문 힐러 상주", "24시간 신속 배차 시스템"],
  },
  "3": {
    name: "예쁜걸홈타이",
    phone: "0507-1280-3185",
    location: "수도권 주요 지역 신속 도착",
    badge: "24시 상시 할인",
    image: "/shop3.jpg",
    desc: "신속한 방문 보장과 정직한 정찰제 운영! 출장 타이 마사지 및 릴렉스 케어로 일상의 피로를 말끔히 비워내고 활력 넘치는 하루를 만들어 드립니다.",
    courses: [
      { name: "타이 베이직 방문 케어", time: "60분", price: "60,000원", desc: "뻐근한 몸을 시원하게 스트레칭해 주는 기본 건식 방문 마사지" },
      { name: "타이 스탠다드 방문 테라피", time: "90분", price: "80,000원", desc: "근육 결을 따라 전신을 편안하게 이완시키는 타이 마사지 추천 코스" },
      { name: "타이 풀타임 방문 프로그램", time: "120분", price: "100,000원", desc: "답답했던 피로 부위를 꼼꼼하게 정돈하는 120분 전신 마사지 코스" },
      { name: "아로마 소프트 방문 케어", time: "60분", price: "70,000원", desc: "부드럽고 에센셜 오일 마사지와 정성스러운 손길의 순환 케어" },
      { name: "아로마 마일드 방문 테라피", time: "90분", price: "90,000원", desc: "스트레스 해소와 전신 밸런스를 돕는 인기 아로마 마사지 코스" },
      { name: "아로마 프리미엄 방문 케어", time: "120분", price: "110,000원", desc: "깊은 이완과 편안한 숙면을 유도하는 풍성한 아로마 마사지 테라피" },
      { name: "VIP 감성 방문 마사지 (60분)", time: "60분", price: "90,000원", desc: "섬세한 감성 터치와 마사지가 더해져 심신을 녹여주는 코스" },
      { name: "VIP 감성 방문 마사지 (90분)", time: "90분", price: "110,000원", desc: "만족도 높은 시그니처 감성 힐링 방문 마사지 프로그램" },
      { name: "VIP 감성 방문 마사지 (120분)", time: "120분", price: "130,000원", desc: "온전한 휴식과 안정을 채워주는 120분 롱타임 방문 마사지 코스" },
      { name: "VIP 맞춤 방문 마사지 (60분)", time: "60분", price: "100,000원", desc: "집중적인 피로 부위를 효율적으로 풀어주는 방문 스페셜 코스" },
      { name: "VIP 맞춤 방문 마사지 (90분)", time: "90분", price: "120,000원", desc: "체계적인 압 조절과 이완 기법의 고품격 방문 마사지 테라피" },
      { name: "VIP 맞춤 방문 마사지 (120분)", time: "120분", price: "140,000원", desc: "차별화된 안락함을 선사하는 최고급 맞춤 방문 마사지 케어" },
      { name: "VIP 하이브리드 종합 방문 케어", time: "150분", price: "160,000원", desc: "타이 스트레칭, 아로마 마사지, 풋케어를 모두 담은 종합 패키지" },
      { name: "한국인 전문 힐러 방문 마사지 (60분)", time: "60분", price: "140,000원", desc: "실력파 한국인 관리사의 1:1 품격 있는 감성 스웨디시 마사지" },
      { name: "한국인 전문 힐러 방문 마사지 (90분)", time: "90분", price: "180,000원", desc: "극상의 만족감을 약속드리는 하이엔드 프리미엄 방문 마사지 코스" },
    ],
    features: ["예약금 없는 100% 현장 후불제", "평균 25분 신속 방문", "개인정보 완벽 보안 운영"],
  },
  "4": {
    name: "퀸즈홈테라피",
    phone: "0507-1280-3222",
    location: "수도권 주요 지역 24시 방문",
    badge: "프리미엄 감성",
    image: "/shop4.jpg",
    desc: "베테랑 테라피스트들의 체계적인 1:1 맞춤 피로회복 솔루션! 출장 릴렉스 케어와 전신 아로마 마사지로 여왕처럼 누리는 최고급 홈케어를 경험하세요.",
    courses: [
      { name: "건식 베이직 방문 케어", time: "60분", price: "60,000원", desc: "목, 어깨, 등의 뭉친 피로를 가볍게 풀어주는 건식 방문 마사지" },
      { name: "건식 스탠다드 방문 테라피", time: "90분", price: "80,000원", desc: "전신 근육을 차분하게 이완시키는 여유로운 건식 힐링 마사지" },
      { name: "건식 풀케어 방문 프로그램", time: "120분", price: "100,000원", desc: "누적된 피로를 완벽하게 날려주는 120분 집중 건식 마사지" },
      { name: "오일 베이직 방문 케어", time: "60분", price: "70,000원", desc: "천연 아로마 오일 마사지로 피부 보습과 순환을 돕는 프로그램" },
      { name: "오일 스탠다드 방문 테라피", time: "90분", price: "80,000원", desc: "지친 감각을 부드럽게 달래주는 아로마 마사지 힐링 코스" },
      { name: "오일 풀케어 방문 프로그램", time: "120분", price: "100,000원", desc: "전신을 풍성한 에센셜 오일 마사지로 채워주는 프리미엄 코스" },
      { name: "스웨디시 마일드 방문 케어", time: "60분", price: "80,000원", desc: "부드럽고 감미로운 터치의 소프트 스웨디시 방문 마사지 힐링" },
      { name: "스웨디시 포커스 방문 테라피", time: "90분", price: "100,000원", desc: "깊은 안정감과 이완을 선사하는 프리미엄 스웨디시 마사지" },
      { name: "스웨디시 스페셜 방문 프로그램", time: "120분", price: "120,000원", desc: "여유롭고 섬세하게 진행되는 120분 감성 마사지 힐링" },
      { name: "VIP 맞춤형 스페셜 방문 케어 (60분)", time: "60분", price: "100,000원", desc: "차별화된 만족감을 선사하는 VIP 스페셜 방문 바디케어" },
      { name: "VIP 맞춤형 스페셜 방문 케어 (90분)", time: "90분", price: "120,000원", desc: "고객 컨디션에 따른 최상급 테라피스트의 방문 집중 마사지" },
      { name: "VIP 맞춤형 스페셜 방문 케어 (120분)", time: "120분", price: "150,000원", desc: "온전한 휴식과 안정을 누리는 120분 VIP 마사지 마스터피스" },
      { name: "한국인 관리사 전담 방문 케어 (60분)", time: "60분", price: "150,000원", desc: "전문 한국인 관리사의 디테일한 1:1 맞춤 방문 마사지" },
      { name: "한국인 관리사 전담 방문 케어 (90분)", time: "90분", price: "180,000원", desc: "최고의 만족도를 드리는 프리미엄 한국인 전담 방문 마사지 코스" },
    ],
    features: ["세련된 감성 바디케어", "100% 현장 후불 결제", "24시간 실시간 상담 대기"],
  },
  "5": {
    name: "한국골든테라피",
    phone: "0507-1280-3360",
    location: "수도권 실시간 방문",
    badge: "인기도 TOP 5",
    image: "/shop5.jpg",
    desc: "골든 품격의 감성 릴렉싱! 출장 스웨디시 마사지와 전신 출장 릴렉스 케어로 지친 일상에 편안한 쉼표를 찍어드립니다.",
    courses: [
      { name: "골든 스웨디시 방문 케어 (60분)", time: "60분", price: "140,000원", desc: "부드럽고 감성적인 터치로 심신을 녹여주는 스웨디시 마사지 코스" },
      { name: "골든 스웨디시 방문 케어 (90분)", time: "90분", price: "190,000원", desc: "깊은 안정감과 활력을 불어넣는 90분 명품 스웨디시 마사지" },
      { name: "프리미엄 릴렉스 방문 케어 (60분)", time: "60분", price: "110,000원", desc: "굳은 몸을 효율적으로 이완시켜 주는 실속형 방문 바디 마사지" },
      { name: "프리미엄 릴렉스 방문 케어 (90분)", time: "90분", price: "130,000원", desc: "여유로운 템포로 전신 밸런스를 되찾아주는 방문 힐링 마사지" },
      { name: "프리미엄 릴렉스 방문 케어 (120분)", time: "120분", price: "150,000원", desc: "모든 피로를 개운하게 해소하는 120분 전신 방문 마사지 풀코스" },
    ],
    features: ["100% 후불제 안심 예약", "수도권 전지역 빠른 도착", "전문 힐러진 상시 대기"],
  },
};

// 🎯 '출장'과 '마사지' 키워드가 각각 자연스럽게 분산되어 포함되는 대규모 메타태그 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { region, district, shopId } = resolvedParams;
  const shop = shopData[shopId] || shopData["1"];

  const locationPrefix = parseLocationText(region, district);

  const modifiersPool = getModifiersPool();
  const serviceTypesPool = getServiceTypesPool();
  const descriptionsPool = getDescriptionsPool();

  const seedString = locationPrefix + shop.name + shopId + "chulsang_massage_split";
  const charSum = seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const modIndex = charSum % modifiersPool.length;
  const serviceIndex = (charSum * 3) % serviceTypesPool.length;
  const descIndex = (charSum * 7) % descriptionsPool.length;

  const selectedModifier = modifiersPool[modIndex];
  const selectedService = serviceTypesPool[serviceIndex];
  const selectedDesc = descriptionsPool[descIndex];

  // '출장'과 '마사지'가 붙지 않고 문장 내에서 분산되도록 포맷팅
  const formattedTitle = `${locationPrefix} ${selectedModifier} 제휴점의 ${selectedService} - ${shop.name} | 위치 테라피`;
  const formattedDesc = `${locationPrefix} 맞춤형 제휴 네트워크. ${selectedModifier} 진행되는 ${selectedService}. ${selectedDesc} (${shop.name})`;

  return {
    metadataBase: new URL("https://wich-therapy.netlify.app"),
    title: {
      absolute: formattedTitle,
    },
    description: formattedDesc,
    keywords: [
      `${locationPrefix} 타이 마사지`,
      `${locationPrefix} 아로마 마사지`,
      `${locationPrefix} 릴렉스 마사지`,
      `${locationPrefix} 스웨디시 마사지`,
      `${locationPrefix} 힐링 마사지`,
      `${locationPrefix} 림프 마사지`,
      `${locationPrefix} 전신 마사지`,
      `${locationPrefix} 건식 마사지`,
      `${locationPrefix} 오일 마사지`,
      `${locationPrefix} 감성 마사지`,
      `${locationPrefix} 딥티슈 마사지`,
      `${locationPrefix} 웰니스 마사지`,
      `${locationPrefix} 프라이빗 마사지`,
      `${locationPrefix} 맞춤 마사지`,
      `${locationPrefix} 출장 마사지`,
      `${locationPrefix} 24시 마사지`,
      "위치테라피"
    ],
    openGraph: {
      title: formattedTitle,
      description: formattedDesc,
      url: `https://wich-therapy.netlify.app/${region}/${encodeURIComponent(safeDecode(district))}/shop/${shopId}`,
      siteName: "위치 테라피",
      locale: "ko_KR",
      type: "website",
    },
  };
}

export default async function DistrictShopDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { region, district, shopId } = resolvedParams;
  const shop = shopData[shopId] || shopData["1"];

  const locationPrefix = parseLocationText(region, district);
  const displayShopName = `${locationPrefix} 프리미엄 힐링 마사지 - ${shop.name}`;

  return (
    <div className="bg-[#050505] text-gray-100 min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-black pb-24">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 bg-[#050505]/85 backdrop-blur-xl border-b border-amber-500/20 px-4 py-3.5 shadow-[0_4px_20px_rgba(245,158,11,0.1)]">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-black text-black text-xs shadow border border-amber-300">
              위치
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                위치 테라피
              </span>
              <span className="text-[10px] text-gray-400 tracking-tighter">WELLNESS PARTNER</span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all"
          >
            🏠 메인으로
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-1 space-y-8">
        <section className="bg-[#121214] border border-amber-500/30 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <div className="relative h-64 md:h-80 w-full overflow-hidden">
            <img src={shop.image} alt={shop.name} className="w-full h-full object-cover filter brightness-[0.7]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-transparent to-black/30"></div>
            <span className="absolute top-4 left-4 bg-amber-500 text-black text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg">
              {shop.badge}
            </span>
          </div>

          <div className="p-6 md:p-8 space-y-4 -mt-8 relative z-10">
            <div className="inline-block bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl text-amber-400 text-xs font-bold">
              📍 {shop.location}
            </div>

            <h1 className="text-xl md:text-3xl font-black text-white">{displayShopName}</h1>

            <p className="text-xs md:text-sm text-gray-300 leading-relaxed bg-black/50 p-4 rounded-2xl border border-white/5">
              {shop.desc}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {shop.features.map((feat, idx) => (
                <div key={idx} className="bg-black/60 border border-amber-500/20 px-3 py-2 rounded-xl text-center text-[11px] font-bold text-amber-300">
                  ✓ {feat}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 상세 코스 및 요금 안내 */}
        <section className="bg-[#0d0d0f] border border-amber-500/20 p-6 md:p-8 rounded-3xl space-y-6">
          <div className="text-center">
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">MASSAGE COURSE & PRICE</span>
            <h2 className="text-xl md:text-2xl font-black text-white mt-1">💎 대표 마사지 코스 및 요금 안내</h2>
          </div>

          <div className="space-y-4">
            {shop.courses.map((course, idx) => (
              <div key={idx} className="bg-black/60 border border-white/10 p-5 rounded-2xl flex justify-between items-center hover:border-amber-500/40 transition-colors">
                <div>
                  <span className="text-amber-400 text-[10px] font-black mr-2">{course.time}</span>
                  <h3 className="font-extrabold text-white text-base inline">{course.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{course.desc}</p>
                </div>
                <span className="text-base font-black text-amber-400 shrink-0 ml-4">{course.price}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 안심 이용 안내 */}
        <section className="bg-black/80 p-5 rounded-2xl border border-white/10">
          <h3 className="text-amber-400 font-bold text-sm mb-2 flex items-center gap-1.5">
            <span>📌</span> {locationPrefix} 웰니스 마사지 안심 이용 안내
          </h3>
          <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside">
            <li>위치 테라피 제휴 업체는 <strong>100% 현장 후불제</strong>로만 운영되며 사전 예약금이나 선입금을 절대 요구하지 않습니다.</li>
            <li>희망하시는 시간 여유 있게 문의 주시면 타이 마사지, 아로마 마사지, 스웨디시 전문 테라피스트가 신속하게 안내해 드립니다.</li>
          </ul>
        </section>
      </main>

      {/* 하단 고정 전화 / 문자 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#08080a]/95 backdrop-blur-xl border-t border-amber-500/30 p-3 md:p-4 shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-3">
          <a href={`tel:${shop.phone}`} className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black py-3.5 rounded-2xl text-xs md:text-sm shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95 transition-transform">
            📞 전화로 즉시예약
          </a>
          <a href={`sms:${shop.phone}?body=${encodeURIComponent(`[${locationPrefix}] ${shop.name} 마사지 예약 문의드립니다. (위치 테라피 보고 연락드렸어요)`)}`} className="flex items-center justify-center gap-2 bg-neutral-900 text-white font-black py-3.5 rounded-2xl text-xs md:text-sm border border-white/10 active:scale-95 transition-transform">
            💬 간편 문자상담
          </a>
        </div>
      </div>
    </div>
  );
}