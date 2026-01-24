//TODO: to be deleted once LogoCloud is fully functional
import React from 'react';
import { BrandLogos } from './BrandLogos';

interface LogoCardProps {
  logo: React.ReactNode;
}

const LogoCard: React.FC<LogoCardProps> = ({ logo }) => (
  <div className="flex items-center justify-center px-8 py-6 mx-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 min-w-[200px] h-24 hover:bg-zinc-800/80 transition-colors duration-300">
    {logo}
  </div>
);

export const LogoCloudModel: React.FC = () => {
  const row1 = [
    <BrandLogos.Walmart />,
    <BrandLogos.Microsoft />,
    <BrandLogos.Airbnb />,
    <BrandLogos.FedEx />,
    <BrandLogos.Google />,
    <BrandLogos.Amazon />,
    <BrandLogos.HubSpot />
  ];

  const row2 = [
    <BrandLogos.Huawei />,
    <BrandLogos.BookMyShow />,
    <BrandLogos.Adobe />,
    <BrandLogos.Shopify />,
    <BrandLogos.Ola />,
    <BrandLogos.Huawei />,
    <BrandLogos.BookMyShow />
  ];

  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center mb-16">
        <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800/30 px-4 py-1 text-xs font-medium text-zinc-300 mb-6">
          Nos Partenaires
        </span>
        {/*        
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Nos Partenaires
        </h2>
        */}
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Ils nous accompagnent et soutiennent notre démarche artistique.
        </p>
      </div>

      <div className="relative marquee-container">
        {/* Row 1 */}
        <div className="flex overflow-hidden mb-6">
          <div className="animate-marquee">
            {row1.map((logo, idx) => <LogoCard key={`r1-1-${idx}`} logo={logo} />)}
            {row1.map((logo, idx) => <LogoCard key={`r1-2-${idx}`} logo={logo} />)}
          </div>
        </div>

        {/* Row 2 */}
        {/*<div className="flex overflow-hidden">
          <div className="animate-marquee-reverse">
            {row2.map((logo, idx) => <LogoCard key={`r2-1-${idx}`} logo={logo} />)}
            {row2.map((logo, idx) => <LogoCard key={`r2-2-${idx}`} logo={logo} />)}
          </div>
        </div>*/}
      </div>
    </section>
  );
};
