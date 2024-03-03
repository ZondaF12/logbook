import {
    View,
    Text,
    useWindowDimensions,
    KeyboardAvoidingView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { Controller, SubmitHandler, set, useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { Theme } from "@/constants/Styles";
import Colors from "@/constants/Colors";
import { CheckBox } from "react-native-elements";

type FormInputs = {
    firstname: string;
    bio: string;
    public: string;
};

const EditProfile = () => {
    const {
        id,
        firstname: currentName,
        bio: currentBio,
        public: currentIsPublic,
    } = useLocalSearchParams<{
        id: string;
        firstname: string;
        bio: string;
        public: string;
    }>();

    const [isPublic, setIsPublic] = useState(currentIsPublic === "true");

    const toggleIsPublic = () => setIsPublic(!isPublic);

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
            firstname: currentName || "",
            bio: currentBio || "",
            public: currentIsPublic || "false",
        },
    });

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const { error } = await supabase
                .from("users")
                .update({
                    bio: data.bio,
                    name: data.firstname,
                    public: isPublic,
                })
                .eq("id", id);

            if (!error) {
                setIsSubmitting(false);
                router.back();
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
                        gap: 10,
                        backgroundColor: "#FFF",
                        width: dimensions.width,
                        paddingHorizontal: 15,
                        paddingTop: 30,
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
                    <Text style={Theme.BigTitle}>Edit User</Text>
                </View>

                <View style={{ gap: 10, marginTop: 5 }}>
                    <Text style={Theme.Title}>Name</Text>
                </View>
                <Controller
                    control={control}
                    rules={{
                        required: "First name is required",
                        pattern: {
                            value: /^[a-z ,.'-]+$/i,
                            message:
                                "Invalid first name. It should only include letters.",
                        },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            autoComplete="off"
                            autoCorrect={false}
                            spellCheck={false}
                            placeholder={"eg. Thomas"}
                            placeholderTextColor={Colors.grey}
                            style={[
                                Theme.InputStyle,
                                {
                                    backgroundColor: "#FFF",
                                    borderWidth: 1,
                                },
                                errors.firstname
                                    ? { borderColor: "red", borderWidth: 1 }
                                    : { borderColor: Colors.grey },
                            ]}
                            onBlur={onBlur}
                            onChangeText={(text) =>
                                onChange(text.replace(/\s/g, ""))
                            }
                            value={value}
                        />
                    )}
                    name="firstname"
                />
                {errors.firstname && (
                    <Text style={[Theme.Caption, { color: "red" }]}>
                        {errors.firstname.message}
                    </Text>
                )}

                <View style={{ gap: 10, marginTop: 5 }}>
                    <Text style={Theme.Title}>Bio</Text>
                    <Text style={Theme.Caption}>
                        Tell us a little bit about your vehicle
                    </Text>
                </View>
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            placeholder={"Bio"}
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
                                errors.bio
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
                                clearErrors("bio");
                            }}
                            value={value}
                        />
                    )}
                    name="bio"
                />
                {errors.bio && (
                    <Text style={[Theme.Caption, { color: "red" }]}>
                        {errors.bio.message}
                    </Text>
                )}

                <View style={{ gap: 10, marginTop: 5 }}>
                    <Text style={Theme.Title}>Public</Text>
                    <Text style={Theme.Caption}>
                        Set the visibility of your profile
                    </Text>
                </View>
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: 10,
                                alignItems: "center",
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => setIsPublic(true)}
                                style={{
                                    backgroundColor: isPublic
                                        ? Colors.dark
                                        : Colors.light,
                                    borderWidth: isPublic ? 0 : 1,
                                    borderColor: Colors.grey,
                                    padding: 10,
                                    borderRadius: 99,
                                }}
                            >
                                <Text
                                    style={[
                                        Theme.Caption,
                                        {
                                            color: isPublic
                                                ? Colors.light
                                                : Colors.grey,
                                        },
                                    ]}
                                >
                                    Public
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsPublic(false);
                                }}
                                style={{
                                    backgroundColor: !isPublic
                                        ? Colors.dark
                                        : Colors.light,
                                    borderWidth: !isPublic ? 0 : 1,
                                    borderColor: Colors.grey,
                                    padding: 10,
                                    borderRadius: 99,
                                }}
                            >
                                <Text
                                    style={[
                                        Theme.Caption,
                                        {
                                            color: !isPublic
                                                ? Colors.light
                                                : Colors.grey,
                                        },
                                    ]}
                                >
                                    Private
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    name="public"
                />
                {errors.public && (
                    <Text style={[Theme.Caption, { color: "red" }]}>
                        {errors.public.message}
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

export default EditProfile;
