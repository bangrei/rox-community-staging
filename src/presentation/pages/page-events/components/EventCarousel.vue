
<template>
	<carousel ref="carousel" :transition="1000" :wrap-around="true" :autoplay="false" 
		@mouseover="togglePlay($event)" 
		@mouseleave="togglePlay($event)" 
		@click="togglePlay($event)">
		<slide v-for="content in contents" :key="content.index">
			<img v-lazyload class="carousel-img" :class="className" :alt="content.id" :data-url="content.image"/>
		</slide>
		<template #addons v-if="contentLength > 1">
			<navigation>
				<template #next><span class="carousel__icon material-icons-outlined md-32">chevron_right</span></template>
				<template #prev><span class="carousel__icon material-icons-outlined md-32">chevron_left</span></template>
			</navigation>
            <div class="pagination__custom">
                <pagination />
            </div>
		</template>
	</carousel>
</template>

<script>
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import { reactive, ref } from "vue";
import { Carousel, Navigation, Pagination, Slide } from 'vue3-carousel';
import 'vue3-carousel/dist/carousel.css';

export default {
	name: "EventCarousel",
	mixins: [utility],
	components: {
		Carousel,
		Slide,
		Pagination,
		Navigation,
	},
    props: {
		banners: {
			type: Array,
			default: () => []
		},
		className: {
			type: String,
			default: ""
        },
        square: {
			type: Boolean,
			default: false
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
		togglePlay(event) {
			switch (event.type) {
				case "click":
					if (this.autoPlayTimer > 0)
						this.letsPause();
					else
						this.letsPlay();
					break;
				case "mouseover":
					if(this.isDesktop) this.letsPause();
					break;
				case "mouseleave":
				default:
					this.letsPlay();
					break;
			}
		},
		letsPlay(){
			this.autoPlayTimer = 3000;
			this.$refs.carousel.next();
		},
		letsPause(){
			this.autoPlayTimer = 0;
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
			margin: 0px auto;
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            padding: 10px 0;
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
		object-fit: cover;
		aspect-ratio: 4/3;
        &.square {
            aspect-ratio: 1/1 !important;
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
