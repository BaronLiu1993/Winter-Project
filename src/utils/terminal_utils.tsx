import React, { useRef,useEffect, useState } from "react";

export const commands: string[] = ["help", "about-me", "experience", "project", "hobby"];
export const tab_counter: number = 0;

export const validateInput = (input: string, setInput: any): React.ReactNode => {
    input = input.trim();
    if (input === "") {
        return <span></span>;
    }
    if (input === "help") {
      const output: [string, string][] = [
        ["Type the red type in the terminal or mannually click it to launch the commands!", "red"], 
        ["\u00A0\u00A0\u00A0\u00A0about-me: learn about me!", "about-me"],
        ["\u00A0\u00A0\u00A0\u00A0experience: my software and leadership roles!", "experience"],
        ["\u00A0\u00A0\u00A0\u00A0project: mostly hackathon winners!", "project"],
        ["\u00A0\u00A0\u00A0\u00A0hobby: I have some sick hobbies!", "hobby"]
      ];
      return (
        <div>
          {output.map((line, index) => (
            <div key={index}>
              {formatOutput(line[0], line[1], setInput)}
            </div>
          ))}
        </div>
      );
    };
    return <span>{input + ": command not found"}</span>;
};

export const scrollToBottom = (terminalRef: React.RefObject<HTMLDivElement>): void => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

export const fillInput = (input: string): React.ReactNode => {
  return <span>{input}</span>;
};

export const tab = (input: string, tab_counter: number): string => {
  const parts = input.split(" ");
  const lastWord = parts[parts.length - 1];
  const potential = commands.filter((element) => element.startsWith(lastWord));
  if (tab_counter >= potential.length) {
    tab_counter = 0;
  }
  if (potential) {
    return parts.join(" ") + " " + potential[tab_counter];
  }
  return "Error: no matching command found";
}

export const formatOutput = (output: string, keyword: string, setInput: any) => {
  const parts = output.split(keyword);
  
  return (
    <div>
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 && (
            <span
              style={{ color: "red", cursor: "pointer" }}
              onClick={() => setInput(keyword)}
            >
              {keyword}
            </span>
          )}
        </span>
      ))}
    </div>
);
};