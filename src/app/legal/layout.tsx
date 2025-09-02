const LegalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <main style={{ flex: 1, padding: "1rem" }}>{children}</main>
    </div>
  );
};

export default LegalLayout;
