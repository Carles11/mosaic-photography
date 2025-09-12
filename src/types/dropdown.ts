export type DropdownItem = {
  store: string;
  website: string;
  affiliate: boolean;
};

export type DropdownProps = {
  buttonText: string;
  items: DropdownItem[];
  onToggle?: (isOpen: boolean) => void;
};
