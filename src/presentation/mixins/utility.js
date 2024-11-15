import { eventService, homeService, storeService } from "@/bloc/services";
import { EUNOIA_CONFIG } from "@/connector/apiConfig";
import {
  getCart,
  getFavorites,
  getInventory,
  getMenu,
  postOrder,
  postOutletOrder,
} from "@/connector/productConnector";
import { getPromotions } from "@/connector/storeConnector.js";
import { isEmpty } from "lodash";
import moment from "moment-timezone";
import router from "../../router";
export default {
  methods: {
    isEmpty(expression) {
      return isEmpty(expression);
    },
    goTo(pageName) {
      return this.$router.push({
        name: pageName,
      });
    },
    goToWithParams(pageName, params) {
      return this.$router.push({
        name: pageName,
        params,
      });
    },
    goBack() {
      let currentRoute = this.$router.currentRoute.value;
      // if (!currentRoute.redirectedFrom) {
      //   let page = "HomePage";
      //   if (!this.isLoggedIn()) page = "WelcomePage";
      //   return this.$router.replace({ name: page });
      // }
      if (window.history.state.back === null) {
        let page = "HomePage";
        if (this.isGuestCustomer()) page = "WelcomePage";
        return this.goTo(page);
      }
      if (window.history.state.back == "/home" && this.isGuestCustomer()) {
        return this.goTo("WelcomePage");
      }
      if (this.$route.query.reinit) {
        this.$store.dispatch("setInited", false);
      }
      if (this.$route.query.redirect) {
        if (this.$route.query.redirect == "/home" && !this.isLoggedIn()) {
          return this.$router.replace({ name: "WelcomePage" });
        }
        if (currentRoute) {
          let redirectFrom = currentRoute.redirectedFrom;
          if (redirectFrom) {
            let requiredLogin = redirectFrom.meta.requireLogin;
            if (requiredLogin && !this.isLoggedIn())
              return this.goTo("WelcomePage");
          }
        }
        return this.$router.replace(this.$route.query.redirect);
      }

      return this.$router.back();
    },
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
    logout() {
      this.$store.dispatch("clearLoginToken");
      this.$store.dispatch("clearCustomer");
      if (this.$store.getters.getFBLogin) {
        this.$store.getters.getFBLogin.logout((res) => {
          console.log(res);
          this.$store.dispatch("setFBLogin", null);
        });
      }
      let currentRoute = this.$router.currentRoute.value;
      let currentPath =
        currentRoute.matched.length > 0 ? currentRoute.matched[0] : null;
      if (!currentPath) {
        return this.$router.replace({ name: "LoginPage" });
      }
      let requireLogin = currentPath.meta.requireLogin;
      if (requireLogin) {
        return this.$router.replace({
          name: "LoginPage",
          query: { redirect: currentRoute.path },
        });
      }
      this.$router.replace({ name: "LoginPage" });
    },
    isValidEmail(email) {
      let pattern = /\S+@\S+\.\S+/;
      return pattern.test(email);
    },
    isValidPhone(phone) {
      if (!phone) return false;
      if (Number.isNaN(phone)) return false;
      if (phone.toString().length >= 10 && phone.toString().length <= 12)
        return true;
      return (
        phone.toString().length === 8 &&
        (phone.toString().startsWith("8") || phone.toString().startsWith("9"))
      );
    },
    showNotification(type, icon, message) {
      this.$store.dispatch("notification/updateNotification", {
        show: true,
        type: type,
        icon: icon,
        message: message,
        autoClose: true,
      });
    },
    isPartOfLinkedNudges(nudge, allNudges) {
      const isStart = nudge.tags
        ?.map((it) => it.toLowerCase())
        ?.includes("nudge_1");

      const isPart = allNudges.find((it) => {
        return (
          it.tags?.map((it) => it.toLowerCase())?.includes("nudge_1") &&
          it.links?.includes(nudge.id)
        );
      });

      return isStart || isPart;
    },
    async refreshCustomerData() {
      let cust = this.$store.getters.getCustomer;
      if (isEmpty(cust) && !this.isLoggedIn()) return;
      let customer = await homeService.getCustomerDetails();
      this.$store.dispatch("setCustomer", customer);
    },
    isHQ() {
      return this.$store.getters.isHQ;
    },
    isGuestCustomer() {
      let regCust = this.$store.getters.getCustomer;
      return isEmpty(regCust) && !this.isLoggedIn();
    },
    async refreshMainData() {
      let skip =
        arguments.length > 0 && arguments[0] !== undefined
          ? arguments[0]
          : false;
      let callback =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : function () {};
      let outletCode =
        arguments.length > 2 && arguments[2] !== undefined
          ? arguments[2]
          : null;
      /*
      let layer = await storeService.getLayer();
      if(!layer.success) return;

      let hq = false;
      if(layer.type == 'HEADQUARTER') {
        hq = true;
        this.$store.dispatch("setHQ", true);
      }
      */
      let hq = true;
      this.$store.dispatch("setHQ", true);
      //if(!skip) await this.refreshCustomerData();
      await this.refreshCustomerData();
      this.startCurrentLocation();
      let response = await storeService.retrieveStores();
      if (response.success) {
        if (!isEmpty(response.app)) {
          this.$store.dispatch(
            "setMixnMatch",
            response.app.multipleCheckout == true
          );
          if (response.app.properties?.homeBanner) {
            this.$store.dispatch(
              "setHomeBanner",
              response.app.properties.homeBanner
            );
          }
          if (response.app.properties?.eventBanner) {
            this.$store.dispatch(
              "setEventBanner",
              response.app.properties.eventBanner
            );
          }
        }
        let stores = [];
        if (hq) {
          this.$store.dispatch("setHeadquarter", response);
          this.$store.dispatch("setOutlets", response.outlets || []);
          if (!isEmpty(response.outlets)) {
            response.outlets.forEach((o) => {
              if (isEmpty(o.stores)) return;
              o.stores.forEach((s) => {
                stores.push(s);
              });
            });
          }
        } else {
          this.$store.dispatch("setStoreBrand", response.brand);
          if (!isEmpty(response.stores)) {
            stores = response.stores.sort(function (a, b) {
              return a.sortIndex - b.sortIndex;
            });
          }
        }
        this.initNearestStore(stores, outletCode);
      }
      this.$store.dispatch("setCuratedBrands", []);
      await this.retrieveFavorites(skip);
      await this.retrieveMenu(outletCode);
      this.$store.dispatch("setInited", true);
      callback();
    },
    isJSON(data) {
      try {
        JSON.parse(data);
      } catch (e) {
        return false;
      }
      return true;
    },
    async retrieveInventory(skip, outletCode, productId) {
      if (skip) return;
      var res = await getInventory(outletCode, productId);
      if (res.inventories) {
        this.$store.dispatch("setInventory", res.inventories);
      }
    },
    async retrieveFavorites(skip) {
      if (skip) return;
      var res = await getFavorites();
      if (res.success) {
        this.$store.dispatch("setFavorites", res.products);
      }
    },
    async retrieveMenu() {
      let outletCode =
        arguments.length > 0 && arguments[0] !== undefined
          ? arguments[0]
          : null;
      let products = [];
      let categories = [];
      let tags = [];
      let isHQ = this.$store.getters.isHQ;
      let obj = {
        storeId: this.getOutletCode(),
      };
      if (outletCode) obj.storeId = outletCode;
      var res = await getMenu(obj);
      if (res.success) {
        if (isHQ) {
          if (!isEmpty(res.stores)) {
            let curatedBrands = [];
            let hq = this.$store.getters.getHeadquarter;
            if (
              !isEmpty(hq) &&
              !isEmpty(hq.app) &&
              !isEmpty(hq.app.properties)
            ) {
              curatedBrands = hq.app.properties.curatedBrands
                .split(",")
                .map((br) => {
                  return br.trim();
                });
            }
            let brands = res.stores
              .map((s) => {
                return s.brand;
              })
              .filter((br) => {
                return curatedBrands.indexOf(br.apiCode) > -1;
              });
            let finalBrands = [];
            if (!isEmpty(brands)) {
              brands.forEach((b) => {
                if (
                  finalBrands
                    .map((f) => {
                      return f.apiCode;
                    })
                    .indexOf(b.apiCode) == -1
                )
                  finalBrands.push(b);
              });
            }
            this.$store.dispatch("setCuratedBrands", finalBrands);
            res.stores.forEach((s) => {
              let menu = s.menu;
              let newProducts = menu.products
                .filter((prod) => {
                  return (
                    products
                      .map((p) => {
                        return p.id;
                      })
                      .indexOf(prod.id) == -1
                  );
                })
                .map((prd) => {
                  prd.brands = prd.brands || [];
                  if (prd.price == null) prd.price = prd.originalPrice || 0;
                  if (
                    prd.brands
                      .map((b) => {
                        return b.id;
                      })
                      .indexOf(s.brand.id) == -1
                  )
                    prd.brands.push(s.brand);
                  return prd;
                });
              products = [...products, ...newProducts];
              categories = [
                ...categories,
                ...menu.categories.filter((cat) => {
                  return (
                    categories
                      .map((m) => {
                        return m.id;
                      })
                      .indexOf(cat.id) == -1
                  );
                }),
              ];
              tags = [
                ...tags,
                ...menu.tags
                  .filter((it) => {
                    return (
                      it.name != "" &&
                      tags
                        .map((t) => {
                          return t.name.toLowerCase();
                        })
                        .indexOf(it.name.toLowerCase()) == -1
                    );
                  })
                  .map((t) => {
                    t.brands = t.brands || [];
                    if (t.brands.indexOf(s.brand.apiCode) == -1)
                      t.brands.push(s.brand.apiCode);
                    return t;
                  }),
              ];
            });
          }
        } else {
          this.$store.dispatch("setStoreBrand", res.brand);
          products = res.products;
          categories = res.categories;
          tags = res.tags.filter((it) => {
            return it.name != "";
          });
        }
      }
      this.$store.dispatch("setProducts", products);
      this.$store.dispatch("setCategories", categories);
      this.$store.dispatch("setTags", tags);
    },
    getOutletCode() {
      let currentStore = this.getCurrentStore();
      let code = currentStore ? currentStore.id : "";
      let isHQ = this.$store.getters.isHQ;
      if (isHQ) {
        let hq = this.$store.getters.getHeadquarter;
        if (isEmpty(currentStore)) {
          if (!isEmpty(this.$store.getters.getCurrentOutlet)) {
            return this.$store.getters.getCurrentOutlet.apiCode;
          }
          if (!isEmpty(hq.outlets)) return hq.outlets[0].apiCode;
          return "";
        }
        let outlet = hq.outlets.find((o) => {
          let st = o.stores.filter((s) => {
            return s.id == currentStore.id;
          });
          return st.length > 0;
        });
        if (outlet) code = outlet.apiCode;
      }
      return code;
    },
    initNearestStore(stores) {
      let outletCode =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : null;
      this.$store.dispatch("setStoreList", stores);
      if (isEmpty(stores)) return;
      let userCoords = this.getCurrentLocation();
      let momente = moment();
      let day = momente.format("dddd").toUpperCase();
      let milliseconds = momente.format("x");
      stores.forEach((s) => {
        s.availabelToday = false;
        let hours = s.openingHours || [];
        let activeHours = !isEmpty(hours)
          ? hours.filter((h) => {
              return h.dayOfWeek.toUpperCase() == day;
            })
          : [];
        if (!isEmpty(activeHours)) {
          let h = activeHours[0];
          let date = moment().format("YYYY-MM-DD");
          let fromTime = moment(date + " " + h.startTime.substring(0, 5));
          let endTime = moment(date + " " + h.endTime.substring(0, 5));
          s.availabelToday =
            milliseconds >= fromTime.format("x") &&
            milliseconds < endTime.format("x");
        }
        s.distance = null;
        if (!isEmpty(userCoords) && !isEmpty(s.coord)) {
          let radlat1 = (Math.PI * userCoords.lat) / 180;
          let radlat2 = (Math.PI * s.coord.lat) / 180;
          let theta = userCoords.lng - s.coord.lng;
          let radtheta = (Math.PI * theta) / 180;
          let dist =
            Math.sin(radlat1) * Math.sin(radlat2) +
            Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
          if (dist > 1) dist = 1;
          dist = Math.acos(dist);
          dist = (dist * 180) / Math.PI;
          dist = dist * 60 * 1.1515;
          dist = parseFloat(dist * 1.609344).toFixed(2); //in Kilometers
          s.distance = dist;
        }
      });
      stores.sort((a, b) => {
        return a.distance - b.distance;
      });
      let currentStore = stores[0];
      let activeStores = stores.filter((s) => {
        return s.availabelToday;
      });
      if (!isEmpty(activeStores)) {
        currentStore = activeStores[0];
      }
      if (this.$store.getters.hasInited) {
        let existStore = this.$store.getters.getCurrentStore;
        if (!isEmpty(existStore)) {
          if (
            !isEmpty(
              stores.find((s) => {
                return s.id == existStore.id;
              })
            )
          ) {
            // dont change the existing selected store:
            return;
          }
        }
      }
      let outlets = this.$store.getters.getOutlets;
      let outlet = outlets.find((ou) => {
        if (outletCode) return ou.apiCode == outletCode;
        return (
          ou.stores.filter((s) => {
            return s.id == currentStore.id;
          }).length > 0
        );
      });
      this.$store.dispatch("setCurrentStore", currentStore);
      this.$store.dispatch("setCurrentOutlet", outlet);
    },
    getStoreList() {
      return this.$store.getters.getStoreList;
    },
    getOutlets() {
      return this.$store.getters.getOutlets;
    },
    getCurrentStore() {
      return this.$store.getters.getCurrentStore;
    },
    getCurrentOutlet() {
      return this.$store.getters.getCurrentOutlet;
    },
    getPaymentAccounts() {
      return this.$store.getters.getPaymentAccounts;
    },
    getCurrentLocation() {
      return this.$store.getters.getCurrentLocation;
    },
    startCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          this.$store.dispatch("setCurrentLocation", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        });
      }
    },
    currency(value) {
      let currencySymbol = this.$store.getters.getCurrencySymbol;
      let isMinus = parseFloat(value) < 0;
      if (value != null) {
        value = isMinus ? Math.abs(value).toFixed(2) : value.toFixed(2);
        let curr = "";
        let positiveValue = value.toString().split(".")[0];
        let decimalValue =
          value.toString().split(".").length > 1
            ? value.toString().split(".")[1]
            : "00";
        let currRev = positiveValue.toString().split("").reverse().join("");
        for (let i = 0; i < currRev.length; i++) {
          if (i % 3 == 0) {
            curr += currRev.substr(i, 3) + ",";
          }
        }

        let totalString = curr
          .split("", curr.length - 1)
          .reverse()
          .join("");
        if (isMinus) currencySymbol = `-${currencySymbol}`;
        return (
          currencySymbol +
          totalString +
          (decimalValue > 0 ? "." + decimalValue : "")
        );
      }
    },
    getFavoriteProducts() {
      return this.$store.getters.getFavorites;
    },
    isFavoriteProduct(productId) {
      let favorites = this.$store.getters.getFavorites || [];
      return (
        favorites
          .map((it) => {
            return it.product;
          })
          .indexOf(productId) !== -1
      );
    },
    async checkoutEvent(request) {
      let test =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : true;
      let callbackSuccess =
        arguments.length > 2 && arguments[2] !== undefined
          ? arguments[2]
          : function () {};
      let skipToken =
        arguments.length > 3 && arguments[3] !== undefined
          ? arguments[3]
          : false;

      if (isEmpty(request))
        return callbackSuccess({
          success: false,
          message: "Request is empty!",
        });

      let booking = request.booking;
      let payment = request.payment || null;
      let cartId = this.$store.getters.getCartId;
      if (isEmpty(booking))
        return callbackSuccess({
          success: false,
          message: "Booking data is empty!",
        });
      let customer = booking.customer;
      let params = {
        type: booking.type,
        name: booking.name,
        payments: [],
        items: [],
        total: booking.total,
        promoCodes: booking.promoCodes || [],
      };
      let cashVouchers = [];
      let vouchers = [];
      if (this.$store.getters.getAppliedCashVouchers) {
        cashVouchers = this.$store.getters.getAppliedCashVouchers.map((it) => {
          return {
            number: it.promotion.number,
            pin: it.promotion.pin,
          };
        });
      }
      if (this.$store.getters.getAppliedVouchers) {
        vouchers = this.$store.getters.getAppliedVouchers.map((it) => {
          return it.id;
        });
      }
      params.vouchers = vouchers;
      params.cashVouchers = cashVouchers;
      if (skipToken) {
        params.customer = {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
        };
      }
      if (payment) params.payments.push(payment);
      let item = {
        sessionTimeId: booking.sessionTimeId,
        quantity: booking.quantity,
        participants: booking.participants,
      };

      params.test = test == true;
      params.draft = test == true;
      params.cartId = cartId;
      if (params.total <= 0) {
        params.draft = false;
        params.cartId = null;
      }
      params.items.push(item);

      let res = await eventService.bookEvent(params);
      if (res.cartId) {
        this.$store.dispatch("setCartId", res.cartId);
      }
      if (!res.success && res.code && res.code == "-666") {
        customer.eunoiaAuthToken = "";
        this.$store.dispatch("setCustomer", customer);
        this.$store.dispatch("setEunoiaToken", "");
        return this.checkoutEvent(request, test, callbackSuccess, true);
      }
      callbackSuccess(res);
    },
    getImage(image, prop) {
      if (!image) return "";
      if (!prop) prop = "c_fill,h_300,w_350";
      return this.$store.getters.cloudinaryURL + prop + "/" + image;
    },
    resizeImageHandler() {
      let length = document.getElementsByClassName("img-ratio").length;
      for (var i = 0; i < length; i++) {
        let classList =
          document
            .getElementsByClassName("img-ratio")
            [i].classList.value?.split(" ") || [];
        let customRatio = classList.indexOf("custom-ratio") > -1;
        let w = document.getElementsByClassName("img-ratio")[i].clientWidth;
        let h = (9 / 16) * w;
        if (customRatio) {
          let ratio34 = classList.indexOf("ratio-34") > -1;
          let ratio43 = classList.indexOf("ratio-43") > -1;
          if (ratio34) h = (3 / 4) * w;
          if (ratio43) h = (4 / 3) * w;
        }
        document.getElementsByClassName("img-ratio")[i].style[
          "height"
        ] = `${h}px`;
      }
    },
    calculateTotalOrder(totalAmount) {
      if (totalAmount == 0) return totalAmount;
      if (!isEmpty(this.$store.getters.getDiscountPerBrand)) {
        this.$store.getters.getDiscountPerBrand.forEach((d) => {
          totalAmount -= parseFloat(d.discount.amount) || 0;
        });
      }
      if (!isEmpty(this.$store.getters.getDiscounts)) {
        this.$store.getters.getDiscounts.forEach((d) => {
          totalAmount -= parseFloat(d.amount) || 0;
        });
      }
      if (!isEmpty(this.$store.getters.getOutletExtraCharges)) {
        this.$store.getters.getOutletExtraCharges.forEach((it) => {
          if (!it.extraCharges.inclusive)
            totalAmount += parseFloat(it.extraCharges.amount) || 0;
        });
      }
      if (!isEmpty(this.$store.getters.getExtraCharges)) {
        this.$store.getters.getExtraCharges.forEach((it) => {
          if (!it.inclusive) totalAmount += parseFloat(it.amount) || 0;
        });
      }
      return totalAmount;
    },
    async testOrder() {
      let self = this;
      let rollbackAtError =
        arguments.length > 0 && arguments[0] !== undefined
          ? arguments[0]
          : true;
      let callbackSuccess =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : function () {};
      let callbackError =
        arguments.length > 2 && arguments[2] !== undefined
          ? arguments[2]
          : function () {};
      let draft =
        arguments.length > 3 && arguments[3] !== undefined
          ? arguments[3]
          : false;
      let test =
        arguments.length > 4 && arguments[4] !== undefined
          ? arguments[4]
          : true;

      let store = this.getCurrentStore();
      let cartId = this.$store.getters.getCartId;
      let orderRequest = this.$store.getters.getOrderRequest;
      // let dineType = this.$store.getters.getDineType;
      let dineType = "RETAIL";
      orderRequest.address = null;
      if (this.isOrderOmisell()) {
        dineType = "RETAIL_DELIVERY";
        let address = this.$store.getters.getDeliveryAddress;
        if (!isEmpty(address)) {
          delete address.clicked;
          orderRequest.address = address;
        }
      }
      orderRequest.fulfillmentTime = null;
      orderRequest.type = dineType;
      orderRequest.promoCodes = [];

      let promoCodes = this.$store.getters.getPromoCodes;
      let removedPromocodes = this.$store.getters.getAutoPromoCodes;
      if (removedPromocodes && !isEmpty(promoCodes)) {
        removedPromocodes = removedPromocodes.filter((it) => {
          return !promoCodes.includes(it);
        });
      }
      let cashVouchers = [];
      let vouchers = [];
      if (this.$store.getters.getAppliedCashVouchers) {
        cashVouchers = this.$store.getters.getAppliedCashVouchers.map((it) => {
          return {
            number: it.promotion.number,
            pin: it.promotion.pin,
          };
        });
      }
      if (this.$store.getters.getAppliedVouchers) {
        vouchers = this.$store.getters.getAppliedVouchers.map((it) => {
          return it.id;
        });
      }
      orderRequest.promoCodes = promoCodes;
      orderRequest.cashVouchers = cashVouchers;
      orderRequest.vouchers = vouchers;
      orderRequest.removedPromos = removedPromocodes;

      orderRequest.draft = draft;
      orderRequest.test = test;
      if (cartId) orderRequest.cartId = cartId;
      if (!this.isGuestCustomer()) {
        let cust = this.$store.getters.getCustomer;
        orderRequest.customer = {
          firstName: cust.firstName,
          lastName: cust.lastName,
          email: cust.email,
          phone: cust.phone,
        };
      }
      /*
      orderRequest.vouchers = _.uniq(self.appliedVouchers.map(function (voucher) {
        return voucher.id;
      }));
      orderRequest.rewardPoints = self.rewardPoints;
      */

      let mainCarts = this.$store.getters.getCarts;
      let carts = mainCarts;
      if (!isEmpty(carts)) {
        // exclude free items from orderRequest:
        carts = carts.filter((cart) => {
          return isEmpty(cart.freeProduct);
        });
      }
      orderRequest.total = 0;
      orderRequest.subTotal = 0;

      if (self.isHQ()) {
        orderRequest.orders = [];
        if (carts.length > 0) {
          carts.forEach(function (cart) {
            let tempItems = [];
            if (orderRequest.orders.length == 0) {
              orderRequest.orders.push({
                type: dineType,
                store: cart.storeId,
                fulfillmentTime: orderRequest.fulfillmentTime,
                items: [
                  {
                    specialRequest: cart.specialInstructions,
                    quantity: cart.quantity,
                    product: cart.product.id,
                    modifiers: cart.modifiers,
                    variant: !isEmpty(cart.variant) ? cart.variant.id : "",
                    storeName: cart.storeName,
                    freeProduct: cart.freeProduct,
                  },
                ],
              });
            } else {
              let newOrder = 0;
              tempItems = {
                specialRequest: cart.specialInstructions,
                quantity: cart.quantity,
                product: cart.product.id,
                modifiers: cart.modifiers,
                variant: !isEmpty(cart.variant) ? cart.variant.id : "",
                storeName: cart.storeName,
                freeProduct: cart.freeProduct,
              };
              orderRequest.orders.some(function (t) {
                if (t.store == cart.storeId) {
                  t.items.push(tempItems);
                  newOrder = 0;
                  return true;
                } else {
                  newOrder++;
                }
              });
              if (newOrder >= 1) {
                orderRequest.orders.push({
                  type: dineType,
                  store: cart.storeId,
                  fulfillmentTime: orderRequest.fulfillmentTime,
                  items: [
                    {
                      specialRequest: cart.specialInstructions,
                      quantity: cart.quantity,
                      product: cart.product.id,
                      modifiers: cart.modifiers,
                      variant: !isEmpty(cart.variant) ? cart.variant.id : "",
                      storeName: cart.storeName,
                      freeProduct: cart.freeProduct,
                    },
                  ],
                });
              }
            }
            orderRequest.total += cart.accPrice;
            orderRequest.subTotal += cart.accPrice;
          });
        }
        if (
          this.calculateTotalOrder(orderRequest.total) == 0 &&
          test == false
        ) {
          draft = false;
          cartId = null;
          orderRequest.cartId = null;
          self.$store.dispatch("setCartId", null);
        }
        /*
        if(isTrue(skipRequestAPI)){
          return self.cartItemAdded(callbackSuccess());
        }
        */
        let response = await postOutletOrder(
          orderRequest,
          this.getOutletCode()
        );
        if (!response.success)
          return this.failedOrder(response, rollbackAtError, callbackError);
        this.$store.dispatch("setOrderRequest", orderRequest);
        return this.successOrder(response, callbackSuccess);
      } else {
        orderRequest.items = [];
        if (carts.length > 0) {
          carts.forEach(function (cart) {
            orderRequest.items.push({
              specialRequest: cart.specialInstructions,
              quantity: cart.quantity,
              product: cart.product.id,
              modifiers: cart.modifiers,
              variant: cart.variant.id,
              storeName: cart.storeName,
              storeId: cart.storeId,
              brandName: store.brand ? store.brand.name : "",
              freeProduct: cart.freeProduct,
            });
            orderRequest.total += cart.accPrice;
            orderRequest.subTotal += cart.accPrice;
          });
        }
        if (
          this.calculateTotalOrder(orderRequest.total) == 0 &&
          test == false
        ) {
          draft = false;
          cartId = null;
          orderRequest.cartId = null;
          self.$store.dispatch("setCartId", null);
        }
        let response = await postOrder(orderRequest);
        if (!response.success)
          return self.failedOrder(response, rollbackAtError, callbackError);
        this.$store.dispatch("setOrderRequest", orderRequest);
        return self.successOrder(response, callbackSuccess);

        /*
        if(isTrue(skipRequestAPI)){
          return self.cartItemAdded(callbackSuccess());
        }
        */
      }
    },
    async successOrder(response, callbackSuccess) {
      let self = this;

      let orderRequest = this.$store.getters.getOrderRequest;
      let discountPerBrand = [];
      let outletExtraCharges = [];
      let discs = response.order.discounts || [];
      let carts = self.$store.getters.getCarts;
      let fromOrders = [];

      self.$store.dispatch("setDiscounts", discs);
      self.$store.dispatch(
        "setExtraCharges",
        response.order.extraCharges || []
      );

      self.$store.dispatch("setEtaTime", response.order.etaTime || null);
      self.$store.dispatch("setBusy", response.order.busy);

      if (response.pointsBalance) {
        self.$store.dispatch("setPointUsed", response.pointsUsed);
        self.$store.dispatch("setTotalPoint", response.pointsBalance); //totalPointsReward - self.pointsUsed;
      }

      if (this.isHQ()) {
        self.$store.dispatch(
          "setEtaTime",
          !isEmpty(response.order.orders)
            ? response.order.orders[0].etaTime
            : null
        );
        response.order.orders.forEach(function (o) {
          fromOrders = [...fromOrders, ...o.items];
          if (o.discounts.length > 0) {
            o.discounts.forEach(function (d) {
              let existIndex = discountPerBrand.findIndex((xd) => {
                return (
                  xd.discount.promotion === d.promotion &&
                  xd.discount.voucher === d.voucher
                );
              });
              if (existIndex > -1) {
                discountPerBrand[existIndex].discount.amount += parseFloat(
                  d.amount
                );
                return;
              }
              discountPerBrand.push({
                discount: d,
                store: o.storeName,
                storeId: o.store,
              });
            });
          }
          if (o.extraCharges.length > 0) {
            o.extraCharges.forEach(function (e) {
              outletExtraCharges.push({
                store: o.storeName,
                storeId: o.store,
                extraCharges: e,
              });
            });
          }
        });
      }

      let promoCodes = [];
      let removedPromos = response.removedPromos || [];

      if (discs.length) {
        discs.forEach((d) => {
          if (!d.promotion) return;
          if (d.voucher) return;
          let reasons = d.reason.split("Promo Code: ");
          let prm = reasons.length > 1 ? reasons[1] : null;
          if (prm && promoCodes.indexOf(prm) == -1) promoCodes.push(prm);
        });
      }

      if (discountPerBrand.length) {
        discountPerBrand.forEach((d) => {
          if (!d.discount.promotion) return;
          if (d.discount.voucher) return;
          let reasons = d.discount.reason.split("Promo Code: ");
          let prm = reasons.length > 1 ? reasons[1] : null;
          if (prm && promoCodes.indexOf(prm) == -1) promoCodes.push(prm);
        });
      }

      self.$store.dispatch(
        "setMaxRedeemedPoints",
        response.order.maxRedeemedPoints
      );
      orderRequest.total = response.order.total;
      orderRequest.subTotal = response.order.subTotal;

      if (response.cartId) {
        self.$store.dispatch("setCartId", response.cartId);
      }

      orderRequest.draft = false;
      orderRequest.cartId = null;

      self.$store.dispatch("setOutletExtraCharges", outletExtraCharges);
      self.$store.dispatch("setDiscountPerBrand", discountPerBrand);
      self.$store.dispatch("setPromoCodes", promoCodes);
      self.$store.dispatch("setOrderRequest", orderRequest);
      self.$store.dispatch("setAutoPromocodes", removedPromos);

      let store = self.$store.getters.getCurrentStore;

      carts = carts.filter((c) => {
        return (
          fromOrders.filter((fo) => {
            if (c.freeProduct)
              return fo.product == c.product.id && fo.total == 0;
            return fo.product == c.product.id;
          }).length > 0
        );
      });

      let notInTheCart = [];
      let promoItems = [];
      fromOrders.forEach((oi, oix) => {
        let ix = carts.findIndex((it) => it.product.id == oi.product);
        if (ix == -1) {
          if (oi.total == 0) {
            let poi = { ...oi, ...{ index: oix } };
            promoItems.push(poi);
          } else notInTheCart.push(oi);
        } else {
          let samePrice = carts[ix].accPrice == oi.total;
          let sameQty = carts[ix].quantity == oi.quantity;
          if (samePrice && sameQty) return;
          if (oi.total == 0) {
            let poi = { ...oi, ...{ index: oix } };
            promoItems.push(poi);
          } else {
            carts[ix].accPrice = oi.total;
            carts[ix].quantity = oi.quantity;
          }
        }
      });
      if (!isEmpty(notInTheCart)) {
        notInTheCart.forEach((one) => {
          let prd = self.$store.getters.getProducts.find((p) => {
            return p.id == one.product;
          });
          if (!prd) {
            prd = {
              id: one.product,
              imageId: one.imageId,
              name: one.productName,
            };
          }
          carts.push({
            id: self.carts.length,
            showEdit: false,
            product: prd,
            quantity: one.quantity,
            variant: one.variant,
            modifierGroups: one.modifierGroups || [],
            price: one.total / one.quantity,
            accPrice: one.total,
            specialInstructions: "",
            modifiers: one.modifiers || [],
            storeName: store ? store.name : "",
            storeId: store ? store.id : "",
            processing: true,
            freeProduct: "",
          });
        });
      }
      let notFoundPromoItems = [];
      const manageNotFoundPromoItems = () => {
        if (notFoundPromoItems.length > 0) {
          notFoundPromoItems.forEach((prd) => {
            if (!carts[prd.index]) return;
            if (carts[prd.index].product.id == prd.product) {
              carts[prd.index].quantity = prd.quantity;
              carts[prd.index].accPrice = prd.total;
            } else {
              carts.push({
                id: self.carts.length,
                showEdit: false,
                product: {
                  id: prd.id,
                  imageId: prd.imageId,
                  name: prd.productName,
                },
                quantity: prd.quantity,
                variant: prd.variant,
                modifierGroups: prd.modifierGroups || [],
                price: prd.total / prd.quantity,
                accPrice: prd.total,
                specialInstructions: "",
                modifiers: prd.modifiers || [],
                storeName: store ? store.name : "",
                storeId: store ? store.id : "",
                processing: true,
                freeProduct: "",
              });
            }
          });
          if (promoCodes) {
            let nf = notFoundPromoItems.map((n) => n.product);
            promoCodes.forEach((pc) => {
              let pcarts = carts.filter(
                (c) => c.freeProduct != pc && nf.includes(c.product.id)
              );
              pcarts.sort((a, b) => a.quantity - b.quantity);
              if (pcarts.length > 0) {
                let cartIx = carts.findIndex(
                  (c) =>
                    c.product.id == pcarts[0].product.id &&
                    c.quantity == pcarts[0].quantity
                );
                if (cartIx == -1) return;
                let applied = carts.find(
                  (c) =>
                    c.product.id == carts[cartIx].product.id &&
                    c.id != carts[cartIx].id
                );
                if (applied && applied.freeProduct == pc) return;
                carts[cartIx].freeProduct = pc;
              }
            });
          }
        }
      };
      const finalizing = () => {
        manageNotFoundPromoItems();
        carts.map((c, ix) => {
          c.id = ix;
          return c;
        });
        if (carts.length < fromOrders.length) {
          let diff = fromOrders.filter((a) => {
            return (
              carts.filter((c) => {
                return c.product.id !== a.product;
              }).length > 0
            );
          });
          if (diff.length) {
            let newCarts = diff.map((one) => {
              let prd = this.$store.getters.getProducts.find((p) => {
                return p.id == one.product;
              });
              if (!prd) {
                prd = {
                  id: one.product,
                  imageId: one.imageId,
                  name: one.productName,
                };
              }
              return {
                id: carts.length,
                showEdit: false,
                product: prd,
                quantity: one.quantity,
                variant: one.variant,
                modifierGroups: one.modifierGroups || [],
                price: one.total / one.quantity,
                accPrice: one.total,
                specialInstructions: "",
                modifiers: one.modifiers || [],
                storeName: store ? store.name : "",
                storeId: store ? store.id : "",
                processing: true,
                freeProduct: "",
              };
            });
            carts = [...carts, ...newCarts];
            self.$store.dispatch("setCarts", carts);
          }
        }
        self.$store.dispatch("setCarts", carts);
        callbackSuccess(response);
      };
      const checkPromoItems = async () => {
        let outletCode = self.getOutletCode();
        let res = await getPromotions(outletCode);
        promoItems.forEach((p) => {
          let prm = res.promotions.find((it) => {
            return it.freeProduct && it.freeProduct.id == p.product;
          });
          if (prm && prm.benefitType == "FREE_ITEM") {
            let prd = prm.freeProduct;
            let one = promoItems.find((c) => {
              return c.product == prd.id;
            });
            if (one) {
              let cart = {
                id: self.carts.length,
                showEdit: false,
                product: prd,
                quantity: one.quantity,
                variant: one.variant,
                modifierGroups: one.modifierGroups || [],
                price: one.total / one.quantity,
                accPrice: one.total,
                specialInstructions: "",
                modifiers: one.modifiers || [],
                storeName: store ? store.name : "",
                storeId: store ? store.id : "",
                processing: true,
                freeProduct: prm.code,
              };
              let cprd = carts.find((c) => {
                return c.product.id == cart.product.id && c.price == 0;
              });
              if (!cprd) carts.push(cart);
            }
          } else {
            let prd = promoItems[0];
            notFoundPromoItems.push(prd);
          }
        });
        finalizing();
      };
      if (!isEmpty(promoItems)) {
        await checkPromoItems();
      } else {
        finalizing();
      }
    },
    async failedOrder(error) {
      let rollbackAtError =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : true;
      let callbackError =
        arguments.length > 2 && arguments[2] !== undefined
          ? arguments[2]
          : function () {};
      let self = this;
      let orderRequest = this.$store.getters.getOrderRequest;
      let carts = this.$store.getters.getCarts;
      if (isEmpty(error.items) && rollbackAtError) {
        carts.pop();
        self.$store.dispatch("setCarts", carts);
      }
      /*
      let showAlert = true;
      let items = null;
      let callTestOrder = false;
      let vouchersError = [];
      let promoCodesError = [];
      if(!isEmpty(error.vouchers) || !isEmpty(error.promoCodes)){
        callTestOrder = true;
        API.Promotion.getPromotion(function (json) {
          promotionList = json.promotions || promotionList;
        });
        showAlert = false;
        if(orderRequest.orders === undefined){
          items = orderRequest.items;
        }else{
          items = orderRequest.orders[0].items;
        }
      }
      if (!isEmpty(error.vouchers)) {
        vouchersError = error.vouchers;
      }

      if (!_.isEmpty(error.promoCodes)) {
        promoCodesError = error.promoCodes;
      }
      */

      orderRequest.draft = false;
      orderRequest.cartId = null;
      self.$store.dispatch("setOrderRequest", orderRequest);
      callbackError(error);
    },
    mapCartOutlets() {
      let outletList = this.$store.getters.getOutlets;
      let carts = this.$store.getters.getCarts;
      return carts.map((cart) => {
        return outletList.find((outlet) => {
          return (
            outlet.stores.filter((s) => {
              return s.id == cart.storeId;
            }).length > 0
          );
        });
      });
    },
    isOrderOmisell() {
      let stores = this.mapCartOutlets();
      let outlets = [];
      let keys = Object.keys(stores);
      for (var i = 0; i < keys.length; i++) {
        outlets.push(stores[keys[i]]);
      }
      return (
        outlets.filter((o) => {
          return (
            o.apiCode.toLowerCase() == "omisell" &&
            o.stores.filter((s) => s.delivery).length > 0
          );
        }).length > 0
      );
    },
    resetCart() {
      this.$store.dispatch("clearBooking");
      this.$store.dispatch("setOrderRequest", {});
      this.$store.dispatch("setCartId", null);
      this.$store.dispatch("setDiscounts", []);
      this.$store.dispatch("setPromoCodes", []);
      this.$store.dispatch("setDiscountPerBrand", []);
      this.$store.dispatch("setOutletExtraCharges", []);
      this.$store.dispatch("setExtraCharges", []);
      this.$store.dispatch("setEtaTime", null);
      this.$store.dispatch("setBusy", false);
      this.$store.dispatch("setPointUsed", 0);
      this.$store.dispatch("setTotalPoint", 0);
      this.$store.dispatch("setMaxRedeemedPoints", 0);
      this.$store.dispatch("setCarts", []);
      this.$store.dispatch("setDeliveryAddress", null);
      this.$store.dispatch("setAutoPromocodes", []);
    },
    setupProducts(products) {
      let carts = this.$store.getters.getCarts;
      return products.map((prd) => {
        prd.cart = carts.find((cart) => {
          return cart.product?.id == prd.id;
        });
        return prd;
      });
    },
    async retrieveCartDetails(cartId) {
      let callback =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : function () {};
      let outletCode = this.getOutletCode();
      let res = await getCart(cartId, outletCode);
      if (!res.success) {
        return callback({
          carts: [],
          message: res.message,
        });
      }
      let outlets = this.$store.getters.getOutlets || [];
      let prds = this.$store.getters.getProducts;
      this.$store.dispatch("setCartId", cartId);

      let orderRequest = {
        app: EUNOIA_CONFIG.app,
        cartId: cartId,
        customer: {
          firstName: res.order.customer.firstName,
          lastName: res.order.customer.lastName,
          phone: res.order.customer.phone,
          email: res.order.customer.email,
        },
        draft: false,
        test: true,
        fulfillmentTime: null,
        orders: [],
      };

      let carts = [];
      let currentStore = this.$store.getters.getCurrentStore;
      let currOutlet = outlets.find((ou) => {
        if (!isEmpty(res.order.outlet)) return ou.id == res.order.outlet.id;
        return ou.stores.filter((s) => s.id == currentStore.id).length > 0;
      });
      let reloadOrders = res.order.orders.map((order) => {
        let outlet = outlets.find((outlet) => {
          return outlet.stores.find((s) => {
            return s.id == order.store;
          });
        });
        return {
          order: order,
          outlet: outlet,
          store: outlet.stores.find((s) => {
            return s.id == order.store;
          }),
        };
      });

      const mapOrders = (order, products) => {
        orderRequest.orders.push({
          type: order.type,
          store: order.store,
          fulfillmentTime: order.fulfillmentTime,
          items: order.items.map((n) => {
            return {
              specialRequest: n.specialRequest,
              quantity: n.quantity,
              product: n.product,
              modifiers: n.modifiers,
              variant: n.variant,
              storeName: order.storeName,
            };
          }),
        });
        order.items.forEach(async (item) => {
          let prd = products.find((p) => {
            return p.id == item.product;
          });
          if (!prd) {
            prd = {
              id: item.product,
              imageId: item.imageId,
              name: item.productName,
            };
          }
          carts.push({
            id: carts.length,
            product: prd,
            quantity: item.quantity,
            variant: {
              id: item.variant,
              name: item.variantName,
              price: item.variantPrice,
            },
            modifiers: item.modifiers,
            modifierGroups: prd.modifierGroups,
            accPrice: item.total,
            price: item.total / item.quantity,
            storeName: order.storeName,
            storeId: order.store,
            specialInstructions: item.specialRequest,
          });
        });
        let cust = this.$store.getters.getCustomer;
        if (order.address && cust) {
          let addr = cust.addresses.find(
            (add) => add.string == order.address.string
          );
          if (addr) this.$store.dispatch("setDeliveryAddress", addr);
        }
      };

      const checkNext = async (outletApiCode) => {
        if (!isEmpty(reloadOrders)) {
          await doOneOrder(reloadOrders[0]);
        } else {
          if (!isEmpty(res.order.outlet)) {
            currOutlet = outlets.find((ou) => {
              return ou.apiCode == outletApiCode;
            });
            let orderStore = res.order.orders.find((it) => {
              return (
                currOutlet.stores
                  .map((s) => {
                    return s.id;
                  })
                  .indexOf(it.store) > -1
              );
            });
            if (isEmpty(orderStore)) {
              orderStore = res.order.orders[0];
              this.$store.dispatch("setInited", false);
              return this.goToWithParams("CartPage", {
                cartId: cartId,
                outletCode: outlets.find((o) => {
                  return o.stores.find((s) => {
                    return s.id == orderStore.store;
                  });
                }).apiCode,
              });
            }
            currentStore = currOutlet.stores.find((s) => {
              return s.id == orderStore.store;
            });
            this.$store.dispatch("setCurrentOutlet", currOutlet);
            this.$store.dispatch("setCurrentStore", currentStore);
          }

          this.$store.dispatch("setOrderRequest", orderRequest);
          this.$store.dispatch("setCarts", carts);

          let freeProducts = carts
            .map((c, x) => {
              return { price: c.price, index: x, cart: c };
            })
            .filter((c) => {
              return c.price == 0;
            });

          const updateFreeProducts = async () => {
            let json = await getPromotions(outletCode);
            let prm = json.promotions.find((it) => {
              return (
                it.benefitType == "FREE_ITEM" &&
                it.freeProduct &&
                it.freeProduct.id == carts[freeProducts[0].index].product?.id
              );
            });
            if (prm) {
              carts[freeProducts[0].index].freeProduct = prm.code;
            } else {
              let promoCodes = this.$store.getters.getPromoCodes;
              if (promoCodes) {
                promoCodes.forEach((pc) => {
                  let pcarts = carts.filter(
                    (c) =>
                      c.freeProduct != pc &&
                      freeProducts[0].cart.product.id == c.product.id
                  );
                  pcarts.sort((a, b) => a.quantity - b.quantity);
                  if (pcarts.length > 0) {
                    let cartIx = carts.findIndex(
                      (c) =>
                        c.product.id == pcarts[0].product.id &&
                        c.quantity == pcarts[0].quantity
                    );
                    if (cartIx == -1) return;
                    let applied = carts.find(
                      (c) =>
                        c.product.id == carts[cartIx].product.id &&
                        c.id != carts[cartIx].id
                    );
                    if (applied && applied.freeProduct == pc) return;
                    carts[cartIx].freeProduct = pc;
                  }
                });
              }
            }
            freeProducts.splice(0, 1);
            if (!isEmpty(freeProducts)) {
              return updateFreeProducts();
            }
            callback({ carts: carts });
          };

          await this.successOrder(res, async () => {
            this.$store.dispatch("setCartId", cartId);
            this.$store.dispatch("setCarts", carts);
            if (!isEmpty(freeProducts)) {
              return updateFreeProducts();
            }
            callback({ carts: carts });
          });
        }
      };

      const doOneOrder = async (item) => {
        let products = [];
        if (item.outlet.apiCode == currOutlet.apiCode) {
          products = prds;
          mapOrders(item.order, products);
          reloadOrders.splice(0, 1);
          checkNext(item.outlet.apiCode);
        } else {
          products = [];
          let json = await getMenu({ storeId: item.outlet.apiCode });
          if (!json.success) return checkNext(item.outlet.apiCode);
          json.stores.forEach((st) => {
            products = [...products, ...st.menu.products];
          });
          mapOrders(item.order, products);
          reloadOrders.splice(0, 1);
          checkNext(item.outlet.apiCode);
        }
      };
      await doOneOrder(reloadOrders[0]);
    },
    generateGA(res) {
      let order = res.order;
      let data = {
        event: "purchase",
        ecommerce: {
          transaction_id: res.order.number,
          value: this.amount,
          currency: "PHP",
          items: [],
        },
      };

      if (isEmpty(order)) return data;
      if (isEmpty(order.orders)) return data;

      let outlets = this.$store.getters.getOutlets;
      let products = this.$store.getters.getProducts;
      let categories = this.$store.getters.getCategories;
      let outlet = outlets.find((ou) => {
        return ou.id == order.outlet.id;
      });
      order.orders.forEach((o) => {
        if (isEmpty(o.items)) return;
        o.items.forEach((it) => {
          let prd = products.find((p) => {
            return p.id == it.product;
          });
          let cat = categories.find((c) => {
            return prd?.categories?.indexOf(c.id) > -1;
          });
          let item = {
            item_id: it.product,
            item_name: it.productName,
            affiliation: outlet ? outlet.name : "",
            coupon: it.promotion,
            discount: 0,
            item_brand: o.brand.name,
            item_category: cat ? cat.name : "",
            price: it.total,
            quantity: it.quantity,
          };
          data.ecommerce.items.push(item);
        });
      });
      return data;
    },
    avatar(name) {
      if (!name) return "";
      let names = name.split(" ");
      let items = [];
      for (var n in names) {
        items.push(names[n].substring(0, 1));
      }
      return items.join("");
    },
    async retrieveReviewRatings(eventId) {
      let result = await eventService.getEventReviews(eventId);
      let reviewsList = result.success ? result.reviews : [];

      reviewsList.map((it) => {
        let stars = [];
        let rating = Math.floor(it.rating / 2);
        let diff = it.rating % 2;
        for (let i = 0; i < rating; i++) {
          stars.push({ icon: "star", rated: 2 });
        }
        if (diff > 0) stars.push({ icon: "star_half", rated: 1 });
        let len = stars.length;
        if (len < 5) {
          for (let n = 0; n < 5 - len; n++) {
            stars.push({ icon: "star", rated: 0 });
          }
        }
        it.stars = stars;
        let date = moment
          .tz(it.createdAt.substring(0, 10), "Asia/Singapore")
          .format("DD MMM YYYY");
        it.createdDate = date;
        return it;
      });
      let totalRatings = reviewsList
        .map((it) => {
          return it.rating;
        })
        .reduce((a, b) => a + b, 0);
      let maxRates = reviewsList.length * 10;
      let calcRate = (totalRatings / maxRates) * 10;
      let ratingPoints = (calcRate / 2).toFixed(1);
      if (isNaN(ratingPoints)) ratingPoints = 0;
      let ratings = Math.floor(ratingPoints);
      let diffRate = calcRate % 2;
      let ratingStars = [];
      for (let i = 0; i < ratings; i++) {
        ratingStars.push({ icon: "star", rated: 2 });
      }
      if (diffRate > 0) ratingStars.push({ icon: "star_half", rated: 1 });
      let starsLen = ratingStars.length;
      if (starsLen < 5) {
        for (let n = 0; n < 5 - starsLen; n++) {
          ratingStars.push({ icon: "star", rated: 0 });
        }
      }
      let reviewCharts = [
        {
          stars: 5,
          totalReviewed: 0,
          percentage: 0,
        },
        {
          stars: 4,
          totalReviewed: 0,
          percentage: 0,
        },
        {
          stars: 3,
          totalReviewed: 0,
          percentage: 0,
        },
        {
          stars: 2,
          totalReviewed: 0,
          percentage: 0,
        },
        {
          stars: 1,
          totalReviewed: 0,
          percentage: 0,
        },
      ];
      reviewsList.forEach((it) => {
        let n = reviewCharts.findIndex(
          (c) => c.stars == it.stars.filter((s) => s.rated > 0).length
        );
        if (it.rating <= 0) {
          n = reviewCharts.findIndex((c) => c.stars == 1);
        }
        if (n > -1) {
          reviewCharts[n].totalReviewed++;
          reviewCharts[n].percentage = (
            (reviewCharts[n].totalReviewed / reviewsList.length) *
            100
          ).toFixed(2);
        }
      });
      if (reviewsList) {
        reviewsList.sort((a, b) => {
          return b.id - a.id;
        });
      }
      return {
        reviewsList: reviewsList,
        reviewCharts: reviewCharts,
        totalRatings: totalRatings,
        ratingPoints: ratingPoints,
        ratingStars: ratingStars,
      };
    },
  },
};

export const goTo = (pageName, params) => {
  return router.push({ name: pageName, params });
};

export const isPartOfLinkedNudges = (nudge, allNudges) => {
  const isStart = nudge.tags
    ?.map((it) => it.toLowerCase())
    ?.includes("nudge_1");

  const isPart = allNudges.find((it) => {
    return (
      it.tags?.map((it) => it.toLowerCase())?.includes("nudge_1") &&
      it.links?.includes(nudge.id)
    );
  });

  return isStart || isPart;
};
