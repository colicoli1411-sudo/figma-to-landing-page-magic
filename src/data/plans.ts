/**
 * Single source of truth for the pricing plans — shared by the Pricing section
 * (MagicBento cards) and the /signup checkout page so prices/features never drift.
 */
export type PlanId = "personal" | "pro" | "enterprise";

export type Plan = {
  id: PlanId;
  /** MagicBento card background. */
  color: string;
  /** Small uppercase badge on the card. */
  label: string;
  /** Plan name. */
  title: string;
  /** Display price, e.g. "$0" / "$12". */
  price: string;
  /** Unit/period line under the price on signup, e.g. "Free forever" / "per user / month". */
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  ctaStyle: "outline" | "solid-purple";
};

export const PLANS: Plan[] = [
  {
    id: "personal",
    color: "#14101d",
    label: "Individual",
    title: "Personal",
    price: "$3",
    period: "per month",
    description: "Per month. For solo deep work.",
    features: ["Up to 15 focus sessions/week", "Basic app muting", "Standard analytics"],
    ctaText: "Start free trial",
    ctaHref: "/signup?plan=personal",
    ctaStyle: "outline",
  },
  {
    id: "pro",
    color: "#14101d",
    label: "Most Popular",
    title: "Pro",
    price: "$12",
    period: "per user / month",
    description: "Per user/month. For growing teams.",
    features: [
      "Up to 15 team members",
      "Unlimited focus sessions",
      "Team Focus Visibility",
      "Advanced integrations",
    ],
    ctaText: "Start free trial",
    ctaHref: "/signup?plan=pro",
    ctaStyle: "solid-purple",
  },
  {
    id: "enterprise",
    color: "#14101d",
    label: "Scale",
    title: "Enterprise",
    price: "$39",
    period: "per user / month, billed annually",
    description: "Per user/month, billed annually. For large organizations.",
    features: [
      "Unlimited members & workspaces",
      "Custom API access",
      "SAML SSO",
      "Dedicated success manager",
    ],
    ctaText: "Contact sales",
    ctaHref: "#contact",
    ctaStyle: "outline",
  },
];

export const getPlan = (id: PlanId): Plan =>
  PLANS.find((p) => p.id === id) ?? PLANS[0];
