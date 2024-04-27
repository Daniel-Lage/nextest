export default function logout(router) {
  const theme = localStorage.theme;
  localStorage.clear();
  localStorage.theme = theme;
  router.replace("/");
}
