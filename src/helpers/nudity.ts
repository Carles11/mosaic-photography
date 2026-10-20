// images_resize.nudity holds "nude" / "not-nude"; contributor_images.nudity is a boolean.
export const isNudeValue = (n: unknown) =>
  n === true || ["true", "nude"].includes(String(n).toLowerCase().trim());
