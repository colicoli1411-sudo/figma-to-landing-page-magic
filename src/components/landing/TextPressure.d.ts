import type { ComponentType } from "react";

interface TextPressureProps {
  text?: string;
  fontFamily?: string;
  fontUrl?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  className?: string;
  minFontSize?: number;
  /** Touch devices: scrolling drives the wave across the title; rests static. */
  scrollDrive?: boolean;
}

declare const TextPressure: ComponentType<TextPressureProps>;
export default TextPressure;
