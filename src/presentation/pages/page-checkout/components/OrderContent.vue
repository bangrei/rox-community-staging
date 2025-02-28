<template>
    <div class="payment-body">
        <div class="order-header-con" v-if="!hideHeader">
            <div class="order-congrats">
                <span class="order-congrats-icon material-icons-outlined">check_circle</span>
                <div class="order-congrats-text">Thank you for your purchase!</div>
            </div>
            <span>Your purchase will be confirmed shortly!</span>
        </div>
        <div class="order-info">
            <div class="order-header">Order Number:</div>
            <div class="order-number">
                <div class="copy-ticket">
                    <input
                        ref="copyNumber" 
                        type="text" 
                        :value="orderNumber"/>
                    <span>{{ orderNumber }}</span>
                </div>
                <span class="copy-icon material-icons" @click="copy()">copy_all</span>
            </div>
            <div class="order-date" v-if="orderDate">{{ orderDate }}</div>
        </div>
        
        <div class="row__with-icon">
            <span class="row-icon material-icons-outlined">{{ isOmisell ? 'local_shipping' : 'hail'}}</span>
            <div class="row-content">
                <div class="row-label blue">{{ isOmisell ? 'Deliver to' : orderTypeDisplay }}</div>
                <div class="row-delivery-address" v-if="isOmisell">
                    <div class="row-label title" v-if="deliveryAddressTitle">{{ deliveryAddressTitle }}</div>
                    <div class="row-label subtitle">{{ deliveryAddressString }}</div>
                </div>
                <div class="row-label">{{ outletEtaDate }}</div>
                <div class="row-text">{{ isOmisell ? 'Delivery' : outletName }}</div>
            </div>
        </div>
        
        <div class="row__with-logo" v-if="!isEmpty(order.payments)">
            <div class="row-content">
                <div class="row-label">Paid With</div>
                <div class="row-text" v-for="(pm,i) in order.payments" :key="i">
                    <div class="row-logo">
                        <img :src="pm.logo" v-if="pm.logo"/>
                    </div>
                    <span>{{ pm.type }}</span>
                    <span class="refunded" v-if="pm.refunded">REFUNDED</span>
                </div>
            </div>
        </div>
        <div class="cart-container" 
            v-for="(ord, o) in validOrder(order)"
            :class="{'last-one': o === validOrder(order).length - 1}"
            :key="o">
            <!--
            <div class="row__with-icon">
                <span class="row-icon material-icons-outlined">hail</span>
                <div class="row-content">
                    <div class="row-label blue">{{ orderTypeDisplay }}</div>
                    <div class="row-label">{{ etaDate(ord) }}</div>
                    <div class="row-text">{{ ord.storeName }}</div>
                </div>
            </div>
            -->
            <div class="cart-item" v-for="(cart, i) in ord.items" :key="i">
                <div class="cart-wrapper">
                    <div class="cart-product" :class="{'no-image': !cart.imageId}">
                        <img v-if="cart.imageId" :src="getProductImage(cart.imageId)"/>
                    </div>
                    <div class="cart-info">
                        <div class="cart-category">{{ cart.quantity }} pcs</div>
                        <div class="cart-name">{{ cart.productName }}</div>
                        <div class="cart-modifiers" v-if="hasVariant(cart) || hasModifiers(cart)">
                            <span v-if="hasVariant(cart)">{{ getVariant(cart) }}</span>
                            <span :class="{'separator': hasVariant(cart) && hasModifiers(cart)}"></span>
                            <span>{{ getModifiers(cart) }}</span>
                        </div>
                        <div class="product-price-wrapper">
                            <div class="original-price" v-if="hasPromoPrice(cart)">{{ hasPromoPrice(cart) }}</div>
                            <div class="cart-price">{{ currency(cart.total) }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="inline-row">
                <span class="bold">Subtotal</span>
                <span class="bold">{{ currency(ord.subTotal) }}</span>
            </div>
            <div class="inline-row" v-for="(extra, x) in ord.extraCharges" :key="x">
                <span>{{ extra.name }} {{ extra.percentage ? extra.percentage + '%' : '' }} {{ extra.inclusive ? '(inclusive)' : ''}}</span>
                <span class="amount">{{ currency(extra.amount) }}</span>
            </div>
            <div class="inline-row" v-for="(disc, x) in outletDiscounts" :key="x">
                <span>{{ disc && !disc.promotion && !disc.voucher ? 'Points' : disc.reason }}</span>
                <span class="amount">-{{ currency(disc.amount) }}</span>
            </div>
            <div class="inline-row" v-for="(disc, x) in ord.discounts" :key="x">
                <span>{{ disc && !disc.promotion && !disc.voucher ? 'Points' : disc.reason }}</span>
                <span class="amount">-{{ currency(disc.amount) }}</span>
            </div>
        </div>
        <div class="inline-row border-top">
            <span class="bolder font-size-lg">Total</span>
            <span class="bolder font-size-lg">{{ currency(order.total) }}</span>
        </div>
    </div>
</template>

<script>
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';

export default {
	name: "OrderContent",
	mixins: [utility],
    props: {
		order: {
			type: Object,
			default: () => {},
		},
        orderNumber: {
			type: String,
			default: "",
		},
        hideHeader: {
            type: Boolean,
            default: false,
        }
	},
	data() {
		return {}
	},
	watch: {},
	computed: {
        orderTypeDisplay(){
            if(isEmpty(this.order)) return "";
            let type = this.order.orders[0].type;
            if(type == "DELIVERY") return "Delivery";
            return "Pick up at store";
        },
        deliveryAddress() {
            if (!this.isOmisell) return null;
            let order = this.order.orders.find((o) => !isEmpty(o.address));
            if (!order) return null;
            return {
                title: order.address.title,
                string: order.address.string
            }
        },
        deliveryAddressTitle() {
            let addr = this.deliveryAddress;
            if (isEmpty(addr)) return "";
            return addr.title;
            
        },
        deliveryAddressString() {
            if (!this.isOmisell) return "";
            let addr = this.deliveryAddress;
            if (isEmpty(addr)) return "Address: -";
            return addr.string;
        },
        isOmisell() {
            if (!this.outletOrder) return false;
            return this.outletOrder.apiCode.toLowerCase() == "omisell" && this.outletOrder.stores.filter((s) => { return s.delivery }).length > 0;
        },
        outletOrder() {
            if(isEmpty(this.order)) return null;
            let outletId = this.order.outlet.id;
            return this.$store.getters.getOutlets.find((it) => {
                return it.id == outletId
            });
        },
        outletName(){
            if(isEmpty(this.outletOrder)) return "";
            return this.outletOrder.name;
        },
        storeName(){
            if(isEmpty(this.order)) return "";
            return this.order.orders[0].storeName;
        },
        outletEtaDate(){
            if(isEmpty(this.order)) return "";
            let orders = this.order.orders;
            orders = orders.map((it) => {
                it.etaDisplay = this.etaDate(it);
                return it;
            }).filter((it) => {
                return it.etaDisplay != "";
            }).sort((a,b) => {
                return a.etaDisplay.localeCompare(b.etaDisplay);
            });
            if(isEmpty(orders)) return "";
            return orders[0].etaDisplay;
        },
        orderDate(){
            if(isEmpty(this.order)) return "";
            return moment.tz(this.order.placeTime, 'Asia/Singapore').format('DD MMM YYYY HH:mm A');
        },
        customerName(){
            if(isEmpty(this.order)) return "";
            let names = [];
            if(this.order.customer.firstName) names.push(this.order.customer.firstName);
            if(this.order.customer.lastName) names.push(this.order.customer.lastName);
            return names.join(' ');
        },
        customerEmail(){
            if(isEmpty(this.order)) return "";
            return this.order.customer.email;
        },
        outletDiscounts() {
            return this.order.discounts || []
        }
    },
	methods: {
        etaDate(order){
            if(isEmpty(order)) return "";
            let eta = order.etaTime;
            let placeTime = this.order.placeTime;
            if(!eta){
                let store = this.$store.getters.getStoreList.find((s) => { return s.id == order.store });
                if (store) eta = placeTime + ((store.transitTime + store.kitchenPrepTime + store.bufferTime) * 360);
            }
            if(!eta) return "";
            return moment.tz(eta, 'Asia/Singapore').format('DD MMM YYYY HH:mm A');
        },
        validOrder(order){
            if(order.orders) return order.orders;
            return [order];
        },
        getProductImage(img){
            return this.$store.getters.cloudinaryURL + img;
        },
        hasVariant(cart){
            return cart.variant != null;
        },
        getVariant(cart){
            return cart.variantName;
        },
        hasModifiers(cart){
            return !isEmpty(cart.modifiers);
        },
        getModifiers(cart){
            let modifiers = [];
            if(!isEmpty(cart.modifiers)){
                cart.modifiers.forEach((mod) => {
                    modifiers.push(`${mod.quantity}x ${mod.modifierName}`);
                });
            }
            return modifiers.join(', ');
        },
        formatDate(date){
            return moment.tz(date,'Asia/Singapore').format("ddd, DD MMMM YYYY");
        },
        formatTimes(d){
            return moment.tz(d.startDate,'Asia/Singapore').format("HH:mm") + " - " + moment.tz(d.endDate,'Asia/Singapore').format("HH:mm");
        },
        copy(){
            try {
                this.$refs.copyNumber.focus();
                this.$refs.copyNumber.select();
                document.execCommand('copy');
                this.$refs.copyNumber.blur();
                this.showNotification("success", "done", "Copied");
            } catch(error) {
                this.showNotification("alert", "error_outline", error);
            }
        },
        hasPromoPrice(cart) {
            let products = this.$store.getters.getProducts || [];
            let prd = products.find(it => it.id == cart.product);
            if (!prd) return null;
            let price = cart.total / cart.quantity;
            if (prd.promoPrice > 0 && price !== prd.originalPrice) return this.currency(prd.originalPrice * cart.quantity);
            return null;
        }
    }
};
</script>
<style scoped lang="scss">
    .order-header-con {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 24px;
        color: $secondary-color-60;
        font-size: 1.2em;

        .order-congrats {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 24px;
            font-family: 'Akzidenz Grotesk Super';

            .order-congrats-icon {
                font-size: 2.5em;
                color: $success-green;
            }
            .order-congrats-text {
                font-size: 1.5em;
                line-height: 1.2em;
                color: $secondary-color-80;
            }
        }
    }
    .payment-body {
        width: 100%;
        height: 100%;
        overflow: hidden;
        overflow-y: auto;
        
        .cart-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            text-align: left;
            padding: 0 24px;

            & + .cart-container {
                padding-top: 24px !important;
                border-top: 1px solid $secondary-color-10;
            }

            &.last-one {
                padding-bottom: 32px;
            }

            .cart-item {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 16px;

                & + .cart-item {
                    padding-top: 16px;
                    border-top: 1px solid $secondary-color-10;
                }

                .cart-wrapper {
                    width: 100%;
                    display: flex;
                    gap: 12px;
                    cursor: pointer;

                    .cart-product {
                        width: 150px;
                        height: fit-content;
                        background: $secondary-color-10;
                        overflow: hidden;
                        border-radius: 6px;

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
                            width: 100%;
                            height: auto;
                            object-fit: contain;
                        }
                    }

                    .cart-info {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        gap: 8px;

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
            .row {
                width: 100%;
                padding: 0 !important;

                &__with-icon {
                    padding: 24px 0px;
                    padding-top: 0;
                }

                &__with-logo {
                    padding: 24px 0px;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
            }
            .inline-row {
                padding: 24px 0px;
            }
        }

        .row {
            width: 100%;
            padding: 0 16px;
            display: grid;
            grid-template-columns: 1fr;
            grid-row-gap: 6px;

            & + * {
                margin-top: 24px;
            }

            &__with-icon {
                padding: 24px 16px;
                width: 100%;
                display: flex;
                align-items: center;
                gap: 12px;

                & + * {
                    padding-top: 0px !important;
                    margin-top: 0px !important;
                }

                .row-icon {
                    width: 30px;
                }

                .row-content {
                    display: grid;
                    grid-template-columns: 1fr;
                    grid-row-gap: 6px;
                }
            }

            &__with-logo {
                padding: 24px 16px;
                width: 100%;
                display: flex;
                align-items: center;
                gap: 8px;

                & + * {
                    margin-top: 0px;
                }

                .row-label {
                    margin-left: 42px;
                }
                .row-text {
                    display: flex;
                    align-items: center;
                    gap: 12px;

                    .row-logo {
                        width: 30px;
                    }
                }
            }
        }
        .row-label {
            font-family: 'Akzidenz Grotesk Regular';
            color: $secondary-color-90;
            &.blue-light {
                color: $info-light;
            }

            &.blue {
                color: $info-light;
                font-weight: bold;
            }
        }
        .row-text {
            font-family: 'Akzidenz Grotesk Super';
            color: $secondary-color-90;
        }
        .row-delivery-address {
            display: flex;
            flex-direction: column;
            gap: 4px;
            font-family: 'Akzidenz Grotesk Regular';
            color: $secondary-color-90;
            & .row-label:is(.title) {
                font-weight: bold;
                font-size: 1em;width: fit-content;
                padding-inline: 8px;
                color: $white;
                background: $info-light;
                padding-block: 2px;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                display: flex;
            }
            & .row-label:is(.subtitle) {
                font-weight: normal;
                line-height: 1.2;
            }
        }

        .refunded {
            font-size: 0.8em;
            font-weight: bold;
            font-family: 'Akzidenz Grotesk Regular';
            color: $secondary-color-50;
        }

        .inline-row {
            padding: 24px 16px;
            width: 100%;
            display: flex;
            gap: 8px;
            justify-content: space-between;

            & + .inline-row {
                padding-top: 0;
            }

            &.border-top {
                padding-top: 16px !important;
                border-top: 1px solid $secondary-color-20;
            }
        }

        .font-size-lg {
            font-size: 1.5em;
        }

        .bold {
            font-weight: 900;
        }
        .bolder {
            font-family: 'Akzidenz Grotesk Super';
        }

        .amount {
            white-space: nowrap;
        }

        .grey {
            color: $secondary-color-50;
        }
    }
    .order-info {
        width: 100%;
        padding: 16px;
        background: $primary-color-10;

        & + * {
            padding-top: 24px;
        }

        .order-header {
            font-family: 'Akzidenz Grotesk Regular';
            width: fit-content;
            margin: 0 auto;
            display: block;
            font-size: 0.9em;
        }
        .order-number {
            font-family: 'Akzidenz Grotesk Super';
            width: fit-content;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: row;
            font-size: 2em;
            color: $primary-color-60;
            padding: 16px;
            gap: 35px;
            position: relative;

            .copy-ticket {
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                width: 100%;
                position: relative;

                input {
                    border: none;
                    margin: 0 auto;
                    text-align: right;
                    background: transparent;
                    color: $primary-color-60;
                    outline: none;
                    width: 100%;
                    opacity: 0;
                    position: absolute;
                }
            }
            .copy-icon {
                cursor: pointer;
                position: absolute;
                right: -24px;
                top: 0;
            }
        }
        .order-date {
            font-family: 'Akzidenz Grotesk Regular';
            width: fit-content;
            margin: 0 auto;
            display: block;
            font-size: 0.8em;
            color: $secondary-color-60;
        }
    }
</style>