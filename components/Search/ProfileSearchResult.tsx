import { View, Text } from "react-native";
import React from "react";
import { Image } from "react-native-elements";
import Colors from "@/constants/Colors";
import { Theme } from "@/constants/Styles";

interface SearchResultProps {
    profile: any;
}

const ProfileSearchResult = ({ profile }: SearchResultProps) => {
    return (
        <View
            style={{
                padding: 15,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
            }}
        >
            {profile.avatar ? (
                <Image
                    source={{ uri: profile.avatar }}
                    style={{ width: 30, height: 30, borderRadius: 99 }}
                />
            ) : (
                <View
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: 99,
                        backgroundColor: Colors.light,
                    }}
                />
            )}

            <View
                style={{
                    gap: 5,
                }}
            >
                <Text style={Theme.Caption}>{profile.name}</Text>
                <Text
                    style={[
                        Theme.Caption,
                        {
                            color: Colors.grey,
                        },
                    ]}
                >
                    @{profile.username}
                </Text>
            </View>
        </View>
    );
};

export default ProfileSearchResult;
