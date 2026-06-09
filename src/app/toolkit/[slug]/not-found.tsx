import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        background: "#0a0a0a",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1
        style={{
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontWeight: 700,
          fontSize: "2.2rem",
          marginBottom: "1.2rem",
        }}
      >
        NOT FOUND
      </h1>
      <p
        style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: "1.1rem",
          marginBottom: "2.5rem",
        }}
      >
        This toolkit page doesn&apos;t exist yet.
      </p>
      <Link
        href="/"
        style={{
          color: "#111",
          background: "#fff",
          padding: "0.7rem 2.2rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontWeight: 700,
          fontSize: "0.85rem",
          textDecoration: "none",
          borderRadius: 0,
        }}
      >
        Back to homepage
      </Link>
    </main>
  );
}
