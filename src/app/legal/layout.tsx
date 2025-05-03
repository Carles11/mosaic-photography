import React from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

const LegalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header />
      <main style={{ flex: 1, padding: "1rem" }}>{children}</main>
      <Footer />
    </div>
  );
};

export default LegalLayout;
