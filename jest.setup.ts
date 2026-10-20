import "@testing-library/jest-dom";

// Ensure portal target exists for tests
beforeAll(() => {
  if (typeof document === "undefined") return; // node-env tests (API routes)
  const modalRoot = document.createElement("div");
  modalRoot.setAttribute("id", "modal-root");
  document.body.appendChild(modalRoot);
});
