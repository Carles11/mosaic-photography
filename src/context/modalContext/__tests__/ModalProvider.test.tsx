/* eslint-disable */
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ModalProvider, ModalContext } from "../ModalProvider";

// We'll create a small test modal body component
function TestModalBody({ onClose, message }: any) {
  return (
    <div>
      <div data-testid="test-modal">{message || "hello"}</div>
      <button onClick={() => onClose?.("ok")}>close</button>
    </div>
  );
}

// Mock the registry to return our test component for keys
jest.mock("../modalRegistry", () => ({
  modalRegistry: {
    goPro: () => Promise.resolve({ default: TestModalBody }),
  },
}));

describe("ModalProvider", () => {
  test("open and close a modal via open()", async () => {
    render(
      <ModalProvider>
        <ModalContext.Consumer>
          {(ctx) => (
            <>
              <button
                onClick={() => {
                  ctx?.open("goPro");
                }}
              >
                open
              </button>
            </>
          )}
        </ModalContext.Consumer>
      </ModalProvider>,
    );

    fireEvent.click(screen.getByText("open"));

    await waitFor(() =>
      expect(screen.getByTestId("test-modal")).toBeInTheDocument(),
    );
    expect(screen.getByTestId("test-modal")).toHaveTextContent("hello");

    // click the close button inside modal
    fireEvent.click(screen.getByText("close"));

    await waitFor(() =>
      expect(screen.queryByTestId("test-modal")).not.toBeInTheDocument(),
    );
  });

  test("openAsync resolves with value from modal close", async () => {
    render(
      <ModalProvider>
        <ModalContext.Consumer>
          {(ctx) => (
            <>
              <button
                onClick={() => {
                  ctx
                    ?.openAsync("goPro")
                    .then((res) => {
                      const out = document.createElement("div");
                      out.textContent = String(res);
                      out.setAttribute("data-testid", "resolved");
                      document.body.appendChild(out);
                    })
                    .catch(() => {});
                }}
              >
                openAsync
              </button>
            </>
          )}
        </ModalContext.Consumer>
      </ModalProvider>,
    );

    fireEvent.click(screen.getByText("openAsync"));

    // modal should appear
    await waitFor(() =>
      expect(screen.getByTestId("test-modal")).toBeInTheDocument(),
    );

    // close the modal and pass a result
    fireEvent.click(screen.getByText("close"));

    await waitFor(() =>
      expect(screen.getByTestId("resolved")).toBeInTheDocument(),
    );
    expect(screen.getByTestId("resolved")).toHaveTextContent("ok");
  });
});
