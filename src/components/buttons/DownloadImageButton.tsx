import React, { forwardRef } from "react";

/**
 * Omit the native 'onError' so we can declare our own onError signature:
 * onError: (err: Error) => void
 */
type NativeButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onError"
>;

interface Props extends NativeButtonProps {
  url: string;
  filename?: string;
  onStart?: () => void;
  /**
   * Called when the download logic fails. Not the native DOM onError.
   */
  onError?: (err: Error) => void;
  children?: React.ReactNode;
}

/**
 * DownloadImageButton
 * - Accepts native button props (className, disabled, onMouseDown, etc.)
 * - Internally stops propagation on mouseDown to avoid toggling overlays
 * - Calls onStart/onError lifecycle callbacks
 */
const DownloadImageButton = forwardRef<HTMLButtonElement, Props>(
  (props, ref) => {
    const {
      url,
      filename,
      onStart,
      onError,
      children,
      onMouseDown: onMouseDownProp,
      onClick: onClickProp,
      ...rest
    } = props;

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent parent slide click from toggling overlays
      e.stopPropagation();
      onMouseDownProp?.(e);
    };

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent parent slide click from toggling overlays
      e.stopPropagation();
      onClickProp?.(e);

      try {
        onStart?.();

        if (!url) throw new Error("No download URL provided");

        // Simple download behavior: create an anchor to trigger download
        const link = document.createElement("a");
        link.href = url;

        if (filename) {
          link.download = filename;
        } else {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }

        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        onError?.(error);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        {...rest}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        {children}
      </button>
    );
  }
);

DownloadImageButton.displayName = "DownloadImageButton";

export default DownloadImageButton;
