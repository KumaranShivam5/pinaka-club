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
            document.getElementById('page-title').innerText = (b.title || 'Blog') + ' | PINAKA Rifle Shooting Club';

            const renderedBody = marked.parse(b.markdown || '');

            article.innerHTML = `
                ${b.coverImageUrl ? `<img class="blog-cover" src="${b.coverImageUrl}" alt="">` : ''}
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
