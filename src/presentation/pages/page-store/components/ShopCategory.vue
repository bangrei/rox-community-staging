<template>
	<div class="cat-con" :class="{'desktop': isDesktop}">
        <div class="cat-item cat-title" v-html="label"></div>
		<div class="cat-items">
			<div class="cat-item" 
				v-for="(cat, index) in brands" 
				:key="index"
				@click="goSearch(cat)"
				>
				<div 
					class="cat-content"
					:class="{'with-image': cat.imageId != null }">
					<img v-lazyload v-if="cat.imageId" :alt="cat.name" :data-url="getImage(cat.imageId)"/>
					<span class="cat-avatar" v-else>{{ avatar(cat.name) }}</span>
				</div>
				<span class="label">{{cat.name}}</span>
			</div>
		</div>
	</div>
</template>

<script>
import { isEmpty } from "lodash";
import utility from "@/presentation/mixins/utility.js";
export default {
	mixins: [utility],
	props: {
		activities: {
			type: Object,
			default: () => {}
		},
		isDesktop: {
			type: Boolean,
			default: true,
		}
	},
    data() {
		return {
			brands: [],
            label: "",
		};
	},
	methods: {
		goSearch(brand){
			if (isEmpty(brand)) return;
			this.goToWithParams('BrandPage', {
				outlet: this.$store.getters.getCurrentOutlet?.apiCode,
				brandCode: brand.apiCode
			});
		},
		getImage(image){
            if(!image) return "";
            return this.$store.getters.cloudinaryURL + "" + image;
        },
		init(){
			if(!isEmpty(this.activities)){
				this.label = `From<br/>${this.activities.from} to ${this.activities.to}`;
				this.brands = this.activities.brands || [];
			}
		}
	},
    async created(){
        this.init();
    }
};
</script>

<style lang="scss">
	.cat-con {
		width: 100%;
		padding: 24px 0px;
		display: flex;
		gap: 12px;
		overflow: hidden;
		overflow-x: auto;

		.cat-items {
			display: flex;
			gap: 12px;
		}

		&.desktop {
			.cat-items {
				flex-wrap: wrap;
			}
		}

		.cat-item {
			flex: 1;
			min-width: 100px;
            max-width: 100px;
			position: relative;
            
            &.cat-title {
                min-width: 55px;
				max-width: 55px;
                padding: 0;
                font-weight: bold;
                font-family: 'Akzidenz Grotesk Super';
				text-align: left;
            }

            &:not(.cat-title){
                .cat-content:not(.with-image) {
                    background: $secondary-color-10;
                }
            }

			.cat-content {
				width: 100%;
				height: 100px;
                border-radius: 12px;
                background-position: center;
			    background-size: cover;
                overflow: hidden;
				display: flex;
				align-items: center;
				justify-content: center;
				border: 1px solid $secondary-color-20;
				cursor: pointer;

				img {
					width: 90%;
				}

                & + .label {
                    margin-top: 8px;
                }

				.cat-avatar {
					color: $primary-color-50;
					font-size: 1.5em;
					font-weight: bold;
				}
			}

			.label {
            	color: $secondary-color-80;
				font-size: 1em;
				display: block;
			}
		}
	}
</style>
