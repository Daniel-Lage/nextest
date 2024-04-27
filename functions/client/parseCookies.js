export default function parseCookies(cookies) {
  return Object.fromEntries(
    cookies.split("; ").map((cookie) => cookie.split("="))
  );
}
