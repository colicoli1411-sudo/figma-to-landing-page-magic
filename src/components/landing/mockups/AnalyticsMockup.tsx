export function AnalyticsMockup() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <video
        src="/videos/analytics-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
