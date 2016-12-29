import * as path from "path";

export function baseUrlResolver(tsConfig:string, tsConfigBaseUrl:string) {
    const absoluteBaseUrl = path.dirname(path.join(tsConfig, tsConfigBaseUrl));
    return absoluteBaseUrl;
}
