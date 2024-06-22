// BASE_URL = 'http://0.0.0.0:8000'
BASE_URL = "https://pinaka.pythonanywhere.com"

Vue.component(
    'cardrow', {
            template: 
            `<div class="gallery-img-item"><img :src="crow.photo" alt=""></div>`,
            props: ["crow"]
        } , 
    );

Vue.component(
    'newsrow' , {
        template : `
        <div class="cards news-card">
                        <h3 class="card-title">
                            {{nrow.title}}
                        </h3>
                        <p class="card-text">
                            {{nrow.details}}
                        </p>
                    </div>
        ` , 
        props : ['nrow']
    }
);



var index = new Vue({
    el: '#index-js-area',

    data: {
        card_list: [],
        ctg_list : [] , 
        news_list : [],
    },
    methods: {
        go_to_page(id) {
            window.location.href = 'details.html?id=' + id.toString();
        },
        load_data() {
            axios.all(
                [axios.get(BASE_URL+'/api/get-gallery-home/'),
                axios.get(BASE_URL+'/api/get-news/'),
                ])
                .then(axios.spread((data1, data2) => {

                    this.card_list = data1.data;
                    this.news_list = data2.data;
                    console.log(data2)
                    for (let i =0; i<data1.data.length; i++){

                        this.card_list[i]['photo'] = BASE_URL+ this.card_list[i]['image']

                    }
                //    this.card_list = data1.card_list
                }));
        },
    },

    mounted() {
      
    
        this.load_data();


    },

    
})