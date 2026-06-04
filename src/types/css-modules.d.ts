declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "yet-another-react-lightbox/styles.css" {
  const content: string;
  export default content;
}
