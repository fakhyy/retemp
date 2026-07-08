import type { ComponentProps, ComponentType } from "react";

export type EmailComponent = ComponentType<any>;

export type TemplateDefinition<T extends EmailComponent = EmailComponent> = {
  component: T;
  subject: string | ((props: ComponentProps<T>) => string);
};

export type TemplateMap = {
  [K: string]: TemplateDefinition<any>;
};

// Resend Compatible
export interface EmailProvider {
  emails: {
    send: (...args: any[]) => Promise<any>;
  };
}

export interface CreateEmailOptions<TTemplates extends TemplateMap> {
  provider: EmailProvider;
  defaults?: {
    from: string;
    replyTo?: string;
  };
  templates: TTemplates;
}
