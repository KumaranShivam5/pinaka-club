// blog.html — fetches all blog posts from Firestore and renders the card grid.
// Deliberately plain JS (not Vue) since this page also runs a separate Vue
// instance for the News & Events widget (see js/news-feed.js) and the two
// shouldn't fight over the same root element.

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('blog-grid');

    db.collection('blogs')
        .orderBy('createdAt', 'desc')
        .get()
        .then((snapshot) => {
            if (snapshot.empty) {
                grid.innerHTML = '<p class="blog-empty">No posts yet — check back soon.</p>';
                return;
            }

            grid.innerHTML = '';
            snapshot.forEach((doc) => {
                const b = doc.data();
                const excerpt = b.excerpt || stripMarkdownExcerpt(b.markdown, 140);
                const card = document.createElement('a');
                card.className = 'blog-card';
                card.href = 'blog-view.html?id=' + doc.id;
                card.innerHTML = `
                    ${b.coverImageUrl ? `<img class="blog-card-image" src="${b.coverImageUrl}" alt="">` : ''}
                    <div class="blog-card-body">
                        <span class="blog-card-date">${formatBlogDate(b.createdAt)}</span>
                        <h3>${escapeHtmlBlog(b.title || 'Untitled')}</h3>
                        <p>${escapeHtmlBlog(excerpt)}</p>
                        <span class="read-more">Read more →</span>
                    </div>
                `;
                grid.appendChild(card);
            });
        })
        .catch((err) => {
            console.error('Blogs failed to load:', err);
            grid.innerHTML = '<p class="blog-empty">Couldn\'t load posts right now.</p>';
        });
});

function escapeHtmlBlog(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
