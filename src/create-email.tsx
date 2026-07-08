import type { ComponentProps } from "react";
import type { CreateEmailOptions, TemplateMap } from "./types";

export function createEmail<TTemplates extends TemplateMap>({
  provider,
  defaults,
  templates,
}: CreateEmailOptions<TTemplates>) {
  async function send<T extends keyof TTemplates>(
    template: T,
    options: {
      to: string | string[];
      props: ComponentProps<TTemplates[T]["component"]>;

      subject?: string;
      from?: string;
      replyTo?: string;
    },
  ) {
    const definition = templates[template]!;

    const from = options.from ?? defaults?.from;
    if (!from) {
      throw new Error(
        "No `from` address configured. Provide one in defaults or per send().",
      );
    }

    const replyTo = options.replyTo ?? defaults?.replyTo;

    const subject =
      options.subject ??
      (typeof definition.subject === "function"
        ? definition.subject(options.props)
        : definition.subject);

    const Component = definition.component;

    return provider.emails.send({
      from,
      to: options.to,
      replyTo,
      subject,
      react: <Component {...options.props} />,
    });
  }

  return {
    send,
  };
}
