<template>
  <div class="cart-options">
    <div class="cart-fulfillment-title">Fulfillment Options</div>
    <div class="cart-fulfillment-wrapper">
      <div class="cart-fulfillment-icon">
        <span class="material-icons-outlined">{{
          dineType == "DELIVERY" ? "local_shipping" : "hail"
        }}</span>
      </div>
      <div class="cart-fulfillment-content">
        <div class="inline-info">
          <span>{{ dineTypeDisplay }}</span>
          <div class="free-text selectable" 
            v-if="dineType == 'DELIVERY'" 
            @click="toggleModal()"
          >
            <span>{{ !isEmpty(selectedAddress) ? 'Change' : 'Select' }} address</span>
            <span class="material-icons-outlined">drive_file_rename_outline</span>
          </div>
          <span class="free-text" v-else>Free</span>
        </div>
        <div class="selected-address-con" 
          @click="toggleModal()"
          v-if="isOrderOmisell() && !isEmpty(selectedAddress)">
          <span class="selected-address-name">{{ selectedAddress.name }}</span>
          <span class="selected-address-desc">{{ selectedAddress.string }}</span>
        </div>
        <div class="selected-address-con" 
          @click="toggleModal()"
          v-else-if="isOrderOmisell()">
          <span class="selected-address-desc text-blink">Address is not selected yet..</span>
        </div>
        <div v-else
          class="cart-fulfillment-content-wrapper"
          v-for="store in stores"
          :key="store.id"
        >
          <span class="cart-fulfillment-store">{{ store.name }}</span>
        </div>
      </div>
    </div>

    <base-modal :show="showAddresses">
      <template v-slot:header>
        <div class="modal-header header-flex justify-between" :class="{'disabled': processing}">
          <h3>Find Location</h3>
          <span class="close-btn material-icons-outlined" @click="toggleModal()">close</span>
        </div>
      </template>
      <template v-slot:body>
        <div class="modal-body">
          <div class="addresses-header">
            <div class="addresses-title">Saved Addresses</div>
            <div class="add-address" @click="toggleAddressForm()">Add New</div>
          </div>
          <div class="addresses">
            <div class="address-item" 
              v-for="(addr, ix) in savedAddresses" 
              :key="ix"
              @click="clickAddress(ix)"
              :class="{'active': addr.clicked, 'processing': addr.processing}"
            >
              <div class="address-content">
                <div class="address-name">{{ addr.name }}</div>
                <div class="address-desc">{{ addr.string }}</div>
              </div>
              <div class="address-actions-list">
                <div class="toggle-action" 
                  :class="{'expanded': addr.expanded}"
                  @click="expandAddress(ix)"
                ></div>
                <div class="toggle-action-items">
                  <div class="toggle-action-item" @click="editAddress(addr)">Edit address</div>
                  <div class="toggle-action-item" @click="deleteAddress(addr)">Remove</div>
                </div>
                <div class="address-selector"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="actions">
            <div :class="addressButtonClass" @click="selectAddress()">
              Select Address
            </div>
          </div>
        </div>
      </template>
    </base-modal>

    <base-modal :show="showAddressForm">
      <template v-slot:header>
        <div class="modal-header header-flex justify-between" :class="{'disabled': processing}">
          <h3>{{ addressId ? 'Edit' : 'Add an' }} address</h3>
          <span class="close-btn material-icons-outlined" @click="toggleAddressForm()">close</span>
        </div>
      </template>
      <template v-slot:body>
        <div class="modal-body">
          <div class="form-con">
            <div class="form-group" :class="{'error': addressName.error}">
              <div class="label">Address Name <small v-if="addressName.error">{{ addressName.error }}</small></div>
              <div class="input">
                  <input type="text" v-model="addressName.value" maxlength="100" @keyup="keyup('addressName')">
              </div>
            </div>
            <div class="form-group" :class="{'error': addressLine1.error}">
              <div class="label">Address Line <small v-if="addressLine1.error">{{ addressLine1.error }}</small></div>
              <div class="input">
                  <input type="text" v-model="addressLine1.value" maxlength="100" @keyup="keyup('addressLine1')">
              </div>
            </div>
            <div class="form-group" :class="{'error': addressLine2.error}">
              <div class="label">Barangay <small v-if="addressLine2.error">{{ addressLine2.error }}</small></div>
              <div class="input">
                  <input type="text" v-model="addressLine2.value" maxlength="100" @keyup="keyup('addressLine2')">
              </div>
            </div>
            <div class="form-group-inline">
              <div class="form-group" :class="{'error': postalCode.error}">
                <div class="label">Postal Code <small v-if="postalCode.error">{{ postalCode.error }}</small></div>
                <div class="input">
                    <input type="text" v-model="postalCode.value" maxlength="100" @keyup="keyup('postalCode')">
                </div>
              </div>
              <div class="form-group" :class="{'error': city.error}">
                <div class="label">City <small v-if="city.error">{{ city.error }}</small></div>
                <div class="input">
                    <input type="text" v-model="city.value" maxlength="100" @keyup="keyup('city')">
                </div>
              </div>
            </div>
            <div class="form-group" :class="{'error': region.error}">
              <div class="label">Region <small v-if="region.error">{{ region.error }}</small></div>
              <div class="input">
                <div class="dropdown-component">
                  <div class="dropdown-placeholder" 
                    :class="{'active': !isEmpty(region.value), 'expanded': showRegions}"
                    @click="showRegions = !showRegions">
                    <span class="search-value">{{ region.value }}</span>
                  </div>
                  <div class="dropdown-wrapper" v-if="showRegions">
                    <input type="text"
                      placeholder="search" 
                      v-model="regionKeyword"
                    >
                    <div class="dropdown-list">
                      <div class="dropdown-item empty" v-if="isEmpty(regions)">No data.</div>
                      <div class="dropdown-item" @click="selectRegion(c)" v-for="c in regions" :key="c">{{ c }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="actions">
              <div 
                :class="{'processing action': processing, 'action-button': !processing}"
                @click="saveAddress()">Save address</div>
            </div>
          </div>
        </div>
      </template>
    </base-modal>
  </div>
</template>

<script>
import { homeService } from "@/bloc/services";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import { getDeliveryRegions } from "../../connector/productConnector";
export default {
  name: "WidgetFulfillmentDisplay",
  mixins: [utility],
  data() {
    return {
      showAddresses: false,
      showAddressForm: false,
      savedAddresses: [],
      selectedAddress: null,
      addressId: "",
      addressName: {
        value: "",
        error: "",
      },
      addressLine1: {
        value: "",
        error: "",
      },
      addressLine2: {
        value: "",
        error: "",
      },
      postalCode: {
        value: "",
        error: "",
      },
      city: {
        value: "",
        error: "",
      },
      processing: false,
      regions: [],
      region: {
        value: "",
        error: "",
      },
      regionKeyword: "",
      showRegions: false,
      regionsDropdownList: [],
    };
  },
  computed: {
    dineType() {
      if (this.isOrderOmisell()) return "DELIVERY";
      return this.$store.getters.getDineType;
    },
    dineTypeDisplay() {
      let type = this.dineType;
      let isMultipleOutlets = this.mapCartOutlets().length > 1;
      let atStore = isMultipleOutlets ? "outlets" : "store";
      if (type !== "DELIVERY") return `Pick up at ${atStore}`;
      return "Delivery";
    },
    stores() {
      return this.mapCartOutlets().reduce(
        (outlet, obj) => ({ ...outlet, [obj.id]: obj }),
        {}
      );
    },
    clickedAddress() {
      return this.savedAddresses?.find((it) => it.clicked);
    },
    addressButtonClass() {
      let btnclass = "action-button";
      if (this.processing) {
        return "processing action";
      }
      if (!isEmpty(this.clickedAddress) && !isEmpty(this.selectedAddress)) {
        if (this.clickedAddress.id == this.selectedAddress.id) {
          return "action-button disabled";
        }
      }
      if (isEmpty(this.clickedAddress)) return "action-button disabled";
      
      return btnclass;
    }
  },
  watch: {
    regionKeyword(val) {
      let res = this.regionsDropdownList;
      if (val) {
        res = this.regionsDropdownList.filter((it) => it.toLowerCase().indexOf(val.toLowerCase()) >= 0);
      }
      this.regions = res;
    },
    showAddressForm(val) {
      if (val) return;
      this.showRegions = false;
    }
  },
  methods: {
    keyup(field) {
      this[field].error = "";
    },
    selectRegion(c) {
      this.region.value = c;
      this.region.error = "";
      this.showRegions = false;
    },
    editAddress(addr) {
      if (this.processing) return;
      if (isEmpty(addr)) return;
      this.savedAddresses = this.savedAddresses.map((it) => {
        it.expanded = false;
        return it;
      });
      this.toggleAddressForm();
      this.addressId = addr.id;
      this.addressName = { value: addr.name, error: "" };
      this.addressLine1 = { value: addr.line1, error: "" };
      this.addressLine2 = { value: addr.line2, error: "" };
      this.postalCode = { value: addr.postalCode, error: "" };
      this.city = { value: addr.city, error: "" };
      this.region = { value: addr.region, error: "" };
    },
    expandAddress(ix) {
      if (this.processing) return;
      this.savedAddresses = this.savedAddresses.map((it, idx) => {
        if (ix == idx) it.expanded = !it.expanded;
        else it.expanded = false;
        return it;
      });
    },
    clickAddress(ix) {
      if (this.processing) return;
      this.savedAddresses = this.savedAddresses.map((it) => {
        it.clicked = false;
        return it;
      });
      this.savedAddresses[ix].clicked = true;
    },
    selectAddress() {
      if (this.processing) return;
      this.processing = true;
      let address = this.savedAddresses.find((it) => {
        return it.clicked;
      });
      if (isEmpty(address)) return;
      let currentAddress = this.$store.getters.getDeliveryAddress;
      if (currentAddress && currentAddress.id == address.id) return;
      
      this.$emit('change-address', (res) => {
        this.processing = false;
        if (!res.success) return this.showNotification("alert", "error_outline", "Something went wrong! " + res.message);
        this.selectedAddress = address;
        this.$store.dispatch("setDeliveryAddress", address);
        this.toggleModal();
      }, address);
    },
    async toggleModal() {
      if (this.processing) return;
      let actionShow = !this.showAddresses;
      
      this.savedAddresses = this.savedAddresses.map((it) => {
        it.expanded = false;
        return it;
      });
      if (actionShow) {
        await this.refreshCustomerData();
        let customer = this.$store.getters.getCustomer;
        this.savedAddresses = customer.addresses;
        if (!isEmpty(this.selectedAddress)) {
          this.savedAddresses = this.savedAddresses.map((it) => {
            it.clicked = this.selectedAddress.id == it.id;
            return it;
          });
        }
        if (!isEmpty(this.savedAddresses)) {
          this.savedAddresses.sort((a, b) => (a.name || a.string).localeCompare((b.name || b.string)));
        }
      }
      this.showAddresses = actionShow;
    },
    toggleAddressForm() {
      if (this.processing) return;
      this.regionKeyword = "";
      this.showAddressForm = !this.showAddressForm;
      this.showAddresses = !this.showAddressForm;
      this.resetForm();
    },
    resetForm() {
      this.addressId = "";
      this.addressName = { value: "", error: "" };
      this.addressLine1 = { value: "", error: "" };
      this.addressLine2 = { value: "", error: "" };
      this.postalCode = { value: "", error: "" };
      this.city = { value: "", error: "" };
      this.region = { value: "", error: "" };
    },
    async saveAddress() {
      try {
        if (this.processing) return;
        let countError = 0;
        if (isEmpty(this.addressName.value)) {
          this.addressName.error = 'Address title is required!';
          countError++;
        }
        if (isEmpty(this.addressLine1.value)) {
          this.addressLine1.error = 'Address Line 1 is required!';
          countError++;
        }
        if (isEmpty(this.addressLine2.value)) {
          this.addressLine2.error = 'Barangay is required!';
          countError++;
        }
        if (isEmpty(this.postalCode.value)) {
          this.postalCode.error = 'Postal code is required!';
          countError++;
        }
        if (isEmpty(this.city.value)) {
          this.city.error = 'City is required!';
          countError++;
        }
        if (isEmpty(this.region.value)) {
          this.region.error = 'Region is required!';
          countError++;
        }

        if (countError > 0) return;

        let params = {
          addressId: this.addressId,
          addressName: this.addressName.value,
          addressLine1: this.addressLine1.value,
          addressLine2: this.addressLine2.value,
          addressCity: this.city.value,
          addressRegion: this.region.value,
          addressCountryCode: "PH",
          addressPostalCode: this.postalCode.value
        };
        this.processing = true;
        let json = await homeService.updateCustomerAddress(params);
        this.processing = false;
        if (!json.success) return this.showNotification("alert", "error_outline", "Something went wrong! " + json.message);
        let clickedIndex = this.savedAddresses.findIndex((it) => it.id == this.addressId);
        this.savedAddresses = json.customer.addresses.sort((a, b) => (a.name || a.string).localeCompare((b.name || b.string)));
        if (clickedIndex >= 0) this.savedAddresses[clickedIndex].clicked = true;
        if (!isEmpty(this.selectedAddress) && this.addressId == this.selectedAddress.id) {
          this.selectedAddress = this.savedAddresses.find((a) => a.id == this.addressId);
          this.$store.dispatch("setDeliveryAddress", this.selectedAddress);
          this.$emit('change-address');
        }
        this.toggleAddressForm();
      } catch (error) {
        this.processing = false;
        this.showNotification("alert", "error_outline", "Something went wrong! " + error);
      }
    },
    async deleteAddress(addr) {
      try {
        if (this.processing) return;
        this.processing = true;
        let clickedIndex = this.savedAddresses.findIndex((it) => it.id == addr.id);
        if (clickedIndex >= 0) {
          this.savedAddresses[clickedIndex].processing = true;
          if(this.savedAddresses[clickedIndex].id == addr.id) clickedIndex = -1;
        }
        let json = await homeService.deleteCustomerAddress(addr.id);
        this.processing = false;
        if (clickedIndex >= 0) {
          this.savedAddresses[clickedIndex].processing = false;
        }
        if (!json.success) return this.showNotification("alert", "error_outline", "Something went wrong! " + json.message);
        
        this.savedAddresses = json.customer.addresses.sort((a, b) => (a.name || a.string).localeCompare((b.name || b.string)));
        if (clickedIndex >= 0) this.savedAddresses[clickedIndex].clicked = true;
        if (!isEmpty(this.selectedAddress)) {
          if (addr.id == this.selectedAddress.id) {
            this.$store.dispatch("setDeliveryAddress", null);
            this.selectedAddress = null;
            this.$emit('change-address');
          }
        }
      } catch (error) {
        this.processing = false;
        this.showNotification("alert", "error_outline", "Something went wrong! " + error);
      }
    },
    dropDownClickHandler() {
      let self = this;
      window.addEventListener("click", (event) => {
        if (!event.target.closest(".address-actions-list")) {
          self.savedAddresses = self.savedAddresses.map((it) => {
            return { ...it, expanded: false };
          });
        }
        if (!event.target.closest(".dropdown-component")) {
          self.showRegions = false;
        }
      });
    }
  },
  async created(){
    this.savedAddresses = [];
    let res = await getDeliveryRegions();
    if (res.success) {
      this.regionsDropdownList = res.regions || [];
    }
    this.regions = this.regionsDropdownList;
    if (this.isLoggedIn()) {
      let customer = this.$store.getters.getCustomer;
      this.savedAddresses = customer.addresses;
      this.selectedAddress = this.$store.getters.getDeliveryAddress;
      if (!isEmpty(this.savedAddresses)) {
        this.savedAddresses = this.savedAddresses.map((it) => {
          it.clicked = false;
          it.expanded = false;
          return it;
        }).sort((a,b) => (a.name || a.string).localeCompare((b.name || b.string)));
      }
      this.dropDownClickHandler();
    }
  }
};
</script>
<style scoped lang="scss">
.selected-address-con {
  display: flex;
  flex-direction: column;
  .selected-address-name {
    color: $secondary-color-100;
    font-weight: bold;
    font-size: 1em;
  }
  .selected-address-desc {
    color: $secondary-color-60;
    font-size: 0.9em;
  }
}
.addresses {
  width: 100%;
  display: flex;
  gap: 16px;
  flex-direction: column;
  .address-item {
    width: 100%;
    padding: 16px;
    border-radius: 5px;
    border: 1px solid rgba(0,0,0,.06);
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 24px;
    cursor: pointer;
    position: relative;
    &:not(.active):hover {
      border-color: $primary-color-30 !important;
    }
    &:is(.processing){
      background: transparent !important;
      border-color: $primary-color-20 !important;
      &::after {
        content: "";
        background: linear-gradient(90deg, transparent, $primary-color-10);
      }
    }
    &.active {
      background: $primary-color-10;
      border-color: $primary-color-20 !important;
      .address-name {
        color: $primary-color-70 !important;
      }
      .address-desc {
        color: $primary-color-50 !important;
      }
      .address-selector::before {
        content: "radio_button_checked" !important;
        color: $primary-color-50 !important;
      }
      .toggle-action::before {
        color: $primary-color-50 !important;
      }
    }
    .address-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      .address-name {
        font-weight: bold;
        font-size: 1em;
        padding: 8px 0;
      }
      .address-desc {
        color: $secondary-color-70;
        font-size: 0.9em;
      }
    }
    .address-actions-list {
      position: relative;
      top: 0px;
      right: 0px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
      gap: 24px;
      .toggle-action {
        position: relative;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 10px;
        height: 25px;
        &::before {
          width: 25px;
          right: 0;
          top: 0;
          position: absolute;
          content: "more_horiz";
          font-family: "Material Icons Outlined";
          color: $secondary-color-70;
          font-weight: normal;
          font-style: normal;
          font-size: 28px;
        }
        &.expanded {
          & + .toggle-action-items {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
        }
      }
      .toggle-action-items {
        display: none;
        position: absolute;
        top: 12px;
        right: 24px;
        background: $white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
        border-radius: 6px;
        padding: 16px;
        .toggle-action-item {
          font-size: 0.9em;
          cursor: pointer;
          white-space: nowrap;
          &:hover {
            opacity: 0.7;
          }
        }
      }
    }
    .address-selector {
      position: relative;
      width: 20px;
      height: 20px;
      &::before {
        position: absolute;
        content: "radio_button_unchecked";
        font-family: "Material Icons Outlined";
        color: $secondary-color-30;
        font-weight: normal;
        font-style: normal;
        font-size: 20px;
      }
    }
  }
}
.close-btn {
  cursor: pointer;
  &:hover {
    opacity: 0.7;
  }
}
.form-con {
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  text-align: left;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  .form-group-inline {
    width: 100%;
    gap: 16px;
    display: flex;
    flex-direction: column;
    & + .actions {
      margin-top: 48px;
      margin-bottom: 48px;
    }
  }
  .form-group {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    &.error {
      input, .dropdown-placeholder {
        border-color: $primary-color-30 !important;
      }
    }
    & + .actions {
      margin-top: 48px;
      margin-bottom: 48px;
    }
    .label {
      font-size: 1em;
      display: flex;
      justify-content: space-between;
      small {
        color: $primary-color-60;
        font-size: x-small;
        padding-left: 8px;
        text-align: right;
      }
    }
    .input {
      width: 100%;
      position: relative;
      input {
        width: 100%;
        border-radius: 12px;
        padding: 10px 16px;
        border: 1px solid $secondary-color-20;
        outline: none;
        color: $secondary-color-60;
        &:is([readonly]) {
          background: $secondary-color-10;
          cursor: not-allowed;
        }
        &:not([readonly]):focus {
          border-color: $secondary-color-40;
          color: $secondary-color-90;
        }
      }
    }

    & + .button {
      margin-top: 24px;
    }
  }
  .button {
    width: 100%;
    border-radius: 12px;
    background: $primary-color-60;
    border: 1px solid $primary-color-60;
    padding: 16px;
    color: $white;
    font-weight: bold;
    text-align: center;
    margin-bottom: 24px;
    cursor: pointer;
    &:hover {
      opacity: 0.7;
    }
    &.outlined {
      border-color: $primary-color-60 !important;
      background: transparent !important;
      color: $primary-color-60;
    }
  }
}
.modal-header {
  &:is(.disabled) {
    opacity: 0.7 !important;
    pointer-events: none !important;
    & * {
      opacity: 0.7 !important;
      pointer-events: none !important;
    }
  }
}
.modal-footer {
  border-top: 1px solid $secondary-color-10;
}
.dropdown-component {
  position: relative;
  width: 100%;
  .dropdown-placeholder {
    width: 100%;
    min-height: 45px;
    border-radius: 12px;
    padding: 10px 16px;
    border: 1px solid $secondary-color-20;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &:not(.active)::before {
      content: "Select";
      position: absolute;
      left: 16px;
      pointer-events: none;
      color: $secondary-color-50;
    }
    &::after {
      content: "expand_more";
      font-family: "Material Icons Outlined";
      font-size: 1.2em !important;
      min-width: 30px;
      position: absolute;
      right: 0px;
      color: $secondary-color-50;
      transition: all 0.5s;
      -webkit-transition: all 0.5s;
    }
    &:is(.expanded){
      &::after {
        transform: rotateX(180deg);
        -webkit-transform: rotateX(180deg);
      }
    }
  }
  .dropdown-wrapper {
    z-index: 2;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 50px;
    width: 100%;
    background: $white;
    border: 1px solid $secondary-color-20;
    border-radius: 12px;
    overflow: hidden;
    input {
      border-color: transparent !important;
      border-bottom-color: $secondary-color-20 !important;
      border-radius: 0 !important;
    }
    .dropdown-list {
      padding: 16px;
      width: 100%;
      max-height: 150px;
      overflow: hidden;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      .dropdown-item {
        &:is(.empty){
          color: $secondary-color-50;
          font-size: 0.9em;
        }
        &:not(.empty){
          cursor: pointer;
          &:hover{ opacity: 0.7;}
        }
      }
    }
  }
}
.action-button {
  padding: 16px 24px !important;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: $white;
  background: $primary-color-50;
  border-radius: 6px;
  cursor: pointer;
  &:hover{ opacity: 0.7;}
  &.disabled {
    background: $secondary-color-30 !important;
    pointer-events: none;
  }
}
.processing {
  pointer-events: none;
  position: relative;
  overflow: hidden;
  &.action {
    padding: 16px 24px !important;
    border-radius: 6px;
    border: 1px solid $secondary-color-20;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    color: $white;
    background: $white;
  }
  &::before {
    position: absolute;
    content: "";
    display: flex;
    align-items: center;
    justify-content: center;
    color: $white;
    margin: 0 auto;
    height: 6px;
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
    content: "Please wait...";
    z-index: 2;
    color: $secondary-color-70;
    background: linear-gradient(90deg, $secondary-color-40, transparent);
  }
}
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
.addresses-header {
  width: 100%;
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  .addresses-title {
    font-weight: bold;
    font-size: 1.2em;
    //font-family: 'Akzidenz Grotesk Super';
  }
  .add-address {
    color: $primary-color-50;
    font-weight: bold;
    cursor: pointer;
    &:hover{
      opacity: 0.7;
    }
  }
}
.cart-options {
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 2px 8px $secondary-color-20;
  -webkit-box-shadow: 0 2px 8px $secondary-color-20;

  .cart-fulfillment-title {
    width: 100%;
    font-family: "Akzidenz Grotesk Super";
    font-size: 1.3em;
    border-bottom: 1px solid $secondary-color-10;
    padding-bottom: 16px;
  }
  .cart-fulfillment-wrapper {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 16px;

    .cart-fulfillment-content {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .cart-fulfillment-content-wrapper {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 5px;

        + .cart-fulfillment-content-wrapper {
          padding-top: 8px;
          border-top: 1px solid $secondary-color-10;
        }
      }

      .cart-fulfillment-store {
        font-family: "Akzidenz Grotesk Super";
        font-size: 0.8em;
      }
      .inline-info {
        display: flex;
        gap: 8px;

        .free-text {
          color: $success-green;
          display: flex;
          gap: 8px;
          align-items: center;
          &.selectable {
            cursor: pointer;
            &:hover{opacity: 0.7;}
            & .material-icons-outlined {
              font-size: 1.2em !important;
            }
          }

          &::before {
            content: "";
            width: 8px;
            height: 2px;
            background: $success-green;
          }
        }
      }
    }
  }
}
@media (min-width: 672px) {
  .form-group-inline {
    flex-direction: row !important;
  }
}
</style>
