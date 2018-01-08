/**
 * Matches pattern with a single star against search.
 * Star must match at least one character to be considered a match.
 * @param patttern for example "foo*" 
 * @param search for example "fooawesomebar"
 * @returns the part of search that * matches, or undefined if no match.
 */
export function matchStar(pattern: string, search: string): string | undefined {
  if (search.length < pattern.length) {
    return undefined;
  }
  if (pattern === "*") {
    return search;
  }
  const star = pattern.indexOf("*");
  if (star === -1) {
    return undefined;
  }
  const part1 = pattern.substring(0, star);
  const part2 = pattern.substring(star + 1);
  if (search.substr(0, star) !== part1) {
    return undefined;
  }
  if (search.substr(search.length - part2.length) !== part2) {
    return undefined;
  }
  return search.substr(star, search.length - part2.length);
}
