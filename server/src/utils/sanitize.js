import sanitizeHtml from 'sanitize-html';

/** Strip every HTML tag from user-supplied single-line text. */
export const cleanText = (v) =>
  typeof v === 'string'
    ? sanitizeHtml(v, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim()
    : v;

/** Multi-line plain text (keeps newlines). */
export const cleanMultiline = (v) =>
  typeof v === 'string'
    ? sanitizeHtml(v, { allowedTags: [], allowedAttributes: {} }).replace(/[ \t]+/g, ' ').trim()
    : v;

/** Rich content authored by admins (blog etc.): conservative allowlist. */
export const cleanRichHtml = (v) =>
  sanitizeHtml(String(v ?? ''), {
    allowedTags: ['h2', 'h3', 'h4', 'p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'blockquote', 'img', 'figure', 'figcaption', 'hr'],
    allowedAttributes: { a: ['href', 'title', 'rel', 'target'], img: ['src', 'alt', 'width', 'height', 'loading'] },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }) },
  });
