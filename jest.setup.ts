import "@testing-library/jest-dom";

// Ensure portal target exists for tests
beforeAll(() => {
  const modalRoot = document.createElement("div");
  modalRoot.setAttribute("id", "modal-root");
  document.body.appendChild(modalRoot);
});
