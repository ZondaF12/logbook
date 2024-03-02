import {
    View,
    Text,
    KeyboardAvoidingView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    useWindowDimensions,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Theme } from "@/constants/Styles";
import Animated, { FadeInLeft } from "react-native-reanimated";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Colors from "@/constants/Colors";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

type FormInputs = {
    description: string;
};

const SetDescription = () => {
    const { id, description: setDescription } = useLocalSearchParams<{
        id: string;
        description: string;
    }>();

    const { session } = useAuth();

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
            description: setDescription || "",
        },
    });

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        setIsSubmitting(true);
        setError(null);
        try {
            if (data.description !== "") {
                const { error } = await supabase
                    .from("user_vehicles")
                    .update({ description: data.description })
                    .eq("id", id);

                if (!error) {
                    setIsSubmitting(false);
                    router.back();
                }
            }
        } catch (err: any) {
            if (err.response.data.statusCode === 409) {
                setError(err.response.data.message);
            } else {
                setError("Something went wrong");
            }

            setIsSubmitting(false);
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
                    <Text style={Theme.BigTitle}>Vehicle Description</Text>
                </View>

                <Controller
                    control={control}
                    rules={{
                        required: "Description is required",
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            placeholder={"Vehicle Description..."}
                            placeholderTextColor={Colors.grey}
                            multiline
                            style={[
                                Theme.InputStyle,
                                {
                                    minHeight: 150,
                                    paddingTop: 10,
                                    lineHeight: 20,
                                    backgroundColor: "#FFF",
                                    borderWidth: 1,
                                },
                                errors.description
                                    ? { borderColor: "red" }
                                    : { borderColor: Colors.grey },
                            ]}
                            onBlur={onBlur}
                            onChangeText={(text) => {
                                const formattedText = text.replace(
                                    /\\n/g,
                                    "\n"
                                );
                                onChange(text);
                                clearErrors("description");
                            }}
                            value={value}
                        />
                    )}
                    name="description"
                />
                {errors.description && (
                    <Text style={[Theme.Caption, { color: "red" }]}>
                        {errors.description.message}
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
                            Save
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

export default SetDescription;
