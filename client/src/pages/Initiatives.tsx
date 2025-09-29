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
    description: "Showcasing Korean cuisine as a cultural brand with strategic market insights.",
    content: "We analyze the success factors of entering global food markets through deep cultural understanding of Korean cuisine. By working with local distributors and international partners, we provide tailored strategies that turn Korean food businesses into sustainable global players. Our support covers everything from market entry planning to long-term brand positioning.",
    imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Food & Beverage"
  },
  {
    id: "2",
    slug: "k-beauty",
    title: "K-Beauty Initiative",
    description: "Positioning K-Beauty as a global lifestyle movement, not just a product.",
    content: "We guide Korean beauty brands with market analysis, certification support, and brand positioning rooted in cultural context. Through partnerships with international retailers and influencers, we ensure confident and effective entry into the global beauty industry. Our expertise enables brands to scale sustainably while preserving their unique Korean identity.",
    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400",
    category: "Beauty & Cosmetics"
  },
  {
    id: "3",
    slug: "startups",
    title: "Startups Program",
    description: "Connecting diaspora-led startups with Korea’s expertise and global expansion networks.",
    content: "We mentor and support startups by linking them to global networks, investors, and expert advisors. Our program provides concrete pathways—from idea validation to cross-border scaling—so that diaspora-led ventures can thrive internationally with confidence. In addition, we facilitate connections with Korean Studies experts who add cultural depth to innovation.",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    category: "Technology & Innovation"
  },
  {
    id: "4",
    slug: "vc-matching",
    title: "VC Matching",
    description: "Bridging Korean ventures with top-tier global investors through trusted partnerships.",
    content: "We match innovative companies with venture capital firms worldwide, supported by our established networks in Korea and abroad. By combining cultural insight with investor expertise, we create effective and sustainable investment opportunities across borders. Our platform reduces friction in cross-border investment and accelerates deal-making.",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    category: "Investment & Finance"
  },
  {
    id: "5",
    slug: "internships",
    title: "Internships Program",
    description: "Empowering next-generation leaders through cross-border career experiences.",
    content: "We provide Korean diaspora youth with direct access to meaningful internships in international organizations. Backed by our partnerships with universities, NGOs, and enterprises, we deliver hands-on opportunities that build careers and cultural bridges. These experiences cultivate global perspectives and strengthen professional readiness.",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    category: "Education & Development"
  },
  {
    id: "6",
    slug: "forums",
    title: "Global Submit",
    description: "A global stage where Korean Studies meets international collaboration.",
    content: "We host forums and conferences that gather scholars, business leaders, and policymakers to exchange knowledge and strategies. These summits turn cultural expertise into actionable solutions for global challenges, positioning Cordia as a trusted convener. Each event amplifies Korea’s role in fostering dialogue and global partnership.",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400",
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
