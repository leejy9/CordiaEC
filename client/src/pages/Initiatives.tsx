import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Utensils, LineChart, GraduationCap, MessageSquare, Globe, Users } from "lucide-react";
import InitiativeModal from "@/components/modals/InitiativeModal";
import type { Initiative } from "@shared/schema";

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

export default function Initiatives() {
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const openModal = (initiative: Initiative) => {
    setSelectedInitiative(initiative);
    setModalOpen(true);
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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-cordia-dark mb-6" data-testid="text-initiatives-title">
              Our Initiatives
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-testid="text-initiatives-description">
              Discover our comprehensive programs designed to foster innovation, collaboration, and sustainable growth 
              across diverse industries and markets.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {initiatives.map((initiative: Initiative) => (
              <Card 
                key={initiative.id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                onClick={() => openModal(initiative)}
                data-testid={`card-initiative-${initiative.slug}`}
              >
                <CardContent className="p-6">
                  <div className="w-full h-48 mb-6 flex items-center justify-center rounded-xl overflow-hidden">
                    {initiative.imageUrl ? (
                      <img 
                        src={initiative.imageUrl} 
                        alt={initiative.title}
                        className="w-full h-full object-cover"
                        data-testid={`img-initiative-${initiative.slug}`}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                        <div className="text-center">
                          {getInitiativeIcon(initiative.slug)}
                          <div className="text-2xl font-bold text-green-700 mt-2">
                            {initiative.slug === 'k-food' ? 'K-Food' :
                             initiative.slug === 'vc-matching' ? 'VC Match' :
                             initiative.slug === 'forums' ? 'Forums' :
                             initiative.title}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-cordia-dark mb-3 group-hover:text-cordia-teal transition-colors" data-testid={`text-initiative-title-${initiative.slug}`}>
                    {initiative.title}
                  </h3>
                  <p className="text-gray-600 mb-4" data-testid={`text-initiative-description-${initiative.slug}`}>
                    {initiative.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-cordia-teal font-medium">Learn More</span>
                    <ArrowRight className="w-4 h-4 text-cordia-teal group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <InitiativeModal 
        open={modalOpen}
        onOpenChange={setModalOpen}
        initiative={selectedInitiative}
      />
    </Layout>
  );
}
