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
								alt="rox logo"
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
						<base-desktop-nav :no-search="true" :active-footer-id="3"></base-desktop-nav>
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
			<!--
			<div class="canopy-con hide-canopy"
				@hook:mounted="setCompletionPointsAnimation()"
				ref="canopy">
				<div class="canopy-wrapper centered" v-show="customer.points > 0" @click="goTo('PointsPage')">
					<div class="point-notification-con">
						<div class="sd-badge sd-badge-icon sd-badge-custom">
							<span class="material-icons">star</span>
							<span class="sd-badge-font">{{ customer.points }} points</span>
						</div>
					</div>
					<div class="more-points">
						<span>see point details</span>
						<base-badge
							badgeLabel=""
							iconName="chevron_right"
							class="sd-badge-md"
						/>
					</div>
				</div>
			</div>
			-->

			<div class="feeds" v-if="showFeeds">
				<div 
					class="feed points"
					@click="goTo('PointsPage')">
					<span class="material-icons-outlined">star</span>
					<span class="feed-label">{{ customer.points ? customer.points : '0' }} points</span>
					<span class="material-icons-outlined">chevron_right</span>
				</div>
				<div 
					class="feed" :class="{ active: isForYou == true }"
					@click="handleForYou()">
					<span class="material-icons-outlined">person</span>
					<span class="feed-label">For You</span>
				</div>
				<div 
					class="feed" :class="{ active: feed.isActive }"
					v-for="(feed) in feedNavs" 
					:key="feed.id"
					@click="handleFeedClick(feed)">
					<span class="material-icons-outlined">{{ feed.icon }}</span>
					<span class="feed-label">{{ feed.name }}</span>
				</div>
			</div>
			<div class="feeds-divider" v-if="showFeeds"></div>

			<home-empty-nudge
				v-if="allNudgesRead && !loading && showFeeds"
				heading="Congrats"
				subHeading="You have read all the messages."
				message="Come back for more or click the above categories to read again."
			>
			</home-empty-nudge>
			<div class="nudge-card-con" v-if="showFeeds" :class="{'blurred-data': loadingData}">
				<div class="loading-data-con" v-if="loadingData">
					<div class="loading-data">
						<div class="dot-loading"></div>
						<p class="body-2-regular bold loading-text primary-color-70">
							Loading ...
						</p>
					</div>
				</div>
				<div class="nudge-column" v-for="(col, n) in nudgeColumns(validNudges)" :key="n">
					<home-nudge-card
						v-for="nudge in col"
						:key="nudge.id"
						:nudge="nudge"
						@nudge-clicked="nudgeClicked"
					></home-nudge-card>
				</div>
			</div>

			<!--
			<div class="home__floating-btn__con">
				<div class="support-con">
					<base-icon
						class="sd-icon-btn-xsm sd-icon-btn-ghost"
						iconName="help_outline"
						iconSize="lg"
						@click="goTo('FAQ')"
					></base-icon>
				</div>
				<div class="support-con">
					<base-icon
						class="sd-icon-btn-xsm sd-icon-btn-ghost"
						iconName="photo_camera"
						iconSize="lg"
						@click="goTo('BarcodePage')"
					></base-icon>
				</div>
				<div class="support-con">
					<base-icon
						class="sd-icon-btn-xsm sd-icon-btn-ghost"
						iconName="all_out"
						iconSize="lg"
						@click="handleForYou()"
					></base-icon>
				</div>
				<div class="support-con">
					<base-icon
						class="sd-icon-btn-xsm sd-icon-btn-ghost"
						iconName="logout"
						iconSize="lg"
						@click="logout"
					></base-icon>
				</div>
			</div>
			-->
		</template>
		<template v-slot:footer>
			<base-footer-nav :active-footer-id="3"></base-footer-nav>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import HomeNudgeCard from "./components/HomeNudgeCard.vue";
import HomeEmptyNudge from "./components/HomeEmptyNudge.vue";
import { isEmpty } from "lodash";
import { homeService } from "@/bloc/services";
import utility from "@/presentation/mixins/utility.js";
import { nextTick } from "vue";

export default {
	name: "FeedPage",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
		HomeNudgeCard,
		HomeEmptyNudge,
	},
	data() {
		return {
			nudges: [],
			selectedTagNames: [],
			customer: {},
			loading: false,
			isForYou: false,
			isDesktop: false,
			feedNavs: [
				{
					id: 0,
					name: "Gear Guides",
					icon: "backpack",
					isActive: true,
				},
				{
					id: 1,
					name: "Skills",
					icon: "hardware",
					isActive: false,
				},
				{
					id: 2,
					name: "Checklists",
					icon: "checklist",
					isActive: false,
				},
			],
			activeFeed: null,
			activeFooterNavId: 1,
			loadingData: false,
			scrollTop: 0,
			validNudges: [],
		};
	},
	watch: {
		// TODO: plenty of hack to make sure this work, usage of @hook:mounted, find a better way
		// https://dev.to/the_one/8-secrets-vue-developers-must-know-5la#how-to-know-if-a-child-component-is-mounted-
		"customer.points"(val) {
			if (val > 0) this.setCompletionPointsAnimation();
		},
		"activeFeed"(){
			this.retrieveNudges();
		}
	},
	computed: {
		showFeeds(){
			return this.activeFooterNavId == 1;
		},
		welcomeMessage() {
			let name = !isEmpty(this.customer)
				? this.customer.firstName[0].toUpperCase() +
				  this.customer.firstName.substring(1).toLowerCase()
				: "";
			return `${homeService.getDayGreeting()}, ${name}`;
		},
		allNudgesRead() {
			return isEmpty(this.nudges.filter((it) => it.status == "NOT_READ"));
		},
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
		nudgeColumns(nudges){
			let items = [];
			if(isEmpty(nudges)) return items;
			nudges.forEach((n, i) => {
				let idx = i%3;
				if(!items[idx]) items[idx] = [];
				items[idx].push(n);
			});
			return items;
		},
		handleFeedClick(feed) {
			this.isForYou = false;
			this.feedNavs.map((it) => (it.isActive = false));
			this.activeFeed = feed;
			if (!feed) return;
			this.feedNavs.find((it) => it.id == feed.id).isActive = true;
			this.stateFeed(feed);
			this.setValidNudges();
		},
		stateFeed(feed) {
			this.$store.dispatch("setStateFeedsPage", {
				currentTab: feed || null,
				scrollTop: this.scrollTop,
				scrollLeft: this.scrollLeft,
				isForYou: this.isForYou
			});
		},
		setValidNudges() {
			let result = this.nudges;
			const activeFeed = this.feedNavs.find(
				(feed) => feed.isActive
			);

			result = result.filter((it) => {
				if (!activeFeed && this.isForYou) {
					if(!isEmpty(this.customer.interests)) {
						let interests = this.customer.interests.split(',').map((item) => {
							return {
								item: item.trim(),
								selected: it.tags.includes(item.trim())
							}
						});
						return interests.filter((f) => { return f.selected }).length > 0;
					}
					return false;
				}
				return it.tags.includes(activeFeed.name);
			});

			this.validNudges = result;
		},
		handleForYou(){
			this.feedNavs.map((it) => (it.isActive = false));
			this.activeFeed = null;
			this.isForYou = true;
			this.stateFeed();
			this.setValidNudges();
		},
		async retrieveNudges(){
			try {
				this.loadingData = true;
				const allNudges = await homeService.getAllNudges();
				this.nudges = homeService.getValidNudges(allNudges);
				this.loadingData = false;
			} catch (error) {
				this.loadingData = false;
			}
		},
		retrieveTags(){
			let feeds = [];
			let feedState = this.$store.getters.getStateFeedsPage;
			let currentTab = feedState.currentTab;
			let currentScroll = feedState.scrollTop;
			let currentScrollLeft = feedState.scrollLeft;
			let isForYou = feedState.isForYou;
			if(!isEmpty(this.nudges)){
				let tags = [];
				this.nudges.forEach((n) => {
					if(!isEmpty(n.tags)){
						n.tags.forEach((tag) => {
							if(!tags.includes(tag)){
								tags.push(tag);
							}
						});
					}
				});
				tags.sort((a,b) => { return a.localeCompare(b) });
				const icons = [
					"backpack","hardware","dataset","light","view_timeline",
					"room_service","grass","door_front","token","apps"
				];
				
				tags.forEach((tag, index) => {
					const iconIndex = index < icons.length 
						? index
						: index % icons.length;
					feeds.push({
						id: feeds.length,
						name: tag,
						icon: icons[iconIndex],
						isActive: feeds.length == 0
					});
				});
			}
			if (currentTab) {
				let currentFeed = feeds.find((f) => f.id == currentTab.id && f.name == currentTab.name);
				if(currentFeed){
					feeds.map((f) => {
						f.isActive = false;
						if (f.id == currentFeed.id) f.isActive = true;
						return f;
					});
				}
			}
			if (isForYou) {
				feeds.map((it) => it.isActive = false);
				this.isForYou = true;
			}
			this.feedNavs = feeds;
			this.setValidNudges();
			
			let self = this;
			document.querySelector('.sd-base-con').addEventListener("scroll", (e) => {
				self.scrollTop = e.target.scrollTop;
				let feed = self.feedNavs.find(
					(feed) => feed.isActive
				);
				self.stateFeed(feed);
			});
			document.querySelector('.feeds').addEventListener("scroll", (e) => {
				self.scrollLeft = e.target.scrollLeft;
				let feed = self.feedNavs.find(
					(feed) => feed.isActive
				);
				self.stateFeed(feed);
			});
			if (currentTab) {
				setTimeout(() => {
					document.querySelector('.sd-base-con').scrollTop = currentScroll;
					document.querySelector('.feeds').scrollLeft = currentScrollLeft;
				}, 500);
			}
		},
		nudgeClicked(nudge) {
			let pageToGo = "";
			switch (nudge.type) {
				case "QUESTIONNAIRE":
					pageToGo = "SurveyPage";
					break;
				case "ARTICLE":
					pageToGo = "ArticlePage";
					break;
				case "SURPRISE":
					pageToGo = "SurprisePage";
					break;
			}

			if (pageToGo) {
				this.$router.push({
					name: pageToGo,
					params: {
						nudgeId: nudge.id,
					},
				});
			}
		},
		setCustomerDetail() {
			this.customer = this.$store.getters.getCustomer;
		},
		async setCompletionPointsAnimation() {
			// show/hide points on scroll (only on mounted hook);
			await nextTick();
			const observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("show-canopy");
					} else {
						entry.target.classList.remove("show-canopy");
					}
				});
			});

			let element = this.$refs.canopy;
			if (element) observer.observe(element);
		},
	},
	async created() {
		try {
			this.isDesktop = window.innerWidth >= 672;
			window.addEventListener('resize', () => {
                this.isDesktop = window.innerWidth >= 672;
            });
			this.loading = true;
			this.loadingData = false;
			const allNudges = await homeService.getAllNudges();
			this.nudges = homeService.getValidNudges(allNudges);
			const mandatoryNudge = homeService.getMandatoryNudge(allNudges);
			if (mandatoryNudge) {
				this.$router.push({
					name: "SurveyPage",
					params: {
						nudgeId: mandatoryNudge.id,
					},
				});
			}

			this.$store.dispatch("setNudges", this.nudges);
			if(!this.$store.getters.hasInited) 
				await this.refreshMainData();
			else 
				await this.refreshCustomerData();
			this.setCustomerDetail();
			this.retrieveTags();
			this.loading = false;
		} catch (error) {
			this.feedNavs = [];
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
		}
	},
};
</script>

<style scoped lang="scss">
	.point-notification-con {
		width: 100%;
		z-index: 1;
		padding: 0 16px;
		display: flex;
		align-items: center;

		.sd-badge {
			margin: 0 auto;

			&.sd-badge-custom {
				gap: 10px;
				display: flex;
				align-items: center;
				flex-direction: row;
				justify-content: center;
				color: $white;
				width: fit-content;
				color: white;
				border-radius: 0px 0px 16px 16px;
				cursor: pointer;
				width: 100%;

				.material-icons {
					font-size: 1.8em;
				}

				.sd-badge-font {
					font-weight: bold;
					font-size: 1.2em;
				}
			}
		}
	}

	.canopy-con {
		margin: 0 32px;
		padding: 24px;
		min-height: 50px;
		position: relative;

		.canopy-wrapper {
			position: absolute;
			top: 0px;
			left: 0;
			right: 0;
			display: grid;
			grid-template-columns: auto 1fr;
			align-items: center;
			background-color: $secondary-color-50;
			color: $white;
			border-radius: 0 0 16px 16px;
			padding: 8px;

			&.centered {
				display: flex;
				align-items: center;
				justify-content: space-between;

				.point-notification-con {
					width: auto;
				}
			}
			.more-points {
				display: flex;
				align-items: center;
				white-space: nowrap;
				font-size: 0.85em;
				cursor: pointer;
			}

			.scan-icon {
				cursor: pointer;
			}

			.scan-icon + .point-notification-con {
				border-left: 1px solid #cecece;
				margin-left: 18px;
				padding: 0;
				.sd-badge-custom {
					background-color: transparent;
					border-radius: 0;
				}
			}
		}
	}

	.nudge-card-con {
		display: flex;
		justify-content: center;
		flex-direction: column;
		gap: 16px;
		padding: 16px;
		width: 100%;

		.nudge-column {
			width: 100%;
			display: flex;
			flex-direction: column;
			gap: 16px;
		}

		&.blurred-data { 
			.nudge-card {
				filter: blur(2px);
				-webkit-filter: blur(2px);
				-moz-filter: blur(2px);
				-o-filter: blur(2px);
			}
		}
	}

	.home__floating-btn__con {
		position: fixed;
		bottom: 77px;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 16px;

		@media (min-width: 480px) {
			max-width: 480px;
		}

		@media (min-width: 672px) {
			max-width: 672px;
		}

		.support-con {
			border-radius: 50%;
			background-color: $white;
			transition: all 0.2s ease-in-out;
			opacity: 0.6;

			&:hover {
				transform: scale(1.1);
				opacity: 1;
			}
		}
	}

	.home-tag-con {
		margin: 16px;
	}

	.hide-canopy {
		opacity: 0;
		transition: all 0.65s ease-in-out;
	}

	.show-canopy {
		opacity: 1;
	}

	@keyframes iconShake {
		0% {
			transform: rotate(0);
		}
		25% {
			transform: rotate(3deg);
		}
		50% {
			transform: rotate(-3deg);
		}
		75% {
			transform: rotate(1deg);
		}
		90% {
			transform: rotate(-1deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	.feeds {
		display: flex;
		width: 100%;
		overflow-x: auto;
		align-items: center;
		justify-content: flex-start;
		position: relative;

		.feed {
			padding: 24px 0;
			cursor: pointer;
			font-size: 0.75rem;
			line-height: 0.875rem;
			letter-spacing: 0.025rem;
			position: relative;
			display: flex;
			align-items: center;

			.material-icons {
				font-size: 16px;
			}

			.feed-label {
				white-space: nowrap;
			}

			* + * {
				margin-left: 8px;
			}

			& + .feed {
				margin-left: 32px;
			}

			&.points {
				padding: 24px 8px;

				&::before {
					content: "";
					position: absolute;
					left: 0;
					right: 0;
					top: 0;
					bottom: 12px;
					z-index: -1;
					background: linear-gradient(90deg, $secondary-color-50, $secondary-color-20);
					color: $secondary-color-80;
				}

				.feed-label {
					border-radius: 8px;
					padding: 6px 24px;
					background: $white;
					color: $secondary-color-70;
				}
			}

			&.active {
				color: $primary-color-60;
				&::before {
					content: "";
					position: absolute;
					width: 100%;
					height: 3px;
					left: 0px;
					bottom: 12px;
					background-color: $primary-color-60;
					transition: all 0.5s;
					z-index: 10;
				}
			}
		}
	}
	.feeds-divider {
		width: 100%;
		position: relative;

		&::before {
			content: "";
			border-bottom: 1px solid #F1F1F1;
			position: absolute;
			left: 0;
			right: 0;
			bottom: 12px;
		}
	}
	.loading-data-con {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;

		.loading-data {
			height: 100%;
			width: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;

			.loading-text {
				margin-top: 40px;
			}
			.dot-loading {
				position: relative;
				width: 12px;
				height: 12px;
				border-radius: 6px;
				background-color: transparent;
				color: $link-blue-color;
				margin: -1px 0;
				box-shadow: 0 -20px 0 0;
				animation: dotLoading 2s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);
			}

			.dot-loading::before,
			.dot-loading::after {
				content: "";
				display: inline-block;
				position: absolute;
				top: 0;
				left: 0;
				width: 12px;
				height: 12px;
				border-radius: 6px;
				background-color: transparent;
				color: $custom-blue-color;
				box-shadow: 0 -20px 0 0;
			}

			.dot-loading::after {
				color: $alert-base;
			}

			.dot-loading::before {
				animation: dotLoading 2s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);
				animation-delay: 0.3s;
			}

			.dot-loading::after {
				animation: dotLoading 1.5s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);
				animation-delay: 0.6s;
			}
		}
	}

	@keyframes dotLoading {
		0% {
			transform: rotateZ(0deg);
		}
		100% {
			transform: rotateZ(360deg);
		}
	}
	@media (min-width: 672px) {
		.feeds {
			padding: 0 7% !important;
		}
		.nudge-card-con {
			display: flex;
			justify-content: unset !important;
			flex-direction: row;
			padding: 16px 7% !important;
			flex-wrap: wrap;

			/*
			&::after {
				content: "";
				flex-grow: 999;
			}
			*/

			.nudge-column {
				flex-basis: 30%;
				flex-grow: 1;
				display: flex;
				gap: 1.2em;
				flex-direction: column;
			}
		}
	}
</style>
