<template>
	<layout-variant-two :show-loading-screen="loading">
        <template v-slot:header>
			<div class="slide-down">
				<div class="header-con default">
                    <div class="header-wrapper">
                        <div class="header-logo-con left">
                            <img v-lazyload
                                width="35"
                                height="35"
                                alt="event"
                                :data-url="require('@/assets/images/rox-logo-new.png')"
                            />
                        </div>
                        <base-store-header v-if="!isGuestCustomer() && isDesktop"
                            @store-changed="storeChanged()"
                            :show-content="isDesktop"
                            :show-label="false"
                            :is-desktop="isDesktop"
                        ></base-store-header>
                    </div>
                    <div class="header-wrapper centered" :class="{'guest': isGuestCustomer()}">
					    <base-desktop-nav :no-search="true" :active-footer-id="activeFooterNavId"></base-desktop-nav>
                    </div>
                    <div class="header-wrapper">
                        <base-header-nav :no-search="true"></base-header-nav>
                    </div>
				</div>
                <div class="header-auth bordered" v-if="isGuestCustomer()">
					<base-store-header
						@store-changed="storeChanged()"
						:show-content="true"
						:show-label="false"
						:is-desktop="true"
					></base-store-header>
					<div class="auth-con">
						<span @click="goSignup()" class="auth-btn">Create account</span>
						<span @click="goTo('LoginPage')" class="auth-btn active">Login</span>
					</div>
				</div>
                <base-store-header v-if="!isGuestCustomer()"
                    @store-changed="storeChanged()"
                    :show-content="!isDesktop"
                    :show-label="false"
                    :is-desktop="isDesktop"
                ></base-store-header>
			</div>
		</template>
		<template v-slot:body>
            <div class="events-content">
                <div class="container-2" :class="{'show-background': !loading}">
                    <img 
                        width="640" 
                        height="480"
                        :srcset="eventBanner + ' 100w, ' + eventBanner"
                        sizes="(max-width: 400px) 100vw, (max-width: 600px) 100vw, 700px"
                        alt="R.O.X. Community Event"/>
                    <div class="top-content">
                        <h1 class="heading-5">Browse by<br>Category</h1>
                    </div>
                    <div class="backdrop-content"></div>
                </div>
                <div class="main-content">
                    <div class="feeds">
                        <div class="feeds-content">
                            <div 
                                class="feed" :class="{'active': cat.id == selectedCategory.id }"
                                v-for="(cat, i) in categories" 
                                :key="i"
                                @click="handleCategoryClick(cat)">
                                <span class="feed-label">{{ cat.name }}</span>
                            </div>
                        </div>
                        <event-card ref="eventCard" :events="filteredEvents" :showMoreEvents="showMoreEvents" :selectedCategory="selectedCategory.name"></event-card>
                    </div>
                </div>

                <div class="container-3">
                    <h1>Why you'll love R.O.X. Community</h1>
                    <div class="why">
                        <div class="why-item" v-for="(why,i) in bottoms" :key="i">
                            <div class="why-img">
                                <img v-lazyload alt="rox event" :data-url="require('@/assets/images/' + why.image)"/>
                            </div>
                            <div class="why-content">
                                <div class="why-title">{{why.name}}</div>
                                <div class="why-note">{{why.desc}}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
		</template>
        <template v-slot:footer>
			<base-footer-nav :active-footer-id="activeFooterNavId"></base-footer-nav>
		</template>
	</layout-variant-two>
</template>

<script>
import { eventService, homeService } from "@/bloc/services";
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';
import EventCard from './components/EventCard.vue';

export default {
	name: "EventsPage",
	mixins: [utility],
	components: {
        LayoutVariantTwo,
        EventCard,
	},
	data() {
		return {
			customer: {},
			loading: false,
            searchKey: "",
            categories: [],
            selectedCategory: {},
            eventNavs: [],
            activeEvent: null,
            events: [],
            bottoms: [],
            searchResult: [],
            activeFooterNavId: 1,
            filteredEvents: [],
            isDesktop: false,
            scrollTop: 0,
            isDestroyed: false,
		};
	},
	watch: {
        searchKey(key){
            this.searchResult = [];
            if(key.length < 3) return;
            this.events.forEach((it) => {
                let name = it.name.toLowerCase();
                if(name.indexOf(key) > -1){
                    let findExists = this.searchResult.indexOf(it.name) > -1;
                    if(!findExists) this.searchResult.push(it.name);
                }
            });
        },
        selectedCategory() {
            this.$refs.eventCard.initEvents(this.filteredEvents);
        },
    },
	computed: {
        welcomeMessage() {
			let name = !isEmpty(this.customer)
				? this.customer.firstName[0].toUpperCase() +
				  this.customer.firstName.substring(1).toLowerCase()
				: "";
			return `${homeService.getDayGreeting()},<br>${name}`;
		},
        showresult(){
            return !isEmpty(this.searchResult);
        },
        showMoreEvents(){
            if(isEmpty(this.activeEvent)) return false;
            if(isEmpty(this.activeEvent.sessions)) return false;
            let sessions = this.activeEvent.sessions.filter((session) => {
                return session.status == "ACTIVE" && session.startDate >= moment().format('x');
            });

            let skip = true; // currently hide this section
            return !skip && sessions.length > 3;
        },
        eventBanner() {
            return this.$store.getters.getEventBanner;
        }
    },
    methods: {
        async storeChanged(){
			try {
				this.loading = true;
                await this.refreshMainData(true);
				this.loading = false;
            } catch(error){
                this.loading = false;
			    this.showNotification("alert", "error_outline", error);
            }
        },
        goSignup() {
			this.goToWithParams('LoginPage', {
				signup: true
			});
        },
        async setFilteredEvents(){
            this.filteredEvents = [];
            if(!isEmpty(this.events)){
                this.events.map((ev) => {
                    let iszero = moment.tz(ev.startDate, 'Asia/Singapore').format("HH:mm") == "00:00";
                    let format = "ddd, DD MMM YYYY HH:mm";
                    if(iszero) format = "ddd, DD MMM YYYY";
                    let startDisplay = moment.tz(ev.startDate, 'Asia/Singapore').format(format);
                    ev.startDisplay = startDisplay;
                    ev.place = "";
                    ev.spotLeft = 0;
                    ev.price = 0;
                    if(!isEmpty(ev.sessions)) {
                        ev.place = this.eventPlace(ev.sessions[0]);
                        let prices = ev.sessions.map((s) => {
                            return parseFloat(s.price);
                        }).sort((a,b) => { return a - b });
                        ev.price = prices[0];
                        ev.sessions.forEach((s) => {
                            ev.spotLeft += parseFloat(s.spotLeft);
                        });
                    }
                    return ev;
                });
                this.filteredEvents = this.events.filter((ev) => {
                    if(isEmpty(ev.eventCategories)) return false;
                    return ev.eventCategories.map((x) => x.id).includes(this.selectedCategory.id);
                });
            }
        },
        async handleCategoryClick(cat) {
            this.selectedCategory = cat;
            let payload = {
                currentTab: cat,
                scrollTop: this.scrollTop,
            }
            this.$store.dispatch("setStateEventsPage", payload);
            this.setFilteredEvents();
        },
        async initEvents() {
            let stateEvent = this.$store.getters.getStateEventsPage;
            let currentTab = stateEvent.currentTab;

            this.scrollTop = stateEvent.scrollTop || 0;
            let json = await eventService.getEvents();
            this.loading = false;

            let events = [];
            let momente = moment();
            let today = moment.tz(momente, "Asia/Singapore").format('x');
            if(!isEmpty(json) && !isEmpty(json.events)){
                events = json.events.filter((it) => {
                    return it.status == "ACTIVE" && it.endDate > today;
                });
            }
            this.bottoms = [
                {
                    id: 0,
                    image: "events-why-deep.png",
                    name: "Deep, local connections",
                    desc: "Get to know the people, wildlife and natural history of nearby community",
                },
                {
                    id: 1,
                    image: "events-why-hassle.png",
                    name: "Convenient",
                    desc: "Join our adventures with a few simple steps",
                },
            ];
            if(!isEmpty(events)){
                events.map((it) => {
                    it.isActive = false;
                    return it;
                });
                events.sort((a,b) => { return a.sortIndex - b.sortIndex && a.startDate - b.startDate });
                events[0].isActive = true;
                this.events = events;
                this.activeEvent = events[0];

                let categoriesList = [];
                events.forEach((ev) => {
                    if (isEmpty(ev.eventCategories)) return;
                    ev.eventCategories.forEach((ct) => {
                        let catMap = categoriesList.map((x) => x.id);
                        if (!catMap.includes(ct.id)) {
                            categoriesList.push(ct);
                        }
                    });
                });
                if(!isEmpty(categoriesList)) {
                    categoriesList.sort((a, b) => {
                        if (a.sortIndex == b.sortIndex) return a.sortIndex - b.sortIndex && a.name.localeCompare(b.name);
                        return a.sortIndex - b.sortIndex;
                    });
                }
                this.categories = categoriesList;
            }
            
            setTimeout(() => {
                if (!isEmpty(this.categories)) {
                    let cats = !isEmpty(events.categories) ? events.categories : this.categories;
                    let skip = false;
                    if (!isEmpty(currentTab)) {
                        let curr = cats.find((c) => c == currentTab);
                        if (curr) {
                            skip = true;
                            this.handleCategoryClick(curr);
                        }
                    }
                    if (!skip) this.handleCategoryClick(cats[0]);
                }
                this.$store.dispatch("setEvents", events);
                this.resizeImageHandler();
                document.querySelector('.sd-base-con').scrollTop = this.scrollTop;

                let self = this;
                document.querySelector('.sd-base-con').addEventListener("scroll", (e) => {
                    self.scrollTop = e.target.scrollTop;
                    let payload = {
                        currentTab: self.selectedCategory,
                        scrollTop: self.scrollTop,
                    }
                    self.$store.dispatch("setStateEventsPage", payload);
                });
            },20);
		},
        eventPlace(event){
            if(isEmpty(event.location)) return "";
            return event.location.string;
        },
        eventDesc(event){
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
        search(){
            if(isEmpty(this.searchKey)) return;
            let key = this.searchKey.toLowerCase();
            return this.gotoResult(key);
        },
        resizeBannerHandler(){
            this.isDesktop = window.innerWidth >= 672;
            if (this.isDestroyed) return;

            let w = document.querySelector('.container-2').clientWidth;
            if (this.isDesktop) w = ((9 / 16) * w);
            else w = ((3 / 4) * w) - 50;
            // document.querySelector('.container-2').style['height'] = `${w}px`;

            let marginTop = (w * 0.7) - document.querySelector('.top-content').clientHeight;
            marginTop = Math.abs(marginTop);

            let backdropHeight = w - marginTop - document.querySelector('.top-content').clientHeight;
            document.querySelector('.backdrop-content').style['height'] = `${backdropHeight}px`;
            document.querySelector('.main-content').style['margin-top'] = `${0 - backdropHeight}px`;

            if (this.isDesktop) {
                let scrollable = document.querySelector('.feeds-content').scrollWidth > document.querySelector('.feeds-content').clientWidth;
                if (!scrollable) document.querySelector('.feeds-content').classList.add('centered');
                else document.querySelector('.feeds-content').classList.remove('centered');
            } else {
                document.querySelector('.feeds-content').classList.remove('centered');
            }
        },
	},
	async created() {
        try {
            this.isDestroyed = false;
            this.activeFooterNavId = 1;
            this.customer = this.$store.getters.getCustomer;
            this.categories = [];
            this.events = [];
			this.loading = true;
			await this.refreshMainData(true);
            this.initEvents();
            this.resizeBannerHandler();
            window.addEventListener('resize', () => {
                this.resizeBannerHandler();
            });
		} catch (error) {
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
		}
    },
    beforeUnmount() {
        this.isDestroyed = true;
    }
};
</script>

<style scoped lang="scss">
.header-con {
    .back-btn {
        color: $primary-color-50;
        cursor: pointer;
        font-size: 1.2em;
    }

	h1 {
        flex: 1;
        font-size: 1.2em;
        font-weight: bold !important;
        font-family: 'Akzidenz Grotesk Super';
	}
}
.heading-5 {
    filter: drop-shadow(-2px -2px 6px $secondary-color-100);
    -webkit-filter: drop-shadow(-2px -2px 6px $secondary-color-100);
}
.events-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;

    .container-1 {
        width: 100%;
        height: 100%;
        max-height: 540px;
        text-align: left;
        flex: 1;
        display: flex;
        flex-direction: column;
        background: $secondary-color-90;
        background-image: url("@/assets/images/event-bg-new.jpeg");
        background-position: center;
        background-size: cover;

        .back-btn {
            color: $white;
            padding: 24px;
            cursor: pointer;
        }

        .top-content {
            max-width: 450px;
            margin: 0 auto;
            padding: 24px;
            flex: 3;
            overflow: hidden;
            overflow-y: auto;
            width: 100%;
            color: $white;

            h1 {
                text-align: left;
                font-size: 2em;
                line-height: 1.4;
                font-family: 'Akzidenz Grotesk Super';

                & + * {
                    font-size: 1.2em;
                    line-height: 1.4;
                    width: 100%;
                    display: block;
                    margin-top: 16px;
                }
            }
        }

        & + .container-2 {
            margin-top: 24px;
        }
    }
    
    .container-2 {
        width: 100%;
        text-align: left;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        background: $secondary-color-90;
        color: $white;
        position: relative;
        aspect-ratio: 4/3;
        &.show-background {
            img {
                position: absolute;
                top: 0;
                width: 100%;
                height: 100%;
                aspect-ratio: 4/3;
                object-fit: cover;
            }
        }
        &:not(.show-background) {
            & * {
                opacity: 0;
            }
        }

        .top-content {
            padding: 0 24px;

            h1 {
                width: 100%;
                text-align: left;
                font-size: 1.6em;
                line-height: 1.4;
                font-weight: bolder;

                & + * {
                    font-size: 1.2em;
                    line-height: 1.4;
                    width: 100%;
                    display: block;
                    margin-top: 16px;
                }
            }
        }
        .backdrop-content {
            padding: 0 24px;
            padding-top: 24px;
            height: 250px;
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
        }
    }
    .main-content {
        padding: 0 !important;
        position: relative;
        margin-top: -250px;
        .feeds {
            margin-top: auto;
            width: 100%;
            .feeds-content {
                padding: 0 24px;
                display: flex;
                width: 100%;
                overflow-x: auto;
                align-items: center;
                justify-content: flex-start;
                position: relative;
                &.centered {
                    justify-content: center !important;
                }
                .feed {
                    padding: 24px 0;
                    cursor: pointer;
                    font-size: 1rem;
                    line-height: 0.875rem;
                    letter-spacing: 0.025rem;
                    position: relative;
                    display: flex;
                    align-items: center;
                    color: $white;

                    .material-icons {
                        font-size: 16px;
                    }

                    .feed-label {
                        font-weight: bold;
                        white-space: nowrap;
                    }

                    * + * {
                        margin-left: 8px;
                    }

                    & + .feed {
                        margin-left: 32px;
                    }

                    &.active {
                        &::before {
                            content: "";
                            position: absolute;
                            width: 100%;
                            height: 2px;
                            left: 0px;
                            right: 0px;
                            margin: 0 auto;
                            bottom: 12px;
                            background-color: $white;
                            transition: all 0.5s;
                            z-index: 10;
                            animation: tabslide 0.35s ease-in-out;
                            -webkit-animation: tabslide 0.35s ease-in-out;
                        }
                    }
                }
            }
        }
    }
    .container-3 {
        width: 100%;
        padding: 32px 0px;
        padding-bottom: 80px;
        flex: 1;
        background: $white;

        h1 {
            width: 100%;
            text-align: left;
            font-size: 1.5em;
            line-height: 1.4;
            padding: 0 24px;
            font-weight: bolder !important;
            color: $secondary-color-50;

            & + * {
                font-size: 1.2em;
                line-height: 1.4;
                width: 100%;
                margin-top: 16px;
            }
        }

        .why {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 26px;
            overflow: hidden;
            overflow-x: auto;
            padding: 0 24px;

            .why-item {
                width: 100%;
                min-width: 200px;
                background: $secondary-color-10;
                padding: 12px 24px;
                border-radius: 10px;

                .why-img {
                    width: 100px;
                    height: 100px;
                    margin: 0 auto;

                    img {
                        object-fit: cover;
                    }
                }

                .why-content {
                    padding-top: 24px;
                    text-align: left;

                    .why-title {
                        font-weight: bold;
                        color: $secondary-color-90;
                        font-size: 0.8em;
                    }
                    .why-note {
                        font-size: 0.6em;
                        color: $secondary-color-60;
                    }
                }
            }
        }

        & + * {
            margin-top: 40px;
        }
    }
    .cards {
        padding-top: 0px;
    }
}
@keyframes tabslide {
    0% {
        width: 0;
    }
    100% {
        width: 100%;
    }
}
@-webkit-keyframes tabslide {
    0% {
        width: 0;
    }
    100% {
        width: 100%;
    }
}
@media(min-width: 672px){
    .container-1 {
        padding: 32px 7% !important;
    }
    .container-2 {
        padding: 32px 0 !important;
        padding-bottom: 0 !important;
        .top-content {
            padding: 32px 7% !important;
        }
    }
    .main-content {
        .feeds {
            .feeds-content {
                padding: 0 7% !important;
                .feed {
                    .feed-label {
                        font-size: 1.2em !important;
                    }
                }
            }
            .cards {
                padding-right: 7% !important;
                padding-left: 7% !important;
            }
        }
    }
    .container-3 {
        padding: 32px 7% !important;
        .why, h1 {
            padding: 0 !important;
        }
    }

    .top-content {
        h1 {
            font-size: 2em !important;
        }
    }

    .feeds-content {
        padding: 0 !important;
    }

    .cards {
        padding-left: 24px !important;
        padding-right: 24px !important;
        padding-top: 24px !important;
    }
}
</style>