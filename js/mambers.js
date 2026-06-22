// Shooters page (members.html / members-backup.html).
// Used to pull from the pythonanywhere REST API; now reads the athlete
// roster straight from Firestore, kept up to date via the admin dashboard.

Vue.component('cardrow', {
    template: `
<div class="card card-fs">
    <img :src="crow.photoUrl" alt="Athlete photo">
    <div class="card-content details1">
        <h2><i class="fas fa-user"></i> {{crow.firstName}} {{crow.lastName}}</h2>
        <p><i class="fas fa-birthday-cake"></i> Age: {{crow.age}}</p>
        <p><i class="fas fa-user-tag"></i> Category: {{crow.category}}</p>
    </div>
    <div class="details2">
        <h4><i class="fas fa-trophy"></i> Achievements:</h4>
        <ul>
            <li><i class="fas fa-award"></i> {{crow.achievement}}</li>
        </ul>
    </div>
</div>
`,
    props: ["crow"],
});

var index = new Vue({
    el: '#index-js-area',

    data: {
        card_list: [],
        news_list: [],
    },
    methods: {
        load_athletes() {
            db.collection('athletes')
                .orderBy('createdAt', 'desc')
                .get()
                .then((snapshot) => {
                    this.card_list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                })
                .catch((err) => {
                    console.error('Athletes failed to load:', err);
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
    },

    mounted() {
        this.load_athletes();
        this.load_news();
    },
})
