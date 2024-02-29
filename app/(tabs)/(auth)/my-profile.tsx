import { View, Text, Button, SafeAreaView } from "react-native";
import React from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

const MyProfile = () => {
    const { logout } = useAuth();

    return (
        <SafeAreaView>
            <Text>MyProfile</Text>
            <Button title="signout" onPress={() => logout()}></Button>
        </SafeAreaView>
    );
};

export default MyProfile;
