// A small fake filesystem representing DominionDev, walkable with real
// shell commands. This is content, not chrome — every file is something
// true about him, not filler.

export interface FSFile {
  type: "file";
  content: string;
}

export interface FSDir {
  type: "dir";
  children: Record<string, FSNode>;
}

export type FSNode = FSFile | FSDir;

export const filesystem: FSDir = {
  type: "dir",
  children: {
    "about.txt": {
      type: "file",
      content:
        "DominionDev. Solo developer. Lives in the terminal, literally and by choice.\nBuilds systems programming, design tooling, colour science, animation.",
    },
    "philosophy.txt": {
      type: "file",
      content:
        "Stylishness isn't something you look at. It's how I say exactly what I feel.\nA limit is not a stop. It's a challenge.",
    },
    work: {
      type: "dir",
      children: {
        "leraniode.txt": {
          type: "file",
          content:
            "Leraniode — the company I own. Two pillars: Illygen (intelligence), Wondertone (beauty).\nHas its own site coming. For now: github.com/leraniode. Try `open leraniode`.",
        },
        "finite.txt": {
          type: "file",
          content:
            "Finite — programmable SVG library. Personal project. github.com/dominionthedev/finite",
        },
        "runbox.txt": {
          type: "file",
          content:
            "RunBox — execution backend. Built because a 4GB MacBook Air on macOS 11\ncouldn't run Docker. So I built around the limit instead.",
        },
        "mushmellow.txt": {
          type: "file",
          content:
            "Mushmellow v3 — deterministic local orchestration runtime, built on RunBox.",
        },
      },
    },
    "contact.txt": {
      type: "file",
      content: "github.com/dominionthedev — that's the real door. Open it.",
    },
  },
};

export interface TerminalState {
  path: string[];
}

function resolveDir(state: TerminalState): FSDir | null {
  let node: FSNode = filesystem;
  for (const seg of state.path) {
    if (
      node.type !== "dir" ||
      !node.children[seg] ||
      node.children[seg].type !== "dir"
    ) {
      return null;
    }
    node = node.children[seg];
  }
  return node.type === "dir" ? node : null;
}

function pwd(state: TerminalState): string {
  return "/" + state.path.join("/");
}

const IN_VOICE_ERRORS = [
  "not found: {cmd} — try 'help'",
  "{cmd}? doesn't exist here. 'help' does.",
  "no. try 'help' instead.",
];

function randomError(cmd: string): string {
  const template =
    IN_VOICE_ERRORS[Math.floor(Math.random() * IN_VOICE_ERRORS.length)];
  return template.replace("{cmd}", cmd);
}

export function runCommand(
  raw: string,
  state: TerminalState,
): { output: string; clear?: boolean; open?: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { output: "" };
  const [cmd, ...args] = trimmed.split(/\s+/);
  const arg = args.join(" ");

  switch (cmd) {
    case "help":
      return {
        output: [
          "commands:",
          "  ls              list what's here",
          "  cd <dir>        move (cd .. to go back, cd / for root)",
          "  cat <file>      read a file",
          "  pwd             where you are",
          "  whoami          who this site belongs to",
          "  open leraniode  the actual company site",
          "  clear           clear the screen",
        ].join("\n"),
      };

    case "whoami":
      return { output: "dominiondev — you're in his terminal, not yours." };

    case "pwd":
      return { output: pwd(state) };

    case "ls": {
      const dir = resolveDir(state);
      if (!dir) return { output: randomError(cmd) };
      const entries = Object.entries(dir.children).map(([name, node]) =>
        node.type === "dir" ? `${name}/` : name,
      );
      return { output: entries.join("  ") || "(empty)" };
    }

    case "cd": {
      if (!arg || arg === "/") {
        state.path = [];
        return { output: "" };
      }
      if (arg === "..") {
        state.path = state.path.slice(0, -1);
        return { output: "" };
      }
      const dir = resolveDir(state);
      const target = dir?.children[arg.replace(/\/$/, "")];
      if (!dir || !target || target.type !== "dir") {
        return { output: `cd: no such directory: ${arg}` };
      }
      state.path = [...state.path, arg.replace(/\/$/, "")];
      return { output: "" };
    }

    case "cat": {
      if (!arg) return { output: "cat: read what? give me a filename." };
      const dir = resolveDir(state);
      const target = dir?.children[arg];
      if (!dir || !target) return { output: `cat: no such file: ${arg}` };
      if (target.type === "dir")
        return { output: `cat: ${arg} is a directory` };
      return { output: target.content };
    }

    case "open": {
      if (arg === "leraniode") {
        return {
          output: "opening github.com/leraniode in a new tab_",
          open: "leraniode",
        };
      }
      return { output: randomError(`open ${arg}`) };
    }

    case "sudo":
      return { output: "nice try. this isn't your terminal." };

    case "rm":
      if (args.join(" ").includes("-rf")) {
        return { output: "cute. nothing to destroy — it's all read-only." };
      }
      return { output: randomError(cmd) };

    case "clear":
      return { output: "", clear: true };

    default:
      return { output: randomError(cmd) };
  }
}
