import { Fragment, type ReactNode } from 'react';
import licenseText from '../../LICENSE?raw';

function linkify(text: string, key: string): ReactNode {
  const parts = text.split(/(<https?:\/\/[^>]+>)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    const match = part.match(/^<(https?:\/\/[^>]+)>$/);
    if (match) {
      return (
        <a
          key={`${key}-link-${i}`}
          href={match[1]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          {match[1]}
        </a>
      );
    }
    return <Fragment key={`${key}-t-${i}`}>{part}</Fragment>;
  });
}

function isCenteredTitle(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 72) return false;
  const leading = line.length - line.trimStart().length;
  if (leading >= 12) return true;
  if (trimmed === trimmed.toUpperCase() && /^[A-Z0-9 .'-]+$/.test(trimmed)) {
    return trimmed.split(/\s+/).length <= 10;
  }
  return false;
}

function isSectionHeading(line: string): boolean {
  return /^\s+\d+\.\s+[A-Z]/.test(line);
}

function isListItem(line: string): boolean {
  return /^\s{4}[a-e]\)\s/.test(line);
}

function isCodeSampleStart(line: string): boolean {
  return line.trim().startsWith('<one line');
}

function reflowParagraph(lines: string[]): string {
  return lines
    .map((l) => l.trim())
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function parseLicense(text: string): ReactNode[] {
  const body = text.split(/\n={10,}\n/).slice(1).join('\n') || text;
  const nodes: ReactNode[] = [];
  let key = 0;

  const lines = body.split('\n');
  let i = 0;
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let codeBuffer: string[] = [];
  let inCodeBlock = false;

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const text = reflowParagraph(paragraphBuffer);
    paragraphBuffer = [];
    if (!text) return;
    nodes.push(
      <p key={`p-${key++}`} className="text-sm leading-7 text-foreground/75">
        {linkify(text, `p-${key}`)}
      </p>,
    );
  };

  const flushList = () => {
    if (listBuffer.length === 0) return;
    const items = [...listBuffer];
    listBuffer = [];
    nodes.push(
      <ol
        key={`ol-${key++}`}
        className="list-[lower-alpha] space-y-3 ps-6 text-sm leading-7 text-foreground/75 marker:font-semibold marker:text-primary"
      >
        {items.map((item, idx) => (
          <li key={idx}>{linkify(reflowParagraph([item.replace(/^\s{4}[a-e]\)\s*/, '')]), `li-${idx}`)}</li>
        ))}
      </ol>,
    );
  };

  const flushCodeBlock = () => {
    if (codeBuffer.length === 0) return;
    const sampleLines = codeBuffer.map((l) => l.trim()).filter(Boolean);
    codeBuffer = [];
    inCodeBlock = false;
    nodes.push(
      <blockquote
        key={`sample-${key++}`}
        className="space-y-2 rounded-2xl border border-border/40 bg-accent/25 px-4 py-4 text-sm leading-7 text-foreground/80"
      >
        {sampleLines.map((line, idx) => (
          <p key={idx}>{linkify(line, `sample-${idx}`)}</p>
        ))}
      </blockquote>,
    );
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      if (inCodeBlock) flushCodeBlock();
      i += 1;
      continue;
    }

    if (trimmed.startsWith('GNU AFFERO GENERAL PUBLIC LICENSE')) {
      flushParagraph();
      flushList();
      nodes.push(
        <h2 key={`h1-${key++}`} className="pt-2 text-center text-lg font-black uppercase tracking-wide text-foreground">
          {trimmed}
        </h2>,
      );
      i += 1;
      continue;
    }

    if (/^Version \d+/.test(trimmed)) {
      flushParagraph();
      nodes.push(
        <p key={`ver-${key++}`} className="text-center text-sm font-semibold text-foreground/55">
          {trimmed}
        </p>,
      );
      i += 1;
      continue;
    }

    if (isCenteredTitle(line) && !isSectionHeading(line)) {
      flushParagraph();
      flushList();
      if (inCodeBlock) flushCodeBlock();
      const Tag = trimmed.includes('GNU AFFERO') ? 'h2' : 'h3';
      nodes.push(
        <Tag
          key={`title-${key++}`}
          className={[
            'text-center font-bold text-foreground',
            Tag === 'h2' ? 'pt-4 text-base uppercase tracking-wide' : 'pt-3 text-sm uppercase tracking-[0.12em] text-foreground/85',
          ].join(' ')}
        >
          {trimmed}
        </Tag>,
      );
      i += 1;
      continue;
    }

    if (isSectionHeading(line)) {
      flushParagraph();
      flushList();
      if (inCodeBlock) flushCodeBlock();
      nodes.push(
        <h4 key={`sec-${key++}`} className="pt-4 text-sm font-bold text-foreground">
          {trimmed}
        </h4>,
      );
      i += 1;
      continue;
    }

    if (isListItem(line)) {
      flushParagraph();
      listBuffer.push(line);
      i += 1;
      continue;
    }

    if (listBuffer.length > 0 && line.startsWith('    ') && !isListItem(line)) {
      listBuffer[listBuffer.length - 1] += ' ' + trimmed;
      i += 1;
      continue;
    }

    if (isCodeSampleStart(line) || (inCodeBlock && line.startsWith('    '))) {
      flushParagraph();
      flushList();
      inCodeBlock = true;
      codeBuffer.push(line.trim());
      i += 1;
      continue;
    }

    if (inCodeBlock) {
      flushCodeBlock();
    }

    flushList();
    paragraphBuffer.push(line);
    i += 1;
  }

  flushParagraph();
  flushList();
  if (inCodeBlock) flushCodeBlock();

  return nodes;
}

const licenseNodes = parseLicense(licenseText);

export function LicenseDocument() {
  return (
    <article className="space-y-3" lang="en">
      {licenseNodes}
    </article>
  );
}
