import { describe, expect, it, mock } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChatInput } from "../chat-input";

describe("ChatInput", () => {
  it("renders textarea and send button", () => {
    render(<ChatInput onSend={() => {}} disabled={false} />);
    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send message" })).toBeInTheDocument();
  });

  it("disables textarea and button when disabled", () => {
    render(<ChatInput onSend={() => {}} disabled={true} />);
    expect(screen.getByPlaceholderText("Type a message...")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });

  it("calls onSend and clears input on submit", async () => {
    const onSend = mock(() => {});
    const user = userEvent.setup();

    render(<ChatInput onSend={onSend} disabled={false} />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    await user.type(textarea, "Hello world");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(onSend).toHaveBeenCalledWith("Hello world");
    expect(textarea).toHaveValue("");
  });

  it("sends on Enter key", async () => {
    const onSend = mock(() => {});
    const user = userEvent.setup();

    render(<ChatInput onSend={onSend} disabled={false} />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    await user.type(textarea, "Hello{enter}");

    expect(onSend).toHaveBeenCalledWith("Hello");
  });

  it("does not send on Shift+Enter", async () => {
    const onSend = mock(() => {});
    const user = userEvent.setup();

    render(<ChatInput onSend={onSend} disabled={false} />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    await user.type(textarea, "Hello{shift>}{enter}{/shift}");

    expect(onSend).not.toHaveBeenCalled();
  });

  it("does not send empty messages", async () => {
    const onSend = mock(() => {});
    const user = userEvent.setup();

    render(<ChatInput onSend={onSend} disabled={false} />);

    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(onSend).not.toHaveBeenCalled();
  });

  it("shows character count indicator", () => {
    render(<ChatInput onSend={() => {}} disabled={false} />);
    expect(screen.getByLabelText("Character count")).toBeInTheDocument();
    expect(screen.getByLabelText("Character count")).toHaveTextContent("0 / 4000");
  });

  it("updates character count as user types", async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={() => {}} disabled={false} />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    await user.type(textarea, "Hello");

    expect(screen.getByLabelText("Character count")).toHaveTextContent("5 / 4000");
  });

  it("disables send button when over 4000 characters", () => {
    const onSend = mock(() => {});
    render(<ChatInput onSend={onSend} disabled={false} />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    // Use fireEvent for large input to avoid userEvent timeout
    fireEvent.change(textarea, { target: { value: "a".repeat(4001) } });

    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });

  it("clears character count after sending", async () => {
    const onSend = mock(() => {});
    const user = userEvent.setup();
    render(<ChatInput onSend={onSend} disabled={false} />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    await user.type(textarea, "Hello");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(screen.getByLabelText("Character count")).toHaveTextContent("0 / 4000");
  });
});
