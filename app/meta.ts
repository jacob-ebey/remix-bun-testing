import type { HtmlMetaDescriptor } from "@remix-run/server-runtime";

const defaultTitle = "Remix Bun.js";
const titleTemplate = `${defaultTitle} | %s`;
const defaultDescription = "A example of Remix running on Bun.js.";

export function create({
  title,
  description,
  ...rest
}: HtmlMetaDescriptor = {}): HtmlMetaDescriptor {
  return {
    ...rest,
    title: title ? titleTemplate.replace("%s", title) : defaultTitle,
    description: description || defaultDescription,
    charset: "utf-8",
    viewport: "width=device-width,initial-scale=1",
  };
}
