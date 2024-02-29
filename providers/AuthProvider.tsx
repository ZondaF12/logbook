import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { usePathname, useRouter } from "expo-router";
import {
    PropsWithChildren,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { set } from "react-hook-form";

type AuthData = {
    session: Session | null;
    loading: boolean;
    logout: () => Promise<void>;
    appleLogin: () => Promise<void>;
};

const AuthContext = createContext<AuthData>({
    session: null,
    loading: true,
    logout: async () => {},
    appleLogin: async () => {},
});

export default function AuthProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();

    const fetchSession = async () => {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setLoading(false);
    };

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setLoading(false);
            }
        );

        fetchSession();

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

    const appleLogin = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });
            // Sign in via Supabase Auth.
            if (credential.identityToken) {
                console.log(credential);

                const {
                    error,
                    data: { user },
                } = await supabase.auth.signInWithIdToken({
                    provider: "apple",
                    token: credential.identityToken,
                });
                console.log(JSON.stringify({ error, user }, null, 2));

                if (!error) {
                }
            } else {
                throw new Error("No identityToken.");
            }
        } catch (e: any) {
            if (e.code === "ERR_REQUEST_CANCELED") {
                console.log(e);
                // handle that the user canceled the sign-in flow
            } else {
                console.log(e);
                // handle other errors
            }
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const isNewUserFunc = async () => {
        const { data, error } = await supabase
            .from("users")
            .select()
            .eq("user_id", session?.user?.id);

        if (error) {
            console.log(error);
        }

        if (data?.length === 0) {
            return true;
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase
                .from("users")
                .select()
                .eq("user_id", session?.user?.id);

            if (!error) {
                setUser(data[0]);
            }
        };

        fetchUser();
    }, [session]);

    useEffect(() => {
        const routingCheck = async () => {
            if (session) {
                if (user.username === null || user.username === "") {
                    if (pathname !== "/onboarding-username") {
                        router.push("/onboarding-username");
                    }
                } else if (user.name === null || user.name === "") {
                    console.log("USER");

                    if (pathname !== "/onboarding-firstname") {
                        router.push("/onboarding-firstname");
                    }
                } else {
                    if (pathname !== "/") {
                        router.push("/");
                    }
                }
            } else {
                if (pathname !== "/login") {
                    router.replace("/login");
                }
            }
        };
        routingCheck();
    }, [user]);

    return (
        <AuthContext.Provider value={{ session, loading, logout, appleLogin }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
