<template>
	<layout-variant-two :show-loading-screen="loading">
        <template v-slot:header>
			<div class="slide-down">
				<div class="header-con">
					<div class="back-btn" @click="goTo('EventsPage')">
                        <span class="material-icons">arrow_back</span>
                    </div>
					<div class="heading" v-if="!isEmpty(booking)">
                        <div class="head-date">{{ orderDate }}</div>
                        <div class="head-info">{{ booking.items.length }} item(s)</div>
                    </div>
                    <div class="heading" v-if="!isEmpty(order)">
                        <div class="head-date">Payment Success</div>
                    </div>
                    <span class="status-cancel" v-if="cancelled">CANCELLED</span>
				</div>
			</div>
		</template>
		<template v-slot:body>
            <receipt-content v-if="orderNumber"
                :order-number="orderNumber"
                @init-receipt="initReceipt"
            ></receipt-content>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import ReceiptContent from "./components/ReceiptContent.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';

export default {
	name: "TicketPage",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
        ReceiptContent
	},
	data() {
		return {
			loading: false,
            orderNumber: null,
            booking: null,
            order: null,
		};
	},
	watch: {},
	computed: {
        orderDate(){
            let data = this.booking || this.order;
            if(isEmpty(data)) return "";
            let date = data.status == "CANCELLED" ? data.cancelTime : data.placeTime;
            return moment.tz(date, 'Asia/Singapore').format('DD MMM YYYY HH:mm A');
        },
        cancelled(){
            let data = this.booking || this.order;
            if(isEmpty(data)) return false;
            return data.status == "CANCELLED";
        }
    },
	methods: {
        initReceipt(res){
            this.loading = false;
            if(!isEmpty(res.booking)) this.booking = res.booking;
            if(!isEmpty(res.order)) this.order = res.order;
            if(!res.success) return this.showNotification("alert", "error_outline", res.message);
        },
    },
	async created() {
		try {
            this.loading = true;
            this.orderNumber = this.$route.params.number;
            this.resetCart();
		} catch (error) {
			this.loading = false;
            this.resetCart();
			this.showNotification("alert", "error_outline", error);
		}
	},
};
</script>

<style scoped lang="scss">
    .header-con {
        padding: 16px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-height: 56px;
        border-bottom: 1px solid $secondary-color-20;
        background: $white;
        color: $primary-color-60;
        gap: 16px;

        .back-btn {
            //color: $white;
            color: $primary-color-60;
            cursor: pointer;
            font-size: 1.2em;
        }

        h1 {
            flex: 1;
            font-size: 1.2em;
            font-family: 'Akzidenz Grotesk Super';
            color: $secondary-color-90;
            text-align: left;
        }

        .heading {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr;
            
            .head-date {
                font-size: 1em;
                color: $secondary-color-90;
            }

            .head-info {
                font-size: 0.8em;
                color: $secondary-color-60;
            }
        }
    }
    .status-cancel {
        background: $primary-color-60;
        color: $white;
        padding: 4px 8px;
        font-size: 0.8em;
    }
    @media (min-width: 672px) {
        .header-con {
            padding: 16px 7% !important;
        }
	}
</style>