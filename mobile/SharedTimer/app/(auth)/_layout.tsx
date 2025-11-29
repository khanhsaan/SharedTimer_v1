import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false}}>
            <Stack.Screen name="AuthScreen"></Stack.Screen>
            <Stack.Screen name="ProfileGate"></Stack.Screen>
        </Stack>
    )
}