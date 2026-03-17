import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { contacts, newsArticles, initiatives, researchPapers } from "./shared/schema";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

async function seed() {
  console.log("🌱 Starting database seeding...");

  const sql = postgres(DATABASE_URL);
  const db = drizzle(sql);

  try {
    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await db.delete(contacts);
    await db.delete(newsArticles);
    await db.delete(initiatives);
    await db.delete(researchPapers);

    // Insert seed data - Contacts
    console.log("📧 Seeding contacts...");
    await db.insert(contacts).values([
      {
        name: "김철수",
        email: "kim@example.com",
        message: "K-Food 사업에 대해 상담받고 싶습니다.",
      },
      {
        name: "이영희",
        email: "lee@example.com",
        message: "뷰티 브랜드 국제화에 대해 문의합니다.",
      },
    ]);

    // Insert seed data - News Articles
    console.log("📰 Seeding news articles...");
    await db.insert(newsArticles).values([
      {
        title: "Cordia K-Food Initiative 성공적으로 출범",
        content:
          "Cordia는 한국 식품 기업들의 글로벌 진출을 지원하는 K-Food Initiative를 공식 출범했습니다. 이 프로젝트는 문화적 이해와 시장 분석을 바탕으로 한국식 음식을 세계적인 문화 브랜드로 포지셔닝하는 것을 목표로 합니다.",
        excerpt:
          "한국 식품 브랜드의 글로벌 확장을 지원하는 새로운 이니셔티브 출범",
        publishedDate: new Date("2024-03-15"),
        imageUrl:
          "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1936",
      },
      {
        title: "K-Beauty 산업 2024년 전망 리포트 발표",
        content:
          "Cordia K-Beauty 팀은 2024년 글로벌 뷰티 트렌드와 한국 브랜드의 기회를 분석한 종합 리포트를 발표했습니다. 리포트에 따르면 지속 가능성과 K-컬처 수요가 향후 주요 성장 동력이 될 것으로 예측됩니다.",
        excerpt: "2024년 글로벌 뷰티 시장 분석 및 한국 브랜드 전략 방향 제시",
        publishedDate: new Date("2024-03-10"),
        imageUrl:
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3",
      },
      {
        title: "Global Summit 2024 성공적 개최",
        content:
          "Cordia가 개최한 Global Summit 2024에는 50개국 이상의 학자, 비즈니스 리더, 정책입안자들이 참여했습니다. 한국 문화와 국제 협력의 새로운 기회를 논의하는 자리가 되었습니다.",
        excerpt:
          "한국 스터디와 국제 협력의 미래를 논의하는 글로벌 컨퍼런스 개최",
        publishedDate: new Date("2024-03-05"),
        imageUrl:
          "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3",
      },
      {
        title: "디아스포라 스타트업 펀딩 라운드 성과",
        content:
          "Cordia 스타트업 프로그램을 통해 지원한 기업들이 올해 총 $5M 규모의 펀딩을 유치했습니다. 글로벌 네트워크와 한국 전문성이 결합된 모든의 스타트업이 국제 무대에서 주목받고 있습니다.",
        excerpt: "Cordia 스타트업 프로그램 지원 기업들 총 $5M 펀딩 유치",
        publishedDate: new Date("2024-02-28"),
      },
    ]);

    // Insert seed data - Initiatives
    console.log("🚀 Seeding initiatives...");
    await db.insert(initiatives).values([
      {
        slug: "k-food",
        title: "K-Food Initiative",
        description:
          "한국 음식문화를 세계적 브랜드로 포지셔닝하고 전략적 시장 정보를 제공합니다.",
        content:
          "한국 식품 시장의 국제 진출 성공 요인을 분석하고, 한식의 문화적 가치를 알립니다. 현지 유통업체 및 국제 파트너와 협력하여 한국 식품 기업이 글로벌 플레이어로 성장하도록 맞춤 전략을 제공합니다.",
        imageUrl:
          "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1936",
        category: "Food & Beverage",
      },
      {
        slug: "k-beauty",
        title: "K-Beauty Initiative",
        description:
          "K-Beauty를 글로벌 라이프스타일 무브먼트로, 단순 제품 이상으로 포지셔닝합니다.",
        content:
          "한국 뷰티 브랜드의 국제 진출을 시장 분석, 인증 지원, 문화 기반 브랜드 포지셔닝으로 안내합니다. 국제 유통업체 및 인플루언서와의 파트너십을 통해 글로벌 뷰티 산업에 자신감 있게 진입할 수 있도록 돕습니다.",
        imageUrl:
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3",
        category: "Beauty & Cosmetics",
      },
      {
        slug: "startups",
        title: "Startups Program",
        description:
          "디아스포라 스타트업을 한국의 전문성과 글로벌 확장 네트워크와 연결합니다.",
        content:
          "스타트업에 멘토링과 글로벌 네트워크 및 투자자 접근을 제공합니다. 아이디어 검증부터 국제 스케일링까지 구체적인 경로를 제시하여 스타트업이 국제적 자신감과 함께 성장하도록 지원합니다.",
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3",
        category: "Technology & Innovation",
      },
      {
        slug: "vc-matching",
        title: "VC Matching",
        description:
          "한국 벤처를 세계 최고 투자자들과 신뢰 기반 파트너십으로 연결합니다.",
        content:
          "혁신 기업을 전 세계 벤처캐피탈과 매칭하며, 한국과 해외의 확립된 네트워크로 지원합니다. 문화 통찰력과 투자자 전문성을 결합하여 국경 간 투자 기회를 효과적이고 지속 가능하게 만듭니다.",
        imageUrl:
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3",
        category: "Investment & Finance",
      },
      {
        slug: "internships",
        title: "Internships Program",
        description:
          "차세대 리더에게 국경 간 경력 경험을 통한 역량 강화 기회를 제공합니다.",
        content:
          "한국 디아스포라 청년들에게 국제기구의 의미 있는 인턴십 기회를 직접 제공합니다. 대학, NGO, 기업과의 제휴로 실무 경험을 제공하고 글로벌 시야와 전문성을 갖춘 인재를 양성합니다.",
        imageUrl:
          "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3",
        category: "Education & Development",
      },
      {
        slug: "forums",
        title: "Global Summit",
        description:
          "한국 스터디와 국제 협력이 만나는 글로벌 무대에서 지식과 전략을 나눕니다.",
        content:
          "학자, 비즈니스 리더, 정책입안자를 모여 지식과 전략을 교류하는 포럼과 컨퍼런스를 개최합니다. 문화 전문성을 글로벌 과제 해결을 위한 실행 가능한 솔루션으로 전환하여 Cordia를 신뢰할 수 있는 통합자로 위치시킵니다.",
        imageUrl:
          "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3",
        category: "Knowledge & Collaboration",
      },
    ]);

    // Insert seed data - Research Papers
    console.log("📚 Seeding research papers...");
    await db.insert(researchPapers).values([
      {
        title: "글로벌 시장에서 한국 브랜드의 문화적 포지셔닝 전략",
        description:
          "한국 기업의 국제 진출 시 문화 차이를 극복하고 경쟁력을 강화하는 방안",
        content:
          "본 논문은 한국 브랜드가 글로벌 시장에서 문화적 정체성을 유지하면서 지역화를 이루는 전략을 분석합니다. 사례 분석과 데이터 기반 인사이트를 통해 실행 가능한 로드맵을 제시합니다.",
        publishedDate: new Date("2024-01-15"),
        author: "Park, J. & Kim, S.",
        views: 245,
        downloads: 48,
      },
      {
        title: "디아스포라 네트워크를 활용한 국제 비즈니스 확장",
        description:
          "해외 거주 한인 네트워크가 한국 기업의 글로벌 성장에 미치는 영향",
        content:
          "디아스포라 커뮤니티는 문화적 연결고리이자 비즈니스 기회 창출의 원천입니다. 이 논문은 한국 기업이 해외 거주 한인 네트워크를 전략적으로 활용할 수 있는 방안을 제시합니다.",
        publishedDate: new Date("2023-12-10"),
        author: "Lee, M. & Choi, H.",
        views: 189,
        downloads: 32,
      },
    ]);

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📊 Seeded data summary:");
    console.log("  - 2 contacts");
    console.log("  - 4 news articles");
    console.log("  - 6 initiatives");
    console.log("  - 2 research papers");

    await sql.end();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await sql.end();
    process.exit(1);
  }
}

seed();
