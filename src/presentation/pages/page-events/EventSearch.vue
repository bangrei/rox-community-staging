<template>
	<layout-variant-two :show-loading-screen="loading">
        <template v-slot:header>
			<div class="slide-down">
				<div class="header-con">
					<div class="back-btn" @click="goBack">
                        <span class="material-icons">arrow_back</span>
                    </div>
					<h1 class="heading-5 center" v-if="searchKey">Search "{{searchKey}}"</h1>
                    <h1 class="heading-5 center" v-if="!searchKey">Events</h1>
					<div class="more right"></div>
				</div>
			</div>
		</template>
		<template v-slot:body>
            <div class="events-content">
                <div class="container">
                    <div class="cards">
                        <div class="card" 
                            v-for="(event, i) in events" 
                            @click="getEventDetails(event)"
                            :key="i">
                            <div class="card-img">
                                <img v-if="event.image" alt="rox event" :src="getImage(event.image)"/>
                            </div>
                            <div class="card-content">
                                <div class="card-subtitle">{{ convertDate(event.startDate) }}</div>
                                <div class="card-title">{{ event.name }}</div>
                                <div class="card-note">{{ eventPlace(event) }}</div>
                                <div class="card-footnote">
                                    <span class="material-icons">emoji_people</span> 
                                    <span>{{ event.maxSpot - event.spotLeft }} sign up</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="no-match" v-if="isEmpty(events)">No events found..</div>
                </div>
            </div>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import { eventService } from "@/bloc/services";
import moment from 'moment-timezone';

export default {
	name: "EventSearch",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
	},
	data() {
		return {
			customer: {},
			loading: false,
            searchKey: "",
            events: [],
		};
	},
	watch: {},
	computed: {},
	methods: {
		async setEventDetails() {
            this.loading = true;
            await this.refreshMainData(true);
			this.customer = this.$store.getters.getCustomer;
            this.events = [];
            let json = await eventService.getEvents();
            this.loading = false;
            if(!isEmpty(json) && !isEmpty(json.events)){
                let momente = moment();
                let today = moment.tz(momente, "Asia/Singapore").format('x');
                let events = json.events.filter((it) => {
                    return it.status == "ACTIVE" && it.endDate > today && !isEmpty(it.sessions);
                });
                if(!isEmpty(events)){
                    events.sort((a,b) => { return a.startDate - b.startDate });
                    let filter = [];
                    events.forEach((it) => {
                        let categories = it.categories;
                        let sessions = [];
                        it.sessions.forEach((s) => {
                            let ids = sessions.map((it) => { return it.sessionId });
                            s.eventId = it.id;
                            s.eventName = it.name;
                            s.categories = categories;
                            if(ids.indexOf(s.sessionId) == -1) sessions.push(s);
                        });
                        if(isEmpty(this.searchKey)) {
                            filter = [...sessions];
                            return;
                        }
                        let key = this.searchKey.toLowerCase();
                        filter = [
                            ...filter, 
                            ...sessions.filter((s) => {
                                let foundEvent = s.eventName ? s.eventName.toLowerCase().indexOf(key) > -1 : false;
                                let foundSession = s.name ? s.name.toLowerCase().indexOf(key) > -1 : false;
                                return foundEvent || foundSession;
                            })
                        ];
                    });
                    this.events = filter;
                }
            }
		},
        eventPlace(event){
            return event.location.string;
        },
        getImage(image){
            if(!image) return "";
            return this.$store.getters.cloudinaryURL + "" + image;
        },
        convertDate(date){
            if(!date) return "";
            return moment.tz(date, 'Asia/Singapore').format("ddd, DD MMM YYYY HH:mm");
        },
        getEventDetails(event){
            let cat = !isEmpty(event.categories) ? event.categories[0] : "-"
            this.$router.push({
                name: "EventDetails",
                params: {
                    eventId: event.eventId,
                    category: cat,
                    eventName: event.name,
                },
            });
        }
	},
	async created() {
		try {
            if(!isEmpty(this.$route.params)) {
                this.searchKey = this.$route.params.eventName;
                if(this.searchKey == 'null') this.searchKey = '';
            }
			this.setEventDetails();
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
    margin-bottom: 24px;

    .back-btn {
        color: $primary-color-60;
        cursor: pointer;
        font-size: 1.2em;
    }

	h1 {
        flex: 1;
        font-size: 1.2em;
	}
}
.events-content {
    width: 100%;
    height: 100%;
    display: block;
    position: relative;

    .no-match {
        padding: 24px;
        text-align: center;
    }

    .container {
        width: 100%;
        height: 100%;
        text-align: left;
        display: block;
        background: $white;
        
        .cards {
            display: flex;
            flex-direction: column;
            gap: 24px;
            width: 100%;
            position: relative;
            padding: 24px;

            .card {
                display: flex;
                border-radius: 5px;
                background: $white;
                min-width: 200px;
                overflow: hidden;
                cursor: pointer;

                .card-img {
                    flex: 1;
                    height: 100px;
                    border-radius: 8px;
                    overflow: hidden;
                    background: $secondary-color-20;
                    -webkit-box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
                    -moz-box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
                    -o-box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
                    box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }

                .card-content {
                    flex: 2;
                    padding: 0 16px;
                    color: $secondary-color-90;

                    .card-subtitle {
                        color: $primary-color-70;
                        font-size: 0.8em;
                    }

                    .card-title {
                        font-weight: bold;
                        color: $secondary-color-100;
                    }
                    .card-desc {
                        color: $secondary-color-90;
                        font-size: 0.9em;
                    }
                    .card-note {
                        font-size: 0.8em;
                        color: $secondary-color-50;
                        white-space: nowrap;
                        display: block;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .card-footnote {
                        font-size: 0.7em;
                        color: $secondary-color-90;
                        display: flex;
                        align-items: center;

                        .material-icons {
                            font-size: 1.4em;
                        }

                        * + * {
                            margin-left: 4px;
                        }
                    }
                }

                & + .card {
                    padding-top: 16px;
                    border-top: 1px solid $secondary-color-10;
                }
            }
        }
    }
}
</style>