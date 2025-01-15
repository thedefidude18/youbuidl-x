import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import LeftSidebar from '../components/LeftSidebar';
import PostItem from '../components/PostItem';
import Footer from '../components/Footer';
import { LoadingCircle } from "../components/Icons";
import { Orbis, useOrbis, User } from "@orbisclub/components";
import { GlobalContext } from "../contexts/GlobalContext";
import Editor from "../components/Editor";

function Home({ defaultPosts }) {
  const { orbis, user, setConnectModalVis } = useOrbis();
  const [nav, setNav] = useState("all");
  const [page, setPage] = useState(0);
  const [posts, setPosts] = useState(defaultPosts);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (global.orbis_context) {
      loadContexts();
    }

    async function loadContexts() {
      let { data, error } = await orbis.api.from("orbis_contexts").select().eq('context', global.orbis_context).order('created_at', { ascending: false });
      if(data) {
        setCategories(data);
      }
    }
  }, []);

  useEffect(() => {
    setPage(0);
    if (global.orbis_context) {
      if (nav == "all") {
        loadPosts(global.orbis_context, true, 0);
      } else {
        loadPosts(nav, true, 0);
      }
    }
  }, [nav]);

  useEffect(() => {
    if (global.orbis_context) {
      if (nav == "all") {
        loadPosts(global.orbis_context, true, page);
      } else {
        loadPosts(nav, true, page);
      }
    }
  }, [page]);

  async function loadPosts(context, include_child_contexts, _page) {
    setLoading(true);
    let { data, error } = await orbis.api.rpc("get_ranked_posts", { q_context: context }).range(_page * 25, (_page + 1) * 50 - 1);
    if (data) {
      setPosts(data);
    }
    setLoading(false);
  }

  return (
    <>
      <Head>
        <title key="title">YouBuidl | Connect, fund and explore Public Goods.</title>
        <meta property="og:title" content="Welcome to youbuidl - A web3 builder community for Public Goods!" key="og_title" />
        <meta name="description" content="Welcome to youbuidl" key="description"></meta>
        <meta property="og:description" content="A web3 builder community for Public Goods!" key="og_description" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        <Header />
      </div>

      <div className="flex min-h-screen bg-white pt-16"> {/* Add padding-top to account for fixed header */}
        {/* Left Sidebar - Fixed on desktop, hidden on mobile */}
        <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <LeftSidebar />
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 w-full md:ml-64 md:mr-80">
          <div className="max-w-3xl mx-auto px-4 py-6">
           
            <section>
              {global.orbis_context ? (
                <>
                   {/* Show post editor or connect button */}
                    <div className="md:grow pt-0 pb-12 pr-10">
                      {user ?
                        <Editor />
                      :
                        <div className="w-full text-center bg-slate-50 rounded border border-primary bg-secondary p-6">
                          <p className="text-base text-secondary mb-2">You must be connected to share any post.</p>
                          <button className="btn-sm py-1.5 btn-main" onClick={() => setConnectModalVis(true)}>Connect</button>
                        </div>
                      }
                    </div>

                  {/* Scrollable Feed Content */}
                  <div className="relative">
                    {loading ? (
                      <div className="flex justify-center p-6">
                        <LoadingCircle />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {posts?.map((post) => (
                          <PostItem key={post.stream_id} post={post} />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <p>No content available</p>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Right Sidebar - Fixed on desktop, hidden on mobile */}
        <div className="hidden md:block fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-gray-100 overflow-y-auto">
          <Sidebar />
        </div>
      </div>
    </>
  );
}

export default Home;