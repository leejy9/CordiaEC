import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { getMilestones } from "@/lib/queries";
import type { Milestone } from "@/lib/database.types";
import { useLang, useT, pickField } from "@/lib/i18n";

export default function About() {
  const { lang } = useLang();
  const t = useT();
  const { data: milestones = [] } = useQuery({
    queryKey: ["milestones"],
    queryFn: getMilestones,
  });
  return (
    <Layout>
      {/* About Hero Section */}
      <section className="relative py-20 bg-cordia-dark text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cordia-dark via-slate-800 to-cordia-dark opacity-90"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-about-hero-title">
              {t('about.heroTitle')}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed" data-testid="text-about-hero-description">
              {t('about.heroDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-cordia-dark mb-4" data-testid="text-vision-mission-title">
              {t('about.vmTitle')}
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                alt="Sustainable innovation and environmental responsibility"
                className="w-full h-96 object-cover rounded-xl shadow-lg"
                data-testid="img-vision"
              />
              <div className="mt-8">
                <h3 className="text-xl font-bold text-cordia-dark mb-4">{t('about.visionTitle')}</h3>
                <p className="text-gray-600 leading-relaxed" data-testid="text-vision-description">
                  {t('about.visionDesc')}
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  
                </p>
              </div>
            </div>
            
            <div>
              <img 
                src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                alt="Global collaboration and partnership development"
                className="w-full h-96 object-cover rounded-xl shadow-lg"
                data-testid="img-mission"
              />
              <div className="mt-8">
                <h3 className="text-xl font-bold text-cordia-dark mb-4">{t('about.missionTitle')}</h3>
                <p className="text-gray-600 leading-relaxed" data-testid="text-mission-description">
                  {t('about.missionDesc')}
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Organization & History Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-cordia-dark mb-4" data-testid="text-org-history-title">
              {t('about.historyTitle')}
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto mb-16">
            {milestones.map((milestone: Milestone, idx: number) => (
              <div key={milestone.id} className="relative flex gap-8 pb-14 last:pb-0" data-testid={`row-milestone-${idx}`}>
                {/* Dotted connector line */}
                {idx < milestones.length - 1 && (
                  <div className="absolute left-[60px] top-14 bottom-0 border-l-2 border-dashed border-gray-300" />
                )}
                {/* Year box */}
                <div className="shrink-0 w-[120px]">
                  <div className="bg-cordia-blue text-white font-bold text-lg text-center py-3 px-2 rounded-tl-2xl rounded-br-2xl shadow-md">
                    {milestone.period_label}
                  </div>
                </div>
                {/* Content lines */}
                <div className="flex-1 pt-2 space-y-4">
                  {pickField(milestone, "description", lang).split("\n").map((line, i) =>
                    line.trim() ? (
                      <p key={i} className="text-gray-700 leading-relaxed">{line.trim()}</p>
                    ) : null
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <a href="/initiatives" className="inline-block">
              <button className="bg-cordia-blue text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium" data-testid="button-go-to-initiatives">
                {t('about.goToInitiatives')}
              </button>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
