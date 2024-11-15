<template>
  <div class="promo-con">
    <input
      type="text"
      v-model="promoCode"
      placeholder="enter promo code"
      @keypress.enter="applyPromo()"
    />
    <div 
			class="promo-btn" 
			:class="{'processing': processing}"
			@click="applyPromo()"
		>Apply</div>
  </div>
</template>

<script>
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";

export default {
  name: "WidgetPromoCode",
  mixins: [utility],
  data() {
    return {
			promoCode: "",
			processing: false,
    };
  },
  computed: {
    appliedPromoCodes() {
      return this.$store.getters.getPromoCodes || [];
    },
  },
  methods: {
    async applyPromo() {
			if (!this.promoCode) return;
			if (this.processing) return;
      let promoCodes = this.$store.getters.getPromoCodes;
      if (
        !isEmpty(promoCodes) &&
        promoCodes.filter((code) => {
          return code == this.promoCode;
        }).length > 0
      ) {
        this.showNotification(
          "warning",
          "error_outline",
          `${this.promoCode} is already applied!`
        );
        return;
      }
      if (
        this.appliedPromoCodes.filter((code) => {
          return code == this.promoCode;
        }).length > 0
      ) {
        this.showNotification(
          "warning",
          "error_outline",
          `${this.promoCode} is already applied!`
        );
        return;
      }

      let currentPromocode = this.promoCode;
      promoCodes.push(this.promoCode);
			this.$store.dispatch("setPromoCodes", promoCodes);
			let self = this;
			this.processing = true;
			this.$emit("emit-promocode", currentPromocode, promoCodes, () => {
				self.promoCode = "";
				self.processing = false;
			});
    },
  },
};
</script>
<style scoped lang="scss">
.promo-con {
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
		&.processing {
			opacity: 0.6;
			pointer-events: none;
		}
  }
}
@media (min-width: 672px) {
  .promo-con {
    margin: 0;
  }
}
</style>
