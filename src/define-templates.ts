import type { EmailComponent, TemplateDefinition, TemplateMap } from "./types";

export function defineTemplates<T extends TemplateMap>(templates: T): T {
  return templates;
}
