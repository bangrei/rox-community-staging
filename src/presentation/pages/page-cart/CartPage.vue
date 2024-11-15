<template>
    <layout-variant-two :show-loading-screen="loading" :free-footer="true" :hide-footer="isEmpty(carts)">
        <template v-slot:header>
			<div class="slide-down">
				<div class="header-con light">
					<div class="back-btn" @click="goBack()">
                        <span class="material-icons">arrow_back</span>
                        <h1 class="heading-5 center">Cart</h1>
                    </div>
					<base-header-nav :menu-only="true"></base-header-nav>
				</div>
			</div>
		</template>
        <template v-slot:body>
            <div class="cart-container" v-if="!isEmpty(carts)">
                <div class="cart-body">
                    <div class="cart-items">
                        <div class="cart-item" v-for="cart in carts" :key="cart.product.id">
                            <div class="cart-wrapper">
                                <div class="cart-product" 
                                    @click="editCart(cart)"
                                    :class="{'no-image': !cart.product.imageDisplay}">
                                    <img :class="cart.product.imageSize" v-if="cart.product.imageDisplay" :alt="cart.product.name" :src="cart.product.imageDisplay"/>
                                </div>
                                <div class="cart-info">
                                    <div class="cart-category">{{ cart.product.categoryDisplay }}</div>
                                    <div class="cart-name">{{ cart.product.name }}</div>
                                    <div class="cart-modifiers" v-if="hasVariant(cart) || hasModifiers(cart)">
                                        <span v-if="hasVariant(cart)">{{ getVariant(cart) }}</span>
                                        <span :class="{'separator': hasVariant(cart) && hasModifiers(cart)}"></span>
                                        <span>{{ getModifiers(cart) }}</span>
                                    </div>
                                    <div class="product-price-wrapper">
                                        <div class="original-price" v-if="hasPromoPrice(cart)">{{ hasPromoPrice(cart) }}</div>
                                        <div class="cart-price">{{ currency(cart.price) }}</div>
                                    </div>
                                    <div class="cart-actions" v-if="isDesktop">
                                        <div class="free-product" v-if="cart.freeProduct">{{ cart.quantity }}x free item(s)</div>
                                        <div class="cart-buttons" v-else>
                                            <div class="cart-increment" @click="minusCart(cart.id)">
                                                <span class="material-icons-outlined">remove</span>
                                            </div>
                                            <div class="">{{ cart.quantity }}</div>
                                            <div class="cart-increment" @click="plusCart(cart)">
                                                <span class="material-icons-outlined">add</span>
                                            </div>
                                        </div>
                                        <span class="cart-acc-price">{{ currency(cart.accPrice) }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="cart-actions" v-if="!isDesktop">
                                <div class="free-product" v-if="cart.freeProduct">{{ cart.quantity }}x free item(s)</div>
                                <div class="cart-buttons" v-else>
                                    <div class="cart-increment" @click="minusCart(cart.id)">
                                        <span class="material-icons-outlined">remove</span>
                                    </div>
                                    <div class="">{{ cart.quantity }}</div>
                                    <div class="cart-increment" @click="plusCart(cart)">
                                        <span class="material-icons-outlined">add</span>
                                    </div>
                                </div>
                                <span>{{ currency(cart.accPrice) }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="cart-details">
                        <widget-promo-code @emit-promocode="emitPromoCode" />
                        <widget-voucher/>
                        <Widget-fulfillment-display @change-address="changeAddress"/>
                        <div class="cart-sum">
                            <div class="cart-sum-header">Summary</div>
                            <div class="cart-sum-body">
                                <div class="cart-sum-item">
                                    <div class="cart-sum-item-label">Subtotal</div>
                                    <div class="cart-sum-item-label">{{ subTotalDisplay }}</div>
                                </div>
                                <div class="cart-sum-item" v-for="extra in extraCharges" :key="extra.name">
                                    <div class="cart-sum-item-label">{{ extra.name }} {{ extra.percentage ? '(' + extra.percentage + '%)' : '' }}</div>
                                    <div class="cart-sum-item-label">{{ currency(extra.amount) }}</div>
                                </div>
                                <div class="cart-sum-item" v-for="extra in outletExtraCharges" :key="extra.extraCharges.name">
                                    <div class="cart-sum-item-label">{{ extra.displayName }}</div>
                                    <div class="cart-sum-item-label">{{ currency(extra.extraCharges.amount) }}</div>
                                </div>
                                <div class="cart-sum-item" v-for="disc in discounts" :key="disc.id">
                                    <div class="cart-sum-disc-icon" v-if="disc.promotion || disc.voucher" @click="removeDiscount(disc)">
                                        <span class="material-icons-outlined">highlight_off</span>
                                    </div>
                                    <div class="cart-sum-disc-label">{{ disc && !disc.promotion && !disc.voucher ? 'Points' : disc.reason }}</div>
                                    <div class="cart-sum-disc-label nowrap">-{{ currency(disc.amount) }}</div>
                                </div>
                                <div class="cart-sum-item" v-for="disc in discountPerBrand" :key="disc.discount.id">
                                    <div class="cart-sum-disc-icon" v-if="disc.discount.promotion || disc.discount.voucher" @click="removeDiscount(disc.discount)">
                                        <span class="material-icons-outlined">highlight_off</span>
                                    </div>
                                    <div class="cart-sum-disc-label">{{ disc && !disc.discount && !disc.discount.promotion && !disc.discount.voucher ? 'Points' : disc.discount.reason }}</div>
                                    <div class="cart-sum-disc-label nowrap">-{{ currency(disc.discount.amount) }}</div>
                                </div>
                                <div class="cart-sum-item bold">
                                    <div class="cart-sum-item-label">Estimated Total</div>
                                    <div class="cart-sum-item-label">{{ totalDisplay }}</div>
                                </div>
                            </div>
                            <div class="cart-sum-footer">
                                <div class="checkout-btn" @click="checkout()">Checkout</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="cart-footer">
                    <div class="cart-total-wrapper">
                        <span>Estimated Total</span>
                        <div class="total-amount" @click="toggleModal()">
                            <span class="icon material-icons-outlined">{{ showModal ? 'expand_less' : 'expand_more' }}</span>
                            <span>{{ totalDisplay }}</span>
                        </div>
                    </div>
                    <div class="checkout-btn" @click="checkout()">Checkout</div>
                </div>
            </div>

            <div class="cart-empty" v-if="isEmpty(carts) && !loading"></div>
            
            <base-modal v-if="!isDesktop" :show="showModal" :align-bottom="true">
                <template v-slot:header>
                    <div class="modal-header header-flex justify-between">
                        <h3>Summary</h3>
                        <span class="close-btn material-icons-outlined" @click="toggleModal()">close</span>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body">
                        <div class="modal-row">
                            <div class="modal-subtotal-label">Subtotal</div>
                            <div class="modal-subtotal">{{ subTotalDisplay }}</div>
                        </div>
                        <div class="modal-row" v-for="extra in extraCharges" :key="extra.name">
                            <div class="modal-item-label">{{ extra.name }} {{ extra.percentage ? '(' + extra.percentage + '%)' : '' }}</div>
                            <div class="modal-item-label">{{ currency(extra.amount) }}</div>
                        </div>
                        <div class="modal-row" v-for="extra in outletExtraCharges" :key="extra.displayName">
                            <div class="modal-item-label">{{ extra.displayName }}</div>
                            <div class="modal-item-label">{{ currency(extra.extraCharges.amount) }}</div>
                        </div>
                        <div class="modal-row" v-for="disc in discounts" :key="disc.id">
                            <div class="modal-disc-icon" v-if="disc.promotion" @click="removeDiscount(disc)">
                                <span class="material-icons-outlined">highlight_off</span>
                            </div>
                            <div class="modal-disc-label">{{ disc && !disc.promotion && !disc.voucher ? 'Points' : disc.reason }}</div>
                            <div class="modal-disc-label nowrap">-{{ currency(disc.amount) }}</div>
                        </div>
                        <div class="modal-row" v-for="disc in discountPerBrand" :key="disc.discount.id">
                            <div class="modal-disc-icon" v-if="disc.discount.promotion" @click="removeDiscount(disc.discount)">
                                <span class="material-icons-outlined">highlight_off</span>
                            </div>
                            <div class="modal-disc-label">{{ disc && !disc.discount && !disc.discount.promotion && !disc.discount.voucher ? 'Points' : 'Discount (' + disc.discount.reason + ')' }}</div>
                            <div class="modal-disc-label nowrap">-{{ currency(disc.discount.amount) }}</div>
                        </div>
                        <div class="modal-row bordered">
                            <div class="modal-total-label">Total</div>
                            <div class="modal-total-label">{{ totalDisplay }}</div>
                        </div>
                    </div>
                    <div class="cart-footer">
                        <div class="cart-total-wrapper">
                            <span>Estimated Total</span>
                            <div class="total-amount" @click="toggleModal()">
                                <span class="icon material-icons-outlined">{{ showModal ? 'expand_less' : 'expand_more' }}</span>
                                <span>{{ totalDisplay }}</span>
                            </div>
                        </div>
                        <div class="checkout-btn" @click="checkout()">Checkout</div>
                    </div>
                </template>
            </base-modal>
        </template>
    </layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import WidgetFulfillmentDisplay from "@/components/widgets/WidgetFulfillmentDisplay.vue";
import WidgetPromoCode from "@/components/widgets/WidgetPromoCode.vue";
import WidgetVoucher from "@/components/widgets/WidgetVoucher.vue";
import { getTransactionalPoints } from "@/connector/customerConnector";
import { getInventory } from "@/connector/productConnector";
import { getPromotions } from "@/connector/storeConnector.js";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";

export default {
	name: "CartPage",
	components: {
        LayoutVariantTwo,
        WidgetVoucher,
        WidgetPromoCode,
        WidgetFulfillmentDisplay,
	},
	mixins: [utility],
	data() {
		return {
			loading: false,
            carts: [],
            processing: false,
            showModal: false,
            promoCode: "",
            isDesktop: true,
		};
	},
    computed: {
        total(){
            let orderRequest = this.$store.getters.getOrderRequest;
            if(isEmpty(orderRequest)) return 0;
            return orderRequest.total;
        },
        totalDisplay(){
            if(this.total) return this.currency(this.total);
            return 0;
        },
        subTotal(){
            let orderRequest = this.$store.getters.getOrderRequest;
            if(isEmpty(orderRequest)) return 0;
            return orderRequest.subTotal;
        },
        subTotalDisplay(){
            if(this.subTotal) return this.currency(this.subTotal);
            return 0;
        },
        extraCharges(){
            return this.$store.getters.getExtraCharges || [];
        },
        outletExtraCharges() {
            let items = this.$store.getters.getOutletExtraCharges || [];
            if(isEmpty(items)) return []
            items = items.map((it) => {
                let displayName = [it.extraCharges.name]
                if (it.extraCharges.percentage) {
                    displayName.push(`${it.extraCharges.percentage}%`)
                    if (it.extraCharges.inclusive) displayName.push('(incl.)')
                    else displayName.push('(excl.)')
                }
                it.displayName = displayName.join(' ')
                return it
            })

            return this.filterOutletExtraCharges(items)
        },
        discounts() {
            return this.$store.getters.getDiscounts || [];
        },
        discountPerBrand() {
            return this.$store.getters.getDiscountPerBrand || [];
        },
        appliedPromoCodes(){
            return this.$store.getters.getPromoCodes || [];
        },
    },
    methods: {
        async changeAddress() {
            let self = this;
            let callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : () => { };
            let address = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : () => null;
            this.$store.dispatch("setDeliveryAddress", address);
            self.processing = true;
            this.testOrder(false, function (json) {
                self.processing = false;
                let carts = self.$store.getters.getCarts;
                if (carts.length > 0) {
                    carts = carts.map(c => self.setCartDisplay(c));
                }
                self.carts = carts;
                self.$store.dispatch("setCarts", self.carts);
                callback(json);
            }, function (error) {
                self.$store.dispatch("setDeliveryAddress", null);
                self.processing = false;
                let carts = self.$store.getters.getCarts;
                self.carts = carts;
                self.$store.dispatch("setCarts", self.carts);
                if (error.message) self.showNotification("alert", "error_outline", `Something went wrong! ${error.message}`);
                callback(error);
            }, true, true);
        },
        removeVoucher(disc) {
            let voucher = this.$store.getters.getAppliedVouchers.find((it) => { return it.id == disc.voucher });
            if (!voucher) voucher = this.$store.getters.getAppliedCashVouchers.find((it) => { return it.id == disc.voucher });
            if (!voucher) return;
            
            if (voucher.isCashVoucher) {
                this.$store.dispatch('removeAppliedCashVoucher', voucher.id);
            } else {
                this.$store.dispatch('removeAppliedVoucher', voucher.id);
            }
            let self = this;
            this.processing = true;
            this.testOrder(false, function () {
                self.processing = false;
                self.showNotification("success", "error_outline", `Voucher has been removed!`);
            }, function (error) {
                self.processing = false;
                if (voucher.isCashVoucher) {
                    self.$store.dispatch('addAppliedCashVouchers', voucher);
                } else {
                    self.$store.dispatch('addAppliedCashVouchers', voucher);
                }
                if (error.promoCodes) {
                    error.message = error.promoCodes.map((prm) => {
                        return `${prm.message} : ${prm.code}`;
                    }).join('. ');
                }
                self.showNotification("alert", "error_outline", `Something went wrong! ${error.message}`);
            }, true, true);
        },
        cartOutlets() {
            let outletList = this.$store.getters.getOutlets;
            return this.carts.map((cart) => {
                return outletList.find((outlet) => {
                    return outlet.stores.filter((s) => { return s.id == cart.storeId }).length > 0;
                });
            });
        },
        filterOutletExtraCharges(items) {
            let extraCharges = [];
            items.forEach((item) => {
                let idx = extraCharges.findIndex((it) => {
                    return it.displayName == item.displayName
                })
                if (idx == -1) extraCharges.push(item)
                else extraCharges[idx].extraCharges.amount += parseFloat(item.extraCharges.amount)
            })
            return extraCharges
        },
        checkout() {
            if (!this.isLoggedIn()) {
                return this.$router.push({
                    path: '/login',
                    query: {
                        redirect: `/cart/${this.$route.params.outletCode}/${this.$route.params.cartId}`,
                        reinit: true
                    }
                });
            }
            if (this.isOrderOmisell()) {
                let address = this.$store.getters.getDeliveryAddress;
                if(isEmpty(address)) return this.showNotification("alert", "error_outline", "Delivery address is required!");
            }
            this.goTo('CheckoutPage');
        },
        toggleModal(){
            this.showModal = !this.showModal;
        },
        editCart(cart) {
            let outlet = this.$store.getters.getCurrentOutlet;
            if (cart.freeProduct) {
                let otherCart = this.carts.find((c) => { return c.product.id == cart.product.id && c.id !== cart.id });
                if (!isEmpty(otherCart)) {
                    cart = otherCart;
                }
            }
            let product = cart.product;
            let store = outlet.stores.find((s) => { return s.id == cart.storeId });
            if(!isEmpty(store)){
                this.$store.dispatch("setCurrentStore", store);
            }
            this.$store.dispatch("setCartProductEdit", cart.id);
            this.goToWithParams('ProductDetails', {
                outlet: outlet.apiCode,
                productId: product.id
            });
        },
        async getCart(isInited) {
            let self = this;
            let carts = this.$store.getters.getCarts;
            let cartId = this.$route.params.cartId;
            let outlets = this.$store.getters.getOutlets || [];

            if (isInited) {
                carts.map((cart) => {
                    cart = self.setCartDisplay(cart);
                    return cart;
                });
                this.carts = carts;
                this.loading = false;
                return;
            }

            let errorMessage = "";

            await self.retrieveCartDetails(cartId, async (json) => {
                carts = json.carts;
                errorMessage = json.message;
                if (!isEmpty(carts)) {
                    carts.forEach(async (cart) => {
                        cart = self.setCartDisplay(cart);
                        if (isInited) return;
                        let currOutlet = outlets.find((ou) => {
                            return ou.stores.filter(s => s.id == cart.storeId).length > 0
                        });
                        let inv = await getInventory(currOutlet.apiCode, cart.product.id);
                        cart.inventory = inv.success && inv.inventories.length > 0 ? inv.inventories[0] : null;
                    });
                    self.carts = carts;
                    self.$store.dispatch("setCarts", carts);
                    let discPerBrand = this.$store.getters.getDiscountPerBrand;
                    let discounts = this.$store.getters.getDiscounts || [];
                    if (discPerBrand) {
                        discounts = [...discounts, ...discPerBrand.map((d) => { return d.discount })];
                    }
                    
                    if (discounts) {
                        let vouchers = discounts.filter((it) => { return it.voucher || it.promotion });
                        if (vouchers.length) {
                            const res = await getTransactionalPoints();
                            const voucherIds = vouchers.map((v) => { return v.voucher });
                            if (res.success && res.customer.vouchers) {
                                const resV = res.customer.vouchers;
                                resV.forEach((it) => {
                                    if (!voucherIds.includes(it.id)) return;
                                    it.isCashVoucher = false;
                                    it.applied = true;
                                    if (it.promotion.publishType) {
                                        it.display = {
                                            name: it.promotion.name,
                                            desc: it.promotion.benefitType.split('_').join(' ').toLowerCase()
                                        }
                                        self.$store.dispatch('addAppliedVouchers', it);
                                    } else {
                                        it.isCashVoucher = true;
                                        it.display = {
                                            name: `${this.currency(it.promotion.amount)} ${it.promotion.name}`,
                                            desc: `Cash voucher no. ${it.promotion.number}`
                                        }
                                        self.$store.dispatch('addAppliedCashVouchers', it);
                                    }
                                });
                            }
                        }
                    }
                }
                self.loading = false;
                if (errorMessage) return self.showNotification("alert", "error_outline", errorMessage);
            });
        },
        getProductImage(product){
            let img = product.imageId;
            if(!img) img = product.image2Id;
            if(!img) img = product.image3Id;
            if(!img) return null;
            return this.$store.getters.cloudinaryURL + 'c_scale,w_150/' + img;
        },
        hasVariant(cart){
            return !isEmpty(cart.variant);
        },
        getVariant(cart){
            return cart.variant.name;
        },
        hasModifiers(cart){
            return !isEmpty(cart.modifiers);
        },
        getModifiers(cart){
            let modifiers = [];
            if(!isEmpty(cart.modifiers)){
                cart.modifiers.forEach((mod) => {
                    modifiers.push(`${mod.quantity}x ${mod.name}`);
                });
            }
            return modifiers.join(', ');
        },
        async plusCart(cart) {
            let self = this;
            if (this.processing) return;
            let isOverstock = false;
            this.carts.forEach((c) => {
                if (c.id == cart.id) {
                    if(c.quantity >= cart.inventory.stock) {
                        isOverstock = true;
                        return;
                    }
                    c.quantity += 1;
                    c.accPrice = c.price * c.quantity;
                }
            });
            if (isOverstock) {
                this.processing = false;
                return;
            }
            this.$store.dispatch("setCarts", this.carts);
            this.$store.dispatch("setAutoPromocodes", []);
            this.processing = true;
            this.testOrder(false, function () {
                self.processing = false;
                self.carts = self.$store.getters.getCarts;
            }, function(error){
                self.processing = false;
                self.carts.forEach((c) => {
                    if(c.id == cart.id) {
                        c.quantity -= 1;
                        c.accPrice = c.price * c.quantity;
                    }
                });
                self.$store.dispatch("setCarts", self.carts);
                if (error.promoCodes) {
                    error.message = error.promoCodes.map((prm) => {
                        return `${prm.message} : ${prm.code}`;
                    }).join('. ');
                }
                self.showNotification("alert", "error_outline", `Something went wrong! ${error.message}`);
            }, true, true);
        },
        async minusCart(id){
            let self = this;
            if (this.processing) return;
            let cartIdx = this.carts.findIndex((cart) => { return cart.id == id });
            if (cartIdx == -1) return;
            let cartTobeRemoved = null;
            let countOtherCriteriaProductsInTheCart = 0;
            let promoItems = this.carts.filter((item) => { return !isEmpty(item.freeProduct) });
            let promoCodesTobeRemoved = [];
            const validatePromotions = async () => {
                let promoItem = promoItems[0];
                promoItems.splice(0, 1);
                let code = this.$store.getters.getOutlets.find((o) => { return o.stores.filter((s) => { return s.id == promoItem.storeId }) });
                let res = await getPromotions(code.apiCode);
                let promo = res.success ? res.promotions.find((p) => { return p.code == promoItem.freeProduct }) : null;
                if (!isEmpty(promo) && !isEmpty(promo.criteriaProducts)) {
                    if (promo.criteriaProducts.includes(cartTobeRemoved.product.id)) {
                        if (!isEmpty(this.carts)) {
                            if (!isEmpty(promo.freeProduct)) {
                                this.carts.forEach((cart) => {
                                    if (promo.criteriaProducts.includes(cart.product.id) && isEmpty(cart.freeProduct)) {
                                        countOtherCriteriaProductsInTheCart += 1;
                                    }
                                });
                            }
                        }
                        // dont remove promo code if there any other criteria products in the cart:
                        if (countOtherCriteriaProductsInTheCart == 0) {
                            promoCodesTobeRemoved.push(promo.code);
                            let promoCodes = self.$store.getters.getPromoCodes.filter((cd) => { return cd != promo.code });
                            this.$store.dispatch("setPromoCodes", promoCodes);
                        }
                    }
                }
                if (!isEmpty(promoItems)) await validatePromotions();
            }
            this.carts[cartIdx].quantity -= 1;
            this.carts[cartIdx].accPrice = this.carts[cartIdx].price * this.carts[cartIdx].quantity;
            if (this.carts[cartIdx].quantity <= 0) {
                cartTobeRemoved = this.carts[cartIdx];
                this.carts.splice(cartIdx, 1);
                // if product is removed, then need to remove free item as well
                if (!isEmpty(promoItems)) await validatePromotions();
            }
            this.$store.dispatch("setCarts", this.carts);
            this.$store.dispatch("setAutoPromocodes", []);
            if (isEmpty(this.carts)) {
                this.resetCart();
                if (this.$store.getters.getAppliedCashVouchers) {
                    this.$store.getters.getAppliedCashVouchers.forEach((it) => {
                        this.$store.dispatch("removeAppliedCashVoucher", it.id);
                    });
                }
                if (this.$store.getters.getAppliedVouchers) {
                    this.$store.getters.getAppliedVouchers.forEach((it) => {
                        this.$store.dispatch("removeAppliedVoucher", it.id);
                    });
                }
            }
            
            let goProcess = () => {
                this.processing = true;
                this.testOrder(false, function () {
                    self.processing = false;
                    let carts = self.$store.getters.getCarts;
                    if (!isEmpty(promoCodesTobeRemoved)) {
                        carts = carts.filter((c) => {
                            return !promoCodesTobeRemoved.includes(c.freeProduct);
                        })
                    }
                    if (carts.length > 0) {
                        carts = carts.map(c => self.setCartDisplay(c));
                    }
                    self.carts = carts;
                    if (!isEmpty(cartTobeRemoved)) {
                        let thisOutletCode = self.$route.params.outletCode;
                        let cartId = self.$route.params.cartId;
                        let cartOutlets = self.cartOutlets().map((co) => { return co.apiCode });
                        if (!cartOutlets.includes(thisOutletCode)) {
                            self.$store.dispatch("setInited", false);
                            self.goToWithParams('CartPage', { cartId: cartId, outletCode: cartOutlets[0] });
                        }
                    }

                    // if(isEmpty(self.carts)) self.$store.dispatch("setCartId", null);
                }, function(error){
                    self.processing = false;
                    let carts = self.$store.getters.getCarts;
                    if (!isEmpty(carts)) {
                        if (!isEmpty(promoCodesTobeRemoved)) {
                            carts = carts.filter((c) => {
                                return !promoCodesTobeRemoved.includes(c.freeProduct);
                            });
                        }
                        carts.forEach((cart) => {
                            if (cart.id == id) {
                                cart.quantity += 1;
                                cart.accPrice = cart.price * cart.quantity;
                            }
                        });
                    }
                    self.carts = carts;
                    if(error.promoCodes){
                        let promoCodes = self.$store.getters.getPromoCodes;
                        let errMsg = [];
                        let removedAutoPromos = self.$store.getters.getAutoPromoCodes;
                        error.promoCodes.forEach((prm) => {
                            removedAutoPromos.push(prm.code);
                            errMsg.push(`Promo code ${prm.code}: ${prm.message}`);
                            let idx = promoCodes.findIndex((cd) => { return cd == prm.code });
                            if(idx >= 0) promoCodes.splice(idx, 1);
                        });
                        error.message = errMsg.join('. ');
                        self.$store.dispatch("setPromoCodes", promoCodes);
                        self.$store.dispatch("setAutoPromocodes", removedAutoPromos);
                        goProcess();
                    }
                    self.$store.dispatch("setCarts", self.carts);
                    if (error.message) self.showNotification("alert", "error_outline", `Something went wrong! ${error.message}`);
                }, true, true);
            }
            goProcess();
        },
        removeDiscount(disc){
            if (isEmpty(disc)) return;
            if (disc.voucher) return this.removeVoucher(disc);
            let reason = disc.reason.split(' ');
            let code = !isEmpty(reason) ? reason[reason.length - 1] : "";
            let promoCodes = this.$store.getters.getPromoCodes;
            promoCodes = promoCodes.filter((it) => { return it != code });
            let autoPromocodes = this.$store.getters.getAutoPromoCodes;
            autoPromocodes.push(code);
            this.$store.dispatch("setPromoCodes", promoCodes);
            this.$store.dispatch("setAutoPromocodes", autoPromocodes);
            this.executePromo(code);
        },
        setCartDisplay(cart) {
            let im = new Image();
            let size = 'potrait';
            let url = this.getProductImage(cart.product);
            if(url){
                im.onload = function () {
                    if(im.width >= im.height) size = 'landscape';
                    cart.product.imageSize = size;
                }
                im.src = url;
            }
            cart.product.imageDisplay = url;
            cart.product.imageSize = size;
            return cart;
        },
        async executePromo(removeCode, showAlert = true){
            let self = this;
            let callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () { };
            await self.testOrder(false, async function (json) {
                let carts = self.$store.getters.getCarts;
                if (carts.length > 0) {
                    carts = carts.map(c => self.setCartDisplay(c));
                }
                self.carts = carts;
                self.processing = false;
                self.promoCode = "";
                if(!self.isDesktop) self.showModal = true;
                if (removeCode) {
                    if (showAlert) self.showNotification("success", "error_outline", `${removeCode} has been removed`);
                    return;
                }
                if (showAlert) self.showNotification("success", "error_outline", `${self.promoCode} has been applied`);
                callback(json);
            }, function (error) {
                self.processing = false;
                let promoCodes = self.$store.getters.getPromoCodes;
                promoCodes = promoCodes.filter((it) => { return it != self.promoCode });
                self.$store.dispatch("setPromoCodes", promoCodes);
                if (error.promoCodes) {
                    error.message = error.promoCodes.map((prm) => {
                        return `${prm.message} : ${prm.code}`;
                    }).join('. ');
                }
                if (showAlert) self.showNotification("alert", "error_outline", `Something went wrong! ${error.message}`);
                callback(error);
            }, true, true);
        },
        async emitPromoCode(currentPromocode, promoCodes, callbackEmit) {
            let self = this;
            self.processing = true;
            self.promoCode = currentPromocode;
            let autoPromos = self.$store.getters.getAutoPromoCodes;
            if (autoPromos) {
                autoPromos = autoPromos.filter((it) => {
                    return it != currentPromocode;
                });
                self.$store.dispatch("setAutoPromocodes", autoPromos);
            }
            await self.executePromo(null, (json) => {
                let msg = `${currentPromocode} has been applied`;
                let icon = "success";
                if (!json.success) {
                    icon = "alert";
                    msg = json.message;
                    promoCodes.pop();
                    self.$store.dispatch("setPromoCodes", promoCodes);
                    self.executePromo(currentPromocode, false);
                    self.showNotification(icon, "error_outline", msg);
                    callbackEmit();
                    return;
                }
                self.promoCode = "";
                self.showNotification(icon, "error_outline", msg);
                callbackEmit();
            }, false);
        },
        hasPromoPrice(cart) {
            let products = this.$store.getters.getProducts || [];
            let prd = products.find(it => it.id == cart.product.id);
            if (!prd) return null;
            if (prd.promoPrice > 0 && prd.price !== prd.originalPrice) return this.currency(prd.originalPrice);
            return null;
        },
    },
	async created() {
		try {
            this.loading = true;
            this.inited = false;
            let isInited = this.$store.getters.hasInited;
            let outletCode = this.$route.params.outletCode;
            if (!isInited) {
                if (outletCode) {
                    await this.refreshMainData(true, undefined, outletCode);
                }
                else await this.refreshMainData();
            }
            await this.getCart(isInited);
            window.addEventListener("resize",  () => {
                this.isDesktop = window.innerWidth >= 672;
            });
            setTimeout(() => {
                this.isDesktop = window.innerWidth >= 672;
            }, 100);
		} catch (error) {
            this.loading = false;
            window.addEventListener("resize",  () => {
                this.isDesktop = window.innerWidth >= 672;
            });
            setTimeout(() => {
                this.isDesktop = window.innerWidth >= 672;
            }, 100);
			this.showNotification("alert", "error_outline", error);
		}
    }
};
</script>
<style scoped lang="scss">
    .free-product {
        color: $secondary-color-50;
        font-size: 0.7em;
        padding: 2px 8px;
        border: 1px solid $secondary-color-20;
        border-radius: 5px;
    }
    .back-btn {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        cursor: pointer;
    }
    .cart-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        text-align: left;

        .cart-item {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding-bottom: 32px;

            & + .cart-item {
                padding-top: 16px;
                border-top: 1px solid $secondary-color-10;
            }

            .cart-wrapper {
                width: 100%;
                display: flex;
                gap: 12px;

                .cart-product {
                    background: $secondary-color-10;
                    overflow: hidden;
                    border-radius: 6px;
                    cursor: pointer;
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 100px;
                    max-width: 120px;
                    aspect-ratio: 3/4;

                    &.no-image {
                        height: auto;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: $primary-color-10 !important;

                        &::before {
                            content: "";
                            background-image: url("@/assets/images/rox-logo-new.png");
                            background-position: center;
                            background-repeat: no-repeat;
                            width: 40px;
                            height: 40px;
                            opacity: 0.4;
                            background-size: contain;
                            color: $secondary-color-50;
                        }
                    }

                    img {
                        max-height: 180px;
                        mix-blend-mode: multiply;
                        &:is(.potrait){
                            height: 100%;
                            width: auto;
                            margin: auto;
                            object-fit: contain;
                        }
                        &:not(.potrait){
                            width: 100%;
                            height: auto;
                            object-fit: contain;
                            margin: auto;
                        }
                    }
                }

                .cart-info {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    flex: 3;

                    .cart-category {
                        color: $primary-color-50;
                    }
                    .cart-name {
                        font-weight: bold;
                    }
                    .cart-modifiers {
                        width: 100%;
                        color: $info-light;

                        .separator {
                            content: "";
                            width: 5px;
                            height: 5px;
                            background: $info-light;
                            border-radius: 50%;
                            display: inline-block;
                            margin: 0 6px;
                        }
                    }
                }
            }

            .cart-actions {
                display: flex;
                gap: 16px;
                align-items: center;
                justify-content: space-between;

                .cart-buttons {
                    display: flex;
                    gap: 16px;
                    align-items: center;

                    .cart-increment {
                        cursor: pointer;
                        padding: 4px;
                        background: $secondary-color-90;
                        color: $white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 4px;
                    }
                }
            }
        }
    }
    .cart-body {
        flex: 3;
        height: 100%;
        overflow: hidden;
        overflow-y: auto;
        padding: 24px;
    }
    .cart-details {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    .cart-empty {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 24px;

        &::before {
            color: $secondary-color-50;
            content: "remove_shopping_cart";
            font-family: 'Material Icons Outlined';
            font-weight: normal;
            font-style: normal;
            font-size: 48px;
            letter-spacing: normal;
            text-transform: none;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
        }
        &::after {
            content: "empty cart..";
        }
    }
    .sd-footer {
        height: auto !important;
    }
    .cart-footer {
        border-top: 1px solid $secondary-color-20;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 24px;
    }
    .cart-total-wrapper {
        width: 100%;
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: space-between;
        font-family: 'Akzidenz Grotesk Super';

        .total-amount {
            display: flex;
            align-items: center;
            gap: 8px;

            .icon {
                cursor: pointer;
            }
        }
    }
    .checkout-btn {
        width: 100%;
        padding: 16px;
        background: $primary-color-50;
        color: $white;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        font-family: 'Akzidenz Grotesk Super';
        cursor: pointer;
        text-align: center;
    }
    .modal-row {
        width: 100%;
        display: flex;
        justify-content: space-between;
        gap: 12px;
        text-align: left;
        &.bordered {
            border-top: 1px solid $secondary-color-10;
            padding: 16px 0;
        }
        .modal-total-label {
            font-family: 'Akzidenz Grotesk Super';
            color: $secondary-color-90;
            font-weight: bold;
        }
        .modal-subtotal-label {
            color: $secondary-color-60;
            font-weight: bold;
        }

        .modal-disc-label {
            font-weight: bold;
            color: $success-green;
            flex: 3;

            &.nowrap {
                white-space: nowrap;
                flex: unset !important;
            }
        }
        .modal-disc-icon {
            cursor: pointer;
            color: $primary-color-50;
        }
    }
    .modal-header {
        font-family: 'Akzidenz Grotesk Super';
        padding: 24px;
    }
    .promo-info {
        color: $primary-color-50;
    }
    @media (min-width: 672px) {
		.cart-body {
			padding: 16px 7% !important;
            padding-top: 48px;
            display: flex;
            flex-direction: row;
            gap: 36px;
            flex: 1;

            .cart-wrapper {
                width: 100%;
                display: flex;
                gap: 12px;

                .cart-product {
                    width: 100% !important;
                    border-radius: 12px;
                    border: 1px solid $secondary-color-20;
                    overflow: hidden;

                    &.no-image {
                        min-height: 150px !important;
                    }
                }

                .cart-info {
                    position: relative;

                    .cart-actions {
                        margin-top: auto;

                        .cart-acc-price {
                            font-weight: bold;
                        }
                    }
                }
            }

            .cart-item {
                height: fit-content;
                width: auto;

                & + .cart-item {
                    border-top: none !important;
                }
            }
            .cart-items {
                flex: 3;
            }
            .cart-details {
                flex: 2;
                height: fit-content;
                width: auto;
                display: flex;
                flex-direction: column;
            }
		}
        .cart-sum {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 12px;
            border-radius: 12px;
            box-shadow: 0 2px 8px $secondary-color-20;
            -webkit-box-shadow: 0 2px 8px $secondary-color-20;
            margin-bottom: 16px;

            .cart-sum-header {
                padding: 16px;
                font-family: 'Akzidenz Grotesk Super';
                border-bottom: 1px solid $secondary-color-10;
                font-size: 1.3em;
            }
            .cart-sum-body {
                padding: 0 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;

                .cart-sum-item {
                    padding-top: 12px;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    text-align: left;

                    &.bold {
                        font-weight: bold;
                    }

                    & + .cart-sum-item {
                        border-top: 1px solid $secondary-color-10;
                    }
                    .cart-sum-total-label {
                        font-family: 'Akzidenz Grotesk Super';
                        color: $secondary-color-90;
                        font-weight: bold;
                    }
                    .cart-sum-subtotal-label {
                        color: $secondary-color-60;
                        font-weight: bold;
                    }

                    .cart-sum-disc-label {
                        font-weight: bold;
                        color: $success-green;
                        width: 100%;

                        &.nowrap {
                            white-space: nowrap;
                            text-align: right;
                        }
                    }
                    .cart-sum-disc-icon {
                        cursor: pointer;
                        color: $primary-color-50;
                    }
                }
            }

            .cart-sum-footer {
                padding: 16px;
            }
        }
        .cart-footer {
            display: none;
        }
	}
    @media (max-width: 672px) {
        .cart-sum {
            display: none !important;
        }
    }
</style>
