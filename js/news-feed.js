// Lightweight News & Events widget for pages that only need to show news
// (course.html, facilities.html, contact.html). The homepage has its own
// Vue instance in index.js that also handles the gallery strip.
// (the 'newsrow' component itself lives in js/news-components.js)

new Vue({
    el: '#news-widget',
    data: {
        news_list: [],
    },
    mounted() {
        db.collection('news')
            .orderBy('createdAt', 'desc')
            .limit(12)
            .get()
            .then((snapshot) => {
                this.news_list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            })
            .catch((err) => {
                console.error('News failed to load:', err);
            });
    },
});
