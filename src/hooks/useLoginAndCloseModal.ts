import { useModal } from "@/context/modalContext/useModal";
import { useRouter } from "next/navigation";
import { getLoginRedirect } from "@/lib/auth/auth-guards";

export function useLoginAndCloseModal(onClose?: () => void) {
  const { close } = useModal();
  const router = useRouter();

  return () => {
    if (onClose) onClose();
    close();
    router.push(getLoginRedirect(window.location.pathname));
  };
}
