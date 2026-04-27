import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Utensils, LineChart, GraduationCap, MessageSquare, Globe, Users } from "lucide-react";
import type { Initiative } from "@shared/schema";

// Default fallback data for display when DB has no entry yet
const DEFAULTS: Record<string, Omit<Initiative, "id" | "linkUrl" | "publishedDate">> = {
  "k-food": {
    slug: "k-food",
    title: "K-Food Initiative",
    description: "Showcasing Korean cuisine as a cultural brand with strategic market insights.",
    content: "",
    imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1936&auto=format&fit=crop",
    category: "Food & Beverage",
  },
  "k-beauty": {
    slug: "k-beauty",
    title: "K-Beauty Initiative",
    description: "Positioning K-Beauty as a global lifestyle movement, not just a product.",
    content: "",
    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400",
    category: "Beauty & Cosmetics",
  },
  "startups": {
    slug: "startups",
    title: "Startups Program",
    description: "Connecting diaspora-led startups with Korea's expertise and global expansion networks.",
    content: "",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400",
    category: "Technology & Innovation",
  },
  "vc-matching": {
    slug: "vc-matching",
    title: "VC Matching",
    description: "Bridging Korean ventures with top-tier global investors through trusted partnerships.",
    content: "",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400",
    category: "Investment & Finance",
  },
  "internships": {
    slug: "internships",
    title: "Internships Program",
    description: "Empowering next-generation leaders through cross-border career experiences.",
    content: "",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400",
    category: "Education & Development",
  },
  "forums": {
    slug: "forums",
    title: "Global Summit",
    description: "A global stage where Korean Studies meets international collaboration.",
    content: "",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400",
    category: "Knowledge & Collaboration",
  },
};

const SLUG_ORDER = ["k-food", "k-beauty", "startups", "vc-matching", "internships", "forums"];

function getIcon(slug: string) {
  switch (slug) {
    case "k-food": return <Utensils className="w-8 h-8 text-green-600" />;
    case "k-beauty": return <Users className="w-8 h-8 text-pink-600" />;
    case "startups": return <Globe className="w-8 h-8 text-blue-600" />;
    case "vc-matching": return <LineChart className="w-8 h-8 text-blue-600" />;
    case "internships": return <GraduationCap className="w-8 h-8 text-purple-600" />;
    case "forums": return <MessageSquare className="w-8 h-8 text-orange-600" />;
    default: return <Globe className="w-8 h-8 text-cordia-teal" />;
  }
}

export default function Initiatives() {
  const [, navigate] = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Fetch DB initiatives
  const { data } = useQuery({
    queryKey: ["/api/initiatives"],
    queryFn: async () => {
      const res = await fetch("/api/initiatives");
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  // Build a map of slug → DB initiative
  const dbMap: Record<string, Initiative> = {};
  ((data?.initiatives || []) as Initiative[]).forEach((item) => {
    dbMap[item.slug] = item;
  });

  // Merge: DB wins over defaults
  const cards = SLUG_ORDER.map((slug) => {
    const dbEntry = dbMap[slug];
    const def = DEFAULTS[slug];
    return {
      slug,
      title: dbEntry?.title || def.title,
      description: dbEntry?.description || def.description,
      imageUrl: dbEntry?.imageUrl || def.imageUrl,
      category: dbEntry?.category || def.category,
      hasDbContent: !!dbEntry,
    };
  });

  const handleLearnMore = (slug: string, hasDbContent: boolean) => {
    if (hasDbContent) {
      navigate(`/initiatives/${slug}`);
    } else {
      navigate(`/initiatives/${slug}`);
    }
  };

  return (
    <Layout>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-cordia-dark mb-6">
              Our Initiatives
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our comprehensive programs designed to foster innovation, collaboration, and sustainable growth
              across diverse industries and markets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card) => (
              <Card
                key={card.slug}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                onClick={() => handleLearnMore(card.slug, card.hasDbContent)}
              >
                <CardContent className="p-6">
                  <div className="w-full h-48 mb-6 flex items-center justify-center rounded-xl overflow-hidden">
                    {card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                        <div className="text-center">
                          {getIcon(card.slug)}
                        </div>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-cordia-dark mb-3 group-hover:text-cordia-teal transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {card.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-cordia-teal font-medium">
                      Learn More
                    </span>
                    <ArrowRight className="w-4 h-4 text-cordia-teal group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
