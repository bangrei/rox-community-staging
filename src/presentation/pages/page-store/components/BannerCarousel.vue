<template>
	<carousel ref="carousel" :transition="500" :wrap-around="true" :autoplay="autoPlayTimer">
		<slide v-for="content in contents" :key="content.index">
			<img v-lazyload class="carousel-img" :class="className" v-if="useImage" :alt="content.name" :data-url="content.image"/>
			<div v-else class="landing-background-img" :class="content.image"></div>
		</slide>
		<template #addons v-if="contentLength > 1">
			<navigation>
				<template #next><span class="carousel__icon material-icons-outlined md-32">arrow_forward</span></template>
				<template #prev><span class="carousel__icon material-icons-outlined md-32">arrow_back</span></template>
			</navigation>
			<div class="pagination__custom" :class="{'inside': inside}">
				<span class="pagination__icon material-icons" @click="letsPlay()" :class="{'active': autoPlayTimer > 0}">play_circle</span>
				<div class="pagination__main">
					<pagination />
				</div>
				<span class="pagination__icon material-icons" @click="letsPause()" :class="{'active': autoPlayTimer == 0}">pause_circle</span>
			</div>
		</template>
	</carousel>
</template>

<script>
import { ref, reactive } from "vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import 'vue3-carousel/dist/carousel.css';
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel';

export default {
	name: "BannerCarousel",
	mixins: [utility],
	components: {
		Carousel,
		Slide,
		Pagination,
		Navigation
	},
    props: {
		fullScreen: {
			type: Boolean,
			default: false,
		},
		useImage: {
			type: Boolean,
			default: false,
		},
		customSwiper: {
			type: Boolean,
			default: false,
		},
		posCenter: {
			type: Boolean,
			default: false,
		},
		inside: {
			type: Boolean,
			default: false,
		},
		banners: {
			type: Array,
			default: () => []
		},
		className: {
			type: String,
			default: ""
		},
		manualSlide: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			swiperRef: null,
			contents: null,
			currentContent: null,
			currentActiveIndex: 0,
			isDesktop: true,
			slidesPerView: 1,
			autoPlayTimer: 2000,
		};
	},
	computed: {
		contentLength(){
			let num = this.contents.length;
			let perView = this.slidesPerView;
			let len = Math.ceil(num/perView);
			if(num % perView > 0) len += 1;
			return len;
		}
	},
	watch: {
		autoPlayTimer(val) {
			if (!this.$refs.carousel) return;
			this.$refs.carousel.data.config.autoplay = val;
			this.$refs.carousel.restartCarousel();
		}
	},
	methods: {
		letsPlay(){
			if(this.autoPlayTimer == 0) {
				this.autoPlayTimer = 2000;
				this.$refs.carousel.next();
			}
		},
		letsPause(){
			if(this.autoPlayTimer > 0) {
				this.autoPlayTimer = 0;
			}
		},
		setSwiperRef(swiper) {
			this.swiperRef = swiper;
		},
		onSlideChange() {
			this.currentContent.value = this.contents[this.swiperRef.activeIndex];
		},
		slideTo(index) {
			this.swiperRef.slideTo(index);
			this.currentActiveIndex = index;
		},
		slidePrev() {
			this.swiperRef.slidePrev();
			this.currentActiveIndex--;
		},
		resizeBannerHandler(){
            this.isDesktop = window.innerWidth >= 672;
			this.slidesPerView = 1;
        },
	},
	async created() {
		try {
			this.swipeSpeed = 250;
			this.contents = ref(this.banners);
			this.currentContent = reactive({});
			if(!isEmpty(this.contents)) this.currentContent.value = this.contents[0];
			if (this.contentLength <= 1) this.autoPlayTimer = 0;
			if (this.manualSlide == true) this.autoPlayTimer = 0;
			window.addEventListener("resize",  this.resizeBannerHandler);
            setTimeout(() => {
                this.resizeBannerHandler();
            }, 500);
		} catch (error) {
			console.log(error);
		}
	},
};
</script>

<style scoped lang="scss">
	.pagination {
		&__custom {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
			margin: 10px 0 0;

			&.inside {
				margin-top: -30px;
			}
		}
		&__main {
			display: flex;
			align-items: center;
			z-index: 2;

			.carousel__pagination {
				margin: 0;
			}
		}
		&__icon {
			color: $white;
			cursor: pointer;
			z-index: 2;

			&.active {
				opacity: 0.6;
				cursor: auto;
			}
		}
	}
	.swiper {
		height: 200px !important;
		&.custom-swiper {
			height: auto !important;
		}
	}
	@keyframes fadein {
		0% {
			opacity: 0;
		}

		100% {
			opacity: 1;
		}
	}

	.landing-swipper-con {
		z-index: 1;
	}

	.carousel-img {
		width: 100%;
		object-fit: contain;
		aspect-ratio: 16/9;
		&.ratio-auto {
			aspect-ratio: 3/4 !important;
		}
	}

	.landing-background-img {
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center;
		height: 100%;

		&.image-1 {
			background-image: url("@/assets/images/landing_1.jpg");
		}

		&.image-2 {
			background-image: url("@/assets/images/landing_2.jpg");
		}

		&.image-3 {
			background-image: url("@/assets/images/landing_3.jpg");
		}
	}

	.landing-content-wrapper {
		position: relative;
		z-index: 2;
	}

	.landing-content-con {
		text-align: left;
		padding: 24px;
		background: linear-gradient(
			180deg,
			rgba(15, 23, 42, 0) -9.29%,
			#0f172a 100%
		);
		backdrop-filter: blur(20px);
		border-radius: 12px 12px 0px 0px;
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;

		.title {
			margin-bottom: 16px;
			position: relative;
		}
	}

	.progress-con {
		padding: 16px 0;
	}

	.swiper {
		height: 100%;
	}
	@media (min-width: 672px) {
		.progress-con {
			padding: 16px 7% !important;
		}
	}
	@media (max-width: 672px) {
		.swiper {
			&.custom-swiper {
				height: 400px !important;

				img {
					height: 100%;
					width: auto;
					margin: auto;
				}
			}
		}
	}
</style>
