import { Stack } from "expo-router";
import "@/app/global.css";
import { GlobalProvider } from "@/lib/global-provider";
export default function RootLayout() {
  return (
    <GlobalProvider>
      <Stack />
    </GlobalProvider>
  );
}
