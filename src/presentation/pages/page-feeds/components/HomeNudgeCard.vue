<template>
	<div
		class="nudge-card hide-nudge"
		ref="animateNudge"
		:class="nudge.image ? 'with-image' : 'bg-1'"
		@click="nudgeClicked(nudge)"
	>	
		<img v-if="nudge.image" :src="nudge.image" :class="{'aligned': aligned}">
		<div class="nudge-card-header-con">
			<base-badge
				:badgeLabel="getFormattedNudgeStatus(nudge)"
				:class="{
					'sd-badge-alert-light': nudge.status == 'NOT_READ',
					'sd-badge-success-light': nudge.status == 'READ',
				}"
				class="sd-badge-rounded sd-badge-sm nudge-status"
			/>

			<div class="nudge-card-point-con" v-if="hasEligiblePoints(nudge)">
				<base-icon
					class="sd-icon-btn-md sd-icon-btn-ghost"
					iconName="add"
					iconSize="md"
				></base-icon>
				<div class="nudge-card-point-child-con">
					<span class="nudge-card-point">
						{{ nudge.type == "QUESTIONNAIRE" ? nudge.completionPoints : nudge.readingPoints }}
					</span>
					<base-icon
						class="sd-icon-btn-md sd-icon-btn-ghost"
						iconName="star"
						iconSize="md"
					>
					</base-icon>
				</div>
			</div>
		</div>
		<div
			class="nudge-card-footer-con"
			:class="
				nudge.image
					? 'with-image'
					: nudge.backgroundId
					? `bg-${nudge.backgroundId}`
					: 'bg-1'
			"
		>
			<div class="footer-desc-con">
				<p class="body-1-normal bold">{{ nudge.name }}</p>
				<p class="footer-desc body-2-normal regular">
					{{
						nudge.type === "SURPRISE"
							? "Click here to see what we got for you"
							: descriptionDisplay
					}}
				</p>
			</div>
			<base-icon
				v-if="!nudge.image"
				class="sd-icon-btn-md sd-icon-btn-ghost"
				:iconName="getNudgeIconName(nudge.type)"
				iconSize="xlg"
			></base-icon>
		</div>
	</div>
</template>

<script>
import { homeService } from "@/bloc/services";
import { startCase, toLower } from "lodash";
export default {
	props: {
		nudge: {
			type: Object,
			default: () => {},
		},
		aligned: {
			type: Boolean,
			default: false,
		}
	},
	computed: {
		descriptionDisplay() {
			if (!this.nudge.description) return "";
			return this.nudge.description.split("<br/>").join("\n");
		},
	},
	methods: {
		hasEligiblePoints(nudge) {
			let points = nudge.type == "QUESTIONNAIRE" ? nudge.completionPoints : nudge.readingPoints;
			return nudge.status != 'READ' && points > 0;
		},
		setNudgesAnimation() {
			// show/hide nudge (only on mounted hook);

			this.$nextTick(() => {
				const observer = new IntersectionObserver((entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							entry.target.classList.add("show-nudge");
						}
					});
				});

				let element = this.$refs.animateNudge;
				observer.observe(element);
			});
		},
		nudgeClicked(nudge) {
			this.$emit("nudge-clicked", nudge);
		},
		getNudgeIconName(nudgeType) {
			return homeService.getNudgeIconName(nudgeType);
		},
		getFormattedNudgeStatus(nudge) {
			let status = nudge.status;
			if (nudge.state == "CLAIMED") status = nudge.state;
			return startCase(toLower(status));
		},
	},
	mounted() {
		this.setNudgesAnimation();

		const resize = () => {
			if (this.aligned) {
				let target = this.$refs.animateNudge;
				if (!target) return;
				let w = target.clientWidth;
				target.style['height'] = `${w}px`;
			}
		}
		resize();
		window.addEventListener('resize', () => {
			resize();
		});
	},
};
</script>

<style scoped lang="scss">
	.nudge-card {
		border-radius: 12px;
		padding: 16px;
		background-size: cover;
		position: relative;
		cursor: pointer;
		min-height: 180px;
		height: fit-content;

		&.with-image {
			width: 100%;
			padding: 0;
			overflow: hidden;

			img {
				width: 100%;
				&.aligned {
					height: 100%;
					object-fit: cover;
				}
			}

			.nudge-card-header-con {
				position: absolute;
				top: 16px;
				left: 16px;
				right: 16px;
			}
		}

		&.bg-1 {
			background-color: $custom-blue-color;
		}

		&.bg-2 {
			background-color: $custom-yellow-color;
		}

		&.bg-3 {
			background-color: $primary-color-30;
		}
	}
	.nudge-card-header-con {
		display: flex;
		justify-content: space-between;
		height: 24px;
	}
	.nudge-card-point-con {
		background-color: $primary-color-10;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-radius: 32px;
	}

	.nudge-card-point-child-con {
		display: flex;
		align-items: center;
	}

	.nudge-card-point {
		margin-right: -12px;
		color: $primary-color-60;
	}

	.nudge-card-footer-con {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 16px;
		text-align: left;
		max-height: 92px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;

		.footer-desc-con {
			display: flex;
			flex-direction: column;
			justify-content: flex-end;
			overflow: hidden;

			p {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		.footer-desc {
			margin-top: 6px;
		}

		&.bg-1 {
			color: $white;

			.sd-icon-btn {
				color: $white;
			}
		}

		&.bg-2,
		&.bg-3 {
			.sd-icon-btn {
				color: $secondary-color-100;
			}
		}

		&.with-image {
			color: $white;
			background: linear-gradient(
				180deg,
				rgba(15, 23, 42, 0) -9.29%,
				#0f172a 100%
			);
			backdrop-filter: blur(4px);
			border-radius: 0px 0px 12px 12px;
		}
	}

	.hide-nudge {
		opacity: 0;
		transition: all 0.5s ease-in-out;
	}

	.show-nudge {
		opacity: 1;
	}
</style>
