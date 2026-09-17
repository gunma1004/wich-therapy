import datetime
import urllib.parse
import os

def generate_sitemap():
    base_url = "https://wich-therapy.netlify.app"
    today = datetime.date.today().isoformat()
    
    url_entries = []

    # 1. 메인 홈 페이지
    url_entries.append({
        "loc": base_url,
        "priority": "1.0",
        "changefreq": "daily"
    })

    # 2. 상단 카테고리 메인 페이지
    categories = ['services', 'prices', 'travel', 'places', 'reviews']
    for cat in categories:
        url_entries.append({
            "loc": f"{base_url}/{cat}",
            "priority": "0.8",
            "changefreq": "weekly"
        })

    # 3. 기본 제휴업체 상세 페이지 (/shop/1 ~ /shop/5)
    shop_ids = [1, 2, 3, 4, 5]
    for s_id in shop_ids:
        url_entries.append({
            "loc": f"{base_url}/shop/{s_id}",
            "priority": "0.8",
            "changefreq": "weekly"
        })

    # 4. 수도권 주요 구·시 및 세부 동 전체 계층 데이터 (실제 한글 주소 체계 반영)
    region_hierarchy = {
        "seoul": {
            "종로구": ["효자동", "사직동", "삼청동", "부암동", "평창동", "무악동", "교남동", "가회동", "혜화동"],
            "중구": ["소공동", "회현동", "명동", "필동", "장충동", "광희동", "을지로동", "신당동"],
            "용산구": ["후암동", "용산2가동", "남영동", "청파동", "효창동", "이촌1동", "이태원1동", "한남동"],
            "성동구": ["왕십리제2동", "마장동", "사근동", "행당1동", "옥수동", "성수1가제1동", "송정동"],
            "광진구": ["화양동", "군자동", "중곡1동", "능동", "구의1동", "광장동", "자양1동"],
            "동대문구": ["신설동", "용두동", "제기동", "전농1동", "답십리1동", "장안1동", "청량리동", "회기동"],
            "중랑구": ["면목본동", "상봉1동", "중화1동", "묵1동", "망우본동", "신내1동"],
            "성북구": ["성북동", "삼선동", "동선동", "돈암1동", "안암동", "보문동", "정릉1동", "길음1동"],
            "강북구": ["삼양동", "미아동", "송중동", "번1동", "수유1동", "우이동"],
            "도봉구": ["창1동", "도봉1동", "쌍문1동", "방학1동"],
            "노원구": ["월계1동", "공릉1동", "하계1동", "중계본동", "상계1동"],
            "은평구": ["녹번동", "불광1동", "갈현1동", "구산동", "대조동", "응암1동", "역촌동"],
            "서대문구": ["천연동", "북아현동", "충현동", "신촌동", "연희동", "홍제1동"],
            "마포구": ["공덕동", "아현동", "도화동", "대흥동", "서교동", "합정동", "망원1동", "연남동", "상암동"],
            "양천구": ["목1동", "신월1동", "신정1동"],
            "강서구": ["염창동", "등촌1동", "화곡1동", "발산1동", "방화1동"],
            "구로구": ["신도림동", "구로1동", "고척1동", "개봉1동", "오류1동"],
            "금천구": ["가산동", "독산1동", "시흥1동"],
            "영등포구": ["영등포본동", "여의동", "당산1동", "문래동", "신길1동", "대림1동"],
            "동작구": ["노량진1동", "상도1동", "흑석동", "사당1동", "대방동"],
            "관악구": ["보라매동", "청림동", "행운동", "낙성대동", "신림동", "대학동"],
            "서초구": ["서초1동", "잠원동", "반포1동", "방배1동", "양재1동"],
            "강남구": ["신사동", "논현1동", "압구정동", "청담동", "삼성1동", "대치1동", "역삼1동", "도곡1동"],
            "송파구": ["풍납1동", "방이1동", "오금동", "송파1동", "석촌동", "잠실본동"],
            "강동구": ["강일동", "명일1동", "고덕1동", "암사1동", "천호1동", "성내1동"]
        },
        "gyeonggi": {
            "수원시 장안구": ["파장동", "정자1동", "영화동", "송죽동"],
            "수원시 권선구": ["세류1동", "평동", "호매실동"],
            "수원시 팔달구": ["매교동", "고등동", "인계동"],
            "수원시 영통구": ["매탄1동", "영통1동", "광교1동"],
            "성남시 수정구": ["신흥1동", "태평1동"],
            "성남시 중원구": ["성남동", "중앙동"],
            "성남시 분당구": ["분당동", "수내1동", "정자동", "서현1동"],
            "안산시 상록구": ["본오1동", "사동", "일동"], # 🌟 안산시 상록구 완벽 반영
            "안산시 단원구": ["고잔동", "원곡동", "초지동"], # 🌟 안산시 단원구 완벽 반영
            "고양시 덕양구": ["원신동", "흥도동"],
            "고양시 일산동구": ["식사동", "백석1동", "정발산동"],
            "고양시 일산서구": ["일산1동", "탄현동"],
            "용인시 수지구": ["풍덕천1동", "신봉동", "죽전1동"],
            "용인시 기흥구": ["신갈동", "구성동", "동백동"],
            "부천시 원미구": ["원미동", "심곡동", "중동"]
        },
        "incheon": {
            "중구": ["인현동", "북성동"],
            "미추홀구": ["도화1동", "주안1동", "학익1동"],
            "연수구": ["옥련1동", "연수1동", "송도1동"],
            "남동구": ["구월1동", "간석1동", "논현1동"],
            "부평구": ["부평1동", "산곡1동", "삼산1동"],
            "계양구": ["효성1동", "작전동"],
            "서구": ["검암경서동", "청라1동", "석남1동"]
        }
    }

    # 5. 계층 구조 순회하며 URL 생성 (urllib.parse.quote로 한글 주소 인코딩 자동 처리)
    for region, districts in region_hierarchy.items():
        for district, dongs in districts.items():
            encoded_district = urllib.parse.quote(district)

            # 5-1. 구/시 단위 페이지
            url_entries.append({
                "loc": f"{base_url}/{region}/{encoded_district}",
                "priority": "0.9",
                "changefreq": "daily"
            })

            # 5-2. 구 단위 하위 샵 상세 페이지 (/shop/1 ~ 5)
            for s_id in shop_ids:
                url_entries.append({
                    "loc": f"{base_url}/{region}/{encoded_district}/shop/{s_id}",
                    "priority": "0.8",
                    "changefreq": "weekly"
                })

            # 5-3. 힐링 테라피 권역별 페이지 (/healing/...)
            url_entries.append({
                "loc": f"{base_url}/healing/{region}/{encoded_district}",
                "priority": "0.9",
                "changefreq": "daily"
            })

            # 5-4. 세부 동 단위 페이지 및 동 하위 샵 상세 페이지
            for dong in dongs:
                encoded_dong = urllib.parse.quote(dong)

                # 동 단위 페이지
                url_entries.append({
                    "loc": f"{base_url}/{region}/{encoded_district}/{encoded_dong}",
                    "priority": "0.85",
                    "changefreq": "daily"
                })

                # 동 하위 샵 상세 페이지
                for s_id in shop_ids:
                    url_entries.append({
                        "loc": f"{base_url}/{region}/{encoded_district}/{encoded_dong}/shop/{s_id}",
                        "priority": "0.75",
                        "changefreq": "weekly"
                    })

    # XML 문서 생성
    xml_content = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    for entry in url_entries:
        xml_content.append("  <url>")
        xml_content.append(f"    <loc>{entry['loc']}</loc>")
        xml_content.append(f"    <lastmod>{today}</lastmod>")
        xml_content.append(f"    <changefreq>{entry['changefreq']}</changefreq>")
        xml_content.append(f"    <priority>{entry['priority']}</priority>")
        xml_content.append("  </url>")

    xml_content.append("</urlset>")

    # public 폴더 아래 저장
    os.makedirs("public", exist_ok=True)
    file_name = "public/sitemap.xml"
    with open(file_name, "w", encoding="utf-8") as f:
        f.write("\n".join(xml_content))

    print(f"🎉 안산시 상록구를 포함하여 총 {len(url_entries)}개의 URL이 public/sitemap.xml로 생성되었습니다!")

if __name__ == "__main__":
    generate_sitemap()