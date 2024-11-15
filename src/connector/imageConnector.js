const BASE_URL =
	"https://res.cloudinary.com/savantdegrees/image/upload/q_auto:good,f_auto,fl_lossy,c_scale/";

export const getImage = (code, { height, width } = {}) => {
	if (!height && !width) {
		return BASE_URL + code;
	} else {
		return BASE_URL + "/c_thumb," + height + "," + width + "/" + code;
	}
};
