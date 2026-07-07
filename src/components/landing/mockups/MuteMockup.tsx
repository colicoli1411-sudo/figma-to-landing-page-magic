export function MuteMockup() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <video
        src="/videos/INTER.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
