import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from 'next/image'; // Import Next.js Image component
import { User, useOrbis, Discussion } from "@orbisclub/components";
import { getIpfsLink } from "../utils";
import { CommentsIcon } from "./Icons";
import ReactTimeAgo from "react-time-ago";
import Upvote from "./Upvote";
import UrlMetadata from "./UrlMetadata";
import { marked } from "marked";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import DonateModal from "./DonateModal";
import { FaShare, FaTag } from "react-icons/fa";

export default function PostItem({ post, isLastPost }) {
  const { orbis, user } = useOrbis();
  const [hasLiked, setHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [updatedPost, setUpdatedPost] = useState(post);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function loadCategories() {
      const { data } = await orbis.api
        .from("orbis_contexts")
        .select()
        .eq("context", global.orbis_context)
        .order("created_at", { ascending: false });
      if (data) {
        setCategories(data);
      }
    }
    if (orbis.api) {
      loadCategories();
    }
  }, [orbis.api]);

  useEffect(() => {
    if (user) {
      async function checkIfHasLiked() {
        const { data } = await orbis.getReaction(post.stream_id, user.did);
        if (data?.type === "like") {
          setHasLiked(true);
        }
      }
      checkIfHasLiked();
    }
  }, [user, orbis, post.stream_id]);

  const like = async () => {
    if (user) {
      setHasLiked(true);
      setUpdatedPost((prev) => ({
        ...prev,
        count_likes: prev.count_likes + 1,
      }));
      await orbis.react(post.stream_id, "like");
    } else {
      alert("You must be connected to upvote posts.");
    }
  };

  const sharePost = async () => {
    setSharing(true);
    try {
      await navigator.share({
        title: post.content?.title,
        text: post.content?.body?.substring(0, 100) + "...",
        url: window.location.origin + "/post/" + post.stream_id,
      });
    } catch (err) {
      console.error("Share failed:", err);
      navigator.clipboard.writeText(window.location.origin + "/post/" + post.stream_id);
      alert("Link copied to clipboard!");
    }
    setSharing(false);
  };

  const handleDonate = () => {
    setIsDonateModalOpen(true);
  };

  // Sanitize and parse content
  const sanitizedContent = post.content?.body ? DOMPurify.sanitize(marked(post.content.body)) : '';
  const parsedContent = parse(sanitizedContent);

  return (
    <div className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 ${!isLastPost ? "mb-4" : ""}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <User details={post.creator_details} />
            <span className="text-gray-500 text-sm">
              <ReactTimeAgo date={post.timestamp * 1000} locale="en-US" />
            </span>
            <div>
              <button className="px-2 py-1 text-sm text-gray-500 bg-blue-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-400 flex items-center space-x-1">
                <FaTag className="text-xs" />
                <span>
                  {post.content.context === global.orbis_context
                    ? "General"
                    : categories?.find(
                        (cat) => cat.stream_id === post.content.context
                      )?.content?.displayName || "General"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <Link href={`/post/${post.stream_id}`} className="block">
          {post.content?.title && (
            <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-[var(--brand-color)]">
              {post.content.title}
            </h2>
          )}

          <div className="text-gray-600 line-clamp-3 mb-3">
            <div>{parsedContent}</div>
          </div>

          {post.content?.media && post.content.media[0] && (
            <div className="relative w-full h-48 mb-3">
              <Image
                src={getIpfsLink(post.content.media[0])}
                alt={post.content.title || "Post image"}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
          )}
        </Link>

        {post.indexing_metadata?.urlMetadata?.title && (
          <UrlMetadata metadata={post.indexing_metadata.urlMetadata} />
        )}
      </div>

      <div className="border-t border-gray-100">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-6">
            <Upvote like={like} active={hasLiked} count={updatedPost.count_likes} />

            <div className="flex items-center group">
              <button className="group flex items-center space-x-2 text-gray-500 hover:text-yellow-500">
                <span className="text-sm font-medium">
                  {post.points || 0} Points
                </span>
              </button>
            </div>

            <div className="flex items-center group">
              <button
                onClick={() => setShowComments(!showComments)}
                className="group flex items-center space-x-2 text-gray-500 hover:text-blue-500"
              >
                <CommentsIcon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {updatedPost.count_replies || 0}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleDonate}
              className="flex items-center px-4 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-full hover:bg-green-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
              Donate
            </button>

            <button
              onClick={sharePost}
              disabled={sharing}
              className="p-2 text-gray-500 bg-gray-50 rounded-full hover:bg-gray-80 flex justify-center items-center"
              title="Share"
            >
              <FaShare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-gray-100 p-4">
          <Discussion context={post.content.context} master={post.stream_id} />
        </div>
      )}

      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        post={post}
      />
    </div>
  );
}