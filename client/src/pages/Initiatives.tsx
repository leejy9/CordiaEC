import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { getInitiatives } from "@/lib/queries";
import type { Initiative } from "@/lib/database.types";
import { useLang, useT, pickField } from "@/lib/i18n";

export default function Initiatives() {
  const [, navigate] = useLocation();
  const { lang } = useLang();
  const t = useT();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const { data: initiatives = [] } = useQuery({
    queryKey: ["initiatives"],
    queryFn: getInitiatives,
  });

  return (
    <Layout>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-cordia-dark mb-6">
              {t('initiatives.title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('initiatives.desc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {initiatives.map((init: Initiative) => (
              <Card
                key={init.slug}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                onClick={() => navigate(`/initiatives/${init.slug}`)}
                data-testid={`card-initiative-${init.slug}`}
              >
                <CardContent className="p-6">
                  <div className="w-full h-48 mb-6 rounded-xl overflow-hidden">
                    <img
                      src={init.image_url || ""}
                      alt={init.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-cordia-dark mb-3 group-hover:text-cordia-teal transition-colors">
                    {pickField(init, 'title', lang)}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {pickField(init, 'description', lang)}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-cordia-teal font-medium">
                      {t('common.learnMore')}
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
