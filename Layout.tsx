@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  
  --color-surface: #ffffff;
  --color-ink: #0f172a;
  --color-accent: #2563eb;
  --color-line: #e2e8f0;
}

:root {
    --bg: #f8fafc;
    --surface: #ffffff;
    --ink: #0f172a;
    --accent: #2563eb;
    --accent-glow: rgba(37, 99, 235, 0.1);
    --line: #e2e8f0;
}

body {
    background-color: var(--bg);
    color: var(--ink);
    font-family: var(--font-sans);
}
