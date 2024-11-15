<template>
    <div class="redirect-content">
        <div class="redirect-wrapper">
            <span>{{ message }}</span>
            <div v-if="showButton" class="redirect-btn" @click="goHome()">Go Back</div>
            <div v-else class="processing"></div>
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
                        <div class="action-button" @click="doAgain()">Yes</div>
                    </div>
                </div>
            </template>
        </base-modal>
    </div>
</template>

<script>
    import { eventService } from "@/bloc/services";
import { EUNOIA_CONFIG } from "@/connector/apiConfig";
import { postOrder, postOutletOrder } from "@/connector/productConnector";
import utility from "@/presentation/mixins/utility.js";
    export default {
        data() {
            return {
                loading: false,
                showButton: false,
                status: "FAILED",
                trackingId: "",
                cartId: "",
                amount: 0,
                accountKey: "",
                currentStoreId: "",
                outletCode: "",
                message: "",
                tryAgain: false,
                tries: 10,
                timeOut: 8000,
                orderType: "",
            };
        },
        mixins: [utility],
        methods: {
            goHome(){
                // this.goTo('HomePage');
                this.$store.dispatch('setInited', false)
                if (this.orderType == "event") return this.$router.replace({ name: 'EventsPage' });
                this.$router.replace({ name: 'CartPage', params: { cartId: this.cartId, outletCode: this.getOutletCode() } });
            },
            toggleTryAgain(){
                this.tryAgain = !this.tryAgain;
            },
            async doAgain(){
                this.tries = 10;
                this.tryAgain = false;
                this.processOrder();
            },
            async processOrder(){
                this.showButton = false;
                this.message = "Please wait...";
                let store = this.getStoreList().find((it) => { return it.id == this.currentStoreId });
                this.$store.dispatch("setCurrentStore", store);
                let response = {success:false, message: "Payment failed/cancelled"};
                let orderRequest = {
                    draft: false,
                    test: false,
                    cartId: this.cartId,
                    /*
                    payment: {
                        amount: parseFloat(this.amount),
                        accountKey: this.accountKey,
                        trackingId: this.trackingId,
                        type: "PAYMAYA",
                        status: this.status == "SUCCESS" ? 'PAID' : 'DRAFT',
                    }
                    */
                }
                if(this.status !== "SUCCESS"){
                    this.message = response.message;
                    this.showButton = true;
                    return;
                }

                if(this.orderType == "event") {
                    response = await await eventService.bookEvent(orderRequest);
                } else {
                    if(this.isHQ()){
                        response = await postOutletOrder(orderRequest, this.getOutletCode());
                    } else {
                        response = await postOrder(orderRequest);
                    }
                }

                this.tries--;

                if(!response.success) {
                    if(this.tries == 0){
                        this.toggleTryAgain();
                        this.showButton = true;
                        this.message = "";
                        return;
                    }
                    return setTimeout(() => {
                        this.processOrder();
                    }, this.timeOut);
                }
                
                let dataGA = this.generateGA(response);
                window.dataLayer.push(dataGA);

                let page = 'TicketPage';
                if(this.orderType != "event"){
                    page = 'OrderSummary';
                }
                this.goToWithParams(page, {
                    number: response.order.number
                });
            },
        },
        watch: {},
        async created(){
            this.message = "Please wait...";
            this.currentStoreId = this.$route.params.currentStoreId;
            this.outletCode = this.$route.params.outletCode;
            this.amount = this.$route.params.amount || 0;
            this.trackingId = this.$route.params.trackingId;
            this.cartId = this.$route.params.cartId;
            this.accountKey = this.$route.params.accountKey;
            this.orderType = this.$route.params.orderType;
            if(this.amount > 0) this.status = "SUCCESS";

            let self = this;
            let splitted = this.outletCode.split(`${EUNOIA_CONFIG.brandCode}$`);
            let code = splitted[splitted.length - 1];
            await this.refreshMainData(false, () => {
                let outlets = self.$store.getters.getOutlets;
                let outlet = outlets.find((o) => {
                    return o.apiCode == code;
                });
                self.$store.dispatch("setCurrentOutlet", outlet);
                self.processOrder();
            }, code);
        }
    };
</script>
<style scoped lang="scss">
    @keyframes processingAnim {
        0% { 
            width: 0;
            background: linear-gradient(90deg, $primary-color-50 0%, $secondary-color-20);
        }
        100% { 
            width: 100%;
            background: linear-gradient(90deg, $primary-color-50 100%, $secondary-color-20);
        }
        }
    @-webkit-keyframes processingAnim {
        0% {
            width: 0;
            background: linear-gradient(90deg, $primary-color-50 0%, $secondary-color-20);
        }
        100% { 
            width: 100%;
            background: linear-gradient(90deg, $primary-color-50 100%, $secondary-color-20);
        }
    }
    .processing {
        position: relative;
        overflow: hidden;
        width: 100%;
        max-width: 250px;
        margin: 0 auto;
        height: 16px;
        border-radius: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: $secondary-color-20;
        &::before {
            position: absolute;
            content: "";
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            color: $white;
            margin: 0 auto;
            height: 16px;
            bottom: 0;
            left: 0;
            transition: all 1s;
            -webkit-transition: all 1s;
            animation: processingAnim 1s ease-in-out infinite;
            -webkit-animation: processingAnim 1s ease-in-out infinite;
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
    .redirect-content {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $secondary-color-70;

        .redirect-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 24px;
            padding: 24px;

            .redirect-btn {
                width: 100%;
                max-width: 200px;
                margin: 0 auto;
                padding: 8px 32px;
                text-align: center;
                font-weight: bold;
                border-radius: 12px;
                background: $primary-color-50;
                color: $white;
                cursor: pointer;
            }
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
</style>