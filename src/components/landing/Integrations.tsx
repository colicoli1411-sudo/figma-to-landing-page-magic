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

// Second mobile row starts from a different logo (rotated by half) so the two
// rows never show the same icon at the same column.
const rotatedLogos = [...integrationLogos.slice(3), ...integrationLogos.slice(0, 3)];

/**
 * A quiet, supporting "works with your tools" strip. NOT a standalone section —
 * it's rendered inside the ROI calculator section as a footer beat, so the logos
 * read as a reassurance ("nothing to reinstall") rather than their own block.
 */
export function IntegrationStrip() {
  return (
    <div>
      <p className="mb-6 text-center text-[13px] font-medium text-[#6b7280]">
        No new tab needed — connects to where your team already works.
      </p>

      {/* Tablet & up: single row */}
      <div className="hidden sm:block">
        <LogoLoop
          logos={integrationLogos}
          speed={26}
          direction="left"
          gap={80}
          logoHeight={28}
          fadeOut={true}
          pauseOnHover={true}
        />
      </div>

      {/* Mobile only: two rows with opposite start points + opposite directions,
          so each row shows different logos in parallel on the narrow screen. */}
      <div className="flex flex-col gap-5 sm:hidden">
        <LogoLoop
          logos={integrationLogos}
          speed={22}
          direction="left"
          gap={56}
          logoHeight={26}
          fadeOut={true}
          pauseOnHover={true}
        />
        <LogoLoop
          logos={rotatedLogos}
          speed={22}
          direction="right"
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
