import Nudge from "@/bloc/model/nudge";
import {
  checkDeleteCustomerAccount,
  deleteAddress,
  deleteCustomerAccount,
  getDetails,
  updateAddress,
  updateDetails,
} from "@/connector/customerConnector";
import nudgeConnector from "@/connector/nudgeConnector";
import { cloneDeep } from "lodash";

export default {
  getDayGreeting: () => {
    let today = new Date();
    let curHr = today.getHours();
    let result = "Good Evening";

    if (curHr < 12) {
      result = "Good Morning";
    } else if (curHr < 18) {
      result = "Good Afternoon";
    }

    return result;
  },
  getAllNudges: async (params) => {
    try {
      let result = await nudgeConnector.getNudges(params);
      if (!result.success) return Promise.reject(result.message);

      let nudges = result.nudges.map((it) => new Nudge(it));

      // show un-read nudges first
      let sortReadNudges = (a, b) => {
        if (a.status == "NOT_READ" && b.status == "NOT_READ") {
          return 0;
        }

        if (a.status == "NOT_READ" && b.status == "READ") return -1;

        if (a.status == "READ" && b.status == "NOT_READ") return 1;

        return 1;
      };

      nudges = nudges.sort(sortReadNudges);

      /* 
				- Nudges with no images will have repeating color pattern
				- Using js approach since nth-child and nth-of-type is not working
				- backgroundId of 1, 2, and 3 will have different background color
			*/
      let count = 0;
      for (let i = 0; i < nudges.length; i++) {
        let nudge = nudges[i];
        if (count === 3) count = 0;
        if (!nudge.image) nudge.backgroundId = ++count;
      }

      return Promise.resolve(nudges);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getValidNudges: (nudges) => {
    let result = cloneDeep(nudges);
    result = result.filter((it) => {
      // const validTags = [
      // 	"Eat Better",
      // 	"Live Better",
      // 	"Perform Better",
      // ];
      const isMandatorySurvey =
        it.name == "Start your BFM journey here" && it.type == "QUESTIONNAIRE";
      // const hasValidTags = it.tags.some((tag) =>
      // 	validTags.includes(tag)
      // );
      // return !isMandatorySurvey && hasValidTags;
      return !isMandatorySurvey;
    });
    return result;
  },
  getMandatoryNudge: (nudges) => {
    let result = cloneDeep(nudges);
    result = result.find((it) => {
      const isMandatorySurvey =
        it.name == "Start your BFM journey here" &&
        it.type == "QUESTIONNAIRE" &&
        it.questionnaire &&
        it.state !== "ANSWERED";

      return isMandatorySurvey;
    });

    return result;
  },
  getNudgeIconName: (nudgeType) => {
    let iconName = "";
    switch (nudgeType) {
      case "QUESTIONNAIRE":
        iconName = "quiz";
        break;
      case "ARTICLE":
        iconName = "article";
        break;
      case "SURPRISE":
        iconName = "redeem";
        break;
    }

    return iconName;
  },
  getCustomerDetails: async () => {
    try {
      let result = await getDetails();
      if (!result.success) return Promise.reject(result.message);

      return Promise.resolve(result.customer);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  updateCustomerDetails: async (payload) => {
    try {
      let result = await updateDetails(payload);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  deleteCustomerAccount: async (payload) => {
    try {
      let result = await deleteCustomerAccount(payload);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  checkDeleteCustomerAccount: async (code) => {
    try {
      let result = await checkDeleteCustomerAccount(code);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  updateCustomerAddress: async (payload) => {
    try {
      let result = await updateAddress(payload);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  deleteCustomerAddress: async (id) => {
    try {
      let result = await deleteAddress(id);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
};
