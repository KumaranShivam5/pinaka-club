// Lightweight News & Events widget for pages that only need to show news
// (course.html, facilities.html, contact.html). The homepage has its own
// Vue instance in index.js that also handles the gallery strip.

Vue.component('newsrow', {
    template: `
    <div class="cards news-card">
        <h3 class="card-title">
            {{nrow.title}}
        </h3>
        <p class="card-text">
            {{nrow.details}}
        </p>
    </div>
    `,
    props: ['nrow']
});

new Vue({
    el: '#index-js-area',
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
