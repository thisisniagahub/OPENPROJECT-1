"use client";

import { useState, type KeyboardEvent } from "react";

interface CommandTerminalProps {
  onSubmit: (command: string) => void;
  disabled?: boolean;
}

export default function CommandTerminal({
  onSubmit,
  disabled = false,
}: CommandTerminalProps) {
  const [command, setCommand] = useState("");

  const handleSubmit = () => {
    const trimmed = command.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setCommand("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleSubmit();
  };

  return (
    <div className="pixel-terminal">
      <span className="pixel-terminal__prompt">NIAGABOT&gt;</span>
      <input
        className="pixel-terminal__input"
        value={command}
        onChange={(event) => setCommand(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "CONNECT GATEWAY TO SEND COMMANDS" : "ENTER COMMAND"}
        disabled={disabled}
      />
      <span className="pixel-terminal__cursor" aria-hidden="true" />
    </div>
  );
}
