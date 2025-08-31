import { useState } from "react";
import { StyleSheet, Dimensions, Text, TextInput, TouchableOpacity } from "react-native";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ProfileGate() {
    const [isHighlighted, setIsHighLighted] = useState<boolean>(false);
    const[newProfileName, setNewProfileName] = useState<string>('');

    return (
        <SafeAreaView
            style={styles.container}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Shared Timers</Text>
                            <Text style={styles.subtitle}>Welcome to Shared Timer</Text>
                        </View>
                    </View>

                    {/* Profile Gate card */}
                    <View style={styles.profileCard}>
                        <Text style={styles.profileCardTitle}>Choose Your Profile</Text>
                    </View>

                    {/* Profiles */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Your Profiles</Text>

                            <View style={styles.createRow}>
                                {/* Input field to create a new profile */}
                                <TextInput style={styles.input}
                                    placeholder="Enter new profile name"
                                    value={newProfileName}
                                    onChangeText={(newText) => setNewProfileName(newText)}
                                    placeholderTextColor={"rgba(45, 55, 72, 0.5)"}>
                                </TextInput>
                                
                                {/* Create new profile button */}
                                <TouchableOpacity style={styles.createButton}>
                                    <Text style={styles.createButtonText}>Create</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>

        </SafeAreaView>
    )
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#667eea', // Matching web gradient
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        maxWidth: 720,
        alignSelf: 'center',
        width: '100%',
        paddingHorizontal: 32,
        paddingVertical: 32,
    },
    loadingText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
    },

    // Header - Exact Web Match
    header: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 32,
        elevation: 8,
    },
    title: {
        fontSize: 30, // 1.875rem in web
        fontWeight: '700',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14, // 0.875rem in web
        marginTop: 4,
        fontWeight: '400',
    },

    // Profile Gate Card - Exact Web Match
    profileCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 32,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 40,
        elevation: 10,
        alignItems: 'center',
    },
    profileCardTitle: {
        fontSize: 40, // 2.5rem in web
        fontWeight: '700',
        color: '#2d3748',
        marginBottom: 8,
        textAlign: 'center',
    },

    // Main Card - Exact Web Match
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 40,
        elevation: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 12,
    },
    cardTitle: {
        fontSize: 20, // 1.25rem in web
        fontWeight: '600',
        color: '#2d3748',
    },
    createRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#2d3748',
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.2)',
        minWidth: 120,
        flex: 1,
    },
    createButton: {
        backgroundColor: '#48bb78',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    createButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },

    // Error Banner - Exact Web Match
    banner: {
        backgroundColor: '#fed7d7',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#fca5a5',
    },
    bannerText: {
        color: '#c53030',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },

    // Empty State - Exact Web Match
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        color: '#a0aec0',
        fontSize: 16,
        textAlign: 'center',
    },

    // Profiles Grid - Exact Web Match
    profilesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
        marginTop: 16,
    },
    profileItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 40,
        elevation: 10,
        width: width > 400 ? '48%' : '100%',
        minWidth: 200,
        minHeight: 200,
    },
    profileItemHighlighted: {
        borderColor: '#667eea',
        borderWidth: 3,
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        transform: [{ translateY: -4 }, { scale: 1.02 }],
        shadowColor: '#667eea',
        shadowOpacity: 0.3,
    },
    profileIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: 8,
        textAlign: 'center',
    },
    profileNameHighlighted: {
        color: '#667eea',
    },

    deleteButton: {
        backgroundColor: '#e53e3e',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },

    // Next Button - Simple and Clean
    nextButtonContainer: {
        borderRadius: 16,
        marginTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    nextButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 1,
    },

    // Admin Profile Styles
    adminProfileItem: {
        borderColor: '#e53e3e', // Red border for admin
        backgroundColor: 'rgba(229, 62, 62, 0.1)',
    },
    adminProfileName: {
        color: '#e53e3e',
        fontWeight: '700',
    },
    adminBadge: {
        backgroundColor: '#e53e3e',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    adminBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'center',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        margin: 32,
        maxWidth: 400,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2d3748',
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 16,
        color: '#4a5568',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 24,
    },
    modalSubMessage: {
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
        marginBottom: 24,
        fontStyle: 'italic',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: '#e2e8f0',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCancelText: {
        color: '#4a5568',
        fontSize: 16,
        fontWeight: '600',
    },
    modalDeleteButton: {
        flex: 1,
        backgroundColor: '#e53e3e',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalDeleteText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    });



