document.addEventListener('DOMContentLoaded', () => {
    const article = document.getElementById('blog-article');
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        article.innerHTML = '<p>No post specified. <a href="blog.html">Back to all posts</a>.</p>';
        return;
    }

    db.collection('blogs').doc(id).get()
        .then((doc) => {
            if (!doc.exists) {
                article.innerHTML = '<p>This post couldn\'t be found. <a href="blog.html">Back to all posts</a>.</p>';
                return;
            }

            const b = doc.data();
            const postUrl = 'https://www.pinakarifleclub.com/blog-view.html?id=' + doc.id;
            const postTitle = (b.title || 'Blog') + ' | PINAKA Rifle Shooting Club';
            const postDescription = b.excerpt || stripMarkdownExcerpt(b.markdown, 160);
            const postImage = b.coverImageUrl || 'https://www.pinakarifleclub.com/images/gallery/g3.jpg';

            document.getElementById('page-title').innerText = postTitle;
            document.getElementById('meta-description').setAttribute('content', postDescription);
            document.getElementById('canonical-link').setAttribute('href', postUrl);
            document.getElementById('og-title').setAttribute('content', postTitle);
            document.getElementById('og-description').setAttribute('content', postDescription);
            document.getElementById('og-url').setAttribute('content', postUrl);
            document.getElementById('og-image').setAttribute('content', postImage);
            document.getElementById('twitter-title').setAttribute('content', postTitle);
            document.getElementById('twitter-description').setAttribute('content', postDescription);
            document.getElementById('twitter-image').setAttribute('content', postImage);

            document.getElementById('article-jsonld').textContent = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": b.title || 'Untitled',
                "image": postImage ? [postImage] : undefined,
                "datePublished": b.createdAt && b.createdAt.toDate ? b.createdAt.toDate().toISOString() : undefined,
                "dateModified": b.updatedAt && b.updatedAt.toDate ? b.updatedAt.toDate().toISOString() : undefined,
                "author": { "@type": "Person", "name": "Saurabh Kumar" },
                "publisher": {
                    "@type": "Organization",
                    "name": "PINAKA Rifle Shooting Club",
                    "logo": { "@type": "ImageObject", "url": "https://www.pinakarifleclub.com/images/logo/large-logo-dark.svg" }
                },
                "mainEntityOfPage": postUrl,
                "description": postDescription,
            });

            const renderedBody = marked.parse(b.markdown || '');

            article.innerHTML = `
                ${b.coverImageUrl ? `<img class="blog-cover" src="${b.coverImageUrl}" alt="${escapeHtmlBlogView(b.title || 'Blog post cover image')}">` : ''}
                <span class="blog-date">${formatBlogDate(b.createdAt)}</span>
                <h1>${escapeHtmlBlogView(b.title || 'Untitled')}</h1>
                <div class="blog-content">${renderedBody}</div>
            `;
        })
        .catch((err) => {
            console.error('Blog post failed to load:', err);
            article.innerHTML = '<p>Something went wrong loading this post. <a href="blog.html">Back to all posts</a>.</p>';
        });
});

function escapeHtmlBlogView(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
