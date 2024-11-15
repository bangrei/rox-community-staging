<template>
	<layout-variant-two>
		<template v-slot:header>
			<div class="header-con">
				<div class="back-btn" @click="goBack">
					<span class="material-icons">arrow_back</span>
					<span>{{ showBack ? 'Back' : 'Home' }}</span>
				</div>
				<h1 class="heading-4">Support Center</h1>
			</div>
		</template>
		<template v-slot:body>
			<base-tab-panel size="sm" @select-tab="toggleSelected">
				<!-- <base-tab title="FAQ" :isSelected="tabIndex === 1" :key="1">
					<faq-content class="support-con" />
					<p class="body-3-normal">
						v{{ this.$store.state.appVersion }}
					</p>
				</base-tab> -->
				<base-tab
					title="Terms and Conditions"
					:isSelected="tabIndex === 2"
					:key="2"
				>
					<terms-content class="support-con"></terms-content>
				</base-tab>
			</base-tab-panel>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
// import FaqContent from "./components/FaqContent.vue";
import TermsContent from "./components/TermsContent.vue";
import utility from "@/presentation/mixins/utility.js";
export default {
	mixins: [utility],
	components: { LayoutVariantTwo, TermsContent },
	data() {
		return {
			tabIndex: 2,
		};
	},
	computed: {
		showBack(){
			return window.history.state.back !== null
		}
	},
	methods: {
		toggleSelected(activeCategoryId) {
			this.tabIndex = activeCategoryId;
		},
	},
};
</script>
<style lang="scss" scoped>
.header-con {
	padding: 12px 14px;
	border-bottom: 1px solid $secondary-color-20;
	background: $white;
	color: $secondary-color-90;
	justify-content: space-between;

	.back-btn {
		color: $primary-color-60;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 16px;
	}
}

.faq-back {
	position: absolute;
}
.support-con {
	margin-top: 40px;
}
</style>
