import { useState } from "react";
import {
    View,
    Text,
    KeyboardAvoidingView,
    useWindowDimensions,
} from "react-native";
import { Theme } from "@/constants/Styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Redirect, router } from "expo-router";

type FormInputs = {
    email: string;
    password: string;
    firstname?: string;
};

const Login = () => {
    const [error, setError] = useState<string | null>(null);
    const dimensions = useWindowDimensions();
    const { session, appleLogin } = useAuth();

    if (session) {
        return <Redirect href={"/"} />;
    }

    return (
        <KeyboardAvoidingView
            style={{
                flex: 1,
                alignItems: "flex-start",
            }}
            behavior={"position"}
            keyboardVerticalOffset={-150}
        >
            <SafeAreaView
                edges={["top", "left", "right"]}
                style={{
                    width: dimensions.width,
                    minHeight: dimensions.height,
                    backgroundColor: "#FFF",
                }}
            >
                <StatusBar style="dark" />
                <View
                    style={[
                        Theme.Container,
                        {
                            gap: 10,
                            backgroundColor: "#FFF",
                            justifyContent: "center",
                            height: "100%",
                        },
                    ]}
                >
                    <Text
                        style={[
                            Theme.Logo,
                            {
                                textAlign: "center",
                                marginBottom: 15,
                            },
                        ]}
                    >
                        pocket garage
                    </Text>

                    <AppleAuthentication.AppleAuthenticationButton
                        buttonType={
                            AppleAuthentication.AppleAuthenticationButtonType
                                .SIGN_IN
                        }
                        buttonStyle={
                            AppleAuthentication.AppleAuthenticationButtonStyle
                                .BLACK
                        }
                        cornerRadius={5}
                        style={{ width: "100%", height: 50 }}
                        onPress={async () => {
                            appleLogin();
                        }}
                    />
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default Login;
