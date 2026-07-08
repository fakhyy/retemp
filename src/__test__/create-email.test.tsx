import { test, expect, mock } from "bun:test";
import { isValidElement, type ComponentProps } from "react";
import { createEmail, defineTemplates } from "../index";

function Greeting({ name }: { name: string }) {
  return <div>Hello {name}</div>;
}

function Empty(_props: Record<string, never>) {
  return null;
}

const mockSend = mock(() => Promise.resolve({ id: "email_123" }));
const mockProvider = {
  emails: { send: mockSend },
};

test("defineTemplates returns the same object", () => {
  const templates = {
    welcome: { component: Greeting, subject: "Welcome" },
  };

  expect(defineTemplates(templates)).toBe(templates);
});

test("createEmail returns an object with a send method", () => {
  const email = createEmail({
    provider: mockProvider,
    templates: defineTemplates({
      test: { component: Empty, subject: "Test" },
    }),
  });

  expect(email).toHaveProperty("send");
  expect(typeof email.send).toBe("function");
});

test("send uses defaults.from", async () => {
  mockSend.mockClear();

  const email = createEmail({
    provider: mockProvider,
    defaults: { from: "Default <default@test.com>" },
    templates: defineTemplates({
      test: { component: Empty, subject: "Hello" },
    }),
  });

  await email.send("test", { to: "user@test.com", props: {} });

  expect(mockSend).toHaveBeenCalledTimes(1);
  expect(mockSend.mock.calls[0][0].from).toBe("Default <default@test.com>");
});

test("send uses per-call from over defaults.from", async () => {
  mockSend.mockClear();

  const email = createEmail({
    provider: mockProvider,
    defaults: { from: "Default <default@test.com>" },
    templates: defineTemplates({
      test: { component: Empty, subject: "Hello" },
    }),
  });

  await email.send("test", {
    to: "user@test.com",
    from: "Override <override@test.com>",
    props: {},
  });

  expect(mockSend.mock.calls[0][0].from).toBe(
    "Override <override@test.com>",
  );
});

test("send throws when no from is configured", async () => {
  const email = createEmail({
    provider: mockProvider,
    templates: defineTemplates({
      test: { component: Empty, subject: "Hello" },
    }),
  });

  await expect(
    email.send("test", { to: "user@test.com", props: {} }),
  ).rejects.toThrow(
    "No `from` address configured",
  );
});

test("send uses static subject from template definition", async () => {
  mockSend.mockClear();

  const email = createEmail({
    provider: mockProvider,
    defaults: { from: "Test <test@test.com>" },
    templates: defineTemplates({
      test: { component: Empty, subject: "Static Subject" },
    }),
  });

  await email.send("test", { to: "user@test.com", props: {} });

  expect(mockSend.mock.calls[0][0].subject).toBe("Static Subject");
});

test("send uses dynamic subject function", async () => {
  mockSend.mockClear();

  const email = createEmail({
    provider: mockProvider,
    defaults: { from: "Test <test@test.com>" },
    templates: defineTemplates({
      greeting: {
        component: Greeting,
        subject: (props) => `Hello, ${props.name}!`,
      },
    }),
  });

  await email.send("greeting", {
    to: "user@test.com",
    props: { name: "Alice" },
  });

  expect(mockSend.mock.calls[0][0].subject).toBe("Hello, Alice!");
});

test("send uses per-call subject over template subject", async () => {
  mockSend.mockClear();

  const email = createEmail({
    provider: mockProvider,
    defaults: { from: "Test <test@test.com>" },
    templates: defineTemplates({
      test: { component: Empty, subject: "Template Subject" },
    }),
  });

  await email.send("test", {
    to: "user@test.com",
    subject: "Override Subject",
    props: {},
  });

  expect(mockSend.mock.calls[0][0].subject).toBe("Override Subject");
});

test("send resolves replyTo from defaults", async () => {
  mockSend.mockClear();

  const email = createEmail({
    provider: mockProvider,
    defaults: { from: "Test <test@test.com>", replyTo: "reply@test.com" },
    templates: defineTemplates({
      test: { component: Empty, subject: "Hello" },
    }),
  });

  await email.send("test", { to: "user@test.com", props: {} });

  expect(mockSend.mock.calls[0][0].replyTo).toBe("reply@test.com");
});

test("send resolves replyTo from per-call option", async () => {
  mockSend.mockClear();

  const email = createEmail({
    provider: mockProvider,
    defaults: { from: "Test <test@test.com>", replyTo: "default@test.com" },
    templates: defineTemplates({
      test: { component: Empty, subject: "Hello" },
    }),
  });

  await email.send("test", {
    to: "user@test.com",
    replyTo: "override@test.com",
    props: {},
  });

  expect(mockSend.mock.calls[0][0].replyTo).toBe("override@test.com");
});

test("send passes to, from, subject, replyTo to provider", async () => {
  mockSend.mockClear();

  const email = createEmail({
    provider: mockProvider,
    defaults: { from: "Default <default@test.com>", replyTo: "reply@test.com" },
    templates: defineTemplates({
      test: { component: Empty, subject: "Subject" },
    }),
  });

  await email.send("test", { to: "user@test.com", props: {} });

  expect(mockSend.mock.calls[0][0].to).toBe("user@test.com");
  expect(mockSend.mock.calls[0][0].from).toBe("Default <default@test.com>");
  expect(mockSend.mock.calls[0][0].subject).toBe("Subject");
  expect(mockSend.mock.calls[0][0].replyTo).toBe("reply@test.com");
});

test("send supports multiple recipients", async () => {
  mockSend.mockClear();

  const email = createEmail({
    provider: mockProvider,
    defaults: { from: "Test <test@test.com>" },
    templates: defineTemplates({
      test: { component: Empty, subject: "Hello" },
    }),
  });

  await email.send("test", {
    to: ["alice@test.com", "bob@test.com"],
    props: {},
  });

  expect(mockSend.mock.calls[0][0].to).toEqual([
    "alice@test.com",
    "bob@test.com",
  ]);
});

test("send passes a valid React element in the react field", async () => {
  mockSend.mockClear();

  const email = createEmail({
    provider: mockProvider,
    defaults: { from: "Test <test@test.com>" },
    templates: defineTemplates({
      greeting: {
        component: Greeting,
        subject: "Hello",
      },
    }),
  });

  await email.send("greeting", {
    to: "user@test.com",
    props: { name: "Alice" },
  });

  const reactField = mockSend.mock.calls[0][0].react;
  expect(isValidElement(reactField)).toBe(true);
  expect(reactField.props).toEqual({ name: "Alice" });
});
