// BAE_URL = 'http://0.0.0.0:8000'
BASE_URL = "https://pinaka.pythonanywhere.com"

Vue.component('cardrow', {
    template: `
<div class="card card-fs"> 
    <div class="hr"></div>
    <img :src="crow.photo" alt="Member 1">
    <div class="card-content details1">
        <h2><i class="fas fa-user"></i> {{crow.first_name}} {{crow.last_name}}</h2>
        <p><i class="fas fa-birthday-cake"></i> Age: {{crow.age}}</p>
        <p><i class="fas fa-user-tag"></i> Category: {{crow.ctg}}</p>
        
    </div>
    <div class="details2">
        <h4><i class="fas fa-trophy"></i> Achievements:</h4>
        <ul>
            <li><i class="fas fa-award"></i> {{crow.achievement}}</li>
            
            <!-- Add more achievements as needed -->
        </ul>
    </div>
    <div class="card-action">
        <button class="card-action-btn"  @click="$emit('go')">
            Know More
        </button>
    </div>
</div>

`,
    props: ["crow"]
});




var index = new Vue({
    el: '#index-js-area',

    data: {
        card_list: [],
        ctg_list : [] , 
    },
    methods: {
        go_to_page(id) {
            window.location.href = 'details.html?id=' + id.toString();
        },
        load_data() {
            axios.all(
                [axios.get(BASE_URL+'/api/member-list/'),
                axios.get(BASE_URL+'/api/get-all-ctg/'),
                ])
                .then(axios.spread((data1, data2,) => {
                    console.log("data1", data1, "data2", data2);
                    this.ctg_list = data2.data;
                    this.card_list = data1.data;
                    for (let i =0; i<data1.data.length; i++){
                        console.log('inside for loop')
                        console.log(data1.data[i]['photo'])
                        this.card_list[i]['photo'] = BASE_URL+ this.card_list[i]['photo']
                        // console.log('ctg list' , this.ctg_list[0].name)
                        // console.log('card ctg list' , this.card_list[i].playing_in[0])
                        this.card_list[i]['ctg'] = this.ctg_list[parseInt(this.card_list[i].playing_in[0])-1].name
                        // console.log(data1.data[i]['ctg'])
                    }
                //    this.card_list = data1.card_list
                }));
        },
    },

    mounted() {
      
    
        this.load_data();


    },

    
})