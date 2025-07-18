export function logger(message: string, ...optionalParams: any[]) {
    if (process.env.NODE_ENV === "development") {
        console.log(message, ...optionalParams);
    }
}