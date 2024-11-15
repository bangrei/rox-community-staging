<template>
	<layout-variant-two id="welcome-page" :show-loading-screen="loading" :footer-white="true" :hideFooter="isDesktop">
		<template v-slot:header>
			<div class="slide-down">
				<div class="header-con default">
					<div class="header-wrapper">
						<div class="header-logo-con left bordered">
							<img v-if="inited"
								width="35"
								height="35"
								alt="rox logo"
								:src="require('@/assets/images/rox-logo-new.png')"
							/>
						</div>
					</div>
					<div class="header-wrapper centered guest">
						<base-desktop-nav v-if="inited" :no-search="true"></base-desktop-nav>
					</div>
					<div class="header-wrapper">
					    <base-header-nav v-if="inited" :scanner-on="false" :noSearch="true"></base-header-nav>
                    </div>
				</div>
				<div class="header-auth" :class="{'bordered': isDesktop}">
					<base-store-header v-if="inited"
						@store-changed="storeChanged()"
						:show-content="true"
						:show-label="false"
						:is-desktop="true"
					></base-store-header>
					<div class="auth-con" v-if="inited">
						<span @click="goSignup()" class="auth-btn">Create account</span>
						<span @click="goTo('LoginPage')" class="auth-btn active">Login</span>
					</div>
				</div>
			</div>
		</template>
		<template v-slot:body>
			<div class="head-container" v-if="inited">
				<img :src="homeBanner" alt=""/>
				<div class="head-overlay">
					<div class="head-title">Adventure Awaits</div>
					<span class="head-subtitle">Let our outdoor specialist guide you on the path to epic journey</span>
					<span class="head-btn" @click="goExplore()">Join our community</span>
				</div>
			</div>
			<div class="main-container" v-if="inited">
				<div class="events__container blurred">
					<div class="events__title">
						<div class="title-con">
							<span class="title">Plan your next trip...</span>
							<span class="anchor" @click="goTo('EventsPage')">See all</span>
						</div>
						<div class="navigators">
							<div class="navigator" @click="scrollLeft('.cards')">
								<i class="material-icons-outlined">arrow_back</i>
							</div>
							<div class="navigator" @click="scrollRight('.cards')">
								<i class="material-icons-outlined">arrow_forward</i>
							</div>
						</div>
					</div>
					<div class="events__subtitle">Upcoming events</div>
					<event-card ref="eventCard" v-if="!isEmpty(upcomingEvents)" :events="upcomingEvents" :emitEvent="true" @event-clicked="clickEventDetails"></event-card>
				</div>
				<div class="events__container">
					<div class="events__title">
						<div class="title-con">
							<span class="title">Your outdoor essentials...</span>
							<span class="anchor" @click="goToShop()">Shop all</span>
						</div>
						<div class="navigators">
							<div class="navigator" @click="scrollLeft('.etalase-con')">
								<i class="material-icons-outlined">arrow_back</i>
							</div>
							<div class="navigator" @click="scrollRight('.etalase-con')">
								<i class="material-icons-outlined">arrow_forward</i>
							</div>
						</div>
					</div>
					<div class="events__subtitle">Top selling products</div>
					<product-grid :products="products" :more-button="false" :in-line="true" :nobox="false"></product-grid>
				</div>
				<div class="events__container">
					<div class="events__title">
						<div class="title-con">
							<span class="title">Feeds</span>
							<span class="anchor" @click="goTo('LoginPage')">See all</span>
						</div>
						<div class="navigators">
							<div class="navigator" @click="scrollLeft('.nudges')">
								<i class="material-icons-outlined">arrow_back</i>
							</div>
							<div class="navigator" @click="scrollRight('.nudges')">
								<i class="material-icons-outlined">arrow_forward</i>
							</div>
						</div>
					</div>
					<div class="events__subtitle">Be inspired by our knowledge Hub</div>
					<div class="nudges">
						<div class="nudge" v-for="nudge in filterNudges" :key="nudge.id">
							<home-nudge-card
								:nudge="nudge"
								:aligned="true"
								@nudge-clicked="goTo('LoginPage')"
							></home-nudge-card>
						</div>
						<!-- <div class="nudge" 
							v-for="(nudge, i) in filterNudges" 
							@click="goTo('LoginPage')"
							:key="i">
							<div class="nudge-header">
								<div class="tags">
									<span class="tag" v-for="(tag, x) in nudge.tags" :key="x">{{ tag }}</span>
								</div>
								<img v-if="nudge.image" :src="nudge.image" alt="">
							</div>
							<div class="nudge-content">
								<div class="nudge-title">{{ nudge.name }}</div>
								<div class="nudge-desc">{{  nudge.description }}</div>
								<div class="nudge-point">{{ nudge.readingPoints }} reading points</div>
							</div>
						</div> -->
					</div>
				</div>
				<div class="events__container" style="padding-bottom: 0;">
					<div class="events__title">
						<div class="title-center">
							<span class="title">Brands curated made for adventure...</span>
						</div>
					</div>
					<div class="brands-con" v-if="curatedBrands.length > 0">
						<span class="anchor" @click="goToBrands()">Shop by Brand</span>
						<div class="brands">
							<div class="brand" v-for="(brand, n) in curatedBrands" :key="n">
								<img @click="brandClicked(brand)" :src="getBrandImage(brand.imageId)" :alt="brand.name">
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
		<template v-slot:footer>
			<base-footer-nav></base-footer-nav>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import EventCard from '../page-events/components/EventCard.vue';
import ProductGrid from "../page-store/components/ProductGrid.vue";
import HomeNudgeCard from "../page-feeds/components/HomeNudgeCard.vue";
import utility from "@/presentation/mixins/utility.js";
import { storeService, eventService, homeService } from "@/bloc/services";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';

export default {
	name: "WelcomePage",
	components: {
		LayoutVariantTwo,
		ProductGrid,
		HomeNudgeCard,
		EventCard,
	},
	mixins: [utility],
	data() {
		return {
			loading: false,
			isDesktop: true,
			inited: false,
			banners: [],
			upcomingEvents: [],
			products: [],
			nudges: [],
			curatedBrands: [],
			showLogin: false,
		};
	},
	computed: {
		filterNudges() {
			let nudges1 = this.nudges.filter((n) => {
				return n.image == "";
			}).splice(0,5);
			let nudges2 = this.nudges.filter((n) => {
				return n.image != "";
			}).splice(0, 5);
			let nudges = [...nudges1, ...nudges2].sort((a,b) => { return a.id.localeCompare(b.id) }).sort((a, b) => { return a.published - b.published }).splice(0, 10);
			return nudges;
		},
		atStoreName(){
			let currentOutlet = this.$store.getters.getCurrentOutlet;
			if(isEmpty(currentOutlet)) return;
			return `at ${currentOutlet.name}`;
		},
		homeBanner() {
			return this.$store.getters.getHomeBanner;
		}
	},
	watch: {
		inited(val) {
			if (!val) return;
			setTimeout(() => {
                this.resizeBannerHandler();
			}, 250);
		}
	},
	methods: {
		goToBrands(){
			let outlet = this.$store.getters.getCurrentOutlet;
			let apiCode = isEmpty(outlet) ? -1 : outlet.apiCode;
			this.goToWithParams('BrandPage', {
				outlet: apiCode,
				brandCode: this.curatedBrands[0].apiCode
			});
		},
		async storeChanged(){
			try {
				this.loading = true;
				let currentOutlet = this.$store.getters.getCurrentOutlet;
				await this.retrieveMenu(currentOutlet.apiCode);
				await this.initWelcomePage();
				this.loading = false;
            } catch(error){
                this.loading = false;
			    this.showNotification("alert", "error_outline", error);
            }
        },
		scrollLeft(el) {
			let target = document.querySelector(el);
			if (target.scrollLeft <= 0) return;
			target.scrollLeft -= 200;
		},
		scrollRight(el) {
			let target = document.querySelector(el);
			target.scrollLeft += 200;
		},
		goSignup() {
			this.goToWithParams('LoginPage', {
				signup: true
			});
		},
		goExplore() {
			this.goTo('LandingCarousel');
		},
		toggleLogin() {
			this.showLogin = true;
		},
		brandClicked(brand){
			if (isEmpty(brand)) return;
			let currentOutlet = this.$store.getters.getCurrentOutlet;
			this.goToWithParams('BrandPage', {
				outlet: currentOutlet.apiCode,
				brandCode: brand.apiCode
			});
		},
		getBrandImage(image){
            if(!image) return "";
            return this.$store.getters.cloudinaryURL + "" + image;
        },
		skipWelcome() {
			this.$router.push({
				name: "LandingCarousel",
			});
		},
		goToShop(){
			let outlet = this.$store.getters.getCurrentOutlet;
			let apiCode = isEmpty(outlet) ? -1 : outlet.apiCode;
			this.goToWithParams('ShopPage', {
				outlet: apiCode
			});
		},
		async retrieveBanners(){
            this.inited = false;
            this.banners = [];
            let json = await storeService.retrievePromotions();
			
            if(!isEmpty(json.promotions)){
                this.banners = json.promotions.filter(function (item) {
                    return item.displayAsBanner;
                }).sort(function (a, b) {
                    return a.id - b.id;
                }).map((item, ix) => {
                    item.index = ix;
                    item.image = this.$store.getters.cloudinaryURL + "/" + item.imageId;
                    return item;
                }).sort(function (a, b) {
                    return a.sortIndex - b.sortIndex;
                });
            }
		},
		resizeBannerHandler(){
			this.isDesktop = window.innerWidth >= 672;

			let head = document.getElementsByClassName('head-container');
			for (var h = 0; h < head.length; h++){
				let w = document.getElementsByClassName('head-container')[h].clientWidth;
				let hg = (9 / 16) * w;
				document.getElementsByClassName('head-container')[h].style['height'] = `${hg}px`;
			}

			/*
			let cards = document.getElementsByClassName("card-img");
			let maxH = document.getElementsByClassName("card-img")[0].clientWidth;
			for (var a = 0; a < cards.length; a++){
				let h = document.getElementsByClassName('card-img')[a].clientHeight;
				if (h > maxH) maxH = h;
			}
			for (var n = 0; n < cards.length; n++){
				document.getElementsByClassName('card-img')[n].style['height'] = `${maxH}px`;
			}
			*/

			let nudges = document.getElementsByClassName('nudge-header');
			for (var m = 0; m < nudges.length; m++){
				let w = document.getElementsByClassName('nudge-header')[m].clientWidth;
				let h = (9/16) * w;
				document.getElementsByClassName('nudge-header')[m].style['height'] = `${h}px`;
			}
		},
		getRegisteredSession(event){
            if(isEmpty(event.sessions)) return 0;
            let reg = 0;
            event.sessions.forEach((s) => {
                reg += (s.maxSpot - s.spotLeft)
            });
            return reg;
		},
		clickEventDetails(event){
			let category = !isEmpty(event.categories) ? event.categories[0] : "-";
            this.$router.push({
                name: "EventDetails",
                params: {
                    eventId: event.id,
                    category: category,
                    eventName: event.name,
                },
            });
		},
		getEventImage(event) {
			let w = 350;
			//let h = Math.round((9 / 16) * w);
			let props = `c_fill,h_${w},w_${w}`;
			return this.getImage(event.banner, props);
		},
		async retrieveEvents() {
			let json = await eventService.getEvents();
			let events = [];
			if(!isEmpty(json) && !isEmpty(json.events)){
                let momente = moment();
                let today = moment.tz(momente, "Asia/Singapore").format('x');
				let userCoords = this.getCurrentLocation();
                events = json.events.map((it) => {
					let iszero = moment.tz(it.startDate, 'Asia/Singapore').format("HH:mm") == "00:00";
                    let format = "ddd, DD MMM YYYY HH:mm";
                    if(iszero) format = "ddd, DD MMM YYYY";
                    it.startDisplay = moment.tz(it.startDate, 'Asia/Singapore').format(format);
                    it.place = "";
                    it.spotLeft = 0;
                    it.price = 0;
					if(!isEmpty(it.sessions)) {
                        it.place = it.sessions[0].location.string;
                        let prices = it.sessions.map((s) => {
                            return parseFloat(s.price);
                        }).sort((a,b) => { return a - b });
                        it.price = prices[0];
                        it.sessions.forEach((s) => {
                            it.spotLeft += parseFloat(s.spotLeft);
                        });
                    }

					it.sessions.map((s) => {
						s.distance = null;
						if (!isEmpty(userCoords) && !isEmpty(s.coord)) {
							let radlat1 = Math.PI * userCoords.lat / 180;
							let radlat2 = Math.PI * s.coord.lat / 180;
							let theta = userCoords.lng - s.coord.lng;
							let radtheta = Math.PI * theta / 180;
							let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
							if (dist > 1) dist = 1;
							dist = Math.acos(dist);
							dist = dist * 180 / Math.PI;
							dist = dist * 60 * 1.1515;
							dist = parseFloat(dist * 1.609344).toFixed(2) //in Kilometers
							s.distance = dist;
						}
						return s;
					}).sort((a,b) => { return a.distance - b.distance });
					it.distance = null;
					if(!isEmpty(it.sessions.filter((s) => { return s.distance != null }))){
						let one = it.sessions.filter((s) => { return s.distance != null })[0];
						it.distance = one.distance;
					}
					return it;
				}).filter((it) => {
                    return it.status == "ACTIVE" && it.startDate > today && it.endDate > today;
                }).sort((a,b) => { return a.distance - b.distance && a.sortIndex - b.sortIndex && a.startDate - b.startDate });
			}
			this.upcomingEvents = events;
		},
		prdImage(prd){
			let id = prd.imageId;
			if(!id) id = prd.imageId2;
			if(!id) id = prd.imageId3;
			if(id) return this.getImage(id);
		},
		isFavorite(productId){
			return this.isFavoriteProduct(productId)
		},
		async retrieveNudges() {
			const allNudges = await homeService.getAllNudges();
			this.nudges = homeService.getValidNudges(allNudges);
		},
		async initWelcomePage() {
			let products = this.$store.getters.getProducts.filter((it) => { return it.available });
			if(!isEmpty(products)){
				products.sort((a,b) => { return a.sortIndex - b.sortIndex });
				this.products = products.splice(0,10);
				this.products.forEach((it) => {
					it.imageDisplay = this.prdImage(it);
					it.favorite = it.favorite || this.isFavorite(it.id);
				});
			}
			await this.retrieveBanners();
			await this.retrieveEvents();
			await this.retrieveNudges();
			this.curatedBrands = this.$store.getters.getCuratedBrands.filter((brand) => { return brand.image != ""; });
			this.inited = true;
			this.loading = false;
		},
	},
	async created() {
		try {
			this.loading = true;
			if(!this.$store.getters.hasInited) await this.refreshMainData();
			await this.initWelcomePage();
			window.addEventListener("resize",  this.resizeBannerHandler);
		} catch (error) {
			console.log(error);
		}
	}
};
</script>

<style scoped lang="scss">
#welcome-page {

	&.fade-out {
		animation-duration: 1s;
		animation-name: fadeout;
		animation-fill-mode: forwards;
	}
}

.welcome-wrapper {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.modal-header {
	.close-btn {
		cursor: pointer;
		&.float-right {
			float: right;
		}
	}
}

.modal-body {
	.link-btn {
		font-size: 0.9em;
		font-weight: bold;
		color: $primary-color-50;
		cursor: pointer;
	}
}

.header-wrapper {
	display: flex;
	align-items: center;
	gap: 24px;

	&.centered {
		flex: 3;
		&.guest {
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
}

@keyframes fadeout {
	0% {
		opacity: 1;
	}

	100% {
		opacity: 0;
	}
}

.title-text {
	margin: 22px auto 16px;
	font-family: 'Akzidenz Grotesk Super', sans-serif;
}

.sub-title-text {
	padding: 0 24px;
}
.welcome-button-con {
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	gap: 20px;
	font-weight: bold;
}
.head-container {
	width: 100%;
	display: flex;
	flex-direction: column;
	position: relative;
	aspect-ratio: 16/9;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.head-overlay {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background: rgba(0,0,0,.3);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		padding: 24px;
	}

	.head-title {
		color: $white;
		font-size: 1.7em;
		font-family: 'Akzidenz Grotesk Super';
	}

	.head-subtitle {
		color: $white;
		font-weight: bold;
	}
	.head-btn {
		border-radius: 8px;
		padding: 4px 24px;
		background: $white;
		color: $secondary-color-90;
		font-weight: bold;
		font-size: 0.8em;
		cursor: pointer;
	}
}
.main-container {
	width: 100%;
	display: flex;
	flex-direction: column;
}
.banners-con {
	width: 100%;
}
.events {
	&__container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 12px;
		text-align: left;
		padding: 24px 0px;
		position: relative;

		&.blurred::after {
			content: "";
			position: absolute;
			left: 60%;
			right: 0;
			top: 50px;
			bottom: 0;
			background: linear-gradient(90deg, transparent, $white);
			pointer-events: none;
			height: calc(100% - 100px);
		}
	}
	&__title {
		width: 100%;
		display: flex;
		justify-content: space-between;
		padding: 0px 24px;
		gap: 16px;

		.title-con {
			display: flex;
			gap: 16px;
			align-items: center;
			.title {
				font-family: 'Akzidenz Grotesk Super';
			}
			.anchor {
				font-weight: bold;
				font-size: 0.8em;
				color: $primary-color-50;
				cursor: pointer;
				white-space: nowrap;
				height: fit-content;

			}
		}
		.title-center {
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 16px;
			flex-direction: column;

			.title {
				font-family: 'Akzidenz Grotesk Super';
				text-align: center;
			}
		}
	}
	&__subtitle {
		padding: 0px 24px;
		color: $secondary-color-50;
		font-weight: bold;
	}
}
.navigators {
	display: none;
	.navigator {
		width: 25px;
		height: 25px;
		border-radius: 50%;
		background: $secondary-color-90;
		color: $white;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		.material-icons-outlined {
			font-size: 0.9em !important;
		}
	}
}
.nudges {
	display: flex;
	width: 100%;
	overflow-x: auto;
	position: relative;
	padding: 24px;
	gap: 24px;

	.nudge {
		display: flex;
		flex-direction: column;
		gap: 24px;
		border-radius: 5px;
		background: $white;
		min-width: 350px;
		max-width: 350px;
		overflow: hidden;
		cursor: pointer;
		// -webkit-box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
		// -moz-box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
		// -o-box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
		// box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);

		.nudge-header {
			width: 100%;
			background: $secondary-color-20;
			position: relative;

			.tags {
				position: absolute;
				top: 12px;
				right: 12px;
				display: flex;
				align-items: center;
				gap: 12px;

				.tag {
					border-radius: 12px;
					padding: 1px 8px;
					background: $primary-color-80;
					color: $white;
					font-size: 0.7em;
				}
			}

			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}

		.nudge-content {
			padding: 16px 24px;
			color: $secondary-color-90;
			display: flex;
			flex-direction: column;
			gap: 16px;
			flex: 1;

			.nudge-title {
				font-size: 1.1em;
				line-height: 1.3;
				font-weight: bold;
			}

			.nudge-desc {
				font-size: 0.8em;
			}

			.nudge-point {
				margin-top: auto;
				color: $info-light;
				font-weight: bold;
				font-size: 0.8em;
			}
		}
	}
}
.brands-con {
	width: 100%;
	background: $primary-color-10;
	position: relative;
	display: flex;
	flex-direction: column;
	margin-top: 16px;

	.anchor {
		font-weight: bold;
		font-size: 0.8em;
		cursor: pointer;
		white-space: nowrap;
		width: fit-content;
		margin: 0 auto;
		padding: 4px 12px;
		background: $primary-color-50;
		color: $white;
		border-radius: 8px;
		margin-top: -12px;
	}
	.brands {
		display: flex;
		align-items: center;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 24px;
		padding: 24px;
		justify-content: space-around;

		.brand {
			height: 65px;
			width: 130px;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;

			img {
				height: 100%;
				width: 100%;
				mix-blend-mode: multiply;
				object-fit: contain;

				&:hover {
					opacity: 0.8;
				}
			}
		}
	}
}
@media (min-width: 672px) {
	.navigators {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.main-container {
		padding-top: 48px;
	}
	.events {
		&__title {
			padding: 0px 7% !important;
		}
		&__subtitle {
			padding: 0px 7% !important;
		}
	}
	.nudges {
		padding: 24px 7% !important;
	}
	.brands {
		padding: 24px 7% !important;
	}
}

@media (max-width: 800px) {
	.welcome-wrapper {
		max-width: 500px;
		margin: 0 auto;
	}

	.nudges {
		.nudge {
			max-width: 250px;
			min-width: 250px;

			.nudge-title {
				font-size: 1em !important;
			}
		}
	}

	.brands {
		.brand {
			height: 35px;
			width: 100px;
		}
	}

	.events {
		&__title {
			width: 100%;
			display: flex;
			justify-content: space-between;
			padding: 0px 24px;
			gap: 16px;

			.title-con {
				width: 100%;
				justify-content: space-between;
			}
		}
	}
}

@media (max-width: 650px) {
	.head-container {

		.head-overlay {
			gap: 10px;
		}
		.head-title {
			color: $white;
			font-size: 1.3em;
			font-family: 'Akzidenz Grotesk Super';
		}

		.head-subtitle {
			font-size: 0.7em;
		}
		.head-btn {
			font-size: 0.7em;
		}
	}
}
</style>
