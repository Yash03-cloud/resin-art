import { motion } from 'framer-motion';
import { SparklesIcon, HeartIcon, StarIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { Link } from '@/lib/compat-router';

const milestones = [
  { year: '2018', title: 'The Beginning', desc: 'Started experimenting with resin art in a tiny studio apartment in wardha.' },
  { year: '2019', title: 'First Exhibition', desc: 'Showcased work at the wardha Art Fair. Sold 20 pieces and gained first 100 customers.' },
  { year: '2020', title: 'Online Store', desc: 'Launched the online store during the pandemic. Orders flooded in from across India.' },
  { year: '2021', title: 'Team Growth', desc: 'Expanded to a team of 5 passionate artisans. Moved to a proper studio space.' },
  { year: '2022', title: 'Custom Orders', desc: 'Launched the custom order service — now the most popular offering.' },
  { year: '2024', title: 'Today', desc: '350+ happy customers, 48 product lines, and countless custom masterpieces later!' },
];

const values = [
  { icon: <HeartIcon className="w-7 h-7" />, title: 'Crafted with Love', desc: 'Every piece is poured with intention, passion, and meticulous attention to detail.' },
  { icon: <StarIcon className="w-7 h-7" />, title: 'Premium Quality', desc: 'We use only the highest grade UV-resistant epoxy resin and professional pigments.' },
  { icon: <SparklesIcon className="w-7 h-7" />, title: 'Unique Creations', desc: 'No two pieces are exactly alike — your art is as unique as you are.' },
  { icon: <TrophyIcon className="w-7 h-7" />, title: 'Customer First', desc: 'Your satisfaction is our greatest achievement. We go above and beyond.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 pt-20">
      {/* Hero */}
      <section className="bg-gradient-hero py-14 sm:py-20 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img src="/charu.jpg" alt="Artvibe by Charu Studio" className="w-full h-full object-cover object-top blur-[1px]" />
        </div>
        <div className="container-max relative text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-block bg-white/95 preserve-white px-4 py-2 rounded-2xl shadow-xl mb-4 sm:mb-6">
              <img src="/logo.png" alt="Artvibe by Charu" className="h-14 sm:h-16 w-auto object-contain mx-auto" />
            </div>
            <h1 className="font-playfair text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6">Our Story</h1>
            <p className="text-purple-200 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
              A journey of passion, creativity, and the art of transforming liquid resin into timeless masterpieces.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Artist Story */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-200/50 dark:border-purple-900/50">
                <img
                  src="/charu.jpg"
                  alt="Artist Charu at work in Artvibe Studio"
                  className="w-full h-80 sm:h-[420px] lg:h-[520px] object-cover object-top hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-950/70 via-transparent to-transparent" />
              </div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 glass-dark rounded-2xl p-4 sm:p-5 shadow-xl border border-purple-400/40"
              >
                <div className="text-white flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-amber-300 shrink-0 shadow">
                    <img src="/charu.jpg" alt="Charu" className="w-full h-full object-cover object-top" />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-bold font-playfair text-amber-300">Charu ✨</div>
                    <div className="text-xs text-purple-200">Founder & Master Resin Artist</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="badge badge-primary mb-3 sm:mb-4">Meet the Artist</span>
              <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
                Hello, I'm Charu ✨
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed">
                I'm a self-taught resin artist based in wardha, India. My love affair with resin art began in 2018 when I stumbled upon an online tutorial and instantly fell in love with the mesmerizing fluid art form.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                What started as weekend hobby quickly became an obsession — then a business. I poured countless hours learning, experimenting, and perfecting my craft. Today, I run Artvibe by Charu with a small but mighty team of 5 artisans who share my passion.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
                Every piece we create is unique, just like the person it's made for. Whether it's a custom galaxy painting for a living room, botanical jewellery for a special occasion, or personalized coasters as a wedding gift — we put our hearts into every creation.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <Link to="/custom-order" className="btn-primary justify-center text-center">
                  Commission a Piece ✨
                </Link>
                <a
                  href="https://www.instagram.com/artvibe_by_charu?obrf=c3MwNmFrZzd3ZjY1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary justify-center text-center inline-flex items-center gap-2 hover:border-pink-500 hover:text-pink-600 dark:hover:text-pink-400"
                >
                  <svg className="w-5 h-5 fill-current text-pink-500" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Follow @artvibe_by_charu</span>
                </a>
                <Link to="/contact" className="btn-secondary justify-center text-center">
                  Say Hello 👋
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-gray-50 dark:bg-gray-800/60">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="badge badge-accent mb-4">What Drives Us</span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-7 text-center shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-purple-100 dark:hover:border-purple-800 transition-all card-hover"
              >
                <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center text-white mx-auto mb-5">
                  {value.icon}
                </div>
                <h3 className="font-playfair text-xl font-bold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-max max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="badge badge-primary mb-4">Our Journey</span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              The Resin Art Story
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-purple-100 dark:bg-purple-900/60 -translate-x-0.5" />
            <div className="space-y-10">
              {milestones.map((milestone, i) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'} pl-14 md:pl-0`}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-purple-100 dark:hover:border-purple-800 transition-all">
                      <span className="badge badge-primary mb-2">{milestone.year}</span>
                      <h3 className="font-playfair text-xl font-bold text-gray-900 dark:text-white mb-2">{milestone.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{milestone.desc}</p>
                    </div>
                  </div>

                  <div className="absolute left-6 md:static flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center text-white font-bold text-sm">
                      {milestone.year.slice(2)}
                    </div>
                  </div>

                  <div className="hidden md:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-gradient-primary text-center">
        <div className="container-max">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { value: '1,200+', label: 'Customers Served', emoji: '😊' },
              { value: '48+', label: 'Product Lines', emoji: '🎨' },
              { value: '500+', label: 'Custom Orders', emoji: '✨' },
              { value: '4.9★', label: 'Average Rating', emoji: '⭐' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl mb-2">{stat.emoji}</div>
                <div className="text-4xl font-bold text-white font-playfair">{stat.value}</div>
                <div className="text-purple-200 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-white dark:bg-gray-900 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container-max max-w-2xl"
        >
          <h2 className="font-playfair text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Own a Masterpiece?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
            Browse our collection or commission a custom piece that's uniquely yours.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/shop" className="btn-primary text-lg px-8 py-4">Shop Now ✨</Link>
            <Link to="/custom-order" className="btn-secondary text-lg px-8 py-4">Custom Order</Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
