import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Utensils, LineChart, GraduationCap, MessageSquare, Globe, Users } from "lucide-react";
import InitiativeModal from "@/components/modals/InitiativeModal";
import type { Initiative } from "@shared/schema";

export default function Initiatives() {
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: initiativesData, isLoading, error } = useQuery({
    queryKey: ["/api/initiatives"],
    queryFn: async () => {
      const response = await fetch(`/api/initiatives`);
      if (!response.ok) {
        throw new Error('Failed to fetch initiatives');
      }
      return response.json();
    },
  });

  const initiatives = (initiativesData as any)?.initiatives || [];

  if (isLoading) {
    return (
      <Layout>
        <div className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="h-12 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-80 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center bg-red-50 rounded-2xl border border-red-100 p-10">
              <h1 className="text-4xl sm:text-5xl font-bold text-cordia-dark mb-6">
                Our Initiatives
              </h1>
              <p className="text-lg text-red-600">
                Failed to load initiatives. Please check the API deployment and database connection.
              </p>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

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
