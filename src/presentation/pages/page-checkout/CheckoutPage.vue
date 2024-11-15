<template>
	<layout-variant-two :show-loading-screen="loading">
        <template v-slot:header>
			<div class="slide-down">
				<div class="header-con">
					<div class="back-btn" @click="stepBack">
                        <span class="material-icons">arrow_back</span>
                    </div>
					<h1 class="heading-5 center">Checkout</h1>
					<div class="more right"></div>
				</div>
			</div>
		</template>
		<template v-slot:body>
            <div class="main-body">
                <div class="cart-items">
                    <div class="cart-item" v-if="!isEmpty(booking)">
                        <div class="cart-wrapper">
                            <div class="cart-product"
                                :class="{'no-image': !getBookingImage()}">
                                <img v-lazyload v-if="getBookingImage()" :alt="booking.details.name" :data-url="getBookingImage()"/>
                            </div>
                            <div class="cart-info">
                                <div class="cart-category">{{ booking.details.name }}</div>
                                <div class="cart-name">{{ booking.selectedSession.name }}</div>
                                <div class="cart-modifiers">
                                    <span>{{ booking.selectedSession.location.string }}</span>
                                    <span class="separator"></span>
                                    <span>{{ booking.quantity }} pax</span>
                                </div>
                                <span class="cart-price">{{ currency(booking.total) }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="cart-item" v-for="(cart, i) in carts" :key="i">
                        <div class="cart-wrapper">
                            <div class="cart-product"
                                :class="{'no-image': !getProductImage(cart.product)}">
                                <img v-lazyload v-if="getProductImage(cart.product)" :alt="cart.product.name" :data-url="getProductImage(cart.product)"/>
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
                                <span class="cart-acc-price">{{ currency(cart.accPrice) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="payment-container">
                    <div class="widgets">
                        <widget-promo-code @emit-promocode="emitPromoCode" />
                        <widget-voucher 
                            :is-event="!isEmpty(booking)"
                            @select-voucher="showVouchers"
                            @on-apply-voucher="onApplyVoucher"
                        />
                        <widget-fulfillment-display v-if="isEmpty(booking)" @change-address="changeAddress"/>
                    </div>
                    <div class="payment-header" v-if="totalAmount > 0">Pay With</div>
                    <div class="payment-body">
                        <div class="radio-list" v-if="totalAmount > 0">
                            <div class="radio has-logo" v-for="pm in paymentAccounts" :key="pm.key">
                                <input name="paymentAccount" type="radio" 
                                    :checked="pm.clicked == true" 
                                    :data-key="pm.key"
                                >
                                <span class="radio-logo" v-if="pm.logo">
                                    <img alt="paymaya" :src="pm.logo"/>
                                </span>
                                <div class="radio-label">
                                    <span class="title">{{ pm.displayName }}</span>
                                    <span class="sub-title">{{ pm.displayTitle }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="radio-list" v-else>
                            <div class="radio has-icon">
                                <input name="paymentAccount" type="radio" 
                                    checked="true" 
                                    data-key="zero"
                                >
                                <span class="radio-icon material-icons-outlined">account_balance_wallet</span>
                                <div class="radio-label">
                                    <span class="title">Zero Payment</span>
                                    <span class="sub-title">No payment needed</span>
                                </div>
                            </div>
                        </div>
                        <div class="customer-details" v-if="isGuestCustomer()">
                            <div class="customer-item">
                                <div class="customer-item-label">First Name</div>
                                <div class="customer-item-input">
                                    <input type="text" v-model="firstName"/>
                                </div>
                            </div>
                            <div class="customer-item">
                                <div class="customer-item-label">Last Name</div>
                                <div class="customer-item-input">
                                    <input type="text" v-model="lastName"/>
                                </div>
                            </div>
                            <div class="customer-item">
                                <div class="customer-item-label">Email Address</div>
                                <div class="customer-item-input">
                                    <input type="email" v-model="email"/>
                                </div>
                            </div>
                            <div class="customer-item">
                                <div class="customer-item-label">Phone</div>
                                <div class="customer-item-input">
                                    <input type="text" v-model="phone"/>
                                </div>
                            </div>
                        </div>
                        <div class="checkbox-custom" @click="toggleAgree()">
                            <span class="checkbox-icon material-icons-outlined" :class="{'checked': agreement}">
                                {{ agreement ? 'check_box' : 'check_box_outline_blank' }}
                            </span>
                            <span class="checkbox-label" style="white-space:nowrap;">
                                I accept the <a :href="tncLink" target="_blank" class="link no-underlined">R.O.X Community Terms of Service</a>
                            </span>
                        </div>
                        <div class="cart-sum">
                            <div class="cart-sum-header">Summary</div>
                            <div class="cart-sum-body">
                                <div class="cart-sum-item">
                                    <div class="cart-sum-item-label">Subtotal</div>
                                    <div class="cart-sum-item-label">{{ subTotalDisplay }}</div>
                                </div>
                                <div class="booking-extracharge-item" v-for="(extra, n) in groupedBookingExtracharges" :key="n">
                                    <div class="extracharge-head">{{ extra.parentName }}</div>
                                    <div class="extracharge-body">
                                        <div class="extracharge-title">{{ extra.qty }}x {{ extra.value }}</div>
                                        <div class="extracharge-amount">{{ currency(extra.cost) }}</div>
                                    </div>
                                </div>
                                <div class="cart-sum-item" v-for="(disc, x) in (!isEmpty(booking) ? booking.discounts : [])" :key="x">
                                    <div class="cart-sum-disc-label">{{ disc && !disc.promotion && !disc.voucher ? 'Points' : disc.reason }}</div>
                                    <div class="cart-sum-disc-label nowrap">
                                        <span>-{{ currency(disc.amount) }}</span>
                                        <span class="cart-sum-disc-action" @click="removeDiscount(disc)">Remove</span>
                                    </div>
                                </div>
                                <div class="cart-sum-item" v-for="(extra, x) in extraCharges" :key="x">
                                    <div class="cart-sum-item-label">{{ extra.name }} {{ extra.percentage ? '(' + extra.percentage + '%)' : '' }}</div>
                                    <div class="cart-sum-item-label">{{ currency(extra.amount) }}</div>
                                </div>
                                <div class="cart-sum-item" v-for="(extra, x) in outletExtraCharges" :key="x">
                                    <div class="cart-sum-item-label">{{ extra.extraCharges.name }} {{ extra.extraCharges.percentage ? '(' + extra.extraCharges.percentage + '%)' : '' }}</div>
                                    <div class="cart-sum-item-label">{{ currency(extra.extraCharges.amount) }}</div>
                                </div>
                                <div class="cart-sum-item" v-for="(disc, x) in discounts" :key="x">
                                    <div class="cart-sum-disc-label">{{ disc && !disc.promotion && !disc.voucher ? 'Points' : disc.reason }}</div>
                                    <div class="cart-sum-disc-label nowrap">
                                        <span>-{{ currency(disc.amount) }}</span>
                                        <span class="cart-sum-disc-action" @click="removeDiscount(disc)">Remove</span>
                                    </div>
                                </div>
                                <div class="cart-sum-item" v-for="(disc, x) in discountPerBrand" :key="x">
                                    <div class="cart-sum-disc-label">{{ disc && !disc.discount && !disc.discount.promotion && !disc.discount.voucher ? 'Points' : disc.discount.reason }}</div>
                                    <div class="cart-sum-disc-label nowrap">
                                        <span>-{{ currency(disc.discount.amount) }}</span>
                                        <span class="cart-sum-disc-action" @click="removeDiscount(disc.discount)">Remove</span>
                                    </div>
                                </div>
                                <div class="cart-sum-item bold">
                                    <div class="cart-sum-item-label">Total</div>
                                    <div class="cart-sum-item-label">{{ totalDisplay }}</div>
                                </div>
                            </div>
                            <div class="cart-sum-footer">
                                <div class="checkout-btn" @click="placeOrder()">Place Order</div>
                            </div>
                        </div>
                    </div>
                    <div class="payment-footer" v-if="!isEmpty(booking) || !isEmpty(order)">
                        <!-- <div class="summary-wrapper">
                            <div class="summary-title">Total</div>
                            <div class="summary-con">
                                <span class="material-icons">expand_more</span>
                                <span>{{ totalDisplay }}</span>
                            </div>
                        </div> -->
                        <div class="actions">
                            <div class="action-button" :class="{'purchase-now': !isEmpty(order)}" @click="placeOrder()">Place Order</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <base-modal :show="tryAgain">
                <template v-slot:header>
                    <div class="modal-header header-flex">
                        <span class="material-icons-outlined" @click="toggleTryAgain()">close</span>
                        <h3>Information</h3>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body">
                        <p>An error has occured while submitting your order.</p>
                        <p>Would you like to try again?</p>
                    </div>
                    <div class="modal-footer">
                        <div class="actions">
                            <div class="action-button light" @click="toggleTryAgain()">No</div>
                            <div class="action-button" @click="checkBookingStatus()">Yes</div>
                        </div>
                    </div>
                </template>
            </base-modal>

            <base-modal :show="showZeroPayment">
                <template v-slot:body>
                    <div class="modal-body">
                        <p>Please confirm if you wish to place this order.</p>
                    </div>
                    <div class="modal-footer">
                        <div class="actions">
                            <div class="action-button light" @click="showZeroPayment = false">No</div>
                            <div class="action-button" @click="checkBookingStatus()">Yes</div>
                        </div>
                    </div>
                </template>
            </base-modal>
		</template>
	</layout-variant-two>
</template>

<script>
import { eventService, productService } from "@/bloc/services";
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import WidgetFulfillmentDisplay from "@/components/widgets/WidgetFulfillmentDisplay.vue";
import WidgetPromoCode from "@/components/widgets/WidgetPromoCode.vue";
import WidgetVoucher from "@/components/widgets/WidgetVoucher.vue";
import { EUNOIA_CONFIG } from "@/connector/apiConfig";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';

export default {
	name: "CheckoutPage",
	mixins: [utility],
	components: {
        LayoutVariantTwo,
        WidgetVoucher,
        WidgetPromoCode,
        WidgetFulfillmentDisplay,
	},
	data() {
		return {
			loading: false,
            booking: null,
            order: null,
            paymentAccounts: [],
            cartId: "",
            payment: null,
            tryAgain: false,
            agreement: false,
            paymayaRedirectParams: null,
            customerDetails: {},
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            isPlaceOrder: false,
            showZeroPayment: false,
            carts: [],
            promoCode: "",
            processing: false,
		};
	},
	watch: {},
	computed: {
        tncLink(){
            let url = window.location.origin;
            return `${url}/faq`;
        },
        totalAmount(){
            let amount = 0;
            if(!isEmpty(this.booking)) {
                amount = this.booking.total;
            }
            if(!isEmpty(this.order)) {
                amount = this.order.total;
            }
            return amount;
        },
        totalDisplay(){
            return this.currency(this.totalAmount);
        },
        subTotal(){
            if (this.booking) {
                return this.booking.selectedSession.price;
            }
            let orderRequest = this.$store.getters.getOrderRequest;
            if (isEmpty(orderRequest)) return 0;
            return orderRequest.subTotal;
        },
        subTotalDisplay() {
            let amount = this.subTotal;
            if (this.booking) {
                amount = this.booking.selectedSession.price * this.booking.quantity;
            }
            if (amount > 0) return this.currency(amount);
            return 0;
        },
        extraCharges(){
            return this.$store.getters.getExtraCharges || [];
        },
        outletExtraCharges(){
            return this.$store.getters.getOutletExtraCharges || [];
        },
        discounts(){
            return this.$store.getters.getDiscounts || [];
        },
        discountPerBrand(){
            return this.$store.getters.getDiscountPerBrand || [];
        },
        groupedBookingExtracharges() {
            if (isEmpty(this.booking)) return [];
            if (isEmpty(this.booking.extraCharges)) return [];
            let extras = [];
            this.booking.extraCharges.forEach((it) => {
                let item = {
                    parentName: it.parent.name,
                    value: it.value,
                    qty: 1,
                    cost: it.cost,
                }
                let idx = extras.findIndex((x) => {
                    return x.parentName == item.parentName && x.value == item.value;
                });
                if (idx > -1) {
                    extras[idx].qty++;
                    extras[idx].cost += item.cost;
                } else {
                    extras.push(item);
                }
            });
            return extras;
        }
    },
    methods: {
        async changeAddress() {
            let self = this;
            let callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : () => { };
            let address = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : () => null;
            this.$store.dispatch("setDeliveryAddress", address);
            self.processing = true;
            this.testOrder(false, function (json) {
                self.$store.dispatch("setDeliveryAddress", null);
                self.processing = false;
                let carts = self.$store.getters.getCarts;
                self.carts = carts;
                self.$store.dispatch("setCarts", self.carts);
                callback(json);
            }, function (error) {
                self.processing = false;
                let carts = self.$store.getters.getCarts;
                self.carts = carts;
                self.$store.dispatch("setCarts", self.carts);
                if (error.message) self.showNotification("alert", "error_outline", `Something went wrong! ${error.message}`);
                callback(error);
            }, true, true);
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
        getProductImage(product){
            let img = product.imageId;
            if(!img) img = product.image2Id;
            if(!img) img = product.image3Id;
            if(!img) return null;
            return this.$store.getters.cloudinaryURL + img;
        },
        toggleAgree(){
            this.agreement = !this.agreement;
        },
        toggleTryAgain(){
            this.tryAgain = !this.tryAgain;
        },
		randomString: function(max) {
			const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			const charsLength = chars.length;

			let result = "";

			for(let i = 0; i < (max || 32); ++i) {
				result += chars.charAt(Math.floor(Math.random() * charsLength));
			}

			return result;
		},
        randomNumber: function(max) {
			const chars = "0123456789";
			const charsLength = chars.length;

			let result = "";

			for(let i = 0; i < (max || 32); ++i) {
				result += chars.charAt(Math.floor(Math.random() * charsLength));
			}

			return result;
		},
        async checkout(){
            let test = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
			let callbackSuccess = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () { };
			let skipToken = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
            
            let customer = this.booking.customer;
            if(this.isGuestCustomer()) {
                skipToken = true;
                customer = {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    email: this.email,
                    phone: this.phone
                }
                this.booking.customer = customer;
                this.$store.dispatch("clearBooking");
                this.$store.dispatch("addToBooking", this.booking);
            }
            let promoCodes = this.$store.getters.getPromoCodes;
            let cashVouchers = [];
            let vouchers = [];
            if (this.$store.getters.getAppliedCashVouchers) {
                cashVouchers = this.$store.getters.getAppliedCashVouchers.map((it) => {
                    return {
                        number: it.promotion.number,
                        pin: it.promotion.pin,
                    };
                });
            }
            if (this.$store.getters.getAppliedVouchers) {
                vouchers = this.$store.getters.getAppliedVouchers.map((it) => {
                    return it.id;
                });
            }
            let params = {
                type: this.booking.type,
                name: this.booking.name,
                payments: [],
                items: [],
				total: this.booking.total,
                promoCodes: promoCodes || [],
                vouchers: vouchers || [],
                cashVouchers: cashVouchers || []
            };

			if(skipToken || !customer.eunoiaAuthToken) {
				params.customer = {
					firstName: customer.firstName,
					lastName: customer.lastName,
					email: customer.email,
					phone: customer.phone
				}
			}
            if(this.payment) params.payments.push(this.payment);
            let item = {
                sessionTimeId: this.booking.sessionTimeId,
                quantity: this.booking.quantity,
				participants: this.booking.participants
            };

            let cartId = this.$store.getters.getCartId;

            params.test = test == true;
            params.draft = test == true;
            params.cartId = cartId;
            if (params.total <= 0) {
                params.draft = false;
                params.cartId = null;
            }
            params.items.push(item);

            if(this.totalAmount <= 0 && !test) {
                params.test = false;
                params.draft = false;
            }
            
            let res = await eventService.bookEvent(params);
            if (res.cartId) {
                this.cartId = res.cartId;
                this.$store.dispatch("setCartId", res.cartId);
            }
			if(!res.success && res.code && res.code == "-666"){
				customer.eunoiaAuthToken = "";
				this.$store.dispatch('setCustomer', customer);
				this.$store.dispatch('setEunoiaToken', '');
				return this.checkout(test, callbackSuccess, true);
			}
			callbackSuccess(res);
        },
        async checkoutOrder(){
            let self = this;
            let test = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
            let callbackSuccess = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () { };

            let cartId = self.$store.getters.getCartId;
            let draft = false;
            if(self.isPlaceOrder) draft = true;
            if(this.totalAmount <= 0 && !test) {
                test = false;
                draft = false;
            }
            self.testOrder(false, (res) => {
                self.isPlaceOrder = false;
                if(cartId) self.cartId = cartId;
                callbackSuccess(res);
            }, (error) => {
                self.isPlaceOrder = false;
                callbackSuccess(error);
            }, draft, test);
        },
        async handlePayMayaPayment(pm) {
            try {
                let accountKey = pm.key;
                let hqData = this.$store.getters.getHeadquarter;
                let trackingId = this.randomString(36);
                if(!isEmpty(hqData) && !isEmpty(hqData.app) && !isEmpty(hqData.app.properties) && !isEmpty(hqData.app.properties.customReference)) {
                    trackingId = hqData.app.properties.customReference + "" + this.randomNumber(12);
                }
                let brand = this.$store.getters.getStoreBrand;
				let isHQ = this.$store.getters.isHQ;
				let currency = "";
				let code = "";
                let outletCode = "";
                let currentStore = this.getCurrentStore();
				if(isHQ) {
					let hq = this.$store.getters.getHeadquarter;
					code = hq.apiCode;
					currency = this.$store.getters.getHeadquarter.currency;
                    outletCode = EUNOIA_CONFIG.brandCode + "$" + this.getOutletCode();
				} else {
					code = brand.code;
                    outletCode = code;
					brand.currency;
				}
				if(!currency) currency = "PHP";

                let totalAmt = 0;
                let customer = null;
                let items = [];
                if(!isEmpty(this.booking)) {
                    totalAmt = this.booking.total;
                    customer = this.booking.customer;
                    items = [
                        {
                            name: this.booking.selectedSession.name,
                            quantity: this.booking.quantity,
                            totalAmount: {
                                value: this.booking.total
                            }
                        }
                    ]
                }
                if(!isEmpty(this.order)) {
                    totalAmt = this.order.total;
                    customer = this.order.customer;
                    this.$store.getters.getCarts.forEach((s) => {
                        items.push({
                            name: s.product.name,
                            quantity: s.quantity,
                            totalAmount: {
                                value: s.accPrice
                            }
                        });
                    });

                    this.$store.getters.getOutletExtraCharges.forEach((s) => {
                        items.push({
                            name: s.extraCharges.name,
                            quantity: 1,
                            totalAmount: {
                                value: s.extraCharges.amount
                            }
                        });
                    });

                    this.$store.getters.getExtraCharges.forEach((s) => {
                        items.push({
                            name: s.name,
                            quantity: 1,
                            totalAmount: {
                                value: s.amount
                            }
                        });
                    });
                }

                if(isEmpty(customer)){
                    customer = {
                        firstName: this.firstName,
                        lastName: this.lastName,
                        email: this.email,
                        phone: this.phone
                    }
                }
                let orderRequest = this.$store.getters.getOrderRequest;
                orderRequest.customer = customer;
                this.$store.dispatch("setOrderRequest", orderRequest);

                let payment = {
                    amount: totalAmt,
                    type: "PAYMAYA",
                    status: "DRAFT",
                    accountKey: accountKey,
                    currency: currency,
                    paidTime: moment().format('x'),
                    brand: code,
                    trackingId: trackingId
                }
                
                let baseUrl = EUNOIA_CONFIG.baseUrl.split('/api/');
                let url = baseUrl[0];
                let redirectFE = `${window.location.origin}/redirect/payment`;
                if(!isEmpty(this.booking)) redirectFE = `${redirectFE}/event`;
                else redirectFE = `${redirectFE}/order`;

                let params = {
                    totalAmount: {
                        value: totalAmt,
                        currency: currency
                    },
                    buyer: {
                        firstName: customer.firstName || "Customer",
                        lastName: customer.lastName || "Customer",
                        contact: {
                            phone: customer.phone,
                            email: customer.email
                        }
                    },
                    redirectUrl: {
                        success: url + "/ipg/paymaya/paymentSuccess/" + trackingId,
                        failure: url + "/ipg/paymaya/paymentFail/" + trackingId,
                        cancel: url + "/ipg/paymaya/paymentFail/" + trackingId
                    },
                    requestReferenceNumber: trackingId,
                    items: items
                }

                let payload = {
                    body: JSON.stringify(params),
                    accountKey: payment.accountKey,
                    cartId: this.cartId,
                    trackingId: payment.trackingId,
                    amount: totalAmt,
                    successUrl: `${redirectFE}/${outletCode}/${currentStore.id}/${payment.trackingId}/${payment.accountKey}/${this.cartId}/${totalAmt}`,
                    failUrl: `${redirectFE}/${outletCode}/${currentStore.id}/${payment.trackingId}/${payment.accountKey}/${this.cartId}/0`
                }

                this.loading = true;

                let json = await productService.paymayaCreateCheckout(payload);
                if(!json.redirectUrl || !json.success) {
                    this.loading = false;
                    return this.showNotification("alert", "error_outline", "Something went wrong! " + json.message);
                }
                payment.transactionId = json.checkoutId;
                
                // this.watchPaymaya(json, payment);
                window.location.href = json.redirectUrl;
            } catch(error){
                this.loading = false;
			    this.showNotification("alert", "error_outline", error);
            }
		},
        async placeOrder(){
            let self = this;
            try {
                let items = document.getElementsByName('paymentAccount');
                let key = "";
                for(var i=0; i< items.length;i++){
                    if(items[i].checked) key = items[i].dataset.key;
                }
                let pm = this.paymentAccounts.find((p) => {
                    return p.key == key;
                });
                if (isEmpty(pm) && this.totalAmount > 0) return this.showNotification("alert", "error_outline", "Please select payment method!");
                if (!isEmpty(this.order) && this.isOrderOmisell()) {
                    let address = this.$store.getters.getDeliveryAddress;
                    if(isEmpty(address)) return this.showNotification("alert", "error_outline", "Delivery address is required!");
                }

                if(this.isGuestCustomer()){
                    let firstName = this.firstName;
                    let lastName = this.lastName;
                    let email = this.email;
                    let phone = this.phone;
                    if(isEmpty(firstName)) return this.showNotification("alert", "error_outline", "First name is required!");
                    if(isEmpty(lastName)) return this.showNotification("alert", "error_outline", "Last name is required!");
                    if(!this.isValidEmail(email)) return this.showNotification("alert", "error_outline", "Please input a valid email address!");
                    if(!this.isValidPhone(phone)) return this.showNotification("alert", "error_outline", "Please input a valid phone number!");
                    let orderRequest = this.$store.getters.getOrderRequest;
                    orderRequest.customer = {
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        phone: phone
                    };
                    this.$store.dispatch("setOrderRequest", orderRequest);
                }
                if(!this.agreement) return this.showNotification("alert", "error_outline", "Please accept R.O.X Community Terms of Service");

                window.dataLayer.push({
                    event: "begin_checkout",
                    page_location: window.location.href
                });

                if(this.totalAmount <= 0) {
                    this.showZeroPayment = true;
                    return;
                }

                let callback = (res) => {
                    this.showZeroPayment = false;
                    if (!res.success) {
                        if (res.promoCodes) {
                            res.message = res.promoCodes.map((prm) => {
                                return `${prm.message} : ${prm.code}`;
                            }).join('. ');
                        }
                        return this.showNotification("alert", "error_outline", "Something went wrong! " + res.message);
                    }
                    this.handlePayMayaPayment(pm);
                }
                if(!isEmpty(this.booking)){
                    this.checkout(true, (res) => {
                        callback(res);
                    });
                }
                if(!isEmpty(this.order)){
                    this.isPlaceOrder = true;
                    this.checkoutOrder(true, (res) => {
                        if(res.cartId) self.cartId = res.cartId;
                        callback(res);
                    });
                }
            } catch(error){
                this.loading = false;
			    this.showNotification("alert", "error_outline", error);
            }
        },
        async checkBookingStatus(){
            let tries = 10;
            let timeOut = 4000;
            let callback = (res) => {
                if(res.success) {
                    this.loading = false;
                    window.dataLayer.push(this.generateGA(res));
                    let page = 'TicketPage';
                    if(!isEmpty(this.order)){
                        page = 'OrderSummary';
                    }
                    return this.goToWithParams(page, {
                        number: res.order.number
                    });
                }
                tries--;
                if(tries == 0){
                    this.showZeroPayment = false;
                    this.loading = false;
                    return this.toggleTryAgain();
                }
                setTimeout(() => {
                    if(!isEmpty(this.booking)){
                        this.checkout(false, (response) => {
                            callback(response);
                        });
                    }
                    if(!isEmpty(this.order)){
                        this.checkoutOrder(false, (res) => {
                            callback(res);
                        });
                    }
                }, timeOut);
            }
            this.loading = true;
            this.tryAgain = false;
            if(!isEmpty(this.booking)){
                this.checkout(false, (response) => {
                    callback(response);
                });
            }
            if(!isEmpty(this.order)){
                this.checkoutOrder(false, (res) => {
                    callback(res);
                });
            }
        },
        watchPaymaya(json, payment){
            let paymentWindow = window.open();
            if(!paymentWindow) {
                this.loading = false;
                return this.showNotification("alert", "error_outline", ` Please check your browser settings. You might need to disable Popup-Blocker!`);
            }
            paymentWindow.location.href = json.redirectUrl;
            let onPayment = false;

            let callbackSuccess = (res) => {
                this.loading = false;
                if(!res) return this.showNotification("alert", "error_outline", "Payment failed/canceled!");
                onPayment = true;
                payment.status = "PAID";
                this.payment = payment;
                this.checkBookingStatus();
            }

            const messageListener = function (event) {
                const success = paymentWindow.closed === false && event.source.window === paymentWindow && event.target.window === window && event.data === "SUCCESS";
                callbackSuccess(success);
                paymentWindow.close();
                this.loading = false;
                window.removeEventListener("message", messageListener);
            };

            let timer = setInterval(() => {
                if (paymentWindow.closed) {
                    if(!onPayment) callbackSuccess(false);
                    window.removeEventListener("message", messageListener);
                    clearInterval(timer);
                }
            }, 500);

            window.addEventListener("message", messageListener);
        },
        getBookingImage(){
            if(isEmpty(this.booking)) return;
            let img = this.booking.selectedSession.image || this.booking.details.banner;
            if(!img) return;
            return this.$store.getters.cloudinaryURL + img;
        },
        async emitPromoCode(currentPromocode, promoCodes, callbackEmit) {
            let self = this;
            self.processing = true;
            self.promoCode = currentPromocode;
            let autoPromos = self.$store.getters.getAutoPromoCodes;
            if (!isEmpty(autoPromos)) {
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
        stepBack() {
            let name = "CartPage";
            let params = {
                cartId: this.$store.getters.getCartId,
                outletCode: this.$store.getters.getCurrentOutlet.apiCode
            }
            if (!isEmpty(this.booking)) {
                name = "EventBooking";
                params = {
                    eventId: this.booking.eventId
                };
            }
            this.$router.replace({
                name: name,
                params: params
            });
        },
        async showVouchers(callback) {
            callback();
        },
        onApplyVoucher(callback) {
            let self = this;
            self.$store.dispatch("clearBooking");
            self.$store.dispatch("addToBooking", self.booking);
            return self.checkoutEvent({
                booking: self.booking
            }, true, (res) => {
                callback(res);
                if (!res.success) {
                    let msg = res.message || "Something went wrong!";
                    return self.showNotification("alert", "error_outline", msg);
                }
                if (!isEmpty(res.order)) {
                    self.booking.discounts = res.order.discounts;
                    self.booking.total = res.order.total;
                }
                self.$store.dispatch("clearBooking");
                self.$store.dispatch("addToBooking", self.booking);
            });
        },
        removeVoucher(disc) {
            if (this.processing) return;
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
            if(!isEmpty(self.booking)) {
                return self.checkoutEvent({
                    booking: self.booking
                }, true, (res) => {
                    self.processing = false;
                    if (!res.success) return self.showNotification("alert", "error_outline", `Something went wrong! ${res.message}`);
                    if (!isEmpty(res.order)) {
                        self.booking.discounts = res.order.discounts;
                        self.booking.total = res.order.total;
                    }
                    self.$store.dispatch("clearBooking");
                    self.$store.dispatch("addToBooking", self.booking);
                });
            }
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
        removeDiscount(disc) {
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
        async executePromo(removeCode, showAlert = true){
            let self = this;
            let callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () { };
            if(!isEmpty(self.booking)) {
                return self.checkoutEvent({
                    booking: self.booking
                }, true, (res) => {
                    self.processing = false;
                    let promoCodes = self.$store.getters.getPromoCodes;
                    promoCodes = promoCodes.filter((it) => { return it != self.promoCode });
                    self.$store.dispatch("setPromoCodes", promoCodes);
                    if (!res.success) {
                        if (res.promoCodes) {
                            res.message = res.promoCodes.map((prm) => {
                                return `${prm.message} : ${prm.code}`;
                            }).join('. ');
                        }
                        if (showAlert) self.showNotification("alert", "error_outline", `Something went wrong! ${res.message}`);
                        callback(res);
                        return;
                    }
                    if (!isEmpty(res.order)) {
                        self.booking.discounts = res.order.discounts;
                        self.booking.total = res.order.total;
                    }
                    self.$store.dispatch("clearBooking");
                    self.$store.dispatch("addToBooking", self.booking);
                    if (removeCode) {
                        if (showAlert) self.showNotification("success", "error_outline", `${removeCode} has been removed`);
                        return;
                    }
                    callback(res);
                });
            }
            await self.testOrder(false, async function (json) {
                self.carts = self.$store.getters.getCarts;
                self.processing = false;
                self.promoCode = "";
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
            let redirectParams = this.$store.getters.getRedirectParams;
            if(!isEmpty(redirectParams)) this.paymayaRedirectParams = redirectParams;
            let booking = this.$store.getters.getBooking;
            let order = this.$store.getters.getOrderRequest;
            if(isEmpty(booking) && isEmpty(order) && isEmpty(redirectParams)) {
                return this.$router.push({name: "HomePage"});
            }
            this.payment = null;
            this.customerDetails = this.$store.getters.getCustomer || {};
            if(!isEmpty(booking)) this.booking = booking[0];
            let paymentAccounts = this.$store.getters.getPaymentAccounts;
            paymentAccounts.map((pm) => {
                pm.clicked = false;
                pm.logo = "";
                switch(pm.type){
                    case "PAYMAYA": 
                        pm.displayName = "Credit Card/Debit Card";
                        pm.displayTitle = "via PayMaya";
                        pm.logo = require('@/assets/images/paymaya-logo.png');
                        break;
                    default:
                        pm.displayName = pm.name;
                        pm.displayTitle = "";
                        break;
                }
                return pm;
            });
            this.paymentAccounts = paymentAccounts.filter((pm) => {
                return pm.type == "PAYMAYA";
            });
            if(this.paymentAccounts.length == 1) {
                this.paymentAccounts.map((pm) => {
                    pm.clicked = true;
                    return pm;
                });
            }
			this.loading = true;
            this.isPlaceOrder = false;
            this.carts = [];
            if(!this.firstName && !this.lastName && !this.email && !this.phone && this.isGuestCustomer()){
                if(!isEmpty(order)){
                    this.booking = null;
                    this.$store.dispatch("clearBooking");
                    this.order = order;
                    this.carts = this.$store.getters.getCarts;
                }
                this.loading = false;
                return;
            }
            
            if(!isEmpty(order)){
                this.booking = null;
                this.$store.dispatch("clearBooking");
                this.order = order;
                this.checkoutOrder(true, (res) => {
                    if(!res.success) this.showNotification("alert", "error_outline", "Something went wrong! " + res.message);
                });
                this.carts = this.$store.getters.getCarts;
            }
            if(!isEmpty(this.booking)){
                this.checkout(true, (res) => {
                    if(!res.success) this.showNotification("alert", "error_outline", "Something went wrong! " + res.message);
                });
            }
			this.loading = false;
		} catch (error) {
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
		}
	},
};
</script>

<style scoped lang="scss">
    .widgets {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
        & + * {
            margin-top: 24px;
        }
    }
    .sd-footer {
        height: auto !important;
    }
    .header-con {
        padding: 16px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-height: 56px;
        border-bottom: 1px solid $secondary-color-20;
        margin-bottom: 24px;
        background: $white;
        color: $primary-color-60;
        gap: 16px;

        .back-btn {
            //color: $white;
            color: $secondary-color-80;
            cursor: pointer;
            font-size: 1.2em;
        }

        .more {
            color: $primary-color-60;
            cursor: pointer;
            font-size: 1.2em;
        }

        h1 {
            flex: 1;
            font-size: 1.2em;
            color: $secondary-color-90;
            text-align: left;
        }
    }
    .main-body {
        width: 100%;
        height: 100%;
        padding: 24px;
        display: flex;
        flex-direction: row;
        gap: 24px;
        
        .cart-items {
            display: flex;
            flex-direction: column;
            gap: 36px;
            flex: 3;

            .cart-item {
                height: fit-content;
                width: auto;

                & + .cart-item {
                    border-top: none !important;
                }

                .cart-wrapper {
                    width: 100%;
                    display: flex;
                    gap: 12px;

                    .cart-product {
                        width: 100%;
                        flex: 1;
                        background: $secondary-color-10;
                        overflow: hidden;
                        border-radius: 12px;
                        border: 1px solid $secondary-color-20;
                        overflow: hidden;
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

                            &::before {
                                content: "no image";
                                color: $secondary-color-50;
                            }
                        }

                        img {
                            height: 100%;
                            width: auto;
                            object-fit: contain;
                            margin: auto;
                            mix-blend-mode: multiply;
                        }
                    }

                    .cart-info {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        text-align: left;
                        position: relative;
                        flex: 3;

                        .cart-acc-price {
                            margin-top: auto;
                            font-weight: bold;
                        }

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
            }
            .cart-details {
                flex: 2;
                height: fit-content;
                width: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
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
                .booking-extracharge-item {
                    display: flex;
                    flex-direction: column;
                    .extracharge-head {
                        font-size: 0.7em;
                        font-weight: bold;
                    }
                    .extracharge-body {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        font-size: 0.8em;
                        padding: 4px 0;
                        .extracharge-title {
                            font-weight: normal;
                        }
                        .extracharge-amount {
                            white-space: nowrap;
                            font-weight: normal;
                        }
                    }
                }
                .cart-sum-item {
                    padding-top: 12px;
                    width: 100%;
                    display: flex;
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

                        &.nowrap {
                            white-space: nowrap;
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
    
    .payment-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        text-align: left;
        flex: 2;

        .payment-header {
            font-size: 1.2em;
            font-family: 'Akzidenz Grotesk Super';
            padding: 16px 0;
        }
        .payment-body {
            width: 100%;
            padding: 0px;

            .cart-sum {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 12px;
                border-radius: 12px;
                margin-bottom: 24px;

                .cart-sum-header {
                    padding: 16px;
                    font-family: 'Akzidenz Grotesk Super';
                    border-bottom: 1px solid $secondary-color-10;
                    font-size: 1.3em;
                }
                .cart-sum-body {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;

                    .cart-sum-item {
                        padding-top: 12px;
                        width: 100%;
                        display: flex;
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
                            display: flex;
                            gap: 8px;

                            &.nowrap {
                                white-space: nowrap;
                            }
                        }
                        .cart-sum-disc-icon {
                            cursor: pointer;
                            color: $primary-color-50;
                        }
                        .cart-sum-disc-action {
                            font-weight: normal;
                            color: $primary-color-60;
                            font-size: 0.8em;
                            cursor: pointer;
                            text-decoration: underline;
                            &:hover{ opacity: 0.7;}
                        }
                    }
                }

                .cart-sum-footer {
                    padding: 16px;

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
                }
            }
            .radio-list {
                padding: 24px 0 !important;
            }
        }

        .payment-footer {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 24px 0;
            background: $white;
            border-top: 1px solid $secondary-color-20;
            margin-top: auto;
        }

        .summary-wrapper {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            font-size: 1.2em;
            font-family: 'Akzidenz Grotesk Super';
        }
        .summary-con {
            cursor: pointer;
            display: flex;
            gap: 8px;
            align-items: center;
        }
    }
    .actions {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 24px;

        .action-button {
            font-family: 'Akzidenz Grotesk Super';
            flex: 1;
            border-radius: 12px;
            background: $primary-color-50;
            border: 1px solid $primary-color-50;
            padding: 16px;
            color: $white;
            font-weight: bold;
            text-align: center;
            cursor: pointer;

            &.light {
                border: 1px solid $primary-color-60;
                background: $white;
                color: $primary-color-60;
            }
        }
    }
    .checkbox-custom {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        cursor: pointer;
        width: 100%;
        margin: 0 auto;
        padding: 32px 0;
        border-top: 1px solid $secondary-color-20;

        .checkbox-icon {
            color: $secondary-color-50;
            line-height: unset;

            &.checked {
                color: $primary-color-60;
            }
        }

        .checkbox-label {
            white-space: normal !important;
        }
    }
    .customer-details {
        padding: 24px;
        display: flex;
        gap: 16px;
        flex-direction: column;

        .customer-item {
            display: flex;
            width: 100%;
            gap: 12px;
            flex-direction: column;

            .customer-item-label {
                font-weight: bold;
            }

            .customer-item-input {
                border: 1px solid $secondary-color-20;
                border-radius: 6px;
                overflow: hidden;

                input {
                    border: none;
                    outline:none;
                    padding: 8px 12px;
                    width: 100%;
                }
            }
        }
    }

    @media (max-width: 672px) {
		.cart-items {
            display: none !important;
        }
        .cart-sum {
            .cart-sum-footer {
                display: none !important;
            }
        }
	}
    @media (min-width: 672px) {
        .header-con {
            padding: 16px 7% !important;
        }
        .main-body {
            padding: 16px 7% !important;
        }
        .payment-header {
            padding: 16px 0 !important;
        }
        .payment-container {
            .payment-footer {
                display: none !important;
            }
        }
	}
</style>