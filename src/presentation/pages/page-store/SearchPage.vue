<template>
	<layout-variant-two class="main-con" :show-loading-screen="loading">
		<template v-slot:header>
			<div class="slide-down">
				<div class="header-con default">
                    <div class="header-wrapper">
                        <div class="header-logo-con left" :class="{'bordered': isGuestCustomer() && isDesktop}">
                            <img
                                width="35"
                                height="35"
                                alt="rox logo"
                                :src="require('@/assets/images/rox-logo.png')"
                            />
                        </div>
                        <base-store-header ref="baseStoreHeader" v-if="isDesktop"
                            @store-changed="storeChanged()"
                            :show-content="isDesktop && !isGuestCustomer()"
                            :show-label="false"
                            :is-desktop="isDesktop"
                        ></base-store-header>
                    </div>
                    <div class="header-wrapper centered" :class="{'guest': isGuestCustomer()}">
                        <base-desktop-nav :active-footer-id="-1"></base-desktop-nav>
                    </div>
                    <div class="header-wrapper">
					    <base-header-nav></base-header-nav>
                    </div>
				</div>
                <div class="header-auth" :class="{'bordered': isDesktop}" v-if="isGuestCustomer()">
                    <base-store-header ref="baseStoreHeader"
                        @store-changed="storeChanged()"
                        :show-content="isGuestCustomer()"
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
                    :show-content="!isDesktop"
                    :show-label="false"
                    :is-desktop="isDesktop"
                ></base-store-header>
			</div>
		</template>
		<template v-slot:body>
            <div class="top-head">
                <div class="top-search-wrapper">
                    <span class="top-search-icon material-icons-outlined">search</span>
                    <input type="text" v-model="keywords" @keypress.enter="searchProducts()">
                    <div class="top-search-btn" @click="searchProducts()">Submit</div>
                </div>
            </div>
            <div class="main-container" v-if="!loading">
                <div class="filter-container" v-if="products && isDesktop">
                    <div class="filter-label">Filter</div>
                    <filter-accordion ref="filterAccordionDesktop" 
                        :products="products" 
                        :brands="brands" 
                        :categories="categories"
                        @filterProducts="setProductsFiltered">
                    </filter-accordion>
                </div>
                <div class="products-container">
                    <div class="products-head">
                        <span class="product-length">{{ productsFiltered.length }} results {{ keySubmitted ? ` for ${keySubmitted}` : '' }}</span>
                        <div class="filter-wrapper">
                            <div class="btn-filter" v-if="!isDesktop" @click="toggleShowFilter()">
                                <span class="material-icons">tune</span>
                                <span>Filter</span>
                            </div>
                            <div class="btn-filter" @click="toggleShowSorter()">
                                <span class="material-icons">swap_vert</span>
                                <span class="sort-label">Sort by:</span>
                                <span class="sort-by">{{sortedByDisplay}}</span>
                            </div>
                        </div>
                    </div>
                    <product-grid 
                        v-if="!loading" 
                        ref="productGrid_category" 
                        :products="productsFiltered" 
                        :noPadding="true"
                        :gridColumns="3"
                        :more-button="false">
                    </product-grid>
                </div>
            </div>

            <base-modal :show="showFilter" :full-screen="false">
                <template v-slot:header>
                    <div class="modal-header header-flex header-justify">
                        <h3>Filter</h3>
                        <span class="material-icons-outlined back-btn" @click="toggleShowFilter()">close</span>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body" v-if="showFilter">
                        <filter-accordion ref="filterAccordionMobile" 
                            :products="products" 
                            :brands="brands" 
                            :categories="categories"
                            @filterProducts="emitFilterPayload">
                        </filter-accordion>
                    </div>
                    <div class="modal-footer">
                        <div class="button" @click="setFilterPayload">Apply</div>
                        <div class="button lite" @click="resetFilterMobile()">Reset All</div>
                    </div>
                </template>
            </base-modal>

            <base-modal :show="showSorter" :full-screen="false">
                <template v-slot:header>
                    <div class="modal-header header-flex header-justify">
                        <h3>Sort</h3>
                        <span class="material-icons-outlined back-btn" @click="toggleShowSorter()">close</span>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body">
                        <div class="radio-list">
                            <div class="radio" v-for="radio in sortedList" :key="radio.key">
                                <input name="sortBy" type="radio" 
                                    :checked="radio.clicked == true" 
                                    :data-key="radio.key"
                                    @click="setSortedBy(radio.key)"
                                >
                                <span class="radio-label">{{ radio.name }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <div class="button lite" @click="resetSorter()">Reset All</div>
                        <div class="button" @click="sortProducts()">Apply</div>
                    </div>
                </template>
            </base-modal>
		</template>
        <template v-slot:footer>
			<base-footer-nav :active-footer-id="-1"></base-footer-nav>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import ProductGrid from "../page-store/components/ProductGrid.vue";
import FilterAccordion from '../page-brand/components/FilterAccordion.vue'
import utility from "@/presentation/mixins/utility.js";
import { getInventory } from "@/connector/productConnector";
import { isEmpty } from "lodash";
// import moment from 'moment';

export default {
    name: "SearchPage",
    mixins: [utility],
    components: {
        LayoutVariantTwo,
        ProductGrid,
        FilterAccordion,
    },
    data() {
        return {
            loading: false,
            isDesktop: false,
            products: [],
            productsFiltered: [],
            sortBy: {
                newest: {
                    clicked: true,
                    selected: true,
                    name: "Newest",
                },
                oldest: {
                    clicked: false,
                    selected: false,
                    name: "Oldest",
                },
                lowestPrice: {
                    clicked: false,
                    selected: false,
                    name: "Price (Lowest)",
                },
                highestPrice: {
                    clicked: false,
                    selected: false,
                    name: "Price (Highest)",
                },
                productAsc: {
                    clicked: false,
                    selected: false,
                    name: "Product Name (A-Z)",
                },
                productDesc: {
                    clicked: false,
                    selected: false,
                    name: "Product Name (Z-A)",
                },
                // inStock: {
                //     clicked: false,
                //     selected: false,
                //     name: "In Stock",
                // },
            },
            showFilter: false,
            filterPayload: null,
            showSorter: false,
            categories: [],
            selectedCategory: null,
            brands: [],
            keywords: "",
            keySubmitted: "",
        };
    },
    watch: {
        keywords(val) {
            if (!val) this.searchProducts();
        }
    },
    computed: {
        sortedByDisplay(){
            let theOne = null;
            for (var key in this.sortBy) {
                if (this.sortBy[key].clicked) theOne = this.sortBy[key];
            }
            return theOne ? theOne.name : "Newest";
        },
        sortedList(){
            let items = [];
            for(var key in this.sortBy){
                let it = this.sortBy[key];
                it.key = key;
                items.push(it);
            }
            return items;
        }
    },
    methods: {
        goSignup() {
			this.goToWithParams('LoginPage', {
				signup: true
			});
        },
        resetFilterMobile() {
            this.$refs.filterAccordionMobile.resetAll();
        },
        toggleShowFilter(){
            this.showFilter = !this.showFilter;
            if (this.showFilter && !this.isDesktop) {
                setTimeout(() => {
                    this.$refs.filterAccordionMobile.transferPayload(this.filterPayload);
                }, 250);
            }
        },
        toggleShowSorter(){
            this.showSorter = !this.showSorter;
        },
        async resetSorter() {
            let items = document.getElementsByName('sortBy');
            for (var i = 0; i < items.length; i++){
                document.getElementsByName('sortBy')[i].checked = false;
            }
            document.querySelector("[data-key='newest']").checked = true;
            for (var s in this.sortBy) {
                this.sortBy[s].clicked = false;
            }

            this.sortBy.newest.clicked = true;
            this.sortProducts();
        },
        setSortedBy(key) {
            console.log(key);
            for(var s in this.sortBy){
                this.sortBy[s].selected = false;
            }
            this.sortBy[key].selected = true;
        },
        sortProducts() {
            let count = 0;
            for(var s in this.sortBy){
                this.sortBy[s].clicked = this.sortBy[s].selected;
                if (this.sortBy[s].clicked) count++;
            }
            if (count == 0) this.sortBy.newest.clicked = true;

            this.productsFiltered.sort((a,b) => {
                if (this.sortBy.newest.clicked) return b.id - a.id;
                if (this.sortBy.oldest.clicked) return a.id - b.id;
                let priceA = parseFloat(a.price);
                let priceB = parseFloat(b.price);
                if(!isEmpty(a.variants)){
                    a.variants.sort((x,y) => { return parseFloat(x.price) - parseFloat(y.price) });
                    priceA = parseFloat(a.variants[0].price);
                }
                if(!isEmpty(b.variants)) {
                    b.variants.sort((x,y) => { return parseFloat(x.price) - parseFloat(y.price) });
                    priceB = b.variants[0];
                }
                if(this.sortBy.lowestPrice.clicked) {
                    return priceA - priceB;
                }
                if(this.sortBy.highestPrice.clicked) {
                    return priceB - priceA;
                }
                if(this.sortBy.productAsc.clicked) {
                    return a.name.localeCompare(b.name);
                }
                if(this.sortBy.productDesc.clicked) {
                    return b.name.localeCompare(a.name);
                }
                return a.id - b.id;
            });
            this.$refs.productGrid_category.finalizeProducts(this.productsFiltered);
            this.showSorter = false;
        },
        async storeChanged() {
            try {
                let currentOutlet = this.$store.getters.getCurrentOutlet;
                this.loading = true;
                await this.refreshMainData(true, undefined, currentOutlet.apiCode);
                let params = {
                    outlet: currentOutlet.apiCode,
                }
                this.goToWithParams('ShopPage', params);
            } catch(error){
                this.loading = false;
			    this.showNotification("alert", "error_outline", error);
            }
        },
        emitFilterPayload(payload) {
            this.filterPayload = {
                range: payload.range,
                prices: payload.prices,
                brands: payload.brands,
                categories: payload.categories,
                selectedPriceIndexes: payload.selectedPriceIndexes,
                selectedBrandIndexes: payload.selectedBrandIndexes,
                selectedCategoryIndexes: payload.selectedCategoryIndexes,
                available: payload.available,
                isMinAndMaxPrice: payload.isMinAndMaxPrice
            }
            if (!this.isDesktop && this.showFilter && !isEmpty(payload) && payload.isMinAndMaxPrice) {
                this.setProductsFiltered(payload);
            }
        },
        setFilterPayload() {
            this.setProductsFiltered(this.filterPayload);
            if (isEmpty(this.filterPayload)) this.sortProducts();
        },
        resizeHandler() {
            this.isDesktop = window.innerWidth >= 672;
            this.showFilter = false;
            if (!this.filterPayload) return;
            setTimeout(() => {
                if (this.isDesktop) {
                    this.$refs.filterAccordionDesktop.transferPayload(this.filterPayload);
                }
            }, 250);
        },
        setProductsFiltered(payload) {
            this.showFilter = false;

            const filterProducts = (products) => {
                return products.filter((p) => {
                    let matchBrand = false;
                    if (!this.keywords) {
                        return true;
                    }
                    if (!isEmpty(p.brands)) {
                        matchBrand = p.brands.map((b) => { return b.name ? b.name.toLowerCase() : "" }).indexOf(this.keywords.toLowerCase()) > -1;
                    }
                    let hasTag = p.tags.map((tag) => {
                        return tag.name.toLowerCase()
                    }).indexOf(this.keywords.toLowerCase()) > -1;

                    let prd = p.name.toLowerCase().indexOf(this.keywords.toLowerCase()) > -1;
                    let cfilter = this.categories.filter((c) => {
                        return p.categories.indexOf(c.id) > -1 && c.name.toLowerCase().indexOf(this.keywords.toLowerCase()) > -1;
                    }).length > 0;
                    let ok = prd || cfilter || hasTag || matchBrand;
                    return ok;
                });
            }

            console.log(payload);
            
            if (!payload) {
                this.productsFiltered = filterProducts(this.products).sort((a, b) => {
                    return b.id - a.id;
                });
                this.filterPayload = null;
                return;
            }
            this.emitFilterPayload(payload);

            let priceRanges = payload.prices;
            let rangeFrom = payload.range.from;
            let rangeTo = payload.range.to;
            let availability = payload.available;
            let selectedBrands = payload.brands;
            let selectedCategories = payload.categories;

            let products = this.products.filter((it) => {
                let stocks = it.inventories.filter((st) => { return st.stock > 0 });
                if (availability == 1) return stocks.length > 0;
                if (availability == 2) return it.inventories.filter((st) => { return st.stock <= 0 }).length == it.inventories.length;
                return true;
            }).sort((a, b) => {
                return b.id - a.id;
            });

            products = products.filter((it) => {
                let prices = [it.price];
                if (!isEmpty(it.variants)) prices = it.variants.map(v => v.price);

                if (priceRanges.length > 0) {
                    return priceRanges.filter((range) => {
                        return prices.filter((price) => {
                            if (range.isMax) return price > range.from;
                            return price >= range.from && price <= range.to;
                        }).length > 0;
                    }).length > 0;
                } else if (rangeFrom || rangeTo) {
                    return prices.filter((price) => {
                        if (!rangeTo) return price >= rangeFrom;
                        return price >= (rangeFrom || 0) && price <= rangeTo;
                    }).length > 0;
                }
                return true;
            });

            if (!isEmpty(selectedBrands)) {
                products = products.filter((p) => {
                    return p.brands.filter((b) => { return selectedBrands.map((pb) => { return pb.id }).indexOf(b.id) > -1 }).length > 0;
                });
            }

            if (!isEmpty(selectedCategories)) {
                products = products.filter((p) => {
                    return selectedCategories.filter((c) => { return p.categories.includes(c.id) }).length > 0;
                });
            }

            this.productsFiltered = filterProducts(products);
            this.sortProducts();
        },
        collectBrands() {
            let hq = this.$store.getters.getHeadquarter;
            let brands = [];
            if (!isEmpty(hq) && !isEmpty(hq.headquarter) && !isEmpty(hq.headquarter.brand)) {
                brands = hq.headquarter.brand;
            }
            if (!isEmpty(brands)) {
                brands.map((it) => {
                    it.filtered = false;
                    return it;
                }).sort((a, b) => { return a.name.localeCompare(b.name) });
            }
            let brandIds = [];
            let currentOutlet = this.$store.getters.getCurrentOutlet;
            if (!isEmpty(currentOutlet)) {
                currentOutlet.stores.forEach((st) => {
                    brandIds.push(st.brandCode);
                });
            }
            this.brands = brands.filter((it) => {
                return brandIds && brandIds.includes(it.apiCode);
            });
        },
        searchProducts() {
            this.keySubmitted = this.keywords;
            if (this.isDesktop) this.$refs.filterAccordionDesktop.resetAll();
            else this.$refs.filterAccordionMobile.resetAll();
            this.setProductsFiltered();
            this.sortProducts();
        },
        async mapInventories() {
            let products = this.$store.getters.getProducts;
            let outletCode = this.$route.params.outlet;
            let currentOutlet = this.$store.getters.getCurrentOutlet;

            let mappedCategoryIds = [];

            if (!isEmpty(products)) {
                const binding = async () => {
                    products.forEach(async (it) => {
                        if (it.categories.length) {
                            it.categories.forEach((c) => {
                                if (mappedCategoryIds.indexOf(c) == -1) mappedCategoryIds.push(c);
                            });
                        }
                        it.inventories = [];
                        var res = await getInventory(outletCode, it.id);
                        it.inventories = res.inventories.filter((inv) => {
                            return inv.status == "ACTIVE" && currentOutlet.stores.find(s => s.id == inv.store.id);
                        });
                    });
                }
                await binding();
                this.products = products;
                let categories = this.$store.getters.getCategories;
                if (categories.length) {
                    this.categories = categories.filter((cat) => {
                        return mappedCategoryIds.indexOf(cat.id) > -1;
                    }).sort((a, b) => {
                        return a.name.localeCompare(b.name);
                    });
                }
            }
            this.setProductsFiltered();
            this.loading = false;
        }
    },
    async created() {
        try {
            let outletCode = this.$route.params.outlet;
            this.isDesktop = window.innerWidth >= 672;
            this.keywords = this.$route.params.key || "";
            this.loading = true;
            if (!this.$store.getters.hasInited) await this.refreshMainData(false, undefined, outletCode);
            this.collectBrands();
            await this.mapInventories();
            window.addEventListener('resize', () => {
                this.resizeHandler();
            });
        } catch (error) {
            this.loading = false;
            this.showNotification("alert", "error_outline", error);
        }
    }
};
</script>

<style scoped lang="scss">
    .back-btn {
        cursor: pointer;
        &:hover{
            opacity: 0.7;
        }
    }
    .modal-body {
        .radio-list {
            padding: 24px 0 !important;
        }
    }
    .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid $secondary-color-20;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 16px;
        .button {
            padding: 12px 24px;
            border-radius: 8px;
            border: 1px solid transparent;
            background: $primary-color-50;
            color: $white;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            font-weight: bold;
            &.lite {
                border-color: $primary-color-20;
                color: $primary-color-50;
                background: $white;
            }
        }
    }
    .top-head {
        width: 100%;
        display: flex;
        flex-direction: column;
        padding: 24px;
        align-items: flex-start;
        .top-search-wrapper {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 0px 24px;
            border-radius: 12px;
            background: linear-gradient(45deg, $secondary-color-10, $secondary-color-20);
            display: flex;
            justify-content: space-between;
            align-items: center;
            overflow: hidden;
            gap: 12px;
            position: relative;
            .top-search-icon {
                color: $secondary-color-60;
            }
            input {
                flex: 3;
                background: transparent;
                outline: none;
                border: none;
                font-weight: bold;
                padding: 20px 0;
            }
            .top-search-btn {
                border-radius: 8px;
                background: $primary-color-50;
                padding: 8px 16px;
                color: $white;
                cursor: pointer;
                font-weight: bold;
                &:hover{
                    opacity: 0.7;
                }
            }
        }
    }
    .main-container {
        width: 100%;
        display: flex;
        gap: 32px;
        flex-direction: column;
        padding: 24px;
        .filter-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            .filter-label {
                font-weight: bold;
                font-size: 1.5em;
                padding: 8px 0;
            }
        }
        .products-container {
            flex: 3;
            .products-head {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0px;
                flex-direction: column;
                gap: 12px;
                .product-length {
                    font-weight: bold;
                    font-size: 1.2em;
                    text-align: left;
                    width: 100%;
                }
                .filter-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                    width: 100%;
                    .btn-filter {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        padding: 6px 12px;
                        border-radius: 24px;
                        border: 1px solid $secondary-color-20;
                        cursor: pointer;
                        &:hover{
                            opacity: 0.7;
                        }
                        * {
                            white-space: nowrap;
                        }

                        .sort-by {
                            color: $secondary-color-50;
                        }
                    }
                }
            }
        }
    }
    .header-wrapper {
        display: flex;
        align-items: center;
        gap: 16px;
        &.centered {
            flex: 3;
        }
        &.guest {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
    @media (min-width: 672px) {
        .top-head {
            padding: 24px 7% !important;
        }
        .main-container {
            padding: 24px 7% !important;
            flex-direction: row !important;
            .products-container {
                .products-head {
                    padding: 0 8px !important;
                    flex-direction: row !important;
                    .product-length {
                        width: unset !important;
                    }
                    .filter-wrapper {
                        width: unset !important;
                    }
                }
            }
            .filter-container {
                .range-content {
                    .range-wrapper {
                        .range-item {
                            input {
                                max-width: 100px !important;
                            }
                        }
                    }
                }
            }
        }
	}
</style>