import * as Device from "expo-device";
import { useEffect, useState } from "react";
export const useCheckDevice = () => {
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        setIsTablet(Device.deviceType === Device.DeviceType.TABLET);
    }, []);
    return {
        isTablet
    };
};
