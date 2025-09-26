import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Globe, Handshake, Lightbulb, Utensils, LineChart, GraduationCap, MessageSquare, Users } from "lucide-react";
import NewsModal from "@/components/modals/NewsModal";
import type { Initiative, NewsArticle } from "@shared/schema";

// Hardcoded initiatives data (no database required)
const initiatives: Initiative[] = [
  {
    id: "1",
    slug: "k-food",
    title: "K-Food Initiative",
    description: "Connecting Korean food brands with global buyers and distribution channels for international market expansion.",
    content: "The K-Food Initiative is designed to bridge the gap between innovative Korean food brands and international markets. Our comprehensive program provides market research, regulatory compliance support, distribution channel development, and strategic partnerships to help Korean food companies successfully expand globally. We work with local distributors, retailers, and food service providers to create sustainable market entry strategies.",
    imageUrl: "https://images.unsplash.com/photo-1567306301408-e75d5e8e9fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    category: "Food & Beverage"
  },
  {
    id: "2",
    slug: "k-beauty",
    title: "K-Beauty Initiative",
    description: "Empowering K-Beauty brands to certify and launch in overseas markets with comprehensive market entry support.",
    content: "Our K-Beauty Initiative provides comprehensive support for Korean beauty brands looking to enter international markets. We offer regulatory guidance, certification support, market analysis, and partnership development to ensure successful market entry and sustainable growth in the global beauty industry.",
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    category: "Beauty & Cosmetics"
  },
  {
    id: "3",
    slug: "startups",
    title: "Startups Program",
    description: "Mentoring and funding diaspora-led startups for global expansion with strategic partnership opportunities.",
    content: "The Startups Program focuses on supporting diaspora-led startups with mentoring, funding opportunities, and strategic partnerships. We provide access to global networks, investor connections, and market development resources to help innovative startups scale internationally.",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    category: "Technology & Innovation"
  },
  {
    id: "4",
    slug: "vc-matching",
    title: "VC Matching",
    description: "Bridging innovative companies with top international venture capital for strategic investment opportunities.",
    content: "Our VC Matching program connects innovative companies with leading international venture capital firms. We facilitate strategic investment opportunities through our extensive network of investors, providing companies with access to capital, expertise, and global market opportunities.",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    category: "Investment & Finance"
  },
  {
    id: "5",
    slug: "internships",
    title: "Internships Program",
    description: "Offering cross-border internship opportunities for Korean diaspora youth in international organizations.",
    content: "The Internships Program creates valuable cross-border internship opportunities for Korean diaspora youth in leading international organizations. We partner with global companies, NGOs, and government agencies to provide meaningful work experiences that build career foundations and cultural bridges.",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    category: "Education & Development"
  },
  {
    id: "6",
    slug: "forums",
    title: "Knowledge Forums",
    description: "Fostering knowledge exchange through online and offline seminars & forums for industry collaboration.",
    content: "Our Knowledge Forums facilitate meaningful knowledge exchange through both online and offline seminars, conferences, and collaborative forums. These platforms bring together industry leaders, researchers, and innovators to share insights, discuss trends, and develop collaborative solutions to global challenges.",
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "Knowledge & Collaboration"
  }
];

export default function Home() {
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [newsModalOpen, setNewsModalOpen] = useState(false);

  const { data: newsData } = useQuery({
    queryKey: ["/api/news?page=1&limit=3"], 
  });

  const newsArticles = (newsData as any)?.articles || [];


  const openNewsModal = (article: NewsArticle) => {
    setSelectedNews(article);
    setNewsModalOpen(true);
  };

  const getInitiativeIcon = (slug: string) => {
    switch (slug) {
      case 'k-food': return <Utensils className="text-4xl text-green-600" />;
      case 'k-beauty': return <Users className="text-4xl text-pink-600" />;
      case 'startups': return <Globe className="text-4xl text-blue-600" />;
      case 'vc-matching': return <LineChart className="text-4xl text-blue-600" />;
      case 'internships': return <GraduationCap className="text-4xl text-purple-600" />;
      case 'forums': return <MessageSquare className="text-4xl text-orange-600" />;
      default: return <Globe className="text-4xl text-cordia-teal" />;
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80')"
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight" data-testid="text-hero-title">
              Driving Global Progress Through{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cordia-teal to-cordia-green">
                Collaboration
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-description">
              CordiaEC is dedicated to fostering international cooperation and innovation to address pressing global 
              challenges through strategic partnerships and transformative initiatives.
            </p>
            <div className="flex justify-center items-center">
              <Button 
                onClick={() => scrollToSection('about')}
                className="bg-cordia-teal text-white hover:bg-cordia-green px-8 py-4 text-lg font-medium shadow-lg hover:scale-105 transition-all duration-300"
                data-testid="button-learn-more"
              >
                Learn More About Us
              </Button>
            </div>
          </div>
        </div>
      </section>

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
                About CordiaEC
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed" data-testid="text-about-description">
                CordiaEC is a global leader in innovative solutions, dedicated to transforming industries and empowering 
                businesses worldwide. Our commitment to excellence and cutting-edge technology drives us to deliver 
                unparalleled value to our clients.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-cordia-teal/10 rounded-lg flex items-center justify-center mr-4">
                    <Globe className="text-cordia-teal text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cordia-dark">Global Innovation</h3>
                    <p className="text-gray-600">Fostering international cooperation and technological advancement</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-cordia-green/10 rounded-lg flex items-center justify-center mr-4">
                    <Handshake className="text-cordia-green text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cordia-dark">Strategic Partnerships</h3>
                    <p className="text-gray-600">Building bridges between innovators and industry leaders</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-cordia-blue/10 rounded-lg flex items-center justify-center mr-4">
                    <Lightbulb className="text-cordia-blue text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cordia-dark">Transformative Solutions</h3>
                    <p className="text-gray-600">Developing cutting-edge solutions for tomorrow's challenges</p>
                  </div>
                </div>
              </div>
              <Link href="/about">
                <Button className="bg-cordia-blue text-white hover:bg-blue-600" data-testid="button-learn-more-about">
                  Learn More About Us
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
            <h2 className="text-3xl sm:text-4xl font-bold text-cordia-dark mb-4" data-testid="text-initiatives-title">
              Our Initiatives
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Our comprehensive programs span Korean business development, international investment opportunities, and global education initiatives. We connect Korean food and beauty brands with international markets, support diaspora-led startups with strategic partnerships, facilitate venture capital matching, create cross-border internship opportunities, and foster knowledge exchange through collaborative forums across diverse industries.
            </p>
            
            {/* Comprehensive Initiatives Image */}
            <div className="max-w-4xl mx-auto mb-12">
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
          </div>
          
          {/* Six Initiatives Grid */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-3 gap-8 mb-8">
              {/* First Row */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1567306301408-e75d5e8e9fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
                    alt="K-Food Initiative" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-semibold text-cordia-dark">K-Food Initiative</h3>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
                    alt="K-Beauty Program" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-semibold text-cordia-dark">K-Beauty Program</h3>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
                    alt="Startup Support" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-semibold text-cordia-dark">Startup Support</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-8">
              {/* Second Row */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
                    alt="VC Matching" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-semibold text-cordia-dark">VC Matching</h3>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
                    alt="Internship Programs" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-semibold text-cordia-dark">Internship Programs</h3>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
                    alt="Knowledge Forums" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-semibold text-cordia-dark">Knowledge Forums</h3>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/initiatives">
              <Button className="bg-cordia-blue text-white hover:bg-blue-600 px-8 py-3 text-lg font-medium" data-testid="button-view-all-initiatives">
                View All Initiatives
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
              Latest News
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest developments, announcements, and insights from CordiaEC.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {newsArticles.map((article: NewsArticle) => (
                      <tr key={article.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-news-${article.id}`}>
                        <td className="px-6 py-4">
                          <div 
                            className="cursor-pointer"
                            onClick={() => openNewsModal(article)}
                          >
                            <h3 className="font-semibold text-cordia-dark hover:text-cordia-teal transition-colors" data-testid={`text-news-title-${article.id}`}>
                              {article.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1" data-testid={`text-news-desc-${article.id}`}>
                              {article.excerpt}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600" data-testid={`text-news-date-${article.id}`}>
                          {new Date(article.publishedDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            
            <div className="text-center mt-8">
              <Link href="/news">
                <Button className="bg-cordia-blue text-white hover:bg-blue-600" data-testid="button-view-all-news">
                  View All News
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
                Ready to Get Started?
              </h2>
              <p className="text-lg text-black/90 mb-8" data-testid="text-cta-description">
                Connect with our team to explore partnership opportunities and learn how CordiaEC can help drive your 
                organization's global progress through strategic collaboration.
              </p>
              <Button 
                className="bg-white text-cordia-teal hover:bg-gray-50 px-8 py-4 text-lg font-medium shadow-lg hover:scale-105 transition-all duration-300"
                onClick={() => scrollToSection('contact')}
                data-testid="button-contact-cta"
              >
                Contact Us
              </Button>
            </div>
            
            {/* CTA Image */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                  alt="Business team collaboration and global partnerships" 
                  className="w-full h-80 object-cover rounded-3xl shadow-2xl"
                  data-testid="img-cta-collaboration"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
                
                {/* Overlay text */}
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm font-medium opacity-90">
                    Join 500+ organizations worldwide
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    Building bridges across continents
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
