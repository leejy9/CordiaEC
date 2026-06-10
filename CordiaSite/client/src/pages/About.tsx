import Layout from "@/components/Layout";

export default function About() {
  return (
    <Layout>
      {/* About Hero Section */}
      <section className="relative py-20 bg-cordia-dark text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cordia-dark via-slate-800 to-cordia-dark opacity-90"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-about-hero-title">
              About CordiaEC
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed" data-testid="text-about-hero-description">
              Cordia is a global hub rooted in Korean Studies, connecting knowledge and people across borders.
              We work with scholars and experts who hold deep cultural insight, helping businesses expand into Korea and supporting global outreach with trusted networks.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-cordia-dark mb-4" data-testid="text-vision-mission-title">
              Our Vision & Mission
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
                <h3 className="text-xl font-bold text-cordia-dark mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed" data-testid="text-vision-description">
                  To become the trusted bridge where Korean expertise meets global opportunities.
                  We envision a world where cultural understanding fosters sustainable growth, collaboration, and shared progress.
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
                <h3 className="text-xl font-bold text-cordia-dark mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed" data-testid="text-mission-description">
                  To empower global partners with Korea-focused knowledge and networks.
                  We are dedicated to creating spaces for dialogue, supporting business expansion, and building partnerships that connect communities worldwide.
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
              Our Organization & History
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Timeline Items */}
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
                alt="Modern office building representing company establishment"
                className="w-full h-48 object-cover rounded-xl mb-4"
                data-testid="img-founded"
              />
              <h3 className="text-lg font-bold text-cordia-dark mb-2">Founded in 1985</h3>
              <p className="text-gray-600 text-sm">Inha University Institute of International Relations established</p>
            </div>
            
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
                alt="Asian expansion and regional office establishment"
                className="w-full h-48 object-cover rounded-xl mb-4"
                data-testid="img-expansion"
              />
              <h3 className="text-lg font-bold text-cordia-dark mb-2">Expanded in 2022</h3>
              <p className="text-gray-600 text-sm">K-Academic Diffusion Research Center launched to expand academic and cultural initiatives</p>
            </div>
            
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
                alt="Innovation platform and technology development"
                className="w-full h-48 object-cover rounded-xl mb-4"
                data-testid="img-flagship"
              />
              <h3 className="text-lg font-bold text-cordia-dark mb-2">New beginning in 2025</h3>
              <p className="text-gray-600 text-sm">Cordia founded as a global hub, connecting expertise in Korean Studies with business and cultural opportunities</p>
            </div>
            
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
                alt="Global client network and international partnerships"
                className="w-full h-48 object-cover rounded-xl mb-4"
                data-testid="img-milestone"
              />
              <h3 className="text-lg font-bold text-cordia-dark mb-2">Today & Beyond</h3>
              <p className="text-gray-600 text-sm">Growing into a trusted platform for global networks and cross-border collaboration</p>
            </div>
          </div>
          
          <div className="text-center">
            <a href="/initiatives" className="inline-block">
              <button className="bg-cordia-blue text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium" data-testid="button-go-to-initiatives">
                Go To Initiatives
              </button>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
