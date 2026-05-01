"use client";

import { useCallback } from "react";
import { useModal } from "@/context/modalContext/useModal";
import type {
  DownloadOption,
  DownloadOptionsImageInput,
} from "@/utils/getAvailableDownloadOptionsForImage";

type UseDownloadOptionsLauncherProps = {
  image: DownloadOptionsImageInput;
  onDownloadOption: (option: DownloadOption) => void | Promise<void>;
  title?: string;
};

export function useDownloadOptionsLauncher({
  image,
  onDownloadOption,
  title,
}: UseDownloadOptionsLauncherProps) {
  const { open } = useModal();

  return useCallback(() => {
    open("downloadOptions", {
      image,
      onClose: () => {},
      onDownloadOption,
      title,
    });
  }, [open, image, onDownloadOption, title]);
}

export default useDownloadOptionsLauncher;
