import type { RootStackParamList } from "@/navigation/types";

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {
            "profile/favorites": undefined;
            "profile/tickets-list": undefined;
        }
    }
}
