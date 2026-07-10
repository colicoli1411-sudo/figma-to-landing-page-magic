// @ts-expect-error - JSX component without types
import MagicBento from './MagicBento.jsx';
import { SplitText } from './SplitText';
import { PLANS } from '@/data/plans';

export const Pricing = () => {
  return (
    <section id="pricing" className="bg-[#14101d] relative overflow-hidden py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 text-center mb-14 md:mb-20">
        <SplitText
          as="h2"
          reveal
          className="text-4xl md:text-5xl font-bold tracking-tight text-white"
        >
          Simple, transparent{" "}
          <span className="italic font-serif font-normal text-violet-400">
            pricing
          </span>
          .
        </SplitText>
      </div>

      <SplitText as="div" reveal revealDelay={0.15}>
        <MagicBento
          cards={PLANS}
          enableTilt={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableParticles={true}
          glowColor="110, 86, 207"
        />
      </SplitText>
    </section>
  );
};

export default Pricing;
