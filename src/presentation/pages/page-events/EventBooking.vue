<template>
	<layout-variant-two :show-loading-screen="loading">
        <template v-slot:header>
			<div class="slide-down">
				<div class="header-con">
					<div class="back-btn" @click="goBack">
                        <span class="material-icons">arrow_back</span>
                    </div>
					<h1 class="heading-5 center">Ticket Details</h1>
				</div>
			</div>
		</template>
		<template v-slot:body>
            <div class="container" v-if="!isEmpty(eventDetails)">
                <div class="event-title-desktop">{{ eventDetails.name }}</div>
                <div class="event-content">
                    <div class="event-content-left">
                        <div class="event-buttons-desktop">
                            <span class="desktop-label">Participants: </span>
                            <div class="event-buttons">
                                <span class="btn-min material-icons" @click="minus()">remove</span>
                                <span class="num">{{numPax}}</span>
                                <span class="btn-plus material-icons" @click="plus()">add</span>
                            </div>
                        </div>
                        <div class="event-title">{{ eventDetails.name }}</div>
                        <div class="event-label">
                            <span class="event-note">Select date & time</span>
                            <div class="boxes" v-if="isEmpty(eventDetails.sessions)">
                                <div style="font-weight:normal;">No available dates.</div>
                            </div>
                            <div style="width: 100%;"
                                v-for="(sess, i) in eventDetails.sessions"
                                :key="i"
                            >
                                <span class="sess-name">{{ sess.name }}</span>
                                <div class="boxes">
                                    <div class="box" 
                                        :class="{'selected': isSelectedSession(d)}"
                                        v-for="(d, i) in sess.items" 
                                        :key="i"
                                        @click="selectDate(d)" v-html="eventBoxDisplay(d)"></div>
                                </div>
                            </div>
                        </div>
                        <div class="event-label" v-if="!isEmpty(selectedDate)">
                            <div class="event-footnote">
                                <span class="map-icon material-icons-outlined">location_on</span>
                                <span>{{ selectedDate.location.string }}</span>
                            </div>
                            <span class="event-footnote blue">{{ selectedDate.spotLeft }} spots remaining</span>
                        </div>
                    </div>
                    <div class="event-content-right">
                        <div class="event-buttons">
                            <span class="btn-min material-icons" @click="minus()">remove</span>
                            <span class="num">{{numPax}}</span>
                            <span class="btn-plus material-icons" @click="plus()">add</span>
                        </div>
                        <div class="participants" v-if="!isEmpty(participants)">
                            <div class="participant__tabs">
                                <div class="participant__tab" 
                                    :class="{'active': i == participantIndex}"
                                    v-for="(p,i) in participants" 
                                    :key="i"
                                    @click="participantIndex = i"
                                >
                                    <span>Participant {{ i + 1 }}</span>
                                </div>
                            </div>
                            <div class="participant" 
                                :class="{'active': i == participantIndex}"
                                v-for="(p,i) in participants" 
                                :key="i"
                            >
                                <div class="participant__content">
                                    <div class="participant__form-input" :class="{'disabled': isParticipating && i == 0}">
                                        <div class="participant__label">
                                            <span>First Name</span>
                                            <span class="required">*</span>
                                        </div>
                                        <div class="participant__input">
                                            <input type="text" v-model="participants[i].participantFirstName">
                                        </div>
                                    </div>
                                    <div class="participant__form-input" :class="{'disabled': isParticipating && i == 0}">
                                        <div class="participant__label">
                                            <span>Last Name</span>
                                            <span class="required">*</span>
                                        </div>
                                        <div class="participant__input">
                                            <input type="text" v-model="participants[i].participantLastName">
                                        </div>
                                    </div>
                                    <div class="participant__form-input" :class="{'disabled': isParticipating && i == 0}">
                                        <div class="participant__label">
                                            <span>Email Address</span>
                                            <span class="required">*</span>
                                        </div>
                                        <div class="participant__input">
                                            <input type="text" v-model="participants[i].participantEmail">
                                        </div>
                                    </div>
                                    <div class="participant__form-input" :class="{'disabled': isParticipating && i == 0}">
                                        <div class="participant__label">
                                            <span>Phone</span>
                                            <span class="required">*</span>
                                        </div>
                                        <div class="participant__input">
                                            <input type="text" v-model="participants[i].participantPhone">
                                        </div>
                                    </div>
                                    <div class="participant__form-input" 
                                        :class="{'disabled': isParticipating && i == 0}"
                                        v-for="(ai, ix) in p.additionalInfo"
                                        :key="ai.id">
                                        <div class="participant__label">
                                            <span>{{ ai.name }}</span>
                                            <span v-if="ai.type == 'MANDATORY'" class="required">*</span>
                                        </div>
                                        <div class="participant__input">
                                            <div class="radio-list left-radio" v-if="ai.fieldType == 'OPTION' && ai.optionType == 'RADIO'">
                                                <div class="radio" v-for="(info, n) in ai.fieldValues" :key="info.id">
                                                    <input :name="'participant' + i + '_' + ai.id + '_radio'" type="radio" 
                                                        :checked="info.checked == true"
                                                        @click="radioAdditionalInfo(ix,n)"
                                                    >
                                                    <div class="radio-label" :class="{'inline': info.cost > 0}">
                                                        <span>{{ info.value }}</span>
                                                        <span class="checkbox-cost" 
                                                            :class="{'active': info.checked}"
                                                            v-if="info.cost > 0"
                                                        >+{{ currency(info.cost) }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="checkbox-wrapper" v-else-if="ai.fieldType == 'OPTION' && ai.optionType == 'CHECKBOX'">
                                                <div class="checkbox" v-for="(info, n) in ai.fieldValues" :key="info.id">
                                                    <input type="checkbox" :name="'participant' + i + '_' + ai.id + '_checkbox'"
                                                        :disabled="isCheckBoxDisabled(ix,n)"
                                                        :checked="info.checked == true"
                                                        @click="checkListAdditionalInfo(ix,n)"
                                                    >
                                                    <div class="checkbox-label" :class="{'inline': info.cost > 0}">
                                                        <span>{{ info.value }}</span>
                                                        <span class="checkbox-cost" 
                                                            :class="{'active': info.checked}"
                                                            v-if="info.cost > 0"
                                                        >+{{ currency(info.cost) }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <input v-else-if="ai.fieldType == 'TEXT'" v-model="participants[i].additionalInfo[ix].value" type="text">
                                            <input v-else-if="ai.fieldType == 'NUMERIC'" v-model="participants[i].additionalInfo[ix].value" @keypress="isNumber($event)" type="text">
                                        </div>
                                    </div>
                                    <h1 class="heading-5 center" v-if="eventDetails.isRequiredEmergencyContact">In case of Emergency:</h1>
                                    <div class="participant__form-input" v-if="eventDetails.isRequiredEmergencyContact">
                                        <div class="participant__label">
                                            <span>Emergency Contact Name</span>
                                            <span class="required">*</span>
                                        </div>
                                        <div class="participant__input">
                                            <input type="text" v-model="participants[i].emergencyContactName">
                                        </div>
                                    </div>
                                    <div class="participant__form-input" v-if="eventDetails.isRequiredEmergencyContact">
                                        <div class="participant__label">
                                            <span>Emergency Contact Number</span>
                                            <span class="required">*</span>
                                        </div>
                                        <div class="participant__input">
                                            <input type="text" v-model="participants[i].emergencyContactPhone" @keypress="isNumber($event)">
                                        </div>
                                    </div>
                                    <div class="participant__form-input" v-if="eventDetails.isRequiredEmergencyContact">
                                        <div class="participant__label">
                                            <span>Relation to Emergency Contact</span>
                                            <span class="required">*</span>
                                        </div>
                                        <div class="participant__input">
                                            <input type="text" v-model="participants[i].emergencyContactRelation">
                                        </div>
                                    </div>
                                    <!--
                                    <div class="checkbox-wrapper" v-if="i==0 && isLoggedIn()">
                                        <div class="checkbox">
                                            <input type="checkbox" v-model="isParticipating">
                                            <span class="checkbox-label" style="white-space:nowrap;">I am participating</span>
                                        </div>
                                    </div>
                                    -->
                                </div>
                            </div>
                        </div>
                        <div class="agreement" v-if="!isEmpty(participants)">
                            <div class="agreement__wrapper">
                                <h4>DATA PRIVACY ACT</h4>
                                <div class="agreement__content">
                                    <p class="justify">
                                        By submitting this form, I expressly give consent to Primer Resources Corp. (PRC), 
                                        and its affiliates under the Primer Group of Companies (referred collectively as PRIMER) 
                                        to collect, use, store or otherwise process my personal data to verify 
                                        and process my membership with the said company.{{ morePrivacy ? '' : '..' }}
                                    </p>
                                    <p class="justify" v-if="morePrivacy">
                                        I agree to the use of the said data for commercial or marketing purposes & for analytics. 
                                    </p>
                                    <p class="justify" v-if="morePrivacy">
                                        I understand that my information may be shared with its affiliates 
                                        and/or third party service providers for the purpose of delivering the items to my designated location. 
                                    </p>
                                    <p class="justify" v-if="morePrivacy">
                                        In this regard, PRC implements reasonable and appropriate security measures to maintain the confidentiality, 
                                        integrity and availability of your personal data.
                                    </p>
                                    <p v-if="morePrivacy">
                                        You may review the full PRC Privacy Policy posted in-store or online at 
                                        <a href="https://www.primergrp.com/primer-privacy-policy" class="link" target="_blank">https://www.primergrp.com/primer-privacy-policy</a>.
                                    </p>
                                    <span class="link red" @click="togglePrivacy">See {{ morePrivacy ? 'less' : 'more' }}</span>
                                </div>
                            </div>
                            <div class="checkbox-custom" @click="toggleAgree()">
                                <span class="checkbox-icon material-icons-outlined" :class="{'checked': dataPrivacyAgreement}">
                                    {{ dataPrivacyAgreement ? 'check_box' : 'check_box_outline_blank' }}
                                </span>
                                <span class="checkbox-label" style="white-space:nowrap;">
                                    I agree  to the <a :href="tncLink" target="_blank" class="link no-underlined">Terms and Conditions</a> 
                                    and Privacy Policy
                                </span>
                            </div>
                        </div>
                        <widget-promo-code v-if="!isEmpty(participants)" @emit-promocode="emitPromoCode" />
                        <widget-voucher v-if="!isEmpty(participants)" 
                            :is-event="true" 
                            @select-voucher="showVouchers"
                            @on-apply-voucher="onApplyVoucher"/>
                        <br/>
                        <div class="event-summary">
                            <div class="event-summary__header">Summary</div>
                            <div class="event-summary__body">
                                <div class="event-summary-row">
                                    <span class="row-note">{{ numPax }}x {{eventDetails.name}}</span>
                                    <span class="row-note" v-if="selectedDate">{{ currency(selectedDate.price * numPax) }}</span>
                                </div>
                                <div class="event-extracharge-row" v-for="(extra, n) in groupedExtracharges" :key="n">
                                    <div class="extracharge-head">{{ extra.parentName }}</div>
                                    <div class="extracharge-body">
                                        <div class="extracharge-title">{{ extra.qty }}x {{ extra.value }}</div>
                                        <div class="extracharge-amount">{{ currency(extra.cost) }}</div>
                                    </div>
                                </div>
                                <div style="width:100%">
                                    <div class="event-summary-row" v-for="(disc, x) in discounts" :key="x">
                                        <div class="row-icon" @click="removeDiscount(disc)"><span class="material-icons-outlined">highlight_off</span></div>
                                        <div class="row-title custom-voucher">{{ disc.reason }} {{disc.percentage ? '(' + disc.percentage + '%)' : ''}}</div>
                                        <div class="row-title custom-voucher" style="white-space:nowrap;">-{{ currency(disc.amount) }}</div>
                                    </div>
                                </div>
                                <div class="event-summary-row">
                                    <div class="row-title">Total</div>
                                    <div class="row-title">{{ priceDisplay }}</div>
                                </div>
                            </div>
                            <div class="event-summary__footer" v-if="numPax > 0">
                                <div class="actions" v-if="!bookNum">
                                    <div class="action-button" @click="confirmBooking()">Book Now</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
		</template>
	</layout-variant-two>
</template>

<script>
import { eventService } from "@/bloc/services";
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import WidgetPromoCode from "@/components/widgets/WidgetPromoCode.vue";
import WidgetVoucher from "@/components/widgets/WidgetVoucher.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from 'moment-timezone';

export default {
	name: "EventBooking",
	mixins: [utility],
	components: {
        LayoutVariantTwo,
        WidgetVoucher,
        WidgetPromoCode,
	},
	data() {
		return {
			loading: false,
            sessionId: null,
            eventId: null,
            eventDetails: null,
            numPax: 0,
            selectedDate: null,
            showSummary: false,
            bookNum: null,
            participants: [],
            participantIndex: 0,
            isParticipating: false,
            dataPrivacyAgreement: false,
            morePrivacy: false,
            promoCode: "",
            isApplyingPromo: false,
            discounts: [],
            extraCharges: [],
            isDesktop: true,
            totalAmount: 0,
		};
	},
	watch: {
        selectedDate(val){
            if(isEmpty(val)) return;
            this.eventDetails.maxCapacity = val.maxSpot;
            this.eventDetails.max = val.maxSpot;
            this.eventDetails.min = 1;
            if(this.eventDetails.maxCapacity < this.eventDetails.min){
                if(this.eventDetails.maxCapacity > 0) this.eventDetails.min = this.eventDetails.maxCapacity
            }
            if(this.eventDetails.maxCapacity < this.eventDetails.max){
                if(this.eventDetails.maxCapacity > 0) this.eventDetails.max = this.eventDetails.maxCapacity
            }
            this.numPax = 0;
            this.participants = [];
            this.isParticipating = false;
            this.totalAmount = 0;
            this.discounts = [];
            this.extraCharges = [];
            /*
            if(this.numPax > this.remainingSales) this.numPax = this.eventDetails.min;
            if(this.numPax == 0) this.numPax = this.eventDetails.min;
            if(this.eventDetails.maxCapacity <= 0) this.numPax = 0;
            */
        },
        isParticipating(val){
            if(isEmpty(this.participants)) return;
            let customer = this.$store.getters.getCustomer;
            if(isEmpty(customer)) return;
            this.participants[0] = {
                participantEmail: val ? customer.email : "",
                participantPhone: val ? customer.phone : "",
                participantFirstName: val ? customer.firstName : "",
                participantLastName: val ? customer.lastName : ""
            }
        }
    },
	computed: {
        eventLocation(){
            if(isEmpty(this.eventDetails)) return "";
            if(isEmpty(this.eventDetails.location)) return "";
            return this.eventDetails.location.string;
        },
        priceDisplay(){
            return this.currency(this.totalAmount);
        },
        remainingSales(){
            if(isEmpty(this.selectedDate)) return 0;
            return parseFloat(this.selectedDate.spotLeft) - this.numPax;
        },
        tncLink(){
            let url = window.location.origin;
            return `${url}/faq`;
        },
        groupedExtracharges() {
            let extras = [];
            if (isEmpty(this.extraCharges)) return [];
            this.extraCharges.forEach((it) => {
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
        setTotalAmount() {
            if (isEmpty(this.selectedDate)) {
                this.totalAmount = 0;
                this.discounts = [];
                this.extraCharges = [];
                return;
            }
            let price = this.numPax * parseFloat(this.selectedDate.price);
            let disc = 0;
            if(!isEmpty(this.discounts)){
                this.discounts.forEach((it) => { disc += it.amount })
            }
            if(!isEmpty(this.extraCharges)){
                this.extraCharges.forEach((it) => { price += it.cost });
            }
            this.totalAmount = price - disc;
        },
        isNumber(evt) {
            evt = (evt) ? evt : window.event;
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            if ((charCode > 31 && (charCode < 48 || charCode > 57))) {
                evt.preventDefault();
                return;
            }
            return true;
        },
        radioAdditionalInfo(ix, n) {
            let i = this.participantIndex;
            let info = this.participants[i].additionalInfo[ix].fieldValues[n];
            this.participants[i].additionalInfo[ix].fieldValues.forEach((it) => {
                it.checked = false;
                if (this.extraCharges && this.extraCharges.findIndex((ex) => { return ex.id == it.id && ex.participantIndex == i }) >= 0) {
                    this.extraCharges.splice(this.extraCharges.findIndex((ex) => { return ex.id == it.id && ex.participantIndex == i }), 1);
                }
            });
            setTimeout(() => {
                this.participants[i].additionalInfo[ix].fieldValues[n].checked = true;
                this.participants[i].additionalInfo[ix].value = info.value;
                let pExtra = this.extraCharges.find((ex) => { return ex.id == info.id && ex.participantIndex == i });
                if (Math.abs(info.cost) > 0 && !pExtra) {
                    let extra = this.participants[i].additionalInfo[ix].fieldValues[n];
                    extra.parent = this.participants[i].additionalInfo[ix];
                    extra.participantIndex = i;
                    this.extraCharges.push(extra);
                }
                this.setTotalAmount();
            }, 150);
        },
        isCheckBoxDisabled(ix, n){
            let i = this.participantIndex;
            let info = this.participants[i].additionalInfo[ix].fieldValues[n];
            let selectedValues = this.participants[i].additionalInfo[ix].fieldValues.filter((it) => {
                return it.checked;
            }).map((it) => { return it.id });
            return selectedValues.indexOf(info.id) == -1 && selectedValues.length >= this.participants[i].additionalInfo[ix].maxOptions;
        },
        checkListAdditionalInfo(ix, n){
            let i = this.participantIndex;
            let info = this.participants[i].additionalInfo[ix].fieldValues[n];
            let selectedValues = this.participants[i].additionalInfo[ix].fieldValues.filter((it) => {
                return it.checked;
            }).map((it) => { return it.id });
            let convertValues = () => {
                let values = this.participants[i].additionalInfo[ix].fieldValues.filter((it) => {
                    return it.checked;
                }).map((it) => { return it.value });
                this.participants[i].additionalInfo[ix].value = values.join(',');
                this.setTotalAmount();
            }
            if(selectedValues.indexOf(info.id) > -1) {
                let index = selectedValues.indexOf(info.id);
                this.participants[i].additionalInfo[ix].fieldValues[index].checked = false;
                if (this.extraCharges && this.extraCharges.findIndex(ex => ex.id == this.participants[i].additionalInfo[ix].fieldValues[index].id) >= 0) {
                    this.extraCharges.splice(this.extraCharges.findIndex(ex => ex.id == this.participants[i].additionalInfo[ix].fieldValues[index].id), 1);
                }
                return convertValues();
            }
            let extra = this.participants[i].additionalInfo[ix].fieldValues.find(it => it.id == info.id);
            if (extra && Math.abs(info.cost) > 0 && !this.extraCharges.find(ex => ex.id == info.id && ex.participantIndex == i)) {
                extra.checked = true;
                extra.parent = this.participants[i].additionalInfo[ix];
                extra.participantIndex = i;
                this.extraCharges.push(extra);
            }
            convertValues();
        },
        setFields(){
            let emergency = {
                emergencyContactName: "",
                emergencyContactPhone: "",
                emergencyContactRelation: "",
            }
            let fields = {
                participantEmail: "",
                participantPhone: "",
                participantFirstName: "",
                participantLastName: "",
                additionalInfo: []
            }
            if(!isEmpty(this.eventDetails.customFields)){
                this.eventDetails.customFields.sort((a,b) => { return a.sortIndex - b.sortIndex }).forEach((it) => {
                    let one = {value: ""}
                    let item = {...it, ...one};
                    if(item.fieldValues) {
                        item.fieldValues = item.fieldValues.map((v) => {
                            return {...v, ...{ checked: false } }
                        })
                        item.fieldValues.sort((a,b) => { return a.id - b.id });
                    }
                    fields.additionalInfo.push(item);
                });
            }
            if(this.eventDetails.isRequiredEmergencyContact) fields = {...fields, ...emergency}
            return fields;
        },
        minus(){
            if(isEmpty(this.selectedDate)) return this.showNotification("alert", "error_outline", "Please select a session!");
            if(this.numPax <= this.eventDetails.min) return this.showNotification("warning", "error_outline", "Minimum of " + this.eventDetails.min + " pax is required!");
            this.numPax--;
            if(!isEmpty(this.participants)){
                let idx = this.participants.length - 1;
                this.participants.splice(idx, 1);
                if(this.participantIndex == idx){
                    this.participantIndex = 0;
                }
                if (!isEmpty(this.extraCharges)) {
                    let ex = this.extraCharges.findIndex((e) => { return e.participantIndex == idx });
                    if (ex >= 0) this.extraCharges.splice(ex, 1);
                }
            }
            this.setTotalAmount();
        },
        plus(){
            if(isEmpty(this.selectedDate)) return this.showNotification("alert", "error_outline", "Please select a session!");
            if(this.remainingSales == 0) return this.showNotification("alert", "error_outline", "Remaining 0 ticket!");
            if(this.numPax >= this.eventDetails.max) return this.showNotification("warning", "error_outline", "Maximum of " + this.eventDetails.max + " pax is required!");
            this.numPax++;
            let fields = this.setFields();
            this.participants.push(fields);
            this.participantIndex = this.participants.length - 1;
            this.setTotalAmount();
        },
        eventYear(d){
            return moment.tz(d.startDate,'Asia/Singapore').format('YYYY');
        },
        eventBoxDisplay(d){
            let from = moment.tz(d.startDate,'Asia/Singapore').format('YYYYMMDD');
            let to = moment.tz(d.endDate,'Asia/Singapore').format('YYYYMMDD');

            let fromY = moment.tz(d.startDate,'Asia/Singapore').format('YYYY');
            let toY = moment.tz(d.endDate,'Asia/Singapore').format('YYYY');

            let fromM = moment.tz(d.startDate,'Asia/Singapore').format('MM');
            let toM = moment.tz(d.endDate,'Asia/Singapore').format('MM');

            let fromD = moment.tz(d.startDate,'Asia/Singapore').format('DD');
            let toD = moment.tz(d.endDate,'Asia/Singapore').format('DD');

            let items = [];

            let dow = `<div class="box-label">${this.eventDayOfWeek(d)}</div>`;
            let dt = `<div class="box-round">${this.eventDate(d)}</div>`;
            let mm = `<span>${this.eventMonth(d)}</span><span class="dot"></span>`;
            let yy = `<span>${this.eventYear(d)}</span>`;
            let tt = `<div class="box-note" style="white-space:nowrap;">${this.eventTimes(d)}</div>`;
            let dur = `<div class="box-note">${this.eventDurations(d)}</div>`;

            if(from != to){
                let dowA = moment.tz(d.startDate,'Asia/Singapore').format('ddd');
                let dowB = moment.tz(d.endDate,'Asia/Singapore').format('ddd');
                dow = `<div class="box-label">${dowA} - ${dowB}</div>`;
                if(fromD != toD){
                    dt = `<div class="box-round-grouped"><div class="box-round">${fromD}</div><div class="box-round">${toD}</div></div>`;
                }
                if(fromM != toM){
                    let formatM = 'MMM';
                    if(fromY != toY) formatM = 'MMM YYYY';
                    let mA = moment.tz(d.startDate,'Asia/Singapore').format(formatM);
                    let mB = moment.tz(d.startDate,'Asia/Singapore').format(formatM);

                    mm = `<span>${mA}-${mB}</span><span class="dot"></span>`;
                    if(fromY != toY) 
                        mm = `<span>${mA}-${mB}</span>`;
                    else
                        yy = '';
                }
            }

            items.push(dow);
            items.push(dt);
            items.push(`<div class="box-label">${mm}${yy}</div>`);
            items.push(tt);
            items.push(dur);
            return items.join('');
        },
        eventMonth(d){
            return moment.tz(d.startDate,'Asia/Singapore').format('MMM');
        },
        eventDate(d){
            return moment.tz(d.startDate,'Asia/Singapore').format("DD");
        },
        eventDayOfWeek(d){
            return moment.tz(d.startDate,'Asia/Singapore').format('dddd');
        },
        eventTimes(d){
            return moment.tz(d.startDate,'Asia/Singapore').format("HH.mm") + " - " + moment.tz(d.endDate,'Asia/Singapore').format("HH.mm");
        },
        eventDurations(d){
            let durations = [];
            let milliseconds = Math.abs(parseInt(d.endDate) - parseInt(d.startDate));
            let sec = milliseconds/ 1000;
            let mm = Math.floor(sec / 60);
            let hh = Math.floor(mm / 60);
            let day = Math.floor(hh / 24);
            if(day >= 1) {
                hh = hh % 24;
                durations.push(`${day}d`);
            }
            if(hh >= 1) {
                mm = mm % 60;
                durations.push(`${hh}h`);
            }
            if(mm >= 1) durations.push(`${mm}min`);
            return durations.join(' ');
        },
        async getEventDetails(){
            let json = await eventService.getEvents();
            this.loading = false;

            if(!isEmpty(json) && !isEmpty(json.events)){
                let events = json.events.filter((it) => {
                    return it.status == "ACTIVE";
                });
                this.$store.dispatch("setEvents", events);
            }
            let events = this.$store.getters.getEvents;
            let parent = events.find((it) => {
                return it.id == this.eventId;
            });
            if(isEmpty(parent)) return;
            if(isEmpty(parent.sessions)) return;

            let momente = moment();
            let today = moment.tz(momente, "Asia/Singapore").format('x');
            let sessions = parent.sessions.filter((sess) => {
                return sess.startDate >= today;
            }).sort((a,b) => { return a.startDate - b.startDate });
            
            let children = [];
            if(!isEmpty(sessions)){
                let child = [];
                sessions.forEach((s) => {
                    if(isEmpty(child[s.sessionId])) {
                        child[s.sessionId] = {name: s.name, items: []}
                    }
                    child[s.sessionId].items.push(s);
                });
                for(var sessionId in child){
                    children.push(child[sessionId]);
                }
            }
            
            parent.sessions = children;
            this.eventDetails = parent;
            if(parent.sessions.length == 1) {
                if(parent.sessions[0].items.length == 1){
                    this.selectDate(parent.sessions[0].items[0]);
                }
            }
            let preSelectSession = this.$store.getters.getBookingEventSession;
            if (!isEmpty(preSelectSession)) {
                this.$store.dispatch("setBookingEventSession", null);
                let sessionId = preSelectSession.sessionId;
                let sessionTimeId = preSelectSession.sessionTimeId;
                let ss = parent.sessions.find((x) => { return x.items.filter((it) => { return it.sessionId == sessionId }).length > 0 });
                if(!isEmpty(ss)){
                    let t = ss.items.find((y) => { return y.sessionTimeId == sessionTimeId });
                    if(!isEmpty(t)) {
                        this.selectDate(t);
                        setTimeout(() => {
                            this.plus();
                        }, 200);
                    }
                }
            }
            let currentBooking = this.$store.getters.getBooking;
            if(!isEmpty(currentBooking) && !isEmpty(this.eventDetails.sessions)){
                currentBooking = currentBooking[0];
                this.selectedDate = currentBooking.selectedSession;
                
                setTimeout(() => {
                    this.discounts = currentBooking.discounts;
                    this.extraCharges = currentBooking.extraCharges;
                    this.promoCode = currentBooking.promoCode;
                    this.numPax = currentBooking.quantity;
                    this.participants = currentBooking.participantsDetails;
                    this.participantIndex = this.participants.length - this.participants.length;
                    this.dataPrivacyAgreement = true;
                    this.setTotalAmount();
                }, 500);
            }
        },
        selectDate(d){
            if(!d) return;
            if(!isEmpty(this.selectedDate)){
                if(this.selectedDate.sessionTimeId == d.sessionTimeId) return;
            }
            this.selectedDate = d;
            this.setTotalAmount();
        },
        isSelectedSession(d){
            if(isEmpty(this.selectedDate)) return false;
            return d.sessionTimeId == this.selectedDate.sessionTimeId;
        },
        toggleSummary(){
            this.showSummary = !this.showSummary;
        },
        async emitPromoCode(currentPromocode, promoCodes, callbackEmit) {
            let self = this;
            self.promoCode = currentPromocode;
            self.resetOrderRequest();
            self.isApplyingPromo = true;
            await self.validateBooking((res) => {
                callbackEmit();
                if (res.success) return self.executePromo();
                promoCodes = promoCodes.filter((code) => { return code !== self.promoCode });
                self.$store.dispatch("setPromoCodes", promoCodes);
                self.showNotification("alert", "error_outline", res.message);
            });
        },
        onApplyVoucher(callback) {
            let self = this;
            let booking = self.generateBooking();
            self.$store.dispatch("clearBooking");
            self.$store.dispatch("addToBooking", booking);
            return self.checkoutEvent({
                booking: booking
            }, true, (res) => {
                callback(res);
                if (!res.success) {
                    let msg = res.message || "Something went wrong!";
                    return self.showNotification("alert", "error_outline", msg);
                }
                if (!isEmpty(res.order)) {
                    self.discounts = res.order.discounts;
                    self.totalAmount = res.order.total;
                }
                booking = self.generateBooking();
                self.$store.dispatch("clearBooking");
                self.$store.dispatch("addToBooking", booking);
            });
        },
        generateBooking(){
            this.resetOrderRequest();
            let customer = this.$store.getters.getCustomer;
            if(this.isGuestCustomer()){
                customer = {
                    firstName: this.participants[0].participantFirstName,
                    lastName: this.participants[0].participantLastName,
                    email: this.participants[0].participantEmail,
                    phone: this.participants[0].participantPhone,
                }
            }
            if(!customer.lastName) customer.lastName = "null";

            let booking = {
                type: "TICKET",
                name: this.eventDetails.name,
                eventId: this.eventId,
                sessionId: this.sessionId,
                sessionTimeId: this.selectedDate.sessionTimeId,
                customer: customer,
                details: this.eventDetails,
                selectedSession: this.selectedDate,
                quantity: this.numPax,
                price: parseFloat(this.selectedDate.price),
                total: this.totalAmount,
                discounts: this.discounts,
                extraCharges: this.extraCharges,
                promoCode: this.promoCode,
                participantsDetails: this.participants,
                promoCodes: this.$store.getters.getPromoCodes || []
            }
            booking.participants = booking.participantsDetails.map((p, ix) => {
                let pExtra = 0;
                if (!isEmpty(this.extraCharges)) {
                    let dExtras = this.extraCharges.filter((it) => { return it.participantIndex == ix });
                    if (!isEmpty(dExtras)) {
                        pExtra = dExtras.map(x => x.cost).reduce((prev, next) => prev + next);
                    }
                }
                let part = {
                    participantFirstName: p.participantFirstName,
                    participantLastName: p.participantLastName,
                    participantEmail: p.participantEmail,
                    participantPhone: p.participantPhone,
                    additionalInfo: p.additionalInfo.map((info) => {
                        return `${info.name}: ${info.value}`
                    }),
                    addOnAmount: pExtra,
                }
                if(this.eventDetails.isRequiredEmergencyContact){
                    let emergency = {
                        emergencyContactName: p.emergencyContactName,
                        emergencyContactPhone: p.emergencyContactPhone,
                        emergencyContactRelation: p.emergencyContactRelation,
                    }
                    part = {...part, ...emergency}
                }
                return part;
            });
            return booking;
        },
        resetOrderRequest(){
            let self = this;
            let order = self.$store.getters.getOrderRequest;
            if(!isEmpty(order)){
                if(!isEmpty(order.promoCodes)) {
                    let promoCodes = self.$store.getters.getPromoCodes;
                    promoCodes = promoCodes.filter((code) => { return order.promoCodes.indexOf(code) == -1 && code != self.promoCode });
                    self.$store.dispatch("setPromoCodes", promoCodes);
                }
                self.$store.dispatch("setOrderRequest", {});
                self.$store.dispatch("setCarts", []);
            }
        },
        async bookNow() {
            let accounts = this.getPaymentAccounts();
            let paymaya = accounts.find((pm) => {
                return pm.type == "PAYMAYA";
            });
            if(isEmpty(paymaya)) return this.showNotification("alert", "error_outline", "Payment method is unavailable!");

            let booking = this.generateBooking();

            this.$store.dispatch("clearBooking");
            this.$store.dispatch("addToBooking", booking);
            if (!this.isLoggedIn()) {
                return this.$router.push({
                    path: '/login',
                    query: {
                        redirect: `/booking/${this.$route.params.eventId}`
                    }
                });
            }
            let self = this;
            this.checkoutEvent({
                booking: booking
            }, true, (res) => {
                if (!res.success) {
                    let msg = res.message || "Something went wrong!";
                    return self.showNotification("alert", "error_outline", msg);
                }
                if(!isEmpty(res.order)){
                    self.discounts = res.order.discounts;
                    self.totalAmount = res.order.total;
                }
                booking = self.generateBooking();
                self.$store.dispatch("clearBooking");
                self.$store.dispatch("addToBooking", booking);
                self.$router.push({name: "CheckoutPage"});
            });
        },
        async showVouchers(callback) {
            if (!this.isLoggedIn()) {
                return this.$router.push({
                    path: '/login',
                    query: {
                        redirect: `/booking/${this.$route.params.eventId}`
                    }
                });
            }
            await this.validateBooking((res) => {
                if (!res.success) return this.showNotification("alert", "error_outline", res.message);
                callback();
            });
        },
        validateBooking() {
            let callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () { };
            let res = {success: true};
            if(isEmpty(this.selectedDate)) {
                return callback({success: false, message: "Please select date & time!"});
            }
            if(this.eventDetails.maxCapacity == 0) {
                return callback({success: false, message: "Ticket sold out!"});
            }
            if(this.numPax == 0 || this.numPax < this.eventDetails.min) {
                return callback({success: false, message: "Minimum of " + this.eventDetails.min + " pax is required!"});
            }

            let foundInvalid = [];
			this.participants.forEach((p, i) => {
				let no = i + 1;
				if(isEmpty(p.participantFirstName)) {
                    foundInvalid.push({index: i, message:`First name of participant ${no} is required!`});
                }
                if(isEmpty(p.participantLastName)) {
                    foundInvalid.push({index: i, message:`Last name of participant ${no} is required!`});
                }
				if(!this.isValidEmail(p.participantEmail)) {
                    foundInvalid.push({index: i, message:`Please input a valid email address of participant ${no} ${p.participantEmail}`});
                }
				if(!this.isValidPhone(p.participantPhone)) {
                    foundInvalid.push({index: i, message:`Please input a valid phone number of participant ${no} ${p.participantPhone}`});
                }
                let invalidInfo = p.additionalInfo.filter((info) => {
                    let value = info.value.toString();
                    if (info.type == "MANDATORY" && info.fieldType == "OPTION") {
                        if (info.optionType == "CHECKBOX" || info.optionType == "RADIO") {
                            let valuesLength = info.fieldValues.filter(it => it.checked).length;
                            if (valuesLength < info.minOptions) return true;
                            if (valuesLength > info.maxOptions) return true;
                        }
                    }
                    return info.type == "MANDATORY" && value == "";
                });
                if (!isEmpty(invalidInfo)) {
                    let msg = `${invalidInfo[0].name} of participant ${no}`;
                    if (invalidInfo.type == "MANDATORY" && invalidInfo.fieldType == "OPTION") {
                        if (invalidInfo.optionType == "CHECKBOX" || invalidInfo.optionType == "RADIO") {
                            let valuesLength = invalidInfo.fieldValues.filter(it => it.checked).length;
                            if (valuesLength < invalidInfo.minOptions) {
                                msg = `${msg} min. of ${invalidInfo.minOptions} selection`;
                            }
                            if (valuesLength > invalidInfo.maxOptions) {
                                msg = `${msg}: max. of ${invalidInfo.minOptions} selection`;
                            }
                        }
                    }
                    foundInvalid.push({index: i, message: `${msg} is required!`});
                }
                if(this.eventDetails.isRequiredEmergencyContact){
                    if(isEmpty(p.emergencyContactName)) {
                        foundInvalid.push({index: i, message:`Emergency contact name of participant ${no} is required!`});
                    }
                    if(isEmpty(p.emergencyContactPhone)) {
                        foundInvalid.push({index: i, message:`Emergency contact number of participant ${no} is required!`});
                    }
                    if(!this.isValidPhone(p.emergencyContactPhone)) {
                        foundInvalid.push({index: i, message:`Please input a valid emergency contact number of participant ${no}`});
                    }
                    if(isEmpty(p.emergencyContactRelation)) {
                        foundInvalid.push({index: i, message:`Relation to emergency contact of participant ${no} is required!`});
                    }
                }
			});
			if(!isEmpty(foundInvalid)) {
                this.participantIndex = foundInvalid[0].index;
                return callback({success: false, message: foundInvalid[0].message});
            }
            if(!this.dataPrivacyAgreement) {
                return callback({success: false, message: "Please check Terms and Conditions and Privacy Policy!"});
            }
            return callback(res);
        },
        async confirmBooking(){
            if(this.bookNum) return;
            if(this.isApplyingPromo) return;
            this.validateBooking((res) => {
                if(res.success) return this.bookNow();
                this.showNotification("alert", "error_outline", res.message);
            });
        },
        toggleAgree(){
            this.dataPrivacyAgreement = !this.dataPrivacyAgreement;
        },
        togglePrivacy(){
            this.morePrivacy = !this.morePrivacy;
        },
        removeDiscount(disc){
            if (isEmpty(disc)) return;
            if (disc.voucher) return this.removeVoucher(disc);
            let reason = disc.reason.split(' ');
            let code = !isEmpty(reason) ? reason[reason.length - 1] : "";
            let promoCodes = this.$store.getters.getPromoCodes;
            promoCodes = promoCodes.filter((it) => { return it != code });
            this.$store.dispatch("setPromoCodes", promoCodes);

            this.executePromo();
        },
        removeVoucher(disc) {
            let voucher = this.$store.getters.getAppliedVouchers.find((it) => { return it.id == disc.voucher });
            if (!voucher) voucher = this.$store.getters.getAppliedCashVouchers.find((it) => { return it.id == disc.voucher });
            if (!voucher) return;

            voucher.isCashVoucher = voucher.promotion.publishType ? false : true;
            
            if (voucher.isCashVoucher) {
                this.$store.dispatch('removeAppliedCashVoucher', voucher.id);
            } else {
                this.$store.dispatch('removeAppliedVoucher', voucher.id);
            }
            let self = this;
            let booking = self.generateBooking();
            this.checkoutEvent({
                booking: booking
            }, true, (res) => {
                if (res.success) {
                    self.discounts = res.order.discounts;
                    self.totalAmount = res.order.total;
                    
                    booking = self.generateBooking();
                    self.$store.dispatch("clearBooking");
                    self.$store.dispatch("addToBooking", booking);
                    if(!self.isDesktop) self.showSummary = true;
                    self.showNotification("success", "error_outline", `Voucher has been removed!`);
                    return;
                }
                if (voucher.isCashVoucher) {
                    self.$store.dispatch('addAppliedCashVouchers', voucher);
                } else {
                    self.$store.dispatch('addAppliedCashVouchers', voucher);
                }
                if (res.promoCodes) {
                    res.message = res.promoCodes.map((prm) => {
                        return `${prm.message} : ${prm.code}`;
                    }).join('. ');
                }
                self.showNotification("alert", "error_outline", `Something went wrong! ${res.message}`);
            });
        },
        executePromo(){
            let self = this;
            if (!this.isLoggedIn()) {
                let promoCodes = self.$store.getters.getPromoCodes;
                let xpromoCodes = promoCodes.filter((code) => { return code != self.promoCode });
                self.$store.dispatch("setPromoCodes", xpromoCodes);
                return this.$router.push({
                    path: '/login',
                    query: {
                        redirect: `/booking/${this.$route.params.eventId}`
                    }
                });
            }
            let booking = this.generateBooking();
            let request = {
                booking: booking
            }
            this.checkoutEvent(request, true, (res) => {
                self.isApplyingPromo = false;
                let promoCodes = self.$store.getters.getPromoCodes;
                if(!res.success) {
                    let xpromoCodes = promoCodes.filter((code) => { return code != self.promoCode });
                    self.$store.dispatch("setPromoCodes", xpromoCodes);
                    return self.showNotification("alert", "error_outline", `Something went wrong! ${res.message}`);
                }
                if(!isEmpty(res.order)){
                    self.discounts = res.order.discounts;
                    self.totalAmount = res.order.total;
                }
                booking = self.generateBooking();
                self.$store.dispatch("clearBooking");
                self.$store.dispatch("addToBooking", booking);
                if(!self.isDesktop) self.showSummary = true;
            });
        }
    },
	async created() {
		try {
            let self = this;
            this.isDesktop = window.innerWidth >= 672;
			this.loading = true;
            await this.refreshMainData(true);
            if(!isEmpty(this.$route.params)) {
                this.eventId = this.$route.params.eventId;
                return this.getEventDetails();
            }
			this.loading = false;
            window.addEventListener("resize",  () => {
                self.isDesktop = window.innerWidth >= 672;
                if(self.isDesktop) self.showSummary = true;
            });
		} catch (error) {
			this.loading = false;
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

        .back-btn {
            //color: $white;
            color: $primary-color-60;
            cursor: pointer;
            font-size: 1.2em;
        }

        .more {
            color: $primary-color-60;
            cursor: pointer;
            font-size: 1.2em;
        }

        h1 {
            flex: 3;
            color: $secondary-color-90;
            font-size: 1.2em;
        }
    }
    .container {
        width: 100%;
        height: 100%;
        padding: 0;
        display: flex;
        flex-direction: column;
        text-align: left;

        .event-title-desktop {
            padding: 48px;
            padding-bottom: 0px;
            font-weight: bold;
            font-size: 28px;
            line-height: 1.4;
            font-family: 'Akzidenz Grotesk Super';
        }

        .event-content {
            padding: 24px;
            width: 100%;
            flex: 3;

            .event-title {
                font-weight: bold;
                font-size: 28px;
                line-height: 1.4;
                font-family: 'Akzidenz Grotesk Super';

                & + * {
                    margin-top: 30px;
                }

                & + .event-note {
                    margin-top: 12px;

                    & + * {
                        margin-top: 30px;
                    }
                }
            }

            .sess-name {
                font-weight: bold;
                color: $primary-color-60;
                margin-top: 24px;
                display: block;
            }

            .event-label {
                font-weight: bold;
                font-size: 1em;

                & + .event-label {
                    margin-top: 30px;
                }
                & + .event-note {
                    margin-top: 10px;
                }
            }

            .event-note {
                font-size: 1em;

                &.btn {
                    cursor: pointer;
                }

                .see-more {
                    margin-top: 4px;
                    color: $primary-color-60;
                    cursor: pointer;
                }
            }

            .event-footnote {
                font-size: 0.8em;
                color: $secondary-color-50;

                & + .footnote {
                    margin-top: 8px;
                }
            }

            .blue {
                color: #91A7FF !important;
            }

            .event-buttons-desktop {
                display: flex;
                gap: 24px;
                align-items: center;
            }

            .event-buttons {
                width: fit-content;
                margin: 24px auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: $primary-color-10;
                border-radius: 12px;
                padding: 4px 12px;
                cursor: pointer;
                gap: 24px;

                .btn-min {
                    color: $secondary-color-70;
                }
                .num {
                    font-weight: bold;
                }
                .btn-plus {
                    color: $primary-color-70;
                }
            }

            .event-content-left {
                .event-buttons {
                    display: none;
                }
            }
        }

        .actions {
            width: 100%;
            display: flex;
            align-items: center;
            padding: 12px 0;
            gap: 24px;

            .action-button {
                flex: 1;
                border-radius: 12px;
                background: $primary-color-60;
                border: 1px solid $primary-color-60;
                padding: 8px;
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

        .modal {
            padding: 24px;
            width: 100%;

            .event-overlay {
                display: none;
            }
            .modal-header {
                display: none;
            }

            &.bordered {
                padding-top: 16px;
                border-top: 1px solid $secondary-color-10;
            }
            &.float-right {
                position: relative;
                .note {
                    display: flex;
                    align-items: center;
                    float: right;
                    font-weight: bold;
                    cursor: pointer;
                    padding-top: 12px;
                }
            }
            &.show-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                padding: 0;
                display: flex;
                flex-direction: column;

                .modal-overlay {
                    display: block;
                    flex: 3;
                    background: $secondary-color-50;
                    opacity: 0.3;
                }
                .modal-dialog {
                    width: 100%;
                    border-radius: 12px 12px 0 0;
                    background: $white;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    transition: all 0.15s ease-in-out;
                }
                .modal-header {
                    display: flex;
                    padding: 24px;
                    font-weight: bold;
                    font-size: 1.5em;
                    border-bottom: 1px solid $secondary-color-10;
                }
                .modal-content {
                    padding: 24px;
                    background: $white;

                    .modal-row {
                        width: 100%;
                        display: flex;
                        gap: 24px;
                        align-items: center;
                        justify-content: space-between;
                        padding: 12px 0;
                        border-bottom: 1px solid $secondary-color-10;

                        .row-title {
                            font-weight: bold;
                            font-size: 1.1em;
                        }

                        .row-note {
                            color: $secondary-color-50;
                            font-weight: bold;
                        }
                        .row-icon {
                            cursor: pointer;
                            color: $primary-color-50;
                        }
                    }
                }
            }
        }

        .map-icon {
            font-size: 1em;
            color: $primary-color-50;
        }
        .participants {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 16px;
            border: 1px solid $secondary-color-20;
            max-width: 600px;

            & + * {
                padding-top: 24px;
            }

            .participant {
                width: 100%;
                display: none;

                &.active {
                    display: block;
                }

                &__tabs {
                    width: 100%;
                    overflow: hidden;
                    overflow-x: auto;
                    gap: 24px;
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    position: relative;
                    border-bottom: 1px solid $secondary-color-20;
                }
                &__tab {
                    white-space: nowrap;
                    width: fit-content;
                    color: $secondary-color-60;
                    position: relative;
                    cursor: pointer;

                    &.active {
                        color: $primary-color-60;

                        &::before {
                            content: "";
                            width: 100%;
                            height: 2px;
                            position: absolute;
                            bottom: -17px;
                            left: 0;
                            right: 0;
                            background: $primary-color-60;
                        }
                    }
                }

                &__content {
                    padding: 16px;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                &__form-input {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;

                    &.disabled {
                        //pointer-events: none;

                        input{
                            background: $secondary-color-10;
                        }
                    }
                }

                &__label {
                    font-weight: 400;

                    .required {
                        padding: 0 4px;
                        color: $primary-color-60;
                    }
                }
                &__input {
                    width: 100%;

                    input {
                        border-radius: 6px;
                        border: 1px solid $secondary-color-20;
                        padding: 8px 16px;
                        outline: none;
                        width: 100%;

                        &:focus {
                            border: 1px solid $secondary-color-40;
                        }
                    }

                    textarea {
                        border-radius: 6px;
                        row: 3;
                        border: 1px solid $secondary-color-20;
                        padding: 8px 16px;
                        outline: none;
                        width: 100%;

                        &:focus {
                            border: 1px solid $secondary-color-40;
                        }
                    }
                }
            }
        }
        .link {
            color: $link-blue-color;
            cursor: pointer;

            &.no-underlined {
                text-decoration: none;
            }
            &.red {
                color: $primary-color-60;
            }
        }
        .agreement {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 16px;

            &__wrapper {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            &__content {
                display: flex;
                flex-direction: column;
                gap: 8px;
                font-size: 0.95em;
                color: $secondary-color-80;

                .justify {
                    text-align: justify;
                }
            }
        }
        .checkbox-custom {
            display: flex;
            gap: 8px;
            align-items: flex-start;
            cursor: pointer;

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
        .event-summary {
            display: flex;
            flex-direction: column;
            gap: 16px;
            border-radius: 12px;
            border: 1px solid $secondary-color-20;

            &__header {
                padding: 16px;
                font-weight: bold;
                border-bottom: 1px solid $secondary-color-20;
            }
            &__body {
                padding: 0 16px;

                .event-summary-row {
                    width: 100%;
                    display: flex;
                    gap: 24px;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid $secondary-color-10;

                    .row-title {
                        font-weight: bold;
                        font-size: 1.1em;
                        &.custom-voucher {
                            font-size: 1em !important;
                            color: $success-green;
                        }
                    }

                    .row-note {
                        color: $secondary-color-50;
                        font-weight: bold;
                    }
                    .row-icon {
                        cursor: pointer;
                        color: $primary-color-50;
                    }
                }
                .event-extracharge-row {
                    padding: 8px 0;
                    display: flex;
                    flex-direction: column;
                    .extracharge-head {
                        font-size: 0.7em;
                        color: $secondary-color-60;
                    }
                    .extracharge-body {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        font-size: 0.8em;
                        padding: 4px 0;
                        color: $secondary-color-60;
                        .extracharge-title {
                            font-weight: bold;
                        }
                        .extracharge-amount {
                            font-weight: bold;
                            white-space: nowrap;
                        }
                    }
                }
            }
            &__footer {
                padding: 0 16px;
            }
        }
    }
    @media(min-width: 672px){
        .container {
            .event-content {
                padding: 24px 7% !important;
                display: flex;
                flex-direction: row;
                gap: 24px;

                .boxes {
                    flex-wrap: wrap;
                    width: 100% !important;
                }

                .event-title {
                    display: none;
                }

                .event-buttons-desktop {
                    .desktop-label {
                        font-weight: bold;
                    }
                }

                .event-content-left {
                    flex: 3;

                    .event-buttons {
                        display: flex !important;
                        align-items: center;
                        justify-content: space-between;
                        margin: 0 !important;
                    }
                }

                .event-content-right {
                    flex: 2;

                    .event-buttons {
                        display: none;
                    }
                }
            }
            .event-title-desktop {
                padding: 48px 7% !important;
            }
            .modal {
                display: none;
            }
        }
    }
    @media(max-width: 672px){
        .event-title-desktop {
            display: none !important;
        }
        .event-buttons-desktop{
            display: none !important;
        }
        .event-summary {
            display: none;
        }
    }
    .promo-con {
        margin: 12px 0;
        width: 100%;
        background: $secondary-color-10;
        border: 1px solid $secondary-color-20;
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 6px 12px;

        input {
            border: none;
            outline: none;
            flex: 3;
            background: transparent;
            font-size: 1.3em;
        }
        .promo-btn {
            cursor: pointer;
            border-radius: 12px;
            padding: 12px 24px;
            background: $white;
            border: 1px solid $secondary-color-20;
        }
    }
</style>