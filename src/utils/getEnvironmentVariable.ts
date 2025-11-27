export function getEnvironmentVariable(
    variable: string,
    defaultValue: string = "UNDEFINED"
): string {
    const env = process.env[variable];
    if (!env) {
        console.error(
            `❌❌❌ FATAL ERROR:  ENVIRONMENT VARIABLE ${variable} NOT FOUND`
        );
        return defaultValue;
    }
    return env;
}
