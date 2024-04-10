import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";
import Head from "next/head";

import styles from "@/styles/User.module.css";

import Header from "@/components/header";
import Modal from "@/components/modal";
import UserDetails from "@/components/userDetails";
import UserSummary from "@/components/userSummary";
import { localStorageKeys } from "@/constants/localStorageKeys";
import UserIcon from "@/components/userIcon";

var prevScrollTop = 0;

const sortKeys = {
  Nome: (a, b) => {
    const A = a.display_name.toLowerCase();
    const B = b.display_name.toLowerCase();

    if (A > B) return 1;
    if (A < B) return -1;

    return 0;
  },
  Seguidores: (a, b) => {
    const A = a.followers.total;
    const B = b.followers.total;

    return B - A;
  },
};

export default function User() {
  const [user, setUser] = useState();
  const [following, setFollowing] = useState([]);

  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState();
  const [reversed, setReversed] = useState();

  const filteredFollowing = useMemo(
    () =>
      following.filter((user) =>
        user.display_name.toLowerCase().includes(filter.toLowerCase())
      ),
    [following, filter]
  );

  const sortedFollowing = useMemo(
    () =>
      [...filteredFollowing].sort((a, b) =>
        reversed ? sortKeys[sortKey](b, a) : sortKeys[sortKey](a, b)
      ),
    [filteredFollowing, sortKey, reversed]
  );

  const [theme, setTheme] = useState();
  const [showSummary, setShowSummary] = useState();
  const [headerHidden, setHeaderHidden] = useState();

  const [message, setMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (localStorageKeys.some((value) => localStorage[value] === undefined)) {
      const theme = localStorage.theme;
      localStorage.clear();
      localStorage.theme = theme;
      router.replace("/");
    } else {
      if (sortKeys[localStorage.sortFollowingKey]) {
        setSortKey(localStorage.sortFollowingKey);
      } else {
        setSortKey("Nome");
      }

      setReversed(JSON.parse(localStorage.reversedFollowing));

      setUser(JSON.parse(localStorage.user));

      const newFollowing = Object.values(JSON.parse(localStorage.following));

      setFollowing(newFollowing);
    }
  }, [router]);

  useEffect(() => {
    if (theme) localStorage.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (sortKey !== undefined) localStorage.sortFollowingKey = sortKey;
  }, [sortKey]);

  useEffect(() => {
    if (reversed !== undefined)
      localStorage.reversedFollowing = JSON.stringify(reversed);
  }, [reversed]);

  function clearMessage() {
    setMessage("");
  }

  function goHome() {
    router.replace("/home");
  }

  function reverse() {
    setReversed((prev) => !prev);
  }

  function share(e) {
    navigator.clipboard.writeText(location.origin + "/user/" + user.id);
    e.target.blur();
    setMessage("Adicionado a área de transferência");
  }

  return (
    <>
      <Head>
        <title>Página Inicial - Spotify Helper</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {message && <Modal {...{ theme, message, clearMessage }} />}
      <div
        className={[
          "container ",
          theme || "loading",
          message && "modalOpen",
        ].join(" ")}
      >
        <div className="before">
          <Header exit={goHome} {...{ theme, setTheme, headerHidden }} />
          {showSummary && (
            <UserSummary
              self
              {...{
                user,
                sortKey,
                sortKeys,
                reverse,
                reversed,
                setSortKey,
                filter,
                setFilter,
                share,
              }}
            />
          )}
        </div>
        <div
          className={styles.body}
          onScroll={(e) => {
            const details = e.target.firstChild;
            const detailsBottom = details.offsetHeight + details.offsetTop;
            setShowSummary(e.target.scrollTop > detailsBottom);

            const deltaScrollTop = e.target.scrollTop - prevScrollTop;
            if (Math.abs(deltaScrollTop) > 10) {
              setHeaderHidden(deltaScrollTop > 0);
              prevScrollTop = e.target.scrollTop;
            }
          }}
        >
          <UserDetails
            self
            {...{
              user,
              sortKey,
              sortKeys,
              reverse,
              reversed,
              setSortKey,
              filter,
              setFilter,
              share,
              following,
            }}
          />
          <div className={styles.playlists}>
            {sortedFollowing.map((value) => (
              <UserIcon user={value} key={value.id} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
