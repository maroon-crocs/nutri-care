import React from 'react';
import { Instagram, ArrowUpRight } from 'lucide-react';

const INSTAGRAM_PROFILE = 'https://www.instagram.com/dietitian__iram/';

const reelHighlights = [
  {
    title: 'Featured Nutrition Reel',
    quote: 'Simple food habits can create steady progress.',
    description:
      'A newly featured reel placed first so visitors immediately see the latest nutrition content.',
    accent: 'from-rose-200 via-pink-200 to-orange-100',
    href: 'https://www.instagram.com/reel/DXn9RMazkA8/',
    label: 'Instagram Reel',
  },
  {
    title: 'Practical Diet Reel',
    quote: 'Balanced choices work best when they fit daily life.',
    description:
      'A second featured reel that highlights practical nutrition guidance from Instagram.',
    accent: 'from-fuchsia-200 via-purple-200 to-indigo-100',
    href: 'https://www.instagram.com/reel/DXgVGtXTuV7/',
    label: 'Instagram Reel',
  },
  {
    title: 'Healthy Eating Guidance',
    quote: 'Healthy habits compound into lasting results.',
    description:
      'A direct Instagram post from your profile that visitors can open to view, engage with, and share.',
    accent: 'from-amber-100 via-orange-200 to-rose-200',
    href: 'https://www.instagram.com/p/DTwxhsPCZZ6/',
    label: 'Instagram Post',
  },
  {
    title: 'Nutrition Education Post',
    quote: 'Better choices start with better understanding.',
    description:
      'A featured post that strengthens your social proof and sends users straight to your Instagram content.',
    accent: 'from-fuchsia-200 via-purple-200 to-indigo-100',
    href: 'https://www.instagram.com/p/DUKepObiWje/',
    label: 'Instagram Post',
  },
  {
    title: 'Instagram Reel Feature',
    quote: 'Consistency beats intensity in health.',
    description:
      'A reel spotlight for fast education, high engagement, and better visibility for your nutrition advice.',
    accent: 'from-amber-100 via-orange-200 to-rose-200',
    href: 'https://www.instagram.com/reel/DU4yDJDCU8k/',
    label: 'Instagram Reel',
  },
  {
    title: 'Reel On Practical Wellness',
    quote: 'Small daily actions build a stronger body.',
    description:
      'Another direct reel link visitors can open instantly from the website to explore your content.',
    accent: 'from-lime-100 via-green-200 to-emerald-200',
    href: 'https://www.instagram.com/reel/DUchrmqiUe0/',
    label: 'Instagram Reel',
  },
  {
    title: 'Latest Reel Spotlight',
    quote: 'Nourish your body and your mind follows.',
    description:
      'A featured reel card that keeps your most visible Instagram content one tap away from site visitors.',
    accent: 'from-violet-200 via-purple-200 to-pink-200',
    href: 'https://www.instagram.com/reel/DUXX0WBCeyD/',
    label: 'Instagram Reel',
  },
];

const getInstagramEmbedUrl = (href: string) => {
  const normalizedHref = href.endsWith('/') ? href : `${href}/`;
  return `${normalizedHref}embed/captioned/`;
};

const SocialPresence: React.FC = () => {
  return (
    <section id="social" className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-pink-600 shadow-sm">
              <Instagram size={14} />
              Social Presence
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">
              Watch Nutrition Reels From Dietitian Iram
            </h2>
            <p className="text-lg leading-relaxed text-slate-600">
              Follow the Instagram page for daily nutrition education, practical meal ideas, and short reels that turn complex advice into simple action.
            </p>
          </div>

          <a
            href={INSTAGRAM_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <Instagram size={18} />
            View Instagram Profile
            <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="mb-10 rounded-[2rem] bg-slate-900 p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-pink-300">
                Instagram Handle
              </p>
              <a
                href={INSTAGRAM_PROFILE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl font-bold text-white hover:text-pink-300 transition-colors"
              >
                @dietitian__iram
              </a>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Best place to engage</p>
              <p className="mt-2 text-3xl font-black text-white">Instagram Reels</p>
              <p className="mt-2 text-sm text-slate-300">Tap through to watch, follow, and message directly.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reelHighlights.map((item) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`mb-4 rounded-[1.5rem] bg-gradient-to-br ${item.accent} p-5 text-slate-900`}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700/80">{item.label}</p>
                <p className="mt-3 text-xl font-black leading-snug text-slate-900">"{item.quote}"</p>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                <iframe
                  title={item.title}
                  src={getInstagramEmbedUrl(item.href)}
                  className="h-[720px] w-full"
                  loading="lazy"
                  allowTransparency={true}
                  allowFullScreen
                />
              </div>

              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-pink-600 transition-colors hover:text-pink-700"
              >
                Open on Instagram
                <ArrowUpRight size={16} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialPresence;
