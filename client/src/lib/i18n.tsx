import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "ko";

const LanguageContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("site_lang");
    return saved === "ko" || saved === "en" ? saved : "en";
  });
  const setLang = (l: Lang) => {
    localStorage.setItem("site_lang", l);
    setLangState(l);
  };
  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);

/** DB 콘텐츠 필드: 한국어 모드면 _ko 칼럼 우선, 없으면 영어로 폴백 */
export function pickField<T extends object>(item: T, field: string, lang: Lang): string {
  const rec = item as Record<string, unknown>;
  if (lang === "ko") {
    const ko = rec[`${field}_ko`];
    if (typeof ko === "string" && ko.trim()) return ko;
  }
  return (rec[field] as string) || "";
}

/** 고정 UI 문구 사전 */
const STRINGS: Record<string, { en: string; ko: string }> = {
  // Nav
  "nav.home": { en: "Home", ko: "홈" },
  "nav.about": { en: "About", ko: "소개" },
  "nav.initiatives": { en: "Initiatives", ko: "이니셔티브" },
  "nav.news": { en: "News", ko: "뉴스" },
  "nav.diaspora": { en: "K-Diaspora", ko: "K-디아스포라" },
  "nav.contact": { en: "Contact", ko: "문의" },
  // Footer
  "footer.tagline": {
    en: "Driving global progress through innovative solutions and strategic partnerships.",
    ko: "혁신적인 솔루션과 전략적 파트너십으로 글로벌 협력을 이끌어갑니다.",
  },
  "footer.quickLinks": { en: "Quick Links", ko: "바로가기" },
  "footer.contactInfo": { en: "Contact Info", ko: "연락처" },
  // Common
  "common.viewAllNews": { en: "View All News", ko: "뉴스 전체 보기" },
  "common.viewAllInitiatives": { en: "View All Initiatives", ko: "이니셔티브 전체 보기" },
  "common.learnMore": { en: "Learn More", ko: "자세히 보기" },
  "common.search": { en: "Search", ko: "검색" },
  "common.previous": { en: "Previous", ko: "이전" },
  "common.next": { en: "Next", ko: "다음" },
  "common.backToList": { en: "Back to List", ko: "목록으로" },
  "common.viewOriginal": { en: "View Original", ko: "원문 보기" },
  "common.notFound": { en: "Post not found.", ko: "게시글을 찾을 수 없습니다." },
  // Home
  "home.aboutTitle": { en: "About CordiaEC", ko: "CordiaEC 소개" },
  "home.aboutDesc": {
    en: "Cordia is a global hub rooted in Korean Studies, connecting knowledge and people across borders. We create trusted networks and opportunities that deepen understanding of Korea worldwide.",
    ko: "Cordia는 한국학에 뿌리를 둔 글로벌 허브로, 국경을 넘어 지식과 사람을 연결합니다. 전 세계가 한국을 더 깊이 이해할 수 있도록 신뢰할 수 있는 네트워크와 기회를 만듭니다.",
  },
  "home.feature1Title": { en: "Insightful Knowledge", ko: "통찰력 있는 지식" },
  "home.feature1Desc": { en: "Sharing trusted perspectives on Korea", ko: "한국에 대한 신뢰할 수 있는 관점 공유" },
  "home.feature2Title": { en: "Trusted Networks", ko: "신뢰의 네트워크" },
  "home.feature2Desc": {
    en: "Connecting experts, communities, and institutions",
    ko: "전문가, 커뮤니티, 기관을 연결",
  },
  "home.feature3Title": { en: "Collaborative Opportunities", ko: "협력의 기회" },
  "home.feature3Desc": { en: "Creating spaces for global partnerships", ko: "글로벌 파트너십의 장 마련" },
  "home.learnMoreAbout": { en: "Learn More About Us", ko: "더 알아보기" },
  "home.initiativesTitle": { en: "Our Initiatives", ko: "이니셔티브" },
  "home.initiativesDesc": {
    en: "Cordia drives collaboration across Korean business, culture, and education. From K-Food and K-Beauty to startups and venture capital, we create trusted bridges that connect global partners and unlock new opportunities.",
    ko: "Cordia는 한국의 비즈니스·문화·교육 전반의 협력을 이끕니다. K-Food와 K-Beauty부터 스타트업, 벤처캐피털까지, 글로벌 파트너를 연결하는 신뢰의 다리를 만듭니다.",
  },
  "home.newsDesc": {
    en: "Stay updated with the latest developments, announcements, and insights from CordiaEC.",
    ko: "CordiaEC의 최신 소식과 발표, 인사이트를 확인하세요.",
  },
  "home.noNews": { en: "No news yet.", ko: "아직 등록된 소식이 없습니다." },
  "home.ctaTitle": { en: "Ready to Get Started?", ko: "함께하실 준비가 되셨나요?" },
  "home.ctaDesc": {
    en: "Connect with our team to explore partnership opportunities and learn how CordiaEC can help drive your organization's global progress through strategic collaboration.",
    ko: "파트너십 기회를 탐색하고, CordiaEC가 전략적 협력을 통해 어떻게 글로벌 성장을 도울 수 있는지 알아보세요.",
  },
  "home.ctaButton": { en: "Contact Us", ko: "문의하기" },
  // News / Diaspora pages
  "news.heroTitle": { en: "News & Updates", ko: "뉴스 & 소식" },
  "news.heroDesc": { en: "Latest developments and insights from CordiaEC", ko: "CordiaEC의 최신 소식과 인사이트" },
  "news.searchPlaceholder": { en: "Search news...", ko: "뉴스 검색..." },
  "news.empty": { en: "No news articles found", ko: "뉴스가 없습니다" },
  "news.backToNews": { en: "News List", ko: "뉴스 목록" },
  "diaspora.heroTitle": { en: "K-Diaspora Community", ko: "K-디아스포라 커뮤니티" },
  "diaspora.heroDesc": {
    en: "Stories and activities from our global Korean diaspora community",
    ko: "전 세계 한인 디아스포라 커뮤니티의 이야기와 활동",
  },
  "diaspora.searchPlaceholder": { en: "Search posts...", ko: "게시글 검색..." },
  "diaspora.empty": { en: "No posts found", ko: "게시글이 없습니다" },
  "diaspora.backToList": { en: "K-Diaspora List", ko: "K-디아스포라 목록" },
  // Initiatives
  "initiatives.title": { en: "Our Initiatives", ko: "이니셔티브" },
  "initiatives.desc": {
    en: "Discover our comprehensive programs designed to foster innovation, collaboration, and sustainable growth across diverse industries and markets.",
    ko: "다양한 산업과 시장에서 혁신·협력·지속가능한 성장을 위한 프로그램을 만나보세요.",
  },
  "initiatives.related": { en: "Related News", ko: "관련 소식" },
  "initiatives.relatedEmpty": { en: "No related news yet.", ko: "아직 등록된 소식이 없습니다." },
  "initiatives.backToList": { en: "Initiatives List", ko: "이니셔티브 목록" },
  "initiatives.applyNow": { en: "Apply Now", ko: "신청하기" },
  // About
  "about.heroTitle": { en: "About CordiaEC", ko: "CordiaEC 소개" },
  "about.heroDesc": {
    en: "Cordia is a global hub rooted in Korean Studies, connecting knowledge and people across borders. We work with scholars and experts who hold deep cultural insight, helping businesses expand into Korea and supporting global outreach with trusted networks.",
    ko: "Cordia는 한국학에 뿌리를 둔 글로벌 허브로, 국경을 넘어 지식과 사람을 연결합니다. 깊은 문화적 통찰을 지닌 학자·전문가들과 함께 기업의 한국 진출을 돕고, 신뢰할 수 있는 네트워크로 글로벌 협력을 지원합니다.",
  },
  "about.vmTitle": { en: "Our Vision & Mission", ko: "비전 & 미션" },
  "about.visionTitle": { en: "Our Vision", ko: "비전" },
  "about.visionDesc": {
    en: "To become the trusted bridge where Korean expertise meets global opportunities. We envision a world where cultural understanding fosters sustainable growth, collaboration, and shared progress.",
    ko: "한국의 전문성과 글로벌 기회를 잇는 신뢰의 다리가 되는 것. 문화적 이해가 지속가능한 성장과 협력, 공동의 발전을 이끄는 세상을 그립니다.",
  },
  "about.missionTitle": { en: "Our Mission", ko: "미션" },
  "about.missionDesc": {
    en: "To empower global partners with Korea-focused knowledge and networks. We are dedicated to creating spaces for dialogue, supporting business expansion, and building partnerships that connect communities worldwide.",
    ko: "한국에 특화된 지식과 네트워크로 글로벌 파트너의 역량을 키웁니다. 대화의 장을 만들고, 비즈니스 확장을 지원하며, 전 세계 커뮤니티를 잇는 파트너십을 구축합니다.",
  },
  "about.historyTitle": { en: "Our Organization & History", ko: "조직 & 연혁" },
  "about.goToInitiatives": { en: "Go To Initiatives", ko: "이니셔티브 보기" },
  // Contact
  "contact.title": { en: "Contact Us", ko: "문의하기" },
  "contact.desc": {
    en: "We're here to help. Reach out to us with any questions or inquiries about our programs, partnerships, or services.",
    ko: "프로그램, 파트너십, 서비스에 대해 궁금한 점이 있으시면 언제든 문의해 주세요.",
  },
};

export function useT() {
  const { lang } = useLang();
  return (key: string): string => STRINGS[key]?.[lang] ?? key;
}
