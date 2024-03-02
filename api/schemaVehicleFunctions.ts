import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

const { session } = useAuth();

const fetchUserVehicle = async () => {
    const { data, error } = await supabase
        .from("user_vehicles")
        .select()
        .eq("user_id", session?.user?.id);

    return data;
};

// export default fetchUserVehicle;
