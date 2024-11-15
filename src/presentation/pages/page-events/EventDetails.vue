<template>
	<layout-variant-two :show-loading-screen="loading">
        <template v-slot:header>
			<div class="slide-down">
				<div class="header-con">
					<div class="back-btn" @click="goBack()">
                        <span class="material-icons">arrow_back</span>
                    </div>
					<h1 class="heading-5 center"></h1>
					<div class="more right">
                        <span class="material-icons">more_vert</span>
                    </div>
				</div>
			</div>
		</template>
		<template v-slot:body>
            <div ref="container" class="container" v-if="!isEmpty(eventDetails)">
                <div class="event-img" :class="{'no-image': isEmpty(eventDetails.banners), 'custom-carousel': eventDetails.banners.length > 1}">
                    <img v-if="eventDetails.banners.length == 1" :src="getImage(eventDetails.banners[0].id)"/>
                    <event-carousel 
                        v-if="eventDetails.banners.length > 1"
                        :banners="eventDetails.banners" 
                    />
                </div>
                <div class="event-content">
                    <div class="event-title">{{ eventDetails.name }}</div>
                    <div class="event-button lite" v-if="isEmpty(eventDetails.sessions)">Coming Soon</div>
                    <div class="event-button" v-else @click="booking()">Book Tickets</div>
                    
                    <div class="event-label">
                        <!-- <span class="event-note note-bold">{{ category }}</span> -->
                        <div class="event-footnote">{{ eventPlace }}</div>
                    </div>
                    <div class="rating-legend" v-if="totalRatings > 0">
                        <div class="rating-star">
                            <span class="rating-star-full material-icons">star</span>
                        </div>
                        <div class="rating-points">{{ ratingPoints }}</div>
                        <div class="rating-total-reviewers">from {{ reviewsList.length }} reviews</div>
                    </div>
                    <div class="event-label bold">About this Event</div>
                    <div class="event-note" v-if="eventDetails.description">
                        <div v-html="eventDesc"></div>
                        <div class="see-more" v-if="displayMore" @click="readMore()">See {{ showMore ? 'more' : 'less' }}</div>
                    </div>
                    <div class="event-note" v-if="!eventDetails.description">No description..</div>
                </div>
            </div>
            <div class="sessions-con" v-if="!isEmpty(eventDetails)">
                <div class="segment__container" v-if="!isEmpty(eventDetails.sessions)">
                    <div class="segment__title">{{ availableSegments }} Sessions Available</div>
                    <div class="segment__tabs" :class="{'active': sessionIndex == i, 'centered': segments.length <= 3}" >
                        <div class="segment__tab" 
                            :class="{'active': sessionIndex == i}" 
                            v-for="(sess, i) in segments" 
                            @click="sessionIndex = i"
                            :key="i">
                            <span>{{ sess.name }}</span>
                        </div>
                    </div>
                    <div class="segment__content" 
                        :class="{'active': sessionIndex == i}"
                        v-for="(sess, i) in segments" 
                        :key="i">
                        <div class="segment__wrapper" v-for="(item, x) in sess.items" :key="x">
                            <div class="label__info">
                                <div class="label__info__part">
                                    <div class="label__date">{{ eventDate(item.startDate, item.endDate) }}</div>
                                    <div class="label__time">{{ eventTimes(item) }}</div>
                                    <div class="label__time">{{ eventDurations(item) }}</div>
                                </div>
                                <div class="label__info__part right">
                                    <span class="price">{{ currency(item.price) }}</span>
                                    <span class="spots" v-if="item.spotLeft > 0">{{ item.spotLeft }} spots left</span>
                                    <span class="sold-out" v-if="item.spotLeft <= 0">Sold Out</span>
                                    <span class="book-btn" @click="bookSession(item)" v-if="item.spotLeft > 0">Book</span>
                                </div>
                            </div>
                            <div class="label__location">
                                <span class="label__icon material-icons-outlined">place</span>
                                <span>{{ item.name }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="event-label-more bold" v-if="!isEmpty(eventDetails.moreEvents)">More Like This</div>
                <event-card ref="eventCard" v-if="!isEmpty(eventDetails.moreEvents)" :events="eventDetails.moreEvents" :selectedCategory="category"></event-card>

                <div class="rating-reviews" v-if="isLoggedIn">
                    <h3 class="reviews-headline">Rating & Reviews of {{ eventDetails.name }}</h3>
                    <div class="reviews-summary">
                        <div class="summary-rating">
                            <div class="summary-point">
                                <div class="point-rate">{{ ratingPoints }}</div>
                                <div class="point-max">/5</div>
                            </div>
                            <div class="rating-stars">
                                <div class="rating-star" 
                                    v-for="(rs,rx) in ratingStars" :key="rx"
                                >
                                    <div 
                                        class="rating-star-half"
                                        :class="{'selected': rs.rated > 0}"
                                    ><span class="star-odd material-icons">star</span></div>
                                    <div 
                                        class="rating-star-half"
                                        :class="{'selected': rs.rated > 1}"
                                    ><span class="star-even material-icons">star</span></div>
                                </div>
                            </div>
                            <div class="total-ratings">{{ reviewsList.length }} Ratings</div>
                            <div class="review-button" @click="clickReview">Write a review</div>
                        </div>
                        <div class="summary-charts">
                            <div class="chart-item" v-for="chart in reviewCharts" :key="chart.stars">
                                <div class="chart-stars">
                                    <span class="chart-star material-icons" 
                                        v-for="n in 5" :key="n"
                                        :class="{'fill': n <= chart.stars}"
                                    >star</span>
                                </div>
                                <div class="chart-bar">
                                    <div class="chart-bar-wrapper">
                                        <div class="chart-bar-fill" :style="{'width': chart.percentage + '%'}"></div>
                                    </div>
                                    <span class="chart-label">{{ chart.totalReviewed }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="reviews-list" v-if="reviewsList.length > 0">
                        <div class="btn-filter" @click="toggleFilter">
                            <span class="material-icons">swap_vert</span>
                            <span class="sort-label">Sort by:</span>
                            <span class="sort-by">{{ sortedByDisplay }}</span>
                        </div>
                        <div class="sort-list" v-if="showFilter">
                            <div class="sort-item" 
                                v-for="sort in sortedList" 
                                :key="sort.key"
                                @click="sortByClicked(sort)"
                            >
                                {{ sort.name }}
                            </div>
                        </div>
                        <div class="review-card" v-for="review in reviewsList" :key="review.id">
                            <div class="reviewer">
                                <div class="reviewer-icon material-icons">person</div>
                                <span class="reviewer-name">{{ review.customer.firstName }} {{ review.customer.lastName }}</span>
                            </div>
                            <div class="review-title-wrapper">
                                <div class="rating-stars">
                                    <span class="rating-star material-icons" 
                                        v-for="(star, ix) in review.stars" :key="ix"
                                    >
                                        <div 
                                            class="rating-star-half"
                                            :class="{'selected': star.rated > 0}"
                                        ><span class="star-odd material-icons">star</span></div>
                                        <div 
                                            class="rating-star-half"
                                            :class="{'selected': star.rated > 1}"
                                        ><span class="star-even material-icons">star</span></div>
                                    </span>
                                </div>
                                <div class="review-title">{{ review.title }}</div>
                            </div>
                            <div class="review-date">Reviewed on {{ review.createdDate }}</div>
                            <div class="review-attachments" v-if="review.image1 || review.image2 || review.image3">
                                <img v-if="review.image1" 
                                    :src="getImage(review.image1, true)" 
                                    :alt="review.image1"
                                    @click="zoomImage(review.image1)"
                                />
                                <img v-if="review.image2" 
                                    :src="getImage(review.image2, true)" 
                                    :alt="review.image2"
                                    @click="zoomImage(review.image2)"
                                />
                                <img v-if="review.image3" 
                                    :src="getImage(review.image3, true)" 
                                    :alt="review.image3"
                                    @click="zoomImage(review.image3)"
                                />
                            </div>
                            <div class="review-content" v-html="review.content"></div>
                        </div>
                    </div>
                </div>
            </div>
            <base-modal :show="writeReview">
                <template v-slot:header>
                    <div class="modal-header header-flex justify-between">
                        <h3>Create Review</h3>
                        <span class="close-btn material-icons-outlined" @click="closeReview()">close</span>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body">
                        <div class="review-form">
                            <div class="review-field">
                                <div class="label">Overall rating</div>
                                <div class="input rating-stars">
                                    <div class="rating-star" 
                                        v-for="n in 5" 
                                        :key="n"
                                    >
                                        <div 
                                            class="rating-star-half"
                                            :class="{'selected': ((n * 2) -1) <= reviewFields.rating}"
                                            @click="reviewFields.rating = ((n * 2) -1)"
                                        ><span class="star-odd material-icons">star</span></div>
                                        <div 
                                            class="rating-star-half"
                                            :class="{'selected': (n * 2) <= reviewFields.rating}"
                                            @click="reviewFields.rating = n * 2"
                                        ><span class="star-even material-icons">star</span></div>
                                    </div>
                                </div>
                            </div>
                            <div class="review-field">
                                <div class="label">
                                    Add photo(s)<br/>
                                    <small class="sublabel">Reviews with images are more helpful than text alone.</small>
                                </div>
                                <div class="input images">
                                    <div class="input-file" v-if="allowMoreUpload">
                                        <span class="file-icon material-icons">add</span>
                                        <input ref="imageFile" type="file" accept="image/*" @change="uploadImage($event)"/>
                                    </div>
                                    <div class="input-file static" v-for="(img,ix) in reviewFields.images" :key="img.file">
                                        <span v-if="!img.loading" class="file-remove material-icons" @click="removeImage(ix)">close</span>
                                        <span v-if="img.loading" class="loading-text">Uploading...</span>
                                        <img v-else :src="getImage(img.file, true)" :alt="img.file">
                                    </div>
                                </div>
                            </div>
                            <div class="review-field">
                                <div class="label">Add a headline</div>
                                <div class="input">
                                    <input type="text" v-model="reviewFields.headline">
                                </div>
                            </div>
                            <div class="review-field">
                                <div class="label">Add written review</div>
                                <div class="input">
                                    <textarea v-model="reviewFields.content"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <template v-slot:footer>
                    <div class="modal-footer">
                        <div class="review-actions">
                            <div class="review-action lite" @click="closeReview()">Cancel</div>
                            <div class="review-action" @click="submitReview">Submit</div>
                        </div>
                    </div>
                </template>
            </base-modal>

            <base-modal :show="clickedImage">
                <template v-slot:header>
                    <div class="modal-header header-flex justify-between">
                        <h3>&nbsp;</h3>
                        <span class="close-btn material-icons-outlined" @click="skipZoom()">close</span>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body ratio-square">
                        <div v-if="clickedImage.loading">Loading...</div>
                        <img :src="clickedImage.url" :alt="clickedImage.url">
                    </div>
                </template>
            </base-modal>
		</template>
	</layout-variant-two>
</template>

<script>
import { eventService } from "@/bloc/services";
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import { getEunoiaCustomerDetails } from "@/connector/customerConnector";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';
import EventCard from './components/EventCard.vue';
import EventCarousel from './components/EventCarousel.vue';

export default {
	name: "EventDetails",
	mixins: [utility],
	components: {
        LayoutVariantTwo,
        EventCard,
        EventCarousel
	},
	data() {
		return {
			loading: false,
            category: "",
            eventName: null,
            eventId: null,
            sessionId: null,
            eventDetails: null,
            showMore: false,
            eventsMore: [],
            sessionIndex: 0,
            loadingReview: false,
            reviewsList: [],
            reviewCharts: [],
            totalRatings: 0,
            ratingStars: [],
            ratingPoints: 0,
            writeReview: false,
            reviewFields: {
                rating: 0,
                images: [],
                headline: "",
                content: "",
            },
            uploadingImage: false,
            submittingReview: false,
            customer: null,
            sortBy: {
                recent: {
                    clicked: true,
                    selected: true,
                    name: "Recent",
                },
                highToLow: {
                    clicked: false,
                    selected: false,
                    name: "High to Low",
                },
                LowToHigh: {
                    clicked: false,
                    selected: false,
                    name: "Low to High",
                },
            },
            showFilter: false,
            clickedImage: null,
		};
	},
	watch: {},
    computed: {
        allowMoreUpload() {
            return this.reviewFields.images.length < 3;
        },
        sortedByDisplay(){
            let theOne = null;
            for(var key in this.sortBy){
                if(this.sortBy[key].clicked) theOne = this.sortBy[key];
            }
            return theOne.name;
        },
        sortedList(){
            let items = [];
            for(var key in this.sortBy){
                let it = this.sortBy[key];
                it.key = key;
                items.push(it);
            }
            return items;
        },
        eventPlace(){
            let address = this.eventDetails.location;
            if(!address) return "";
            return address.string;
        },
        eventStore(){
            return this.eventDetails.parent.name;
        },
        eventDesc(){
            if(this.showMore && !isEmpty(this.eventDetails.description)) {
                let desc = this.eventDetails.description.substring(0,200);
                let lastString = desc.substring(desc.length - 1);
                if(desc != this.eventDetails.description){
                    if(lastString !== " "){
                        let lastIdx = this.eventDetails.description.substring(200).indexOf(" ");
                        if(lastIdx != -1) desc = this.eventDetails.description.substring(0, 200 + lastIdx);
                    }
                    desc += "...";
                }
                return desc.split('\r\n').join('<br/>');
            }
            return this.eventDetails.description.split('\r\n').join('<br/>');
        },
        filterEventsMore(){
            if(isEmpty(this.eventsMore)) return [];
            let events = [];
            this.eventsMore.forEach((event) => {
                if(event.store.id != this.storeId && event.name == this.eventName) {
                    if(events.length < 3) events.push(event);
                }
            });
            this.eventsMore.forEach((event) => {
                if(event.store.id == this.storeId && event.name != this.eventName) {
                    if(events.length < 3) events.push(event);
                }
            });
            this.eventsMore.forEach((event) => {
                if(event.store.id != this.storeId && event.name != this.eventName) {
                    if(events.length < 3) events.push(event);
                }
            });
            return events;
        },
        availableSegments(){
            let count = 0;
            if(isEmpty(this.segments)) return 0;
            this.segments.forEach((it) =>{
                if(isEmpty(it.items)) return;
                it.items.forEach(() => {
                    count += 1;
                });
            });
            return count;
        },
        segments(){
            if(isEmpty(this.eventDetails)) return [];
            if(isEmpty(this.eventDetails.sessions)) return [];
            let arr = [];
            let segs = [];
            let momente = moment();
            let today = moment.tz(momente, "Asia/Singapore").format('x');
            let todayYear = moment.tz(momente, "Asia/Singapore").format('YYYY');
            this.eventDetails.sessions.forEach((it) =>{
                if(isEmpty(it.items)) return;
                it.items.forEach((item) => {
                    let month = moment.tz(item.startDate,'Asia/Singapore').format("MMMM");
                    let year = moment.tz(item.startDate,'Asia/Singapore').format("YYYY");
                    if(year != todayYear) month = moment.tz(item.startDate,'Asia/Singapore').format("MMMM YYYY");
                    if(item.endDate > today) {
                        if(isEmpty(segs[month])) segs[month] = {name: month, items: []}
                        /*
                        let loc = false;
                        let one = segs[month].items.find((o) => {
                            if(o.location && item.location) loc = o.location.string == item.location.string;
                            return o.startDate == item.startDate && o.endDate == item.endDate && loc;
                        });
                        if(one) return;
                        */
                        segs[month].items.push(item);
                        segs[month].items.sort((a,b) => {return a.startDate - b.startDate });
                    }
                });
            });
            for(var m in segs){
                arr.push(segs[m]);
            }
            return arr;
        },
        availableMoreSegments(){
            let count = 0;
            if(isEmpty(this.moreSegments)) return 0;
            this.moreSegments.forEach((it) =>{
                if(isEmpty(it.items)) return;
                it.items.forEach(() => {
                    count += 1;
                });
            });
            return count;
        },
        moreSegments(){
            if(isEmpty(this.eventDetails)) return [];
            let events = this.eventDetails.moreEvents;
            if(isEmpty(events)) return [];
            let arr = [];
            let segs = [];
            let momente = moment();
            let today = moment.tz(momente, "Asia/Singapore").format('x');
            let todayYear = moment.tz(momente, "Asia/Singapore").format('YYYY');
            
            events.forEach((event) => {
                let sessions = event.sessions.filter((sess) => {
                    return sess.startDate >= today;
                }).sort((a,b) => { return a.sessionTimeId - b.sessionTimeId });
                
                if(isEmpty(sessions)) return;
                let children = [];
                let child = [];
                sessions.forEach((s) => {
                    if(isEmpty(child[s.sessionId])) {
                        child[s.sessionId] = {name: s.name, items: []}
                    }
                    child[s.sessionId].items.push(s);
                });
                for(var sessionId in child){
                    children.push(child[sessionId]);
                }

                children.forEach((it) =>{
                    if(isEmpty(it.items)) return;
                    it.items.forEach((item) => {
                        let month = moment.tz(item.startDate,'Asia/Singapore').format("MMMM");
                        let year = moment.tz(item.startDate,'Asia/Singapore').format("YYYY");
                        if(year != todayYear) month = moment.tz(item.startDate,'Asia/Singapore').format("MMMM YYYY");
                        if(item.endDate > today) {
                            if(isEmpty(segs[month])) segs[month] = {name: month, items: []}
                            let loc = false;
                            let one = segs[month].items.find((o) => {
                                if(o.location && item.location) loc = o.location.string == item.location.string;
                                return o.startDate == item.startDate && o.endDate == item.endDate && loc;
                            });
                            if(one) return;
                            segs[month].items.push(item);
                        }
                    });
                });
                for(var m in segs){
                    arr.push(segs[m]);
                }
            });
            
            return arr;
        },
        displayMore(){
            if(isEmpty(this.eventDetails)) return false;
            if(isEmpty(this.eventDetails.description)) return false;
            return this.eventDetails.description.length > 200;
        }
    },
    methods: {
        zoomImage(imageId) {
            let imgUrl = this.getImage(imageId);
            let img = new Image();
            this.clickedImage = { loading: true, url: null };
            img.onload = img.onerror = () => {
                this.clickedImage = { loading: false, url: imgUrl };
            }
            img.src = imgUrl;
        },
        skipZoom() {
            this.clickedImage = null;
        },
        toggleFilter() {
            this.showFilter = !this.showFilter;
        },
        sortByClicked(item){
            for(var s in this.sortBy){
                this.sortBy[s].clicked = false;
            }
            this.sortBy[item.key].clicked = true;
            this.toggleFilter();
            if (isEmpty(this.reviewsList)) return;
            this.reviewsList.sort((a, b) => {
                if (this.sortBy.recent.clicked) return b.id - a.id;
                if (this.sortBy.highToLow.clicked) return b.rating - a.rating;
                if (this.sortBy.LowToHigh.clicked) return a.rating - b.rating;
            });
        },
        closeReview() {
            if (this.uploadingImage) return;
            this.writeReview = false;
            this.reviewFields = {
                rating: 0,
                images: [],
                headline: "",
                content: "",
            }
        },
        removeImage(index) {
            this.reviewFields.images.splice(index, 1);
        },
        async submitReview() {
            if (this.uploadingImage) return;
            if (!this.reviewFields.headline) {
                return this.showNotification("alert", "error_outline", "Review title is required!");
            }
            if (!this.reviewFields.content) {
                return this.showNotification("alert", "error_outline", "Review content is required!");
            }
            if(!(this.reviewFields.rating > 0)) return this.showNotification("alert", "error_outline", "Rating is required!");
            let customer = this.$store.getters.getCustomer;
            let params = {
                title: this.reviewFields.headline,
                content: this.reviewFields.content,
                rating: this.reviewFields.rating,
                customerId: customer.eunoiaId
            }
            if (this.reviewFields.images.length > 0) {
                this.reviewFields.images.forEach((it, ix) => {
                    params[`image${ix + 1}`] = it.file
                });
            }
            this.submittingReview = true;
            let res = await eventService.submitEventReview(params, this.eventDetails.id);
            this.submittingReview = false;
            let message = "Thank you for your feedback!";
            if (!res.success) message = res.message || "Something went wrong! Unable to submit your rating & review.";
            this.showNotification(res.success ? "success" : "alert", "error_outline", message);
            this.closeReview();
        },
        async uploadImage(event) {
            if (!event.target.files) {
                return;
            }
            let image = event.target.files[0];
            this.$refs.imageFile.value = null;
            this.uploadingImage = true;
            this.reviewFields.images.push({
                loading: true,
                file: null,
            });
            let index = this.reviewFields.images.length - 1;
            let res = await eventService.uploadEventReviewImage(image);
            this.uploadingImage = false;
            this.reviewFields.images[index].loading = false;
            if (!res.success) {
                this.reviewFields.images.pop();
                return this.showNotification("alert", "error_outline", res.message || "Something went wrong! Unable to upload image");
            }
            this.reviewFields.images[index].file = res.imageId;
        },
        async clickReview() {
            if (!this.isLoggedIn()) {
                return this.$router.push({
                    path: '/login',
                    query: {
                        redirect: `/event/${this.$route.params.category}/${this.$route.params.eventId}`
                    }
                });
            }
            this.customer = this.$store.getters.getCustomer;
            let res = await getEunoiaCustomerDetails();
            if (res.success && !isEmpty(res.customer)) {
				this.customer.eunoiaId = res.customer.id;
			}
            this.writeReview = true;
        },
        async setReviewRatings() {
            let res = await this.retrieveReviewRatings(this.eventDetails.id);
            this.reviewsList = res.reviewsList;
            this.totalRatings = res.totalRatings;
            this.ratingPoints = res.ratingPoints;
            this.ratingStars = res.ratingStars;
            this.reviewCharts = res.reviewCharts;
        },
        clearBookings(){
            let bookings = this.$store.getters.getBooking;
            if(!isEmpty(bookings)){
                bookings.forEach((booking) => {
                    if(!isEmpty(booking.promoCodes)) {
                        let promoCodes = this.$store.getters.getPromoCodes;
                        promoCodes = promoCodes.filter((code) => { return booking.promoCodes.indexOf(code) == -1 });
                        this.$store.dispatch("setPromoCodes", promoCodes);
                    }
                });
                this.$store.dispatch("clearBooking");
            }
            this.$store.dispatch("clearBooking");
        },
        booking() {
            if (!this.isLoggedIn()) {
                return this.$router.push({
                    path: '/login',
                    query: {
                        redirect: `/event/${this.$route.params.category}/${this.$route.params.eventId}`
                    }
                });
            }
            this.clearBookings();
            let params = {
                eventId: this.eventId
            }
            this.$router.push({
                name: "EventBooking",
                params: params,
            });
        },
        showMoreDetails(event){
            this.$router.push({
                name: "EventDetails",
                params: {
                    eventId: event.id,
                    category: this.category,
                    eventName: event.name,
                },
            });
        },
        eventMorePlace(event){
            if(isEmpty(event.sessions)) return "";
            return event.sessions[0].location.string;
        },
        eventMoreDesc(event){
            if(event.desc && event.desc.length > 60) {
                let desc = event.desc.substring(0,60);
                let lastString = desc.substring(desc.length - 1);
                if(desc != event.desc){
                    if(lastString !== " "){
                        let lastIdx = event.desc.substring(60).indexOf(" ");
                        if(lastIdx != -1) desc = event.desc.substring(0, 60 + lastIdx);
                    }
                    desc += "...";
                }
                return desc;
            }
            return event.desc;
        },
        eventDate(a, b){
            let from = moment.tz(a,'Asia/Singapore').format('YYYYMMDD');
            let to = moment.tz(b,'Asia/Singapore').format('YYYYMMDD');

            let fromY = moment.tz(a,'Asia/Singapore').format('YYYY');
            let toY = moment.tz(b,'Asia/Singapore').format('YYYY');

            let fromM = moment.tz(a,'Asia/Singapore').format('MM');
            let toM = moment.tz(b,'Asia/Singapore').format('MM');

            let fromD = moment.tz(a,'Asia/Singapore').format('DD');
            let toD = moment.tz(b,'Asia/Singapore').format('DD');

            if(from != to){
                let dowA = moment.tz(a,'Asia/Singapore').format('ddd');
                let dowB = moment.tz(b,'Asia/Singapore').format('ddd');
                let dow = dowA;
                let dd = fromD;
                let mm = dd + " " + moment.tz(a,'Asia/Singapore').format('MMM');
                if(fromD != toD) mm = `${dd} - ${toD} ${moment.tz(a,'Asia/Singapore').format('MMM')}`;
                let yy = fromY;
                if(dowA != dowB) dow = `${dowA} - ${dowB}`;

                if(fromY != toY) yy = `${fromY} - ${toY}`;
                
                if(fromM != toM) {
                    mm = `${fromD} ${moment.tz(a,'Asia/Singapore').format('MMM')} - ${toD} ${moment.tz(b,'Asia/Singapore').format('MMM')}`;
                    if(fromY != toY) {
                        return `${moment.tz(a,'Asia/Singapore').format('DD MMM YYYY')} - ${toD} ${moment.tz(b,'Asia/Singapore').format('DD MMM YYYY')}`;;
                    }
                    return `${mm} ${yy}`;
                }
                return `${dow}, ${mm} ${yy}`;
            }
            
            return moment.tz(a,'Asia/Singapore').format("ddd, DD MMMM YYYY");
        },
        eventTimes(d){
            return moment.tz(d.startDate,'Asia/Singapore').format("HH:mm") + " - " + moment.tz(d.endDate,'Asia/Singapore').format("HH:mm");
        },
        eventDurations(d){
            let durations = [];
            let milliseconds = Math.abs(parseInt(d.endDate) - parseInt(d.startDate));
            let sec = milliseconds/ 1000;
            let mm = Math.floor(sec / 60);
            let hh = Math.floor(mm / 60);
            let day = Math.floor(hh / 24);
            if(day >= 1) {
                hh = hh % 24;
                durations.push(`${day}d`);
            }
            if(hh >= 1) {
                mm = mm % 60;
                durations.push(`${hh}h`);
            }
            if(mm >= 1) durations.push(`${mm}min`);
            return durations.join(' ');
        },
        registeredSpot(event){
            if(isEmpty(event.sessions)) return 0;
            let reg = 0;
            event.sessions.forEach((s) => {
                reg += (s.maxSpot - s.spotLeft)
            });
            return reg;
        },
        async getEventDetails() {
            this.loadingReview = true;
            let json = await eventService.getEvents();
            this.loading = false;
            this.eventsMore = [];

            if(!isEmpty(json) && !isEmpty(json.events)){
                let events = json.events.filter((it) => {
                    return it.status == "ACTIVE";
                });
                this.$store.dispatch("setEvents", events);
            }

            let events = this.$store.getters.getEvents;
            let parent = events.find((it) => {
                return it.id == this.eventId;
            });
            if(isEmpty(parent)) return this.goTo('ErrorPage');
            let momente = moment();
            let today = moment.tz(momente, "Asia/Singapore").format('x');
            let moreEvents = events.filter((it) => {
                return it.id != this.eventId && it.endDate > today && it.categories.indexOf(this.category) > -1;
            }).map((ev) => {
                ev.spotLeft = 0;
                ev.startDisplay = this.eventDate(ev.startDate, ev.endDate);
                ev.sessions.forEach((s) => {
                    ev.spotLeft += parseFloat(s.spotLeft);
                });
                ev.place = this.eventMorePlace(ev);
                ev.price = ev.sessions.length > 0 ? ev.sessions[0].price : 0;
                return ev;
            });
            let sessions = parent.sessions.filter((sess) => {
                return sess.startDate >= today;
            }).sort((a,b) => { return a.startDate - b.startDate });
            /*
            let moreSessions = parent.sessions.filter((sess) => {
                return sess.startDate >= today;
            }).sort((a,b) => { return a.startDate - b.startDate });
            */

            let children = [];
            if(!isEmpty(sessions)){
                let child = [];
                sessions.forEach((s) => {
                    if(isEmpty(child[s.sessionId])) {
                        child[s.sessionId] = {name: s.name, items: []}
                    }
                    child[s.sessionId].items.push(s);
                });
                for(var sessionId in child){
                    children.push(child[sessionId]);
                }
            }
            if(!isEmpty(parent.banners)) {
                parent.banners = parent.banners.map((it) => {
                    it.image = this.getImage(it.id);
                    return it;
                });
                parent.banners.sort((a, b) => { return a.sortIndex - b.sortIndex });
            }
            
            parent.sessions = children;
            parent.moreEvents = moreEvents;
            this.eventDetails = parent;
            this.showMore = false;
            if (!isEmpty(parent.description)) this.showMore = parent.description.length > 200;

            if(isEmpty(this.eventDetails)) {
                return this.goTo('ErrorPage');
            }
            this.setReviewRatings();
            // }
            setTimeout(() => {
                this.resizeImageHandler();
            }, 20);
            /*
            if(!isEmpty(sessions)){
                this.goTo('EventsPage');
            }
            let obj = null;
            if(!isEmpty(sessions)){
                delete parent.sessions;
                obj = sessions[0];
                this.showMore = false;
                if(!isEmpty(obj.description)) this.showMore = obj.description.length > 200;
                obj.parent = parent;
                obj.sessions = sessions;
                obj.more = [];
                if(!isEmpty(moreSessions)){
                    moreSessions.forEach((s) => {
                        let idx = obj.more.findIndex((it) => {
                            return it.details.sessionId == s.sessionId;
                        });
                        if(idx == -1){
                            obj.more.push({
                                details: s,
                                sessions: [s]
                            });
                        } else {
                            obj.more[idx].sessions.push(s);
                        }
                    });
                }
                this.eventDetails = obj;
            }
            */
        },
        getImage(image, small){
            if(!image) return "";
            let size = image;
            if(small) size = "c_fill,h_300,w_350/" + image;
            return this.$store.getters.cloudinaryURL + size;
        },
        readMore(){
            this.showMore = !this.showMore;
        },
        goToBack(){
            this.$router.push({name: "EventsPage"});
        },
        bookSession(session){
            if (!this.isLoggedIn()) {
                return this.$router.push({
                    path: '/login',
                    query: {
                        redirect: `/event/${this.$route.params.category}/${this.$route.params.eventId}`
                    }
                });
            }
            this.clearBookings();
            let params = {
                eventId: this.eventId
            }
            this.$store.dispatch("setBookingEventSession", session);
            this.$router.push({
                name: "EventBooking",
                params: params,
            });
        }
    },
	async created() {
		try {
			this.loading = true;
            window.addEventListener("resize", this.resizeImageHandler);
            document.addEventListener("mousedown", (event) => {
                let sorter = document.querySelector(".sort-list");
                if(sorter && sorter.contains(event.target)) return;
                if (this.showFilter) this.showFilter = false;
            });
            await this.refreshMainData(true);
            if(!isEmpty(this.$route.params)) {
                this.eventName = this.$route.params.eventName;
                this.eventId = this.$route.params.eventId;
                /*
                this.sessionId = this.$route.params.sessionId;
                */
                this.category = this.$route.params.category;
                return this.getEventDetails();
            }
			this.loading = false;
		} catch (error) {
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
		}
	},
};
</script>

<style scoped lang="scss">
    .header-con {
        padding: 16px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-height: 56px;
        border-bottom: 1px solid $secondary-color-20;
        background: $white;

        .back-btn {
            color: $primary-color-60;
            cursor: pointer;
            font-size: 1.2em;
        }

        .more {
            color: $primary-color-60;
            cursor: pointer;
            font-size: 1.2em;
        }

        h1 {
            flex: 1;
            font-size: 1.2em;
        }
    }
    .container {
        width: 100%;
        padding: 0;
        display: block;
        text-align: left;

        .event-img {
            width: 100%;
            height: 100%;
            aspect-ratio: 4/3;
            background: $secondary-color-20;
            &.custom-carousel {
                background: transparent !important;
            }

            &.no-image {
                display: none;
            }

            img {
                width: 100%;
                height: inherit;
                object-fit: cover;
            }
        }

        .event-content {
            padding: 24px;
            width: 100%;

            .event-title {
                font-weight: bold;
                font-size: 1.4em;
                line-height: 1.4;
                font-family: 'Akzidenz Grotesk Super';

                & + .event-title {
                    margin-top: 30px;
                }

                & + .event-note {
                    margin-top: 12px;

                    & + * {
                        margin-top: 30px;
                    }
                }
            }

            .event-label {
                font-weight: bold;
                font-size: 1em;
                text-align: left;

                &.bold {
                    font-family: 'Akzidenz Grotesk Super';
                    font-weight: 500 !important;
                }

                & + .event-label {
                    margin-top: 30px;
                }
                & + .event-note {
                    margin-top: 10px;
                }
            }

            .event-note {
                font-size: 1em;

                &.note-bold {
                    font-family: 'Akzidenz Grotesk Super';
                }

                & + .event-label {
                    margin-top: 30px;
                }

                .see-more {
                    margin-top: 4px;
                    color: $primary-color-60;
                    cursor: pointer;
                    width: fit-content;
                }
            }

            .event-footnote {
                font-size: 0.8em;
                color: $secondary-color-50;

                &.dark {
                    color: $secondary-color-90;
                    font-weight: normal;
                }

                & + .footnote {
                    margin-top: 8px;
                }
            }

            .event-button {
                width: 100%;
                max-width: 450px;
                margin: 24px auto;
                border-radius: 12px;
                background: $primary-color-60;
                padding: 8px;
                color: $white;
                font-weight: bold;
                text-align: center;
                cursor: pointer;

                &.lite {
                    border: 1px solid $primary-color-60;
                    color: $primary-color-60;
                    background: $white;
                    pointer-events: none;
                }
            }
        }
    }

    .event-label-more {
        text-align: left;
        padding: 0 24px;

        &.bold {
            font-family: Akzidenz Grotesk Super;
            font-weight: 500!important;
        }
    }

    .cards {
        display: flex;
        width: 100%;
        overflow-x: auto;
        position: relative;
        padding: 24px;

        .card {
            border-radius: 5px;
            background: $white;
            min-width: 200px;
            max-width: 200px;
            overflow: hidden;
            cursor: pointer;
            -webkit-box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
            -moz-box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
            -o-box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
            box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);

            .card-img {
                width: 100%;
                height: 100px;
                background: $secondary-color-20;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }

            .card-content {
                padding: 16px;
                color: $secondary-color-90;
                text-align: left;

                .card-more-title {
                    color: $primary-color-50;
                    font-weight: bold;
                    text-align: center;
                }

                .card-subtitle {
                    color: $primary-color-50;
                    font-size: 0.8em;
                }

                .card-title {
                    font-weight: bold;
                    color: $secondary-color-100;
                    font-family: 'Akzidenz Grotesk Super';
                    max-height: calc(2em + 5px);
                    overflow: hidden;
                    white-space: normal;
                    word-break: break-all;
                }
                .card-desc {
                    color: $secondary-color-90;
                    font-size: 0.9em;
                }
                .card-note {
                    font-size: 0.8em;
                    color: $secondary-color-50;
                    white-space: nowrap;
                    display: block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .card-footnote {
                    font-size: 0.7em;
                    color: $secondary-color-90;
                    display: flex;
                    align-items: center;

                    .material-icons {
                        font-size: 1.4em;
                    }

                    * + * {
                        margin-left: 4px;
                    }
                }
            }

            & + * {
                margin-left: 26px;
            }
        }
    }

    .segment {
        width: fit-content;
        display: flex;
        flex-direction: column;
        gap: 16px;

        &__container {
            text-align: left;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: calc(100% + 48px);
            transform: translate(-24px, 0px);
            -webkit-transform: translate(-24px, 0px);
        }
        &__title {
            font-size: 1.4em;
            color: $primary-color-60;
            width: 100%;
            padding: 12px 24px;
            font-family: 'Akzidenz Grotesk Super';
            text-align: center;
        }
        &__tabs {
            width: 100%;
            display: flex;
            flex-direction: row;
            gap: 16px;
            overflow: hidden;
            overflow-x: auto;
            padding: 0 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid $secondary-color-20;
            position: relative;

            &.centered {
                justify-content: center;
            }
        }
        &__tab {
            width: fit-content;
            color: $secondary-color-60;
            white-space: nowrap;
            position: relative;
            cursor: pointer;

            &.active {
                color: $primary-color-60;
                font-weight: bold;

                &::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    bottom: -16px;
                    width: 100%;
                    height: 2px;
                    background: $primary-color-60;
                }
            }
        }
        &__content {
            width: 100%;
            padding: 24px;
            padding-top: 0;
            display: none;

            &.active {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
        }

        &__wrapper {
            width: 100%;
            border: 1px solid $secondary-color-20;
            border-radius: 8px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            position: relative;

            .label {
                &__info {
                    display: flex;
                    flex-direction: row;
                    gap: 16px;
                    align-items: flex-start;
                    justify-content: space-between;

                    &__part {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;

                        &.right {
                            align-items: flex-end;
                        }

                        .price {
                            color: $secondary-color-70;
                            font-weight: bold;
                        }
                        .spots {
                            color: $success-green;
                        }
                        .sold-out {
                            color: $primary-color-70;
                            font-weight: bold;
                            font-family: 'Akzidenz Grotesk Super';
                            opacity: 0.7;
                        }
                        .book-btn {
                            background: $primary-color-50;
                            color: $white;
                            border-radius: 16px;
                            padding: 6px 24px;
                            cursor: pointer;
                            width: fit-content;
                            font-weight: bold;
                        }
                    }
                }
                &__date {
                    font-family: 'Akzidenz Grotesk Super';
                    font-size: 0.9em;
                }
                &__time {
                    color: $secondary-color-60;
                }
                &__location {
                    padding-top: 12px;
                    border-top: 1px solid $secondary-color-20;
                    color: $secondary-color-60;
                    display: flex;
                    gap: 8px;
                    align-items: flex-start;
                }
                &__icon {
                    font-size: 1.3em;
                }
            }
        }
    }

    .rating-reviews {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 16px;
		align-items: flex-start;
		text-align: left;
		padding: 24px;
		.reviews-headline {
			font-size: 1.4em;
			// color: $primary-color-60;
			width: 100%;
			font-family: "Akzidenz Grotesk Super";
            line-height: normal;
		}
        .reviews-summary {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 24px;
            padding-top: 32px;
            padding-bottom: 24px;
            border-bottom: 1px solid $secondary-color-20;
            .summary-rating {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 16px;
                .summary-point {
                    display: flex;
                    .point-rate {
                        font-weight: 900;
                        font-size: 3em;
                    }
                    .point-max {
                        padding-top: 6px;
                        color: $secondary-color-50;
                        font-size: 2.5em;
                    }
                }
                .rating-stars {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    .rating-star {
                        width: 45px !important;
                        gap: 0 !important;
                        .star-odd {
                            font-size: 1.8em !important;
                        }
                        .star-even {
                            font-size: 1.8em !important;
                        }
                    }
                }
                .total-ratings {
                    color: $secondary-color-60;
                }
                .review-button {
                    padding: 12px 32px;
                    cursor: pointer;
                    background: $secondary-color-100;
                    color: $white;
                    width: fit-content;
                    font-weight: 900;
                    &:hover {
                        opacity: 0.7;
                    }
                }
            }
            .summary-charts {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 8px;
                .chart-item {
                    display: flex;
                    gap: 16px;
                    width: 100%;
                    align-items: center;
                    .chart-stars {
                        display: flex;
                        align-items: center;
                        .chart-star {
                            color: $secondary-color-20;
                            &.fill {
                                color: orange !important;
                            }
                        }
                    }
                    .chart-bar {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                        gap: 12px;
                        .chart-bar-wrapper {
                            width: 85%;
                            height: 16px;
                            background: $secondary-color-20;
                            .chart-bar-fill {
                                height: 100%;
                                background: orange;
                            }
                        }
                        .chart-label {
                            text-align: right;
                        }
                    }
                }
            }
        }
        .reviews-list {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 24px;
            padding-bottom: 24px;
            position: relative;

            .btn-filter {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 6px 12px;
                border-radius: 24px;
                border: 1px solid $secondary-color-20;
                width: fit-content;
                cursor: pointer;
                * {
                    white-space: nowrap;
                }
                .sort-by {
                    color: $secondary-color-50;
                }
            }
            .sort-list {
                position: absolute;
                left: 0;
                top: 32px;
                border: 1px solid $secondary-color-20;
                border-radius: 4px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                background: $white;
                width: 120px;
                z-index: 1000;
                overflow: hidden;
                .sort-item {
                    background: $white;
                    width: 100%;
                    cursor: pointer;
                    padding: 16px;
                    & + .sort-item { padding-top: 0 !important;}
                    &:hover { opacity: 0.7;}
                }
            }
            .review-card {
                display: flex;
                flex-direction: column;
                gap: 10px;
                & + * {
                    padding-top: 16px;
                    border-top: 1px solid $secondary-color-20;
                }
                .reviewer {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    .reviewer-icon {
                        width: 35px;
                        height: 35px;
                        border-radius: 50%;
                        background: $secondary-color-20;
                        color: $secondary-color-50;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                }
                .review-title-wrapper {
                    width: 100%;
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    .review-title {
                        font-weight: 900;
                    }
                }
                .review-date {
                    font-size: 0.9em;
                    color: $secondary-color-60;
                }
                .review-attachments {
                    width: calc(100% + 48px);
                    display: flex;
                    align-items: flex-start;
                    gap: 24px;
                    overflow: hidden;
                    overflow-x: auto;
                    padding: 24px;
                    transform: translateX(-24px);
                    -webkit-transform: translateX(-24px);
                    img {
                        width: 200px;
                        aspect-ratio: 3/4;
                        object-fit: contain;
                        border: 1px solid $secondary-color-20;
                        border-radius: 8px;
                        cursor: pointer;
                        &:hover { opacity: 0.7;}
                    }
                }
            }
        }
	}

    .justify-between {
        justify-content: space-between;
    }
    .close-btn { cursor: pointer;}
    .review-actions {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 24px;
        .review-action {
            padding: 8px 24px;
            cursor: pointer;
            background: $secondary-color-90;
            color: $white;
            border: 1px solid transparent;
            font-weight: 900;
            &.lite {
                border-color: $secondary-color-90;
                color: $secondary-color-90;
                background: transparent;
            }
        }
    }
    .review-form {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 16px;
        .review-field {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 8px;
                text-align: left;
            .label {
                font-weight: 900;
            }
            .sublabel {
                color: $secondary-color-70;
                font-weight: normal !important;
            }
            .input {
                width: 100%;
                text-align: left;
                &.images {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }
                input:not([type="file"]) {
                    width: 100%;
                    border-radius: 8px;
                    padding: 6px;
                    border: 1px solid $secondary-color-20;
                    outline: none;
                    color: $secondary-color-60;

                    &:is([readonly]) {
                        background: $secondary-color-10;
                        cursor: not-allowed;
                    }

                    &:not([readonly]):focus {
                        border-color: $secondary-color-40;
                        color: $secondary-color-90;
                    }
                }
                &.rating-stars {
                    gap: 4px;
                }
                .rating-star {
                    cursor: pointer;
                    font-size: 1.7em !important;
                    width: 40px;
                    &:hover {
                        opacity: 0.6;
                    }
                    .rating-star-half {
                        .star-odd {
                            font-size: 1.5em !important;
                        }
                        .star-even {
                            font-size: 1.5em !important;
                        }
                    }
                }
                textarea {
                    border-radius: 8px;
                    height: 75px;
                    border: 1px solid $secondary-color-20;
                    padding: 6px;
                    outline: none;
                    width: 100%;
                    &:focus {
                        border: 1px solid $secondary-color-40;
                    }
                }
                .input-file {
                    width: 120px;
                    aspect-ratio: 1/1;
                    position: relative;
                    background: $secondary-color-10;
                    border-radius: 8px;
                    border: 1px dashed $secondary-color-60;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    &:not(.static) {
                        cursor: pointer;
                    }
                    &:hover {
                        opacity: 0.7;
                    }
                    .file-icon {
                        color: $secondary-color-50;
                        font-size: 2.5em !important;
                    }
                    .file-remove {
                        position: absolute;
                        top: -10px;
                        right: -10px;
                        cursor: pointer;
                        width: 25px;
                        height: 25px;
                        border-radius: 50%;
                        background: $white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: $primary-color-50;
                        font-size: 0.9em;
                        border: 1px solid $primary-color-50;
                    }
                    .loading-text {
                        color: $secondary-color-50;
                        font-size: 0.8em;
                    }
                    input:is([type="file"]) {
                        opacity: 0;
                        width: 100%;
                        height: 100%;
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        cursor: pointer;
                    }
                }
            }
        }
    }
    .rating-stars {
        display: flex;
        align-items: center;
    }
    .rating-star {
        color: $secondary-color-20;
        overflow: hidden;
        position: relative;
        display: flex;
        width: 25px;
        font-size: 1.5em;
        .rating-star-half {
            display: block;
            width: 50%;
            overflow: hidden;
            &.selected {
                color: orange !important;
            }
            .star-odd {
                transform: translateX(0%);
                -webkit-transform: translateX(0%);
            }
            .star-even {
                transform: translateX(-50%);
                -webkit-transform: translateX(-50%);
            }
        }
        .rating-star-full {
            color: orange;
        }
    }
    .rating-legend {
        display: flex;
        gap: 4px;
        align-items: center;
        padding: 16px 0;
        .rating-star-full {
            color:  $primary-color-60;
        }
        .rating-points {
            padding-top: 2px;
            font-size: 1.2em;
            font-weight: bold;
            color: $primary-color-60;
        }
        .rating-total-reviewers {
            color: $secondary-color-80;
            text-decoration: underline;
            padding: 0 6px;
        }
    }
    .ratio-square {
        width: 100%;
        aspect-ratio: 1 / 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 !important;
        img {
            max-width: 100%;
            display: block;
            height: 100%;
            object-fit: contain;
        }
    }

    @media(min-width: 672px){
        .header-con {
            padding: 16px 7% !important;
        }
        .container {
            padding: 16px 7% !important;
            padding-top: 48px;
            display: flex;
            flex-direction: row;
            gap: 24px;
            .event-img {
                &.custom-carousel {
                    border: 1px solid #ececec;
                }
            }
        }
        .cards {
            padding: 24px 7% !important;
        }
        .event-content {
            padding: 0 !important;
        }
        .event-label-more {
            padding: 0 7% !important;
            padding-top: 24px;
        }
        .segment {
            &__container {
                padding: 24px 7% !important;
            }
            &__tabs {
                width: calc(100% - 48px);
                margin: 0 auto;
            }
            &__content {
                &.active {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(45%, 1fr));
                    column-gap: 16px;
                    row-gap: 24px;
                }
            }
        }
        .rating-reviews {
			padding: 24px 7% !important;
            .reviews-summary {
                flex-direction: row !important;
                align-items: flex-end;
            }
		}
    }
    @media(max-width: 672px){
        .segment {
            &__wrapper {
                .label {
                    &__info {
                        &__part {
                            .book-btn {
                                padding: 5px 15px;
                                font-size: 0.9em;
                            }
                        }
                    }
                }
            }
        }
    }
</style>