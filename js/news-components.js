// Shared 'newsrow' Vue component — used on the homepage, course, facilities,
// contact and Shooters pages so the News & Events card layout only needs to
// be defined (and kept in sync) in one place.

function formatNewsDate(dateStr) {
    // Expects 'YYYY-MM-DD' (from an <input type="date">). Avoids going
    // through the JS Date/timezone machinery so the displayed day never
    // shifts by one for users west of UTC.
    if (!dateStr) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const mi = parseInt(m, 10) - 1;
    if (mi < 0 || mi > 11) return dateStr;
    return `${parseInt(d, 10)} ${months[mi]} ${y}`;
}

Vue.component('newsrow', {
    template: `
    <div class="cards news-card">
        <img v-if="nrow.imageUrl" class="news-card-image" :src="nrow.imageUrl" alt="">
        <span v-if="nrow.eventDate" class="news-card-date">{{ formattedDate }}</span>
        <h3 class="card-title">
            {{ nrow.title }}
        </h3>
        <p class="card-text">
            {{ nrow.details }}
        </p>
    </div>
    `,
    props: ['nrow'],
    computed: {
        formattedDate() {
            return formatNewsDate(this.nrow.eventDate);
        },
    },
});
