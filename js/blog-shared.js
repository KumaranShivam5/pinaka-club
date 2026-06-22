// Shared across blog.html, blog-view.html and the homepage blog teaser.

function stripMarkdownExcerpt(markdown, maxLen) {
    if (!markdown) return '';
    let text = markdown
        .replace(/!\[.*?\]\(.*?\)/g, '')      // images
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')   // links -> link text
        .replace(/[#>*_`~-]/g, '')            // common md punctuation
        .replace(/\n+/g, ' ')
        .trim();
    maxLen = maxLen || 140;
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen).trim() + '…';
}

function formatBlogDate(ts) {
    if (!ts || !ts.toDate) return '';
    return ts.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
