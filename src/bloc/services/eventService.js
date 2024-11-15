import {
  getEvents,
  getEventAvailability,
  bookEvent,
  cancelEvent,
  getEventDetails,
  getEventReviews,
  uploadEventReviewImage,
  submitEventReview,
} from "@/connector/eventConnector";

export default {
  getEvents: async () => {
    try {
      let result = await getEvents();
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getEventReviews: async (eventId) => {
    try {
      let result = await getEventReviews(eventId);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  uploadEventReviewImage: async (image) => {
    try {
      let result = await uploadEventReviewImage(image);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  submitEventReview: async (payload, eventId) => {
    try {
      let result = await submitEventReview(payload, eventId);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getEventAvailability: async (time) => {
    try {
      let result = await getEventAvailability(time);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  bookEvent: async (payload) => {
    try {
      let result = await bookEvent(payload);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  cancelEvent: async (number) => {
    try {
      let result = await cancelEvent(number);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getEventDetails: async (number) => {
    try {
      let result = await getEventDetails(number);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
};
