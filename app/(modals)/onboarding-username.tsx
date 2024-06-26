import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    useWindowDimensions,
} from "react-native";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useRouter } from "expo-router";
import { Theme } from "@/constants/Styles";
import Colors from "@/constants/Colors";
import Animated, { FadeInLeft } from "react-native-reanimated";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

type FormInputs = {
    username: string;
};

const OnboardingUsername = () => {
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
            username: "",
        },
    });

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const { count, error } = await supabase
                .from("users")
                .select("*", { count: "exact", head: true })
                .eq("username", data.username);

            if (count === 0) {
                const { error } = await supabase
                    .from("users")
                    .insert({ username: data.username });

                if (!error) {
                    setIsSubmitting(false);
                    router.push("/onboarding-firstname");
                }
            }

            // router.push("/onboarding/profile");
        } catch (err: any) {
            setError(err.response.data.message);

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
                        marginBottom: 15,
                        flexDirection: "row",
                    }}
                >
                    <Animated.Text
                        entering={FadeInLeft.springify().delay(200)}
                        style={Theme.BodyText}
                    >
                        Step 1 of 2
                    </Animated.Text>
                </View>
                <View
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 15,
                        marginBottom: 15,
                    }}
                >
                    <Text style={Theme.BigTitle}>Choose your username</Text>
                </View>

                <Controller
                    control={control}
                    rules={{
                        required: "Username is required",
                        pattern: {
                            value: /^[A-Za-z0-9._%+-]{3,15}$/i,
                            message:
                                "Invalid username. It should only include letters, numbers, full stops, hyphens, and underscores.",
                        },
                        minLength: {
                            value: 3,
                            message:
                                "Username must be at least 3 characters long",
                        },
                        maxLength: {
                            value: 15,
                            message:
                                "Username must be at most 15 characters long",
                        },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            autoComplete="off"
                            autoCorrect={false}
                            spellCheck={false}
                            placeholder={"username"}
                            placeholderTextColor={Colors.grey}
                            autoCapitalize={"none"}
                            style={[
                                Theme.InputStyle,
                                errors.username
                                    ? { borderColor: "red", borderWidth: 1 }
                                    : null,
                            ]}
                            onBlur={onBlur}
                            onChangeText={(text) =>
                                onChange(text.replace(/\s/g, "").toLowerCase())
                            }
                            value={value}
                        />
                    )}
                    name="username"
                />
                {errors.username && (
                    <Text style={[Theme.Caption, { color: "red" }]}>
                        {errors.username.message}
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
                            {"Check availability"}
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

export default OnboardingUsername;
