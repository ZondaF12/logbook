const getVehicleRegisteredDate = async (motDate: string) => {
    const registered = new Date(motDate);
    registered.setFullYear(registered.getFullYear() - 3);

    return registered;
};

export const getVehicleDetails = async (numberPlate: string) => {
    const vehicleInfo = await getVehicleInfoData(numberPlate);
    const motInfo = await getMotDetails(numberPlate);

    const resigstered = motInfo[0]?.firstUsedDate
        ? motInfo[0].firstUsedDate
        : await getVehicleRegisteredDate(motInfo[0]?.motTestExpiryDate);

    const vehicleDetails = {
        ...vehicleInfo,
        model: motInfo[0].model,
        firstUsedDate: resigstered,
        primaryColour: motInfo[0]?.primaryColour,
        motTestExpiryDate: motInfo[0]?.motTestExpiryDate,
    };

    return vehicleDetails;
};

const getVehicleInfoData = async (numberPlate: string) => {
    const data = JSON.stringify({ registrationNumber: numberPlate });
    const url =
        "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles";

    const config = {
        method: "POST",
        headers: {
            "x-api-key": `${process.env.EXPO_PUBLIC_DVLA_API}`,
            "Content-Type": "application/json",
        },
        body: data,
    };

    const res = await fetch(url, config);

    if (!res.ok) {
        throw new Error("Invalid registration number");
    }

    const json = await res.json();

    return json;
};

const getMotDetails = async (numberPlate: string) => {
    const url = `https://beta.check-mot.service.gov.uk/trade/vehicles/mot-tests/?registration=${numberPlate}`;
    const config = {
        method: "GET",
        headers: {
            "x-api-key": `${process.env.EXPO_PUBLIC_DVSA_MOT_API_KEY}`,
            "Content-Type": "application/json",
        },
    };

    const res = await fetch(url, config);

    if (!res.ok) {
        throw new Error("Invalid registration number");
    }

    const json = await res.json();
    return json;
};
