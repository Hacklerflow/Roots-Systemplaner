import { useState, useEffect, useMemo } from 'react';

export default function Manual() {
  const [manualContent, setManualContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadManual();
  }, []);

  const loadManual = async () => {
    try {
      setLoading(true);
      const response = await fetch('/BENUTZERHANDBUCH_USER.md');
      if (!response.ok) {
        throw new Error('Manual konnte nicht geladen werden');
      }
      const text = await response.text();
      setManualContent(text);
      setError('');
    } catch (err) {
      console.error('Fehler beim Laden des Manuals:', err);
      setError('Fehler beim Laden des Benutzerhandbuchs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Simple Markdown to HTML converter
  const renderMarkdown = (markdown) => {
    if (!markdown) return '';

    let html = markdown;

    // Escape HTML
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks (```...```)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="code-block"><code>${code.trim()}</code></pre>`;
    });

    // Inline code (`...`)
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Headers
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Bold (**text**)
    html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');

    // Italic (*text* or _text_)
    html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Links [text](url)
    // Anchor links (starting with #) should not open in new tab
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, (match, text, url) => {
      if (url.startsWith('#')) {
        return `<a href="${url}" class="anchor-link">${text}</a>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });

    // Unordered lists
    html = html.replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Ordered lists
    html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr />');

    // Paragraphs (lines separated by blank lines)
    const lines = html.split('\n');
    let inList = false;
    let inCodeBlock = false;
    let result = [];
    let paragraph = [];

    for (let line of lines) {
      if (line.includes('<pre class="code-block">')) {
        inCodeBlock = true;
      }
      if (line.includes('</pre>')) {
        inCodeBlock = false;
      }

      if (line.trim().startsWith('<ul>') || line.trim().startsWith('<ol>')) {
        inList = true;
      }
      if (line.trim().startsWith('</ul>') || line.trim().startsWith('</ol>')) {
        inList = false;
      }

      if (line.trim() === '' && !inList && !inCodeBlock) {
        if (paragraph.length > 0) {
          const p = paragraph.join('\n').trim();
          if (p && !p.match(/^<(h[1-6]|hr|pre|ul|ol)/)) {
            result.push(`<p>${p}</p>`);
          } else {
            result.push(p);
          }
          paragraph = [];
        }
      } else {
        paragraph.push(line);
      }
    }

    if (paragraph.length > 0) {
      const p = paragraph.join('\n').trim();
      if (p && !p.match(/^<(h[1-6]|hr|pre|ul|ol)/)) {
        result.push(`<p>${p}</p>`);
      } else {
        result.push(p);
      }
    }

    return result.join('\n');
  };

  // Filter and highlight content based on search term
  const displayContent = useMemo(() => {
    if (!searchTerm.trim()) {
      return renderMarkdown(manualContent);
    }

    const lines = manualContent.split('\n');
    const searchLower = searchTerm.toLowerCase();
    const matchingLines = [];
    const contextLines = 2; // Show 2 lines before and after match

    // Find all matching lines with context
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(searchLower)) {
        const start = Math.max(0, index - contextLines);
        const end = Math.min(lines.length, index + contextLines + 1);

        for (let i = start; i < end; i++) {
          if (!matchingLines.includes(i)) {
            matchingLines.push(i);
          }
        }
      }
    });

    // Sort line numbers
    matchingLines.sort((a, b) => a - b);

    // Build filtered content
    let filteredContent = [];
    let lastIndex = -1;

    matchingLines.forEach((lineIndex) => {
      if (lineIndex > lastIndex + 1) {
        filteredContent.push('\n---\n');
      }
      filteredContent.push(lines[lineIndex]);
      lastIndex = lineIndex;
    });

    if (filteredContent.length === 0) {
      return '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">Keine Ergebnisse gefunden</p>';
    }

    let html = renderMarkdown(filteredContent.join('\n'));

    // Highlight search term
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    html = html.replace(regex, '<mark>$1</mark>');

    return html;
  }, [manualContent, searchTerm]);

  // Count matches
  const matchCount = useMemo(() => {
    if (!searchTerm.trim() || !manualContent) return 0;
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = manualContent.match(regex);
    return matches ? matches.length : 0;
  }, [manualContent, searchTerm]);

  // Handle anchor link clicks
  const handleContentClick = (e) => {
    // Check if clicked element is an anchor link
    const target = e.target;
    if (target.tagName === 'A' && target.classList.contains('anchor-link')) {
      e.preventDefault();
      const href = target.getAttribute('href');
      if (href && href.startsWith('#')) {
        const id = href.substring(1);
        // Find the element with matching id
        // Since headers are generated from markdown, we need to find by text content
        const headings = document.querySelectorAll('.manual-content h1, .manual-content h2, .manual-content h3, .manual-content h4, .manual-content h5, .manual-content h6');
        for (const heading of headings) {
          // Create id from heading text (lowercase, replace spaces with hyphens)
          const headingId = heading.textContent
            .toLowerCase()
            .replace(/[^a-z0-9äöüß\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

          if (headingId === id) {
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Add some offset for sticky header
            window.scrollBy(0, -100);
            break;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'var(--bg-primary)',
        minHeight: 'calc(100vh - 140px)',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
          Lade Benutzerhandbuch...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'var(--bg-primary)',
        minHeight: 'calc(100vh - 140px)',
        padding: '24px',
      }}>
        <div style={{
          background: 'var(--error)',
          color: 'white',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
        }}>
          {error}
        </div>
        <button
          onClick={loadManual}
          style={{
            padding: '12px 24px',
            background: 'var(--accent)',
            color: 'var(--bg-primary)',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px',
          }}
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-primary)',
      minHeight: 'calc(100vh - 140px)',
      padding: '24px',
    }}>
      {/* Header with search */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'var(--bg-primary)',
        zIndex: 10,
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '24px',
      }}>
        <h2 style={{ margin: 0, marginBottom: '16px', fontSize: '24px' }}>
          Benutzerhandbuch
        </h2>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Durchsuche das Handbuch..."
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              fontSize: '14px',
            }}
          />
          {searchTerm && (
            <>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
              }}>
                {matchCount} {matchCount === 1 ? 'Treffer' : 'Treffer'}
              </div>
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  padding: '12px 16px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                }}
              >
                Zurücksetzen
              </button>
            </>
          )}
        </div>
      </div>

      {/* Manual content */}
      <div
        className="manual-content"
        style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}
        onClick={handleContentClick}
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />

      <style>{`
        .manual-content h1 {
          font-size: 32px;
          margin: 32px 0 16px 0;
          color: var(--text-primary);
          border-bottom: 2px solid var(--accent);
          padding-bottom: 8px;
        }
        .manual-content h2 {
          font-size: 26px;
          margin: 28px 0 14px 0;
          color: var(--text-primary);
        }
        .manual-content h3 {
          font-size: 22px;
          margin: 24px 0 12px 0;
          color: var(--text-primary);
        }
        .manual-content h4 {
          font-size: 18px;
          margin: 20px 0 10px 0;
          color: var(--text-primary);
        }
        .manual-content h5 {
          font-size: 16px;
          margin: 18px 0 8px 0;
          color: var(--text-primary);
        }
        .manual-content h6 {
          font-size: 14px;
          margin: 16px 0 8px 0;
          color: var(--text-secondary);
        }
        .manual-content p {
          line-height: 1.7;
          margin: 12px 0;
          color: var(--text-primary);
        }
        .manual-content ul, .manual-content ol {
          margin: 12px 0;
          padding-left: 24px;
          color: var(--text-primary);
        }
        .manual-content li {
          line-height: 1.6;
          margin: 6px 0;
        }
        .manual-content .code-block {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 16px;
          overflow-x: auto;
          margin: 16px 0;
        }
        .manual-content .code-block code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-primary);
        }
        .manual-content .inline-code {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          color: var(--accent);
        }
        .manual-content a {
          color: var(--accent);
          text-decoration: none;
          cursor: pointer;
        }
        .manual-content a:hover {
          text-decoration: underline;
        }
        .manual-content a.anchor-link {
          color: var(--accent);
        }
        .manual-content hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 24px 0;
        }
        .manual-content mark {
          background: var(--accent);
          color: var(--bg-primary);
          padding: 2px 4px;
          border-radius: 3px;
          font-weight: 600;
        }
        .manual-content strong {
          font-weight: 600;
          color: var(--text-primary);
        }
        .manual-content em {
          font-style: italic;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
