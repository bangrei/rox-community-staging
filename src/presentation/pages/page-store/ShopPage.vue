<template>
	<layout-variant-two class="main-con" :show-loading-screen="loading">
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
                        <base-store-header ref="baseStoreHeader" v-if="showContent && outletFound && isDesktop"
                            @store-changed="storeChanged()"
                            :show-content="showContent && outletFound && isDesktop && !isGuestCustomer()"
                            :show-label="false"
                            :is-desktop="isDesktop"
                        ></base-store-header>
                    </div>
                    <div class="header-wrapper centered" :class="{'guest': isGuestCustomer()}">
                        <base-desktop-nav v-if="showContent && outletFound" :active-footer-id="activeFooterNavId"></base-desktop-nav>
                    </div>
                    <div class="header-wrapper">
					    <base-header-nav v-if="showContent && outletFound" :scanner-on="true" @scanner-clicked="showScanner()"></base-header-nav>
                    </div>
				</div>
                <div class="header-auth" :class="{'bordered': isDesktop}" v-if="isGuestCustomer() && showContent && outletFound">
                    <base-store-header ref="baseStoreHeader"
                            @store-changed="storeChanged()"
                            :show-content="showContent && outletFound"
                            :show-label="false"
                            :is-desktop="true"
                        ></base-store-header>
                    <div class="auth-con">
                        <span @click="goSignup()" class="auth-btn">Create account</span>
                        <span @click="goTo('LoginPage')" class="auth-btn active">Login</span>
                    </div>
                </div>
                <base-store-header ref="baseStoreHeader" v-if="!isGuestCustomer()"
                    @store-changed="storeChanged()"
                    :show-content="showContent && outletFound && !isDesktop"
                    :show-label="false"
                    :is-desktop="isDesktop"
                ></base-store-header>
			</div>
		</template>
		<template v-slot:body>
            <div class="top-body" v-if="showContent && outletFound">
                <div class="wrapper" v-if="!isEmpty(banners)">
                    <banner-carousel v-if="inited" :banners="banners" :use-image="true"></banner-carousel>
                    <div v-if="isEmpty(banners)" class="empty-banners"></div>
                    <span class="title" style="padding-top: 48px;" v-if="!isEmpty(tags)">Shop by Activity</span>
                    <div class="gap" v-if="!isEmpty(tags)"></div>
                </div>
                <div class="gap" v-else-if="!isEmpty(tags)"></div>
                <shop-activity v-if="!isEmpty(tags)" :activities="tags"></shop-activity>
                <div class="title flex dark" v-if="!isEmpty(filterBrands('A','J')) || !isEmpty(filterBrands('K','Z'))">
                    <span>Shop by Brand</span>
                    <span class="anchor" @click="seeBrands()">See all</span>
                </div>
                <div class="shop-categories">
                    <shop-category ref="shopCategoryA" v-if="!isEmpty(filterBrands('A','J'))" :is-desktop="isDesktop" :activities="filterBrands('A','J')"></shop-category>
                    <shop-category ref="shopCategoryB" v-if="!isEmpty(filterBrands('K','Z'))" :is-desktop="isDesktop" :activities="filterBrands('K','Z')"></shop-category>
                </div>
                <div class="wrapper wrapper-2">
                    <div style="padding-top: 24px;"></div>
                    <span class="title">Made for <br v-if="!isDesktop"/>Adventure</span>
                    <span class="subtitle">Discover your next adventure with our curated brands!</span>
                    <div class="gap"></div>
                </div>
                <shop-etalase ref="shopEtalase" :emitable="true" :categories="filterCategories" @onCategoryClicked="onCategoryClicked"></shop-etalase>
            </div>
            <div class="top-body empty" v-if="showContent && !outletFound">Outlet not found..</div>
		</template>
        <template v-slot:footer>
			<base-footer-nav :active-footer-id="activeFooterNavId"></base-footer-nav>
		</template>
	</layout-variant-two>
</template>

<script>
import { storeService } from "@/bloc/services";
import BaseHeaderNav from "@/components/base/BaseHeaderNav.vue";
import BaseStoreHeader from "@/components/base/BaseStoreHeader.vue";
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import BannerCarousel from "./components/BannerCarousel.vue";
import ShopActivity from "./components/ShopActivity.vue";
import ShopCategory from "./components/ShopCategory.vue";
import ShopEtalase from "./components/ShopEtalase.vue";

export default {
	name: "ShopPage",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
        BaseHeaderNav,
        BaseStoreHeader,
        BannerCarousel,
        ShopActivity,
        ShopCategory,
        ShopEtalase
	},
	data() {
		return {
            activeFooterNavId: 2,
			customer: {},
			loading: false,
            stores: [],
            currentStore: null,
            brand: null,
            banners: [],
            products: [],
            parentCategories: [],
            categories: [],
            tags: [],
            inited: false,
            showContent: false,
            outletFound: false,
            isDesktop: false,
            scrollTop: 0,
            brandScrollLeft: 0,
            categoryScrollLeft: 0,
            currentBrand: null,
            currentCategory: null,
		};
	},
	watch: {
        currentStore(val){
            this.$store.dispatch("setCurrentStore", val);
        },
        stores(val){
            this.$store.dispatch("setStoreList", val);
        },
        products(val){
            this.$store.dispatch("setProducts", val);
        },
        categories(val){
            this.$store.dispatch("setCategories", val);
        },
        brand(val){
            this.$store.dispatch("setStoreBrand", val);
        },
    },
	computed: {
        filterCategories() {
            if(isEmpty(this.categories)) return [];
            let ctg = [];
            this.categories.forEach((it) => {
                let item = it;
                item.products = this.products.filter((prd) => {
                    return prd.categories.indexOf(it.id) > -1;
                });
                if(!isEmpty(item.products)) ctg.push(item);
            });
            ctg.sort((a,b) => { return a.name.localeCompare(b.name) })
            return ctg;
        },
    },
    methods: {
        goSignup() {
			this.goToWithParams('LoginPage', {
				signup: true
			});
		},
        showScanner(){
            this.$refs.baseStoreHeader.toggleScanner();
        },
        seeBrands(){
            let hq = this.$store.getters.getHeadquarter;
            if (!hq?.headquarter?.brand) return;
            let brands = hq.headquarter.brand.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
            let filteredBrands = brands.filter((br) => {
                let products = this.$store.getters.getProducts.filter((t) => {
                    return t.brands.map((b) => { return b.apiCode }).indexOf(br.apiCode) > -1;
                });
                let categories = this.$store.getters.getCategories.filter((c) => {
                    return products.filter((p) => { return p.categories.indexOf(c.id) > -1 }).length > 0;
                }).map((c) => {
                    c.products = products.filter((p) => {
                        return p.categories.indexOf(c.id) > -1;
                    });
                    return c;
                });
                return categories.length > 0;
            });
            let brand = !isEmpty(filteredBrands) ? filteredBrands[0] : brands[0];
            let currentOutlet = this.$store.getters.getCurrentOutlet;
            this.goToWithParams('BrandPage', {
                outlet: currentOutlet.apiCode,
                brandCode: brand.apiCode,
                seeAll: true,
            });
		},
        goSearch() {
            let currentOutlet = this.$store.getters.getCurrentOutlet;
            this.goToWithParams('SearchPage', {
                outlet: currentOutlet ? currentOutlet.apiCode : -1
				// storeId: this.$store.getters.getCurrentStore.id,
			});
		},
        async storeChanged(){
            try {
                let currentOutlet = this.$store.getters.getCurrentOutlet;
                this.loading = true;
                await this.refreshMainData(true, undefined, currentOutlet.apiCode);
                this.$store.dispatch("setStateStorePage", {
                    currentBrand: null,
                    currentCategory: null,
                    scrollTop: 0,
                    brandScrollLeft: 0,
                    categoryScrollLeft: 0,
                    productSize: 0,
                });
                this.goToWithParams('ShopPage', {
                    outlet: currentOutlet.apiCode
                });
            } catch(error){
                this.loading = false;
			    this.showNotification("alert", "error_outline", error);
            }
        },
        filterBrands(from, to){
            let cat = [];
            let list = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
            let startIndex = list.indexOf(from);
            let endIndex = list.indexOf(to);

            let hq = this.$store.getters.getHeadquarter;
            let currentOutlet = this.$store.getters.getCurrentOutlet;
            let brandCodes = currentOutlet.stores.map((s) => {
                return s.brandCode;
            });
            let brands = [];
            if(!isEmpty(hq) && !isEmpty(hq.headquarter) && !isEmpty(hq.headquarter.brand)){
                brands = hq.headquarter.brand.filter((b) => {
                    return brandCodes.indexOf(b.apiCode) > -1;
                });
            }
            if(!isEmpty(brands)){
                brands.sort((a,b) => { return a.id - b.id })
                brands.forEach((it) => {
                    let str = it.name;
                    if(!str) return;
                    let idx = list.indexOf(str.substring(0,1));
                    if(idx == -1) return;
                    if(idx >= startIndex && idx <= endIndex) {
                        cat.push(it);
                    }
                });
            }
            if(!isEmpty(cat)) cat.sort((a,b) => { return a.name.localeCompare(b.name) });
            if(isEmpty(cat)) return;
            return {
                from: from,
                to: to,
                brands: cat
            }
        },
        async retrieveBanners(){
            this.inited = false;
            this.banners = [];
            let json = await storeService.retrievePromotions();
            if(json.promotions && json.promotions.length > 0){
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
            this.inited = true;
        },
        resizeBannerHandler(){
            this.isDesktop = window.innerWidth >= 672;
            let length = document.getElementsByClassName('empty-banners').length;
            for(var i=0; i<length; i++){
                let w = document.getElementsByClassName('empty-banners')[i].clientWidth;
                let h = (9/16) * w;
                document.getElementsByClassName('empty-banners')[i].style['height'] = !isEmpty(this.banners) ? `unset !important` : `${h}px`;
            }
        },
        async startPage(skip){
            this.outletFound = true;
            this.currentStore = null;

            let outletCode = this.$route.params.outlet;
            if(outletCode == -1) {
                this.showContent = false;
                this.loading = false;
                this.outletFound = false;
                return;
            }
            if(!skip) {
                await this.refreshMainData(false, undefined, outletCode);
                if(isEmpty(outletCode)){
                    let outlet = this.$store.getters.getCurrentOutlet;
                    if(!isEmpty(outlet)) {
                        return this.goToWithParams('ShopPage', {
                            outlet: outlet.apiCode
                        });
                    }
                    this.loading = false;
                    return;
                } else {
                    let outlets = this.$store.getters.getOutlets;
                    if(isEmpty(outlets)) {
                        this.loading = false;
                        return;
                    }
                    let currentOutlet = this.$store.getters.getCurrentOutlet;
                    let outlet = outlets.find((it) => { return it.apiCode == outletCode });
                    if(isEmpty(outlet)) {
                        this.loading = false;
                        return;
                    }
                    if(currentOutlet && currentOutlet.apiCode != outlet.apiCode){
                        if(isEmpty(outlet.stores)){
                            this.loading = false;
                            return;
                        }
                        this.$store.dispatch("setCurrentOutlet", outlet);
                        this.$store.dispatch("setCurrentStore", !isEmpty(outlet.stores) ? outlet.stores[0] : null);
                    }else{
                        if(isEmpty(outlet.stores)){
                            this.loading = false;
                            return;
                        }
                    }
                }
            } else {
                await this.retrieveMenu(outletCode);
                let outlets = this.$store.getters.getOutlets;
                let outlet = outlets.find((it) => { return it.apiCode == outletCode });
                if(isEmpty(outlet.stores)){
                    this.loading = false;
                    this.products = [];
                    this.parentCategories = [];
                    this.categories = [];
                    this.tags = [];
                    return;
                }
                this.$store.dispatch("setCurrentOutlet", outlet);
                this.$store.dispatch("setCurrentStore", !isEmpty(outlet.stores) ? outlet.stores[0] : null);
            }

            await this.retrieveBanners();

            this.currentStore = this.$store.getters.getCurrentStore;
            this.stores = this.$store.getters.getStoreList || [];
            
            this.products = this.$store.getters.getProducts;
            this.categories = this.$store.getters.getCategories;
            this.parentCategories = this.categories.filter((item) => { return !isEmpty(item.children) });
            this.tags = this.$store.getters.getTags;
        },
        dispatchState() {
            let etalase = this.$refs.shopEtalase;
            let productSize = etalase?.$refs.productGrid.productSize || 0;

            let payload = {
                currentBrand: this.currentBrand,
                currentCategory: this.currentCategory,
                productSize: productSize,
                scrollTop: this.scrollTop,
                brandScrollLeft: this.brandScrollLeft,
                categoryScrollLeft: this.categoryScrollLeft
            }
            this.$store.dispatch("setStateStorePage", payload);
        },
        onCategoryClicked(data) {
            if (data && data.category && this.currentCategory && data.category.id != this.currentCategory.id) this.categoryScrollLeft = 0;
            this.currentBrand = data?.brand;
            this.currentCategory = data?.category;
            this.dispatchState();
        },
    },
	async created() {
		try {
            this.loading = true;
            await this.startPage(this.$store.getters.hasInited);
            this.showContent = true;
            
            this.loading = false;

            window.addEventListener("resize", this.resizeBannerHandler);

            let storeState = this.$store.getters.getStateStorePage;
            this.scrollTop = storeState.scrollTop || 0;
            this.brandScrollLeft = storeState.brandScrollLeft || 0;
            this.categoryScrollLeft = storeState.categoryScrollLeft || 0;
            setTimeout(() => {
                this.resizeBannerHandler();
            }, 100);

            const initSize = async () => {
                let etalase = this.$refs.shopEtalase;
                if (etalase && storeState.productSize > 0) {
                    etalase.$refs.productGrid.productSize = storeState.productSize;
                    etalase.$refs.productGrid.setCurrentProducts();
                }
            }

            setTimeout( async() => {
                await initSize();
                document.querySelector('.sd-base-con').scrollTop = this.scrollTop;
                if (document.querySelector('.etalase-tabs')) document.querySelector('.etalase-tabs').scrollLeft = this.brandScrollLeft;
                if (document.querySelector('.etalase-tabs-children')) document.querySelector('.etalase-tabs-children').scrollLeft = this.categoryScrollLeft;

                let self = this;
                document.querySelector('.sd-base-con').addEventListener("scroll", (e) => {
                    self.scrollTop = e.target.scrollTop;
                    self.dispatchState();
                });
                document.querySelector('.etalase-tabs').addEventListener("scroll", (e) => {
                    self.brandScrollLeft = e.target.scrollLeft;
                    self.dispatchState();
                });
                document.querySelector('.etalase-tabs-children').addEventListener("scroll", (e) => {
                    self.categoryScrollLeft = e.target.scrollLeft;
                    self.dispatchState();
                });
            }, 500);
		} catch (error) {
			this.loading = false;
            window.addEventListener("resize",  this.resizeBannerHandler);
            setTimeout(() => {
                this.resizeBannerHandler();
            }, 100);
			this.showNotification("alert", "error_outline", error);
		}
	},
};
</script>

<style scoped lang="scss">
    .header-con {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;

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
    }
    .top-body {
        padding-bottom: 24px;

        &.empty {
            position: fixed;
            height: 100%;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        * + .wrapper {
            margin-top: 32px;
        }

        .wrapper {
            width: 100%;
            height: 100%;
            background: #595129;
            position: relative;

            &.wrapper-2 {
                height: unset;
                display: block;
                position: unset;
                background: #C25C5D !important;
                .title {
                    font-size: 2em;
                }
            }
        }
        .gap {
            height: 150px;
        }

        .title {
            margin-top: 24px;
            font-family: 'Akzidenz Grotesk Super';
            color: $white;
            padding: 16px;
            display: block;
            line-height: 1.5;
            text-align: left;

            &.flex {
                display: flex !important;
                justify-content: space-between;
            }

            &.dark {
                color: #000;
            }

            .anchor {
                cursor: pointer;
                font-family: 'Akzidenz Grotesk Regular';
                color: $primary-color-50;
                font-size: 0.8em;
                font-weight: bold;
            }
        }

        .subtitle {
            font-family: 'Akzidenz Grotesk Super';
            font-size: 1em;
            color: $white;
            padding: 16px;
            display: block;
            line-height: 1.5;
            text-align: left;
        }
    }
    .empty-carousel {
        width: 100%;
        background: $secondary-color-10;
    }
    .shop-categories {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 24px 16px;
    }
    @media (min-width: 672px) {
		.shop-categories {
			flex-direction: row;
            gap: 24px;
            padding: 24px 7% !important;
		}
        .top-body {
            .title {
                padding: 16px 7% !important;
                padding-bottom: 0 !important;
                display: flex !important;
                gap: 32px;
                align-items: center;
                justify-content: flex-start;
                text-align: left;

                &.flex {
                    justify-content: flex-start !important;
                }

                & + .subtitle {
                    padding-top: 0 !important;
                }
            }
            .subtitle {
                padding: 16px 7% !important;
                text-align: left;
            }
        }
	}
</style>