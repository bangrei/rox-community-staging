<template>
    <layout-variant-two :show-loading-screen="loading">
        <template v-slot:header>
			<div class="slide-down">
				<div class="header-con light">
					<div class="back-btn" @click="closePage()">
                        <span class="material-icons">arrow_back</span>
                    </div>
                    <base-header-nav :no-menu="true" :show-location="true"></base-header-nav>
				</div>
			</div>
		</template>
        <template v-slot:body>
            <div class="product-header" v-if="product">
                <span class="x-title">{{ product.categoryDisplay }}</span> / 
                <span class="x-subtitle">{{ product.name }}</span>
            </div>
            <div class="product-container" v-if="product">
                <div class="product-banners" :class="{'empty': isEmpty(banners)}">
                    <div class="banner-carousel custom-carousel" v-if="inited && !isEmpty(banners)">
                        <banner-carousel v-if="!isDesktop"
                            :banners="banners" 
                            :use-image="true" 
                            :pos-center="true"
                            :full-screen="true"
                            :custom-swiper="true"
                            :manual-slide="true"
                            className="ratio-auto">
                        </banner-carousel>
                        <div class="banners-desktop" :class="{'invisible': !isDesktop}">
                            <div class="banner-desktop-active" :class="{'loading': activeBannerLoading}">
                                <img v-lazyload v-if="!isEmpty(activeBanner) && isDesktop && !activeBannerLoading" :class="activeBanner.size" :alt="activeBanner.name" :data-url="activeBanner.image"/>
                            </div>
                        </div>
                    </div>
                    <div class="banner-thumbnails" v-if="inited">
                        <div class="thumbnail" 
                            @click="setActiveBanner(banner)"
                            :class="{'active': !isEmpty(activeBanner) && activeBanner.index == banner.index }"
                            v-for="banner in banners" 
                            :key="banner.thumbnail">
                            <img v-lazyload :alt="banner.name" :data-url="banner.thumbnail"/>
                        </div>
                    </div>
                </div>
                <div class="product-wrapper" :class="{'empty-image': isEmpty(banners)}">
                    <div class="product-content">
                        <div class="product-info">
                            <div class="product-label">{{ productBrands }}</div>
                            <div class="product-sublabel">{{ product.name }}</div>
                            <div class="product-price-wrapper">
                                <div class="original-price" v-if="hasPromoPrice">{{ hasPromoPrice }}</div>
                                <div class="product-price">{{ productPrice }}</div>
                            </div>
                        </div>
                        <div class="product-actions">
                            <div @click="minusQty()" class="product-increment material-icons-outlined">remove</div>
                            <span>{{ totalQty }}</span>
                            <div @click="plusQty()" class="product-increment material-icons-outlined" :class="{'disabled': totalQty > 0 && totalQty >= maxStock}">add</div>
                        </div>
                        <div class="product-button lite" v-if="hasVariant" @click="toggleVariants()">
                            <span>{{ !isEmpty(variant) ? variant.name : 'Select Variant' }}</span>
                            <span class="material-icons-outlined">expand_more</span>
                        </div>
                        <div class="product-button lite" v-if="hasModifierGroup()" @click="toggleVariants()">
                            <span class="product-text-nowrap">{{ !isEmpty(selectedModifiers()) ? selectedModifiers(true) : 'Select Variant' }}</span>
                            <span class="material-icons-outlined">expand_more</span>
                        </div>
                        <div class="product-button add-to-cart" :class="{'disabled': isEmpty(currentStoreInventory()), 'processing': processing}" @click="productAdded()">
                            <span>{{ cartEditProductId != null ? 'Update' : 'Add to' }} Cart</span>
                            <span class="material-icons-outlined">shopping_cart</span>
                        </div>
                        <div class="product-button lite" @click="wishList()">
                            <span>{{ this.product.favorite ? 'Added to ' : '' }} Wishlist</span>
                            <span class="favorite material-icons-outlined" :class="{'active': this.product.favorite }">favorite{{ this.product.favorite ? '' : '_border' }}</span>
                        </div>
                    </div>
                    <div class="product-content">
                        <base-accordion ref="stockAccordion" class="product-accordion" accordionTitle="Availability">
                            <div class="accordion-content">
                                <div class="stock-item freeze" v-if="isEmpty(inventories)">
                                    Stock is unavailable
                                </div>
                                <div class="stock-item" :class="{'freeze': isOmisellOutlet}"
                                    v-else-if="isEmpty(currentStoreInventory())"
                                    @click="toggleInventories()">
                                    <span class="stock-icon material-icons-outlined">{{ isOmisellOutlet ? 'local_shipping' : 'location_on'}}</span>
                                    <div class="stock-elem">
                                        <span class="elem-label" v-if="!isOmisellOutlet">Location</span>
                                        <div class="elem-location">
                                            <span v-if="!isEmpty(currentStore)">{{ isOmisellOutlet ? 'Delivery' : currentStore.name }}</span>
                                            <span class="arrow material-icons-outlined" v-if="!isOmisellOutlet">chevron_right</span>
                                        </div>
                                    </div>
                                    <div class="stock-button disabled">Out of stock</div>
                                </div>
                                <div class="stock-item" 
                                    v-else @click="toggleInventories()"
                                    :class="{'freeze': isOmisellOutlet}">
                                    <span class="stock-icon material-icons-outlined">{{ isOmisellOutlet ? 'local_shipping' : 'location_on'}}</span>
                                    <div class="stock-elem">
                                        <span class="elem-label" v-if="!isOmisellOutlet">Location</span>
                                        <div class="elem-location">
                                            <span>{{ isOmisellOutlet ? 'Delivery' : currentStoreInventory().store.name }}</span>
                                            <span class="arrow material-icons-outlined" v-if="!isOmisellOutlet">chevron_right</span>
                                        </div>
                                    </div>
                                    <div class="stock-button" :class="{'disabled': currentStoreInventory().stock <= 0}">{{ currentStoreInventory().stock > 0 ? 'In Stock' : 'Out of stock' }}</div>
                                </div>
                            </div>
                        </base-accordion>
                        <base-accordion ref="productAccordion" class="product-accordion" accordionTitle="Product Description">
                            <div class="accordion-content" v-html="productDesc"></div>
                        </base-accordion>
                        <div class="product-info strected" v-if="!isEmpty(products)">
                            <div class="product-sublabel">Recommended For You</div>
                            <product-grid :products="products" :more-button="false" :in-line="true"></product-grid>
                        </div>
                    </div>
                </div>
            </div>
            <base-modal :show="showVariants">
                <template v-slot:header>
                    <div class="modal-header header-flex">
                        <span class="material-icons-outlined" @click="toggleVariants()">close</span>
                        <h3>Product Selection</h3>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body">
                        <div class="product-form-input" v-if="!isEmpty(variants)">
                            <span class="input-label">Variant:</span>
                            <div class="modifier-list">
                                <div class="modifier" 
                                    v-for="(variant, i) in variants" 
                                    :key="i"
                                    @click="variantClicked(variant.id)">
                                        <div class="modifier-radio" :class="{'checked': variant.selected}">
                                            <span class="modifier-label">{{ variant.name }} ({{ currency(variant.price) }})</span>
                                        </div>
                                </div>
                            </div>
                        </div>
                        <div class="product-form-input" v-for="(mg, n) in modifierGroups" :key="n">
                            <span class="input-label">{{ mg.name }}:</span>
                            <div class="modifier-list">
                                <div class="modifier" v-for="(md, i) in mg.modifiers" :key="i">
                                    <div class="modifier-radio" 
                                        v-if="md.maxQuantity == 1"
                                        :class="{'checked': md.selectedAmount > 0, 'multiple-selection': mg.maxModifiers > 1}"
                                        @click="modifierClicked(md.id, mg.id)"
                                    >
                                        <span class="modifier-label">{{ md.name }} ({{ currency(md.price) }})</span>
                                    </div>
                                    <div class="modifier-wrapper" 
                                        v-if="md.maxQuantity > 1"
                                        :class="{'checked': md.selectedAmount > 0}"
                                    >
                                        <span class="modifier-label">{{ md.name }} ({{ currency(md.price) }})</span>
                                        <div class="modifier-selections">
                                            <div @click="modifierMinus(md.id)" class="modifier-increment material-icons-outlined">remove</div>
                                            <span>{{ md.selectedAmount }}</span>
                                            <div @click="modifierPlus(md,mg)" class="modifier-increment material-icons-outlined">add</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <div class="total-price">{{ currency(totalAmount) }}</div>
                    </div>
                </template>
            </base-modal>

            <base-modal :show="showInventories">
                <template v-slot:header>
                    <div class="modal-header header-flex  justify-between">
                        <h3>Availability</h3>
                        <span class="close-btn material-icons-outlined" 
                            @click="toggleInventories()"
                        >close</span>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body">
                        <div class="inventory-con">
                            <div class="inventory-item" 
                                v-for="(inv,i) in inventories" 
                                :key="i"
                                @click="selectInventory(inv)"
                                >
                                <div class="inventory-wrapper" v-if="isOmisellOutlet">
                                    <div class="inventory-store">Delivery</div>
                                    <div class="inventory-info" v-if="inv.stock > 0">In-Stock</div>
                                    <div class="inventory-info disabled" v-if="inv.stock <= 0">Out of Stock</div>
                                </div>
                                <div class="inventory-wrapper" v-else>
                                    <div class="inventory-store">{{ inv.store.name }}</div>
                                    <div class="inventory-desc">{{ getStoreDesc(inv.store.id) }}</div>
                                    <div class="inventory-info" v-if="inv.stock > 0">In-Stock</div>
                                    <div class="inventory-info disabled" v-if="inv.stock <= 0">Out of Stock</div>
                                </div>
                                <div class="inventory-icon" :class="{'active': selectedInventoryId == inv.id}">
                                    <span class="material-icons-outlined">
                                        radio_button_{{ selectedInventoryId == inv.id ? 'checked' : 'unchecked' }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <div class="btn-groups">
                            <div class="btn lite" @click="toggleInventories()">Cancel</div>
                            <div class="btn" @click="changeStore()">Select</div>
                        </div>
                    </div>
                </template>
            </base-modal>
        </template>
    </layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import { addFavorite, unFavorite } from "@/connector/productConnector";
import { getPromotions } from "@/connector/storeConnector.js";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';
import BannerCarousel from "../page-store/components/BannerCarousel.vue";
import ProductGrid from "../page-store/components/ProductGrid.vue";

export default {
	name: "ProductDetails",
	components: {
        LayoutVariantTwo,
        BannerCarousel,
        ProductGrid
	},
	mixins: [utility],
	data() {
		return {
			loading: false,
            processing: false,
            inited: false,
            banners: [],
            showVariants: false,

            cartEditProductId: null,
            carts: [],

            product: null,
            productQuantity: 1,
            variants: [],
            modifierGroups: [],
            showInventories: false,
            inventories: [],
            selectedInventoryId: null,
            store: null,
            activeBanner: null,
            activeBannerLoading: false,
            isDesktop: true,
		};
	},
    computed: {
        productPrice(){
            if(this.totalAmount > 0) return this.currency(this.totalAmount * (this.totalQty - this.sameItemQty));
            if (isEmpty(this.product)) return this.currency(0);
            let prices = [this.currency(this.product.price)];
            if(!isEmpty(this.product.variants)){
                prices = [];
                this.product.variants.forEach((variant) => {
                    prices.push(this.currency(variant.price));
                });
            }
            return prices.join(' | ');
        },
        hasPromoPrice() {
            if (isEmpty(this.product)) return null;
            if (this.product.promoPrice > 0  && this.product.price !== this.product.originalPrice) {
                return this.currency(this.product.originalPrice * this.productQuantity);
            }
            return null;
        },
        sameItemQty() {
            if (!this.cartEditProductId) return 0;
            if (isEmpty(this.product)) return 0;
            let carts = this.$store.getters.getCarts || [];
            let qty = 0;
            carts = carts?.filter((c) => {
                return c.product.id == this.product.id && c.id != this.cartEditProductId;
            });
            if (!isEmpty(carts)) {
                carts.forEach((cart) => {
                    qty += cart.quantity;
                });
            }
            return qty;
        },
        totalQty() {
            return this.productQuantity + this.sameItemQty;
        },
        currentStore(){
            return this.getCurrentStore();
        },
        products(){
            let items = this.$store.getters.getProducts;
            if(!isEmpty(this.product)){
                return items.filter((prd) => { 
                    return prd.id != this.product.id && prd.categories.filter((c) => { this.product.categories.indexOf(c.id) > -1 }).length > 0;
                });
            }
            return items;
        },
        totalAmount(){
            if(isEmpty(this.product)) return 0;
            let price = this.product.price;
            if(!isEmpty(this.product.variants)){
                if(!isEmpty(this.variant)) price = this.variant.price;
            }
            if(!isEmpty(this.modifierGroups)){
                this.modifierGroups.forEach((mg) => {
                    mg.modifiers.forEach((md) => {
                        price += md.selectedAmount * md.price;
                    })
                });
            }
            return price;
        },
        hasVariant(){
            if(isEmpty(this.product)) return false;
            return !isEmpty(this.product.variants);
        },
        variant(){
            return this.variants.find((it) => { return it.selected });
        },
        maxStock(){
            let inv = this.inventories.find((it) => { return it.id == this.selectedInventoryId });
            return !isEmpty(inv) ? inv.stock : 0;
        },
        productBrands(){
            if(isEmpty(this.product)) return "";
            let brands = this.product.brands.map((brand) => {
                return brand.name;
            });
            return isEmpty(brands) ? '' : brands.join(', ');
        },
        productDesc() {
            if(isEmpty(this.product)) return "";
            if(isEmpty(this.product.description)) return "";
            let desc = this.product.description.split('\n');
            let arr = [];
            desc.forEach((it) => {
                arr.push(it.trim());
            });
            return arr.join('<br/>');
        },
        isOmisellOutlet() {
            let outlet = this.$store.getters.getCurrentOutlet;
            if (!outlet) return false;
            return outlet.apiCode.toLowerCase() == "omisell" && outlet.stores.filter((s) => { return s.delivery }).length > 0;;
        }
    },
    methods: {
        closePage() {
            if (window.history.state.back === null) {
                let outlet = this.$store.getters.getCurrentOutlet;
                if (isEmpty(outlet)) return this.goBack();
                return this.goToWithParams("ShopPage", {
                    outlet: outlet.apiCode
                });
            }
            return this.goBack();
        },
        getStoreDesc(storeId){
            let store = this.$store.getters.getStoreList.find((s) => {
                return s.id == storeId;
            });
            if(isEmpty(store)) return "";
            let today = moment.tz(moment(), 'Asia/Singapore').format('dddd').toUpperCase();
            let hour = store.openingHours.find((it) => { return it.dayOfWeek == today });
            if(isEmpty(hour)) return 'Closed';
            let from = hour.startTime.substr(0, 5);
            let to = hour.endTime.substr(0, 5);
            return `${from} - ${to}`;
        },
        changeStore(){
            this.showInventories = false;
            let inventory = this.inventories.find((it) => {
                return it.id == this.selectedInventoryId;
            });
            if(isEmpty(inventory)) return;
            let dineType = this.$store.getters.getDineType;
            let allow = true;
            let info = "";
            this.store = this.$store.getters.getStoreList.find((s) => { return s.id == inventory.store.id });
            if(isEmpty(this.store)) return;
            switch(dineType){
                case "DELIVERY": 
                    info = "Delivery";
                    if(!this.store.delivery) allow = false;
                    break;
                case "TAKE_AWAY": 
                    info = "pick up";
                    if(!this.store.takeAway) allow = false;
                    break;
            }
            if(!allow) return this.showNotification("alert", "error_outline", `Store ${this.store.name} is not available for ${info} service!`);
        },
        selectInventory(inv, allowZero){
            if(isEmpty(inv)) return;
            if(inv.stock <= 0 && !allowZero) return;
            this.selectedInventoryId = inv.id;
        },
        toggleInventories(){
            if (this.isOmisellOutlet) return;
            this.showInventories = !this.showInventories;
        },
        selectedModifiers(display){
            let groups = [];
            if (this.hasModifierGroup()) {
                groups = this.modifierGroups.filter((mg) => {
                    return mg.modifiers.filter((md) => {
                        return md.selectedAmount > 0
                    }).length > 0;
                });
                if(display){
                    let items = [];
                    if(!isEmpty(groups)){
                        groups.forEach((mg) => {
                            mg.modifiers.forEach((md) => {
                                if(md.selectedAmount > 0){
                                    items.push(`${md.selectedAmount}x ${md.name}`)
                                }
                            });
                        });
                    }
                    return items.join(', ');
                }
            }
            return groups;
        },
        getCartIndex(carts){
            if(isEmpty(carts)) return 0;
            let cartId = 0;
            carts.forEach((cart) => { 
                if(cart.id > cartId) cartId = cart.id;
            });
            return cartId;
        },
        hasModifierGroup() {
            if(this.hasVariant) {
                return !isEmpty(this.variant.modifierGroups);
            } 
            return !isEmpty(this.modifierGroups);
        },
        async productAdded() {
            let self = this;
            if (self.processing) return;
            if (isEmpty(self.currentStoreInventory())) return;
            if (!self.isLoggedIn()) {
                return self.$router.push({
                    path: '/login',
                    query: {
                        redirect: `/shop/${self.$route.params.outlet}/product-details/${self.$route.params.productId}`
                    }
                });
            }
            let isMixnMatch = this.$store.getters.isMixnMatch;
            if(!isMixnMatch){
                let orderRequest = this.$store.getters.getOrderRequest;
                if(!isEmpty(orderRequest) && !isEmpty(orderRequest.orders)){
                    let oStores = orderRequest.orders.map((o) => {
                        return o.store;
                    });
                    if(oStores.indexOf(this.store.id) == -1) return this.showNotification("alert", "error_outline", "Mix n match orders is not allowed!");
                }
            }
            this.$store.dispatch("setCurrentStore", this.store);
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
            let errorMessages = [];
            let errorCount = 0;
            let carts = this.$store.getters.getCarts;
            let currentCartIndex = this.getCartIndex(carts);
            if (self.hasModifierGroup()) {
                self.modifierGroups.forEach(function (it) {
                    let selectedModifiers = [];
                    let totalSelectedModifier = 0;

                    it.modifiers.forEach(function (modifier) {
                        if (modifier.selectedAmount > 0) {
                            selectedModifiers.push(modifier);
                        }
                        totalSelectedModifier += modifier.selectedAmount;
                    });
                    it.selectedModifiers = selectedModifiers;

                    if (it.minModifiers === it.maxModifiers) {
                        if (totalSelectedModifier < it.minModifiers || totalSelectedModifier > it.maxModifiers) {
                            errorMessages.push("Please select " + it.minModifiers + " of " + it.name);
                            errorCount += 1;
                        }
                    } else if (it.minModifiers > 0) {
                        if (totalSelectedModifier < it.minModifiers) {
                            errorMessages.push("Please select at least " + it.minModifiers + " of " + it.name);
                            errorCount += 1;
                        }
                    } else {
                        if (totalSelectedModifier > it.maxModifiers) {
                            errorMessages.push("Please select up to " + it.maxModifiers + " of " + it.name);
                            errorCount += 1;
                        }
                    }
                });
            }
            if (errorCount > 0) {
                return this.showNotification("alert", "error_outline", errorMessages[0]);
            }
            let modifiers = [];
            let modifierPrice = 0;
            if (self.hasModifierGroup()) {
                self.modifierGroups.forEach(function (modifierGroup) {
                    modifierGroup.selectedModifiers.forEach(function (modifier) {
                        modifiers.push({
                            modifierId: modifier.id,
                            name: modifier.name,
                            quantity: modifier.selectedAmount,
                            price: modifier.price
                        });
                        modifierPrice += modifier.price * modifier.selectedAmount;
                    });
                });
            }
            let price = self.hasVariant ? (self.variant.price + modifierPrice) : (self.product.price + modifierPrice);
            let updateProduct = self.cartEditProductId != null;
            let cartIdx = carts.findIndex((c) => { return c.product.id == self.$route.params.productId && c.storeId == self.store.id });
            if (self.cartEditProductId != null) {
                cartIdx = carts.findIndex((c) => { return c.id == self.cartEditProductId });
            }
            if (cartIdx > -1) {
                let cart = carts[cartIdx];
                if (cart.freeProduct) {
                    let cartIdx2 = carts.findIndex((c) => { return c.product.id == cart.product.id && c.id !== self.cartEditProductId && c.price > 0 });
                    if (cartIdx2 > -1) {
                        cartIdx = cartIdx2;
                        cart = carts[cartIdx];
                        self.cartEditProductId = cart.id;
                    } else {
                        self.cartEditProductId = null;
                        self.productQuantity--;
                        if (self.productQuantity == 0) self.productQuantity = 1;
                        return self.productAdded();
                    }
                }
                cart.beforeEdit = cart;
                cart.quantity = self.productQuantity;
                cart.variant = self.variant;
                cart.modifierGroups = self.modifierGroups;
                cart.price = price;
                cart.accPrice = self.productQuantity * price;
                cart.specialInstructions = "";
                cart.modifiers = modifiers;
                cart.processing = true;
                cart.storeName = self.currentStoreInventory() ? self.currentStoreInventory().store.name : "";
                cart.storeId = self.currentStoreInventory() ? self.currentStoreInventory().store.id : "";
                cart.inventory = self.currentStoreInventory();

                carts[cartIdx] = cart;
            } else {
                let tempCart = {
                    id: currentCartIndex,
                    showEdit: false,
                    product: self.product,
                    quantity: self.productQuantity,
                    variant: self.variant,
                    modifierGroups: self.modifierGroups,
                    price: price,
                    accPrice: self.productQuantity * price,
                    specialInstructions: "",
                    modifiers: modifiers,
                    storeName: self.currentStoreInventory() ? self.currentStoreInventory().store.name : "",
                    storeId: self.currentStoreInventory() ? self.currentStoreInventory().store.id : "",
                    inventory: self.currentStoreInventory(),
                    processing: true,
                    freeProduct: "",
                };
                
                let isNewItem = true;
                carts.some(function (it) {
                    if (self.isEqualItem(it, tempCart)) {
                        it.quantity = tempCart.quantity;
                        it.accPrice = it.quantity * it.price;
                        isNewItem = false;
                        return true;
                    }
                });
                if (isNewItem) {
                    currentCartIndex += 1;
                    tempCart.id = currentCartIndex;
                    carts.push(tempCart);
                }
            }
            this.$store.dispatch("setCarts", carts);
            this.$store.dispatch("setAutoPromocodes", []);
            this.processing = true;
            // let cartId = this.$store.getters.getCartId || null;
            // let draft = cartId ? false : true;
            this.testOrder(false, function () {
                if(!updateProduct) {
                    window.dataLayer.push({
                        event: "add_to_cart",
                        item_id: self.product.id,
                        item_name: self.product.name
                    });
                }
                self.processing = false;
                carts = self.$store.getters.getCarts;
                carts.map((c) => {
                    c.processing = false;
                });
                self.$store.dispatch("setCarts", carts);
                if (updateProduct) {
                    return self.$router.back();
                }
                let params = { outlet: self.$route.params.outlet };
                self.$router.replace({ name: "ShopPage", params });
            }, function(error){
                self.processing = false;
                let idx = carts.findIndex((c) => {
                    return c.processing == true;
                });
                let editIdx = carts.findIndex((c) => {
                    return !isEmpty(c.beforeEdit);
                });
                if(editIdx > -1){
                    let revertCart = carts[editIdx].beforeEdit;
                    carts[editIdx] = revertCart;
                } else {
                    carts.splice(idx, 1);
                }
                self.$store.dispatch("setCarts", carts);
                if (error.promoCodes) {
                    error.message = error.promoCodes.map((prm) => {
                        return `${prm.message} : ${prm.code}`;
                    }).join('. ');
                }
                self.showNotification("alert", "error_outline", `Something went wrong! ${error.message}`);

                let promoCodes = self.$store.getters.getPromoCodes;
                let items = error.items || [];
                if (!isEmpty(items) && !isEmpty(promoCodes)) {
                    self.loading = true;
                    const checkItems = async () => {
                        let outletCode = self.getOutletCode();
                        let json = await getPromotions(outletCode);
                        let promo = json.promotions.find((it) => {
                            return promoCodes.indexOf(it.code) > -1;
                        });
                        if (promo && promoCodes.indexOf(promo.code) > -1) {
                            carts = self.$store.getters.getCarts;
                            let errorItem = items[0].id;
                            switch (promo.benefitType) {
                                case "FREE_ITEM":
                                    if (!isEmpty(promo.freeProduct)) {
                                        if (errorItem == promo.freeProduct.id) {
                                            /* if errorItem is promo item
                                                tell BE to remove promo code to fix the error:
                                            */
                                            promoCodes = promoCodes.filter((code) => { return code != promo.code });
                                            self.$store.dispatch("setPromoCodes", promoCodes);
                                            await self.testOrder(false, async () => {
                                                // tell BE to remove product from cart
                                                carts = self.$store.getters.getCarts;
                                                carts = carts.filter((c) => { return c.product.id !== self.product.id });
                                                self.$store.dispatch("setCarts", carts);
                                                // and re-apply promocode:
                                                promoCodes.push(promo.code);
                                                self.$store.dispatch("setPromoCodes", promoCodes);
                                                await self.testOrder(false, undefined, undefined, true, true);
                                            }, undefined, true, true);
                                        } else if (errorItem == self.product.id) {
                                            /* if errorItem is this product
                                                tell BE to remove product to fix the error:
                                            */
                                            carts = self.$store.getters.getCarts;
                                            carts = carts.filter((c) => { return c.product.id !== self.product.id });
                                            self.$store.dispatch("setCarts", carts);
                                            await self.testOrder(false, undefined, undefined, true, true);
                                        }
                                    }
                                    break;
                            }
                        }
                        items.splice(0, 1);
                        if (!isEmpty(items)) return checkItems();
                        self.loading = false;
                    }
                    checkItems();
                }
            }, true, true);
        },
        isEqualItem(item1, item2) {
            let data1 = {
                product: item1.product?.id,
                variant: item1.variant,
                modifierGroups: item1.modifierGroups,
                modifiers: item1.modifiers
            }
            let data2 = {
                product: item2.product?.id,
                variant: item2.variant,
                modifierGroups: item2.modifierGroups,
                modifiers: item2.modifiers
            }
            return JSON.stringify(data1) === JSON.stringify(data2);
        },
        modifierPlus(md, mg) {
            let self = this;
            self.modifierGroups.some(function (it) {
                it.modifiers.some(function (modifier) {
                    if (modifier.id === md.id) {
                        if (it.totalSelectedAmount < mg.maxModifiers) {
                            if (modifier.selectedAmount === 0) {
                                it.selectedModifiers.push(modifier);
                            }
                            modifier.selectedAmount += 1;
                            it.totalSelectedAmount += 1;
                        }
                        return true;
                    }
                });
                if(it.totalSelectedAmount === mg.maxModifiers) {
                    it.max = true;
                }
            });
        },
        modifierMinus(modifierId) {
            let self = this;
            self.modifierGroups.some(function (it) {
                it.modifiers.some(function (modifier) {
                    if (modifier.id === modifierId) {
                        if (modifier.selectedAmount > 0) {
                            modifier.selectedAmount -= 1;
                            it.totalSelectedAmount -= 1;
                            if (modifier.selectedAmount === 0) {
                                let index = it.selectedModifiers.indexOf(modifier);
                                if (index > -1) {
                                    it.selectedModifiers.splice(index, 1);
                                }
                            }
                            return true;
                        }
                    }
                });
                it.max = false;
            });
        },
        modifierClicked(modifierId, modifierGroupId) {
            let self = this;
            self.modifierGroups.some(function (it) {
                if (it.id != modifierGroupId) return true;
                if (it.minModifiers === it.maxModifiers && it.maxModifiers === 1) {
                    it.modifiers.forEach(function (modifier) {
                        if (modifier.maxQuantity === 1) {
                            if (modifier.id === modifierId) {
                                modifier.selectedAmount = 1;
                            } else {
                                modifier.selectedAmount = 0;
                            }
                        }
                    });
                } else {
                    it.modifiers.forEach(function (modifier) {
                        if (modifier.maxQuantity === 1) {
                            if (modifier.id === modifierId) {
                                if (modifier.selectedAmount > 0) {
                                    modifier.selectedAmount -= 1;
                                    it.totalSelectedAmount -= 1;
                                    it.max = false;
                                } else {
                                    if (it.totalSelectedAmount < it.maxModifiers) {
                                        modifier.selectedAmount += 1;
                                        it.totalSelectedAmount += 1;
                                    }
                                    if(it.totalSelectedAmount === it.maxModifiers) {
                                        it.max = true;
                                    }
                                }
                            }
                        }
                    });
                }
                return true;
            });
        },
        toggleVariants(){
            this.showVariants = !this.showVariants;
        },
        setModifierGroups(variant, cart = null) { // variant can also mean product in case of single modifier group
            if(isEmpty(variant.modifierGroups)) return;
            let prepareModifierGroup = (modifierGroup) => {
                modifierGroup.selectedModifiers = [];
                modifierGroup.totalSelectedAmount = 0;
                if (modifierGroup.modifiers && modifierGroup.modifiers.length > 0) {
                    modifierGroup.modifiers.forEach(function (modifier) {
                        if (modifier.maxQuantity === 1) {
                            if (modifier.preSelected) {
                                modifier.selectedAmount = 1;
                                modifierGroup.selectedModifiers.push(modifier);
                                modifierGroup.totalSelectedAmount = 1;
                            } else {
                                modifier.selectedAmount = 0;
                            }
                        } else {
                            modifier.selectedAmount = 0;
                        }
                        modifierGroup.totalSelectedAmount += modifier.selectedAmount;
                        modifierGroup.max = false;
                    });
                }
                return modifierGroup;
            }
            variant.modifierGroups.forEach(function (modifierGroup) {
                if (modifierGroup.minModifiers === modifierGroup.maxModifiers) {
                    modifierGroup.help = "Please select " + modifierGroup.minModifiers;
                } else if (modifierGroup.minModifiers > 0) {
                    modifierGroup.help = "Please select at least " + modifierGroup.minModifiers;
                } else {
                    modifierGroup.help = (modifierGroup.maxModifiers == 999) ?
                        "" : "Please select up to " + modifierGroup.maxModifiers;
                }
                let mg = prepareModifierGroup(modifierGroup);
                if (!isEmpty(cart) && !isEmpty(cart.modifierGroups)){
                    let cmg = cart.modifierGroups.find((gr) => {
                        return gr.id == modifierGroup.id;
                    });
                    if(!isEmpty(cmg)) {
                        mg.modifiers = cmg.modifiers;
                        mg.selectedModifiers = cmg.selectedModifiers;
                        mg.totalSelectedAmount = cmg.totalSelectedAmount;
                    }
                }
                modifierGroup = mg;
            });
        },
        variantClicked(variantId) {
            let self = this;
            let editCart = self.$store.getters.getCarts.find((c) => {
                return c.id == self.cartEditProductId;
            });
            /*
            if(!isEmpty(editCart)){
                mg = editCart.modifierGroups;
            }
            */
            self.variants.map(function (variant) {
                variant.selected = variant.id === variantId;
                return variant;
            });
            let variant = self.variants.find((it) => { return it.selected });
            if (!isEmpty(variant)) {
                self.setModifierGroups(variant, editCart);
                self.setModifier(variant.modifierGroups);
            }
        },
        setModifier(modifierGroup) {
            this.modifierGroups = modifierGroup;
        },
        resizeBannerHandler() {
            this.isDesktop = window.innerWidth >= 672;
            let length = document.getElementsByClassName('product-banners').length;
            for(var i=0; i<length; i++){
                let w = document.getElementsByClassName('product-banners')[i].clientWidth;
                document.getElementsByClassName('product-banners')[i].style['height'] = !isEmpty(this.banners) ? `unset !important` : `${w}px`;
            }
            setTimeout(() => {
                this.resizeImageHandler();
            }, 50);
        },
        setActiveBanner(banner) {
            let self = this;
            if (isEmpty(banner)) return;
            this.activeBannerLoading = true;
            this.activeBanner = banner;
            let im = new Image();
            im.onload = () => {
                self.activeBannerLoading = false;
            }
            im.onerror = () => {
                self.activeBannerLoading = false;
            }
            im.src = banner.thumbnail;
        },
        async getProduct(){
            let productId = this.$route.params.productId;
            let editCart = null;
            let carts = this.$store.getters.getCarts;
            let cartProductEdit = this.$store.getters.getCartProductEdit;
            if (cartProductEdit != null) {
                editCart = carts?.find(c => c.product.id == productId);
            } else {
                let cartIndex = carts?.findIndex((c) => { return c.product.id == productId });
                if (cartIndex >= 0) {
                    let outlet = this.getCurrentOutlet();
                    let store = outlet?.stores.find((s) => { return s.id == carts[cartIndex].storeId });
                    if (store) {
                        cartProductEdit = carts[cartIndex].id;
                        editCart = carts[cartIndex];
                    }
                }
            }
            
            let products = this.$store.getters.getProducts;
            let prd = products.find((prd) => { return prd.id == productId });
            let categories = this.$store.getters.getCategories;

            window.dataLayer.push({
                event: "view_item",
                item_id: productId,
                item_name: !isEmpty(prd) ? prd.name : "",
                page_location: window.location.href
            });
            
            this.banners = [];
            if (!isEmpty(prd)) {
                prd.freeProduct = null;
                let carts = this.$store.getters.getCarts;
                if (!isEmpty(carts)) {
                    let freeProducts = carts.filter(it => !isEmpty(it.freeProduct) && it.product.id == prd.id);
                    if (!isEmpty(freeProducts)) prd.freeProduct = freeProducts[0].freeProduct;
                }
                if(!isEmpty(prd.imageId)) this.banners.push({index: 0, thumbnail: this.getImage(prd.imageId, 'c_scale,w_300'), image: this.getImage(prd.imageId, 'c_fit')});
                if(!isEmpty(prd.image2Id)) this.banners.push({index: 1, thumbnail: this.getImage(prd.image2Id, 'c_scale,w_300'), image: this.getImage(prd.image2Id, 'c_fit')});
                if(!isEmpty(prd.image3Id)) this.banners.push({index: 2, thumbnail: this.getImage(prd.image3Id, 'c_scale,w_300'), image: this.getImage(prd.image3Id, 'c_fit')});
                if(!isEmpty(this.banners)) this.activeBanner = this.banners[0];
                prd.categoryDisplay = categories.filter((cat) => {
                    return prd.categories.indexOf(cat.id) > -1;
                }).map((cat) => {
                    return cat.name
                }).join(' | ');
                prd.favorite = prd.favorite || this.isFavoriteProduct(prd.id);
                if(!isEmpty(prd.variants)){
                    this.variants = prd.variants;
                    let clickVariant = prd.variants[0].id;
                    if(editCart && !isEmpty(editCart.variant)) {
                        let vr = prd.variants.find((v) => { return v.id == editCart.variant.id });
                        if(!isEmpty(vr)) clickVariant = vr.id;
                    }
                    this.variantClicked(clickVariant);
                } else {
                    let clickMod = prd.modifierGroups;
                    if(editCart && !isEmpty(editCart.modifierGroups)) clickMod= editCart.modifierGroups;
                    this.setModifier(clickMod);
                }
            }
            this.product = prd;
            await this.setInventories();
            if (editCart) {
                this.$store.dispatch("setCartProductEdit", null);
                this.cartEditProductId = cartProductEdit;
                this.productQuantity = editCart.quantity;
                let outlet = this.getCurrentOutlet();
                let store = outlet.stores.find((s) => { return s.id == editCart.storeId });
                this.$store.dispatch("setCurrentStore", store);
                this.store = store;
                let inventories = this.$store.getters.getInventory || [];
                this.selectedInventoryId = inventories.find((item) => {
                    return item.product.id == productId && item.store.id == editCart.storeId && item.status == "ACTIVE" && item.stock > 0;
                })?.id;
            }
            this.inited = true;
            window.addEventListener("resize",  this.resizeBannerHandler);
            setTimeout(() => {
                this.resizeBannerHandler();
                if (isEmpty(this.product)) return;
                this.$refs.stockAccordion.isClosed = true;
                this.$refs.productAccordion.isClosed = true;
            }, 500);
        },
        currentStoreInventory() {
            return this.inventories?.find((i) => { return i.id == this.selectedInventoryId });
        },
        async setInventories(){
            if (isEmpty(this.product)) {
                this.loading = false;
                return [];
            }
            let outletCode = this.$route.params.outlet;
            await this.retrieveInventory(false, outletCode, this.$route.params.productId);
            this.loading = false;
            let items = this.$store.getters.getInventory || [];
            let outlet = this.getCurrentOutlet();
            let storeIds = outlet.stores.map((s) => { return s.id });
            this.inventories = items?.filter((item) => {
                return storeIds.includes(item.store.id) && item.product.id == this.product.id && item.status == "ACTIVE";
            });
            storeIds = this.inventories?.map((it) => { return it.store.id });
            let curr = this.getCurrentStore();
            if (!this.selectedInventoryId) {
                this.selectedInventoryId = this.inventories?.find((item) => {
                    return item.product.id == this.product.id && item.store.id == curr?.id && item.status == "ACTIVE" && item.stock > 0;
                })?.id;
            }
            if(!storeIds?.includes(curr?.id)) {
                let inv = this.inventories?.find((it) => { return it.stock > 0 });
                let allowZero = false;
                if(isEmpty(inv)) {
                    allowZero = true;
                    inv = !isEmpty(this.inventories) ? this.inventories[0] : null;
                }
                this.selectInventory(inv, allowZero);
                this.changeStore();
            }
        },
        plusQty() {
            let inv = this.inventories.find((it) => { return it.id == this.selectedInventoryId });
            if(this.productQuantity >= inv.stock) return;
            this.productQuantity++;
        },
        minusQty() {
            if(this.productQuantity == 1) return;
            this.productQuantity--;
        },
        async wishList() {
            if (this.processing) return;
            if (!this.isLoggedIn()) return;
            try {
                if(isEmpty(this.product)) return;
                this.processing = true;
				if(this.product.favorite){
					let res = await unFavorite(this.product.id);
                    this.processing = false;
					if(!res.success) return this.showNotification("warning", "error_outline", res.message);
					this.$store.dispatch("unFavorite", this.product.id);
					this.product.favorite = false;
				} else {
					let res = await addFavorite(this.product.id);
                    this.processing = false;
					if(!res.success) return this.showNotification("warning", "error_outline", res.message);
					this.$store.dispatch("addFavorite", this.product.id);
					this.product.favorite = true;
				}
			} catch (error) {
                this.processing = false;
				this.showNotification("warning", "error_outline", error);
			}
        },
    },
	async created() {
		try {
            this.loading = true;
            let outletCode = this.$route.params.outlet;
            this.inited = false;
            
            if(!this.$store.getters.hasInited) {
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
                        this.inited = false;
                        return;
                    }
                    let currentOutlet = this.$store.getters.getCurrentOutlet;
                    let outlet = outlets.find((it) => { return it.apiCode == outletCode });
                    if(isEmpty(outlet)) {   
                        this.loading = false;
                        this.inited = false;
                        return;
                    }
                    if(!isEmpty(currentOutlet) && currentOutlet.apiCode != outlet.apiCode){
                        if(isEmpty(outlet.stores)) {   
                            this.loading = false;
                            this.inited = false;
                            return;
                        }
                        this.$store.dispatch("setCurrentOutlet", outlet);
                        this.$store.dispatch("setCurrentStore", !isEmpty(outlet.stores) ? outlet.stores[0] : null);
                    }
                }
            } else {
                await this.retrieveFavorites();
                await this.retrieveMenu(outletCode);
                let outlets = this.$store.getters.getOutlets;
                let outlet = outlets.find((it) => { return it.apiCode == outletCode });
                if(isEmpty(outlet.stores)){
                    this.loading = false;
                    this.inited = false;
                    return;
                }
                this.$store.dispatch("setCurrentOutlet", outlet);
                this.$store.dispatch("setCurrentStore", !isEmpty(outlet.stores) ? outlet.stores[0] : null);
            }
            this.store = this.getCurrentStore();
            this.getProduct();
		} catch (error) {
            this.loading = false;
            this.isDesktop = window.innerWidth >= 672;
            window.addEventListener("resize",  () => {
                this.isDesktop = window.innerWidth >= 672;
            });
			this.showNotification("alert", "error_outline", error);
		}
	},
};
</script>
<style scoped lang="scss">
    .close-btn {
        cursor: pointer;
        &:hover{ opacity: 0.7;}
    }
    .back-btn {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        cursor: pointer;
    }
    .product-header {
        padding: 16px 24px;
        text-align: left;
        color: $secondary-color-50;

        .x-title {
            font-weight: bold;
            color: $secondary-color-90;
        }
        .x-subtitle {
            color: $secondary-color-90;
        }
    }
    @keyframes processingElem {
        0% { 
            width: 0;
            background: linear-gradient(90deg, $primary-color-50 0%, $secondary-color-20);
        }
        100% { 
            width: 100%;
            background: linear-gradient(90deg, $primary-color-50 100%, $secondary-color-20);
        }
    }
    @-webkit-keyframes processingElem {
        0% {
            width: 0;
            background: linear-gradient(90deg, $primary-color-50 0%, $secondary-color-20);
        }
        100% { 
            width: 100%;
            background: linear-gradient(90deg, $primary-color-50 100%, $secondary-color-20);
        }
    }
    .product-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 16px;
        justify-content: flex-start;
        text-align: left;

        .product-banners {
            display: flex;
            flex-direction: column;
            gap: 16px;
            height: fit-content;

            .banners-desktop {
                &.invisible {
                    visibility: hidden;
                    max-height: 0;
                }
                .banner-desktop-active {
                    width: 100%;
                    position: relative;
                    aspect-ratio: 3/4;
                    &.loading {
                        background: $secondary-color-10;
                        img {
                            display: none;
                        }
                        &::before {
                            content: "";
                            width: 50px;
                            height: 50px;
                            border-radius: 50%;
                            border: 3px solid $secondary-color-30;
                            position: absolute;
                            margin: auto;
                            left: 0;
                            right: 0;
                            top: 0;
                            bottom: 0;
                            border-bottom-color: transparent;
                            border-top-color: transparent;
                            animation: spin 2.5s linear infinite;
                        }
                        &::after {
                            content: "";
                            width: 50px;
                            height: 50px;
                            border-radius: 50%;
                            border: 3px solid $secondary-color-50;
                            position: absolute;
                            margin: auto;
                            left: 0;
                            right: 0;
                            top: 0;
                            bottom: 0;
                            border-left-color: transparent;
                            border-right-color: transparent;
                            animation: spin 4s ease-out infinite;
                        }
                    }
                    img {
                        object-fit: contain;
                        width: 100%;
                        height: 100%;
                        aspect-ratio: 3/4;
                    }
                }
            }

            &.empty {
                background: $secondary-color-10;
                position: relative;
                display: none;

                &::before {
                    color: $secondary-color-50;
                    content: "no image";
                }
            }
            .banner-thumbnails {
                visibility: hidden;
                max-height: 0;
            }
        }

        .product-wrapper {
            display: flex;
            flex-direction: column;
            gap: 16px;

            .product-content {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .product-info {
                padding: 0 24px;
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 8px;

                &.strected {
                    padding: 24px 0;

                    .product-label {
                        padding: 0 24px;
                    }
                    .product-sublabel {
                        padding: 0 24px;
                    }
                }

                .product-label {
                    font-family: 'Akzidenz Grotesk Regular';
                    color: $primary-color-50;
                    line-height: initial;
                    font-weight: bold;
                }

                .product-sublabel {
                    font-family: 'Akzidenz Grotesk Super';
                    font-size: 1.4em;
                    /*
                    display: block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    */
                    line-height: initial;
                }
                .product-price {
                    font-weight: bold;
                }
            }

            .product-actions {
                width: 100%;
                max-width: 200px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 18px;
                font-weight: bold;

                .product-increment {
                    padding: 8px 12px;
                    background: $secondary-color-90;
                    color: $white;
                    cursor: pointer;
                    border-radius: 6px;

                    &.disabled {
                        background: $secondary-color-30;
                        pointer-events: none;
                    }
                }
            }
            .product-text-nowrap {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .product-button {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                background: $primary-color-50;
                color: $white;
                border: 1px solid transparent;
                width: 100%;
                max-width: 90%;
                margin: 0 auto;
                padding: 12px;
                border-radius: 12px;
                font-weight: bold;
                cursor: pointer;

                &.disabled {
                    background: $secondary-color-20;
                    color: $secondary-color-50;
                    pointer-events: none;
                }
                &.processing {
                    position: relative;
                    overflow: hidden;
                    background: $secondary-color-20;
                    & span {
                        z-index: 3;
                    }
                    &::before {
                        position: absolute;
                        content: "";
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 12px;
                        top: 0;
                        bottom: 0;
                        left: 0;
                        transition: all 1s;
                        -webkit-transition: all 1s;
                        animation: processingElem 1s ease-in-out infinite;
                        -webkit-animation: processingElem 1s ease-in-out infinite;
                        z-index: 1;
                    }
                    &::after {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: absolute;
                        left: 0;
                        right: 0;
                        top: 0;
                        bottom: 0;
                        margin: auto;
                        content: "";
                        z-index: 2;
                        background: linear-gradient(90deg, $secondary-color-20, transparent);
                    }
                }

                &.lite {
                    border-color: $primary-color-20;
                    background: $white;
                    color: $secondary-color-90;
                }

                .favorite {
                    &.active {
                        color: $primary-color-50;
                    }
                }
            }
            .product-accordion {
                padding: 0 24px;

                .accordion-content {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;

                    .stock-item {
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                        &:not(.freeze) {
                            cursor: pointer;
                            &:hover{opacity: 0.7;}
                        }

                        .stock-icon {
                            color: $secondary-color-70;
                        }
                        .stock-elem {
                            display: flex;
                            flex-direction: column;
                            gap: 8px;
                            flex: 3;

                            .elem-label {
                                color: $secondary-color-60;
                            }
                            .elem-location {
                                color: $secondary-color-90;
                                font-weight: bold;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            }
                        }
                        .stock-button {
                            background: $success-green;
                            color: $white;
                            padding: 6px 16px;
                            border-radius: 8px;
                            white-space: nowrap;

                            &.disabled {
                                color: $secondary-color-90;
                                background: $secondary-color-20;
                            }
                        }
                    }
                }
            }
        }
    }

    @media (min-width: 672px) {
        .product-header {
            margin-top: 24px;
            padding: 16px 7% !important;
            padding-bottom: 0;
            text-align: left;
        }
		.product-container {
			padding: 16px 7% !important;
            flex-direction: row;

            .product-banners {
                flex: 3;
                display: flex;
                flex-direction: row-reverse;
                gap: 16px;
                
                .banner-carousel {
                    border: 1px solid $secondary-color-20;
                    border-radius: 8px;
                    overflow: hidden;
                    flex: 6;

                    img {
                        width: 100%;
                        object-fit: contain;
                    }
                }
                .banners-desktop {
                    width: 100%;
                    height: 100%;
                }
                .banner-thumbnails {
                    visibility: visible !important;
                    width: 100%;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    flex: 1;
                    height: fit-content;
                    max-height: 100% !important;

                    .thumbnail {
                        width: 100%;
                        min-width: 65px;
                        border-radius: 5px;
                        border: 1px solid $secondary-color-20;
                        overflow: hidden;
                        cursor: pointer;
                        background: $white;
                        aspect-ratio: 3/4;
                        position: relative;

                        img {
                            object-fit: contain;
                            width: 100%;
                            height: 100%;
                            aspect-ratio: 3/4;
                            mix-blend-mode: multiply;
                        }

                        &.active {
                            border-color: $primary-color-50;
                        }
                    }
                }
            }
            .product-wrapper {
                flex: 2;

                &.empty-image {
                    flex-direction: row;
                    gap: 48px;
                    
                    .product-content {
                        flex: 1;

                        & + .product-content {
                            border-left: 3px solid $secondary-color-10;
                            padding-left: 7% !important;
                        }
                    }
                    .product-button {
                        max-width: 100%;
                    }
                    .product-info {
                        padding: 0 !important;
                    }
                    .accordion {
                        padding: 0 !important;
                    }
                }
            }
		}
	}

    .arrow {
        color: $primary-color-50;
    }
    .product-form-input {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 0 24px;
        text-align: left;

        .input-label {
            font-weight: bold;
        }

        & + * {
            padding-top: 24px;
        }
    }
    .modifier-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-top: 16px;

        .modifier-radio {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            position: relative;

            &::after {
                content: "radio_button_unchecked";
				color: $secondary-color-30;
				width: 25px;
				height: 25px;
				border-radius: 4px;
				background: $white;
				font-family: 'Material Icons Outlined';
				font-weight: normal;
				font-style: normal;
				font-size: 28px;
				letter-spacing: normal;
				text-transform: none;
				display: inline-block;
				white-space: nowrap;
				word-wrap: normal;
				direction: ltr;
				text-rendering: optimizeLegibility;
				-webkit-font-smoothing: antialiased;
            }

            &:is(.checked)::after {
                content: "radio_button_checked";
                color: $primary-color-70;
            }

            &:is(.multiple-selection) {
                &:is(.checked)::after{
                    content: "task_alt";
                }
            }
        }

        .modifier-wrapper {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;

            .modifier-selections {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;

                .modifier-increment {
                    font-size: 0.8em;
                    border: 1px solid $secondary-color-60;
                    padding: 4px;
                    border-radius: 4px;
                }
            }
        }
    }
    .total-price {
        border-top: 1px solid $secondary-color-10;
        width: 100%;
        font-family: 'Akzidenz Grotesk Super';
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 24px;
        padding-top: 24px;
    }
    .inventory-con {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 24px 16px;
        text-align: left;

        .inventory-item {
            width: 100%;
            display: flex;
            gap: 24px;
            align-items: center;
            cursor: pointer;
            &:hover{ opacity: 0.7;}
        }
        .inventory-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 6px;

            .inventory-store {
                color: $secondary-color-90;
            }
            .inventory-desc {
                width: 100%;
                display: flex;
                gap: 8px;
                align-items: center;
                color: $primary-color-50;
            }
            .inventory-info {
                padding: 4px 8px;
                background: $success-green;
                color: $white;
                border-radius: 8px;
                width: fit-content;

                &.disabled {
                    background: $secondary-color-30;
                    color: secondary-color-50;
                }
            }
        }
        .inventory-icon {
            cursor: pointer;
            color: $secondary-color-50;

            &.active {
                color: $primary-color-50;
            }
        }
    }
    .btn-groups {
        width: 100%;
        display: flex;
        gap: 24px;
        align-items: center;
        justify-content: space-between;

        .btn {
            padding: 12px 32px;
            text-align: center;
            background: $primary-color-50;
            cursor: pointer;
            border-radius: 12px;
            color: $white;

            &.lite {
                background: $white;
                color: $primary-color-50;
                border: 1px solid $primary-color-50;
            }
        }
    }
    .modal-footer {
        border-top: 1px solid $secondary-color-10;
    }
</style>
