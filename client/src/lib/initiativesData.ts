export interface InitiativeDefault {
  slug: string;
  title: string;
  label: string;
  category: string;
  description: string;
  imageUrl: string;
  content: string;
}

export const INITIATIVE_SLUGS = [
  "k-food",
  "k-beauty",
  "startups",
  "vc-matching",
  "internships",
  "forums",
] as const;

export type InitiativeSlug = typeof INITIATIVE_SLUGS[number];

export const INITIATIVE_DEFAULTS: Record<string, InitiativeDefault> = {
  "k-food": {
    slug: "k-food",
    title: "K-Food Initiative",
    label: "K-Food",
    category: "Food & Beverage",
    description: "Showcasing Korean cuisine as a cultural brand with strategic market insights.",
    imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1936&auto=format&fit=crop",
    content:
      "The K-Food Initiative bridges innovative Korean food brands with international markets. We partner with producers, restaurants, and cultural institutions to position Korean cuisine as a premium global lifestyle category, providing market intelligence, distribution partnerships, and brand storytelling support.",
  },
  "k-beauty": {
    slug: "k-beauty",
    title: "K-Beauty Initiative",
    label: "K-Beauty",
    category: "Beauty & Cosmetics",
    description: "Positioning K-Beauty as a global lifestyle movement, not just a product.",
    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200",
    content:
      "Our K-Beauty Initiative supports Korean beauty brands and creators in building durable global presence. From regulatory navigation to retail and digital launches, we help brands tell authentic stories that resonate with international audiences.",
  },
  "startups": {
    slug: "startups",
    title: "Startups Program",
    label: "Startups",
    category: "Technology & Innovation",
    description: "Connecting diaspora-led startups with Korea's expertise and global expansion networks.",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200",
    content:
      "The Startups Program connects diaspora founders with Korea's deep technical expertise, manufacturing capabilities, and capital markets. We facilitate partnerships, market entry strategies, and provide a launchpad for cross-border ventures.",
  },
  "vc-matching": {
    slug: "vc-matching",
    title: "VC Matching",
    label: "VC Matching",
    category: "Investment & Finance",
    description: "Bridging Korean ventures with top-tier global investors through trusted partnerships.",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200",
    content:
      "VC Matching connects high-potential Korean and Korean-diaspora ventures with global investors. We curate introductions, facilitate due diligence, and structure cross-border investment opportunities backed by long-standing relationships.",
  },
  "internships": {
    slug: "internships",
    title: "Internships Program",
    label: "Internships",
    category: "Education & Development",
    description: "Empowering next-generation leaders through cross-border career experiences.",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200",
    content:
      "Our Internships Program places emerging diaspora talent into Korean and global organizations, building cross-cultural fluency and career pathways. We design programs in collaboration with universities, corporates, and cultural institutions.",
  },
  "forums": {
    slug: "forums",
    title: "Global Summit",
    label: "Knowledge Forums",
    category: "Knowledge & Collaboration",
    description: "A global stage where Korean Studies meets international collaboration.",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200",
    content:
      "Our Global Summit and Knowledge Forums convene scholars, executives, and policymakers to advance dialogue on Korean society, business, and culture, producing actionable insights and lasting partnerships.",
  },
};
