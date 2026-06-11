import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Handshake, Lightbulb, Users, ImageIcon } from "lucide-react";
import NewsModal from "@/components/modals/NewsModal";
import HeroCarousel from "@/components/HeroCarousel";
import PopupDisplay from "@/components/PopupDisplay";
import { getInitiatives, getHomePosts, getSiteSettings } from "@/lib/queries";
import type { Post, Initiative } from "@/lib/database.types";
import { useLang, useT, pickField } from "@/lib/i18n";

export type NewsArticle = Post;

export default function Home() {
  const { lang } = useLang();
  const t = useT();
  const [selectedNews, setSelectedNews] = useState<Post | null>(null);
  const [newsModalOpen, setNewsModalOpen] = useState(false);

  const { data: initiatives = [] } = useQuery({
    queryKey: ["initiatives"],
    queryFn: getInitiatives,
  });

  const { data: settings = {} } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const s = await getSiteSettings();
      return s;
    },
  });

  const homeCount = parseInt(settings.home_board_count || "3", 10);

  const { data: newsArticles = [] } = useQuery({
    queryKey: ["home_posts", homeCount],
    queryFn: () => getHomePosts(homeCount),
  });


  const openNewsModal = (article: NewsArticle) => {
    setSelectedNews(article);
    setNewsModalOpen(true);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      {/* Popups (게시 기간 내 활성 팝업만 표시) */}
      <PopupDisplay />

      {/* Hero Carousel (admin 히어로 메뉴에서 관리) */}
      <HeroCarousel />

      {/* About Preview Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800" 
                alt="Professional team collaboration in modern office setting" 
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                data-testid="img-about"
              />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-cordia-dark mb-6" data-testid="text-about-title">
                {t('home.aboutTitle')}
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed" data-testid="text-about-description">
                {t('home.aboutDesc')}
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 flex-shrink-0 bg-yellow-600/10 rounded-lg flex items-center justify-center mr-4">
                    <Lightbulb className="text-yellow-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cordia-dark">{t('home.feature1Title')}</h3>
                    <p className="text-gray-600">{t('home.feature1Desc')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 flex-shrink-0 bg-indigo-600/10 rounded-lg flex items-center justify-center mr-4">
                    <Users className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cordia-dark">{t('home.feature2Title')}</h3>
                    <p className="text-gray-600">{t('home.feature2Desc')}</p>
                  </div>
                </div>
                    <div className="flex items-start">
                      <div className="w-12 h-12 flex-shrink-0 bg-green-600/10 rounded-lg flex items-center justify-center mr-4">
                        <Handshake className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cordia-dark">{t('home.feature3Title')}</h3>
                    <p className="text-gray-600">{t('home.feature3Desc')}</p>
                  </div>
                </div>
              </div>
              <Link href="/about">
                <Button className="bg-cordia-blue text-white hover:bg-blue-600" data-testid="button-learn-more-about">
                  {t('home.learnMoreAbout')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Initiatives Section */}
      <section id="initiatives" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-cordia-dark mb-8" data-testid="text-initiatives-title">
              {t('home.initiativesTitle')}
            </h2>

            {/* Comprehensive Initiatives Image */}
            <div className="max-w-4xl mx-auto mb-8">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                alt="Global collaboration and innovation across diverse industries" 
                className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-2xl"
                data-testid="img-initiatives-overview"
              />
              <p className="text-sm text-gray-500 mt-3 italic">
                Empowering global partnerships across K-Food, K-Beauty, Technology, Investment, Education, and Knowledge sectors
              </p>
            </div>

            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
              {t('home.initiativesDesc')}
            </p>
          </div>

          {/* Six Initiatives Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {initiatives.map((init: Initiative) => (
                <Link
                  key={init.slug}
                  href={`/initiatives/${init.slug}`}
                  className="text-center group"
                  data-testid={`link-home-initiative-${init.slug}`}
                >
                  <div className="w-full aspect-square mb-2 rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={init.image_url || ""}
                      alt={init.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-cordia-dark group-hover:text-cordia-teal transition-colors">
                    {init.label}
                  </h3>
                </Link>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/initiatives">
              <Button className="bg-cordia-blue text-white hover:bg-blue-600 px-8 py-3 text-lg font-medium" data-testid="button-view-all-initiatives">
                {t('common.viewAllInitiatives')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Research Preview Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-cordia-dark mb-4" data-testid="text-research-title">
              {settings.home_board_title || "Latest News"}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.newsDesc')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {newsArticles.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl text-gray-400">
                {t('home.noNews')}
              </div>
            ) : (
              <div className="space-y-4">
                {newsArticles.map((article: Post) => (
                  <div
                    key={article.id}
                    onClick={() => openNewsModal(article)}
                    className="flex gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-cordia-teal/30 transition-all cursor-pointer group"
                    data-testid={`row-news-${article.id}`}
                  >
                    <div className="w-32 h-24 sm:w-40 sm:h-28 rounded-lg overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                      {article.image_url ? (
                        <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-semibold text-cordia-dark group-hover:text-cordia-teal transition-colors line-clamp-1" data-testid={`text-news-title-${article.id}`}>
                        {pickField(article, 'title', lang)}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-2" data-testid={`text-news-desc-${article.id}`}>
                        {pickField(article, 'excerpt', lang)}
                      </p>
                    </div>
                    <div className="shrink-0 self-center text-sm text-gray-400 whitespace-nowrap" data-testid={`text-news-date-${article.id}`}>
                      {new Date(article.published_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <Link href="/news">
                <Button className="bg-cordia-blue text-white hover:bg-blue-600" data-testid="button-view-all-news">
                  {t('common.viewAllNews')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cordia-teal to-cordia-green">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Text Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-black mb-6" data-testid="text-cta-title">
                {t('home.ctaTitle')}
              </h2>
              <p className="text-lg text-black/90 mb-8" data-testid="text-cta-description">
                {t('home.ctaDesc')}
              </p>
              <Link href="/contact">
                <Button 
                  className="bg-white text-cordia-teal hover:bg-gray-50 px-8 py-4 text-lg font-medium shadow-lg hover:scale-105 transition-all duration-300"
                  data-testid="button-contact-cta"
                >
                  {t('home.ctaButton')}
                </Button>
              </Link>
            </div>

            {/* CTA Image */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <img 
                  src="https://plus.unsplash.com/premium_photo-1727730015669-aac64afb50ad?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Business team collaboration and global partnerships" 
                  className="w-full h-80 object-cover rounded-3xl shadow-2xl"
                  data-testid="img-cta-collaboration"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>

                {/* Overlay text */}
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm font-medium opacity-90">
                    Join leading experts in Korean Studies
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    Empowering global business with deep cultural insight and networks
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Modals */}

      <NewsModal 
        open={newsModalOpen}
        onOpenChange={setNewsModalOpen}
        article={selectedNews}
      />
    </Layout>
  );
}
