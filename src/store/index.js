import { createStore } from "vuex";
import article from "./modules/article";
import notification from "./modules/notification";
import register from "./modules/register";
import survey from "./modules/survey";

export default createStore({
  state: {
    inited: false,
    appVersion:
      process.env.NODE_ENV === "production" ? process.env.VERSION : "0.0.0",
    token: localStorage.getItem("login-token") || "",
    eunoiaAuthToken: "",
    cartId: "",
    isHQ: false,
    headquarter: null,
    customer: {},
    currentStore: {},
    currentOutlet: {},
    currentLocation: {},
    nudges: [],
    storeBrand: null,
    outlets: [],
    storeList: [],
    products: [],
    categories: [],
    favoriteProducts: [],
    tags: [],
    dineType: "TAKE_AWAY",
    carts: [],
    orderRequest: {},
    deliveryAddress: null,

    outletExtraCharges: [],
    discountPerBrand: [],
    discounts: [],
    extraCharges: [],
    etaTime: null,
    busy: null,
    pointsUsed: 0,
    totalPoint: 0,
    maxRedeemedPoints: 0,
    promoCodes: [],
    autoPromocodes: [],
    appliedCashVouchers: [],
    appliedVouchers: [],
    checkedOut: false,

    booking: [],
    events: [],
    inventory: [],
    curatedBrands: [],
    isMixnMatch: false,
    stateFeedsPage: {
      currentTab: null,
      scrollTop: 0,
      scrollLeft: 0,
      isForYou: false,
    },
    stateStorePage: {
      currentBrand: null,
      currentCategory: null,
      scrollTop: 0,
      brandScrollLeft: 0,
      categoryScrollLeft: 0,
      productSize: 0,
    },
    stateEventsPage: {
      currentTab: null,
      scrollTop: 0,
      scrollLeft: 0,
    },
    FBLogin: null,
    cartProductEdit: null,
    bookingEventSession: null,
    eventBanner: "",
    homeBanner: "",
  },
  mutations: {
    setDeliveryAddress(state, payload) {
      state.deliveryAddress = payload;
    },
    setFBLogin(state, payload) {
      state.FBLogin = payload;
    },
    setCartProductEdit(state, payload) {
      state.cartProductEdit = payload;
    },
    setBookingEventSession(state, payload) {
      state.bookingEventSession = payload;
    },
    setStateFeedsPage(state, payload) {
      state.stateFeedsPage = payload || {
        currentTab: null,
        scrollTop: 0,
        scrollLeft: 0,
        isForYou: false,
      };
    },
    setStateStorePage(state, payload) {
      state.stateStorePage = payload || {
        currentBrand: null,
        currentCategory: null,
        scrollTop: 0,
        brandScrollLeft: 0,
        categoryScrollLeft: 0,
        productSize: 0,
      };
    },
    setStateEventsPage(state, payload) {
      state.stateEventsPage = payload || {
        currentTab: null,
        scrollTop: 0,
        scrollLeft: 0,
      };
    },
    setMixnMatch(state, isMixnMatch) {
      state.isMixnMatch = isMixnMatch;
    },
    setCuratedBrands(state, brands) {
      state.curatedBrands = brands;
    },
    setLoginToken(state, token) {
      state.token = token;
      localStorage.setItem("login-token", token);
    },
    setInited(state, inited) {
      state.inited = inited;
    },
    setEunoiaToken(state, token) {
      state.eunoiaAuthToken = token;
    },
    setCartId(state, cartId) {
      state.cartId = cartId;
    },
    setOrderRequest(state, orderRequest) {
      state.orderRequest = orderRequest;
    },
    setDiscounts(state, discounts) {
      state.discounts = discounts;
    },
    setPromoCodes(state, promoCodes) {
      state.promoCodes = promoCodes;
    },
    setAutoPromocodes(state, promoCodes) {
      state.autoPromocodes = promoCodes || [];
    },
    setDiscountPerBrand(state, discountPerBrand) {
      state.discountPerBrand = discountPerBrand;
    },
    setOutletExtraCharges(state, outletExtraCharges) {
      state.outletExtraCharges = outletExtraCharges;
    },
    setExtraCharges(state, extraCharges) {
      state.extraCharges = extraCharges;
    },
    setEtaTime(state, etaTime) {
      state.etaTime = etaTime;
    },
    setBusy(state, busy) {
      state.busy = busy;
    },
    setPointUsed(state, pointUsed) {
      state.pointsUsed = pointUsed;
    },
    setTotalPoint(state, totalPoint) {
      state.totalPoint = totalPoint;
    },
    setMaxRedeemedPoints(state, maxRedeemedPoints) {
      state.maxRedeemedPoints = maxRedeemedPoints;
    },
    setDineType(state, type) {
      state.dineType = type;
    },
    setHQ(state, isHQ) {
      state.isHQ = isHQ;
    },
    setHeadquarter(state, headquarter) {
      state.headquarter = headquarter;
    },
    clearLoginToken(state) {
      state.token = "";
      localStorage.removeItem("login-token");
    },
    setCustomer(state, customer) {
      state.customer = customer;
    },
    setEvents(state, events) {
      state.events = events;
    },
    setInventory(state, inventory) {
      state.inventory = inventory;
    },
    setCurrentStore(state, currentStore) {
      state.currentStore = currentStore;
    },
    setCurrentOutlet(state, currentOutlet) {
      state.currentOutlet = currentOutlet;
    },
    setOutlets(state, outlets) {
      state.outlets = outlets;
    },
    setStoreList(state, storeList) {
      state.storeList = storeList;
    },
    setCurrentLocation(state, currentLocation) {
      state.currentLocation = currentLocation;
    },
    clearCustomer(state) {
      state.customer = {};
    },
    setNudges(state, nudges) {
      state.nudges = nudges;
    },
    clearBooking(state) {
      state.booking = [];
    },
    addToBooking(state, item) {
      state.booking.push(item);
    },
    addToCart(state, item) {
      state.carts.push(item);
    },
    setCarts(state, carts) {
      state.carts = carts;
    },
    removeCartItem(state, item) {
      let idx = state.carts.findIndex((it) => {
        return it.id == item.id;
      });
      state.carts.splice(idx, 1);
    },
    setStoreBrand(state, storeBrand) {
      state.storeBrand = storeBrand;
    },
    setProducts(state, products) {
      state.products = products;
    },
    setCategories(state, categories) {
      state.categories = categories;
    },
    setTags(state, tags) {
      state.tags = tags;
    },
    setFavorites(state, favorites) {
      state.favoriteProducts = favorites;
    },
    addFavorite(state, productId) {
      state.favoriteProducts.push(productId);
    },
    unFavorite(state, productId) {
      let idx = state.favoriteProducts.findIndex((it) => {
        return it == productId;
      });
      state.favoriteProducts.splice(idx, 1);
    },
    addAppliedCashVouchers(state, voucher) {
      let vouchers = state.appliedCashVouchers;
      let vmap = vouchers
        ? vouchers.map((it) => {
            return it.id;
          })
        : [];
      if (!vmap.includes(voucher.id)) vouchers.push(voucher);
      state.appliedCashVouchers = vouchers;
    },
    addAppliedVouchers(state, voucher) {
      let vouchers = state.appliedVouchers;
      let vmap = vouchers
        ? vouchers.map((it) => {
            return it.id;
          })
        : [];
      if (!vmap.includes(voucher.id)) vouchers.push(voucher);
      state.appliedVouchers = vouchers;
    },
    removeAppliedCashVoucher(state, voucherId) {
      let vouchers = state.appliedCashVouchers.filter((it) => {
        return it.id != voucherId;
      });
      state.appliedCashVouchers = vouchers;
    },
    removeAppliedVoucher(state, voucherId) {
      let vouchers = state.appliedVouchers.filter((it) => {
        return it.id != voucherId;
      });
      state.appliedVouchers = vouchers;
    },
    setEventBanner(state, imageUrl) {
      state.eventBanner = imageUrl;
    },
    setHomeBanner(state, imageUrl) {
      state.homeBanner = imageUrl;
    },
  },
  actions: {
    setFBLogin({ commit }, payload) {
      commit("setFBLogin", payload);
    },
    setCartProductEdit({ commit }, payload) {
      commit("setCartProductEdit", payload);
    },
    setBookingEventSession({ commit }, payload) {
      commit("setBookingEventSession", payload);
    },
    setDeliveryAddress({ commit }, payload) {
      commit("setDeliveryAddress", payload);
    },
    setStateFeedsPage({ commit }, payload) {
      commit("setStateFeedsPage", payload);
    },
    setStateStorePage({ commit }, payload) {
      commit("setStateStorePage", payload);
    },
    setStateEventsPage({ commit }, payload) {
      commit("setStateEventsPage", payload);
    },
    setMixnMatch({ commit }, isMixnMatch) {
      commit("setMixnMatch", isMixnMatch);
    },
    setCuratedBrands({ commit }, brands) {
      commit("setCuratedBrands", brands);
    },
    setInited({ commit }, inited) {
      commit("setInited", inited);
    },
    setLoginToken({ commit }, token) {
      commit("setLoginToken", token);
    },
    setEunoiaToken({ commit }, token) {
      commit("setEunoiaToken", token);
    },
    setOrderRequest({ commit }, orderRequest) {
      commit("setOrderRequest", orderRequest);
    },
    setDiscounts({ commit }, discounts) {
      commit("setDiscounts", discounts);
    },
    setPromoCodes({ commit }, promoCodes) {
      commit("setPromoCodes", promoCodes);
    },
    setAutoPromocodes({ commit }, promoCodes) {
      commit("setAutoPromocodes", promoCodes);
    },
    setDiscountPerBrand({ commit }, discountPerBrand) {
      commit("setDiscountPerBrand", discountPerBrand);
    },
    setOutletExtraCharges({ commit }, outletExtraCharges) {
      commit("setOutletExtraCharges", outletExtraCharges);
    },
    setExtraCharges({ commit }, extraCharges) {
      commit("setExtraCharges", extraCharges);
    },
    setEtaTime({ commit }, etaTime) {
      commit("setEtaTime", etaTime);
    },
    setBusy({ commit }, busy) {
      commit("setBusy", busy);
    },
    setPointUsed({ commit }, pointUsed) {
      commit("setPointUsed", pointUsed);
    },
    setTotalPoint({ commit }, totalPoint) {
      commit("setTotalPoint", totalPoint);
    },
    setMaxRedeemedPoints({ commit }, maxRedeemedPoints) {
      commit("setMaxRedeemedPoints", maxRedeemedPoints);
    },
    setDineType({ commit }, type) {
      commit("setDineType", type);
    },
    setCartId({ commit }, cartId) {
      commit("setCartId", cartId);
    },
    setHQ({ commit }, isHQ) {
      commit("setHQ", isHQ);
    },
    setHeadquarter({ commit }, headquarter) {
      commit("setHeadquarter", headquarter);
    },
    clearLoginToken({ commit }) {
      commit("clearLoginToken");
    },
    setCustomer({ commit }, customer) {
      commit("setCustomer", customer);
    },
    setEvents({ commit }, events) {
      commit("setEvents", events);
    },
    setInventory({ commit }, inventory) {
      commit("setInventory", inventory);
    },
    setCurrentStore({ commit }, currentStore) {
      commit("setCurrentStore", currentStore);
    },
    setCurrentOutlet({ commit }, currentOutlet) {
      commit("setCurrentOutlet", currentOutlet);
    },
    setOutlets({ commit }, outlets) {
      commit("setOutlets", outlets);
    },
    setStoreList({ commit }, storeList) {
      commit("setStoreList", storeList);
    },
    setCurrentLocation({ commit }, currentLocation) {
      commit("setCurrentLocation", currentLocation);
    },
    clearCustomer({ commit }) {
      commit("clearCustomer");
    },
    clearSession({ commit }) {
      commit("clearCustomer");
      commit("clearLoginToken");
    },
    setNudges({ commit }, nudges) {
      commit("setNudges", nudges);
    },
    clearBooking({ commit }) {
      commit("clearBooking");
    },
    addToBooking({ commit }, item) {
      commit("addToBooking", item);
    },
    addToCart({ commit }, item) {
      commit("addToCart", item);
    },
    setCarts({ commit }, carts) {
      commit("setCarts", carts);
    },
    removeCartItem({ commit }, item) {
      commit("removeCartItem", item);
    },
    setProducts({ commit }, products) {
      commit("setProducts", products);
    },
    setStoreBrand({ commit }, brand) {
      commit("setStoreBrand", brand);
    },
    setCategories({ commit }, categories) {
      commit("setCategories", categories);
    },
    setTags({ commit }, tags) {
      commit("setTags", tags);
    },
    setFavorites({ commit }, favorites) {
      commit("setFavorites", favorites);
    },
    addFavorite({ commit }, productId) {
      commit("addFavorite", productId);
    },
    unFavorite({ commit }, productId) {
      commit("unFavorite", productId);
    },
    addAppliedCashVouchers({ commit }, voucher) {
      commit("addAppliedCashVouchers", voucher);
    },
    addAppliedVouchers({ commit }, voucher) {
      commit("addAppliedVouchers", voucher);
    },
    removeAppliedCashVoucher({ commit }, voucherId) {
      commit("removeAppliedCashVoucher", voucherId);
    },
    removeAppliedVoucher({ commit }, voucherId) {
      commit("removeAppliedVoucher", voucherId);
    },
    setEventBanner({ commit }, imageUrl) {
      commit("setEventBanner", imageUrl);
    },
    setHomeBanner({ commit }, imageUrl) {
      commit("setHomeBanner", imageUrl);
    },
  },
  getters: {
    getDeliveryAddress(state) {
      return state.deliveryAddress || null;
    },
    getHiddenEvents() {
      return [43, 53];
    },
    getActivityLevels() {
      return [
        {
          id: 1,
          name: "Level 1",
          title: "Explorer",
          minPoints: 0,
          maxPoints: 99,
          benefits: [
            {
              name: "Event Registration",
              description:
                "Book events directly through the ROX Community web-app.",
              withToggle: false,
              toggle: false,
            },
            {
              name: "Content Access",
              description:
                "Enjoy outdoor-related articles, videos, and questionnaires.",
              withToggle: false,
              toggle: false,
            },
            {
              name: "Badge Earning",
              description:
                "Earn badges that may offer special discounts by participating in events and activities.",
              withToggle: false,
              toggle: false,
            },
            {
              name: "Games & Prizes",
              description:
                "Participate in games and activities for a chance to win prizes.",
              withToggle: false,
              toggle: false,
            },
            {
              name: "Birthday Discount",
              description: "Enjoy 20% discount on your special day",
              withToggle: true,
              toggle: false,
            },
          ],
        },
        {
          id: 2,
          name: "Level 2",
          title: "Adventurer",
          minPoints: 100,
          maxPoints: 1000,
          benefits: [
            {
              name: "Event Registration",
              description:
                "Book events directly through the ROX Community web-app.",
              withToggle: false,
              toggle: false,
            },
            {
              name: "Content Access",
              description:
                "Enjoy outdoor-related articles, videos, and questionnaires.",
              withToggle: false,
              toggle: false,
            },
            {
              name: "Badge Earning",
              description:
                "Earn badges that may offer special discounts by participating in events and activities.",
              withToggle: false,
              toggle: false,
            },
            {
              name: "Games & Prizes",
              description:
                "Participate in games and activities for a chance to win prizes.",
              withToggle: false,
              toggle: false,
            },
            {
              name: "Birthday Discount",
              description: "Enjoy 20% discount on your special day",
              withToggle: true,
              toggle: false,
            },
            {
              name: "Seasonal Exclusive Member Discount",
              description:
                "Enjoy exclusive member discounts during special seasons (up to 10%).",
              withToggle: false,
              toggle: false,
            },
            {
              name: "Event Discounts",
              description:
                "Get discounts when you book Peak Pursuits Outdoor Activity event (10% on Peak Pursuits).",
              withToggle: false,
              toggle: false,
            },
            {
              name: "Special Content",
              description: "Access exclusive articles and videos.",
              withToggle: false,
              toggle: false,
            },
          ],
        },
      ];
    },
    getFBLogin(state) {
      return state.FBLogin;
    },
    getCartProductEdit(state) {
      return state.cartProductEdit;
    },
    getBookingEventSession(state) {
      return state.bookingEventSession;
    },
    getStateFeedsPage(state) {
      return state.stateFeedsPage;
    },
    getStateStorePage(state) {
      return state.stateStorePage;
    },
    getStateEventsPage(state) {
      return state.stateEventsPage;
    },
    isMixnMatch(state) {
      return state.isMixnMatch;
    },
    getCuratedBrands(state) {
      return state.curatedBrands;
    },
    hasInited(state) {
      return state.inited;
    },
    getCustomer(state) {
      return state.customer;
    },
    getCartId(state) {
      return state.cartId;
    },
    getOrderRequest(state) {
      return state.orderRequest;
    },
    getDiscounts(state) {
      return state.discounts;
    },
    getPromoCodes(state) {
      return state.promoCodes;
    },
    getAutoPromoCodes(state) {
      return state.autoPromocodes || [];
    },
    getDiscountPerBrand(state) {
      return state.discountPerBrand;
    },
    getOutletExtraCharges(state) {
      return state.outletExtraCharges;
    },
    getExtraCharges(state) {
      return state.extraCharges;
    },
    getEtaTime(state) {
      return state.etaTime;
    },
    getBusy(state) {
      return state.busy;
    },
    getPointUsed(state) {
      return state.pointUsed;
    },
    getTotalPoint(state) {
      return state.totalPoint;
    },
    getMaxRedeemedPoints(state) {
      return state.maxRedeemedPoints;
    },
    getDineType(state) {
      return state.dineType;
    },
    isHQ(state) {
      return state.isHQ;
    },
    getHeadquarter(state) {
      return state.headquarter;
    },
    getEvents(state) {
      return state.events;
    },
    getInventory(state) {
      return state.inventory;
    },
    getPaymentAccounts(state) {
      if (state.isHQ) return state.headquarter.app.paymentAccounts;
      return state.storeBrand && state.storeBrand.app
        ? state.storeBrand.app.paymentAccounts
        : [];
    },
    getStoreList(state) {
      return state.storeList;
    },
    getCurrentStore(state) {
      return state.currentStore || null;
    },
    getCurrentOutlet(state) {
      return state.currentOutlet || null;
    },
    getOutlets(state) {
      return state.outlets;
    },
    getCurrentLocation(state) {
      return state.currentLocation;
    },
    getToken(state) {
      return state.token;
    },
    getNudges(state) {
      return state.nudges;
    },
    isLoggedIn(state) {
      return state.token != "";
    },
    cloudinaryURL() {
      return "https://res.cloudinary.com/savantdegrees/image/upload/q_auto:good/";
    },
    getEunoiaToken(state) {
      let token = "";
      if (state.customer) token = state.customer.eunoiaAuthToken;
      if (!token) token = state.eunoiaAuthToken;
      return token;
    },
    getBooking(state) {
      return state.booking;
    },
    getCarts(state) {
      return state.carts;
    },
    getStoreBrand(state) {
      return state.storeBrand;
    },
    getCurrencySymbol(state) {
      if (state.isHQ)
        return state.headquarter.headquarter.currencySymbol || "PHP";
      return state.storeBrand ? state.storeBrand.currencySymbol : "PHP";
    },
    getProducts(state) {
      return state.products;
    },
    getCategories(state) {
      return state.categories;
    },
    getTags(state) {
      return state.tags;
    },
    getFavorites(state) {
      return state.favoriteProducts;
    },
    getAppliedCashVouchers(state) {
      return state.appliedCashVouchers;
    },
    getAppliedVouchers(state) {
      return state.appliedVouchers;
    },
    getEventBanner(state) {
      return state.eventBanner || require("@/assets/images/event-bg-new.jpeg");
    },
    getHomeBanner(state) {
      return state.homeBanner || require("@/assets/images/events-browse.jpg");
    },
  },
  modules: {
    survey,
    register,
    article,
    notification,
  },
});
