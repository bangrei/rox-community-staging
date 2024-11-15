<script>
import BaseIcon from "./BaseIcon.vue";
import { h, Transition } from "vue";
export default {
	name: "BaseAccordion",
	props: {
		accordionTitle: {
			type: String,
			required: true,
		},
		accordionIcon: {
			type: String,
			default: "",
			required: false,
		},
	},
	data() {
		return {
			isClosed: false,
		};
	},

	methods: {
		toggleAccordion: function () {
			this.isClosed = !this.isClosed;
		},
	},

	computed: {
		isUsingIcon() {
			if (this.accordionIcon == "") {
				return false;
			} else return true;
		},

		togglerState() {
			if (this.isClosed) {
				return "remove";
			} else {
				return "add";
			}
		},

		computeHeaderClasses() {
			if (this.isUsingIcon) {
				return {
					header: "accordion__header",
					icon: "accordion__header__icon",
					title: "accordion__header__title--icon",
					toggle: "accordion__header__toggle",
				};
			}
			return {
				header: "accordion__header",
				icon: "accordion__header__icon material-icons",
				title: "accordion__header__title body-1-normal medium",
				toggle: "accordion__header__toggle",
			};
		},

		computeBodyClasses() {
			if (this.isUsingIcon && this.isClosed) {
				return {
					body: "accordion__body--icon accordion__body--icon--opened",
					slot: "accordion__body--icon__slot",
				};
			} else if (this.isUsingIcon && !this.isClosed) {
				return {
					body: "accordion__body--icon ",
					slot: "accordion__body--icon__slot",
				};
			} else if (!this.isUsingIcon && this.isClosed) {
				return {
					body: "accordion__body accordion__body--opened",
					slot: "accordion__body__slot",
				};
			} else {
				return {
					body: "accordion__body ",
					slot: "accordion__body__slot",
				};
			}
		},
	},

	render() {
		return h(
			"div",
			{
				class: "accordion",
			},
			[
				h("div", { class: "accordion__header" }, [
					h(
						"div",
						{ class: this.computeHeaderClasses.icon },
						h(
							"div",
							{
								class: "material-icons",
							},
							this.accordionIcon
						)
					),
					h(
						"div",
						{ class: this.computeHeaderClasses.title },
						this.accordionTitle
					),
					h(
						Transition,
						{
							name: "fade",
							mode: "out-in",
						},
						{
							default: () => {
								return h(BaseIcon, {
									class: "sd-icon-btn-md sd-icon-btn-ghost accordion__header__toggle",
									iconName: this.togglerState,
									iconSize: "lg",
									onClick: this.toggleAccordion,
									style: "padding: 16px",
								});
							},
						}
					),
				]),
				h(
					"div",
					{
						class: this.computeBodyClasses.body,
					},
					h(
						"div",
						{
							class: this.computeBodyClasses.slot,
						},
						this.$slots.default()
					)
				),
			]
		);
	},
};
</script>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.accordion {
	min-height: 56px;

	&__header {
		display: flex;
		border-bottom: 1px solid $secondary-color-10;

		&__icon {
			align-self: center;
		}

		&__title {
			font-weight: bold;
			padding: 16px 0;
			align-self: center;
			color: $secondary-color-90;
			flex-grow: 1;
			text-align: left;
		}

		&__title--icon {
			align-self: center;
			flex-grow: 1;
			text-align: left;
			margin-left: 18px;
		}

		&__toggle {
			grid-area: toggle;
			color: $primary-color-70;
			padding: 0 !important;
		}
	}

	&__body {
		color: $secondary-color-70;
		text-align: left;
		overflow: hidden;
		transition: max-height 0.5s ease-in-out;
		max-height: 0px;

		&__slot {
			padding-top: 12px;
			padding-bottom: 16px;
		}

		&--opened {
			max-height: 1000px;
		}
	}

	&__body--icon {
		margin-top: 5px;
		color: $secondary-color-60;
		text-align: left;
		overflow: hidden;
		transition: max-height 0.5s ease-in-out;
		max-height: 0px;
		margin-left: 40px;

		&--opened {
			max-height: 1000px;
		}
	}
}
</style>
