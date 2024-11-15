<template>
    <div class="payment-body">
        <div class="ticket-info">
            <div class="ticket-header">Registration Number:</div>
            <div class="ticket-number">
                <div class="copy-ticket">
                    <input
                        ref="copyNumber" 
                        type="text" 
                        :value="orderNumber"/>
                    <span>{{ orderNumber }}</span>
                </div>
                <span class="copy-icon material-icons" @click="copy()">copy_all</span>
            </div>
            <div class="ticket-date" v-if="orderDate">{{ orderDate }}</div>
        </div>
        <div class="sessions">
            <div class="session" 
                v-for="(item, i) in booking.items" 
                :key="i">
                <div class="session-name">{{ item.ticket.event }}</div>
                <div class="session-date">{{ formatDate(item.ticket.startDate) }}</div>
                <div class="session-time">{{ formatTimes(item.ticket) }}</div>
                <div class="session-location">{{ item.ticket.session }}</div>
                <div class="session-price">{{ currency(item.price) }}</div>
                <div class="session-number">Ticket ID: {{ item.ticket.number }}</div>
            </div>
        </div>
        <div class="row">
            <div class="row-label">Primary Contact</div>
            <div class="row-text">{{ customerName }}</div>
        </div>
        <div class="row" 
            v-for="(item, i) in booking.items" 
            :key="i">
            <div class="row-label">Participant {{ i + 1 }}</div>
            <div class="row-text">{{ item.ticket.participantFirstName }} {{ item.ticket.participantLastName }}</div>
        </div>
        <div class="row__with-icon">
            <span class="row-icon material-icons-outlined">info</span>
            <div class="row-content">
                <div class="row-label">Billing Information</div>
                <div class="row-text">{{ customerName }}</div>
                <div class="row-text">{{ customerEmail }}</div>
            </div>
        </div>
        <div class="row__with-logo" v-if="!isEmpty(booking.payments)">
            <div class="row-content">
                <div class="row-label">Paid With</div>
                <div class="row-text" v-for="(pm,i) in booking.payments" :key="i">
                    <div class="row-logo">
                        <img :src="pm.logo" v-if="pm.logo"/>
                    </div>
                    <span>{{ pm.type }}</span>
                    <span class="refunded" v-if="pm.refunded">REFUNDED</span>
                </div>
            </div>
        </div>
        <div class="inline-row">
            <div style="display:flex;align-items:center;gap:12px;">
                <span style="width:30px;">{{ booking.items.length }}x</span>
                <span>Ticket(s)</span>
            </div>
            <span class="bold">{{ currency(bookingAmount) }}</span>
        </div>
        <div class="inline-row" v-for="(addon, n) in addonsCharges" :key="n">
            <span>{{ addon.desc }}</span>
            <span class="bold">{{ currency(addon.amount) }}</span>
        </div>
        <div class="inline-row">
            <span class="grey">Subtotal</span>
            <span class="bold grey">{{ currency(booking.subTotal) }}</span>
        </div>
        <div class="inline-row" v-for="(disc, ix) in booking.discounts" :key="ix">
            <span class="grey">{{ disc.reason }} {{ disc.percentage > 0 ? ('(' + disc.percentage + '%)') : ''}}</span>
            <span class="bold grey">-{{ currency(disc.amount) }}</span>
        </div>
        <div class="inline-row border-top">
            <span class="bold font-size-lg">Total</span>
            <span class="bold font-size-lg">{{ currency(booking.total) }}</span>
        </div>
    </div>
</template>

<script>
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';

export default {
	name: "BookingContent",
	mixins: [utility],
    props: {
		booking: {
			type: Object,
			default: () => {},
		},
        orderNumber: {
			type: String,
			default: "",
		},
	},
	data() {
		return {}
	},
	watch: {},
	computed: {
        orderDate(){
            if(isEmpty(this.booking)) return "";
            return moment.tz(this.booking.placeTime, 'Asia/Singapore').format('DD MMM YYYY HH:mm A');
        },
        customerName(){
            if(isEmpty(this.booking)) return "";
            let names = [];
            if(this.booking.customer.firstName) names.push(this.booking.customer.firstName);
            if(this.booking.customer.lastName) names.push(this.booking.customer.lastName);
            return names.join(' ');
        },
        customerEmail(){
            if(isEmpty(this.booking)) return "";
            return this.booking.customer.email;
        },
        bookingAmount() {
            if (isEmpty(this.booking)) return [];
            return this.booking.items?.map((it) => {
                let total = it.total - (it.ticket?.addOnAmount || 0);
                return total;
            }).reduce((prev, next) => prev + next);
        },
        addonsCharges() {
            if (isEmpty(this.booking)) return [];
            return this.booking.items?.map((it) => {
                return {
                    amount: it.ticket?.addOnAmount || 0,
                    desc: it.ticket?.additionalInfo
                }
            }).filter((it) => {
                return it.amount > 0;
            });
        }
    },
	methods: {
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
        }
    },
};
</script>
<style scoped lang="scss">
    .payment-header {
        width: 100%;
    }
    .payment-body {
        width: 100%;
        height: 100%;
        overflow: hidden;
        overflow-y: auto;

        .sessions {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 16px;

            & + * {
                margin-top: 16px;
            }

            .session {
                width: 100%;
                border: 1px solid $secondary-color-20;
                border-radius: 8px;
                padding: 16px;
                display: grid;
                grid-template-columns: 1fr;
                grid-row-gap: 6px;

                .session-name {
                    font-family: 'Akzidenz Grotesk Super';
                    color: $primary-color-60;
                    padding: 8px 0;
                }
                .session-date {
                    font-family: 'Akzidenz Grotesk Regular';
                    color:  $secondary-color-90;
                }
                .session-time {
                    font-family: 'Akzidenz Grotesk Regular';
                    color:  $secondary-color-50;
                }
                .session-location {
                    font-family: 'Akzidenz Grotesk Regular';
                    color:  $primary-color-60;
                }
                .session-price {
                    font-family: 'Akzidenz Grotesk Regular';
                    color:  $secondary-color-90;
                    text-align: right;
                }
                .session-number {
                    font-family: 'Akzidenz Grotesk Regular';
                    color:  $secondary-color-90;
                    text-align: right;
                }
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
                padding: 0 16px;
                width: 100%;
                display: flex;
                align-items: center;
                gap: 12px;

                & + * {
                    margin-top: 24px;
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
                padding: 0 16px;
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
        }
        .row-text {
            font-family: 'Akzidenz Grotesk Super';
            color: $secondary-color-90;
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
            font-family: 'Akzidenz Grotesk Super';
        }

        .grey {
            color: $secondary-color-50;
        }
    }
    .ticket-info {
        width: 100%;
        padding: 16px;
        background: $primary-color-10;

        & + * {
            padding-top: 24px;
        }

        .ticket-header {
            font-family: 'Akzidenz Grotesk Regular';
            width: fit-content;
            margin: 0 auto;
            display: block;
            font-size: 0.9em;
        }
        .ticket-number {
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
        .ticket-date {
            font-family: 'Akzidenz Grotesk Regular';
            width: fit-content;
            margin: 0 auto;
            display: block;
            font-size: 0.8em;
            color: $secondary-color-60;
        }
    }
</style>