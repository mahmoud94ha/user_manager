import Head from 'next/head';
import 'bulma/css/bulma.min.css';
import { faker } from '@faker-js/faker';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useEffect, useState } from 'react';
import styles from '../src/Styles/forum.module.css';
import useClientIP from '@lib/useClientIP';
import { makeApiCall } from "@lib/visitor";
import { useSession, signOut } from "next-auth/react";

const generateRandomPosts = (num) => {
  return Array.from({ length: num }, (_, index) => ({
    id: index,
    title: faker.lorem.sentence(),
    username: faker.internet.userName(),
    avatar: faker.image.avatar(),
    comments: faker.datatype.number({ min: 0, max: 100 }),
    timeAgo: faker.date.recent().toISOString(),
  }));
};

export const getServerSideProps = async () => {
  const posts = generateRandomPosts(35);
  return {
    props: {
      posts,
    },
  };
};

export default function Home({ posts }) {
  const { data: session } = useSession();
  const [loggedin, setLoggedin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const clientIP = useClientIP();

  useEffect(() => {
    if (session?.user) {
      setLoggedin(true);
    }
    if (session?.user.role === "admin") {
      setIsAdmin(true);
    }
  }, [session]);

  useEffect(() => {
    if (clientIP) {
      makeApiCall(clientIP, "home-page");
    }
  }, [clientIP]);
  useEffect(() => {
    const burger = document.querySelector('.burger');
    const menu = document.querySelector('#' + burger.dataset.target);
    burger.addEventListener('click', () => {
      burger.classList.toggle('is-active');
      menu.classList.toggle('is-active');
    });
  }, []);

  return (
    <>
      <Head>
        <title>Home - Example</title>
        <link rel="icon" href="/user-management.png" type="image/x-icon" />
        <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700" rel="stylesheet" />
      </Head>
      <div className='body_form'>
        <nav className={`navbar is-white ${styles.topNav}`}>
          <div className={`container ${styles.topNavContainer}`}>
            <div className="navbar-brand">
              <a className="navbar-item" href="#">
                <img src="/user-management.png" alt="forum" style={{ width: "45px", height: "45px", maxHeight: "45px !important" }} />
              </a>
              <div className="navbar-burger burger" data-target="topNav">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div id="topNav" className="navbar-menu">
              <div className="navbar-start">
                <a className={`navbar-item ${styles.navbarMenuItem}`} href="#">Home</a>
                <a className={`navbar-item ${styles.navbarMenuItem}`} href="#">Landing</a>
                <a className={`navbar-item ${styles.navbarMenuItem}`} href="#">Blog</a>
                <a className={`navbar-item ${styles.navbarMenuItem}`} href="#">Album</a>
                <a className={`navbar-item ${styles.navbarMenuItem}`} href="#">Search</a>
                <a className={`navbar-item ${styles.navbarMenuItem}`} href="#">Tabs</a>
              </div>
              <div className="navbar-end">
                <div className="navbar-item">
                  <div className="field is-grouped">
                    {!loggedin ? (
                      <>
                        <p className="control">
                          <a className="button is-small" onClick={() => location.href = "/register"}>
                            <span className="icon">
                              <i className="fa fa-user-plus"></i>
                            </span>
                            <span>Register</span>
                          </a>
                        </p>
                        <p className="control">
                          <a className="button is-small is-info is-outlined" onClick={() => location.href = "/login"}>
                            <span className="icon">
                              <i className="fa fa-user"></i>
                            </span>
                            <span>Login</span>
                          </a>
                        </p>
                      </>
                    ) : (
                      <>
                        {isAdmin && (
                          <p className="control">
                            <a className="button is-small is-info" onClick={() => location.href = "/admin/dashboard"}>
                              <span className="icon">
                                <i className="fa fa-dashboard"></i>
                              </span>
                              <span>Dashboard</span>
                            </a>
                          </p>
                        )}
                        <p className="control">
                          <a className="button is-small" onClick={() => signOut({ callbackUrl: "/" })}>
                            <span className="icon">
                              <i className="fa fa-sign-out"></i>
                            </span>
                            <span>Logout</span>
                          </a>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <nav className="navbar is-white">
          <div className="container">
            <div className="navbar-menu">
              <div className="navbar-start">
                <a className={`navbar-item is-active ${styles.navbarMenuItem}`} href="#">Popular</a>
                <a className={`navbar-item ${styles.navbarMenuItem}`} href="#">Recent</a>
                <a className={`navbar-item ${styles.navbarMenuItem}`} href="#">Documentation</a>
              </div>
              <div className="navbar-end">
                <div className="navbar-item">
                  <input className="input" type="search" placeholder="Search forum..." />
                </div>
              </div>
            </div>
          </div>
        </nav>

        <section className="container">
          <div className={`columns ${styles.mainContainer}`}>
            <div className="column is-3">
              <a className={`button is-primary is-block is-alt is-large ${styles.buttonPrimaryAlt}`} href="#">New Post</a>
              <aside className={`menu ${styles.menu}`}>
                <p className={`menu-label ${styles.menuLabel}`}>Tags</p>
                <ul className={`menu-list ${styles.menuList}`}>
                  <li><span className="tag is-primary is-medium">Dashboard</span></li>
                  <li><span className="tag is-link is-medium">Customers</span></li>
                  <li><span className="tag is-light is-danger is-medium">Authentication</span></li>
                  <li><span className="tag is-dark is-medium">Payments</span></li>
                  <li><span className="tag is-success is-medium">Transfers</span></li>
                  <li><span className="tag is-warning is-medium">Balance</span></li>
                  <li><span className="tag is-medium">Question</span></li>
                </ul>
              </aside>
            </div>
            <div className="column is-9">
              <div className="box content" style={{ backgroundColor: "white !important" }}>
                {posts.map((post) => (
                  <article className={`post ${styles.post}`} key={post.id}>
                    <h4 style={{ color: "black !important" }}>{post.title}</h4>
                    <div className="media">
                      <div className={`media-left ${styles.mediaLeft}`}>
                        <p className="image is-32x32">
                          <img src={post.avatar} alt="Avatar" style={{ width: "32px", height: "32px" }} />
                        </p>
                      </div>
                      <div className={`media-content ${styles.mediaContent}`}>
                        <div className="content">
                          <p>
                            <a href="#">@{post.username}</a> replied recently &nbsp;
                            <span className="tag">Question</span>
                          </p>
                        </div>
                      </div>
                      <div className="media-right">
                        <span className="has-text-grey-light"><i className="fa fa-comments"></i> {post.comments}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="container">
            <div className="content has-text-centered">
              <div className="columns is-mobile is-centered">
                <div className="field is-grouped is-grouped-multiline">
                  <div className="control">
                    <div className="tags has-addons">
                      <a className="tag is-link" href="https://github.com/mahmoud94ha/user_manager">User Manager</a>
                      <span className="tag is-light">Mahmoud Hannani</span>
                    </div>
                  </div>
                  <div className="control">
                    <div className="tags has-addons">
                      <a className="tag is-link" href="/support">Support</a>
                      <span className="tag is-light">Support page</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
