import {
  addFavorite,
  getDeliveryRegions,
  getFavorites,
  getInventory,
  paymayaCreateCheckout,
  unFavorite,
} from "@/connector/productConnector";

export default {
  paymayaCreateCheckout: async (payload) => {
    try {
      let result = await paymayaCreateCheckout(payload);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  retrieveInvetory: async () => {
    try {
      let result = await getInventory();
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  retrieveFavorites: async () => {
    try {
      let result = await getFavorites();
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  addFavorite: async (productId) => {
    try {
      let result = await addFavorite(productId);
      console.log(result);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  unFavorite: async (productId) => {
    try {
      let result = await unFavorite(productId);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getDeliveryRegions: async () => {
    try {
      let result = await getDeliveryRegions();
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
};
