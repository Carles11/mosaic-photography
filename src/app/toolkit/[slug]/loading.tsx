import GallerySkeletonCard from "@/components/cards/GallerySkeletonCard";

export default function Loading() {
  return (
    <main
      style={{ background: "#0a0a0a", minHeight: "100vh", padding: "3rem 0" }}
    >
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            marginBottom: "2.5rem",
          }}
        >
          <div
            style={{
              width: 180,
              height: 48,
              background: "rgba(255,255,255,0.04)",
              borderRadius: 2,
              animation: "pulse 1.5s infinite alternate",
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                height: 38,
                width: 320,
                background: "rgba(255,255,255,0.08)",
                marginBottom: 12,
                borderRadius: 2,
                animation: "pulse 1.5s infinite alternate",
              }}
            />
            <div
              style={{
                height: 18,
                width: 220,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 2,
                animation: "pulse 1.5s infinite alternate",
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {[...Array(4)].map((_, i) => (
            <GallerySkeletonCard key={i} />
          ))}
        </div>
      </section>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </main>
  );
}
