import {
    View,
    Text,
    useWindowDimensions,
    KeyboardAvoidingView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import React, { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Theme } from "@/constants/Styles";
import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import axios from "axios";
import { VehicleRequest } from "@/types/vehiclerequest";

type FormInputs = {
    registration: string;
};

const getVehicleRegisteredDate = async (motDate: string) => {
    const registered = new Date(motDate);
    registered.setFullYear(registered.getFullYear() - 3);

    return registered;
};

const registration = () => {
    const { authState } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dimensions = useWindowDimensions();

    const router = useRouter();

    const {
        control,
        handleSubmit,
        formState: { errors },
        clearErrors,
    } = useForm<FormInputs>({
        defaultValues: {
            registration: "",
        },
    });

    const onSubmit: SubmitHandler<FormInputs> = async (inputData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await axios.get(
                `${process.env.EXPO_PUBLIC_API_URL}/api/v1/vehicle/${inputData.registration}/getDetails`
            );

            const vehicleData: VehicleRequest = res.data;

            const exists = await axios.get(
                `${process.env.EXPO_PUBLIC_API_URL}/api/v1/garage/vehicle/${inputData.registration}/exists`
            );

            if (exists.data) {
                throw new Error("Vehicle already added");
            }

            router.push({
                pathname: `/new-vehicle/${inputData.registration}`,
                params: {
                    model: vehicleData.model,
                    make: vehicleData.make,
                    year: vehicleData.year,
                    engineSize: vehicleData.engine_size,
                    color: vehicleData.color,
                    registered: vehicleData?.registered,
                    taxDate: vehicleData?.tax_date,
                    motDate: vehicleData?.mot_date,
                },
            });

            setIsSubmitting(false);
        } catch (err: any) {
            setIsSubmitting(false);
            Alert.alert("Error", err.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{
                flex: 1,
                alignItems: "flex-start",
            }}
            behavior={"position"}
            keyboardVerticalOffset={-150}
        >
            <View
                style={[
                    Theme.Container,
                    {
                        justifyContent: "center",
                        gap: 10,
                        backgroundColor: "#FFF",
                        width: dimensions.width,
                    },
                ]}
            >
                <View
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 15,
                        marginBottom: 15,
                    }}
                >
                    <Text style={Theme.BigTitle}>
                        What's your registration?
                    </Text>
                </View>

                <Controller
                    control={control}
                    rules={{
                        required: "Registration is required",
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            autoComplete="off"
                            autoCorrect={false}
                            spellCheck={false}
                            autoCapitalize={"characters"}
                            placeholder={"eg. AA00 AAA"}
                            placeholderTextColor={Colors.grey}
                            style={[
                                Theme.InputStyle,
                                errors.registration
                                    ? { borderColor: "red", borderWidth: 1 }
                                    : null,
                            ]}
                            onBlur={onBlur}
                            onChangeText={(text) =>
                                onChange(text.replace(/\s/g, ""))
                            }
                            value={value}
                        />
                    )}
                    name="registration"
                />
                {errors.registration && (
                    <Text style={[Theme.Caption, { color: "red" }]}>
                        {errors.registration.message}
                    </Text>
                )}

                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    style={{
                        width: "100%",
                        backgroundColor: Colors.primary,
                        height: 50,
                        borderRadius: 10,
                        marginTop: 15,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={Colors.light} />
                    ) : (
                        <Text
                            style={{
                                fontFamily: "font-b",
                                fontSize: 16,
                                color: Colors.light,
                                textAlign: "center",
                                lineHeight: 50,
                            }}
                        >
                            Search for vehicle
                        </Text>
                    )}
                </TouchableOpacity>

                {error && (
                    <Text
                        style={[
                            Theme.Caption,
                            {
                                color: "red",
                                marginTop: 15,
                                textAlign: "center",
                            },
                        ]}
                    >
                        {error}
                    </Text>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

export default registration;
