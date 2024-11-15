<template>
    <div class="cards">
        <div class="card" 
            v-for="(ev, i) in filteredEvents" 
            :key="i">
            <div class="card-img" :class="{'custom-carousel': ev.banners.length > 1}">
                <img @click="clickEventDetails(ev)" v-if="ev.banners.length == 1" alt="rox event" :src="getImage(ev.banners[0].id)"/>
                <event-carousel className="square"
                    v-if="ev.banners.length > 1"
                    :banners="ev.banners"
                />
            </div>
            <div class="card-content" @click="clickEventDetails(ev)">
                <div class="card-subtitle">{{ ev.startDisplay }}</div>
                <div class="card-title">{{ ev.name }}</div>
                <div class="card-note">{{ ev.place }}</div>
                <div class="card-price">{{ currency(ev.price) }}</div>
                <!-- <div class="card-desc">{{ ev.description }}</div> -->
                <div class="card-footnote blue">
                    <span class="material-icons">emoji_people</span> 
                    <span v-if="getRegisteredSession(ev) > 0">{{ getRegisteredSession(ev) }} sign up</span>
                    <span v-else-if="isEmpty(ev.sessions)">coming soon</span>
                    <span v-else>{{ ev.spotLeft }} spots available</span>
                </div>
                <div class="rating-legend" v-if="ev.ratingData">
                    <div class="rating-star material-icons">star</div>
                    <div class="rating-points">{{ ev.ratingData?.ratingPoints }}</div>
                    <span class="rating-total-reviewers">from {{ ev.ratingData?.reviewsList.length }} reviews</span>
                </div>
            </div>
        </div>
        <div class="card" 
            v-if="showMoreEvents"
            @click="gotoResult(false)">
            <div class="card-img"></div>
            <div class="card-content">
                <div class="card-more-title">View More</div>
            </div>
        </div>
    </div>
</template>

<script>
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import EventCarousel from './EventCarousel.vue';
export default {
    mixins: [utility],
    components: {
        EventCarousel,
    },
    props: {
        events: {
            type: Array,
            default: () => []
        },
        selectedCategory: {
            type: String,
            default: "",
        },
        showMoreEvents: {
            type: Boolean,
            default: false,
        },
        emitEvent: {
            type: Boolean,
            default: false,
        }
    },
    data() {
		return {
            isDesktop: false,
            filteredEvents: [],
		};
    },
    computed: {},
    methods: {
        gotoResult(res){
            if(!res) {
                return this.$router.push({
                    name: "EventsView"
                });
            }
            this.$router.push({
                name: "EventSearch",
                params: {
                    eventName: res
                },
            });
        },
        getRegisteredSession(event){
            if(isEmpty(event.sessions)) return 0;
            let reg = 0;
            event.sessions.forEach((s) => {
                reg += (s.maxSpot - s.spotLeft)
            });
            return reg;
        },
        clickEventDetails(event) {
            if (this.emitEvent) {
                return this.$emit('event-clicked', event);
            }
            this.$router.push({
                name: "EventDetails",
                params: {
                    eventId: event.id,
                    category: this.selectedCategory,
                    eventName: event.name,
                },
            });
        },
        async initEvents(events) {
            if (!isEmpty(events)) {
                events = events.map((it) => {
                    it.banners.map((banner) => {
                        banner.image = this.getImage(banner.id);
                        return banner;
                    });
                    it.banners.sort((a, b) => { return a.sortIndex - b.sortIndex });
                    return it;
                });
            }
            this.filteredEvents = events;
            if (this.filteredEvents.length > 0) {
                this.filteredEvents.forEach(async (ev) => {
                    let ratingData = await this.retrieveReviewRatings(ev.id);
                    ev.ratingData = ratingData;
                });
            }
        }
    },
    created() {
        this.initEvents(this.events);
    },
}
</script>

<style scoped lang="scss">
    .cards {
        display: flex;
        width: 100%;
        overflow-x: auto;
        position: relative;
        padding: 24px;

        .card {
            border-radius: 7px;
            background: $white;
            min-width: 200px;
            max-width: 200px;
            overflow: hidden;
            cursor: pointer;
            // border: 1px solid $secondary-color-20;
            -webkit-box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
            -moz-box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
            -o-box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
            box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);

            .card-img {
                width: 100%;
                height: 200px;
                background: $secondary-color-20;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }
            .card-content {
                padding: 16px;
                color: $secondary-color-90;
                display: flex;
                flex-direction: column;
                gap: 4px;

                .card-more-title {
                    color: $primary-color-50;
                    font-weight: bold;
                    text-align: center;
                }

                .card-subtitle {
                    color: $primary-color-50;
                    font-size: 10pt;
                    line-height: 14px;
                    font-weight: bold;
                    text-align: left;
                    text-transform: uppercase;
                }
                .card-title {
                    font-size: 14pt;
                    line-height: 22px;
                    font-weight: bold;
                    width: 100%;
                    display: block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    color: $secondary-color-100;
                    text-align: left;
                }
                .card-price {
                    font-weight: bold;
                    display: block;
                    width: 100%;
                    padding: 8px 0;
                    color: $secondary-color-90;
                    font-size: 12pt;
                    line-height: 16px;
                    text-align: left;
                }
                .card-desc {
                    color: $secondary-color-90;
                    font-size: 10pt;
                    line-height: 14px;
                    text-align: left;
                }
                .card-note {
                    font-size: 10pt;
                    line-height: 14px;
                    color: $secondary-color-50;
                    white-space: nowrap;
                    display: block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .card-footnote {
                    font-size: 10pt;
                    line-height: 14px;
                    color: $secondary-color-90;
                    display: flex;
                    align-items: center;
                    &.blue {
                        color: $info-light;
                    }

                    .material-icons {
                        font-size: 1.4em;
                    }

                    * + * {
                        margin-left: 4px;
                    }
                }
            }

            & + * {
                margin-left: 26px;
            }
        }
    }
    .rating-legend {
        display: flex;
        gap: 4px;
        padding: 6px 0;
        .rating-star {
            color:  $primary-color-60;
            font-size: 1.1em !important;
        }
        .rating-points {
            font-size: 1em;
            font-weight: bold;
            color: $primary-color-60;
        }
        .rating-total-reviewers {
            color: $secondary-color-50;
            padding: 0 6px;
            font-size: 0.9em;
        }
    }
    @media(min-width: 672px){
        .cards {
            padding: 24px 7% !important;
            .card {
                border-radius: 10px !important;
                min-width: 288px !important;
                max-width: 288px !important;
                .card-img {
                    height: 288px !important;
                }
                .card-content {
                    gap: 8px !important;
                    .card-title {
                        font-size: 16pt !important;
                        line-height: 24px !important;
                    }
                    .card-subtitle {
                        font-size: 12pt !important;
                        line-height: 16px !important;
                    }
                    .card-price {
                        font-size: 14pt !important;
                        line-height: 20px !important;
                    }
                    .card-desc {
                        font-size: 12pt !important;
                        line-height: 16px !important;
                    }
                    .card-note {
                        font-size: 12pt !important;
                        line-height: 16px !important;
                    }
                    .card-footnote {
                        font-size: 12pt !important;
                        line-height: 16px !important;
                        .material-icons {
                            font-size: 1.6em !important;
                        }
                    }
                }
            }
        }
    }
</style>
