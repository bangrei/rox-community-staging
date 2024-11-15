<template>
	<div class="product-grid">
		<div class="etalase-con" :class="{'in-line': inLine, 'nobox': nobox, 'no-padding': noPadding, 'grid-3': gridColumns == 3}" v-if="!isEmpty(currentProducts)">
			<div class="etalase-item" :class="{'changing': changing, 'prepare': !changing}"
				v-for="(prd, ix) in currentProducts" 
				:key="ix"
				>
				<div class="overlay img-ratio custom-ratio ratio-43" 
					:class="{'no-image': !getImage(prd)}"
					@click="seeProductDetails(prd)">
					<span class="cart-marker material-icons-outlined" v-if="prd.cart">assignment_turned_in</span>
					<img v-lazyload v-if="getImage(prd)" :data-url="getImage(prd)" :alt="prd.name"/>
					<img v-lazyload v-else :data-url="require('@/assets/images/rox-logo-new.png')" :alt="prd.name"/>
				</div>
				<div class="etalase-content">
					<span class="label" @click="seeProductDetails(prd)">{{ prd.categoriesDisplay }}</span>
					<span class="sub-label" @click="seeProductDetails(prd)">{{ prd.name }}</span>
					<div class="price-wrapper">
						<span class="promo-price" v-if="prd.promoPrice > 0" @click="seeProductDetails(prd)">{{ currency(prd.originalPrice) }}</span>
						<span class="price" @click="seeProductDetails(prd)">{{ prdPrice(prd) }}</span>
					</div>
					<div class="icons" v-if="!nobox">
						<div class="icon-wrapper">
							<span class="material-icons-outlined" :class="{'favorite': prd.favorite }" @click="clickFavorite(prd)">{{ prd.favorite ? 'favorite' : 'favorite_border' }}</span>
							<span class="material-icons-outlined" @click="toggleZoom(prd)">visibility</span>
						</div>
						<div class="icon-wrapper" @click="seeProductDetails(prd)">
							<span class="dark icon-lg material-icons-outlined">add_circle</span>
						</div>
					</div>
				</div>
			</div>
			<div class="etalase-item" v-if="showMoreGrid">
				<div class="overlay grid-layer img-ratio custom-ratio ratio-43" @click="viewCategory()">
					<span>View All {{ products.length }} items</span>
					<span>{{ currentCategory.name }}</span>
				</div>
			</div>
		</div>
		<div class="empty-products" v-if="isEmpty(currentProducts) && !loading">
			No products..
		</div>
		<div class="load-more" v-if="showMore" @click="loadMore()">Load More</div>

		<base-modal :show="zoom">
			<template v-slot:header>
				<div class="modal-header">
					<span @click="toggleZoom()" class="modal-close-btn material-icons-outlined">close</span>
					<h3>{{ zoomProduct.name }}</h3>
				</div>
			</template>
			<template v-slot:body>
				<div class="modal-body">
					<vue-image-zoomer v-if="zoom"
						:src="zoomProduct.imageDisplay"
						:zoom-src="zoomProduct.imageDisplay"
						:zoom-type="'click'"
						:zoom-scale="1.5"
						:fullscreen-on-mobile="false"
					></vue-image-zoomer>
				</div>
			</template>
		</base-modal>
	</div>
</template>

<script>
import { isEmpty } from "lodash";
import utility from "@/presentation/mixins/utility.js";
import { addFavorite, unFavorite } from "@/connector/productConnector";
import BaseModal from "@/components/base/BaseModal.vue";
import VueImageZoomer from 'vue-inner-image-zoom';
import 'vue-inner-image-zoom/lib/vue-inner-image-zoom.css';
export default {
	mixins: [utility],
	props: {
		products: {
			type: Array,
			default: () => []
		},
		moreButton: {
			type: Boolean,
			default: true,
		},
		inLine: {
			type: Boolean,
			default: false,
		},
		nobox: {
			type: Boolean,
			default: false,
		},
		maxGrid: {
			type: Number,
			default: 0,
		},
		gridColumns: {
			type: Number,
			default: 4,
		},
		currentCategory: {
			type: Object,
			default: () => {}
		},
		noPadding: {
			type: Boolean,
			default: false,
		}
	},
	components: {
        BaseModal,
		VueImageZoomer
	},
	data() {
		return {
			zoom: false,
			zoomProduct: "",
			currentProducts: [],
			productSize: 4,
			isDesktop: false,
			changing: false,
		};
	},
	computed: {
		showMore(){
			if(isEmpty(this.products)) return false;
			return this.moreButton && this.productSize < this.products.length;
		},
		showMoreGrid() {
			return this.maxGrid > 0 && this.products.length > this.maxGrid;
		}
	},
	methods: {
		viewCategory() {
			this.$emit('moreCategory', this.currentCategory.id);
		},
		seeProductDetails(prd){
			let currentOutlet = this.$store.getters.getCurrentOutlet;
			this.$router.push({
                name: "ProductDetails",
                params: {
					outlet: currentOutlet.apiCode,
                    productId: prd.id,
					edit: !isEmpty(prd.cart) ? prd.cart.id : null
                },
            });
		},
		loadMore(){
			this.productSize += 10;
			let newProducts = this.products.slice(this.currentProducts.length, this.productSize);
			if (!isEmpty(newProducts)) {
				this.setupProducts(newProducts).forEach((p) => {
					this.currentProducts.push(p);
				});
				setTimeout(() => {
					this.resizeImageHandler();
				}, 10);
			}
			this.$emit('loadMore');
		},
		finalizeProducts(prd) {
			if (this.maxGrid > 0) {
				let items = this.setupProducts(prd);
				this.currentProducts = items.slice(0, this.maxGrid);
			} else {
				this.currentProducts = this.setupProducts(prd);
			}
			this.changing = false;
			this.loading = false;
			window.addEventListener('resize', () => {
				this.resizeImageHandler();
			});
			setTimeout(() => {
				this.changing = true;
				this.resizeImageHandler();
			}, 50);
		},
		setCurrentProducts() {
			if (!isEmpty(this.products)) {
				let categories = this.$store.getters.getCategories.map((n) => { return {id:n.id,name:n.name} });
				this.products.forEach((it) => {
					let categoriesDisplay = categories.filter((n) => {
						return it.categories.indexOf(n.id) > -1;
					}).map((n) => { return n.name });
					it.categoriesDisplay = categoriesDisplay.join(" | ");
					it.favorite = it.favorite || this.isFavorite(it.id);
				});
			}
			if(this.moreButton && this.products.length > this.productSize){
				let prd = this.products.slice(0,this.productSize);
				return this.finalizeProducts(prd);
			}
			this.finalizeProducts(this.products);
		},
		isFavorite(productId){
			return this.isFavoriteProduct(productId)
		},
		toggleZoom(prd){
			if(!this.zoom){
				if(isEmpty(prd.imageId)) return;
			}
			this.zoom = !this.zoom;
			if(isEmpty(prd)) return;
			this.zoomProduct = prd;
			this.zoomProduct.imageDisplay = this.getImage(prd);
		},
		async clickFavorite(prd) {
			if (this.isGuestCustomer()) return;
			try {
				let idx = this.currentProducts.findIndex((it) => {
					return it.id == prd.id;
				});
				if(idx == -1) return;
				if(prd.favorite){
					let res = await unFavorite(prd.id);
					if(!res.success) return this.showNotification("warning", "error_outline", res.message);
					this.$store.dispatch("unFavorite", prd.id);
					this.currentProducts[idx].favorite = false;
				} else {
					let res = await addFavorite(prd.id);
					if(!res.success) return this.showNotification("warning", "error_outline", res.message);
					this.$store.dispatch("addFavorite", prd.id);
					this.currentProducts[idx].favorite = true;
				}
			} catch (error) {
				this.showNotification("warning", "error_outline", error);
			}
		},
		prdDesc(prd){
			if(isEmpty(prd.description)) return "";
			return prd.description.substring(0,20);
		},
		prdPrice(prd){
			if(isEmpty(prd.variants)) return this.currency(prd.price);
			return this.currency(prd.variants[0].price);
		},
		getImage(prd){
			let image = prd.imageId || prd.image2Id || prd.image3Id;
            if(!image) return "";
            return this.$store.getters.cloudinaryURL + "" + image;
        },
	},
	async created() {
		this.loading = true;
		setTimeout(() => {
			this.isDesktop = window.innerWidth >= 672;
			this.productSize = this.isDesktop ? 8 : 4;
			this.setCurrentProducts();
		}, 100);
	}
};
</script>

<style lang="scss">
	.empty-products {
		height: 400px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.product-grid {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 16px;
		background: $white;
	}
	.etalase-con {
		width: 100%;
		padding: 24px;
		display: grid;
		column-gap: 16px;
		row-gap: 16px;
		grid-template-columns: repeat(auto-fill, minmax(45%, 1fr));
		overflow: hidden;
		overflow-x: auto;

		&.in-line {
			display: flex;
			gap: 16px;

			.etalase-item {
				max-width: 250px;
				min-width: 250px;
				-webkit-animation-duration: 0.3s;
				animation-duration: 0.3s;
				-webkit-animation-fill-mode: both;
				animation-fill-mode: both;
				-webkit-animation-name: fadeInDown;
				animation-name: fadeInDown;

				.overlay {
					height: 300px;
				}
			}
		}

		&.nobox {
			.overlay {
				-webkit-box-shadow: none !important;
				-moz-box-shadow: none !important;
				-o-box-shadow: none !important;
				box-shadow: none !important;
				height: 170px !important;
			}
			.etalase-content {
				.label {
					text-align: center;
				}
				.sub-label {
					text-align: center;
					margin-bottom: 16px;
				}
				.price-wrapper {
					.price {
						font-weight: bold;
						color: $secondary-color-80 !important;
						font-size: 1.2em;
					}
				}
			}
		}
		&:is(.no-padding) {
			padding: 16px 8px !important;
		}

		.etalase-item {
			flex: 1;
			position: relative;

			&.prepare {
				opacity: 0;
			}

			&.changing {
				-webkit-animation-duration: 0.3s;
				animation-duration: 0.3s;
				-webkit-animation-fill-mode: both;
				animation-fill-mode: both;
				-webkit-animation-name: fadeInDown;
				animation-name: fadeInDown;
			}

			.overlay {
				width: 100%;
				height: 200px;
				background: $white;
				overflow: hidden;
				border-radius: 8px;
				-webkit-box-shadow: 1px 0px 15px rgba(0, 0, 0, 0.1);
				-moz-box-shadow: 1px 0px 15px rgba(0, 0, 0, 0.1);
				-o-box-shadow: 1px 0px 15px rgba(0, 0, 0, 0.1);
				box-shadow: 1px 0px 15px rgba(0, 0, 0, 0.1);
				position: relative;
				&.grid-layer {
					display: flex;
					flex-direction: column;
					gap: 8px;
					align-items: center;
					justify-content: center;
					background: $primary-color-10;
					color: $primary-color-80;
					font-weight: bold;
					cursor: pointer;
					&:hover{
						opacity: 0.7;
					}
				}

				.cart-marker {
					position: absolute;
					top: 8px;
					right: 8px;
					color: $success-green;
				}

				&.no-image {
					background: $secondary-color-10 !important;
					display: flex;
					align-items: center;
					justify-content: center;
					-webkit-box-shadow: none;
					-moz-box-shadow: none;
					-o-box-shadow: none;
					box-shadow: none;
					background: $primary-color-10 !important;

					img {
						transform: scale(0.5);
						opacity: 0.5;
					}
				}

				img {
					width: 100%;
					height: 100%;
					object-fit: contain;
					mix-blend-mode: multiply;
				}
			}

			.etalase-content {
				width: 100%;
				padding: 16px 6px;
			}

			.label {
				text-align: left;
				font-size: 0.9em;
				display: block;
				color: $primary-color-60;
				font-weight: bold;
				text-transform: uppercase;
				width: 100%;
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
			}
			.sub-label {
				text-align: left;
				font-size: 0.9em;
				display: block;
				margin-top: 8px;
				width: 100%;
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
			}
			.price-wrapper {
				font-size: 0.9em;
				text-align: left;
				margin-top: 8px;
				display: flex;
				align-items: center;
				gap: 16px;
				color: $secondary-color-50;
				.promo-price {
					position: relative;
					display: flex;
					&::before {
						content: "";
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						height: 2px;
						margin: auto;
						background: $primary-color-60;
					}
				}
			}
			.action {
				display: block;
				width: fit-content;
				padding: 8px 18px;
				border-radius: 12px;
				background: $white;
				color: #000;
				font-weight: bold;
				margin: 16px auto;
			}
			.icons {
				width: 100%;
				display: flex;
				justify-content: space-between;
				align-items: center;
				gap: 16px;
				padding: 6px 0;

				.icon-wrapper {
					display: flex;
					gap: 16px;
					align-items: center;

					* {
						color: $secondary-color-50;

						&.dark {
							color: $secondary-color-90 !important;
						}
						&.favorite {
							color: $primary-color-60 !important;
						}
					}

					.icon-lg {
						font-size: 2em;
					}
				}
			}
		}
	}
	.zoom-image {
		object-fit: cover;
		margin: auto;
		height: 100%;
		object-position: center;
	}

	.load-more {
		width: fit-content;
		margin: 16px auto;
		padding: 12px 32px;
		background: $primary-color-50;
		border-radius: 16px;
		color: $white;
		font-weight: bold;
	}
	@media (min-width: 672px) {
		.etalase-con {
			grid-template-columns: repeat(auto-fill, minmax(22%, 1fr));
			&:not(.no-padding){
				padding: 24px 7% !important;
			}
			&:is(.grid-3) {
				grid-template-columns: repeat(auto-fill, minmax(30%, 1fr)) !important;
			}

			.label {
				cursor: pointer;
			}
			.action {
				cursor: pointer;
			}
			.icons {
				.icon-wrapper {
					cursor: pointer;
				}
			}
		}
		.load-more {
			cursor: pointer;
		}
	}
	@media (max-width: 672px) {
		.etalase-con {
			grid-template-columns: repeat(auto-fill, minmax(33%, 1fr));
		}
	}
	    
	@keyframes fadeInDown {
        0% {
            opacity: 0;
            transform: translateY(-20px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
