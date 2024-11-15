<template>
	<div class="sd-base-con" :class="{'blur-con': showLoadingScreen}">
		<div class="notification__con">
			<base-notification
				:class="{ active: notification.show }"
			></base-notification>
		</div>
		<div class="sd-header" :class="{'with-logo': showMainLogo}">
			<div class="sd-header-logo-con" v-if="showMainLogo">
				<img v-lazyload
					width="35"
					height="35"
					alt="rxc logo"
					:data-url="require('@/assets/images/rox-logo-new.png')"
				/>
			</div>
			<slot name="header"></slot>
		</div>
		<div
			class="sd-main-con"
			:class="{'overflow-hidden': overflowHidden == true,'has-footer-slot': hasFooterSlot, 'auto-height': autoHeight, 'hide-footer': hideFooter, 'hide-footnote': hideFootNote}"
		>
			<div class="sd-main-body">
				<slot name="body"></slot>
			</div>
			<div class="body-footnote" v-if="!hideFootNote" :class="{'invisible': showLoadingScreen}">
				<span>&copy; {{ thisYear }} R.O.X. Community</span>
				<div class="footnote-tnc">
					<span class="tnc-item" @click="goFAQ">Terms of Use</span>
					<span class="tnc-item" @click="goFAQ">Privacy Policy</span>
				</div>
			</div>
		</div>
		<div class="sd-footer" :class="{'auto': freeFooter, 'hidden': hideFooter, 'footer-white': footerWhite}" v-if="hasFooterSlot">
			<slot name="footer"></slot>
		</div>
	</div>
	<div class="sd-base-loading-con" v-if="showLoadingScreen">
		<div class="sd-loading-con">
			<div class="dot-overtaking"></div>
			<p class="body-2-regular bold loading-text secondary-color-60">
				Loading ...
			</p>
		</div>
	</div>
</template>

<script>
import router from "@/router";
import { computed } from "vue";
import { useStore } from "vuex";

export default {
	name: "LayoutVariantTwo",
	props: {
		showLoadingScreen: {
			type: Boolean,
			default: false,
		},
		showMainLogo: {
			type: Boolean,
			default: false
		},
		overflowHidden: {
			type: Boolean,
			default: false,
		},
		freeFooter: {
			type: Boolean,
			default: false,
		},
		hideFooter: {
			type: Boolean,
			default: false,
		},
		footerWhite: {
			type: Boolean,
			default: false,
		},
		autoHeight: {
			type: Boolean,
			default: false,
		},
		hideFootNote: {
			type: Boolean,
			default: false
		}
	},
	setup(props, context) {
		const store = useStore();
		const notification = computed(() => store.state.notification);
		const hasHeaderSlot = computed(() => !!context.slots.header);
		const hasFooterSlot = computed(() => !!context.slots.footer);
		const thisYear = computed(() => {
			const date = new Date();
			return date.getFullYear();
		})
		const goFAQ = () => router.push({ name: 'FAQ' });

		return {
			store,
			notification,
			hasHeaderSlot,
			hasFooterSlot,
			thisYear,
			goFAQ,
		};
	},
};
</script>

<style scoped lang="scss">
.sd-base-con {
	&.blur-con {
		filter: blur(2px);
		-webkit-filter: blur(2px);
		-moz-filter: blur(2px);
		-o-filter: blur(2px);
	}
}
.sd-header {
	width: 100%;

	&.with-logo {
		position: relative;
		margin-top: -36px;
	}

	.sd-header-logo-con {
		position: relative;
		width: fit-content;
		left: 0;
		right: 0;
		margin: 0 auto;
		z-index: 99999;
		top: 48px;
		pointer-events: none;
	}
}
.sd-main-con {
	height: 100%;
	width: 100%;
	position: relative;
	display: flex;
	flex-direction: column;
	flex: 3;

	&.overflow-hidden {
		overflow: hidden;
	}
	&.auto-height {
		height: auto !important;
	}
	&.has-footer-slot {
		&:not(.hide-footer) {
			height: auto !important;
			padding-bottom: 56px;
		}
	}
	&.hide-footnote {
		height: 100% !important;
	}
}

.sd-main-body {
	width: 100%;
	flex: 3;
}

.body-footnote {
	background: $primary-color-90;
	padding: 24px;
	color: $white;
	display: flex;
	flex-direction: column-reverse;
	width: 100%;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	margin-top: auto;
	&.invisible {
		display: none !important;
	}
	.footnote-tnc {
		display: flex;
		gap: 48px;
		align-items: center;
		.tnc-item {
			font-weight: bold;
			color: $primary-color-50;
			&:hover {
				cursor: pointer;
				color: $white;
			}
		}
	}
}

.sd-footer {
	width: 100%;
	height: 62px;
	position: fixed;
	background-color: $primary-color-10;
	bottom: 0;

	&.footer-white {
		background-color: $white !important;
		border-top: 1px solid $primary-color-10;
	}

	&.auto {
		height: auto !important;
	}
	&.hidden {
		display: none;
		height: 0 !important;
	}
}

.notification__con {
	min-width: 288px;
	position: fixed;
	left: 50%;
	top: 56px;
	transform: translateX(-50%);
	z-index: 100000;
	pointer-events: none;
	width: 100%;

	.notification {
		width: 100%;
		margin: 0 auto;
		opacity: 0;
		transition: all 0.5s;

		&.active {
			opacity: 100%;
		}
	}
}
.sd-base-loading-con {
	position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

	.sd-loading-con {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		.loading-text {
			margin-top: 40px;
		}
	}
}

.dot-overtaking {
	position: relative;
	width: 12px;
	height: 12px;
	border-radius: 6px;
	background-color: transparent;
	color: $primary-color-70;
	margin: -1px 0;
	box-shadow: 0 -20px 0 0;
	animation: dotOvertaking 2s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);
}

.dot-overtaking::before,
.dot-overtaking::after {
	content: "";
	display: inline-block;
	position: absolute;
	top: 0;
	left: 0;
	width: 12px;
	height: 12px;
	border-radius: 6px;
	background-color: transparent;
	color: $primary-color-60;
	box-shadow: 0 -20px 0 0;
}

.dot-overtaking::after {
	color: $primary-color-50;
}

.dot-overtaking::before {
	animation: dotOvertaking 2s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);
	animation-delay: 0.3s;
}

.dot-overtaking::after {
	animation: dotOvertaking 1.5s infinite cubic-bezier(0.2, 0.6, 0.8, 0.2);
	animation-delay: 0.6s;
}

@keyframes dotOvertaking {
	0% {
		transform: rotateZ(0deg);
	}
	100% {
		transform: rotateZ(360deg);
	}
}

@media (min-width: 672px) {
	.sd-main-con,
	.sd-header,
	.notification__con,
	.sd-footer {
		max-width: 100%;
	}
	.sd-main-con {
		height: 100%;
		&.has-footer-slot {
			&:not(.hide-footer) {
				height: auto !important;
				padding-bottom: 0px !important;
			}
		}
	}
	.body-footnote {
		flex-direction: row;
		padding: 24px 7% !important;
		.footnote-tnc {
			gap: 24px;
		}
	}

	.sd-footer {
		display: none;
	}
}
</style>
