module.exports = {
    preset: 'react-native',
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest', // for TypeScript support
    },
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: [
        '@testing-library/jest-native/extend-expect'
    ]
};