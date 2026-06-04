"use client";

import dynamic from "next/dynamic";
import {
  EmailShareButton,
  EmailIcon,
  FacebookShareButton,
  FacebookIcon,
  XShareButton,
  XIcon,
  LinkedinShareButton,
  LinkedinIcon,
  RedditShareButton,
  RedditIcon,
  PinterestShareButton,
  PinterestIcon,
  WhatsappShareButton,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,
  ThreadsShareButton,
  ThreadsIcon,
  TumblrShareButton,
  TumblrIcon,
} from "react-share";

import styles from "./shareButtons.module.css";

interface ShareButtonsProps {
  url: string;
  title: string;
}

const Tooltip = dynamic(
  () => import("react-tooltip").then((mod) => mod.Tooltip),
  { ssr: false },
);

const ShareButtons = ({ url, title }: ShareButtonsProps) => {
  const shareButtons = [
    {
      id: "share-email",
      component: EmailShareButton,
      icon: EmailIcon,
      tooltip: "Share via Email",
      props: {
        subject: title,
        body: "Check out this photo from Mosaic.photography",
      },
    },
    {
      id: "share-facebook",
      component: FacebookShareButton,
      icon: FacebookIcon,
      tooltip: "Share on Facebook",
      props: {},
    },
    {
      id: "share-x",
      component: XShareButton,
      icon: XIcon,
      tooltip: "Share on X (Twitter)",
      props: {
        via: "mosaic_photography",
        hashtags: ["mosaicphotography", "photography", "mosaiccommunity"],
      },
    },
    {
      id: "share-pinterest",
      component: PinterestShareButton,
      icon: PinterestIcon,
      tooltip: "Pin on Pinterest",
      props: { media: "" },
    },
    {
      id: "share-linkedin",
      component: LinkedinShareButton,
      icon: LinkedinIcon,
      tooltip: "Share on LinkedIn",
      props: { source: "mosaic.photography" },
    },
    {
      id: "share-reddit",
      component: RedditShareButton,
      icon: RedditIcon,
      tooltip: "Share on Reddit",
      props: {},
    },
    {
      id: "share-whatsapp",
      component: WhatsappShareButton,
      icon: WhatsappIcon,
      tooltip: "Share on WhatsApp",
      props: {},
    },
    {
      id: "share-telegram",
      component: TelegramShareButton,
      icon: TelegramIcon,
      tooltip: "Share on Telegram",
      props: {},
    },
    {
      id: "share-threads",
      component: ThreadsShareButton,
      icon: ThreadsIcon,
      tooltip: "Share on Threads",
      props: {},
    },
    {
      id: "share-tumblr",
      component: TumblrShareButton,
      icon: TumblrIcon,
      tooltip: "Share on Tumblr",
      props: {
        caption: "Beautiful photography from Mosaic.photography",
        tags: ["mosaicphotography", "photography", "analog", "vintage"],
      },
    },
  ];

  return (
    <>
      <div className={styles.shareButtonsContainer}>
        {shareButtons.map(
          ({ id, component: Button, icon: Icon, tooltip, props }) => (
            <button
              key={id}
              id={id}
              onClick={() => window.open(url, "_blank")}
              title={title}
              {...props}
            >
              <Icon size={32} round />
            </button>
          ),
        )}
      </div>

      {/* Tooltips */}
      {shareButtons.map(({ id, tooltip }) => (
        <Tooltip
          key={`tooltip-${id}`}
          anchorSelect={`#${id}`}
          content={tooltip}
          className={styles.tooltip}
        />
      ))}
    </>
  );
};

export default ShareButtons;
