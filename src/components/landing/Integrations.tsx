import { SiWhatsapp, SiFigma, SiSlack, SiGmail, SiDiscord } from "react-icons/si";
import { FaMicrosoft } from "react-icons/fa6";
// @ts-expect-error - LogoLoop is a JS module
import LogoLoop from "./LogoLoop";

const iconClass =
  "text-3xl text-slate-400 hover:text-[#6E56CF] transition-colors duration-300";

const integrationLogos = [
  { node: <span className={iconClass}><SiSlack /></span>, title: "Slack" },
  { node: <span className={iconClass}><FaMicrosoft /></span>, title: "Microsoft Teams" },
  { node: <span className={iconClass}><SiDiscord /></span>, title: "Discord" },
  { node: <span className={iconClass}><SiFigma /></span>, title: "Figma" },
  { node: <span className={iconClass}><SiWhatsapp /></span>, title: "WhatsApp" },
  { node: <span className={iconClass}><SiGmail /></span>, title: "Gmail" },
];

/**
 * A quiet, supporting "works with your tools" strip. NOT a standalone section —
 * it's rendered inside the ROI calculator section as a footer beat, so the logos
 * read as a reassurance ("nothing to reinstall") rather than their own block.
 */
export function IntegrationStrip() {
  return (
    <div>
      <p className="mb-6 text-center text-[13px] font-medium text-[#4b5563]">
        No new tab needed — connects to where your team already works.
      </p>

      {/* Tablet & up: single row. Slow marquee — with only a handful of logos a
          faster scroll makes the short loop obviously repeat, so keep it a
          gentle drift. */}
      <div className="hidden sm:block">
        <LogoLoop
          logos={integrationLogos}
          speed={14}
          direction="left"
          gap={80}
          logoHeight={28}
          fadeOut={true}
          pauseOnHover={true}
        />
      </div>

      {/* Mobile only: same marquee, single row — tighter gap and slightly
          smaller logos to suit the narrow screen. */}
      <div className="sm:hidden">
        <LogoLoop
          logos={integrationLogos}
          speed={22}
          direction="left"
          gap={56}
          logoHeight={26}
          fadeOut={true}
          pauseOnHover={true}
        />
      </div>
    </div>
  );
}

export default IntegrationStrip;
