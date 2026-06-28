// BASE_URL = 'http://0.0.0.0:8000'
BASE_URL = "https://pinaka.pythonanywhere.com"
// NOTE: the homepage gallery strip still uses the old pythonanywhere REST
// API (/api/get-gallery-home/) — that wasn't part of this round of the
// backend migration. News & Events now comes from Firestore (see below).

Vue.component(
    'cardrow', {
            template:
            `<div class="gallery-img-item"><img :src="crow.photo" alt="Photo from PINAKA Rifle Shooting Club"></div>`,
            props: ["crow"]
        },
    );

Vue.component('blogteaser', {
    template: `
    <a class="blog-card" :href="'blog-view.html?id=' + post.id">
        <img v-if="post.coverImageUrl" class="blog-card-image" :src="post.coverImageUrl" :alt="post.title || 'Blog post cover image'">
        <div class="blog-card-body">
            <span class="blog-card-date">{{ formattedDate }}</span>
            <h3>{{ post.title || 'Untitled' }}</h3>
            <p>{{ excerpt }}</p>
            <span class="read-more">Read more →</span>
        </div>
    </a>
    `,
    props: ['post'],
    computed: {
        excerpt() {
            return this.post.excerpt || stripMarkdownExcerpt(this.post.markdown, 110);
        },
        formattedDate() {
            return formatBlogDate(this.post.createdAt);
        },
    },
});



var index = new Vue({
    el: '#index-js-area',

    data: {
        card_list: [],
        news_list: [],
        blog_list: [],
    },
    methods: {
        go_to_page(id) {
            window.location.href = 'details.html?id=' + id.toString();
        },
        load_gallery() {
            axios.get(BASE_URL + '/api/get-gallery-home/')
                .then((res) => {
                    this.card_list = res.data;
                    for (let i = 0; i < this.card_list.length; i++) {
                        this.card_list[i]['photo'] = BASE_URL + this.card_list[i]['image'];
                    }
                })
                .catch((err) => {
                    console.error('Gallery failed to load:', err);
                });
        },
        load_news() {
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
        load_blogs() {
            db.collection('blogs')
                .orderBy('createdAt', 'desc')
                .limit(3)
                .get()
                .then((snapshot) => {
                    this.blog_list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                })
                .catch((err) => {
                    console.error('Blog teasers failed to load:', err);
                });
        },
    },

    mounted() {
        this.load_gallery();
        this.load_news();
        this.load_blogs();
    },


})
