export type DropdownItem = {
  store: string;
  website: string;
  affiliate: boolean;
  description: string;
};

export type DropdownProps = {
  buttonText: string;
  items: DropdownItem[];
  onToggle?: (isOpen: boolean) => void;
};
